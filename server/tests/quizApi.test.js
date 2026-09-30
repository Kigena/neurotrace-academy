import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { setupTestDb, makeApp, registerUser, bearer, seedFixtureBank } from './helpers.js';
import { QuizSession } from '../src/models/QuizSession.js';
import { AttemptEvent } from '../src/models/AttemptEvent.js';
import { Question } from '../src/models/Question.js';
import UserProgress from '../src/models/UserProgress.js';

setupTestDb();
const app = makeApp();

let bank;
let answerKey; // questionId -> canonical answerIndex (from the fixture, test-side only)

beforeAll(async () => {
    bank = await seedFixtureBank(70);
    answerKey = new Map(bank.questions.map((q) => [q.id, q]));
});

const create = (user, body) => request(app).post('/api/quiz/sessions').set(bearer(user.token)).send(body);
const answer = (user, sid, questionId, selectedIndex, extra = {}) =>
    request(app).post(`/api/quiz/sessions/${sid}/answers`).set(bearer(user.token)).send({ questionId, selectedIndex, ...extra });
const submit = (user, sid, body = {}) => request(app).post(`/api/quiz/sessions/${sid}/submit`).set(bearer(user.token)).send(body);

/** Display index of the correct option, derived from the displayed option text. */
function correctDisplayIndex(pubQ) {
    const src = answerKey.get(pubQ.questionId);
    return pubQ.options.indexOf(src.options[src.answerIndex]);
}

function assertNoAnswerKey(payload) {
    const text = JSON.stringify(payload);
    expect(text).not.toMatch(/answerIndex|explanation|contentHash|correctIndex|isCorrect/);
    expect(text).not.toMatch(/Explanation for/);
}

describe('question delivery', () => {
    it('never exposes the answer key when a session starts', async () => {
        const u = await registerUser(app);
        for (const body of [
            { kind: 'custom', mode: 'practice', questionCount: 10 },
            { kind: 'custom', mode: 'mock', questionCount: 10 },
            { kind: 'preset', presetId: 'mock-set-1' },
            { kind: 'domain-quickstart', domainId: 'domain-2' },
        ]) {
            const res = await create(u, body);
            expect(res.status).toBe(201);
            expect(res.body.questions.length).toBeGreaterThan(0);
            assertNoAnswerKey(res.body.questions);
            assertNoAnswerKey(res.body.answers);
        }
    });

    it('custom selection is randomized across the eligible pool', async () => {
        const u = await registerUser(app);
        const seen = new Set();
        for (let i = 0; i < 6; i++) {
            const res = await create(u, { kind: 'custom', mode: 'practice', questionCount: 10 });
            res.body.questions.forEach((q) => seen.add(q.questionId));
        }
        expect(seen.size).toBeGreaterThan(20);
    });

    it('the 130-question full mock uses the canonical 19/60/25/26 domain allocation', async () => {
        const u = await registerUser(app);
        const res = await create(u, { kind: 'preset', presetId: 'mock-full-130' });
        expect(res.status).toBe(201);
        expect(res.body.questions).toHaveLength(130);
        const counts = {};
        res.body.questions.forEach((q) => { counts[q.domainId] = (counts[q.domainId] || 0) + 1; });
        expect(counts).toEqual({ 'domain-1': 19, 'domain-2': 60, 'domain-3': 25, 'domain-4': 26 });
        expect(res.body.session.timeLimitSec).toBe(120 * 60);
        expect(res.body.session.blueprintKey).toBe('abret-reegt-2026');
    });

    it('presets endpoint publishes the resolved allocations', async () => {
        const u = await registerUser(app);
        const res = await request(app).get('/api/quiz/presets').set(bearer(u.token));
        const full = res.body.presets.find((p) => p.id === 'mock-full-130');
        expect(full.domainAllocation.map((a) => a.count)).toEqual([19, 60, 25, 26]);
    });
});

