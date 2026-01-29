import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient history queries
chatMessageSchema.index({ userId: 1, timestamp: -1 });

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
