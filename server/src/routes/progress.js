import express from 'express';
import auth from '../middleware/auth.js';
import { AttemptEvent } from '../models/AttemptEvent.js';
import { QuizSession } from '../models/QuizSession.js';
import { computeTotals, computeWeakTopics } from '../services/progressStats.js';
import { clampInt } from '../utils/validation.js';

// Per-user progress and session history. Identity always comes from the
// verified token; any `userId` query parameter from the client is ignored.
// AttemptEvents are written only by the server-side quiz engine, so there is
// deliberately no client write endpoint here.

const router = express.Router();

const MAX_EVENTS = 5000;

function ownEvents(userId) {
    return AttemptEvent.find({ userId })
        .sort({ timestamp: -1 })
        .limit(MAX_EVENTS)
        .select('-__v')
        .lean();
}

// Own attempt events (newest first)
router.get('/progress', auth, async (req, res) => {
    try {
        res.json(await ownEvents(req.user.id));
    } catch (error) {
        console.error('Get progress error:', error.message);
        res.status(500).json({ error: 'Failed to load progress' });
    }
});

// Own weak topics
router.get('/progress/weak-topics', auth, async (req, res) => {
    try {
        const k = clampInt(req.query.k, 1, 200, 30);
        const minAttempts = clampInt(req.query.minAttempts, 1, 200, 10);
        const events = await ownEvents(req.user.id);
        res.json({ weakTopics: computeWeakTopics(events, k, minAttempts), totals: computeTotals(events) });
    } catch (error) {
        console.error('Weak topics error:', error.message);
        res.status(500).json({ error: 'Failed to compute weak topics' });
    }
});

// Own sessions (newest first). The legacy client-driven create/update
// endpoints (POST/PUT /api/sessions) have been removed.
router.get('/sessions', auth, async (req, res) => {
    try {
        const sessions = await QuizSession.find({ userId: req.user.id })
            .sort({ startTime: -1 })
            .limit(50)
            .select('-items.optionOrder -__v')
            .lean();
        res.json(sessions);
    } catch (error) {
        console.error('Get sessions error:', error.message);
        res.status(500).json({ error: 'Failed to load sessions' });
    }
});

router.get('/sessions/:sessionId', auth, async (req, res) => {
    try {
        const session = await QuizSession.findOne({ sessionId: req.params.sessionId, userId: req.user.id })
            .select('-items.optionOrder -__v')
            .lean();
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (error) {
        console.error('Get session error:', error.message);
        res.status(500).json({ error: 'Failed to load session' });
    }
});

export default router;
