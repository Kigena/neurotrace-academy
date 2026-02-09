import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import abretQuestionsData from '../data/abret-questions.json';

/**
 * NeuroLinea Certification Exam
 * Comprehensive timed assessment covering all EEG domains
 * 120-minute exam with realistic testing conditions
 */

const CertificationExam = () => {
    const navigate = useNavigate();
    const [examState, setExamState] = useState('intro'); // 'intro' | 'exam' | 'results'
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState(new Set());
    const [timeRemaining, setTimeRemaining] = useState(120 * 60); // 120 minutes in seconds
    const [examQuestions, setExamQuestions] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const timerRef = useRef(null);

    // Generate exam questions on mount
    useEffect(() => {
        if (examState === 'intro') {
            generateExamQuestions();
        }
    }, []);

    // Timer countdown
    useEffect(() => {
        if (examState === 'exam' && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        submitExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timerRef.current);
        }
    }, [examState, timeRemaining]);

    const generateExamQuestions = () => {
        const allQuestions = abretQuestionsData.questions || [];

        // Distribute questions across domains
        const domainQuestions = {
            'domain-1': [],
            'domain-2': [],
            'domain-3': [],
            'domain-4': []
        };

        allQuestions.forEach(q => {
            if (domainQuestions[q.domainId]) {
                domainQuestions[q.domainId].push(q);
            }
        });

        // Select questions: aim for 100 total (realistic exam length)
        // Distribution: Domain 1 (25), Domain 2 (35), Domain 3 (25), Domain 4 (15)
        const selectedQuestions = [
            ...shuffle(domainQuestions['domain-1']).slice(0, 25),
            ...shuffle(domainQuestions['domain-2']).slice(0, 35),
            ...shuffle(domainQuestions['domain-3']).slice(0, 25),
            ...shuffle(domainQuestions['domain-4']).slice(0, 15)
        ];

        // Shuffle the final order
        setExamQuestions(shuffle(selectedQuestions));
    };

    const shuffle = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const startExam = () => {
        setStartTime(Date.now());
        setExamState('exam');
        // Prevent page unload
        window.onbeforeunload = () => "Are you sure you want to leave? Your exam progress will be lost.";
    };

    const selectAnswer = (questionId, optionIndex) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const toggleFlag = (questionId) => {
        setFlagged(prev => {
            const newFlagged = new Set(prev);
            if (newFlagged.has(questionId)) {
                newFlagged.delete(questionId);
            } else {
                newFlagged.add(questionId);
            }
            return newFlagged;
        });
    };

    const submitExam = () => {
        clearInterval(timerRef.current);
        window.onbeforeunload = null;
        setExamState('results');
        calculateResults();
    };

    const calculateResults = () => {
        let correct = 0;
        const domainScores = {
            'domain-1': { correct: 0, total: 0 },
            'domain-2': { correct: 0, total: 0 },
            'domain-3': { correct: 0, total: 0 },
            'domain-4': { correct: 0, total: 0 }
        };

        examQuestions.forEach(q => {
            const userAnswer = answers[q.id];
            const correctAnswer = q.options.findIndex(opt => opt.isCorrect);

            if (userAnswer === correctAnswer) {
                correct++;
                domainScores[q.domainId].correct++;
            }
            domainScores[q.domainId].total++;
        });

        return {
            totalCorrect: correct,
            totalQuestions: examQuestions.length,
            percentage: ((correct / examQuestions.length) * 100).toFixed(1),
            timeSpent: 120 * 60 - timeRemaining,
            domainScores
        };
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return hours > 0
            ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            : `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Intro Screen
    if (examState === 'intro') {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white mb-8">
                    <h1 className="text-3xl font-bold mb-2">NeuroLinea Certification Exam</h1>
                    <p className="text-purple-100">Comprehensive EEG Technologist Assessment</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Exam Overview</h2>
                        <div className="space-y-3 text-slate-700">
                            <p><strong>Duration:</strong> 120 minutes (2 hours)</p>
                            <p><strong>Questions:</strong> {examQuestions.length} multiple-choice questions</p>
                            <p><strong>Format:</strong> All domains covered comprehensively</p>
                            <p><strong>Passing Score:</strong> 70% or higher recommended</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Content Distribution</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                <span className="font-medium">Domain I: Pre-Study Procedures</span>
                                <span className="text-blue-700">~25%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                <span className="font-medium">Domain II: Performing the EEG Study</span>
                                <span className="text-green-700">~35%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                                <span className="font-medium">Domain III: Post-Study Procedures</span>
                                <span className="text-orange-700">~25%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                                <span className="font-medium">Domain IV: Ethics & Professional Issues</span>
                                <span className="text-purple-700">~15%</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Exam Instructions</h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Answer all questions to the best of your ability</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>You can flag questions for review and navigate between questions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>The timer will countdown automatically - manage your time wisely</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>The exam will auto-submit when time expires</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-600 mt-1">✗</span>
                                <span>Do not refresh or close the browser during the exam</span>
                            </li>
                        </ul>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div className="text-sm text-yellow-800">
                                    <p className="font-semibold mb-1">Important Notice</p>
                                    <p>Once you start, the 120-minute timer begins immediately. Make sure you have a quiet environment and stable internet connection before proceeding.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/quiz')}
                                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={startExam}
                                disabled={examQuestions.length === 0}
                                className="flex-1 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Start Certification Exam →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Exam Screen
    if (examState === 'exam') {
        const question = examQuestions[currentQuestion];
        const progress = ((currentQuestion + 1) / examQuestions.length) * 100;
        const answeredCount = Object.keys(answers).length;
        const isTimeWarning = timeRemaining < 10 * 60; // Last 10 minutes

        return (
            <div className="min-h-screen bg-slate-50">
                {/* Header with Timer */}
                <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">NeuroLinea Certification Exam</h1>
                                <p className="text-sm text-slate-600">
                                    Question {currentQuestion + 1} of {examQuestions.length}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Time Remaining</p>
                                    <p className={`text-2xl font-mono font-bold ${isTimeWarning ? 'text-red-600' : 'text-slate-900'}`}>
                                        {formatTime(timeRemaining)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowExitConfirm(true)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                                >
                                    Submit Exam
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                                {answeredCount} of {examQuestions.length} answered • {flagged.size} flagged
                            </p>
                        </div>
                    </div>
                </div>

                {/* Question Content */}
                <div className="max-w-4xl mx-auto p-6">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                        {question.domainId.replace('domain-', 'Domain ')}
                                    </span>
                                    {question.section && (
                                        <span className="text-sm text-slate-600">{question.section}</span>
                                    )}
                                </div>
                                <h2 className="text-xl font-semibold text-slate-900 leading-relaxed">
                                    {question.question}
                                </h2>
                            </div>
                            <button
                                onClick={() => toggleFlag(question.id)}
                                className={`ml-4 p-2 rounded-lg transition-colors ${flagged.has(question.id)
                                        ? 'bg-yellow-100 text-yellow-600'
                                        : 'bg-slate-100 text-slate-400 hover:text-yellow-600'
                                    }`}
                                title={flagged.has(question.id) ? 'Unflag' : 'Flag for review'}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
                                </svg>
                            </button>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            {question.options.map((option, index) => {
                                const isSelected = answers[question.id] === index;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => selectAnswer(question.id, index)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${isSelected
                                                ? 'border-purple-600 bg-purple-50'
                                                : 'border-slate-200 hover:border-purple-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                                                    ? 'border-purple-600 bg-purple-600'
                                                    : 'border-slate-300'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="flex-1 text-slate-900">{option.text}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                            <button
                                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                disabled={currentQuestion === 0}
                                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ← Previous
                            </button>

                            <div className="text-sm text-slate-600">
                                {answers[question.id] !== undefined ? '✓ Answered' : 'Not answered'}
                            </div>

                            <button
                                onClick={() => {
                                    if (currentQuestion < examQuestions.length - 1) {
                                        setCurrentQuestion(currentQuestion + 1);
                                    } else {
                                        setShowExitConfirm(true);
                                    }
                                }}
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                            >
                                {currentQuestion === examQuestions.length - 1 ? 'Review & Submit' : 'Next →'}
                            </button>
                        </div>
                    </div>

                    {/* Question Navigator */}
                    <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">Question Navigator</h3>
                        <div className="grid grid-cols-10 gap-2">
                            {examQuestions.map((q, index) => {
                                const isAnswered = answers[q.id] !== undefined;
                                const isFlagged = flagged.has(q.id);
                                const isCurrent = index === currentQuestion;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`relative aspect-square rounded-lg text-sm font-medium transition-all ${isCurrent
                                                ? 'bg-purple-600 text-white ring-2 ring-purple-600 ring-offset-2'
                                                : isAnswered
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {index + 1}
                                        {isFlagged && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-purple-600 rounded" />
                                <span>Current</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded" />
                                <span>Not Answered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                                <span>Flagged</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Confirmation Modal */}
                {showExitConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Submit Exam?</h3>
                            <div className="space-y-3 mb-6 text-sm text-slate-700">
                                <p>Are you sure you want to submit your exam?</p>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <p className="font-semibold mb-2">Exam Summary:</p>
                                    <ul className="space-y-1">
                                        <li>• Total Questions: {examQuestions.length}</li>
                                        <li>• Answered: {answeredCount}</li>
                                        <li>• Flagged: {flagged.size}</li>
                                        <li>• Time Remaining: {formatTime(timeRemaining)}</li>
                                    </ul>
                                </div>
                                {answeredCount < examQuestions.length && (
                                    <p className="text-amber-600 font-medium">
                                        ⚠️ You have {examQuestions.length - answeredCount} unanswered question(s).
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowExitConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                                >
                                    Continue Exam
                                </button>
                                <button
                                    onClick={submitExam}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                >
                                    Submit Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Results Screen
    if (examState === 'results') {
        const results = calculateResults();
        const passed = results.percentage >= 70;
        const domainNames = {
            'domain-1': 'Pre-Study Procedures',
            'domain-2': 'Performing the EEG Study',
            'domain-3': 'Post-Study Procedures',
            'domain-4': 'Ethics & Professional Issues'
        };

        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className={`rounded-xl p-8 text-white mb-8 ${passed ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-orange-600 to-red-600'}`}>
                    <div className="text-center">
                        <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
                        <h1 className="text-3xl font-bold mb-2">
                            {passed ? 'Congratulations!' : 'Keep Practicing!'}
                        </h1>
                        <p className="text-xl opacity-90">
                            {passed
                                ? 'You passed the NeuroLinea Certification Exam!'
                                : 'You\'re on the right track - keep studying!'}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
                    {/* Overall Score */}
                    <div className="text-center pb-8 border-b border-slate-200">
                        <p className="text-sm text-slate-600 mb-2">Your Score</p>
                        <div className="text-6xl font-bold text-slate-900 mb-2">
                            {results.percentage}%
                        </div>
                        <p className="text-lg text-slate-600">
                            {results.totalCorrect} out of {results.totalQuestions} correct
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-600">
                            <div>Time Spent: {formatTime(results.timeSpent)}</div>
                            <div>•</div>
                            <div>Passing Score: 70%</div>
                        </div>
                    </div>

                    {/* Domain Breakdown */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Performance by Domain</h2>
                        <div className="space-y-4">
                            {Object.entries(results.domainScores).map(([domainId, scores]) => {
                                const percentage = scores.total > 0 ? ((scores.correct / scores.total) * 100).toFixed(1) : 0;
                                const isStrong = percentage >= 75;

                                return (
                                    <div key={domainId} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-900">
                                                Domain {domainId.replace('domain-', '')}: {domainNames[domainId]}
                                            </span>
                                            <span className={`font-bold ${isStrong ? 'text-green-600' : 'text-amber-600'}`}>
                                                {percentage}%
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${isStrong ? 'bg-green-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-slate-600 w-20 text-right">
                                                {scores.correct}/{scores.total}
                                            </span>
                                        </div>
                                        {!isStrong && (
                                            <p className="text-xs text-amber-600 mt-2">
                                                💡 Consider reviewing this domain for improvement
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-3">Next Steps</h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            {passed ? (
                                <>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>Excellent work! You've demonstrated strong competency across all domains.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>Continue practicing with domain-specific quizzes to maintain your skills.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>Review challenging patterns and cases to further enhance your expertise.</span>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-600 mt-0.5">•</span>
                                        <span>Focus on domains where you scored below 70% - review the material and practice more questions.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-600 mt-0.5">•</span>
                                        <span>Study EEG patterns, workflow procedures, and professional standards in depth.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-amber-600 mt-0.5">•</span>
                                        <span>Retake the exam in a few days after focused studying.</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 border-t border-slate-200">
                        <button
                            onClick={() => navigate('/quiz')}
                            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                        >
                            Back to Quiz Hub
                        </button>
                        <button
                            onClick={() => {
                                setExamState('intro');
                                setCurrentQuestion(0);
                                setAnswers({});
                                setFlagged(new Set());
                                setTimeRemaining(120 * 60);
                                generateExamQuestions();
                            }}
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                        >
                            Retake Exam
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default CertificationExam;
