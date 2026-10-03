import mongoose from 'mongoose';
import Achievement from '../models/Achievement.js';
import UserProgress from '../models/UserProgress.js';
import { QuizSession } from '../models/QuizSession.js';
import CommunityCase from '../models/CommunityCase.js';
import notificationService from './notificationService.js';

// A "perfect" quiz must be a real quiz, not a 1-question session.
export const PERFECT_MIN_QUESTIONS = 10;
const STUDY_ID = /^[A-Za-z0-9_-]{1,80}$/;
const STUDY_KINDS = { pattern: 'patterns', syndrome: 'syndromes' };

class GamificationService {
    // XP rewards for different actions
    static XP_REWARDS = {
        QUIZ_COMPLETE: 10,
        QUIZ_PERFECT: 25,
        CASE_SHARE: 25,
        CASE_APPROVED: 50,
        CASE_HELPFUL_VOTE: 5,
        COMMENT_POST: 10,
        COMMENT_HELPFUL: 10,
        PATTERN_STUDY: 2,
        SYNDROME_STUDY: 3,
        VIDEO_WATCH: 5,
        RESOURCE_DOWNLOAD: 2,
        DAILY_LOGIN: 5,
        WEEKLY_CHALLENGE: 100
    };

    /**
     * Award XP to a user and check for achievements
     */
    static async awardXP(userId, xpAmount, activityType, metadata = {}) {
        try {
            // Get or create user progress
            let progress = await UserProgress.findOne({ user: userId });

            if (!progress) {
                progress = new UserProgress({ user: userId });
            }

            // Update streak
            const streakUpdate = progress.updateStreak();

            // Add XP and check for level up
            const levelUpdate = progress.addXP(xpAmount, activityType);

            // Update relevant stats based on activity type
            await this.updateStats(progress, activityType, metadata);

            // Save progress
            await progress.save();

            // Check for newly unlocked achievements
            const newAchievements = await this.checkAchievements(userId, progress);

            // Send notifications for level-ups
            if (levelUpdate.levelsGained.length > 0) {
                const newLevel = levelUpdate.levelsGained[levelUpdate.levelsGained.length - 1];
                await notificationService.notifyLevelUp({
                    userId,
                    newLevel
                }).catch(err => console.error('Level-up notification error:', err));
            }

            // Send notifications for new achievements
            for (const achievement of newAchievements) {
                await notificationService.notifyAchievement({
                    userId,
                    achievementName: achievement.name,
                    achievementIcon: achievement.icon
                }).catch(err => console.error('Achievement notification error:', err));
            }

            return {
                success: true,
                xpAwarded: xpAmount,
                totalXP: progress.xp,
                level: progress.level,
                xpToNextLevel: progress.xpToNextLevel,
                levelUp: levelUpdate.levelsGained.length > 0,
                levelsGained: levelUpdate.levelsGained,
                streak: streakUpdate,
                newAchievements
            };
        } catch (error) {
            console.error('Error awarding XP:', error);
            throw error;
        }
    }

    /**
     * Update user stats based on activity
     */
    static async updateStats(progress, activityType, metadata) {
        const stats = progress.stats;

        switch (activityType) {
            // The quiz engine awards 'quiz_completion' / 'quiz_perfect'; older
            // code used 'quiz_complete'. A perfect quiz is also a completed one.
            case 'quiz_complete':
            case 'quiz_completion':
                stats.quizzesCompleted += 1;
                if (typeof metadata.score === 'number') stats.totalQuizScore += metadata.score;
                break;

            case 'quiz_perfect':
                stats.quizzesCompleted += 1;
                stats.quizzesPerfect += 1;
                break;

            case 'case_share':
                stats.casesShared += 1;
                break;

            case 'case_approved':
                stats.casesApproved += 1;
                break;

            case 'case_helpful_vote':
                stats.casesHelpfulVotes += 1;
                break;

            case 'comment_post':
                stats.commentsPosted += 1;
                break;

            case 'comment_helpful':
                stats.helpfulComments += 1;
                break;

            case 'discussion_start':
                stats.discussionsStarted += 1;
                break;

            case 'pattern_study':
                stats.patternsStudied += 1;
                break;

            case 'syndrome_study':
                stats.syndromesStudied += 1;
                break;

            case 'video_watch':
                stats.videosWatched += 1;
                break;

            case 'resource_download':
                stats.resourcesDownloaded += 1;
                break;

            case 'study_session':
                stats.sessionsCount += 1;
                if (metadata.duration) {
                    stats.totalStudyTime += metadata.duration;
                }
                break;
        }
    }

