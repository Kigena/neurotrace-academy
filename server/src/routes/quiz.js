import express from 'express';
import crypto from 'crypto';
import { createRequire } from 'module';
import auth from '../middleware/auth.js';
import { QuizSession } from '../models/QuizSession.js';
import { AttemptEvent } from '../models/AttemptEvent.js';
import { Question } from '../models/Question.js';
import GamificationService from '../services/gamificationService.js';
import { BLUEPRINT_KEY } from '../blueprint/abret2026.js';
import {
    DOMAIN_QUICKSTART,
    EXPIRY_GRACE_MS,
    MAX_CUSTOM_QUESTIONS,
    TIME_LIMITS_SEC,
    buildOptionOrder,
    displayIndexOf,
    resolvePresetAllocation,
    scoreSession,
    selectCustom,
    selectDomainQuickStart,
    selectForPreset,
    toPublicQuestion,
    xpForPercent,
} from '../services/quizEngine.js';

const require = createRequire(import.meta.url);
const presetsData = require('../data/mockExamPresets.json');

const router = express.Router();
router.use(auth);

const MODES = ['practice', 'timed', 'mock'];
const POOL_FIELDS = 'questionId domainId sectionId topicTags difficulty origin.sourceOrder';
const CONTENT_FIELDS = 'questionId domainId sectionId topicTags difficulty stem options version';
const KEY_FIELDS = `${CONTENT_FIELDS} +answerIndex +explanation`;

export function getPresets() {
    return presetsData.presets;
}

// ----------------------------------------------------------------- helpers ---

const asStringArray = (v, max = 200) =>
    Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.length <= 200).slice(0, max) : [];

async function loadQuestionMap(ids, fields) {
    const docs = await Question.find({ questionId: { $in: ids } }).select(fields).lean();
    return new Map(docs.map((d) => [d.questionId, d]));
}

function answersToObject(answers) {
    if (!answers) return {};
    return answers instanceof Map ? Object.fromEntries(answers) : { ...answers };
}

function isExpired(session, now = Date.now()) {
    return !!session.expiresAt && now > new Date(session.expiresAt).getTime() + EXPIRY_GRACE_MS;
}

function sessionSummary(session) {
    return {
        sessionId: session.sessionId,
        mode: session.mode,
        kind: session.kind,
        presetId: session.presetId,
        blueprintKey: session.blueprintKey,
        status: session.status,
        startTime: session.startTime,
        expiresAt: session.expiresAt,
        timeLimitSec: session.timeLimitSec,
        questionCount: session.items?.length ?? session.questionIds?.length ?? 0,
        serverNow: Date.now(),
        expired: session.status === 'active' && isExpired(session),
    };
}

/**
 * Public, answer-free view of an in-progress session. In practice mode the
 * feedback for already-answered questions is included (it was already shown).
 */
async function buildActivePayload(session) {
    const ids = session.items.map((i) => i.questionId);
    const needKey = session.mode === 'practice';
    const qmap = await loadQuestionMap(ids, needKey ? KEY_FIELDS : CONTENT_FIELDS);
    const answers = answersToObject(session.answers);

    const questions = session.items
        .map((item) => {
            const q = qmap.get(item.questionId);
            return q ? toPublicQuestion(q, item.optionOrder) : null;
        })
        .filter(Boolean);

    const savedAnswers = {};
    for (const item of session.items) {
        const a = answers[item.questionId];
        if (!a) continue;
        const entry = { selectedIndex: a.chosenIndex };
        if (needKey) {
            const q = qmap.get(item.questionId);
            entry.isCorrect = a.isCorrect;
            entry.correctIndex = displayIndexOf(item.optionOrder, q.answerIndex);
            entry.explanation = q.explanation || '';
        }
        savedAnswers[item.questionId] = entry;
    }

    return { session: sessionSummary(session), questions, answers: savedAnswers };
}

