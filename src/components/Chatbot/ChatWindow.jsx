import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import ChatMessage from './ChatMessage';
import './chatbot.css';

function ChatWindow({ onClose }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    // Load chat history on mount
    useEffect(() => {
        loadChatHistory();
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatHistory = async () => {
        try {
            setIsLoadingHistory(true);
            const history = await apiService.get(`/chat/history?userId=${user._id || user.id}`);
            setMessages(history.map(msg => ({
                ...msg,
                userName: user.name
            })));
        } catch (err) {
            console.error('Failed to load chat history:', err);
            // Show welcome message on error
            setMessages([{
                role: 'assistant',
                content: `Hi ${user.name}! 👋 I'm your EEG learning assistant. I can help you understand EEG patterns, answer questions about syndromes, and provide study guidance. What would you like to learn about?`,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setError('');

        // Add user message optimistically
        const tempUserMsg = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
            userName: user.name
        };
        setMessages(prev => [...prev, tempUserMsg]);

        setIsLoading(true);

        try {
            const response = await apiService.post('/chat/message', {
                userId: user._id || user.id,
                message: userMessage
            });

            // Add AI response
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.response,
                timestamp: response.timestamp
            }]);
        } catch (err) {
            setError(err.message || 'Failed to send message. Please try again.');
            // Remove optimistic user message on error
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
    };

    const suggestedQuestions = [
        "What are spike-and-wave patterns?",
        "Explain BECTS",
        "How do I study EEG patterns?",
        "What should I focus on next?"
    ];

    return (
        <div className="chat-window">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="chat-header-icon">🤖</div>
                    <div>
                        <div className="chat-header-title">EEG Learning Assistant</div>
                        <div className="chat-header-subtitle">Powered by AI</div>
                    </div>
                </div>
                <button onClick={onClose} className="chat-close-btn" aria-label="Close chat">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {isLoadingHistory ? (
                    <div className="chat-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading chat history...</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <ChatMessage
                                key={idx}
                                message={msg}
                                isUser={msg.role === 'user'}
                            />
                        ))}

                        {isLoading && (
                            <div className="chat-typing">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Suggestions (show only when empty) */}
            {messages.length <= 1 && !isLoadingHistory && (
                <div className="chat-suggestions">
                    <p className="chat-suggestions-title">Try asking:</p>
                    <div className="chat-suggestions-grid">
                        {suggestedQuestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="chat-suggestion-btn"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="chat-error">
                    <span>⚠️ {error}</span>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about EEG patterns..."
                    className="chat-input"
                    disabled={isLoading}
                    maxLength={1000}
                />
                <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!inputMessage.trim() || isLoading}
                    aria-label="Send message"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    );
}

export default ChatWindow;
