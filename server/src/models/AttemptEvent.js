import mongoose from 'mongoose';

// One scored answer. From engineVersion 2 onward these are written only by
// the server (scoredBy: 'server'), exactly once per finalized answer.
// Legacy documents (client-written) have no `scoredBy` field.

const attemptEventSchema = new mongoose.Schema({
    userId: { type: String, required: false },
    questionId: { type: String, required: true },
    questionVersion: { type: Number, default: null },
    domainId: { type: String, required: true },
    sectionId: { type: String, required: true },
    topicTags: [{ type: String }],
    difficulty: { type: String },
    // Copied from the question at scoring time (missing on older events = foundation)
    bank: { type: String, default: undefined },
    cognitiveLevel: { type: Number, default: undefined },
    competency: { type: String, default: undefined },
    selectedIndex: { type: Number, default: null }, // canonical option index
    isCorrect: { type: Boolean, required: true },
    timestamp: { type: Number, required: true },
    timeMs: { type: Number },
    // 'review' = a retry from Review Incorrect (a new attempt; history is kept)
    mode: { type: String, enum: ['practice', 'timed', 'mock', 'review'] },
    sessionId: { type: String }, // Link back to the quiz session
    scoredBy: { type: String, enum: ['server'], default: undefined },
    // Self-rated confidence (practice only); drives spaced-review scheduling.
    confidence: { type: String, enum: ['sure', 'unsure', 'guess'], default: undefined },
    // Misconception code of the chosen distractor (data/qa/distractor-errors.json).
    errorCode: { type: String, default: undefined },
});

attemptEventSchema.index({ userId: 1, timestamp: -1 });

// Guarantees one scored event per (session, question) for server-scored
// attempts. Partial so that pre-existing legacy duplicates do not block the
// index build on production data.
attemptEventSchema.index(
    { sessionId: 1, questionId: 1 },
    { unique: true, partialFilterExpression: { scoredBy: 'server' } }
);

export const AttemptEvent = mongoose.model('AttemptEvent', attemptEventSchema);