async function buildReview(session) {
    const ids = session.items.map((i) => i.questionId);
    const qmap = await loadQuestionMap(ids, KEY_FIELDS);
    const answers = answersToObject(session.answers);
    return session.items
        .map((item) => {
            const q = qmap.get(item.questionId);
            if (!q) return null;
            const a = answers[item.questionId];
            const correctIndex = displayIndexOf(item.optionOrder, q.answerIndex);
            const selectedIndex = a ? a.chosenIndex : null;
            return {
                ...toPublicQuestion(q, item.optionOrder),
                selectedIndex,
                correctIndex,
                isCorrect: selectedIndex !== null && selectedIndex === correctIndex,
                explanation: q.explanation || '',
            };
        })
        .filter(Boolean);
}

function resultToPlain(result) {
    if (!result) return null;
    const conv = (m) => (m instanceof Map ? Object.fromEntries(m) : m || {});
    return {
        correct: result.correct,
        attempted: result.attempted,
        total: result.total,
        percent: result.percent,
        percentOfAttempted: result.percentOfAttempted,
        breakdown: {
            byDomain: conv(result.breakdown?.byDomain),
            bySection: conv(result.breakdown?.bySection),
            byTag: conv(result.breakdown?.byTag),
            byDifficulty: conv(result.breakdown?.byDifficulty),
        },
    };
}

function attemptEventFor(session, userId, q, answer) {
    return {
        userId,
        questionId: q.questionId,
        questionVersion: q.version ?? null,
        domainId: q.domainId,
        sectionId: q.sectionId,
        topicTags: q.topicTags || [],
        difficulty: q.difficulty,
        selectedIndex: answer.originalIndex,
        isCorrect: answer.originalIndex === q.answerIndex,
        timestamp: Date.now(),
        timeMs: answer.timeMs || 0,
        mode: session.mode,
        sessionId: session.sessionId,
        scoredBy: 'server',
    };
}

async function insertAttemptsIgnoringDuplicates(docs) {
    if (!docs.length) return;
    try {
        await AttemptEvent.insertMany(docs, { ordered: false });
    } catch (err) {
        // 11000 = duplicate key: the event already exists, which is the
        // desired idempotent outcome.
        const writeErrors = err?.writeErrors || [];
        const nonDup = writeErrors.filter((e) => (e.code ?? e.err?.code) !== 11000);
        if (!writeErrors.length || nonDup.length) throw err;
    }
}

async function findOwnSession(req) {
    return QuizSession.findOne({ sessionId: req.params.sessionId, userId: req.user.id });
}

/**
 * Finalise an active session exactly once. Concurrent/duplicate submissions
 * converge on the same stored result; attempts and XP are written only by
 * the request that performs the transition.
 */
async function submitSession(session, userId) {
    if (session.status === 'submitted') return { session, alreadySubmitted: true };
    if (session.status !== 'active') {
        const err = new Error('Session is not active');
        err.status = 409;
        throw err;
    }

    const ids = session.items.map((i) => i.questionId);
    const qmap = await loadQuestionMap(ids, KEY_FIELDS);
    const answers = answersToObject(session.answers);
    const score = scoreSession(session.items, answers, qmap);

    const answerUpdates = {};
    for (const [qid, a] of Object.entries(answers)) {
        const q = qmap.get(qid);
        if (q && Number.isInteger(a.originalIndex)) {
            answerUpdates[`answers.${qid}.isCorrect`] = a.originalIndex === q.answerIndex;
        }
    }

    const now = Date.now();
    const { perQuestion: _perQuestion, ...result } = score;
    const updated = await QuizSession.findOneAndUpdate(
        { _id: session._id, status: 'active' },
        {
            $set: {
                status: 'submitted',
                submittedAt: new Date(now),
                endTime: now,
                updatedAt: new Date(now),
                result,
                ...answerUpdates,
            },
        },
        { new: true }
    );

    if (!updated) {
        // Another request won the race; return its stored outcome.
        const current = await QuizSession.findById(session._id);
        return { session: current, alreadySubmitted: true };
    }

    // Practice answers were recorded when answered; timed/mock answers are
    // recorded now, once.
    if (session.mode !== 'practice') {
        const docs = [];
        for (const item of session.items) {
            const a = answers[item.questionId];
            const q = qmap.get(item.questionId);
            if (a && q && Number.isInteger(a.originalIndex)) docs.push(attemptEventFor(session, userId, q, a));
        }
        await insertAttemptsIgnoringDuplicates(docs);
    }

    // XP consumes only the server-computed score.
    if (result.total > 0) {
        const claimed = await QuizSession.findOneAndUpdate(
            { _id: session._id, xpAwarded: false },
            { $set: { xpAwarded: true } },
            { new: true }
        );
        if (claimed) {
            const { xp, activityType } = xpForPercent(result.percent);
            try {
                await GamificationService.awardXP(userId, xp, activityType, {
                    sessionId: session.sessionId,
                    mode: session.mode,
                    score: { correct: result.correct, total: result.total, percent: result.percent },
                    questionCount: result.total,
                });
            } catch (err) {
                console.error('XP award failed (quiz result unaffected):', err.message);
            }
        }
    }

    return { session: updated, alreadySubmitted: false };
}