    /**
     * Recompute badge counters from the source records (quiz sessions, cases,
     * comments, studied items) instead of trusting incremental counters, then
     * unlock any achievements now met. Idempotent; also repairs past progress.
     */
    static async reconcileProgress(userId) {
        let progress = await UserProgress.findOne({ user: userId });
        if (!progress) progress = new UserProgress({ user: userId });
        const uid = String(userId);
        const oid = mongoose.Types.ObjectId.isValid(uid) ? new mongoose.Types.ObjectId(uid) : null;

        const sessions = await QuizSession.find({ userId: uid })
            .select('status mode endTime engineVersion items questionIds answers result')
            .lean();
        let completed = 0;
        let perfect = 0;
        for (const s of sessions) {
            const answers = s.answers instanceof Map ? Object.fromEntries(s.answers) : (s.answers || {});
            const total = s.items?.length ?? s.questionIds?.length ?? 0;
            const answered = Object.values(answers).filter((a) => Number.isInteger(a?.originalIndex) || Number.isInteger(a?.chosenIndex)).length;
            const isDone = s.status === 'submitted'
                || (s.engineVersion !== 2 && s.endTime != null)
                || (s.mode === 'practice' && total > 0 && answered >= total);
            if (!isDone || total === 0) continue;
            completed += 1;
            const correct = s.result?.correct ?? Object.values(answers).filter((a) => a?.isCorrect).length;
            if (total >= PERFECT_MIN_QUESTIONS && correct === total) perfect += 1;
        }

        let casesShared = 0;
        let casesApproved = 0;
        let commentsPosted = 0;
        if (oid) {
            [casesShared, casesApproved] = await Promise.all([
                CommunityCase.countDocuments({ author: oid }),
                CommunityCase.countDocuments({ author: oid, status: 'published' }),
            ]);
            const [row] = await CommunityCase.aggregate([
                { $unwind: '$comments' },
                { $match: { 'comments.userId': oid, 'comments.isAI': { $ne: true } } },
                { $count: 'n' },
            ]);
            commentsPosted = row?.n || 0;
        }

        const stats = progress.stats;
        stats.quizzesCompleted = completed;
        stats.quizzesPerfect = perfect;
        stats.casesShared = casesShared;
        stats.casesApproved = casesApproved;
        stats.commentsPosted = commentsPosted;
        stats.patternsStudied = progress.studied?.patterns?.length || 0;
        stats.syndromesStudied = progress.studied?.syndromes?.length || 0;
        await progress.save();
        const newAchievements = await this.checkAchievements(userId, progress);
        return { progress, newAchievements };
    }

    /**
     * Record that a pattern or syndrome page was studied. Only the first view
     * of each distinct item counts (and earns XP).
     */
    static async recordStudy(userId, kind, itemId) {
        const field = STUDY_KINDS[kind];
        if (!field || !STUDY_ID.test(String(itemId || ''))) {
            const err = new Error('Invalid study item');
            err.status = 400;
            throw err;
        }
        const res = await UserProgress.updateOne(
            { user: userId, [`studied.${field}`]: { $ne: itemId } },
            { $addToSet: { [`studied.${field}`]: itemId } },
            { upsert: false }
        );
        let firstTime = res.modifiedCount > 0;
        if (!res.matchedCount) {
            const exists = await UserProgress.exists({ user: userId });
            if (!exists) {
                await UserProgress.create({ user: userId, studied: { [field]: [itemId] } });
                firstTime = true;
            }
        }
        if (firstTime) {
            const xp = kind === 'pattern' ? this.XP_REWARDS.PATTERN_STUDY : this.XP_REWARDS.SYNDROME_STUDY;
            await this.awardXP(userId, xp, `${kind}_study`, { itemId });
        }
        const { progress } = await this.reconcileProgress(userId);
        return { firstTime, studied: progress.studied?.[field]?.length || 0 };
    }

