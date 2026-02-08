import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import GamificationService from '../services/gamificationService.js';
import UserProgress from '../models/UserProgress.js';
import Achievement from '../models/Achievement.js';
import CommunityCase from '../models/CommunityCase.js';
import { QuizSession } from '../models/QuizSession.js';
import { User } from '../models/User.js';

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
        const userProgress = await UserProgress.findOne({ user: req.user.id });
        const allAchievements = await Achievement.find({ isActive: true }).sort({ order: 1, category: 1 });
        
        // Add unlock status to each achievement
        // UserProgress uses 'unlockedAchievements' field
        const achievementsWithStatus = allAchievements.map(achievement => {
            const unlocked = userProgress?.unlockedAchievements?.some(
                a => a.achievement.toString() === achievement._id.toString()
            );
            const unlockedData = userProgress?.unlockedAchievements?.find(
                a => a.achievement.toString() === achievement._id.toString()
            );
            
            return {
                ...achievement.toObject(),
                unlocked: !!unlocked,
                unlockedAt: unlockedData?.unlockedAt || null
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

// Claim an achievement (for manual claims)
router.post('/achievements/:id/claim', auth, async (req, res) => {
    try {
        const achievementId = req.params.id;
        const progress = await UserProgress.findOne({ user: req.user.id });
        
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
        const progress = await UserProgress.findOne({ user: req.user.id });
        
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

// **DEBUG ENDPOINT: Check what's in the database**
router.get('/debug-migration', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('🔍 DEBUG: User ID from auth:', userId);
        console.log('🔍 DEBUG: User ID type:', typeof userId);
        
        // Try multiple query formats
        const allCases = await CommunityCase.find({ status: 'published' }).lean();
        console.log('🔍 DEBUG: Total published cases:', allCases.length);
        
        // Try direct string comparison
        const casesStringMatch = allCases.filter(c => c.author.toString() === userId);
        console.log('🔍 DEBUG: Cases with string match:', casesStringMatch.length);
        
        // Try ObjectId comparison
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const casesObjectIdMatch = allCases.filter(c => c.author.toString() === userObjectId.toString());
        console.log('🔍 DEBUG: Cases with ObjectId match:', casesObjectIdMatch.length);
        
        // Try using .equals()
        const casesEqualsMatch = allCases.filter(c => {
            const authorId = mongoose.Types.ObjectId.isValid(c.author) 
                ? new mongoose.Types.ObjectId(c.author) 
                : c.author;
            return authorId.equals(userObjectId);
        });
        console.log('🔍 DEBUG: Cases with .equals() match:', casesEqualsMatch.length);
        
        res.json({
            userId,
            userIdType: typeof userId,
            userObjectId: userObjectId.toString(),
            totalPublishedCases: allCases.length,
            casesStringMatch: casesStringMatch.length,
            casesObjectIdMatch: casesObjectIdMatch.length,
            casesEqualsMatch: casesEqualsMatch.length,
            sampleCases: allCases.slice(0, 3).map(c => ({
                title: c.title,
                author: c.author.toString(),
                authorType: typeof c.author,
                matches: c.author.toString() === userId
            })),
            yourCases: casesStringMatch.map(c => ({
                title: c.title,
                status: c.status
            }))
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: error.message });
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
        
        // Verify the user exists in the database
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const userExists = await User.findById(userObjectId);
        if (!userExists) {
            console.error(`❌ User ${userId} not found in database!`);
            return res.status(404).json({ 
                error: 'User not found in database',
                userId,
                suggestion: 'User might have been deleted or ID is incorrect'
            });
        }
        console.log(`✅ User exists in database:`, userExists.name);
        
        // FIRST: Ensure UserProgress exists for this user
        // UserProgress uses 'user' field (ObjectId), not 'userId'
        let progress = await UserProgress.findOne({ user: userObjectId });
        
        if (!progress) {
            console.log(`📝 Creating new UserProgress for user ${userId}...`);
            try {
                progress = new UserProgress({
                    user: userObjectId,  // Use 'user' field, not 'userId'
                    xp: 0,
                    level: 1
                });
                await progress.save();
                console.log(`✅ UserProgress created successfully:`, progress._id);
            } catch (createError) {
                console.error(`❌ Failed to create UserProgress:`, createError);
                return res.status(500).json({ 
                    error: 'Failed to create user progress',
                    details: createError.message,
                    userId,
                    userObjectId: userObjectId.toString()
                });
            }
        } else {
            console.log(`✅ UserProgress already exists:`, progress._id);
        }
        
        // 1. Award XP for existing published cases
        // Get all published cases first
        const allPublishedCases = await CommunityCase.find({ status: 'published' }).lean();
        console.log(`📋 Total published cases in DB: ${allPublishedCases.length}`);
        
        // Filter for user's cases using string comparison (most reliable)
        const userCases = allPublishedCases.filter(c => c.author.toString() === userId);
        console.log(`📋 Found ${userCases.length} published cases for user ${userId}`);
        
        // Debug: Show all case authors
        console.log(`🔍 All case authors:`, allPublishedCases.map(c => c.author.toString()));
        console.log(`🔍 Looking for:`, userId);
        
        for (const caseItem of userCases) {
            // These cases are already published, so award XP for both share and approval
            // Award 50 XP for sharing
            await GamificationService.awardXP(userId, 50, 'case_share', {
                caseId: caseItem._id.toString(),
                title: caseItem.title,
                retroactive: true
            });
            
            // Award 25 XP bonus for being approved (updates casesApproved stat)
            await GamificationService.awardXP(userId, 25, 'case_approved', {
                caseId: caseItem._id.toString(),
                title: caseItem.title,
                retroactive: true
            });
            
            const xpForCase = 75; // Total
            totalXP += xpForCase;
            activities.push({
                type: 'case_published',
                xp: xpForCase,
                caseTitle: caseItem.title
            });
        }
        
        // 2. Award XP for existing comments
        const casesWithComments = await CommunityCase.find({}).lean();
        
        let commentCount = 0;
        
        for (const caseItem of casesWithComments) {
            if (caseItem.comments) {
                const userComments = caseItem.comments.filter(
                    c => c.userId && c.userId.toString() === userId && !c.isAI
                );
                commentCount += userComments.length;
            }
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
        }).lean();
        
        console.log(`📝 Found ${completedQuizzes.length} completed quizzes for user ${userId}`);
        
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
        
        // 4. Reload progress and check achievements after migration
        progress = await UserProgress.findOne({ user: userObjectId });
        
        if (progress) {
            await GamificationService.checkAchievements(userId, progress);
            console.log(`✅ Migration complete! Total XP awarded: ${totalXP}`);
        } else {
            console.error(`❌ UserProgress not found after migration!`);
        }
        
        // Fetch final updated progress to return
        const updatedProgress = await UserProgress.findOne({ user: userObjectId });
        
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
                totalPublishedCases: allPublishedCases.length,
                userCasesFound: userCases.length,
                allCaseAuthors: allPublishedCases.map(c => c.author.toString()),
                matchingCases: userCases.map(c => ({
                    title: c.title,
                    author: c.author.toString()
                }))
            }
        });
    } catch (error) {
        console.error('❌ Migration error:', error);
        res.status(500).json({ error: 'Failed to migrate activities', details: error.message, stack: error.stack });
    }
});

