import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import caseService from '../services/caseService';

const CaseDiscussion = ({ caseId, comments = [], onCommentAdded }) => {
    const navigate = useNavigate();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isLoggedIn = !!localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const comment = await caseService.addComment(caseId, newComment.trim());
            setNewComment('');
            if (onCommentAdded) {
                onCommentAdded(comment);
            }
        } catch (err) {
            console.error('Failed to post comment:', err);
            setError(err.message || 'Failed to post comment. Please try again.');
        } finally {
            setIsSubmitting(false);
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
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Discussion ({comments.length})
            </h3>

            {/* Comment List */}
            <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">
                        No comments yet. Be the first to share your thoughts!
                    </p>
                ) : (
                    comments.map((comment, idx) => (
                        <div key={comment._id || idx} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {comment.userId?.name?.[0]?.toUpperCase() || comment.userId?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            </div>

                            {/* Comment Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-medium text-slate-900 text-sm">
                                        {comment.userId?.name || comment.userId?.username || 'Anonymous'}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {formatTimestamp(comment.createdAt)}
                                    </span>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Comment Input */}
            {isLoggedIn ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts, insights, or questions about this case..."
                        className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none resize-none"
                        rows="3"
                        maxLength={500}
                        disabled={isSubmitting}
                    />

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            {newComment.length}/500 characters
                        </span>
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
