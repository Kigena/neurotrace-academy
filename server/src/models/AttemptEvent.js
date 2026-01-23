import mongoose from 'mongoose';

const attemptEventSchema = new mongoose.Schema({
    userId: { type: String, required: false },
    questionId: { type: String, required: true },
    domainId: { type: String, required: true },
    sectionId: { type: String, required: true },
    topicTags: [{ type: String }],
    difficulty: { type: String },
    isCorrect: { type: Boolean, required: true },
    timestamp: { type: Number, required: true },
    timeMs: { type: Number },
    mode: { type: String, enum: ['practice', 'timed', 'mock'] },
    sessionId: { type: String } // Link back to the quiz session
});

export const AttemptEvent = mongoose.model('AttemptEvent', attemptEventSchema);