    /**
     * Check if user has unlocked any achievements
     */
    static async checkAchievements(userId, progress) {
        const allAchievements = await Achievement.find({ isActive: true });
        const newlyUnlocked = [];

        for (const achievement of allAchievements) {
            // Skip if already unlocked
            const alreadyUnlocked = progress.unlockedAchievements.some(
                a => a.achievement.toString() === achievement._id.toString()
            );
            if (alreadyUnlocked) continue;

            // Check if criteria is met
            const unlocked = this.checkAchievementCriteria(achievement, progress);

            if (unlocked) {
                // Unlock achievement
                progress.unlockAchievement(achievement._id);

                // Award XP
                progress.addXP(achievement.xpReward, 'achievement_unlock');

                newlyUnlocked.push({
                    id: achievement._id,
                    key: achievement.key,
                    name: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon,
                    xpReward: achievement.xpReward
                });
            }
        }

        if (newlyUnlocked.length > 0) {
            await progress.save();
        }

        return newlyUnlocked;
    }

    /**
     * Check if achievement criteria is met
     */
    static checkAchievementCriteria(achievement, progress) {
        const { criteria } = achievement;
        const { stats, streak } = progress;

        switch (criteria.type) {
            case 'count':
                return stats[criteria.metric] >= criteria.target;

            case 'threshold':
                return progress[criteria.metric] >= criteria.target;

            case 'streak':
                return streak.current >= criteria.target;

            case 'perfect':
                // For "perfect" type, check if user has N perfect scores
                return stats.quizzesPerfect >= criteria.target;

            default:
                return false;
        }
    }

    /**
     * Get user's progress and achievements
     */
    static async getUserProgress(userId) {
        let progress = await UserProgress.findOne({ user: userId })
            .populate('unlockedAchievements.achievement');

        if (!progress) {
            progress = await UserProgress.create({ user: userId });
        }

        return {
            level: progress.level,
            xp: progress.xp,
            xpToNextLevel: progress.xpToNextLevel,
            streak: progress.streak,
            stats: progress.stats,
            achievements: progress.unlockedAchievements.map(a => ({
                ...a.achievement.toObject(),
                unlockedAt: a.unlockedAt,
                claimed: a.claimed
            })),
            activityHistory: progress.activityHistory,
            rank: progress.rank
        };
    }

    /**
     * Get leaderboard
     */
    static async getLeaderboard(type = 'overall', limit = 50) {
        let sortCriteria = {};

        switch (type) {
            case 'overall':
                sortCriteria = { level: -1, xp: -1 };
                break;
            case 'streak':
                sortCriteria = { 'streak.current': -1 };
                break;
            case 'cases':
                sortCriteria = { 'stats.casesApproved': -1 };
                break;
            case 'quizzes':
                sortCriteria = { 'stats.quizzesCompleted': -1 };
                break;
            case 'community':
                sortCriteria = { 'stats.commentsPosted': -1 };
                break;
            default:
                sortCriteria = { level: -1, xp: -1 };
        }

        const leaderboard = await UserProgress.find()
            .populate('user', 'name email')
            .sort(sortCriteria)
            .limit(limit)
            .lean();

        return leaderboard.map((entry, index) => ({
            rank: index + 1,
            userId: entry.user._id,
            userName: entry.user.name,
            level: entry.level,
            xp: entry.xp,
            streak: entry.streak.current,
            stats: entry.stats,
            achievements: entry.unlockedAchievements.length
        }));
    }

    /**
     * Get user's rank
     */
    static async getUserRank(userId) {
        const progress = await UserProgress.findOne({ user: userId });
        if (!progress) return { overall: null };

        // Count users with higher level/XP
        const higherRanked = await UserProgress.countDocuments({
            $or: [
                { level: { $gt: progress.level } },
                { level: progress.level, xp: { $gt: progress.xp } }
            ]
        });

        return {
            overall: higherRanked + 1
        };
    }

