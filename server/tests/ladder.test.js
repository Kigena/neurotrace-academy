import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { setupTestDb, makeApp, registerUser, bearer } from './helpers.js';
import { importQuestions, loadSourceFile } from '../src/services/questionImport.js';
import { QuizSession } from '../src/models/QuizSession.js';
import {
    ladderRungs,
    levelMixForRung,
    MAX_ADAPTIVE_INSERTS,
    pickAdaptiveQuestion,
} from '../src/services/adaptiveLadder.js';
import { buildMockSchedule } from '../src/services/mockSchedule.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const challengeDir = path.join(serverRoot, 'src/data/challenge');
const challenge = fs.readdirSync(challengeDir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => ({ file: f, data: loadSourceFile(path.join(challengeDir, f)) }));
const key = new Map(challenge.flatMap((c) => c.data.questions).map((q) => [q.id, q]));

// ------------------------------------------------------------- ladder ---

describe('level ladder', () => {
    const ev = (t, level, isCorrect, competency = 'technical') => ({ timestamp: t, cognitiveLevel: level, isCorrect, competency });

    it('starts at L4; two correct at or above the rung move up, a miss moves down, clamped to L3-L6', () => {
        expect(ladderRungs([ev(1, 4, true)]).technical).toMatchObject({ rung: 4, streak: 1, attempts: 1 });
        expect(ladderRungs([ev(1, 4, true), ev(2, 5, true)]).technical.rung).toBe(5);
        expect(ladderRungs([ev(1, 4, true), ev(2, 5, true), ev(3, 5, false)]).technical.rung).toBe(4);
        expect(ladderRungs([ev(1, 4, false), ev(2, 3, false), ev(3, 3, false)]).technical.rung).toBe(3);
        const up = Array.from({ length: 12 }, (_, i) => ev(i, 6, true));
        expect(ladderRungs(up).technical.rung).toBe(6);
    });

    it('easy correct answers below the rung do not promote; harder misses above it do not demote', () => {
        expect(ladderRungs([ev(1, 3, true), ev(2, 3, true), ev(3, 3, true)]).technical.rung).toBe(4);
        expect(ladderRungs([ev(1, 6, false)]).technical.rung).toBe(4);
    });

    it('keeps competencies separate and ignores foundation (no level) attempts', () => {
        const r = ladderRungs([ev(1, 4, true), ev(2, 4, true), ev(3, 4, false, 'montage'), { timestamp: 4, isCorrect: false }]);
        expect(r.technical.rung).toBe(5);
        expect(r.montage.rung).toBe(3);
        expect(Object.keys(r)).toEqual(['technical', 'montage']);
    });

    it('centres the level mix on the rung', () => {
        expect(levelMixForRung(4)).toEqual({ 3: 0.25, 4: 0.5, 5: 0.25 });
        expect(levelMixForRung(3)).toEqual({ 3: 0.75, 4: 0.25 });
        expect(levelMixForRung(6)).toEqual({ 5: 0.25, 6: 0.75 });
    });

    it('picks same-section first, then same competency, never a question already in the session or recently correct', () => {
        const failed = { questionId: 'f', sectionId: 's1', competency: 'montage', domainId: 'domain-2', cognitiveLevel: 5 };
        const pool = [
            { questionId: 'a', sectionId: 's2', competency: 'montage', domainId: 'domain-2', cognitiveLevel: 4 },
            { questionId: 'b', sectionId: 's1', competency: 'montage', domainId: 'domain-2', cognitiveLevel: 4 },
            { questionId: 'c', sectionId: 's1', competency: 'montage', domainId: 'domain-2', cognitiveLevel: 4 },
        ];
        const now = 10 * 86400000;
        const base = { failed, targetLevel: 4, events: [], now, rng: () => 0 };
        expect(pickAdaptiveQuestion(pool, { ...base, excludeIds: new Set() }).questionId).toBe('b');
        expect(pickAdaptiveQuestion(pool, { ...base, excludeIds: new Set(['b']) }).questionId).toBe('c');
        const events = [{ questionId: 'c', isCorrect: true, timestamp: now - 3600000 }];
        expect(pickAdaptiveQuestion(pool, { ...base, excludeIds: new Set(['b']), events }).questionId).toBe('a');
        expect(pickAdaptiveQuestion(pool, { ...base, excludeIds: new Set(['a', 'b', 'c']) })).toBeNull();
    });
});

// ------------------------------------------------------- mock schedule ---