// ------------------------------------------------------------------ routes ---

// Presets with their resolved per-domain allocation.
router.get('/presets', (req, res) => {
    res.json({
        blueprintKey: BLUEPRINT_KEY,
        presets: getPresets().map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            questionCount: p.questionCount,
            timeLimitMinutes: p.timeLimitMinutes,
            allocation: p.allocation,
            domainAllocation: resolvePresetAllocation(p),
        })),
    });
});

// Create a session. The server selects questions, fixes the option order,
// sets the time limit and returns only answer-free question data.
router.post('/sessions', async (req, res) => {
    try {
        const body = req.body || {};
        const kind = body.kind || 'custom';
        let mode;
        let presetId = null;
        let timeLimitSec;
        let selected;
        let shuffleOptions = true;
        let config;

        const pool = await Question.find({ status: 'active' }).select(POOL_FIELDS).lean();
        if (!pool.length) {
            return res.status(503).json({ error: 'Question bank is not available. The server operator must run the question import.' });
        }

        if (kind === 'preset') {
            const preset = getPresets().find((p) => p.id === body.presetId);
            if (!preset) return res.status(400).json({ error: 'Unknown preset' });
            mode = 'mock';
            presetId = preset.id;
            timeLimitSec = preset.timeLimitMinutes * 60;
            shuffleOptions = preset.shuffle !== false;
            selected = selectForPreset(pool, preset);
            config = {
                domains: resolvePresetAllocation(preset).map((a) => a.domainId),
                sections: [], tags: [], difficulty: [],
                shuffle: shuffleOptions,
                questionCount: selected.length,
            };
        } else if (kind === 'domain-quickstart') {
            const domainId = typeof body.domainId === 'string' ? body.domainId : '';
            mode = 'timed';
            timeLimitSec = DOMAIN_QUICKSTART.timeLimitSec;
            selected = selectDomainQuickStart(pool, domainId);
            config = { domains: [domainId], sections: [], tags: [], difficulty: [], shuffle: true, questionCount: selected.length };
        } else if (kind === 'custom') {
            mode = MODES.includes(body.mode) ? body.mode : null;
            if (!mode) return res.status(400).json({ error: 'mode must be practice, timed or mock' });
            const requested = Number.parseInt(body.questionCount, 10);
            if (!Number.isInteger(requested) || requested < 1 || requested > MAX_CUSTOM_QUESTIONS) {
                return res.status(400).json({ error: `questionCount must be between 1 and ${MAX_CUSTOM_QUESTIONS}` });
            }
            const filters = {
                domains: asStringArray(body.filters?.domains),
                sections: asStringArray(body.filters?.sections),
                tags: asStringArray(body.filters?.tags),
                difficulty: asStringArray(body.filters?.difficulty),
            };
            shuffleOptions = body.shuffle !== false;
            timeLimitSec = TIME_LIMITS_SEC[mode];
            selected = selectCustom(pool, { filters, questionCount: requested, shuffle: shuffleOptions });
            config = { ...filters, shuffle: shuffleOptions, questionCount: selected.length };
        } else {
            return res.status(400).json({ error: 'Unknown session kind' });
        }

        if (!selected.length) {
            return res.status(400).json({ error: 'No questions match the selected filters' });
        }

        const qmap = await loadQuestionMap(selected.map((q) => q.questionId), CONTENT_FIELDS);
        const items = selected
            .map((q) => qmap.get(q.questionId))
            .filter(Boolean)
            .map((q) => ({
                questionId: q.questionId,
                questionVersion: q.version ?? null,
                optionOrder: buildOptionOrder(q.options, shuffleOptions),
            }));

        // Only one active session per user: older ones are abandoned.
        await QuizSession.updateMany(
            { userId: req.user.id, status: 'active' },
            { $set: { status: 'abandoned', updatedAt: new Date() } }
        );

        const now = Date.now();
        const session = await QuizSession.create({
            userId: req.user.id,
            sessionId: `session_${now}_${crypto.randomBytes(6).toString('hex')}`,
            engineVersion: 2,
            mode,
            kind,
            presetId,
            blueprintKey: kind === 'preset' ? BLUEPRINT_KEY : null,
            status: 'active',
            questionIds: items.map((i) => i.questionId),
            items,
            answers: {},
            startTime: now,
            expiresAt: timeLimitSec ? new Date(now + timeLimitSec * 1000) : null,
            timeLimitSec: timeLimitSec || null,
            config,
        });

        res.status(201).json(await buildActivePayload(session));
    } catch (error) {
        console.error('Create session error:', error.message);
        res.status(500).json({ error: 'Failed to create quiz session' });
    }
});

