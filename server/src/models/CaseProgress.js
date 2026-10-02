import mongoose from 'mongoose';

// A user's completion record for one clinical case (starter case id such as
// "case-0022" or a community case ObjectId). Each completion of every step
// updates the latest score; the best score and first completion are kept.

const caseProgressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    caseId: { type: String, required: true },
    title: { type: String, default: '' },
    completions: { type: Number, default: 0 },
    lastCorrect: { type: Number, default: null },
    lastTotal: { type: Number, default: null },
    bestCorrect: { type: Number, default: null },
    firstCompletedAt: { type: Date, default: null },
    lastCompletedAt: { type: Date, default: null },
});

caseProgressSchema.index({ userId: 1, caseId: 1 }, { unique: true });

export const CaseProgress = mongoose.model('CaseProgress', caseProgressSchema);
