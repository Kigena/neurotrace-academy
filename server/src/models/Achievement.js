import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
    // Unique identifier for the achievement
    key: {
        type: String,
        required: true,
        unique: true
    },
    
    // Display information
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String, // Emoji or icon identifier
        default: '🏆'
    },
    
    // Achievement properties
    category: {
        type: String,
        enum: ['cases', 'quizzes', 'community', 'learning', 'special', 'streak'],
        required: true
    },
    tier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        default: 'bronze'
    },
    xpReward: {
        type: Number,
        default: 50
    },
    
    // Unlock criteria
    criteria: {
        type: {
            type: String,
            enum: ['count', 'threshold', 'streak', 'perfect', 'custom'],
            required: true
        },
        target: Number, // e.g., "Share 10 cases" -> target: 10
        metric: String  // e.g., "cases_shared", "quiz_perfect_scores"
    },
    
    // Metadata
    isSecret: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
achievementSchema.index({ category: 1, isActive: 1 });
achievementSchema.index({ key: 1 });

export default mongoose.model('Achievement', achievementSchema);
