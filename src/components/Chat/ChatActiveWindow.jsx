import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import apiService from '../../services/apiService';

const ChatActiveWindow = ({ activeChat, onBack }) => {
    const { user } = useAuth();
    const { messages, sendPublicMessage, sendPrivateMessage, sendAiMessage, markAsRead, loadMessageHistory } = useSocket();
    const [localMessages, setLocalMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Filter messages for current chat
    useEffect(() => {
        console.log('🔍 ChatActiveWindow: Filtering messages', {
            totalMessages: messages?.length,
            activeChat: activeChat?.type,
            activeChatId: activeChat?.id,
            userId: user.id,
            messagesArray: messages
        });

        if (!activeChat || !messages) {
            console.log('⚠️ No activeChat or messages, clearing localMessages');
            setLocalMessages([]);
            return;
        }

        const filtered = messages.filter(msg => {
            console.log('🔎 Checking message:', {
                msgType: msg.type,
                msgSenderId: msg.senderId,
                msgRecipientId: msg.recipientId,
                activeChatType: activeChat.type,
                userId: user.id,
                activeChatId: activeChat.id
            });

            if (activeChat.type === 'public') {
                const passes = msg.type === 'public' || !msg.type;
                console.log(`  → Public filter: ${passes}`);
                return passes;
            } else if (activeChat.type === 'private') {
                const passes = msg.type === 'private' && (
                    (msg.senderId === user.id && msg.recipientId === activeChat.id) ||
                    (msg.senderId === activeChat.id && msg.recipientId === user.id)
                );
                console.log(`  → Private filter: ${passes}`);
                return passes;
            } else if (activeChat.type === 'ai') {
                const passes = msg.type === 'ai' && (msg.senderId === user.id || msg.senderId === 'ai-bot');
                console.log(`  → AI filter: ${passes} (type=${msg.type}, senderId=${msg.senderId})`);
                return passes;
            }
            console.log('  → No filter matched, returning false');
            return false;
        });

        console.log('✅ Filtered messages:', filtered.length, filtered);
        setLocalMessages(filtered);
    }, [messages, activeChat, user.id]);

    // Load message history when chat is opened
    useEffect(() => {
        if (activeChat && loadMessageHistory) {
            console.log('🔄 Loading history for chat:', activeChat.type, activeChat.id);
            loadMessageHistory(activeChat.type, activeChat.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChat?.id, activeChat?.type]); // Only reload when chat ID/type changes, not when function changes

    // Mark messages as read when chat is opened
    useEffect(() => {
        if (activeChat && markAsRead) {
            markAsRead(activeChat.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChat?.id]); // Only mark as read when chat ID changes

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [localMessages]);

    const handleSendMessage = async (content, attachments = []) => {
        if (activeChat.type === 'public') {
            await sendPublicMessage(content, attachments);
        } else if (activeChat.type === 'ai') {
            await sendAiMessage(content, attachments);
        } else {
            await sendPrivateMessage(activeChat.id, content, attachments);
        }
        
        // Force scroll to bottom after sending (immediate)
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        // Force scroll again after images load (delayed for attachments)
        if (attachments && attachments.length > 0) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message? This cannot be undone.')) {
            return;
        }

        try {
            await apiService.delete(`/chat/messages/${messageId}`);
            // Remove from local state optimistically
            const updatedMessages = messages.filter(m => m._id !== messageId);
            // This will be synced via socket, but we update locally for immediate feedback
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Failed to delete message: ' + error.message);
        }
    };

    if (!activeChat) {
        return (
            <div className="flex-1 flex items-center justify-center text-textSecondary">
                <p>Select a chat to start messaging</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-background overflow-hidden" style={{ maxWidth: '100%' }}>
            {/* Header */}
            <div className="h-16 border-b border-border bg-surface px-4 flex items-center gap-3 shadow-sm">
                <button
                    onClick={onBack}
                    className="md:hidden p-2 -ml-2 text-textSecondary hover:text-text"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="relative">
                    {activeChat.type === 'public' ? (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">#</div>
                    ) : activeChat.type === 'ai' ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">AI</div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                            {activeChat.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="font-bold text-text">{activeChat.name}</h2>
                    <p className="text-xs text-textSecondary">
                        {activeChat.type === 'public' ? 'Public Room' :
                            activeChat.type === 'ai' ? 'Powered by Gemini 2.5' :
                                activeChat.isOnline ? 'Active now' : 'Offline'}
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 pb-20 space-y-4 scroll-smooth"
                style={{ minHeight: 0, maxWidth: '100%' }}
            >
                {localMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-textSecondary opacity-50">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p>No messages yet. Say hello!</p>
                    </div>
                ) : (
                    localMessages.map((msg, idx) => {
                        const isSequence = idx > 0 && localMessages[idx - 1].senderId === msg.senderId;
                        const isOwn = msg.senderId === user.id;
                        return (
                            <div
                                key={msg._id || idx}
                                style={{
                                    display: 'flex',
                                    width: '100%',
                                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                    marginTop: isSequence ? '4px' : '16px'
                                }}
                            >
                                <div style={{
                                    maxWidth: '70%',
                                    minWidth: '120px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isOwn ? 'flex-end' : 'flex-start'
                                }}>
                                    {!isOwn && !isSequence && (
                                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px', marginBottom: '4px' }}>
                                            {msg.senderName || 'User'}
                                        </span>
                                    )}
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: '16px',
                                        background: isOwn ? '#4F46E5' : '#F3F4F6',
                                        color: isOwn ? 'white' : '#111827',
                                        wordBreak: 'break-word',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Attachments */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div style={{ marginBottom: msg.content ? '8px' : 0 }}>
                                                {msg.attachments.map((att, attIdx) => {
                                                    const fullUrl = att.url?.startsWith('http') ? att.url : `${apiService.getBaseUrl()}${att.url}`;
                                                    console.log('📎 Rendering attachment:', {
                                                        filename: att.filename,
                                                        type: att.type,
                                                        originalUrl: att.url,
                                                        fullUrl: fullUrl
                                                    });
                                                    
                                                    return (
                                                        <div key={attIdx} style={{ marginBottom: '4px' }}>
                                                            {att.type === 'image' ? (
                                                                <img
                                                                    src={fullUrl}
                                                                    alt={att.filename || 'attachment'}
                                                                    onLoad={() => {
                                                                        console.log('✅ Image loaded successfully:', att.filename);
                                                                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                                                                    }}
                                                                    onError={(e) => {
                                                                        console.error('❌ Image failed to load:', {
                                                                            filename: att.filename,
                                                                            url: fullUrl,
                                                                            error: e
                                                                        });
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                    style={{
                                                                        maxWidth: '100%',
                                                                        maxHeight: '300px',
                                                                        width: 'auto',
                                                                        height: 'auto',
                                                                        objectFit: 'contain',
                                                                        borderRadius: '8px',
                                                                        marginTop: '4px',
                                                                        backgroundColor: '#f3f4f6',
                                                                        display: 'block'
                                                                    }}
                                                                />
                                                            ) : (
                                                                <a
                                                                    href={fullUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        color: isOwn ? 'white' : '#4F46E5',
                                                                        textDecoration: 'underline',
                                                                        fontSize: '14px',
                                                                        wordBreak: 'break-all'
                                                                    }}
                                                                >
                                                                    📎 {att.filename || 'Download file'}
                                                                </a>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {msg.content && <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{msg.content}</p>}
                                        <div style={{
                                            fontSize: '10px',
                                            marginTop: '4px',
                                            opacity: 0.7,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span>{new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {isOwn && msg._id && !msg._id.startsWith('temp-') && (
                                                <button
                                                    onClick={() => handleDeleteMessage(msg._id)}
                                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        padding: '2px',
                                                        fontSize: '12px',
                                                        transition: 'transform 0.2s ease',
                                                        filter: 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.5))'
                                                    }}
                                                    title="Delete message"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )
                }

                {/* Typing Indicator */}
                {isTyping && activeChat.type === 'ai' && (
                    <div className="flex w-full justify-start mt-4">
                        <div className="px-4 py-3 rounded-2xl bg-surface border border-border text-text rounded-bl-none flex items-center gap-1">
                            <span className="w-2 h-2 bg-textSecondary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-textSecondary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-textSecondary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - with max height to prevent overflow */}
            <div className="flex-shrink-0 border-t border-border bg-surface p-3 max-h-[200px] overflow-y-auto">
                <MessageInput onSend={handleSendMessage} />
            </div>
        </div>
    );
};

export default ChatActiveWindow;
