import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import caseService from '../services/caseService';
import useGamification from '../hooks/useGamification';

const CaseDiscussion = ({ caseId, comments = [], onCommentAdded }) => {
    const navigate = useNavigate();
    const { checkProgress } = useGamification();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [selectedForReconcile, setSelectedForReconcile] = useState([]);
    const [showReconcileMode, setShowReconcileMode] = useState(false);
    const [isRequestingAI, setIsRequestingAI] = useState(false);

    const isLoggedIn = !!localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const updatedComments = await caseService.addComment(caseId, newComment.trim(), replyTo);
            setNewComment('');
            setReplyTo(null);
            
            // Check for gamification progress after posting comment
            await checkProgress();
            
            if (onCommentAdded) {
                onCommentAdded(updatedComments);
            }
        } catch (err) {
            console.error('Failed to post comment:', err);
            setError(err.message || 'Failed to post comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRequestStructure = async () => {
        setIsRequestingAI(true);
        setError(null);
        try {
            const updatedComments = await caseService.requestStructure(caseId);
            if (onCommentAdded) {
                onCommentAdded(updatedComments);
            }
        } catch (err) {
            console.error('Failed to request structure:', err);
            setError('Failed to generate structure. Please try again.');
        } finally {
            setIsRequestingAI(false);
        }
    };

    const handleRequestReconciliation = async () => {
        if (selectedForReconcile.length < 2) {
            setError('Please select at least 2 comments to reconcile');
            return;
        }

        setIsRequestingAI(true);
        setError(null);
        try {
            const updatedComments = await caseService.requestReconciliation(caseId, selectedForReconcile);
            if (onCommentAdded) {
                onCommentAdded(updatedComments);
            }
            setSelectedForReconcile([]);
            setShowReconcileMode(false);
        } catch (err) {
            console.error('Failed to request reconciliation:', err);
            setError('Failed to generate reconciliation. Please try again.');
        } finally {
            setIsRequestingAI(false);
        }
    };

    const toggleReconcileSelection = (commentId) => {
        setSelectedForReconcile(prev => 
            prev.includes(commentId) 
                ? prev.filter(id => id !== commentId)
                : [...prev, commentId]
        );
    };

    const insertAIMention = () => {
        setNewComment(prev => prev + '@Neurotrace ');
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment? This cannot be undone.')) {
            return;
        }

        setError(null);
        try {
            const updatedComments = await caseService.deleteComment(caseId, commentId);
            if (onCommentAdded) {
                onCommentAdded(updatedComments);
            }
        } catch (err) {
            console.error('Failed to delete comment:', err);
            setError('Failed to delete comment. Please try again.');
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                    Discussion ({comments.filter(c => !c.isAI).length})
                </h3>
                
                {/* AI Tools */}
                {isLoggedIn && comments.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowReconcileMode(!showReconcileMode)}
                            className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                            disabled={isRequestingAI}
                        >
                            {showReconcileMode ? 'Cancel' : '🔄 Reconcile Views'}
                        </button>
                        <button
                            onClick={handleRequestStructure}
                            className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                            disabled={isRequestingAI}
                        >
                            📋 Structure Discussion
                        </button>
                    </div>
                )}
            </div>

            {/* Reconcile Mode Banner */}
            {showReconcileMode && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-900">
                                Select 2+ comments to reconcile
                            </p>
                            <p className="text-xs text-purple-700 mt-0.5">
                                AI will analyze different viewpoints and explain the decisive features
                            </p>
                        </div>
                        <button
                            onClick={handleRequestReconciliation}
                            disabled={selectedForReconcile.length < 2 || isRequestingAI}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isRequestingAI ? 'Analyzing...' : `Reconcile (${selectedForReconcile.length})`}
                        </button>
                    </div>
                </div>
            )}

            {/* Comment List */}
            <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">
                        No comments yet. Be the first to share your thoughts!
                    </p>
                ) : (
                    comments.map((comment, idx) => {
                        const isAI = comment.isAI;
                        const isSelected = selectedForReconcile.includes(comment._id);
                        
                        return (
                            <div 
                                key={comment._id || idx} 
                                className={`flex gap-3 pb-4 border-b border-slate-100 last:border-0 ${
                                    isAI ? 'bg-gradient-to-r from-indigo-50 to-purple-50 -mx-3 px-3 py-3 rounded-lg' : ''
                                } ${isSelected ? 'ring-2 ring-purple-400 rounded-lg p-2' : ''}`}
                            >
                                {/* Selection Checkbox (Reconcile Mode) */}
                                {showReconcileMode && !isAI && (
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleReconcileSelection(comment._id)}
                                        className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                )}

                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {isAI ? (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                            AI
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                            {comment.userId?.name?.[0]?.toUpperCase() || comment.userId?.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>

                                {/* Comment Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className={`font-medium text-sm ${isAI ? 'text-indigo-900' : 'text-slate-900'}`}>
                                            {isAI ? (
                                                <>
                                                    <span className="inline-flex items-center gap-1">
                                                        NeuroTrace AI
                                                        {comment.aiType === 'reconciliation' && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-purple-600 text-white rounded">Reconciliation</span>
                                                        )}
                                                        {comment.aiType === 'structure' && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-indigo-600 text-white rounded">Structure</span>
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                comment.userId?.name || comment.userId?.username || 'Anonymous'
                                            )}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {formatTimestamp(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isAI ? 'text-slate-800' : 'text-slate-700'}`}>
                                        {comment.content}
                                    </p>
                                    
                                    {/* Action Buttons */}
                                    {!isAI && isLoggedIn && !showReconcileMode && (
                                        <div className="mt-2 flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setReplyTo(comment._id);
                                                    setNewComment(`@${comment.userId?.name || 'User'} `);
                                                }}
                                                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                                            >
                                                Reply
                                            </button>
                                            {comment.userId?._id === currentUser.id && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                                                    title="Delete comment"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Comment Input */}
            {isLoggedIn ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    {replyTo && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                            <span>Replying to comment</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setReplyTo(null);
                                    setNewComment('');
                                }}
                                className="text-red-600 hover:text-red-800 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                    
                    <div className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts, insights, or questions about this case... (Use @Neurotrace to ask AI)"
                            className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none resize-none"
                            rows="3"
                            maxLength={500}
                            disabled={isSubmitting}
                        />
                        <button
                            type="button"
                            onClick={insertAIMention}
                            className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
                            title="Mention AI for help"
                        >
                            @AI
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">
                                {newComment.length}/500
                            </span>
                            {newComment.includes('@Neurotrace') || newComment.includes('@AI') ? (
                                <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                    </svg>
                                    AI will respond
                                </span>
                            ) : null}
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !newComment.trim()}
                            className="px-4 py-2 bg-purple-700 text-white text-sm font-medium rounded-lg hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                </form>
            ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <p className="text-slate-600 text-sm mb-2">
                        Please log in to join the discussion
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-purple-700 text-sm font-medium hover:underline"
                    >
                        Log in →
                    </button>
                </div>
            )}
        </div>
    );
};

export default CaseDiscussion;
