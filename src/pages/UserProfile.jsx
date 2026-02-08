import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../services/apiService';

function UserProfile() {
    const { userId } = useParams();
    const [profile, setProfile] = useState(null);
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const [profileData, activityData] = await Promise.all([
                apiService.get(`/profile/${userId}`),
                apiService.get(`/profile/${userId}/activity`)
            ]);
            setProfile(profileData);
            setActivity(activityData);
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError(err.response?.data?.error || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
                <p className="text-red-700">{error}</p>
                <Link to="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
                    ← Back to Home
                </Link>
            </div>
        );
    }

    const { user, stats } = profile;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {user.profile?.avatar ? (
                            <img
                                src={user.profile.avatar}
                                alt={user.name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-indigo-100">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                            {user.role === 'admin' && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                                    Admin
                                </span>
                            )}
                        </div>

                        {user.profile?.bio && (
                            <p className="text-slate-700 mb-4">{user.profile.bio}</p>
                        )}

                        {/* Location & Institution */}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                            {user.profile?.location && (
                                <div className="flex items-center gap-1">
                                    <span>📍 {user.profile.location}</span>
                                </div>
                            )}
                            {user.profile?.institution && (
                                <div className="flex items-center gap-1">
                                    <span>🏥 {user.profile.institution}</span>
                                </div>
                            )}
                        </div>

                        {/* Specializations */}
                        {user.profile?.specializations?.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs font-medium text-slate-500 mb-2">SPECIALIZATIONS</p>
                                <div className="flex flex-wrap gap-2">
                                    {user.profile.specializations.map((spec, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Dashboard */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Activity Dashboard</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{stats.level}</div>
                        <div className="text-sm text-slate-600 mt-1">Level</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600">{stats.xp}</div>
                        <div className="text-sm text-slate-600 mt-1">Total XP</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-orange-600">{stats.streak}</div>
                        <div className="text-sm text-slate-600 mt-1">Day Streak</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{stats.achievements}</div>
                        <div className="text-sm text-slate-600 mt-1">Achievements</div>
                    </div>
                </div>
            </div>

            {/* Portfolio */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Portfolio</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cases */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Cases Shared ({stats.casesShared})</h3>
                        {activity?.cases?.length > 0 ? (
                            <div className="space-y-3">
                                {activity.cases.slice(0, 5).map((caseItem) => (
                                    <Link
                                        key={caseItem._id}
                                        to={`/cases/${caseItem._id}`}
                                        className="block p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                    >
                                        <h4 className="font-medium text-slate-900">{caseItem.title}</h4>
                                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{caseItem.description}</p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm">No cases shared yet</p>
                        )}
                    </div>

                    {/* Quiz Stats */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Quiz Performance</h3>
                        <div className="space-y-3">
                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                <div className="text-2xl font-bold text-blue-600">{stats.quizzesCompleted}</div>
                                <div className="text-sm text-slate-600">Quizzes Completed</div>
                            </div>
                            {activity?.quizStats && (
                                <>
                                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                        <div className="text-2xl font-bold text-green-600">{activity.quizStats.accuracy}%</div>
                                        <div className="text-sm text-slate-600">Overall Accuracy</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                                        <div className="text-2xl font-bold text-purple-600">{activity.quizStats.totalQuestions}</div>
                                        <div className="text-sm text-slate-600">Questions Answered</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Member Since */}
            <div className="text-center text-sm text-slate-500">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
        </div>
    );
}

export default UserProfile;
