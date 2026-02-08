import express from 'express';
import auth from '../middleware/auth.js';
import notificationService from '../services/notificationService.js';

const router = express.Router();

/**
 * Get user's notifications (paginated)
 */
router.get('/', auth, async (req, res) => {
    try {
        const { limit = 20, skip = 0, unreadOnly = false } = req.query;

        const result = await notificationService.getUserNotifications(
            req.user.id,
            {
                limit: parseInt(limit),
                skip: parseInt(skip),
                unreadOnly: unreadOnly === 'true'
            }
        );

        res.json(result);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

/**
 * Get unread count
 */
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user.id);
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

/**
 * Mark notification as read
 */
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(
            req.params.id,
            req.user.id
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

/**
 * Mark all notifications as read
 */
router.put('/mark-all-read', auth, async (req, res) => {
    try {
        const count = await notificationService.markAllAsRead(req.user.id);
        res.json({ count });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

/**
 * Delete notification
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        await notificationService.deleteNotification(req.params.id, req.user.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;