// **FIX STATS: Update stat counters without awarding duplicate XP**
router.post('/fix-stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        console.log(`🔧 Fixing stats for user ${userId}...`);
        
        // Get user progress
        const progress = await UserProgress.findOne({ user: userObjectId });
        
        if (!progress) {
            return res.status(404).json({ error: 'UserProgress not found' });
        }
        
        console.log('📊 Current stats:', progress.stats);
        
        // Count actual activities
        const userCases = await CommunityCase.find({ 
            author: userObjectId,
            status: 'published'
        }).lean();
        
        const casesWithComments = await CommunityCase.find({}).lean();
        let commentCount = 0;
        for (const caseItem of casesWithComments) {
            if (caseItem.comments) {
                const userComments = caseItem.comments.filter(
                    c => c.userId && c.userId.toString() === userId && !c.isAI
                );
                commentCount += userComments.length;
            }
        }
        
        const completedQuizzes = await QuizSession.find({
            userId: userId,
            endTime: { $ne: null }
        }).lean();
        
        let perfectQuizzes = 0;
        for (const quiz of completedQuizzes) {
            if (quiz.answers && quiz.answers.size > 0) {
                const answers = Array.from(quiz.answers.values());
                const correct = answers.filter(a => a.isCorrect).length;
                const total = answers.length;
                if (total > 0 && correct === total) {
                    perfectQuizzes++;
                }
            }
        }
        
        console.log(`📋 Found: ${userCases.length} cases, ${commentCount} comments, ${completedQuizzes.length} quizzes (${perfectQuizzes} perfect)`);
        
        // Update stats (WITHOUT awarding XP)
        progress.stats.casesShared = userCases.length;
        progress.stats.casesApproved = userCases.length; // All published cases are approved
        progress.stats.commentsPosted = commentCount;
        progress.stats.quizzesCompleted = completedQuizzes.length;
        progress.stats.perfectScores = perfectQuizzes;
        
        await progress.save();
        
        console.log('✅ Stats updated:', progress.stats);
        
        res.json({
            message: 'Stats fixed successfully',
            stats: progress.stats,
            found: {
                cases: userCases.length,
                comments: commentCount,
                quizzes: completedQuizzes.length,
                perfectQuizzes
            }
        });
    } catch (error) {
        console.error('❌ Fix stats error:', error);
        res.status(500).json({ error: 'Failed to fix stats', details: error.message });
    }
});