describe('practice mode', () => {
    it('returns correct feedback immediately and records exactly one attempt per answered question', async () => {
        const u = await registerUser(app);
        const { body } = await create(u, { kind: 'custom', mode: 'practice', questionCount: 4 });
        const sid = body.session.sessionId;
        const [q1, q2] = body.questions;

        const right = await answer(u, sid, q1.questionId, correctDisplayIndex(q1));
        expect(right.status).toBe(200);
        expect(right.body.isCorrect).toBe(true);
        expect(right.body.correctIndex).toBe(correctDisplayIndex(q1));
        expect(right.body.explanation).toMatch(/Explanation for/);

        const wrongIdx = (correctDisplayIndex(q2) + 1) % q2.options.length;
        const wrong = await answer(u, sid, q2.questionId, wrongIdx);
        expect(wrong.body.isCorrect).toBe(false);
        expect(wrong.body.correctIndex).toBe(correctDisplayIndex(q2));

        // Retry with the same choice is idempotent; changing the answer is refused.
        const retry = await answer(u, sid, q1.questionId, correctDisplayIndex(q1));
        expect(retry.status).toBe(200);
        expect(retry.body.alreadyRecorded).toBe(true);
        const change = await answer(u, sid, q2.questionId, correctDisplayIndex(q2));
        expect(change.status).toBe(409);

        // Submission does not add attempts for practice answers.
        const done = await submit(u, sid);
        expect(done.status).toBe(200);
        expect(await AttemptEvent.countDocuments({ sessionId: sid })).toBe(2);
        expect(done.body.result.correct).toBe(1);
        expect(done.body.result.attempted).toBe(2);
        expect(done.body.result.total).toBe(4);
    });
});

describe('mock / timed mode', () => {
    it('does not reveal correctness until submission, then scores on the server', async () => {
        const u = await registerUser(app);
        const { body } = await create(u, { kind: 'custom', mode: 'mock', questionCount: 6 });
        const sid = body.session.sessionId;
        const qs = body.questions;

        const first = await answer(u, sid, qs[0].questionId, correctDisplayIndex(qs[0]));
        expect(first.status).toBe(200);
        assertNoAnswerKey(first.body);

        // Answers may be changed before submission.
        await answer(u, sid, qs[1].questionId, (correctDisplayIndex(qs[1]) + 1) % 4);
        await answer(u, sid, qs[1].questionId, correctDisplayIndex(qs[1]));
        await answer(u, sid, qs[2].questionId, (correctDisplayIndex(qs[2]) + 1) % 4);

        // No attempts are written before submission.
        expect(await AttemptEvent.countDocuments({ sessionId: sid })).toBe(0);

        // A resumed view still contains no answer key.
        const resumed = await request(app).get('/api/quiz/sessions/active').set(bearer(u.token));
        assertNoAnswerKey(resumed.body);
        expect(resumed.body.answers[qs[1].questionId].selectedIndex).toBe(correctDisplayIndex(qs[1]));

        // Review is locked until submission.
        const early = await request(app).get(`/api/quiz/sessions/${sid}/review`).set(bearer(u.token));
        expect(early.status).toBe(409);

        // A forged client score is ignored.
        const res = await submit(u, sid, { score: { correct: 6, total: 6, percent: 100 }, result: { percent: 100 } });
        expect(res.status).toBe(200);
        expect(res.body.result.correct).toBe(2);
        expect(res.body.result.attempted).toBe(3);
        expect(res.body.result.total).toBe(6);
        expect(res.body.result.percent).toBe(33);
        expect(res.body.review).toHaveLength(6);
        expect(res.body.review[0].isCorrect).toBe(true);
        expect(res.body.review[0].explanation).toMatch(/Explanation for/);

        const stored = await QuizSession.findOne({ sessionId: sid }).lean();
        expect(stored.status).toBe('submitted');
        expect(stored.result.percent).toBe(33);
        expect(await AttemptEvent.countDocuments({ sessionId: sid })).toBe(3);
    });

    it('double submission is idempotent: one result, no duplicate attempts, XP awarded once', async () => {
        const u = await registerUser(app);
        const { body } = await create(u, { kind: 'custom', mode: 'timed', questionCount: 5 });
        const sid = body.session.sessionId;
        for (const q of body.questions) await answer(u, sid, q.questionId, correctDisplayIndex(q));

        const xpState = async () => {
            const p = await UserProgress.findOne({ user: u.id }).lean();
            return `${p.level}:${p.xp}`;
        };
        const before = await xpState();
        const [a, b] = await Promise.all([submit(u, sid), submit(u, sid)]);
        const afterFirst = await xpState();
        const c = await submit(u, sid);
        for (const r of [a, b, c]) {
            expect(r.status).toBe(200);
            expect(r.body.result.percent).toBe(100);
        }
        expect([a, b, c].filter((r) => r.body.alreadySubmitted).length).toBe(2);
        expect(await AttemptEvent.countDocuments({ sessionId: sid })).toBe(5);

        expect(afterFirst).not.toBe(before);
        expect(await xpState()).toBe(afterFirst);
        expect((await QuizSession.findOne({ sessionId: sid }).lean()).xpAwarded).toBe(true);

        // No answers after submission.
        const late = await answer(u, sid, body.questions[0].questionId, 0);
        expect(late.status).toBe(409);
    });

    it('rejects answers after the time limit and keeps the server clock authoritative', async () => {
        const u = await registerUser(app);
        const { body } = await create(u, { kind: 'custom', mode: 'timed', questionCount: 3 });
        const sid = body.session.sessionId;
        const startTime = body.session.startTime;

        // Reloading the page (fetching the active session) does not reset the timer.
        const resumed = await request(app).get('/api/quiz/sessions/active').set(bearer(u.token));
        expect(resumed.body.session.startTime).toBe(startTime);
        expect(resumed.body.session.expiresAt).toBe(body.session.expiresAt);
        expect(resumed.body.questions.map((q) => q.questionId)).toEqual(body.questions.map((q) => q.questionId));
        expect(resumed.body.questions.map((q) => q.options)).toEqual(body.questions.map((q) => q.options));

        // Simulate the clock running out.
        await QuizSession.updateOne({ sessionId: sid }, { $set: { expiresAt: new Date(Date.now() - 60000) } });
        const late = await answer(u, sid, body.questions[0].questionId, 0);
        expect(late.status).toBe(409);
        expect(late.body.expired).toBe(true);
        const active = await request(app).get('/api/quiz/sessions/active').set(bearer(u.token));
        expect(active.body.session.expired).toBe(true);

        const res = await submit(u, sid);
        expect(res.status).toBe(200);
        expect(res.body.result.attempted).toBe(0);
    });

    it('validates answer input', async () => {
        const u = await registerUser(app);
        const { body } = await create(u, { kind: 'custom', mode: 'mock', questionCount: 2 });
        const sid = body.session.sessionId;
        expect((await answer(u, sid, 'not-in-session', 0)).status).toBe(400);
        expect((await answer(u, sid, body.questions[0].questionId, 9)).status).toBe(400);
        expect((await answer(u, sid, body.questions[0].questionId, '1')).status).toBe(400);
    });
});

