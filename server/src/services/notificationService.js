import Notification from '../models/Notification.js';
import { getIO } from '../socket.js';

class NotificationService {
    /**
     * Create and send a notification
     */
    async createNotification({ userId, type, title, message, link, metadata = {} }) {
        try {
            // Create notification
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                link,
                metadata
            });

            // Send real-time notification via Socket.io
            this.sendRealtime(userId.toString(), notification);

            // Cleanup old notifications (async, don't wait)
            Notification.cleanupOldNotifications(userId).catch(err =>
                console.error('Cleanup error:', err)
            );

            return notification;
        } catch (error) {
            console.error('Create notification error:', error);
            throw error;
        }
    }

    /**
     * Send real-time notification via Socket.io
     */
    sendRealtime(userId, notification) {
        try {
            const io = getIO();
            if (io) {
                io.to(userId).emit('notification', {
                    _id: notification._id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    link: notification.link,
                    read: notification.read,
                    metadata: notification.metadata,
                    createdAt: notification.createdAt
                });
            }
        } catch (error) {
            console.error('Send realtime notification error:', error);
        }
    }

    /**
     * Get user's notifications (paginated)
     */
    async getUserNotifications(userId, { limit = 20, skip = 0, unreadOnly = false } = {}) {
        try {
            const query = { userId };
            if (unreadOnly) {
                query.read = false;
            }

            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .lean();

            const total = await Notification.countDocuments(query);

            return {
                notifications,
                total,
                hasMore: skip + notifications.length < total
            };
        } catch (error) {
            console.error('Get notifications error:', error);
            throw error;
        }
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId) {
        try {
            return await Notification.countDocuments({ userId, read: false });
        } catch (error) {
            console.error('Get unread count error:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId },
                { read: true },
                { new: true }
            );
            return notification;
        } catch (error) {
            console.error('Mark as read error:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { userId, read: false },
                { read: true }
            );
            return result.modifiedCount;
        } catch (error) {
            console.error('Mark all as read error:', error);
            throw error;
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId, userId) {
        try {
            await Notification.findOneAndDelete({ _id: notificationId, userId });
            return true;
        } catch (error) {
            console.error('Delete notification error:', error);
            throw error;
        }
    }

    /**
     * Helper: Create case comment notification
     */
    async notifyCaseComment({ caseId, caseTitle, caseAuthorId, commenterName }) {
        if (!caseAuthorId) return;

        return this.createNotification({
            userId: caseAuthorId,
            type: 'comment',
            title: 'New comment on your case',
            message: `${commenterName} commented on "${caseTitle}"`,
            link: `/cases/${caseId}`,
            metadata: { caseId, commenterName }
        });
    }

    /**
     * Helper: Create comment reply notification
     */
    async notifyCommentReply({ caseId, commentId, originalCommentAuthorId, replierName }) {
        if (!originalCommentAuthorId) return;

        return this.createNotification({
            userId: originalCommentAuthorId,
            type: 'reply',
            title: 'New reply to your comment',
            message: `${replierName} replied to your comment`,
            link: `/cases/${caseId}#comment-${commentId}`,
            metadata: { caseId, commentId, replierName }
        });
    }

    /**
     * Helper: Create case status notification
     */
    async notifyCaseStatus({ caseId, caseTitle, caseAuthorId, status, moderationNotes }) {
        if (!caseAuthorId) return;

        const statusText = status === 'published' ? 'approved' : 'rejected';

        return this.createNotification({
            userId: caseAuthorId,
            type: 'case_status',
            title: `Case ${statusText}`,
            message: `Your case "${caseTitle}" was ${statusText}${moderationNotes ? ': ' + moderationNotes : ''}`,
            link: `/cases/${caseId}`,
            metadata: { caseId, status, moderationNotes }
        });
    }

    /**
     * Helper: Create achievement unlock notification
     */
    async notifyAchievement({ userId, achievementName, achievementIcon }) {
        return this.createNotification({
            userId,
            type: 'achievement',
            title: 'Achievement Unlocked! 🏆',
            message: `You earned "${achievementName}"`,
            link: '/achievements',
            metadata: { achievementName, achievementIcon }
        });
    }

    /**
     * Helper: Create level up notification
     */
    async notifyLevelUp({ userId, newLevel }) {
        return this.createNotification({
            userId,
            type: 'level_up',
            title: 'Level Up! 🎉',
            message: `You reached Level ${newLevel}!`,
            link: '/progress',
            metadata: { newLevel }
        });
    }

    /**
     * Helper: Create chat message notification
     */
    async notifyChatMessage({ recipientId, senderName, messagePreview, chatType = 'private' }) {
        if (!recipientId) return;

        const title = chatType === 'private'
            ? `New message from ${senderName}`
            : `New message in ${chatType} chat`;

        return this.createNotification({
            userId: recipientId,
            type: 'message',
            title,
            message: messagePreview.substring(0, 100),
            link: '/chat',
            metadata: { senderName, chatType }
        });
    }
}

export default new NotificationService();
