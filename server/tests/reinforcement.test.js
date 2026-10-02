import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { setupTestDb, makeApp, registerUser, bearer } from './helpers.js';
import { importQuestions, loadSourceFile } from '../src/services/questionImport.js';
import { AttemptEvent } from '../src/models/AttemptEvent.js';
import {
    DAY_MS,
    buildReviewQueue,
    misconceptionSummary,
    scheduleQuestion,
    selectMisconceptionDrill,
} from '../src/services/reinforcement.js';
import {
    codesForQuestion,
    distractorErrorMap,
    errorCodeFor,
    misconceptionVocabulary,
    questionIdsForCode,
} from '../src/services/misconceptions.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const challengeDir = path.join(serverRoot, 'src/data/challenge');
const challenge = fs.readdirSync(challengeDir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => ({ file: f, data: loadSourceFile(path.join(challengeDir, f)) }));
const allChallenge = challenge.flatMap((c) => c.data.questions);
const byId = new Map(allChallenge.map((q) => [q.id, q]));

const T0 = Date.UTC(2026, 9, 1, 12); // noon UTC, so +hours stays on the same day
const at = (days, hours = 0) => T0 + days * DAY_MS + hours * 3600000;
const attempt = (days, isCorrect, confidence, extra = {}) => ({ timestamp: at(days), isCorrect, confidence, ...extra });

// ---------------------------------------------------------- scheduling ---

describe('spaced review scheduling', () => {
    it('a miss is due in 1 day; later-day correct answers walk 3/7/16/35 days, then retire', () => {
        let s = scheduleQuestion([attempt(0, false)]);
        expect(s).toMatchObject({ stage: 0, dueAt: at(1), lapses: 1, correctDays: 0 });

        s = scheduleQuestion([attempt(0, false), attempt(1, true)]);
        expect(s).toMatchObject({ stage: 1, dueAt: at(4), correctDays: 1 });

        const history = [attempt(0, false), attempt(1, true), attempt(4, true), attempt(11, true), attempt(27, true)];
        expect(scheduleQuestion(history)).toMatchObject({ stage: 4, dueAt: at(62), correctDays: 4 });
        expect(scheduleQuestion([...history, attempt(62, true)]).retired).toBe(true);
    });

    it('same-day correct answers earn no credit (no cramming)', () => {
        const s = scheduleQuestion([attempt(0, false), { timestamp: at(0, 2), isCorrect: true }]);
        expect(s).toMatchObject({ stage: 0, dueAt: at(1), correctDays: 0 });
    });

    it('a miss after progress restarts at 1 day and counts a lapse', () => {
        const s = scheduleQuestion([attempt(0, false), attempt(1, true), attempt(4, true), attempt(11, false)]);
        expect(s).toMatchObject({ stage: 0, dueAt: at(12), lapses: 2, correctDays: 0 });
    });

    it('confidence: guessed-correct enters at 1 day, unsure-correct at 3 days, sure-correct is not queued', () => {
        expect(scheduleQuestion([attempt(0, true, 'guess')])).toMatchObject({ stage: 0, dueAt: at(1) });
        expect(scheduleQuestion([attempt(0, true, 'unsure')])).toMatchObject({ stage: 1, dueAt: at(3) });
        expect(scheduleQuestion([attempt(0, true, 'sure')])).toBeNull();
        expect(scheduleQuestion([attempt(0, true)])).toBeNull(); // legacy attempts without a rating
    });

    it('a guessed-correct review does not advance the stage', () => {
        const s = scheduleQuestion([attempt(0, false), attempt(2, true, 'guess')]);
        expect(s).toMatchObject({ stage: 0, dueAt: at(3), correctDays: 0 });
    });

    it('a confident miss is flagged as a misconception and reviewed first', () => {
        const events = [
            { questionId: 'a', ...attempt(0, false, 'unsure') },
            { questionId: 'b', ...attempt(0, false, 'sure') },
            { questionId: 'c', ...attempt(5, false) }, // not yet due
        ];
        const { due, summary } = buildReviewQueue(events, at(2));
        expect(due.map((d) => d.questionId)).toEqual(['b', 'a']);
        expect(summary).toMatchObject({ dueNow: 2, misconceptionsDue: 1, inReview: 3, learning: 3, learned: 0 });
        expect(summary.nextDueAt).toBe(at(6));
        // A later-day correct answer clears the misconception flag
        expect(scheduleQuestion([attempt(0, false, 'sure'), attempt(1, true, 'sure')]).misconception).toBe(false);
    });

    it('counts a question as learned after 3 correct answers on separate days', () => {
        const events = [attempt(0, false), attempt(1, true), attempt(4, true), attempt(11, true)]
            .map((e) => ({ questionId: 'q', ...e }));
        expect(buildReviewQueue(events, at(12)).summary).toMatchObject({ learned: 1, learning: 0 });
    });
});

