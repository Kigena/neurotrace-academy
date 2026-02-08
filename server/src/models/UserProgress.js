import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Level & XP System
    level: {
        type: Number,
        default: 1,
        min: 1
    },
    xp: {
        type: Number,
        default: 0,
        min: 0
    },
    xpToNextLevel: {
        type: Number,
        default: 100
    },

    // Achievements
    unlockedAchievements: [{
        achievement: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Achievement'
        },
        unlockedAt: {
            type: Date,
            default: Date.now
        },
        claimed: {
            type: Boolean,
            default: false
        }
    }],

    // Activity Metrics
    stats: {
        // Cases
        casesShared: { type: Number, default: 0 },
        casesApproved: { type: Number, default: 0 },
        casesHelpfulVotes: { type: Number, default: 0 },

        // Quizzes
        quizzesCompleted: { type: Number, default: 0 },
        quizzesPerfect: { type: Number, default: 0 },
        totalQuizScore: { type: Number, default: 0 },

        // Community
        commentsPosted: { type: Number, default: 0 },
        helpfulComments: { type: Number, default: 0 },
        discussionsStarted: { type: Number, default: 0 },

        // Learning
        patternsStudied: { type: Number, default: 0 },
        syndromesStudied: { type: Number, default: 0 },
        videosWatched: { type: Number, default: 0 },
        resourcesDownloaded: { type: Number, default: 0 },

        // Time
        totalStudyTime: { type: Number, default: 0 }, // in minutes
        sessionsCount: { type: Number, default: 0 }
    },

    // Streak System
    streak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastActivityDate: { type: Date, default: null }
    },

    // Leaderboard position (cached)
    rank: {
        overall: { type: Number, default: 0 },
        weekly: { type: Number, default: 0 },
        category: { type: Map, of: Number } // category -> rank
    },

    // Activity history for contribution graph
    activityHistory: [{
        date: { type: Date, required: true },
        xpEarned: { type: Number, default: 0 },
        activities: [String] // e.g., ['case_shared', 'quiz_completed']
    }],

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
userProgressSchema.index({ user: 1 });
userProgressSchema.index({ level: -1, xp: -1 }); // For leaderboard
userProgressSchema.index({ 'streak.current': -1 }); // For streak leaderboard

// Update timestamp on save and validate stats
userProgressSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Ensure all stats are valid numbers (prevent NaN errors)
    if (this.stats) {
        const statKeys = Object.keys(this.stats.toObject ? this.stats.toObject() : this.stats);
        for (const key of statKeys) {
            const value = this.stats[key];
            // If value is undefined, null, NaN, or not finite, reset to 0
            if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
                console.warn(`⚠️ Invalid stat value for ${key}: ${value}, resetting to 0`);
                this.stats[key] = 0;
            }
        }
    }

    next();
});

// Method to add XP and check for level up
userProgressSchema.methods.addXP = function (amount, activityType) {
    this.xp += amount;

    // Record activity
    const today = new Date().setHours(0, 0, 0, 0);
    let todayActivity = this.activityHistory.find(
        a => new Date(a.date).setHours(0, 0, 0, 0) === today
    );

    if (todayActivity) {
        todayActivity.xpEarned += amount;
        if (activityType && !todayActivity.activities.includes(activityType)) {
            todayActivity.activities.push(activityType);
        }
    } else {
        this.activityHistory.push({
            date: new Date(),
            xpEarned: amount,
            activities: activityType ? [activityType] : []
        });
    }

    // Keep only last 365 days of activity
    if (this.activityHistory.length > 365) {
        this.activityHistory = this.activityHistory.slice(-365);
    }

    // Check for level up
    const levelsGained = [];
    while (this.xp >= this.xpToNextLevel) {
        this.xp -= this.xpToNextLevel;
        this.level += 1;
        levelsGained.push(this.level);

        // Calculate XP needed for next level (exponential growth)
        this.xpToNextLevel = Math.floor(100 * Math.pow(1.5, this.level - 1));
    }

    return { levelsGained, newLevel: this.level, currentXP: this.xp };
};

// Method to update streak
userProgressSchema.methods.updateStreak = function () {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    if (!this.streak.lastActivityDate) {
        // First activity ever
        this.streak.current = 1;
        this.streak.longest = 1;
        this.streak.lastActivityDate = today;
        return { streakIncreased: true, currentStreak: 1 };
    }

    const lastActivity = new Date(this.streak.lastActivityDate);
    const lastActivityDay = new Date(lastActivity.setHours(0, 0, 0, 0));
    const daysDiff = Math.floor((today - lastActivityDay) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
        // Activity already today
        return { streakIncreased: false, currentStreak: this.streak.current };
    } else if (daysDiff === 1) {
        // Consecutive day
        this.streak.current += 1;
        if (this.streak.current > this.streak.longest) {
            this.streak.longest = this.streak.current;
        }
        this.streak.lastActivityDate = today;
        return { streakIncreased: true, currentStreak: this.streak.current };
    } else {
        // Streak broken
        this.streak.current = 1;
        this.streak.lastActivityDate = today;
        return { streakIncreased: false, currentStreak: 1, streakBroken: true };
    }
};

// Method to unlock achievement
userProgressSchema.methods.unlockAchievement = function (achievementId) {
    const alreadyUnlocked = this.unlockedAchievements.some(
        a => a.achievement.toString() === achievementId.toString()
    );

    if (!alreadyUnlocked) {
        this.unlockedAchievements.push({
            achievement: achievementId,
            unlockedAt: new Date(),
            claimed: false
        });
        return true;
    }

    return false;
};

export default mongoose.model('UserProgress', userProgressSchema);
