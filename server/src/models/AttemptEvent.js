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
    selectedIndex: { type: Number, default: null }, // canonical option index
    isCorrect: { type: Boolean, required: true },
    timestamp: { type: Number, required: true },
    timeMs: { type: Number },
    // 'review' = a retry from Review Incorrect (a new attempt; history is kept)
    mode: { type: String, enum: ['practice', 'timed', 'mock', 'review'] },
    sessionId: { type: String }, // Link back to the quiz session
    scoredBy: { type: String, enum: ['server'], default: undefined },
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