// ---------------------------------------------------- misconceptions ---

describe('repeated mistakes', () => {
    const codesFor = (id) => new Set(id.startsWith('tc') ? ['TC_NO_2PI'] : []);

    it('is active after 2 errors in 30 days and clears after 3 later correct answers on items testing it', () => {
        const errors = [
            { questionId: 'tc1', isCorrect: false, errorCode: 'TC_NO_2PI', timestamp: at(0) },
            { questionId: 'tc2', isCorrect: false, errorCode: 'TC_NO_2PI', timestamp: at(1) },
        ];
        let [m] = misconceptionSummary(errors, at(2), { codesFor });
        expect(m).toMatchObject({ code: 'TC_NO_2PI', recentErrors: 2, active: true, clearProgress: 0 });
        expect(m.title).toMatch(/2π/);

        const corrects = ['tc3', 'other', 'tc4', 'tc5'].map((id, i) => ({ questionId: id, isCorrect: true, timestamp: at(3 + i) }));
        [m] = misconceptionSummary([...errors, ...corrects], at(10), { codesFor });
        expect(m).toMatchObject({ active: false, clearProgress: 3 });

        // Older than 30 days: no longer active
        [m] = misconceptionSummary(errors, at(40), { codesFor });
        expect(m.active).toBe(false);
    });

    it('a new error resets clearing progress', () => {
        const events = [
            { questionId: 'tc1', isCorrect: false, errorCode: 'TC_NO_2PI', timestamp: at(0) },
            { questionId: 'tc2', isCorrect: true, timestamp: at(1) },
            { questionId: 'tc3', isCorrect: true, timestamp: at(2) },
            { questionId: 'tc4', isCorrect: false, errorCode: 'TC_NO_2PI', timestamp: at(3) },
        ];
        const [m] = misconceptionSummary(events, at(4), { codesFor });
        expect(m).toMatchObject({ active: true, clearProgress: 0 });
    });

    it('drills prefer unseen questions, then missed ones, and skip ones answered correctly in the last 3 days', () => {
        const pool = ['q1', 'q2', 'q3', 'q4'].map((questionId) => ({ questionId }));
        const events = [
            { questionId: 'q1', isCorrect: true, timestamp: at(9) }, // recent correct: skipped
            { questionId: 'q2', isCorrect: false, timestamp: at(5) },
            { questionId: 'q3', isCorrect: true, timestamp: at(1) },
        ];
        const picked = selectMisconceptionDrill(pool, 'X', events, 5, { now: at(10), idsFor: () => ['q1', 'q2', 'q3', 'q4'], rng: () => 0.5 });
        expect(picked.map((q) => q.questionId)).toEqual(['q4', 'q2', 'q3']);
    });
});

describe('distractor error map', () => {
    const vocab = misconceptionVocabulary();
    const map = distractorErrorMap();

    it('every code is in the vocabulary, every option exists, and keyed options are never tagged', () => {
        expect(Object.keys(map).length).toBeGreaterThan(400);
        for (const [id, byOption] of Object.entries(map)) {
            const q = byId.get(id);
            expect(q, id).toBeTruthy();
            for (const [text, code] of Object.entries(byOption)) {
                expect(vocab[code], `${id}: ${code}`).toBeTruthy();
                const idx = q.options.indexOf(text);
                expect(idx, `${id}: option text not found`).toBeGreaterThanOrEqual(0);
                expect(idx, `${id}: keyed option tagged`).not.toBe(q.answerIndex);
            }
        }
    });

    it('every vocabulary code has a title, a tip and at least one question to drill', () => {
        for (const [code, v] of Object.entries(vocab)) {
            expect(v.title && v.tip, code).toBeTruthy();
            expect(questionIdsForCode(code).length, code).toBeGreaterThan(0);
        }
    });

    it('looks up codes by exact option text', () => {
        const [id, byOption] = Object.entries(map)[0];
        const [text, code] = Object.entries(byOption)[0];
        expect(errorCodeFor(id, text)).toBe(code);
        expect(errorCodeFor(id, `${text} (edited)`)).toBeNull();
        expect(codesForQuestion(id).has(code)).toBe(true);
    });
});

// ------------------------------------------------------------- API ---

