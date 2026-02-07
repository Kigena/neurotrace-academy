import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import apiService from '../services/apiService';

/**
 * Case AI Assistant - Pre-filled prompts for case analysis
 */
const CaseAIAssistant = ({ caseId, caseData }) => {
    const [activePrompt, setActivePrompt] = useState(null);
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPanel, setShowPanel] = useState(false);

    const prompts = [
        {
            id: 'findings',
            icon: '🔍',
            label: 'What findings stand out?',
            description: 'Identify key EEG patterns and rhythms'
        },
        {
            id: 'differentials',
            icon: '🎯',
            label: 'What are likely differentials?',
            description: 'Discuss possible diagnoses'
        },
        {
            id: 'artifacts',
            icon: '⚠️',
            label: 'What artifacts should we rule out?',
            description: 'Identify potential technical issues'
        },
        {
            id: 'history',
            icon: '📋',
            label: 'What extra history would you ask for?',
            description: 'Suggest relevant clinical questions'
        }
    ];

    const handlePromptClick = async (promptType) => {
        setActivePrompt(promptType);
        setIsLoading(true);
        setResponse(null);
        
        try {
            const result = await apiService.post(`/cases/${caseId}/ai-analyze`, {
                promptType
            });
            setResponse(result.analysis);
        } catch (error) {
            console.error('AI analysis error:', error);
            alert('Failed to get AI analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Toggle Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl hover:border-indigo-300 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-indigo-900">Ask AI About This Case</p>
                        <p className="text-xs text-indigo-600">Get instant analysis and insights</p>
                    </div>
                </div>
                <svg 
                    className={`w-5 h-5 text-indigo-600 transition-transform ${showPanel ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* AI Assistant Panel */}
            {showPanel && (
                <div className="bg-white border-2 border-indigo-200 rounded-xl p-6 space-y-6">
                    {/* Prompt Buttons */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Questions:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {prompts.map(prompt => (
                                <button
                                    key={prompt.id}
                                    onClick={() => handlePromptClick(prompt.id)}
                                    disabled={isLoading}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                                        activePrompt === prompt.id
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-slate-200 hover:border-indigo-300 bg-white'
                                    } disabled:opacity-50`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{prompt.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900 text-sm mb-1">
                                                {prompt.label}
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                {prompt.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-indigo-700 font-medium">AI is analyzing the case...</p>
                        </div>
                    )}

                    {/* AI Response */}
                    {response && !isLoading && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">NeuroTrace AI</p>
                                        <p className="text-xs text-slate-500">Analysis Response</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setResponse(null)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Response Content with markdown rendering */}
                            <div className="prose prose-sm max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-headings:text-slate-900 prose-strong:text-slate-900 prose-strong:font-bold">
                                <ReactMarkdown>
                                    {response}
                                </ReactMarkdown>
                            </div>

                            {/* Copy Button */}
                            <div className="flex justify-end pt-3 border-t border-slate-200">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(response);
                                        alert('Response copied to clipboard!');
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy Response
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CaseAIAssistant;