    /**
     * Initialize default achievements
     */
    static async initializeDefaultAchievements() {
        const defaultAchievements = [
            // First steps
            {
                key: 'first_case',
                name: 'First Case',
                description: 'Share your first community case',
                icon: '🎯',
                category: 'cases',
                tier: 'bronze',
                xpReward: 50,
                criteria: { type: 'count', target: 1, metric: 'casesShared' }
            },
            {
                key: 'first_quiz',
                name: 'Quiz Taker',
                description: 'Complete your first quiz',
                icon: '📝',
                category: 'quizzes',
                tier: 'bronze',
                xpReward: 25,
                criteria: { type: 'count', target: 1, metric: 'quizzesCompleted' }
            },
            {
                key: 'first_comment',
                name: 'Discussion Starter',
                description: 'Post your first comment',
                icon: '💬',
                category: 'community',
                tier: 'bronze',
                xpReward: 25,
                criteria: { type: 'count', target: 1, metric: 'commentsPosted' }
            },

            // Cases
            {
                key: 'case_contributor',
                name: 'Case Contributor',
                description: 'Share 10 approved cases',
                icon: '📋',
                category: 'cases',
                tier: 'silver',
                xpReward: 100,
                criteria: { type: 'count', target: 10, metric: 'casesApproved' }
            },
            {
                key: 'case_master',
                name: 'Case Master',
                description: 'Share 50 approved cases',
                icon: '🏆',
                category: 'cases',
                tier: 'gold',
                xpReward: 250,
                criteria: { type: 'count', target: 50, metric: 'casesApproved' }
            },

            // Quizzes
            {
                key: 'quiz_enthusiast',
                name: 'Quiz Enthusiast',
                description: 'Complete 25 quizzes',
                icon: '📚',
                category: 'quizzes',
                tier: 'silver',
                xpReward: 100,
                criteria: { type: 'count', target: 25, metric: 'quizzesCompleted' }
            },
            {
                key: 'perfectionist',
                name: 'Perfectionist',
                description: 'Score 100% on 5 quizzes',
                icon: '💯',
                category: 'quizzes',
                tier: 'gold',
                xpReward: 200,
                criteria: { type: 'perfect', target: 5, metric: 'quizzesPerfect' }
            },

            // Community
            {
                key: 'discussion_leader',
                name: 'Discussion Leader',
                description: 'Post 100 comments',
                icon: '🗣️',
                category: 'community',
                tier: 'gold',
                xpReward: 150,
                criteria: { type: 'count', target: 100, metric: 'commentsPosted' }
            },
            {
                key: 'helpful_contributor',
                name: 'Helpful Contributor',
                description: 'Receive 50 helpful votes on your comments',
                icon: '⭐',
                category: 'community',
                tier: 'gold',
                xpReward: 200,
                criteria: { type: 'count', target: 50, metric: 'helpfulComments' }
            },

            // Streak
            {
                key: 'week_streak',
                name: 'Week Warrior',
                description: 'Maintain a 7-day learning streak',
                icon: '🔥',
                category: 'streak',
                tier: 'silver',
                xpReward: 100,
                criteria: { type: 'streak', target: 7, metric: 'current' }
            },
            {
                key: 'month_streak',
                name: 'Dedication Master',
                description: 'Maintain a 30-day learning streak',
                icon: '🔥',
                category: 'streak',
                tier: 'gold',
                xpReward: 300,
                criteria: { type: 'streak', target: 30, metric: 'current' }
            },
            {
                key: 'century_streak',
                name: 'Century Club',
                description: 'Maintain a 100-day learning streak',
                icon: '💎',
                category: 'streak',
                tier: 'platinum',
                xpReward: 1000,
                criteria: { type: 'streak', target: 100, metric: 'current' }
            },

            // Learning
            {
                key: 'pattern_explorer',
                name: 'Pattern Explorer',
                description: 'Study 50 different EEG patterns',
                icon: '🧠',
                category: 'learning',
                tier: 'silver',
                xpReward: 100,
                criteria: { type: 'count', target: 50, metric: 'patternsStudied' }
            },
            {
                key: 'syndrome_scholar',
                name: 'Syndrome Scholar',
                description: 'Study 25 different syndromes',
                icon: '📖',
                category: 'learning',
                tier: 'silver',
                xpReward: 100,
                criteria: { type: 'count', target: 25, metric: 'syndromesStudied' }
            },

            // Level milestones
            {
                key: 'level_10',
                name: 'Rising Star',
                description: 'Reach level 10',
                icon: '⭐',
                category: 'special',
                tier: 'silver',
                xpReward: 100,
                criteria: { type: 'threshold', target: 10, metric: 'level' }
            },
            {
                key: 'level_25',
                name: 'Expert Technologist',
                description: 'Reach level 25',
                icon: '🌟',
                category: 'special',
                tier: 'gold',
                xpReward: 250,
                criteria: { type: 'threshold', target: 25, metric: 'level' }
            },
            {
                key: 'level_50',
                name: 'Master of EEG',
                description: 'Reach level 50',
                icon: '👑',
                category: 'special',
                tier: 'platinum',
                xpReward: 500,
                criteria: { type: 'threshold', target: 50, metric: 'level' }
            }
        ];

        // Insert achievements if they don't exist
        for (const achData of defaultAchievements) {
            await Achievement.findOneAndUpdate(
                { key: achData.key },
                achData,
                { upsert: true, new: true }
            );
        }

        console.log('✅ Default achievements initialized');
    }
}

export default GamificationService;
