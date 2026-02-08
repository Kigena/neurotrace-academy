import express from 'express';
import auth from '../middleware/auth.js';
import GamificationService from '../services/gamificationService.js';
import UserProgress from '../models/UserProgress.js';
import Achievement from '../models/Achievement.js';

const router = express.Router();

// Get user's progress and achievements
router.get('/progress', auth, async (req, res) => {
    try {
        const progress = await GamificationService.getUserProgress(req.user.id);
        res.json(progress);
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Get all available achievements
router.get('/achievements', auth, async (req, res) => {
    try {
        const achievements = await Achievement.find({ isActive: true })
            .sort({ category: 1, order: 1 });
        
        // Get user's unlocked achievements
        const userProgress = await UserProgress.findOne({ user: req.user.id });
        const unlockedIds = userProgress 
            ? userProgress.unlockedAchievements.map(a => a.achievement.toString())
            : [];
        
        const achievementsWithStatus = achievements.map(a => ({
            ...a.toObject(),
            unlocked: unlockedIds.includes(a._id.toString())
        }));
        
        res.json(achievementsWithStatus);
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// Get leaderboard
router.get('/leaderboard/:type?', auth, async (req, res) => {
    try {
        const type = req.params.type || 'overall';
        const limit = parseInt(req.query.limit) || 50;
        
        const leaderboard = await GamificationService.getLeaderboard(type, limit);
        
        // Get current user's rank
        const userRank = await GamificationService.getUserRank(req.user.id);
        
        res.json({
            leaderboard,
            userRank
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Get user's rank
router.get('/rank', auth, async (req, res) => {
    try {
        const rank = await GamificationService.getUserRank(req.user.id);
        res.json(rank);
    } catch (error) {
        console.error('Get rank error:', error);
        res.status(500).json({ error: 'Failed to fetch rank' });
    }
});

// Claim achievement (mark as viewed)
router.post('/achievements/:id/claim', auth, async (req, res) => {
    try {
        const userProgress = await UserProgress.findOne({ user: req.user.id });
        
        if (!userProgress) {
            return res.status(404).json({ error: 'Progress not found' });
        }
        
        const achievement = userProgress.unlockedAchievements.find(
            a => a.achievement.toString() === req.params.id
        );
        
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not unlocked' });
        }
        
        achievement.claimed = true;
        await userProgress.save();
        
        res.json({ success: true, message: 'Achievement claimed' });
    } catch (error) {
        console.error('Claim achievement error:', error);
        res.status(500).json({ error: 'Failed to claim achievement' });
    }
});

// Manual XP award (admin only - for testing or special events)
router.post('/award-xp', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const { userId, xp, reason } = req.body;
        
        if (!userId || !xp) {
            return res.status(400).json({ error: 'userId and xp are required' });
        }
        
        const result = await GamificationService.awardXP(
            userId, 
            xp, 
            'admin_award', 
            { reason }
        );
        
        res.json(result);
    } catch (error) {
        console.error('Award XP error:', error);
        res.status(500).json({ error: 'Failed to award XP' });
    }
});

// Initialize achievements (admin only)
router.post('/initialize-achievements', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        await GamificationService.initializeDefaultAchievements();
        
        res.json({ success: true, message: 'Achievements initialized' });
    } catch (error) {
        console.error('Initialize achievements error:', error);
        res.status(500).json({ error: 'Failed to initialize achievements' });
    }
});

// Get activity history (for contribution graph)
router.get('/activity-history', auth, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 365;
        
        const userProgress = await UserProgress.findOne({ user: req.user.id });
        
        if (!userProgress) {
            return res.json({ activityHistory: [] });
        }
        
        // Get recent activity
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentActivity = userProgress.activityHistory.filter(
            a => new Date(a.date) >= cutoffDate
        );
        
        res.json({ activityHistory: recentActivity });
    } catch (error) {
        console.error('Get activity history error:', error);
        res.status(500).json({ error: 'Failed to fetch activity history' });
    }
});

export default router;
