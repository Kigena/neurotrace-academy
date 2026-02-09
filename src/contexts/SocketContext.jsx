import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { showNotification, updateDocumentTitle, requestNotificationPermission } from '../utils/notifications';
import chatService from '../services/chatService';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesRef = useRef([]);
    const [messagesTrigger, setMessagesTrigger] = useState(0); // Trigger re-renders
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({}); // { chatId: count }
    const [activeChatId, setActiveChatId] = useState(null); // Track which chat is currently open

    // Use a ref for messages to avoid dependency cycles in useEffect listeners if needed, 
    // but functional updates setMessages(prev => ...) are usually sufficient.
    const socketInitialized = useRef(false);

    // Helper to add message and trigger re-render (with duplicate prevention)
    const addMessage = (message) => {
        // Check if message already exists (by _id or temp id)
        const exists = messagesRef.current.some(m =>
            (m._id && message._id && m._id.toString() === message._id.toString()) ||
            (m._id && m._id.toString().startsWith('temp-') && m.content === message.content && m.senderId === message.senderId)
        );

        if (exists) {
            console.log('⚠️ Message already exists, skipping:', message._id);
            return;
        }

        console.log('📨 Adding message to ref:', message);
        messagesRef.current = [...messagesRef.current, message];
        console.log('📊 Total messages in ref:', messagesRef.current.length);
        setMessagesTrigger(prev => {
            const newTrigger = prev + 1;
            console.log('🔔 Triggering re-render:', newTrigger);
            return newTrigger;
        });
    };

    useEffect(() => {
        if (!user || !user.id) {
            console.log('⏸️ Waiting for user to be fully loaded');
            return;
        }

        // Prevent re-initialization if socket is already set up for this user
        if (socketInitialized.current && socket) {
            console.log('✅ Socket already initialized, skipping re-creation');
            return;
        }

        console.log('🔌 Initializing socket for user:', user.id);
        socketInitialized.current = true;

        // Initialize Socket
        // Socket.IO connects to base URL, not the /api endpoint
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003';
        const socketUrl = apiUrl.replace('/api', ''); // Remove /api suffix for socket connection

        console.log('🔌 Connecting socket to:', socketUrl);

        const newSocket = io(socketUrl, {
            query: { userId: user.id },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            newSocket.emit('user:online', { userId: user.id, userName: user.name });
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);

            // Auto-reconnect for certain disconnect reasons
            if (reason === 'io server disconnect') {
                // Server disconnected, manually reconnect
                console.log('🔄 Server disconnected, attempting reconnect...');
                setTimeout(() => newSocket.connect(), 1000);
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
            setIsConnected(false);
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log('✅ Socket reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
            // Re-announce user online status
            newSocket.emit('user:online', { userId: user.id, userName: user.name });
        });

        newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Reconnection attempt', attemptNumber);
        });

        newSocket.on('reconnect_error', (error) => {
            console.error('❌ Reconnection error:', error.message);
        });

        newSocket.on('reconnect_failed', () => {
            console.error('❌ Failed to reconnect after all attempts');
            setIsConnected(false);
        });

        newSocket.on('users:online', (users) => {
            setOnlineUsers(users);
        });

        newSocket.on('message:received', (message) => {
            console.log('message:received event', message);
            addMessage(message);

            // Determine chat ID for this message
            const chatId = message.type === 'private'
                ? message.senderId  // For private messages, use sender's ID
                : message.type === 'ai'
                    ? 'ai-bot'
                    : 'public';

            // Only increment unread and notify if this chat is not currently active
            if (chatId !== activeChatId) {
                // Increment unread count
                setUnreadCounts(prev => ({
                    ...prev,
                    [chatId]: (prev[chatId] || 0) + 1
                }));

                // Show browser notification
                const title = message.type === 'private'
                    ? `${message.senderName}`
                    : message.type === 'ai'
                        ? 'NeuroLinea AI'
                        : 'Public Chat';

                showNotification(
                    title,
                    message.content.substring(0, 100),
                    () => {
                        // Focus window and open chat when notification clicked
                        window.focus();
                        // You can add logic here to switch to this chat
                    }
                );
            }
        });

        newSocket.on('message:public', (message) => {
            console.log('message:public event', message);
            addMessage(message);
        });

        newSocket.on('message:group', (message) => {
            console.log('message:group event', message);
            addMessage(message);
        });

        newSocket.on('message:ai', (message) => {
            console.log('message:ai event', message);
            console.log('addMessage function exists?', typeof addMessage);
            try {
                addMessage(message);
            } catch (error) {
                console.error('Error in addMessage:', error);
            }
        });

        // Confirmation of own message sent (if not optimistically added)
        newSocket.on('message:sent', (message) => {
            console.log('message:sent event', message);
            // Replace optimistic message with server-confirmed one
            const tempIndex = messagesRef.current.findIndex(m =>
                m._id && m._id.toString().startsWith('temp-') &&
                m.content === message.content &&
                m.senderId === message.senderId
            );

            if (tempIndex !== -1) {
                // Replace temp message with real one
                messagesRef.current[tempIndex] = message;
                setMessagesTrigger(prev => prev + 1);
                console.log('✅ Replaced temp message with server-confirmed message');
            } else if (!messagesRef.current.some(m => m._id === message._id)) {
                // Only add if not already present
                addMessage(message);
            }
        });

        setSocket(newSocket);

        // Cleanup
        return () => {
            console.log('🔌 Socket cleanup - closing connection');
            newSocket.close();
        };
    }, [user?.id]); // Only re-run if user ID changes, not the entire user object

    // --- Actions ---

    const sendPrivateMessage = (recipientId, content, attachments = []) => {
        if (!socket) return;

        console.log('📤 sendPrivateMessage called', { recipientId, content, attachments });

        const msgData = {
            type: 'private',
            senderId: user.id,
            senderName: user.name,
            recipientId,
            content,
            attachments: attachments || [],
            timestamp: new Date(),
            _id: `temp-${Date.now()}` // Temporary ID for optimistic update
        };

        // Optimistic update - add message immediately for sender
        console.log('📤 Sending private message (optimistic):', msgData);
        addMessage(msgData);

        socket.emit('message:private', msgData);
    };

    const sendPublicMessage = (content, attachments = []) => {
        console.log('sendPublicMessage called', { socket: !!socket, content, attachments, user });
        if (!socket) {
            console.error('Socket not connected!');
            return;
        }
        const msgData = {
            senderId: user.id,
            senderName: user.name,
            content,
            attachments: attachments || []
        };
        console.log('Emitting message:public', msgData);
        socket.emit('message:public', msgData);
    };

    // TEST FUNCTION - Remove after debugging
    const sendTestMessage = () => {
        if (!socket || !user) {
            console.error('Cannot send test - socket or user missing');
            return;
        }
        const testMsg = {
            senderId: user.id,
            senderName: user.name,
            content: 'TEST MESSAGE - ' + new Date().toISOString()
        };
        console.log('🧪 Sending test message:', testMsg);
        socket.emit('message:public', testMsg);
    };

    // Expose test function globally for debugging
    if (typeof window !== 'undefined') {
        window.sendTestMessage = sendTestMessage;
    }

    const sendGroupMessage = (roomId, content, attachments = []) => {
        if (!socket) return;
        const msgData = {
            senderId: user.id,
            senderName: user.name,
            roomId,
            content,
            attachments: attachments || []
        };
        console.log('Emitting message:group', msgData);
        socket.emit('message:group', msgData);
    };

    const sendAiMessage = (content, attachments = [], userContext = {}) => {
        console.log('sendAiMessage called', { socket: !!socket, content, attachments, user });
        if (!socket) {
            console.error('Socket not connected for AI message!');
            return;
        }
        const msgData = {
            senderId: user.id,
            senderName: user.name,
            roomId: null,
            content,
            attachments: attachments || [],
            userContext: {
                ...userContext,
                name: user.name,
                userId: user.id
            }
        };
        console.log('Emitting message:ai with attachments:', msgData);
        socket.emit('message:ai', msgData);
    };

    // Load message history from database
    const loadMessageHistory = async (chatType, chatId) => {
        if (!user) return;

        try {
            console.log(`📚 Loading message history for ${chatType} chat:`, chatId);
            let messages = [];

            if (chatType === 'private') {
                messages = await chatService.getPrivateMessages(user.id, chatId);
            } else if (chatType === 'public') {
                messages = await chatService.getPublicMessages();
            } else if (chatType === 'ai') {
                messages = await chatService.getAiMessages(user.id);
            }

            console.log(`✅ Loaded ${messages.length} messages from database`);

            // Replace messages in ref (don't append, replace)
            messagesRef.current = messages;
            setMessagesTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Failed to load message history:', error);
        }
    };

    // Mark messages as read for a specific chat
    const markAsRead = (chatId) => {
        console.log('📖 Marking chat as read:', chatId);
        setActiveChatId(chatId);
        setUnreadCounts(prev => {
            const updated = { ...prev };
            delete updated[chatId];
            return updated;
        });

        // Update document title
        const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0) - (unreadCounts[chatId] || 0);
        updateDocumentTitle(totalUnread);
    };

    // Request notification permission on mount
    useEffect(() => {
        requestNotificationPermission();
    }, []);

    // Update document title when unread counts change
    useEffect(() => {
        const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
        updateDocumentTitle(totalUnread);
    }, [unreadCounts]);

    // Create reactive messages value that updates when messagesTrigger changes
    // IMPORTANT: Return a NEW array copy so React detects the change
    const messages = React.useMemo(() => [...messagesRef.current], [messagesTrigger]);

    // Memoize context value to ensure it updates when messages change
    const contextValue = React.useMemo(() => ({
        socket,
        messages,
        onlineUsers,
        isConnected,
        unreadCounts,
        markAsRead,
        loadMessageHistory,
        sendPrivateMessage,
        sendPublicMessage,
        sendGroupMessage,
        sendAiMessage
    }), [socket, messages, onlineUsers, isConnected, unreadCounts, sendPrivateMessage, sendPublicMessage, sendGroupMessage, sendAiMessage]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};
