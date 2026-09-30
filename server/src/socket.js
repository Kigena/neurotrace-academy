import { Server } from 'socket.io';
import Message from './models/Message.js';
import ChatRoom from './models/ChatRoom.js';
import geminiService from './services/gemini.js';
import notificationService from './services/notificationService.js';
import { resolveUserFromToken } from './middleware/auth.js';
import { getAllowedOrigins } from './config/env.js';
import {
    canAccessMessage,
    cleanAttachments,
    cleanContent,
    isRoomMember,
} from './services/chatAccess.js';
import { isObjectIdLike } from './utils/validation.js';

// Socket.io server.
//
// Every connection must present a valid JWT in `handshake.auth.token`.
// The connected user's identity (socket.data.user) is established by the
// server; sender IDs/names sent by the client are ignored, and a socket can
// only join its own `user:<id>` room and rooms it is a member of.

// Store online users: Map<userId, { socketId, name, lastSeen }>
const onlineUsers = new Map();

// Store typing status: Map<roomId, Set<userId>>
const typingUsers = new Map();

let io = null;

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initializeSocket first.');
    }
    return io;
};

const onlineList = () => Array.from(onlineUsers.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    lastSeen: data.lastSeen
}));

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        const user = await resolveUserFromToken(token);
        if (!user) return next(new Error('unauthorized'));
        socket.data.user = user;
        next();
    } catch {
        next(new Error('unauthorized'));
    }
};

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: getAllowedOrigins(),
            methods: ['GET', 'POST'],
            credentials: true
        },
        maxHttpBufferSize: 1e6
    });

    io.use(socketAuthMiddleware);

    io.on('connection', async (socket) => {
        const me = socket.data.user;

        // Join own personal room immediately; nothing else can be joined by
        // client request.
        socket.join(`user:${me.id}`);

        const joinMemberRooms = async () => {
            const rooms = await ChatRoom.find({ 'participants.userId': me.id, isActive: true }).select('_id').lean();
            rooms.forEach((room) => socket.join(`room:${room._id}`));
        };

        // User comes online (payload identity fields are ignored)
        socket.on('user:online', async () => {
            try {
                onlineUsers.set(me.id, { socketId: socket.id, name: me.name, lastSeen: new Date() });
                await joinMemberRooms();
                io.emit('users:online', onlineList());
            } catch (error) {
                console.error('user:online error:', error.message);
            }
        });

        // Private message
        socket.on('message:private', async ({ recipientId, content, attachments } = {}) => {
            try {
                const text = cleanContent(content);
                if (!text || !isObjectIdLike(recipientId)) {
                    return socket.emit('error', { message: 'Invalid message' });
                }

                const message = await Message.create({
                    type: 'private',
                    senderId: me.id,
                    senderName: me.name,
                    recipientId,
                    content: text,
                    read: false,
                    attachments: cleanAttachments(attachments)
                });

                await notificationService.notifyChatMessage({
                    recipientId,
                    senderName: me.name,
                    messagePreview: text,
                    chatType: 'private'
                }).catch((err) => console.error('Chat notification error:', err.message));

                io.to(`user:${recipientId}`).emit('message:received', message);
                socket.emit('message:sent', message);
            } catch (error) {
                console.error('Private message error:', error.message);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Public chat message
        socket.on('message:public', async ({ content, attachments } = {}) => {
            try {
                const text = cleanContent(content);
                if (!text) return socket.emit('error', { message: 'Invalid message' });

                const message = await Message.create({
                    type: 'public',
                    senderId: me.id,
                    senderName: me.name,
                    content: text,
                    roomId: null,
                    attachments: cleanAttachments(attachments)
                });
                io.emit('message:public', message);
            } catch (error) {
                console.error('Public message error:', error.message);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Group chat message (members only)
        socket.on('message:group', async ({ roomId, content, mentions, attachments } = {}) => {
            try {
                const text = cleanContent(content);
                if (!text || !(await isRoomMember(roomId, me.id))) {
                    return socket.emit('error', { message: 'Not allowed to post in this room' });
                }

                const message = await Message.create({
                    type: 'group',
                    senderId: me.id,
                    senderName: me.name,
                    roomId,
                    content: text,
                    mentions: Array.isArray(mentions) ? mentions.filter(isObjectIdLike).slice(0, 50) : [],
                    attachments: cleanAttachments(attachments)
                });

                await ChatRoom.findByIdAndUpdate(roomId, {
                    lastMessage: { content: text, timestamp: message.timestamp, senderId: me.id }
                });

                io.to(`room:${roomId}`).emit('message:group', message);
            } catch (error) {
                console.error('Group message error:', error.message);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // AI assistant message. Delivered only to the sender (or to a room
        // the sender belongs to) - never broadcast to every client.
        socket.on('message:ai', async ({ roomId, content, userContext, attachments } = {}) => {
            try {
                const text = cleanContent(content);
                if (!text) return socket.emit('error', { message: 'Invalid message' });

                let target = `user:${me.id}`;
                let room = null;
                if (roomId) {
                    if (!(await isRoomMember(roomId, me.id))) {
                        return socket.emit('error', { message: 'Not allowed to post in this room' });
                    }
                    room = roomId;
                    target = `room:${roomId}`;
                }

                const userMessage = await Message.create({
                    type: 'ai',
                    senderId: me.id,
                    senderName: me.name,
                    roomId: room,
                    content: text,
                    attachments: cleanAttachments(attachments)
                });
                io.to(target).emit('message:ai', userMessage);

                socket.emit('ai:typing', true);
                const safeContext = {
                    ...(userContext && typeof userContext === 'object' ? userContext : {}),
                    name: me.name,
                    userId: me.id,
                };
                const aiResponse = await geminiService.generateResponse(text, safeContext);

                const aiMessage = await Message.create({
                    type: 'ai',
                    senderId: 'ai-bot',
                    senderName: 'EEG Assistant 🤖',
                    recipientId: me.id,
                    roomId: room,
                    content: aiResponse
                });

                socket.emit('ai:typing', false);
                io.to(target).emit('message:ai', aiMessage);
            } catch (error) {
                console.error('AI message error:', error.message);
                socket.emit('ai:typing', false);
                socket.emit('error', { message: 'AI assistant unavailable' });
            }
        });

        // Typing indicators
        socket.on('typing:start', async ({ roomId, recipientId } = {}) => {
            if (roomId) {
                if (!(await isRoomMember(roomId, me.id))) return;
                if (!typingUsers.has(roomId)) typingUsers.set(roomId, new Set());
                typingUsers.get(roomId).add(me.id);
                io.to(`room:${roomId}`).emit('typing:update', { roomId, users: Array.from(typingUsers.get(roomId)) });
            } else if (isObjectIdLike(recipientId)) {
                io.to(`user:${recipientId}`).emit('typing:show', { userId: me.id });
            }
        });

        socket.on('typing:stop', async ({ roomId, recipientId } = {}) => {
            if (roomId && typingUsers.has(roomId)) {
                typingUsers.get(roomId).delete(me.id);
                io.to(`room:${roomId}`).emit('typing:update', { roomId, users: Array.from(typingUsers.get(roomId)) });
            } else if (isObjectIdLike(recipientId)) {
                io.to(`user:${recipientId}`).emit('typing:hide', { userId: me.id });
            }
        });

        // Create group (creator is the connected user)
        socket.on('room:create', async ({ name, description, participants } = {}) => {
            try {
                if (typeof name !== 'string' || !name.trim() || name.length > 100) {
                    return socket.emit('error', { message: 'A room name is required' });
                }
                const others = Array.isArray(participants)
                    ? [...new Set(participants.filter((id) => isObjectIdLike(id) && id !== me.id))].slice(0, 50)
                    : [];

                const room = await ChatRoom.create({
                    name: name.trim(),
                    description: typeof description === 'string' ? description.slice(0, 500) : undefined,
                    type: 'group',
                    createdBy: me.id,
                    participants: [
                        { userId: me.id, role: 'admin' },
                        ...others.map((id) => ({ userId: id, role: 'member' }))
                    ]
                });

                // The server joins participants' sockets to the room.
                [me.id, ...others].forEach((userId) => {
                    const online = onlineUsers.get(userId);
                    if (online) io.sockets.sockets.get(online.socketId)?.join(`room:${room._id}`);
                });
                socket.join(`room:${room._id}`);

                io.to(`room:${room._id}`).emit('room:created', room);
            } catch (error) {
                console.error('Create room error:', error.message);
                socket.emit('error', { message: 'Failed to create group' });
            }
        });

        // Mark message as read (only messages the user can see)
        socket.on('message:read', async ({ messageId } = {}) => {
            try {
                if (!isObjectIdLike(messageId)) return;
                const message = await Message.findById(messageId);
                if (!(await canAccessMessage(message, me.id))) return;
                await Message.updateOne(
                    { _id: messageId, 'readBy.userId': { $ne: me.id } },
                    { $set: { read: true }, $push: { readBy: { userId: me.id, readAt: new Date() } } }
                );
            } catch (error) {
                console.error('Mark read error:', error.message);
            }
        });

        // React to message
        socket.on('message:react', async ({ messageId, emoji } = {}) => {
            try {
                if (!isObjectIdLike(messageId) || typeof emoji !== 'string' || emoji.length > 16) return;
                const message = await Message.findById(messageId);
                if (!(await canAccessMessage(message, me.id))) return;

                message.reactions = message.reactions.filter((r) => r.userId?.toString() !== me.id);
                message.reactions.push({ userId: me.id, emoji });
                await message.save();

                if (message.type === 'group') {
                    io.to(`room:${message.roomId}`).emit('message:updated', message);
                } else if (message.type === 'private' || message.type === 'ai') {
                    io.to(`user:${message.recipientId}`).emit('message:updated', message);
                    io.to(`user:${message.senderId}`).emit('message:updated', message);
                } else {
                    io.emit('message:updated', message);
                }
            } catch (error) {
                console.error('React error:', error.message);
            }
        });

        socket.on('disconnect', () => {
            const current = onlineUsers.get(me.id);
            if (current && current.socketId === socket.id) {
                onlineUsers.delete(me.id);
                io.emit('users:online', onlineList());
            }
        });
    });

    return io;
};
