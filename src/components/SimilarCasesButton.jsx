import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

/**
 * Similar Cases Button - Find cases similar to the current one
 * Embedded within case detail pages
 */
const SimilarCasesButton = ({ currentCaseId, currentCaseTitle }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [similarCases, setSimilarCases] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();

    const findSimilarCases = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.post('/ai/smart-search', {
                query: `Find cases similar to: ${currentCaseTitle}`,
                searchType: 'cases',
                currentCaseId
            });
            
            setSimilarCases(response.results);
            setShowResults(true);
        } catch (error) {
            console.error('Failed to find similar cases:', error);
            alert('Failed to find similar cases. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4">
            {/* Find Similar Button */}
            {!showResults && (
                <button
                    onClick={findSimilarCases}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            AI is analyzing...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Find Similar Cases
                        </>
                    )}
                </button>
            )}

            {/* Similar Cases Results */}
            {showResults && similarCases && (
                <div className="mt-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Similar Cases ({similarCases.length})
                        </h3>
                        <button
                            onClick={() => setShowResults(false)}
                            className="text-sm text-purple-700 hover:text-purple-900 font-medium"
                        >
                            Close
                        </button>
                    </div>

                    {similarCases.length === 0 ? (
                        <p className="text-purple-700">No similar cases found.</p>
                    ) : (
                        <div className="space-y-3">
                            {similarCases.map((sCase, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => navigate(sCase.path)}
                                    className="w-full text-left p-4 bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-md rounded-lg transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900 group-hover:text-purple-700 mb-1">
                                                {sCase.title}
                                            </h4>
                                            {sCase.relevance && (
                                                <p className="text-sm text-slate-600 mb-2">
                                                    {sCase.relevance}
                                                </p>
                                            )}
                                            {sCase.score && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                            style={{ width: `${sCase.score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-slate-600 font-medium">
                                                        {sCase.score}% match
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SimilarCasesButton;
