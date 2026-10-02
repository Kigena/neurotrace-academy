import mongoose from 'mongoose';

// One "Today's Study" plan per user per exam-timezone day. Items are
// generated from analytics; the plan keeps refreshing until the first item is
// started, then stays fixed for the day so completed items stay marked.

const planItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    kind: { type: String, required: true },
    count: Number,
    due: Number,
    competency: String,
    code: String,
    title: String,
    sectionId: String,
    domainId: String,
    mastery: Number,
    reason: String,
    status: { type: String, enum: ['pending', 'started', 'done'], default: 'pending' },
    sessionId: { type: String, default: null },
    startedAt: { type: Date, default: null },
    doneAt: { type: Date, default: null },
}, { _id: false });

const dailyPlanSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD in the exam timezone
    items: { type: [planItemSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

dailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyPlan = mongoose.model('DailyPlan', dailyPlanSchema);