describe('session lifecycle', () => {
    it('starting a new session abandons the previous active one; abandon is explicit', async () => {
        const u = await registerUser(app);
        const one = await create(u, { kind: 'custom', mode: 'practice', questionCount: 2 });
        const two = await create(u, { kind: 'custom', mode: 'practice', questionCount: 2 });
        expect((await QuizSession.findOne({ sessionId: one.body.session.sessionId }).lean()).status).toBe('abandoned');
        const ab = await request(app).post(`/api/quiz/sessions/${two.body.session.sessionId}/abandon`).set(bearer(u.token));
        expect(ab.status).toBe(200);
        const active = await request(app).get('/api/quiz/sessions/active').set(bearer(u.token));
        expect(active.body.session).toBeNull();
        expect((await submit(u, two.body.session.sessionId)).status).toBe(409);
    });

    it('history is per user and contains server results', async () => {
        const a = await registerUser(app);
        const b = await registerUser(app);
        const s = await create(a, { kind: 'custom', mode: 'mock', questionCount: 2 });
        await submit(a, s.body.session.sessionId);
        const ha = await request(app).get('/api/quiz/sessions/history').set(bearer(a.token));
        const hb = await request(app).get('/api/quiz/sessions/history').set(bearer(b.token));
        expect(ha.body).toHaveLength(1);
        expect(ha.body[0].result.total).toBe(2);
        expect(hb.body).toHaveLength(0);
    });

    it('returns 503 when the question bank has not been imported', async () => {
        const u = await registerUser(app);
        const docs = await Question.collection.find().toArray();
        await Question.deleteMany({});
        const res = await create(u, { kind: 'custom', mode: 'practice', questionCount: 2 });
        expect(res.status).toBe(503);
        await Question.collection.insertMany(docs);
    });
});
