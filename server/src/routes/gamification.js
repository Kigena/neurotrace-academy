import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import GamificationService from '../services/gamificationService.js';
import UserProgress from '../models/UserProgress.js';
import Achievement from '../models/Achievement.js';
import CommunityCase from '../models/CommunityCase.js';
import { QuizSession } from '../models/QuizSession.js';

const router = express.Router();

// Get user's gamification progress
router.get('/progress', auth, async (req, res) => {
    try {
        const progress = await GamificationService.getUserProgress(req.user.id);
        res.json(progress);
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Get all achievements (with user's unlock status)
router.get('/achievements', auth, async (req, res) => {
    try {
        const userProgress = await UserProgress.findOne({ userId: req.user.id });
        const allAchievements = await Achievement.find({ isActive: true }).sort({ order: 1, category: 1 });
        
        // Add unlock status to each achievement
        const achievementsWithStatus = allAchievements.map(achievement => {
            const unlocked = userProgress?.achievements.some(
                a => a.achievementId.toString() === achievement._id.toString()
            );
            const unlockedDate = userProgress?.achievements.find(
                a => a.achievementId.toString() === achievement._id.toString()
            )?.unlockedAt;
            
            return {
                ...achievement.toObject(),
                unlocked,
                unlockedAt: unlockedDate || null
            };
        });
        
        res.json(achievementsWithStatus);
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// Get leaderboard
router.get('/leaderboard/:type?', auth, async (req, res) => {
    try {
        const { type = 'overall' } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        
        const leaderboard = await GamificationService.getLeaderboard(type, limit);
        res.json(leaderboard);
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Claim an achievement (for manual claims)
router.post('/achievements/:id/claim', auth, async (req, res) => {
    try {
        const achievementId = req.params.id;
        const progress = await UserProgress.findOne({ userId: req.user.id });
        
        if (!progress) {
            return res.status(404).json({ error: 'User progress not found' });
        }
        
        // Check if already unlocked
        const alreadyUnlocked = progress.achievements.some(
            a => a.achievementId.toString() === achievementId
        );
        
        if (alreadyUnlocked) {
            return res.status(400).json({ error: 'Achievement already unlocked' });
        }
        
        // Unlock the achievement
        await progress.unlockAchievement(achievementId);
        await progress.save();
        
        res.json({ message: 'Achievement claimed successfully', progress });
    } catch (error) {
        console.error('Claim achievement error:', error);
        res.status(500).json({ error: 'Failed to claim achievement' });
    }
});

// Initialize default achievements (admin only, one-time setup)
router.post('/initialize-achievements', auth, async (req, res) => {
    try {
        // Optional: Check if user is admin
        // if (req.user.role !== 'admin') {
        //     return res.status(403).json({ error: 'Admin access required' });
        // }
        
        await GamificationService.initializeDefaultAchievements();
        res.json({ message: 'Achievements initialized successfully' });
    } catch (error) {
        console.error('Initialize achievements error:', error);
        res.status(500).json({ error: 'Failed to initialize achievements' });
    }
});

// Get user's activity history
router.get('/activity-history', auth, async (req, res) => {
    try {
        const progress = await UserProgress.findOne({ userId: req.user.id });
        
        if (!progress) {
            return res.json({ activities: [] });
        }
        
        // Get recent activities from activityLog
        const recentActivities = progress.activityLog
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50);
        
        res.json({ activities: recentActivities });
    } catch (error) {
        console.error('Get activity history error:', error);
        res.status(500).json({ error: 'Failed to fetch activity history' });
    }
});

// **NEW: Migrate existing user activities (one-time)**
router.post('/migrate-existing-activities', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        let totalXP = 0;
        const activities = [];
        
        console.log(`🔄 Starting migration for user ${userId}...`);
        console.log(`🔍 User ID type: ${typeof userId}`);
        console.log(`🔍 User object:`, req.user);
        
        // 1. Award XP for existing published cases
        // Convert userId to ObjectId for proper comparison
        const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
            ? new mongoose.Types.ObjectId(userId) 
            : userId;
        
        const userCases = await CommunityCase.find({ 
            author: userObjectId,
            status: 'published'
        });
        
        console.log(`📋 Found ${userCases.length} published cases for user ${userId}`);
        
        // Debug: Check all cases to see what authors exist
        const allCases = await CommunityCase.find({ status: 'published' }).select('author title').limit(10);
        console.log(`🔍 Sample of all published cases:`, allCases.map(c => ({ 
            title: c.title, 
            author: c.author?.toString() 
        })));
        
        for (const caseItem of userCases) {
            // Award 50 XP for sharing + 25 XP bonus for being approved
            const xpForCase = 75; // 50 + 25 bonus
            await GamificationService.awardXP(userId, xpForCase, 'case_share', {
                caseId: caseItem._id.toString(),
                title: caseItem.title,
                retroactive: true
            });
            totalXP += xpForCase;
            activities.push({
                type: 'case_share',
                xp: xpForCase,
                caseTitle: caseItem.title
            });
        }
        
        // 2. Award XP for existing comments
        const casesWithComments = await CommunityCase.find({
            'comments.userId': userObjectId
        });
        
        let commentCount = 0;
        
        for (const caseItem of casesWithComments) {
            const userComments = caseItem.comments.filter(
                c => c.userId && c.userId.toString() === userId && !c.isAI
            );
            commentCount += userComments.length;
        }
        
        console.log(`💬 Found ${commentCount} comments from user ${userId}`);
        
        if (commentCount > 0) {
            const xpForComments = commentCount * 10; // 10 XP per comment
            await GamificationService.awardXP(userId, xpForComments, 'comment_post', {
                count: commentCount,
                retroactive: true
            });
            totalXP += xpForComments;
            activities.push({
                type: 'comments',
                xp: xpForComments,
                count: commentCount
            });
        }
        
        // 3. Award XP for completed quizzes
        const completedQuizzes = await QuizSession.find({
            userId: userId, // QuizSession stores userId as string
            endTime: { $ne: null } // Only completed quizzes
        });
        
        console.log(`📝 Found ${completedQuizzes.length} completed quizzes for user ${userId}`);
        
        // Debug: Check sample of quiz sessions
        const sampleQuizzes = await QuizSession.find({ endTime: { $ne: null } }).select('userId').limit(5);
        console.log(`🔍 Sample quiz userIds:`, sampleQuizzes.map(q => q.userId));
        
        for (const quiz of completedQuizzes) {
            if (quiz.answers && quiz.answers.size > 0) {
                // Calculate score from answers
                const answers = Array.from(quiz.answers.values());
                const correct = answers.filter(a => a.isCorrect).length;
                const total = answers.length;
                const percent = total > 0 ? (correct / total) * 100 : 0;
                
                // XP calculation based on score percentage
                let xpReward = 0;
                let activityType = 'quiz_completion';
                
                if (percent === 100) {
                    xpReward = 100; // Perfect score bonus
                    activityType = 'quiz_perfect';
                } else if (percent >= 90) {
                    xpReward = 80;
                } else if (percent >= 80) {
                    xpReward = 60;
                } else if (percent >= 70) {
                    xpReward = 40;
                } else if (percent >= 60) {
                    xpReward = 30;
                } else {
                    xpReward = 20; // Participation XP
                }
                
                await GamificationService.awardXP(userId, xpReward, activityType, {
                    sessionId: quiz.sessionId,
                    mode: quiz.mode,
                    score: { correct, total, percent },
                    retroactive: true
                });
                
                totalXP += xpReward;
                activities.push({
                    type: 'quiz',
                    xp: xpReward,
                    score: `${correct}/${total} (${Math.round(percent)}%)`
                });
            }
        }
        
        // 4. Check achievements after migration
        const progress = await UserProgress.findOne({ userId });
        await GamificationService.checkAchievements(userId, progress);
        
        console.log(`✅ Migration complete! Total XP awarded: ${totalXP}`);
        
        // Fetch updated progress to return
        const updatedProgress = await UserProgress.findOne({ userId });
        
        res.json({
            message: 'Migration successful',
            totalXPAwarded: totalXP,
            activities,
            casesCount: userCases.length,
            commentsCount: commentCount,
            quizzesCount: completedQuizzes.length,
            newLevel: updatedProgress?.level || 1,
            totalXP: updatedProgress?.xp || 0,
            debug: {
                userId,
                userObjectId: userObjectId.toString(),
                sampleCases: allCases.slice(0, 3).map(c => ({
                    title: c.title,
                    author: c.author.toString()
                }))
            }
        });
    } catch (error) {
        console.error('❌ Migration error:', error);
        res.status(500).json({ error: 'Failed to migrate activities', details: error.message });
    }
});

export default router;
