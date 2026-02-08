import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemNotifications } from '../contexts/SystemNotificationContext';

const Notifications = () => {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useSystemNotifications();
    const [filter, setFilter] = useState('all'); // 'all', 'unread', or notification type
    const navigate = useNavigate();

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification._id);
        }
        navigate(notification.link);
    };

    const handleDelete = async (e, notificationId) => {
        e.stopPropagation();
        await deleteNotification(notificationId);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'comment': return '💬';
            case 'reply': return '↩️';
            case 'case_status': return '📋';
            case 'achievement': return '🏆';
            case 'level_up': return '🎉';
            case 'mention': return '@';
            default: return '🔔';
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return new Date(date).toLocaleDateString();
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    const filterOptions = [
        { value: 'all', label: 'All', icon: '📬' },
        { value: 'unread', label: 'Unread', icon: '🔴' },
        { value: 'comment', label: 'Comments', icon: '💬' },
        { value: 'case_status', label: 'Cases', icon: '📋' },
        { value: 'achievement', label: 'Achievements', icon: '🏆' },
        { value: 'level_up', label: 'Level Ups', icon: '🎉' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                    <p className="text-gray-600">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex gap-2 flex-wrap">
                            {filterOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setFilter(option.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === option.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <span className="mr-2">{option.icon}</span>
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-2">
                    {loading ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-600">
                                {filter === 'unread'
                                    ? "You're all caught up!"
                                    : `No ${filter === 'all' ? '' : filter} notifications yet`}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`bg-white rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-md transition-all ${!notification.read ? 'border-l-4 border-indigo-600' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        <span className="text-3xl">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-gray-700 mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {getTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {!notification.read && (
                                                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                                                )}
                                                <button
                                                    onClick={(e) => handleDelete(e, notification._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    aria-label="Delete notification"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
