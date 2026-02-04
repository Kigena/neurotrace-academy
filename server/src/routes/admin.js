import express from 'express';
import { User } from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Get all users (Admin only)
router.get('/users', auth, requireAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('-passwordHash') // Exclude password hash
            .sort({ createdAt: -1 });
        
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user role (Admin only)
router.put('/users/:userId/role', auth, requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const { userId } = req.params;

        // Validate role
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
        }

        // Prevent admins from demoting themselves
        if (userId === req.user.id && role === 'user') {
            return res.status(400).json({ 
                error: 'You cannot demote yourself. Ask another admin to change your role.' 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Return user without password hash
        const userObj = user.toObject();
        delete userObj.passwordHash;

        console.log(`✅ Admin ${req.user.email} changed ${user.email} role: ${oldRole} → ${role}`);

        res.json({
            success: true,
            user: userObj,
            message: `User ${user.name} is now ${role === 'admin' ? 'an admin' : 'a regular user'}`
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Get admin activity stats (Admin only)
router.get('/stats', auth, requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const regularUsers = totalUsers - adminUsers;

        res.json({
            totalUsers,
            adminUsers,
            regularUsers,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
