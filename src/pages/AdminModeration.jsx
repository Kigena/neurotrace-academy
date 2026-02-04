import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const AdminModeration = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // View state
    const [activeTab, setActiveTab] = useState('cases'); // 'cases' or 'users'
    
    // Cases state
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'pending', 'all', 'rejected'
    const [selectedCase, setSelectedCase] = useState(null);
    const [moderationNotes, setModerationNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    
    // Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [stats, setStats] = useState({ totalUsers: 0, adminUsers: 0, regularUsers: 0 });

    // Check if user is admin
    useEffect(() => {
        if (!user?.role || user.role !== 'admin') {
            alert('⛔ Access Denied: Admin privileges required');
            navigate('/');
        }
    }, [user, navigate]);

    // Fetch cases for moderation
    useEffect(() => {
        if (activeTab === 'cases') {
            fetchCases();
        }
    }, [filter, activeTab]);

    // Fetch users when switching to users tab
    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
            fetchStats();
        }
    }, [activeTab]);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const data = await apiService.get('/cases/moderation', { status: filter });
            setCases(data);
        } catch (error) {
            console.error('Failed to fetch cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const data = await apiService.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            alert(`❌ Failed to fetch users: ${error.message}`);
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await apiService.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleRoleChange = async (userId, newRole, userName) => {
        const action = newRole === 'admin' ? 'promote' : 'demote';
        const confirmMsg = `${action === 'promote' ? '👑' : '👤'} Are you sure you want to ${action} ${userName} to ${newRole}?`;
        
        if (!window.confirm(confirmMsg)) return;

        try {
            const response = await apiService.put(`/admin/users/${userId}/role`, { role: newRole });
            alert(`✅ ${response.message}`);
            fetchUsers();
            fetchStats();
        } catch (error) {
            alert(`❌ Failed to update role: ${error.message}`);
        }
    };

    const handleApprove = async (caseId) => {
        if (!window.confirm('Approve this case for publication?')) return;
        
        setProcessing(true);
        try {
            await apiService.put(`/cases/${caseId}/moderate`, {
                status: 'published',
                moderationNotes
            });
            alert('✅ Case approved and published!');
            setModerationNotes('');
            setSelectedCase(null);
            fetchCases();
        } catch (error) {
            alert(`❌ Failed to approve case: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (caseId) => {
        if (!moderationNotes.trim()) {
            alert('⚠️ Please provide rejection notes explaining why the case cannot be published.');
            return;
        }

        if (!window.confirm('Reject this case? The submitter will see your notes.')) return;
        
        setProcessing(true);
        try {
            await apiService.put(`/cases/${caseId}/moderate`, {
                status: 'rejected',
                moderationNotes
            });
            alert('❌ Case rejected. Submitter will be notified.');
            setModerationNotes('');
            setSelectedCase(null);
            fetchCases();
        } catch (error) {
            alert(`❌ Failed to reject case: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const viewCaseDetail = (caseItem) => {
        setSelectedCase(caseItem);
        setModerationNotes(caseItem.moderationNotes || '');
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
                <p className="text-slate-600">Manage cases and user permissions</p>
            </div>

            {/* Main Tabs: Cases vs Users */}
            <div className="flex gap-4 mb-6 border-b-2 border-slate-200">
                <button
                    onClick={() => {
                        setActiveTab('cases');
                        setSelectedCase(null);
                    }}
                    className={`px-6 py-3 font-semibold transition-all border-b-2 -mb-0.5 ${
                        activeTab === 'cases'
                            ? 'text-purple-600 border-purple-600'
                            : 'text-slate-500 border-transparent hover:text-slate-700'
                    }`}
                >
                    📋 Case Moderation
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 font-semibold transition-all border-b-2 -mb-0.5 ${
                        activeTab === 'users'
                            ? 'text-purple-600 border-purple-600'
                            : 'text-slate-500 border-transparent hover:text-slate-700'
                    }`}
                >
                    👥 User Management
                </button>
            </div>

            {/* Cases Tab Content */}
            {activeTab === 'cases' && (
                <>
                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-slate-200">
                {[
                    { key: 'pending', label: 'Pending Review', color: 'text-amber-600' },
                    { key: 'all', label: 'All Cases', color: 'text-slate-600' },
                    { key: 'rejected', label: 'Rejected', color: 'text-red-600' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                            filter === tab.key
                                ? `${tab.color} border-current`
                                : 'text-slate-400 border-transparent hover:text-slate-600'
                        }`}
                    >
                        {tab.label}
                        {filter === tab.key && (
                            <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                                {cases.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Cases Grid */}
            {!selectedCase ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {cases.length === 0 ? (
                        <div className="col-span-2 text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-slate-500">No cases to review</p>
                        </div>
                    ) : (
                        cases.map((caseItem) => (
                            <div
                                key={caseItem._id}
                                className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => viewCaseDetail(caseItem)}
                            >
                                {/* Status Badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                        caseItem.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                        caseItem.status === 'published' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {caseItem.status.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {new Date(caseItem.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="font-bold text-slate-900 mb-2">{caseItem.title}</h3>
                                
                                <div className="text-sm text-slate-600 space-y-1 mb-3">
                                    <p><strong>Submitted by:</strong> {caseItem.author?.name || 'Unknown'}</p>
                                    <p><strong>Patient:</strong> {caseItem.patientInfo?.age} {caseItem.patientInfo?.ageUnit}, {caseItem.patientInfo?.gender || 'Not specified'}</p>
                                    <p className="line-clamp-2"><strong>History:</strong> {caseItem.history.substring(0, 100)}...</p>
                                </div>

                                {caseItem.attachments?.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        {caseItem.attachments.length} attachment(s)
                                    </div>
                                )}

                                <button className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium">
                                    Review Case →
                                </button>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* Case Detail View */
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <button
                        onClick={() => setSelectedCase(null)}
                        className="mb-4 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                        ← Back to list
                    </button>

                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold text-slate-900">{selectedCase.title}</h2>
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                    selectedCase.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                    selectedCase.status === 'published' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {selectedCase.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600">
                                Submitted by <strong>{selectedCase.author?.name}</strong> on {new Date(selectedCase.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Patient Info - CHECK FOR PHI */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Check for PHI - Patient Information
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><strong>Age:</strong> {selectedCase.patientInfo?.age} {selectedCase.patientInfo?.ageUnit}</div>
                                <div><strong>Gender:</strong> {selectedCase.patientInfo?.gender || 'Not specified'}</div>
                                <div className="col-span-2"><strong>History:</strong> {selectedCase.history}</div>
                                {selectedCase.medications?.length > 0 && (
                                    <div className="col-span-2"><strong>Medications:</strong> {selectedCase.medications.join(', ')}</div>
                                )}
                            </div>
                        </div>

                        {/* EEG Findings */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <h3 className="font-bold text-slate-900 mb-3">EEG Findings</h3>
                            <div className="space-y-2 text-sm">
                                <div><strong>Background:</strong> {selectedCase.findings?.background || 'Not specified'}</div>
                                <div><strong>Interictal:</strong> {selectedCase.findings?.interictal || 'None'}</div>
                                <div><strong>Ictal:</strong> {selectedCase.findings?.ictal || 'None'}</div>
                            </div>
                        </div>

                        {/* Attachments - CHECK FOR PHI IN IMAGES */}
                        {selectedCase.attachments?.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Review Attachments for PHI
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedCase.attachments.map((att, idx) => (
                                        <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                                            {att.type === 'image' ? (
                                                <img
                                                    src={att.url.startsWith('http') ? att.url : `${apiService.getBaseUrl()}${att.url}`}
                                                    alt={att.filename}
                                                    className="w-full h-auto object-contain max-h-[300px]"
                                                />
                                            ) : (
                                                <div className="p-4 text-center">
                                                    <p className="text-sm text-slate-600">{att.filename}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-amber-800 mt-2">
                                    ⚠️ Verify: No patient names, dates, facility names, or MRNs visible in image headers
                                </p>
                            </div>
                        )}

                        {/* Moderation Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">
                                Moderation Notes {selectedCase.status === 'pending' && '(required for rejection)'}
                            </label>
                            <textarea
                                value={moderationNotes}
                                onChange={(e) => setModerationNotes(e.target.value)}
                                placeholder="Enter notes about de-identification issues, reasons for rejection, or general feedback..."
                                className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                            />
                        </div>

                        {/* Actions */}
                        {selectedCase.status === 'pending' && (
                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={() => handleReject(selectedCase._id)}
                                    disabled={processing}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Processing...' : '❌ Reject Case'}
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedCase._id)}
                                    disabled={processing}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Processing...' : '✅ Approve & Publish'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
                </>
            )}

            {/* Users Tab Content */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Total Users</p>
                                    <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
                                </div>
                                <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Admin Users</p>
                                    <p className="text-3xl font-bold text-purple-900">{stats.adminUsers}</p>
                                </div>
                                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Regular Users</p>
                                    <p className="text-3xl font-bold text-green-900">{stats.regularUsers}</p>
                                </div>
                                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900">User Management</h2>
                            <p className="text-sm text-slate-600">Promote users to admin or demote admins to regular users</p>
                        </div>

                        {usersLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {users.map((userItem) => (
                                            <tr key={userItem._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                                                            {userItem.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{userItem.name}</p>
                                                            {userItem._id === user.id && (
                                                                <span className="text-xs text-purple-600 font-semibold">(You)</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{userItem.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        userItem.role === 'admin'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {userItem.role === 'admin' ? '👑 Admin' : '👤 User'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {new Date(userItem.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {userItem._id === user.id ? (
                                                        <span className="text-xs text-slate-400 italic">Cannot change own role</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRoleChange(
                                                                userItem._id,
                                                                userItem.role === 'admin' ? 'user' : 'admin',
                                                                userItem.name
                                                            )}
                                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                                userItem.role === 'admin'
                                                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                                            }`}
                                                        >
                                                            {userItem.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-900">
                                <p className="font-semibold mb-1">About User Roles:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Admin:</strong> Can moderate cases, manage users, and access admin dashboard</li>
                                    <li><strong>User:</strong> Can submit cases, view approved cases, and use all learning features</li>
                                    <li>You cannot change your own role - ask another admin to modify your permissions</li>
                                    <li>Role changes take effect immediately (user may need to log out/in to see UI changes)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminModeration;
