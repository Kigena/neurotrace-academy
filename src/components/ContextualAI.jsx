import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

/**
 * Contextual AI Assistant
 * Appears as a floating button that opens a chat widget
 * Context-aware: knows what page user is on and what content they're viewing
 */
const ContextualAI = ({ context = {} }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const messagesEndRef = useRef(null);

    // Load chat history for this context
    useEffect(() => {
        if (isOpen && user) {
            loadContextHistory();
        }
    }, [isOpen, user, context.page]);

    const loadContextHistory = async () => {
        try {
            // Load AI messages for this user (limit to last 50 for performance)
            const response = await apiService.get(`/chat/messages?type=ai&userId=${user.id}&limit=50`);
            setMessages(response || []);
        } catch (error) {
            console.error('Failed to load AI history:', error);
        }
    };

    const clearChatHistory = async () => {
        if (window.confirm('Are you sure you want to clear your AI chat history? This cannot be undone.')) {
            try {
                await apiService.delete(`/chat/history?userId=${user.id}`);
                setMessages([]);
                alert('Chat history cleared successfully!');
            } catch (error) {
                console.error('Failed to clear chat history:', error);
                alert('Failed to clear chat history. Please try again.');
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getContextPrompt = () => {
        const { page, caseData, patternData, syndromeData } = context;

        switch (page) {
            case 'case-detail':
                return `You are viewing a clinical case: "${caseData?.title || 'Unknown'}". 
Patient: ${caseData?.patientInfo?.age || 'N/A'} ${caseData?.patientInfo?.ageUnit || ''}, ${caseData?.patientInfo?.gender || 'N/A'}
History: ${caseData?.history || 'N/A'}
Findings: ${JSON.stringify(caseData?.findings || {})}

How can I help you understand this case?`;

            case 'pattern-detail':
                return `You are viewing the EEG pattern: "${patternData?.name || 'Unknown'}".
${patternData?.description ? `Description: ${patternData.description}` : ''}

Ask me anything about this pattern!`;

            case 'syndrome-detail':
                return `You are viewing the syndrome: "${syndromeData?.name || 'Unknown'}".
${syndromeData?.description ? `Description: ${syndromeData.description}` : ''}

What would you like to know?`;

            case 'quiz':
                return `You are taking a quiz. I can help explain concepts, but I won't give you direct answers! Ask me to explain any EEG patterns or concepts you're unsure about.`;

            case 'patterns':
                return `You are browsing EEG patterns. Ask me about any pattern, its clinical significance, or how to differentiate similar patterns!`;

            case 'cases':
                return `You are browsing clinical cases. I can help you understand case presentations, differential diagnoses, or EEG findings!`;

            default:
                return `Hello! I'm your EEG learning assistant. Ask me anything about EEG interpretation, patterns, or clinical cases!`;
        }
    };

    const getSuggestedQuestions = () => {
        const { page, caseData, patternData } = context;

        switch (page) {
            case 'case-detail':
                return [
                    "What is the most likely diagnosis?",
                    "Explain the EEG findings",
                    "What additional tests would help?",
                    "What are the treatment options?"
                ];

            case 'pattern-detail':
                return [
                    `What is ${patternData?.name}?`,
                    "What causes this pattern?",
                    "How do I identify it?",
                    "What is the clinical significance?"
                ];

            case 'quiz':
                return [
                    "Explain spike-and-wave patterns",
                    "What is the difference between alpha and mu rhythms?",
                    "How do I identify artifacts?",
                    "What are the stages of sleep?"
                ];

            default:
                return [
                    "What should I study first?",
                    "Explain common EEG patterns",
                    "How do I prepare for ABRET?",
                    "Create a study plan for me"
                ];
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = {
            _id: `temp-${Date.now()}`,
            type: 'ai',
            senderId: user.id,
            senderName: user.name,
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build enhanced context for AI
            const enhancedContext = {
                name: user.name,
                page: context.page || 'unknown',
                pageContext: getContextPrompt(),
                caseData: context.caseData ? {
                    title: context.caseData.title,
                    patientInfo: context.caseData.patientInfo,
                    history: context.caseData.history,
                    findings: context.caseData.findings
                } : null,
                patternData: context.patternData ? {
                    name: context.patternData.name,
                    description: context.patternData.description
                } : null
            };

            const response = await apiService.post('/chat/ai-context', {
                userId: user.id,
                message: input,
                context: enhancedContext
            });

            const aiMessage = {
                _id: response._id || `ai-${Date.now()}`,
                type: 'ai',
                senderId: 'ai-bot',
                senderName: 'EEG Assistant 🤖',
                content: response.response || response.content,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI request failed:', error);
            const errorMessage = {
                _id: `error-${Date.now()}`,
                type: 'ai',
                senderId: 'ai-bot',
                senderName: 'EEG Assistant 🤖',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = async (question) => {
        setInput(question);
        // Auto-send the suggestion
        if (!isLoading) {
            const userMessage = {
                _id: `temp-${Date.now()}`,
                type: 'ai',
                senderId: user.id,
                senderName: user.name,
                content: question,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            setInput('');
            setIsLoading(true);

            try {
                const enhancedContext = {
                    name: user.name,
                    page: context.page || 'unknown',
                    pageContext: getContextPrompt(),
                    caseData: context.caseData ? {
                        title: context.caseData.title,
                        patientInfo: context.caseData.patientInfo,
                        history: context.caseData.history,
                        findings: context.caseData.findings
                    } : null,
                    patternData: context.patternData ? {
                        name: context.patternData.name,
                        description: context.patternData.description
                    } : null
                };

                const response = await apiService.post('/chat/ai-context', {
                    userId: user.id,
                    message: question,
                    context: enhancedContext
                });

                const aiMessage = {
                    _id: response._id || `ai-${Date.now()}`,
                    type: 'ai',
                    senderId: 'ai-bot',
                    senderName: 'EEG Assistant 🤖',
                    content: response.response || response.content,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, aiMessage]);
            } catch (error) {
                console.error('AI request failed:', error);
                const errorMessage = {
                    _id: `error-${Date.now()}`,
                    type: 'ai',
                    senderId: 'ai-bot',
                    senderName: 'EEG Assistant 🤖',
                    content: 'Sorry, I encountered an error. Please try again.',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50 group"
                    title="Ask AI Assistant"
                >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {/* Pulse animation */}
                    <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-30"></span>
                </button>
            )}

            {/* Chat Widget */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold">EEG Assistant</h3>
                                <p className="text-xs opacity-90">
                                    {context.page ? `Helping with: ${context.page.replace('-', ' ')}` : 'Ready to help'}
                                </p>
                                {messages.length > 0 && (
                                    <p className="text-[10px] opacity-75">
                                        {messages.length} message{messages.length !== 1 ? 's' : ''} (last 50)
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Menu Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                    title="Menu"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                                {showMenu && (
                                    <>
                                        {/* Backdrop */}
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setShowMenu(false)}
                                        />
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 top-10 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button
                                                onClick={() => {
                                                    setShowMenu(false);
                                                    clearChatHistory();
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <div>
                                                    <div className="font-medium">Clear Chat History</div>
                                                    <div className="text-xs text-slate-500">Delete all messages</div>
                                                </div>
                                            </button>
                                            <div className="border-t border-slate-200 my-2"></div>
                                            <div className="px-4 py-2 text-xs text-slate-500">
                                                <p className="font-medium mb-1">💡 Tip</p>
                                                <p>Chat history is shared across all pages. Messages are limited to the last 50 for performance.</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                title="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Context Banner */}
                    {context.page && (
                        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-900">
                            <strong>📍 Context:</strong> {getContextPrompt().split('\n')[0]}
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {/* Always-visible Suggestions Section */}
                        <div className="sticky top-0 z-10 bg-slate-50 pb-3">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-indigo-900">Quick Help</p>
                                            <p className="text-[10px] text-indigo-600">{context.page?.replace('-', ' ') || 'general'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowSuggestions(!showSuggestions)}
                                        className="p-1 hover:bg-indigo-100 rounded-full transition-colors"
                                        title={showSuggestions ? "Hide suggestions" : "Show suggestions"}
                                    >
                                        <svg className={`w-4 h-4 text-indigo-600 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {showSuggestions && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {getSuggestedQuestions().map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSuggestionClick(q)}
                                                className="block w-full text-left px-3 py-2.5 text-xs bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-all hover:shadow-sm hover:border-indigo-300 group"
                                            >
                                                <span className="inline-block mr-2 group-hover:scale-110 transition-transform">💡</span>
                                                <span className="text-slate-700">{q}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Messages */}
                        {messages.length === 0 && !showSuggestions && (
                            <div className="text-center py-8 text-slate-400">
                                <p className="text-sm">No messages yet. Use the suggestions above or type your question!</p>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isAI = msg.senderId === 'ai-bot';
                            return (
                                <div key={msg._id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                        isAI 
                                            ? 'bg-white border border-slate-200 text-slate-900' 
                                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                    }`}>
                                        {isAI && (
                                            <p className="text-xs font-semibold mb-1 text-indigo-600">
                                                🤖 EEG Assistant
                                            </p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        <p className="text-[10px] mt-1 opacity-60">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default ContextualAI;