describe('reinforcement API', () => {
    setupTestDb();
    const app = makeApp();

    beforeAll(async () => {
        for (const c of challenge) await importQuestions({ data: c.data, sourceFile: `server/src/data/challenge/${c.file}` });
    });

    // A tagged Challenge question and one of its tagged wrong options
    const [taggedId, taggedOptions] = Object.entries(distractorErrorMap())[0];
    const [wrongText, wrongCode] = Object.entries(taggedOptions)[0];

    async function startChallengeWith(token, questionId) {
        // A misconception drill for that code always contains tagged questions;
        // loop until the session includes the one we want to answer.
        for (let i = 0; i < 40; i++) {
            const s = await request(app).post('/api/quiz/sessions').set(bearer(token))
                .send({ kind: 'misconception', code: wrongCode, questionCount: 10 });
            expect(s.status).toBe(201);
            const q = s.body.questions.find((x) => x.questionId === questionId);
            if (q) return { session: s.body.session, q };
        }
        throw new Error('question never selected');
    }

    it('records confidence and the misconception code, and returns the refresher', async () => {
        const u = await registerUser(app);
        const { session, q } = await startChallengeWith(u.token, taggedId);
        const res = await request(app).post(`/api/quiz/sessions/${session.sessionId}/answers`).set(bearer(u.token))
            .send({ questionId: taggedId, selectedIndex: q.options.indexOf(wrongText), confidence: 'sure' });
        expect(res.status).toBe(200);
        expect(res.body.isCorrect).toBe(false);
        expect(res.body.misconception).toMatchObject({ code: wrongCode });
        expect(res.body.misconception.tip.length).toBeGreaterThan(20);
        const ev = await AttemptEvent.findOne({ sessionId: session.sessionId, questionId: taggedId }).lean();
        expect(ev).toMatchObject({ confidence: 'sure', errorCode: wrongCode, isCorrect: false });
    });

    it('ignores invalid confidence values', async () => {
        const u = await registerUser(app);
        const { session, q } = await startChallengeWith(u.token, taggedId);
        const src = byId.get(taggedId);
        await request(app).post(`/api/quiz/sessions/${session.sessionId}/answers`).set(bearer(u.token))
            .send({ questionId: taggedId, selectedIndex: q.options.indexOf(src.options[src.answerIndex]), confidence: 'certain' });
        const ev = await AttemptEvent.findOne({ sessionId: session.sessionId }).lean();
        expect(ev.confidence).toBeUndefined();
        expect(ev.errorCode).toBeUndefined();
    });

    it('serves due reviews (misconceptions first), and the dashboard leads Today\'s Study with them', async () => {
        const u = await registerUser(app);
        const none = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'review-due', questionCount: 10 });
        expect(none.status).toBe(400);

        const ids = allChallenge.slice(0, 3).map((q) => q.id);
        const twoDaysAgo = Date.now() - 2 * DAY_MS;
        await AttemptEvent.insertMany(ids.map((questionId, i) => ({
            userId: u.id, questionId, domainId: 'domain-2', sectionId: 's', isCorrect: false,
            timestamp: twoDaysAgo + i, confidence: i === 2 ? 'sure' : 'unsure', scoredBy: 'server', sessionId: `seed_${i}`,
        })));

        const bad = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'review-due', questionCount: 7 });
        expect(bad.status).toBe(400);
        const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'review-due', questionCount: 10 });
        expect(s.status).toBe(201);
        expect(s.body.session.mode).toBe('practice');
        expect(new Set(s.body.questions.map((q) => q.questionId))).toEqual(new Set(ids));

        const dash = await request(app).get('/api/study/dashboard').set(bearer(u.token));
        expect(dash.body.reviews).toMatchObject({ dueNow: 3, misconceptionsDue: 1 });
        expect(dash.body.todaysStudy[0]).toMatchObject({ kind: 'reviews', due: 3 });
    });

    it('misconception drills only serve questions offering that mistake; unknown codes are rejected', async () => {
        const u = await registerUser(app);
        const bad = await request(app).post('/api/quiz/sessions').set(bearer(u.token))
            .send({ kind: 'misconception', code: 'NOT_A_CODE', questionCount: 5 });
        expect(bad.status).toBe(400);
        const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token))
            .send({ kind: 'misconception', code: wrongCode, questionCount: 5 });
        expect(s.status).toBe(201);
        expect(s.body.questions.length).toBeGreaterThan(0);
        for (const q of s.body.questions) expect(codesForQuestion(q.questionId).has(wrongCode)).toBe(true);
    });

    it('surfaces an active repeated mistake on the dashboard and in Today\'s Study', async () => {
        const u = await registerUser(app);
        await AttemptEvent.insertMany([0, 1].map((i) => ({
            userId: u.id, questionId: taggedId, domainId: 'domain-2', sectionId: 's', isCorrect: false,
            errorCode: wrongCode, timestamp: Date.now() - (i + 1) * 3600000, scoredBy: 'server', sessionId: `mc_${i}`,
        })));
        const dash = await request(app).get('/api/study/dashboard').set(bearer(u.token));
        expect(dash.body.misconceptions.active[0]).toMatchObject({ code: wrongCode, recentErrors: 2, active: true });
        expect(dash.body.todaysStudy.some((i) => i.kind === 'misconception' && i.code === wrongCode)).toBe(true);
    });
});
