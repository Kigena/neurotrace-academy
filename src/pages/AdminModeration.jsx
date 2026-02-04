import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const AdminModeration = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'pending', 'all', 'rejected'
    const [selectedCase, setSelectedCase] = useState(null);
    const [moderationNotes, setModerationNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    // Check if user is admin
    useEffect(() => {
        if (!user?.role || user.role !== 'admin') {
            alert('⛔ Access Denied: Admin privileges required');
            navigate('/');
        }
    }, [user, navigate]);

    // Fetch cases for moderation
    useEffect(() => {
        fetchCases();
    }, [filter]);

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
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Case Moderation Dashboard</h1>
                <p className="text-slate-600">Review submitted cases for HIPAA compliance and de-identification</p>
            </div>

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
        </div>
    );
};

export default AdminModeration;
