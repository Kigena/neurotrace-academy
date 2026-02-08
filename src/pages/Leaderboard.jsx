import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboardType, setLeaderboardType] = useState('overall');
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);

    const leaderboardTypes = [
        { key: 'overall', label: 'Overall', icon: '🏆', description: 'By Level & XP' },
        { key: 'streak', label: 'Streak', icon: '🔥', description: 'By Current Streak' },
        { key: 'cases', label: 'Cases', icon: '📋', description: 'By Cases Shared' },
        { key: 'quizzes', label: 'Quizzes', icon: '📝', description: 'By Quizzes Completed' },
        { key: 'community', label: 'Community', icon: '💬', description: 'By Comments Posted' }
    ];

    useEffect(() => {
        fetchLeaderboard();
    }, [leaderboardType]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await apiService.get(`/gamification/leaderboard/${leaderboardType}`);
            setLeaderboard(data.leaderboard || []);
            setUserRank(data.userRank);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    const getStatValue = (entry) => {
        switch (leaderboardType) {
            case 'streak':
                return `${entry.streak} days`;
            case 'cases':
                return `${entry.stats?.casesApproved || 0} cases`;
            case 'quizzes':
                return `${entry.stats?.quizzesCompleted || 0} quizzes`;
            case 'community':
                return `${entry.stats?.commentsPosted || 0} comments`;
            default:
                return `Level ${entry.level} • ${entry.xp} XP`;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">🏆 Leaderboard</h1>
                <p className="text-slate-600">See how you rank among the community</p>
            </div>

            {/* Your Rank Card */}
            {userRank && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium mb-1">Your Rank</p>
                            <div className="flex items-center gap-3">
                                <span className="text-5xl font-bold">#{userRank.overall || '—'}</span>
                                <div>
                                    <p className="text-xl font-bold">{user?.name}</p>
                                    <p className="text-indigo-200 text-sm">Keep climbing!</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-6xl">
                            {userRank.overall <= 3 ? '🌟' : '💪'}
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Type Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
                <div className="flex overflow-x-auto">
                    {leaderboardTypes.map((type) => (
                        <button
                            key={type.key}
                            onClick={() => setLeaderboardType(type.key)}
                            className={`flex-1 min-w-[120px] px-4 py-4 text-center transition-all ${leaderboardType === type.key
                                    ? 'bg-indigo-50 border-b-4 border-indigo-600'
                                    : 'bg-white hover:bg-slate-50 border-b-4 border-transparent'
                                }`}
                        >
                            <div className="text-2xl mb-1">{type.icon}</div>
                            <div className={`font-bold text-sm ${leaderboardType === type.key ? 'text-indigo-900' : 'text-slate-700'
                                }`}>
                                {type.label}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">
                                {type.description}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No data available yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {leaderboard.map((entry, index) => {
                            const isCurrentUser = entry.userId === user?.id;

                            return (
                                <div
                                    key={entry.userId}
                                    className={`flex items-center gap-4 p-4 transition-colors ${isCurrentUser ? 'bg-indigo-50' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className={`w-12 text-center font-bold text-lg ${entry.rank <= 3 ? 'text-2xl' : 'text-slate-600'
                                        }`}>
                                        {getRankBadge(entry.rank)}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`font-bold text-slate-900 truncate ${isCurrentUser ? 'text-indigo-900' : ''
                                                }`}>
                                                {entry.userName}
                                                {isCurrentUser && (
                                                    <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                                                        YOU
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            {getStatValue(entry)}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="text-right">
                                        <div className="flex items-center gap-3">
                                            {leaderboardType === 'overall' && (
                                                <>
                                                    <div className="text-center">
                                                        <p className="text-xs text-slate-500">Level</p>
                                                        <p className="font-bold text-indigo-600 text-lg">{entry.level}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-slate-500">XP</p>
                                                        <p className="font-bold text-slate-700">{entry.xp}</p>
                                                    </div>
                                                </>
                                            )}
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500">Badges</p>
                                                <p className="font-bold text-yellow-600">{entry.achievements}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">How Rankings Work</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                            <li>Complete quizzes, share cases, and engage with the community to earn XP</li>
                            <li>Level up by earning enough XP - higher levels give you better rankings</li>
                            <li>Maintain daily streaks to climb the Streak leaderboard</li>
                            <li>Rankings update in real-time as users earn XP and complete activities</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
