import mongoose from 'mongoose';

// Quiz / exam session.
//
// engineVersion 2 sessions are created and scored entirely by the server
// (routes/quiz.js + services/quizEngine.js). Legacy (engineVersion 1)
// documents created by the old client-driven flow remain readable; their
// fields are a subset of this schema.

const answerSchema = new mongoose.Schema({
    // Index the user selected, in the order the options were displayed
    chosenIndex: Number,
    // The same selection mapped back to the question's canonical option order
    originalIndex: Number,
    // Set immediately in practice mode; set at submission for timed/mock
    isCorrect: Boolean,
    timeMs: Number,
    answeredAt: Date,
}, { _id: false });

const itemSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    questionVersion: { type: Number, default: null },
    // optionOrder[displayIndex] = canonical option index
    optionOrder: { type: [Number], default: [] },
}, { _id: false });

const breakdownEntry = {
    type: Map,
    of: new mongoose.Schema({
        correct: Number,
        attempted: Number,
        total: Number,
    }, { _id: false }),
    default: undefined,
};

const quizSessionSchema = new mongoose.Schema({
    userId: { type: String, required: false, index: true },
    sessionId: { type: String, required: true, unique: true },
    engineVersion: { type: Number, default: 1 },
    mode: { type: String, enum: ['practice', 'timed', 'mock'], required: true },
    kind: { type: String, enum: ['custom', 'domain-quickstart', 'preset', 'weak-areas', 'challenge', null], default: null },
    presetId: { type: String, default: null },
    blueprintKey: { type: String, default: null },
    status: {
        type: String,
        enum: ['active', 'submitted', 'abandoned'],
        default: 'active',
        index: true,
    },
    questionIds: [{ type: String }],
    items: { type: [itemSchema], default: undefined },
    currentIndex: { type: Number, default: 0 },
    answers: {
        type: Map,
        of: answerSchema,
    },
    startTime: { type: Number, required: true },
    endTime: { type: Number, default: null },
    expiresAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    timeLimitSec: { type: Number, default: null },
    config: {
        domains: [String],
        sections: [String],
        tags: [String],
        difficulty: [String],
        shuffle: Boolean,
        questionCount: Number
    },
    // Server-computed result (engineVersion 2). Never accepted from clients.
    result: {
        correct: Number,
        attempted: Number,
        total: Number,
        percent: Number,
        percentOfAttempted: Number,
        breakdown: {
            byDomain: breakdownEntry,
            bySection: breakdownEntry,
            byTag: breakdownEntry,
            byDifficulty: breakdownEntry,
        },
    },
    xpAwarded: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

quizSessionSchema.index({ userId: 1, status: 1, startTime: -1 });

export const QuizSession = mongoose.model('QuizSession', quizSessionSchema);
