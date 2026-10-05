import express from 'express';
import { ChatMessage } from '../models/ChatMessage.js';
import Message from '../models/Message.js';
import ChatRoom from '../models/ChatRoom.js';
import geminiService from '../services/gemini.js';
import { User } from '../models/User.js';
import { QuizSession } from '../models/QuizSession.js';
import auth from '../middleware/auth.js';
import { chatUpload } from '../config/cloudinary.js';
import { cleanContent, isRoomMember, MAX_MESSAGE_LENGTH } from '../services/chatAccess.js';
import { escapeRegex, isObjectIdLike } from '../utils/validation.js';

// All chat endpoints require authentication. The acting user is always
// req.user (from the verified token); any userId sent by the client is ignored.

export function createChatRouter({ limiters }) {
    const router = express.Router();
    router.use(auth);

    // Upload file (Cloudinary or Local)
    router.post('/upload', chatUpload.single('file'), (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const isCloudinary = req.file.path && req.file.path.startsWith('http');
            let fileUrl;

            if (isCloudinary) {
                fileUrl = req.file.path;
            } else {
                const host = req.get('host') || 'neurolinea-api.onrender.com';
                const protocol = host.includes('localhost') ? 'http' : 'https';
                fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
            }

            res.json({
                url: fileUrl,
                filename: req.file.originalname,
                type: req.file.mimetype?.startsWith('image/') ? 'image' : 'file',
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        } catch (error) {
            console.error('File upload error:', error.message);
            res.status(500).json({ error: 'File upload failed' });
        }
    });

    // Get messages for Chat System (Unified)
    router.get('/messages', async (req, res) => {
        try {
            const { roomId, type, otherUserId, limit } = req.query;
            const me = req.user.id;
            const messageLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 200);
            let query;

            if (type === 'private') {
                if (!isObjectIdLike(otherUserId)) {
                    return res.status(400).json({ error: 'otherUserId is required' });
                }
                query = {
                    type: 'private',
                    $or: [
                        { senderId: me, recipientId: otherUserId },
                        { senderId: otherUserId, recipientId: me }
                    ]
                };
            } else if (type === 'ai') {
                query = {
                    type: 'ai',
                    $or: [
                        { senderId: me },
                        { senderId: 'ai-bot', recipientId: me }
                    ]
                };
            } else if (roomId) {
                if (!(await isRoomMember(roomId, me))) {
                    return res.status(403).json({ error: 'Not a member of this room' });
                }
                query = { roomId };
            } else {
                query = { type: 'public' };
            }

            const messages = await Message.find(query)
                .sort({ timestamp: -1 })
                .limit(messageLimit)
                .lean();

            res.json(messages.reverse());
        } catch (error) {
            console.error('Fetch messages error:', error.message);
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    });

    // Get own rooms
    router.get('/rooms', async (req, res) => {
        try {
            const rooms = await ChatRoom.find({
                'participants.userId': req.user.id,
                isActive: true
            }).sort({ updatedAt: -1 });
            res.json(rooms);
        } catch (error) {
            console.error('Fetch rooms error:', error.message);
            res.status(500).json({ error: 'Failed to fetch rooms' });
        }
    });

    // Create room (creator is the authenticated user)
    router.post('/rooms', async (req, res) => {
        try {
            const { name, description, participants } = req.body || {};
            if (typeof name !== 'string' || !name.trim() || name.length > 100) {
                return res.status(400).json({ error: 'A room name is required' });
            }
            const others = Array.isArray(participants)
                ? [...new Set(participants.filter((id) => isObjectIdLike(id) && id !== req.user.id))].slice(0, 50)
                : [];

            const room = new ChatRoom({
                name: name.trim(),
                description: typeof description === 'string' ? description.slice(0, 500) : undefined,
                createdBy: req.user.id,
                type: 'group',
                participants: [
                    { userId: req.user.id, role: 'admin' },
                    ...others.map((id) => ({ userId: id, role: 'member' }))
                ]
            });

            await room.save();
            res.status(201).json(room);
        } catch (error) {
            console.error('Create room error:', error.message);
            res.status(500).json({ error: 'Failed to create room' });
        }
    });

    // Search users by name (emails are not exposed)
    router.get('/users/search', async (req, res) => {
        try {
            const { query } = req.query;
            if (typeof query !== 'string' || query.length < 2 || query.length > 100) return res.json([]);

            const users = await User.find({ name: { $regex: escapeRegex(query), $options: 'i' } })
                .select('name _id profile.avatar')
                .limit(10)
                .lean();

            res.json(users);
        } catch (error) {
            console.error('User search error:', error.message);
            res.status(500).json({ error: 'Search failed' });
        }
    });

    // --- Legacy Chatbot Endpoints ---

    // Own chat history (old chatbot)
    router.get('/history', async (req, res) => {
        try {
            const messages = await ChatMessage.find({ userId: req.user.id })
                .sort({ timestamp: 1 })
                .limit(50)
                .lean();
            res.json(messages);
        } catch (error) {
            console.error('Error fetching chat history:', error.message);
            res.status(500).json({ error: 'Failed to fetch chat history' });
        }
    });

    // Send a message and get AI response (old chatbot)
    router.post('/message', limiters.ai, async (req, res) => {
        try {
            const userId = req.user.id;
            const message = cleanContent(req.body?.message);
            if (!message) {
                return res.status(400).json({ error: `message is required (max ${MAX_MESSAGE_LENGTH} characters)` });
            }

            const sessions = await QuizSession.find({ userId }).lean();
            const userContext = {
                name: req.user.name,
                quizzesTaken: sessions.filter(s => s.endTime).length,
                accuracy: 0,
                bestScore: 0
            };

            await new ChatMessage({ userId, role: 'user', content: message }).save();

            const chatHistory = await ChatMessage.find({ userId }).sort({ timestamp: -1 }).limit(10).lean();
            chatHistory.reverse();

            const aiResponse = await geminiService.generateResponse(message, userContext, chatHistory);

            const assistantMessage = new ChatMessage({ userId, role: 'assistant', content: aiResponse });
            await assistantMessage.save();

            res.json({
                response: aiResponse,
                timestamp: assistantMessage.timestamp,
                messageId: assistantMessage._id
            });
        } catch (error) {
            console.error('Error processing chat message:', error.message);
            res.status(500).json({ error: 'Failed to process message' });
        }
    });

    // Contextual AI endpoint - handles page-specific context
    router.post('/ai-context', limiters.ai, async (req, res) => {
        try {
            const userId = req.user.id;
            const message = cleanContent(req.body?.message);
            const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};
            if (!message) {
                return res.status(400).json({ error: `message is required (max ${MAX_MESSAGE_LENGTH} characters)` });
            }
            if (JSON.stringify(context).length > 20000) {
                return res.status(400).json({ error: 'context is too large' });
            }

            const str = (v, max = 2000) => (typeof v === 'string' ? v.slice(0, max) : '');

            let systemPrompt = `You are an expert EEG technologist and educator helping users learn EEG interpretation and ABRET exam preparation.

Current Page Context: ${str(context.page, 100) || 'general'}
${str(context.pageContext, 4000)}

`;

            if (context.caseData && typeof context.caseData === 'object') {
                const c = context.caseData;
                systemPrompt += `\nClinical Case Context:
- Title: ${str(c.title, 300)}
- Patient: ${str(String(c.patientInfo?.age ?? ''), 20)} ${str(c.patientInfo?.ageUnit, 20)}, ${str(c.patientInfo?.gender, 20)}
- History: ${str(c.history, 3000)}
- Findings: ${JSON.stringify(c.findings ?? {}, null, 2).slice(0, 4000)}

Please help the user understand this specific case.`;
            }

            if (context.patternData && typeof context.patternData === 'object') {
                systemPrompt += `\nEEG Pattern Context:
- Pattern: ${str(context.patternData.name, 200)}
- Description: ${str(context.patternData.description, 2000) || 'N/A'}

Please help the user understand this specific EEG pattern.`;
            }

            await new Message({
                type: 'ai',
                senderId: userId,
                senderName: req.user.name,
                content: message,
                timestamp: new Date()
            }).save();

            const aiResponse = await geminiService.generateContextualResponse(
                message,
                { name: req.user.name, page: str(context.page, 100) },
                systemPrompt
            );

            const aiMessage = new Message({
                type: 'ai',
                senderId: 'ai-bot',
                senderName: 'EEG Assistant 🤖',
                recipientId: userId,
                content: aiResponse,
                timestamp: new Date()
            });
            await aiMessage.save();

            res.json({
                response: aiResponse,
                _id: aiMessage._id,
                timestamp: aiMessage.timestamp
            });
        } catch (error) {
            console.error('Contextual AI error:', error.message);
            res.status(500).json({ error: 'Failed to generate AI response' });
        }
    });

    router.get('/suggestions', (req, res) => {
        res.json({ suggestions: geminiService.getSuggestedQuestions() });
    });

    // Clear own legacy chatbot history
    router.delete('/history', async (req, res) => {
        try {
            await ChatMessage.deleteMany({ userId: req.user.id });
            res.json({ message: 'Chat history cleared' });
        } catch (error) {
            console.error('Clear history error:', error.message);
            res.status(500).json({ error: 'Failed to clear chat history' });
        }
    });

    // Delete a specific message (owner or admin)
    router.delete('/messages/:messageId', async (req, res) => {
        try {
            if (!isObjectIdLike(req.params.messageId)) {
                return res.status(404).json({ error: 'Message not found' });
            }
            const message = await Message.findById(req.params.messageId);
            if (!message) {
                return res.status(404).json({ error: 'Message not found' });
            }

            const isOwner = message.senderId === req.user.id;
            const isAdmin = req.user.role === 'admin';
            if (!isOwner && !isAdmin) {
                return res.status(403).json({ error: 'You can only delete your own messages' });
            }

            await Message.findByIdAndDelete(req.params.messageId);
            res.json({ message: 'Message deleted successfully', id: req.params.messageId });
        } catch (error) {
            console.error('Delete message error:', error.message);
            res.status(500).json({ error: 'Failed to delete message' });
        }
    });

    return router;
}
