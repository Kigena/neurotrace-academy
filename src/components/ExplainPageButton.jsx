import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import apiService from '../services/apiService';

/**
 * Explain Page Button - One-click AI explanation of current page
 */
const ExplainPageButton = ({ pageTitle, pageContent, contentType = 'page' }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [explanation, setExplanation] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [loadingQuiz, setLoadingQuiz] = useState(false);

    const handleExplain = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.post('/ai/explain-page', {
                pageTitle,
                pageContent: pageContent.substring(0, 3000), // Limit content length
                contentType
            });
            setExplanation(response.explanation);
        } catch (error) {
            console.error('Explain page error:', error);
            alert('Failed to generate explanation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuizMe = async () => {
        setLoadingQuiz(true);
        try {
            const response = await apiService.post('/ai/quiz-from-page', {
                pageTitle,
                pageContent: pageContent.substring(0, 3000)
            });
            setQuiz(response.quiz);
            setShowQuiz(true);
        } catch (error) {
            console.error('Quiz generation error:', error);
            alert('Failed to generate quiz. Please try again.');
        } finally {
            setLoadingQuiz(false);
        }
    };

    return (
        <div>
            {/* Explain Button */}
            <button
                onClick={handleExplain}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Explaining...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span>Explain This Page</span>
                    </>
                )}
            </button>

            {/* Explanation Panel */}
            {explanation && (
                <div className="mt-4 bg-purple-50 border-2 border-purple-200 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            AI Explanation
                        </h3>
                        <button
                            onClick={() => setExplanation(null)}
                            className="text-purple-600 hover:text-purple-800"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="prose prose-sm max-w-none prose-p:text-purple-900 prose-headings:text-purple-900 prose-strong:text-purple-900 prose-strong:font-bold prose-ul:text-purple-900 prose-li:text-purple-900">
                        <ReactMarkdown>{explanation}</ReactMarkdown>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-purple-200">
                        <button
                            onClick={handleQuizMe}
                            disabled={loadingQuiz}
                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                            {loadingQuiz ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <span>Quiz Me on This</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Quiz Panel */}
            {showQuiz && quiz && (
                <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            Quiz Questions
                        </h3>
                        <button
                            onClick={() => setShowQuiz(false)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="prose prose-sm max-w-none text-blue-900">
                        <div className="whitespace-pre-wrap font-mono text-sm">{quiz}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExplainPageButton;
