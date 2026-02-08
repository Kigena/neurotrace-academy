import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';
import { useSocket } from './SocketContext';

const SystemNotificationContext = createContext();

export const useSystemNotifications = () => {
    const context = useContext(SystemNotificationContext);
    if (!context) {
        throw new Error('useSystemNotifications must be used within SystemNotificationProvider');
    }
    return context;
};

export const SystemNotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Load notifications on mount
    useEffect(() => {
        if (user) {
            loadNotifications();
            loadUnreadCount();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    // Setup Socket.io listener for real-time notifications
    useEffect(() => {
        if (!user || !socket) return;

        const handleNotification = (notification) => {
            console.log('📬 New notification received:', notification);

            // Add to notifications list
            setNotifications(prev => [notification, ...prev]);

            // Increment unread count
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            showToast(notification);
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [user, socket]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const result = await apiService.get('/notifications?limit=50');
            setNotifications(result.notifications || []);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const result = await apiService.get('/notifications/unread-count');
            setUnreadCount(result.count || 0);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await apiService.put(`/notifications/${notificationId}/read`);

            // Update local state
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
            );

            // Decrement unread count
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiService.put('/notifications/mark-all-read');

            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await apiService.delete(`/notifications/${notificationId}`);

            // Update local state
            const notification = notifications.find(n => n._id === notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));

            // Decrement unread count if notification was unread
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const showToast = (notification) => {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 24px;">${getNotificationIcon(notification.type)}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${notification.title}</div>
                    <div style="font-size: 14px; color: #666;">${notification.message}</div>
                </div>
            </div>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 16px;
            max-width: 350px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            cursor: pointer;
            border-left: 4px solid #4F46E5;
        `;

        document.body.appendChild(toast);

        // Click to navigate
        toast.addEventListener('click', () => {
            window.location.href = notification.link;
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
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

    const value = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications: loadNotifications
    };

    return (
        <SystemNotificationContext.Provider value={value}>
            {children}
        </SystemNotificationContext.Provider>
    );
};
