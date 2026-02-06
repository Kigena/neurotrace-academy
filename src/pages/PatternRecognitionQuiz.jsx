import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patternsData from '../data/neurotrace_patterns_library_v2.json';

/**
 * Pattern Recognition Quiz - Visual EEG Pattern Identification
 * Tests ability to identify patterns, normal variants, and epileptiform discharges
 */
const PatternRecognitionQuiz = () => {
    const navigate = useNavigate();
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizComplete, setQuizComplete] = useState(false);
    const [difficulty, setDifficulty] = useState('mixed'); // easy, medium, hard, mixed
    const [categoryFilter, setCategoryFilter] = useState('all'); // all, normal, variants, epileptiform, artifacts

    // Filter patterns that have images
    const getPatternsWithImages = () => {
        return patternsData.filter(p => p.image && p.image !== '');
    };

    // Generate quiz questions
    const generateQuiz = (numQuestions = 20) => {
        const availablePatterns = getPatternsWithImages();
        
        // Filter by category if not 'all'
        let filteredPatterns = availablePatterns;
        if (categoryFilter !== 'all') {
            const categoryMap = {
                'normal': ['NORMAL'],
                'variants': ['NORMAL_VARIANT', 'BENIGN_VARIANT'],
                'epileptiform': ['EPILEPTIFORM', 'ICTAL', 'INTERICTAL'],
                'artifacts': ['ARTIFACT']
            };
            filteredPatterns = availablePatterns.filter(p => 
                categoryMap[categoryFilter]?.includes(p.category)
            );
        }

        if (filteredPatterns.length < 4) {
            alert('Not enough patterns available for this category. Please select a different category.');
            return [];
        }

        // Shuffle and select patterns
        const shuffled = [...filteredPatterns].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(numQuestions, filteredPatterns.length));

        // Generate questions with distractors
        return selected.map(pattern => {
            // Get confusions as distractors
            const confusions = pattern.common_confusions?.map(c => c.pattern_id) || [];
            let distractors = patternsData
                .filter(p => confusions.includes(p.id) && p.id !== pattern.id)
                .slice(0, 2);

            // If not enough confusions, get random distractors from same category
            while (distractors.length < 3) {
                const randomPattern = filteredPatterns[Math.floor(Math.random() * filteredPatterns.length)];
                if (randomPattern.id !== pattern.id && !distractors.some(d => d.id === randomPattern.id)) {
                    distractors.push(randomPattern);
                }
            }

            // Create answer options
            const options = [pattern, ...distractors.slice(0, 3)]
                .sort(() => Math.random() - 0.5);

            return {
                pattern,
                options,
                correctAnswer: pattern.id,
                explanation: generateExplanation(pattern)
            };
        });
    };

    const generateExplanation = (pattern) => {
        const features = pattern.key_features?.slice(0, 3).join(', ') || 'Key identifying features';
        const morphology = pattern.morphology || 'Characteristic morphology';
        const location = pattern.topography?.join(', ') || 'specific location';
        
        return `${pattern.name} is characterized by ${morphology} seen in ${location} regions. Key features include: ${features}. ${pattern.clinical_context?.seen_in?.[0] ? `Typically seen in ${pattern.clinical_context.seen_in[0]}.` : ''}`;
    };

    const startQuiz = () => {
        const questions = generateQuiz(20);
        if (questions.length === 0) return;
        
        setQuizQuestions(questions);
        setQuizStarted(true);
        setCurrentQuestion(0);
        setScore(0);
        setQuizComplete(false);
    };

    const handleAnswerSelect = (patternId) => {
        if (showExplanation) return; // Prevent changing answer after showing explanation
        setSelectedAnswer(patternId);
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) {
            alert('Please select an answer');
            return;
        }

        const isCorrect = selectedAnswer === quizQuestions[currentQuestion].correctAnswer;
        if (isCorrect) {
            setScore(score + 1);
        }
        setShowExplanation(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setQuizComplete(true);
        }
    };

    const resetQuiz = () => {
        setQuizStarted(false);
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setQuizComplete(false);
        setQuizQuestions([]);
    };

    const getCategoryBadgeColor = (category) => {
        const colorMap = {
            'NORMAL': 'bg-green-100 text-green-800',
            'NORMAL_VARIANT': 'bg-blue-100 text-blue-800',
            'BENIGN_VARIANT': 'bg-cyan-100 text-cyan-800',
            'EPILEPTIFORM': 'bg-red-100 text-red-800',
            'ICTAL': 'bg-red-200 text-red-900',
            'INTERICTAL': 'bg-orange-100 text-orange-800',
            'ARTIFACT': 'bg-gray-100 text-gray-800'
        };
        return colorMap[category] || 'bg-slate-100 text-slate-800';
    };

    // Introduction Screen
    if (!quizStarted || quizQuestions.length === 0) {
        const availablePatterns = getPatternsWithImages();
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/quiz')}
                        className="mb-6 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium"
                    >
                        ← Back to Quiz Hub
                    </button>

                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-3">Pattern Recognition Quiz</h1>
                            <p className="text-lg text-slate-600">
                                Test your ability to identify EEG patterns, normal variants, and epileptiform discharges
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                <p className="text-sm text-blue-700 font-medium mb-1">Available Patterns</p>
                                <p className="text-3xl font-bold text-blue-900">{availablePatterns.length}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                <p className="text-sm text-purple-700 font-medium mb-1">Questions</p>
                                <p className="text-3xl font-bold text-purple-900">20</p>
                            </div>
                            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200">
                                <p className="text-sm text-pink-700 font-medium mb-1">Multiple Choice</p>
                                <p className="text-3xl font-bold text-pink-900">4 Options</p>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Select Category:
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[
                                    { value: 'all', label: 'All Patterns', icon: '🧠' },
                                    { value: 'normal', label: 'Normal', icon: '✅' },
                                    { value: 'variants', label: 'Variants', icon: '🔄' },
                                    { value: 'epileptiform', label: 'Epileptiform', icon: '⚡' },
                                    { value: 'artifacts', label: 'Artifacts', icon: '⚠️' }
                                ].map(cat => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setCategoryFilter(cat.value)}
                                        className={`p-3 rounded-lg border-2 transition-all ${
                                            categoryFilter === cat.value
                                                ? 'border-purple-500 bg-purple-50 text-purple-900 font-semibold'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300'
                                        }`}
                                    >
                                        <span className="block text-2xl mb-1">{cat.icon}</span>
                                        <span className="text-xs">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="bg-slate-50 rounded-xl p-6 mb-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">What to Expect:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Real EEG Images</p>
                                        <p className="text-sm text-slate-600">Identify patterns from actual EEG recordings</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Instant Feedback</p>
                                        <p className="text-sm text-slate-600">Learn from detailed explanations</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Common Confusions</p>
                                        <p className="text-sm text-slate-600">Distractors based on commonly confused patterns</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Track Progress</p>
                                        <p className="text-sm text-slate-600">See your score and performance breakdown</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={startQuiz}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Start Pattern Recognition Quiz
                        </button>

                        {availablePatterns.length < 10 && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Some pattern images may not be available yet. 
                                    To add images, place them in <code>public/images/patterns/</code> with names matching the pattern data.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Complete Screen
    if (quizComplete) {
        const percentage = Math.round((score / quizQuestions.length) * 100);
        const passed = percentage >= 70;

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                                passed ? 'bg-green-100' : 'bg-orange-100'
                            }`}>
                                {passed ? (
                                    <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>

                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                {passed 
                                    ? 'Excellent pattern recognition skills!' 
                                    : 'Keep practicing to improve your pattern identification!'}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                    <p className="text-sm text-blue-700 font-medium mb-2">Your Score</p>
                                    <p className="text-4xl font-bold text-blue-900">{score}/{quizQuestions.length}</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                                    <p className="text-sm text-purple-700 font-medium mb-2">Percentage</p>
                                    <p className="text-4xl font-bold text-purple-900">{percentage}%</p>
                                </div>
                                <div className={`p-6 rounded-xl border ${
                                    passed ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                                }`}>
                                    <p className={`text-sm font-medium mb-2 ${
                                        passed ? 'text-green-700' : 'text-orange-700'
                                    }`}>Status</p>
                                    <p className={`text-4xl font-bold ${
                                        passed ? 'text-green-900' : 'text-orange-900'
                                    }`}>{passed ? 'PASS' : 'REVIEW'}</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                <button
                                    onClick={resetQuiz}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/quiz')}
                                    className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all"
                                >
                                    Back to Quiz Hub
                                </button>
                                <button
                                    onClick={() => navigate('/patterns')}
                                    className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all"
                                >
                                    Study Patterns
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Question Screen
    const question = quizQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctAnswer;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                            Question {currentQuestion + 1} of {quizQuestions.length}
                        </span>
                        <span className="text-sm font-medium text-purple-700">
                            Score: {score}/{currentQuestion + (showExplanation ? 1 : 0)}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Question Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">Identify this EEG Pattern</h2>
                        <p className="text-purple-100">
                            Study the EEG image and select the correct pattern name
                        </p>
                    </div>

                    {/* EEG Image */}
                    <div className="p-8 bg-slate-50">
                        <div className="bg-white border-4 border-slate-300 rounded-xl overflow-hidden shadow-lg">
                            <img
                                src={question.pattern.image}
                                alt="EEG Pattern"
                                className="w-full h-auto"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FRUcgUGF0dGVybiBJbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                                }}
                            />
                        </div>
                    </div>

                    {/* Answer Options */}
                    <div className="p-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Select the pattern:</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {question.options.map((option, idx) => {
                                const isSelected = selectedAnswer === option.id;
                                const isCorrectOption = option.id === question.correctAnswer;
                                
                                let buttonClass = 'w-full text-left p-4 rounded-xl border-2 transition-all ';
                                
                                if (showExplanation) {
                                    if (isCorrectOption) {
                                        buttonClass += 'border-green-500 bg-green-50 ';
                                    } else if (isSelected) {
                                        buttonClass += 'border-red-500 bg-red-50 ';
                                    } else {
                                        buttonClass += 'border-slate-200 bg-slate-50 opacity-60 ';
                                    }
                                } else {
                                    buttonClass += isSelected
                                        ? 'border-purple-500 bg-purple-50 '
                                        : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50 ';
                                }

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswerSelect(option.id)}
                                        disabled={showExplanation}
                                        className={buttonClass}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold ${
                                                showExplanation && isCorrectOption
                                                    ? 'border-green-600 bg-green-600 text-white'
                                                    : showExplanation && isSelected
                                                    ? 'border-red-600 bg-red-600 text-white'
                                                    : isSelected
                                                    ? 'border-purple-600 bg-purple-600 text-white'
                                                    : 'border-slate-300 bg-white text-slate-600'
                                            }`}>
                                                {showExplanation && isCorrectOption ? '✓' : showExplanation && isSelected ? '✗' : String.fromCharCode(65 + idx)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-900">{option.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryBadgeColor(option.category)}`}>
                                                        {option.category.replace(/_/g, ' ')}
                                                    </span>
                                                    {option.topography && option.topography.length > 0 && (
                                                        <span className="text-xs text-slate-500">
                                                            {option.topography.slice(0, 2).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation */}
                        {showExplanation && (
                            <div className={`mt-6 p-6 rounded-xl border-2 ${
                                isCorrect 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-red-50 border-red-200'
                            }`}>
                                <div className="flex items-start gap-3 mb-3">
                                    {isCorrect ? (
                                        <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    <div>
                                        <h4 className={`text-lg font-bold mb-2 ${
                                            isCorrect ? 'text-green-900' : 'text-red-900'
                                        }`}>
                                            {isCorrect ? 'Correct!' : 'Incorrect'}
                                        </h4>
                                        <p className={`text-sm mb-3 ${
                                            isCorrect ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {question.explanation}
                                        </p>
                                        {question.pattern.key_features && (
                                            <div className="mt-3">
                                                <p className="text-sm font-semibold text-slate-900 mb-2">Key Features:</p>
                                                <ul className="text-sm text-slate-700 space-y-1">
                                                    {question.pattern.key_features.map((feature, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <span className="text-purple-600">•</span>
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 flex gap-3">
                            {!showExplanation ? (
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={!selectedAnswer}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Answer
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextQuestion}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                                >
                                    {currentQuestion < quizQuestions.length - 1 ? 'Next Question →' : 'View Results'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatternRecognitionQuiz;
