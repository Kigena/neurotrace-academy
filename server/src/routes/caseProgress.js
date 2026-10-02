import express from 'express';
import auth from '../middleware/auth.js';
import { CaseProgress } from '../models/CaseProgress.js';

// Per-user clinical case completion. Scores are practice self-checks reported
// by the case runner; they do not feed mastery or readiness.

const router = express.Router();
router.use(auth);

const CASE_ID = /^[A-Za-z0-9_-]{1,64}$/;

function toPlain(p) {
    return {
        caseId: p.caseId,
        title: p.title,
        completions: p.completions,
        lastCorrect: p.lastCorrect,
        lastTotal: p.lastTotal,
        bestCorrect: p.bestCorrect,
        firstCompletedAt: p.firstCompletedAt,
        lastCompletedAt: p.lastCompletedAt,
    };
}

// All of the caller's completed cases.
router.get('/', async (req, res) => {
    try {
        const rows = await CaseProgress.find({ userId: req.user.id }).sort({ lastCompletedAt: -1 }).lean();
        res.json({ items: rows.map(toPlain) });
    } catch (error) {
        console.error('Case progress list error:', error.message);
        res.status(500).json({ error: 'Failed to load case progress' });
    }
});

// Record a completion of every step of a case.
router.post('/:caseId', async (req, res) => {
    try {
        const { caseId } = req.params;
        if (!CASE_ID.test(caseId)) return res.status(400).json({ error: 'Invalid case id' });
        const total = Number.parseInt(req.body?.total, 10);
        const correct = Number.parseInt(req.body?.correct, 10);
        if (!Number.isInteger(total) || total < 0 || total > 100) return res.status(400).json({ error: 'total must be 0-100' });
        if (!Number.isInteger(correct) || correct < 0 || correct > total) return res.status(400).json({ error: 'correct must be 0-total' });
        const title = typeof req.body?.title === 'string' ? req.body.title.slice(0, 200) : '';
        const now = new Date();

        const prev = await CaseProgress.findOne({ userId: req.user.id, caseId }).lean();
        const doc = await CaseProgress.findOneAndUpdate(
            { userId: req.user.id, caseId },
            {
                $set: {
                    title: title || prev?.title || '',
                    lastCorrect: correct,
                    lastTotal: total,
                    bestCorrect: Math.max(correct, prev?.bestCorrect ?? 0),
                    lastCompletedAt: now,
                },
                $setOnInsert: { firstCompletedAt: now },
                $inc: { completions: 1 },
            },
            { upsert: true, new: true, lean: true }
        );
        res.json(toPlain(doc));
    } catch (error) {
        console.error('Case progress save error:', error.message);
        res.status(500).json({ error: 'Failed to save case progress' });
    }
});

export default router;
