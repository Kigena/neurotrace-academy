import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import AchievementBadge from '../components/Gamification/AchievementBadge';
import ProgressBar from '../components/Gamification/ProgressBar';

const Achievements = () => {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [progress, setProgress] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked', or category
    const [loading, setLoading] = useState(true);
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [achievementsData, progressData] = await Promise.all([
                apiService.get('/gamification/achievements'),
                apiService.get('/gamification/progress')
            ]);
            
            setAchievements(achievementsData);
            setProgress(progressData);
        } catch (error) {
            console.error('Failed to load achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { key: 'all', label: 'All', icon: '🏆' },
        { key: 'unlocked', label: 'Unlocked', icon: '✅' },
        { key: 'locked', label: 'Locked', icon: '🔒' },
        { key: 'cases', label: 'Cases', icon: '📋' },
        { key: 'quizzes', label: 'Quizzes', icon: '📝' },
        { key: 'community', label: 'Community', icon: '💬' },
        { key: 'learning', label: 'Learning', icon: '📚' },
        { key: 'streak', label: 'Streaks', icon: '🔥' },
        { key: 'special', label: 'Special', icon: '⭐' }
    ];

    const filteredAchievements = achievements.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'unlocked') return a.unlocked;
        if (filter === 'locked') return !a.unlocked;
        return a.category === filter;
    });

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">🏆 Achievements</h1>
                <p className="text-slate-600">Unlock badges by completing challenges and milestones</p>
            </div>

            {/* Progress Overview */}
            {progress && (
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6 mb-8 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Level */}
                        <div>
                            <p className="text-indigo-200 text-sm font-medium mb-2">Your Level</p>
                            <ProgressBar 
                                level={progress.level}
                                xp={progress.xp}
                                xpToNextLevel={progress.xpToNextLevel}
                                showDetails={true}
                            />
                        </div>

                        {/* Achievements Progress */}
                        <div>
                            <p className="text-indigo-200 text-sm font-medium mb-3">Achievement Progress</p>
                            <div className="flex items-center gap-3">
                                <div className="text-4xl font-bold">{unlockedCount}</div>
                                <div className="text-indigo-200">/</div>
                                <div className="text-2xl font-semibold text-indigo-200">{totalCount}</div>
                            </div>
                            <p className="text-indigo-200 text-sm mt-1">{completionPercentage}% Complete</p>
                        </div>

                        {/* Streak */}
                        <div>
                            <p className="text-indigo-200 text-sm font-medium mb-3">Current Streak</p>
                            <div className="flex items-center gap-3">
                                <span className="text-5xl">🔥</span>
                                <div>
                                    <div className="text-4xl font-bold">{progress.streak?.current || 0}</div>
                                    <p className="text-indigo-200 text-sm">days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
                <div className="flex overflow-x-auto">
                    {categories.map((cat) => {
                        const count = cat.key === 'all' ? totalCount :
                                     cat.key === 'unlocked' ? unlockedCount :
                                     cat.key === 'locked' ? (totalCount - unlockedCount) :
                                     achievements.filter(a => a.category === cat.key).length;
                        
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setFilter(cat.key)}
                                className={`flex-shrink-0 px-6 py-3 font-medium transition-all border-b-4 ${
                                    filter === cat.key
                                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                                        : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{cat.icon}</span>
                                    <span className="text-sm font-bold">{cat.label}</span>
                                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                                        {count}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Achievements Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredAchievements.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-500">No achievements in this category</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {filteredAchievements.map((achievement) => (
                        <div key={achievement._id} className="flex flex-col items-center">
                            <AchievementBadge 
                                achievement={achievement}
                                unlocked={achievement.unlocked}
                                onClick={() => setSelectedAchievement(achievement)}
                            />
                            <p className="text-xs text-slate-700 font-medium text-center mt-2 px-1">
                                {achievement.name}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Achievement Detail Modal */}
            {selectedAchievement && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedAchievement(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedAchievement(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center">
                            {/* Large Badge */}
                            <div className="inline-block mb-4">
                                <div className={`w-32 h-32 rounded-2xl ${
                                    selectedAchievement.unlocked
                                        ? `bg-gradient-to-br ${
                                            selectedAchievement.tier === 'bronze' ? 'from-amber-600 to-amber-800' :
                                            selectedAchievement.tier === 'silver' ? 'from-slate-400 to-slate-600' :
                                            selectedAchievement.tier === 'gold' ? 'from-yellow-400 to-yellow-600' :
                                            'from-indigo-400 to-purple-600'
                                        }`
                                        : 'bg-slate-300'
                                } flex items-center justify-center shadow-xl border-4 ${
                                    selectedAchievement.unlocked ? 'border-yellow-300' : 'border-slate-400'
                                }`}>
                                    <span className="text-7xl">
                                        {selectedAchievement.unlocked ? selectedAchievement.icon : '🔒'}
                                    </span>
                                </div>
                            </div>

                            {/* Achievement Info */}
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                {selectedAchievement.name}
                            </h2>
                            <p className="text-slate-600 mb-4">
                                {selectedAchievement.description}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                    +{selectedAchievement.xpReward} XP
                                </span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold uppercase">
                                    {selectedAchievement.tier}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
                                    {selectedAchievement.category}
                                </span>
                            </div>

                            {/* Status */}
                            {selectedAchievement.unlocked ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-green-800 font-semibold text-sm">
                                        ✅ Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-amber-800 font-semibold text-sm">
                                        🔒 Keep going to unlock this achievement!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>
                
                <Link 
                    to="/leaderboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                    🏆 View Leaderboard
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default Achievements;
