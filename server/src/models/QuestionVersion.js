import mongoose from 'mongoose';

// Immutable history of question content. A new document is appended every
// time the scored content of a question changes; existing versions are never
// overwritten.

const snapshotSchema = new mongoose.Schema({
    domainId: String,
    sectionId: String,
    topicTags: [String],
    difficulty: String,
    stem: String,
    options: [String],
    answerIndex: Number,
    explanation: String,
    cognitiveLevel: Number,
    competency: String,
}, { _id: false });

const questionVersionSchema = new mongoose.Schema({
    questionId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    contentHash: { type: String, required: true },
    snapshot: { type: snapshotSchema, required: true },
    changeType: {
        type: String,
        enum: ['import-initial', 'import-update', 'edit'],
        required: true,
    },
    source: {
        type: { type: String, default: null },
        sourceFile: { type: String, default: null },
        sourceVersion: { type: String, default: null },
    },
    createdBy: { type: String, default: 'system' },
    createdAt: { type: Date, default: Date.now },
});

questionVersionSchema.index({ questionId: 1, version: 1 }, { unique: true });

export const QuestionVersion = mongoose.model('QuestionVersion', questionVersionSchema);