// Resume: the caller's active session, if any.
router.get('/sessions/active', async (req, res) => {
    try {
        const session = await QuizSession.findOne({ userId: req.user.id, status: 'active', engineVersion: 2 })
            .sort({ startTime: -1 });
        if (!session) return res.json({ session: null });
        res.json(await buildActivePayload(session));
    } catch (error) {
        console.error('Active session error:', error.message);
        res.status(500).json({ error: 'Failed to load active session' });
    }
});

// Own quiz history (completed sessions only)
router.get('/sessions/history', async (req, res) => {
    try {
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
        const sessions = await QuizSession.find({ userId: req.user.id, endTime: { $ne: null } })
            .sort({ endTime: -1 })
            .limit(limit)
            .lean();
        res.json(sessions.map((s) => ({
            sessionId: s.sessionId,
            mode: s.mode,
            presetId: s.presetId || null,
            startTime: s.startTime,
            endTime: s.endTime,
            engineVersion: s.engineVersion || 1,
            result: s.result ? resultToPlain(s.result) : null,
        })));
    } catch (error) {
        console.error('Get quiz history error:', error.message);
        res.status(500).json({ error: 'Failed to fetch quiz history' });
    }
});

// Record an answer.
router.post('/sessions/:sessionId/answers', async (req, res) => {
    try {
        const session = await findOwnSession(req);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (session.status !== 'active') return res.status(409).json({ error: 'Session is not active' });
        if (isExpired(session)) return res.status(409).json({ error: 'Time has expired for this session', expired: true });

        const { questionId } = req.body || {};
        const selectedIndex = req.body?.selectedIndex;
        const item = session.items.find((i) => i.questionId === questionId);
        if (!item) return res.status(400).json({ error: 'Question is not part of this session' });
        if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= item.optionOrder.length) {
            return res.status(400).json({ error: 'selectedIndex is out of range' });
        }
        const timeMs = Number.isFinite(req.body?.timeMs)
            ? Math.min(Math.max(Math.round(req.body.timeMs), 0), 4 * 60 * 60 * 1000)
            : 0;
        const originalIndex = item.optionOrder[selectedIndex];

        if (session.mode === 'practice') {
            const q = await Question.findOne({ questionId }).select(KEY_FIELDS).lean();
            if (!q) return res.status(410).json({ error: 'Question is no longer available' });
            const correctIndex = displayIndexOf(item.optionOrder, q.answerIndex);
            const feedback = (isCorrect) => ({
                questionId,
                selectedIndex,
                isCorrect,
                correctIndex,
                explanation: q.explanation || '',
            });

            // Practice answers are final: record only if not already answered.
            const answer = {
                chosenIndex: selectedIndex,
                originalIndex,
                isCorrect: originalIndex === q.answerIndex,
                timeMs,
                answeredAt: new Date(),
            };
            const updated = await QuizSession.findOneAndUpdate(
                { _id: session._id, status: 'active', [`answers.${questionId}`]: { $exists: false } },
                { $set: { [`answers.${questionId}`]: answer, updatedAt: new Date() } },
                { new: true }
            );

            if (!updated) {
                const existing = answersToObject((await QuizSession.findById(session._id)).answers)[questionId];
                if (existing && existing.chosenIndex === selectedIndex) {
                    return res.json({ ...feedback(existing.isCorrect), alreadyRecorded: true });
                }
                return res.status(409).json({ error: 'This question has already been answered' });
            }

            await insertAttemptsIgnoringDuplicates([attemptEventFor(session, req.user.id, q, answer)]);
            return res.json(feedback(answer.isCorrect));
        }

        // Timed / mock: answers may change until submission; no feedback.
        await QuizSession.updateOne(
            { _id: session._id, status: 'active' },
            {
                $set: {
                    [`answers.${questionId}`]: { chosenIndex: selectedIndex, originalIndex, timeMs, answeredAt: new Date() },
                    updatedAt: new Date(),
                },
            }
        );
        res.json({ questionId, selectedIndex, saved: true });
    } catch (error) {
        console.error('Answer error:', error.message);
        res.status(500).json({ error: 'Failed to record answer' });
    }
});