describe('mock schedule', () => {
    const noonNY = (ymd) => Date.parse(`${ymd}T16:00:00Z`); // 12:00 in New York (EDT/EST safe)

    it('with no mocks: first mock due today, then every 14 days, final 7 days before the exam', () => {
        const s = buildMockSchedule({ now: noonNY('2026-10-02') });
        expect(s.slots.map((x) => x.date)).toEqual(['2026-10-02', '2026-10-16', '2026-10-30', '2026-11-13', '2026-11-27', '2026-12-07']);
        expect(s.slots[0].status).toBe('due');
        expect(s.dueNow).toBe(true);
        expect(s.slots.slice(1).every((x) => x.status === 'upcoming')).toBe(true);
        expect(s.daysToExam).toBe(73);
    });

    it('never schedules two mocks within a week of each other', () => {
        const s = buildMockSchedule({ now: noonNY('2026-10-10') });
        const days = s.slots.map((x) => Date.parse(x.date) / 86400000);
        for (let i = 1; i < days.length; i++) expect(days[i] - days[i - 1]).toBeGreaterThanOrEqual(7);
        expect(s.slots[s.slots.length - 1].date).toBe('2026-12-07');
    });

    it('a mock taken in a slot completes it; an empty slot past its window is missed', () => {
        const mocks = [{ endTime: noonNY('2026-10-03'), percent: 72, correct: 94, total: 130 }];
        const s = buildMockSchedule({ mocks, now: noonNY('2026-11-01') });
        expect(s.slots[0]).toMatchObject({ date: '2026-10-03', status: 'done', mock: { percent: 72 } });
        expect(s.slots[1]).toMatchObject({ date: '2026-10-17', status: 'missed' });
        expect(s.slots[2]).toMatchObject({ date: '2026-10-31', status: 'due' });
        expect(s.next.date).toBe('2026-10-31');
    });

    it('a slot can be taken up to 6 days early; nothing is scheduled after the exam', () => {
        const mocks = [{ endTime: noonNY('2026-10-02'), percent: 60 }];
        const s = buildMockSchedule({ mocks, now: noonNY('2026-10-12') });
        expect(s.slots[1]).toMatchObject({ date: '2026-10-16', status: 'upcoming', canTakeEarly: true });
        expect(buildMockSchedule({ now: noonNY('2026-12-20') }).slots).toEqual([]);
    });
});

// ---------------------------------------------------------------- API ---

describe('adaptive ladder in sessions', () => {
    setupTestDb();
    const app = makeApp();

    beforeAll(async () => {
        for (const c of challenge) await importQuestions({ data: c.data, sourceFile: `server/src/data/challenge/${c.file}` });
    });

    const wrongIndex = (q) => {
        const src = key.get(q.questionId);
        return q.options.findIndex((o) => o !== src.options[src.answerIndex]);
    };
    const rightIndex = (q) => {
        const src = key.get(q.questionId);
        return q.options.indexOf(src.options[src.answerIndex]);
    };
    const answer = (token, sessionId, q, selectedIndex) => request(app)
        .post(`/api/quiz/sessions/${sessionId}/answers`).set(bearer(token)).send({ questionId: q.questionId, selectedIndex });

    it('a miss inserts a step-down question one level lower; recovering inserts a climb-up at the original level', async () => {
        const u = await registerUser(app);
        const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token))
            .send({ kind: 'challenge', questionCount: 10, competencies: ['clinical'] });
        expect(s.status).toBe(201);
        const missed = s.body.questions.find((q) => q.cognitiveLevel >= 5);
        expect(missed).toBeTruthy();

        const r1 = await answer(u.token, s.body.session.sessionId, missed, wrongIndex(missed));
        expect(r1.body.isCorrect).toBe(false);
        const down = r1.body.inserted;
        expect(down.afterQuestionId).toBe(missed.questionId);
        expect(down.question).toMatchObject({ adaptive: { role: 'step-down', fromLevel: missed.cognitiveLevel } });
        expect(down.question.cognitiveLevel).toBeLessThan(missed.cognitiveLevel);
        expect('answerIndex' in down.question || 'explanation' in down.question).toBe(false);

        // The session now holds the new item right after the missed one
        const session = await QuizSession.findOne({ sessionId: s.body.session.sessionId }).lean();
        const ids = session.items.map((i) => i.questionId);
        expect(ids[ids.indexOf(missed.questionId) + 1]).toBe(down.question.questionId);
        expect(session.items).toHaveLength(11);

        const r2 = await answer(u.token, s.body.session.sessionId, down.question, rightIndex(down.question));
        expect(r2.body.isCorrect).toBe(true);
        expect(r2.body.inserted.question).toMatchObject({ adaptive: { role: 'climb-up', fromLevel: missed.cognitiveLevel } });
        expect(r2.body.inserted.question.cognitiveLevel).toBe(missed.cognitiveLevel);

        // Resume returns the inserted questions with their roles
        const resumed = await request(app).get('/api/quiz/sessions/active').set(bearer(u.token));
        expect(resumed.body.questions.filter((q) => q.adaptive).map((q) => q.adaptive.role)).toEqual(['step-down', 'climb-up']);
    });

    it('caps adaptive inserts per session and never inserts after correct non-step-down answers', async () => {
        const u = await registerUser(app);
        const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'challenge', questionCount: 30 });
        const sid = s.body.session.sessionId;
        const right = s.body.questions.find((q) => q.cognitiveLevel >= 4);
        expect((await answer(u.token, sid, right, rightIndex(right))).body.inserted).toBeNull();

        let inserts = 0;
        for (const q of s.body.questions.filter((x) => x.cognitiveLevel >= 4 && x.questionId !== right.questionId)) {
            const r = await answer(u.token, sid, q, wrongIndex(q));
            if (r.body.inserted) inserts += 1;
        }
        expect(inserts).toBe(MAX_ADAPTIVE_INSERTS);
    });

    it('the dashboard reports the ladder and the mock schedule, with a due mock last in Today\'s Study', async () => {
        const u = await registerUser(app);
        const dash = await request(app).get('/api/study/dashboard').set(bearer(u.token));
        expect(dash.body.mockSchedule.dueNow).toBe(true);
        expect(dash.body.mockSchedule.slots[0].status).toBe('due');
        expect(dash.body.ladder).toEqual({});
        const plan = dash.body.todaysStudy;
        expect(plan[plan.length - 1]).toMatchObject({ kind: 'mock', count: 130 });
    });
});