// **RECALCULATE XP: Calculate correct XP from stats and set it**
router.post('/recalculate-xp', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        console.log(`🔧 Recalculating XP for user ${userId}...`);
        
        const progress = await UserProgress.findOne({ user: userObjectId });
        
        if (!progress) {
            return res.status(404).json({ error: 'UserProgress not found' });
        }
        
        const oldXP = progress.xp;
        const oldLevel = progress.level;
        
        console.log('📊 Current progress:', {
            level: oldLevel,
            xp: oldXP,
            stats: progress.stats
        });
        
        // Calculate expected XP based on stats
        let calculatedXP = 0;
        
        // Cases: 50 XP per share + 25 XP per approval
        calculatedXP += (progress.stats.casesShared * 50);
        calculatedXP += (progress.stats.casesApproved * 25);
        console.log(`📋 Cases: ${progress.stats.casesShared} shared (${progress.stats.casesShared * 50} XP) + ${progress.stats.casesApproved} approved (${progress.stats.casesApproved * 25} XP)`);
        
        // Comments: 10 XP each
        calculatedXP += (progress.stats.commentsPosted * 10);
        console.log(`💬 Comments: ${progress.stats.commentsPosted} × 10 = ${progress.stats.commentsPosted * 10} XP`);
        
        // Quizzes: Average 50 XP per quiz (since we don't have exact scores)
        // But if they have perfect scores, count those as 100 XP
        const regularQuizzes = progress.stats.quizzesCompleted - progress.stats.perfectScores;
        calculatedXP += (regularQuizzes * 50); // Average for non-perfect
        calculatedXP += (progress.stats.perfectScores * 100); // Perfect scores
        console.log(`📝 Quizzes: ${regularQuizzes} regular (${regularQuizzes * 50} XP) + ${progress.stats.perfectScores} perfect (${progress.stats.perfectScores * 100} XP)`);
        
        // Achievement bonuses (estimate ~50 XP per achievement unlocked)
        const achievementBonus = progress.unlockedAchievements.length * 50;
        calculatedXP += achievementBonus;
        console.log(`🏅 Achievement bonuses: ${progress.unlockedAchievements.length} × 50 = ${achievementBonus} XP`);
        
        console.log(`\n💰 Total Calculated XP: ${calculatedXP}`);
        console.log(`📊 Current XP in DB: ${oldXP}`);
        console.log(`📈 Difference: ${calculatedXP - oldXP}`);
        
        // Recalculate level based on XP
        let newLevel = 1;
        let xpForNextLevel = 100;
        let remainingXP = calculatedXP;
        
        while (remainingXP >= xpForNextLevel) {
            remainingXP -= xpForNextLevel;
            newLevel++;
            xpForNextLevel = newLevel * 100;
        }
        
        console.log(`🎮 Calculated Level: ${newLevel}`);
        console.log(`📈 XP to Next Level: ${xpForNextLevel}`);
        
        // DIRECT database update using findByIdAndUpdate to bypass model methods
        const updated = await UserProgress.findByIdAndUpdate(
            progress._id,
            {
                $set: {
                    xp: calculatedXP,
                    level: newLevel,
                    xpToNextLevel: xpForNextLevel
                }
            },
            { new: true } // Return updated document
        );
        
        console.log(`✅ XP forcefully updated! Level ${oldLevel} → ${newLevel}, XP ${oldXP} → ${calculatedXP}`);
        console.log('✅ Updated document:', {
            _id: updated._id,
            level: updated.level,
            xp: updated.xp,
            xpToNextLevel: updated.xpToNextLevel
        });
        
        res.json({
            message: 'XP recalculated and updated successfully',
            oldXP,
            newXP: calculatedXP,
            oldLevel,
            newLevel,
            stats: updated.stats,
            achievements: updated.unlockedAchievements.length,
            breakdown: {
                casesXP: (progress.stats.casesShared * 50) + (progress.stats.casesApproved * 25),
                commentsXP: progress.stats.commentsPosted * 10,
                quizzesXP: (regularQuizzes * 50) + (progress.stats.perfectScores * 100),
                achievementBonusXP: achievementBonus
            }
        });
    } catch (error) {
        console.error('❌ Recalculate XP error:', error);
        res.status(500).json({ error: 'Failed to recalculate XP', details: error.message, stack: error.stack });
    }
});

export default router;