// Submit. Any score in the request body is ignored.
router.post('/sessions/:sessionId/submit', async (req, res) => {
    try {
        const session = await findOwnSession(req);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        const { session: finalSession, alreadySubmitted } = await submitSession(session, req.user.id);
        res.json({
            session: sessionSummary(finalSession),
            result: resultToPlain(finalSession.result),
            review: await buildReview(finalSession),
            alreadySubmitted,
        });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        console.error('Submit error:', error.message);
        res.status(500).json({ error: 'Failed to submit session' });
    }
});

// Abandon an active session (no score, no further answers).
router.post('/sessions/:sessionId/abandon', async (req, res) => {
    const updated = await QuizSession.findOneAndUpdate(
        { sessionId: req.params.sessionId, userId: req.user.id, status: 'active' },
        { $set: { status: 'abandoned', updatedAt: new Date() } },
        { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Active session not found' });
    res.json({ session: sessionSummary(updated) });
});

// Post-submission review.
router.get('/sessions/:sessionId/review', async (req, res) => {
    try {
        const session = await findOwnSession(req);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (session.status !== 'submitted' || !session.items) {
            return res.status(409).json({ error: 'Review is available after submission' });
        }
        res.json({
            session: sessionSummary(session),
            result: resultToPlain(session.result),
            review: await buildReview(session),
        });
    } catch (error) {
        console.error('Review error:', error.message);
        res.status(500).json({ error: 'Failed to load review' });
    }
});

// Aggregate stats over the caller's completed sessions.
router.get('/stats', async (req, res) => {
    try {
        const sessions = await QuizSession.find({ userId: req.user.id, endTime: { $ne: null } }).lean();
        let totalCorrect = 0;
        let totalQuestions = 0;
        let bestScore = 0;
        for (const s of sessions) {
            let correct;
            let total;
            if (s.result) {
                correct = s.result.correct;
                total = s.result.total;
            } else {
                const answers = Object.values(s.answers || {});
                correct = answers.filter((a) => a.isCorrect).length;
                total = answers.length;
            }
            totalCorrect += correct;
            totalQuestions += total;
            if (total > 0) bestScore = Math.max(bestScore, (correct / total) * 100);
        }
        res.json({
            totalQuizzes: sessions.length,
            averageScore: totalQuestions ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : 0,
            bestScore: Math.round(bestScore * 10) / 10,
            totalQuestions,
            correctAnswers: totalCorrect,
        });
    } catch (error) {
        console.error('Get quiz stats error:', error.message);
        res.status(500).json({ error: 'Failed to fetch quiz stats' });
    }
});

export default router;
