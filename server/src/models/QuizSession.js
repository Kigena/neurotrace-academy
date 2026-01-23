import mongoose from 'mongoose';

const quizSessionSchema = new mongoose.Schema({
    userId: { type: String, required: false }, // Optional for guest/anonymous
    sessionId: { type: String, required: true, unique: true },
    mode: { type: String, enum: ['practice', 'timed', 'mock'], required: true },
    questionIds: [{ type: String }],
    currentIndex: { type: Number, default: 0 },
    answers: {
        type: Map, of: new mongoose.Schema({
            chosenIndex: Number,
            isCorrect: Boolean,
            timeMs: Number
        }, { _id: false })
    },
    startTime: { type: Number, required: true },
    endTime: { type: Number, default: null },
    timeLimitSec: { type: Number, default: null },
    config: {
        domains: [String],
        sections: [String],
        tags: [String],
        difficulty: [String],
        shuffle: Boolean,
        questionCount: Number
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const QuizSession = mongoose.model('QuizSession', quizSessionSchema);
