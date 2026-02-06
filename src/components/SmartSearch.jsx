import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

/**
 * Smart Search - AI-powered natural language search
 * Examples: "Find cases similar to absence seizures"
 *           "Show me triphasic waves vs GPDs"
 *           "Where do we cover electrode pop?"
 */
const SmartSearch = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState(null);
    const [searchType, setSearchType] = useState(null); // 'cases', 'patterns', 'resources'
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Keyboard shortcut: Ctrl+K to open search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const detectSearchIntent = (query) => {
        const lowerQuery = query.toLowerCase();
        
        // Detect search type from query
        if (lowerQuery.includes('case') || lowerQuery.includes('similar') || lowerQuery.includes('patient')) {
            return 'cases';
        }
        if (lowerQuery.includes('pattern') || lowerQuery.includes('wave') || lowerQuery.includes('rhythm') || 
            lowerQuery.includes('vs') || lowerQuery.includes('compare') || lowerQuery.includes('difference')) {
            return 'patterns';
        }
        if (lowerQuery.includes('where') || lowerQuery.includes('cover') || lowerQuery.includes('learn') || 
            lowerQuery.includes('resource') || lowerQuery.includes('find')) {
            return 'resources';
        }
        
        // Default to cases for general queries
        return 'cases';
    };

    const handleSearch = async () => {
        if (!query.trim()) return;
        
        setIsSearching(true);
        const type = detectSearchIntent(query);
        setSearchType(type);

        try {
            const response = await apiService.post('/ai/smart-search', {
                query,
                searchType: type
            });
            
            setResults(response.results);
        } catch (error) {
            console.error('Smart search error:', error);
            alert('Search failed. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleResultClick = (result) => {
        setIsOpen(false);
        setQuery('');
        setResults(null);
        navigate(result.path);
    };

    const exampleQueries = [
        "Find cases similar to absence seizures",
        "Show me triphasic waves vs GPDs",
        "Where do we cover electrode pop?",
        "Cases with pediatric patients",
        "Compare BECTS vs benign variants"
    ];

    return (
        <>
            {/* Search Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                title="Smart Search (Ctrl+K)"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden md:inline">Smart Search</span>
                <kbd className="hidden md:inline px-2 py-0.5 text-xs bg-white/20 rounded">⌘K</kbd>
            </button>

            {/* Search Modal */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Header */}
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Smart Search</h2>
                                    <p className="text-sm text-slate-600">AI-powered search across cases, patterns, and resources</p>
                                </div>
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Ask anything... e.g., 'Find cases similar to this' or 'Compare spike-wave patterns'"
                                    className="w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-slate-900"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching || !query.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSearching ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Example Queries */}
                        {!results && !isSearching && (
                            <div className="p-6 space-y-4 overflow-auto">
                                <h3 className="text-sm font-semibold text-slate-700">Try these examples:</h3>
                                <div className="space-y-2">
                                    {exampleQueries.map((example, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setQuery(example);
                                                inputRef.current?.focus();
                                            }}
                                            className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg transition-colors text-sm text-slate-700"
                                        >
                                            <span className="text-blue-600 mr-2">💡</span>
                                            {example}
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-2">What you can search for:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="font-semibold text-green-900 mb-1">📁 Cases</p>
                                            <p className="text-green-700">"Find similar cases", "Pediatric seizures", "Artifact examples"</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                            <p className="font-semibold text-purple-900 mb-1">🧠 Patterns</p>
                                            <p className="text-purple-700">"Compare patterns", "Spike vs sharp", "Sleep patterns"</p>
                                        </div>
                                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <p className="font-semibold text-orange-900 mb-1">📚 Resources</p>
                                            <p className="text-orange-700">"Where is X covered?", "Learn about Y", "Find info on Z"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {isSearching && (
                            <div className="p-12 text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-blue-700 font-medium">AI is searching...</p>
                                <p className="text-sm text-slate-600 mt-1">
                                    {searchType === 'cases' && 'Analyzing cases for relevance'}
                                    {searchType === 'patterns' && 'Comparing EEG patterns'}
                                    {searchType === 'resources' && 'Finding relevant resources'}
                                </p>
                            </div>
                        )}

                        {/* Search Results */}
                        {results && !isSearching && (
                            <div className="flex-1 overflow-auto p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {results.length} Result{results.length !== 1 ? 's' : ''} Found
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setResults(null);
                                            setQuery('');
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        New Search
                                    </button>
                                </div>

                                {results.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-slate-600">No results found. Try a different search query.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {results.map((result, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleResultClick(result)}
                                                className="w-full text-left p-4 bg-white border-2 border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl transition-all group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-700">
                                                            {result.title}
                                                        </h4>
                                                        {result.relevance && (
                                                            <p className="text-sm text-slate-600 mb-2">
                                                                {result.relevance}
                                                            </p>
                                                        )}
                                                        {result.reason && (
                                                            <p className="text-sm text-slate-600 mb-2">
                                                                {result.reason}
                                                            </p>
                                                        )}
                                                        {result.key_differences && (
                                                            <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded mt-2">
                                                                <strong>Key differences:</strong> {result.key_differences}
                                                            </p>
                                                        )}
                                                        {result.section && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                📍 Section: {result.section}
                                                            </p>
                                                        )}
                                                        {result.score && (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                                                        style={{ width: `${result.score}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-slate-600 font-medium">
                                                                    {result.score}% match
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                                {result.type || searchType}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                Click to view →
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartSearch;
