import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const messagesRef = useRef([]);
    const [messagesTrigger, setMessagesTrigger] = useState(0); // Trigger re-renders
    const [isConnected, setIsConnected] = useState(false);

    // Use a ref for messages to avoid dependency cycles in useEffect listeners if needed, 
    // but functional updates setMessages(prev => ...) are usually sufficient.
    const socketInitialized = useRef(false);

    // Helper to add message and trigger re-render
    const addMessage = (message) => {
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
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            newSocket.emit('user:online', { userId: user.id, userName: user.name });
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('users:online', (users) => {
            setOnlineUsers(users);
        });

        newSocket.on('message:received', (message) => {
            console.log('message:received event', message);
            addMessage(message);
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

        console.log('📤 sendPrivateMessage called with recipientId:', recipientId, 'senderId:', user.id);

        const msgData = {
            type: 'private',
            senderId: user.id,
            senderName: user.name,
            recipientId,
            content,
            attachments,
            timestamp: new Date(),
            _id: `temp-${Date.now()}` // Temporary ID for optimistic update
        };

        // Optimistic update - add message immediately for sender
        console.log('📤 Sending private message (optimistic):', msgData);
        addMessage(msgData);

        socket.emit('message:private', msgData);
    };

    const sendPublicMessage = (content, attachments = []) => {
        console.log('sendPublicMessage called', { socket: !!socket, content, user });
        if (!socket) {
            console.error('Socket not connected!');
            return;
        }
        const msgData = {
            senderId: user.id,
            senderName: user.name,
            content,
            attachments
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
            attachments
        };
        socket.emit('message:group', msgData);
    };

    const sendAiMessage = (content, attachments = [], userContext = {}) => {
        console.log('sendAiMessage called', { socket: !!socket, content, user });
        if (!socket) {
            console.error('Socket not connected for AI message!');
            return;
        }
        const msgData = {
            senderId: user.id,
            senderName: user.name,
            roomId: null,
            content,
            attachments,
            userContext: {
                ...userContext,
                name: user.name,
                userId: user.id
            }
        };
        console.log('Emitting message:ai', msgData);
        socket.emit('message:ai', msgData);
    };

    // Create reactive messages value that updates when messagesTrigger changes
    // IMPORTANT: Return a NEW array copy so React detects the change
    const messages = React.useMemo(() => [...messagesRef.current], [messagesTrigger]);

    // Memoize context value to ensure it updates when messages change
    const contextValue = React.useMemo(() => ({
        socket,
        messages,
        onlineUsers,
        isConnected,
        sendPrivateMessage,
        sendPublicMessage,
        sendGroupMessage,
        sendAiMessage
    }), [socket, messages, onlineUsers, isConnected, sendPrivateMessage, sendPublicMessage, sendGroupMessage, sendAiMessage]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};
