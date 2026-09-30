import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { setupTestDb, makeApp, registerUser, bearer, seedFixtureBank } from './helpers.js';
import { AttemptEvent } from '../src/models/AttemptEvent.js';
import {
    buildDailyPlan,
    buildStudyProfile,
    computeMastery,
    computeReadiness,
    masteryFromAttempts,
    recentPerformance,
    selectWeakAreas,
} from '../src/services/studyAnalytics.js';

// ------------------------------------------------------------ pure logic ---

const ev = (isCorrect, t, extra = {}) => ({ isCorrect, timestamp: t, questionId: `q${t}`, domainId: 'domain-2', sectionId: 's', topicTags: [], ...extra });

describe('mastery', () => {
    it('does not claim mastery with fewer than 5 attempts', () => {
        const m = masteryFromAttempts([ev(true, 1), ev(true, 2), ev(true, 3), ev(true, 4)]);
        expect(m.sufficient).toBe(false);
        expect(m.label).toBe('Insufficient data');
        expect(m.score).toBeLessThan(85); // shrunk toward 50, never "Strong"
    });

    it('shrinks low-evidence scores toward 50 and grows with evidence', () => {
        const five = masteryFromAttempts(Array.from({ length: 5 }, (_, i) => ev(true, i)));
        const thirty = masteryFromAttempts(Array.from({ length: 30 }, (_, i) => ev(true, i)));
        expect(five.score).toBe(81);
        expect(five.label).toBe('Good');
        expect(thirty.score).toBe(95);
        expect(thirty.label).toBe('Strong');
        const allWrong = masteryFromAttempts(Array.from({ length: 5 }, (_, i) => ev(false, i)));
        expect(allWrong.score).toBe(19);
        expect(allWrong.label).toBe('Weak');
    });

    it('weights recent attempts more than older ones and uses only the last 30', () => {
        const improving = [...Array.from({ length: 10 }, (_, i) => ev(false, i)), ...Array.from({ length: 10 }, (_, i) => ev(true, 100 + i))];
        const declining = [...Array.from({ length: 10 }, (_, i) => ev(true, i)), ...Array.from({ length: 10 }, (_, i) => ev(false, 100 + i))];
        expect(masteryFromAttempts(improving).score).toBeGreaterThan(masteryFromAttempts(declining).score);
        const old = Array.from({ length: 40 }, (_, i) => ev(false, i));
        const recent = Array.from({ length: 30 }, (_, i) => ev(true, 1000 + i));
        expect(masteryFromAttempts([...old, ...recent]).attempts).toBe(30);
        expect(masteryFromAttempts([...old, ...recent]).accuracy).toBe(100);
    });

    it('labels by band', () => {
        const at = (correct, total) => masteryFromAttempts(Array.from({ length: total }, (_, i) => ev(i < correct, i)));
        expect(at(30, 30).label).toBe('Strong');
        expect(at(0, 30).label).toBe('Weak');
    });
});

describe('readiness', () => {
    it('is null with no data and never invents components', () => {
        const events = [];
        const r = computeReadiness({ mastery: computeMastery(events), performance: recentPerformance(events), events, totalSections: 47, mockResults: [] });
        expect(r.score).toBeNull();
        expect(r.label).toBe('Not enough data');
        expect(r.components.every((c) => !c.available && c.score === null)).toBe(true);
        expect(r.disclaimer).toMatch(/not a probability of passing/i);
    });

    it('combines available components with 50/25/15/10 weights and counts unassessed domains as 0', () => {
        // 10 correct answers in domain-2 only, 1 section, one 60% mock.
        const events = Array.from({ length: 10 }, (_, i) => ev(true, i, { sectionId: 'd2-x' }));
        const r = computeReadiness({
            mastery: computeMastery(events),
            performance: recentPerformance(events),
            events,
            totalSections: 10,
            mockResults: [{ percent: 60 }],
        });
        const c = Object.fromEntries(r.components.map((x) => [x.key, x]));
        // domain-2 mastery (10/10) = round(100*(10+1.5)/13)=88; weighted 0.46*88 = 40.5 -> 40
        expect(c.domainMastery.score).toBe(40);
        expect(c.recentPerformance.score).toBe(100);
        expect(c.coverage.score).toBe(10);
        expect(c.mock.score).toBe(60);
        expect(r.measuredWeightPercent).toBe(100);
        expect(r.score).toBe(Math.round(0.5 * 40 + 0.25 * 100 + 0.15 * 10 + 0.1 * 60));
    });

    it('re-normalises when components are missing', () => {
        const events = Array.from({ length: 3 }, (_, i) => ev(true, i, { sectionId: 'd2-x' }));
        const r = computeReadiness({ mastery: computeMastery(events), performance: recentPerformance(events), events, totalSections: 10, mockResults: [] });
        expect(r.measuredWeightPercent).toBe(15); // coverage only
        expect(r.score).toBe(10); // 1 section with 3+ of 10
    });
});

describe('daily plan', () => {
    const sectionDomains = { 'd1-a': 'domain-1', 'd2-a': 'domain-2', 'd3-a': 'domain-3', 'd4-a': 'domain-4' };
    // Correct answers spread evenly over time so recency weighting is neutral.
    const eventsFor = (sectionId, domainId, correct, total) =>
        Array.from({ length: total }, (_, i) => ev(
            Math.floor(((i + 1) * correct) / total) > Math.floor((i * correct) / total),
            i,
            { sectionId, domainId, questionId: `${sectionId}-${i}` }
        ));

    it('prefers Domain II when weakness is similar', () => {
        const events = [
            ...eventsFor('d1-a', 'domain-1', 15, 30), // mastery 50
            ...eventsFor('d2-a', 'domain-2', 16, 30), // mastery 53: slightly stronger, but D2
            ...eventsFor('d4-a', 'domain-4', 27, 30),
        ];
        const plan = buildDailyPlan({ mastery: computeMastery(events), incorrectCount: 3, sectionDomains });
        expect(plan[0]).toMatchObject({ kind: 'section', sectionId: 'd2-a' });
        expect(plan[1]).toMatchObject({ kind: 'section', sectionId: 'd1-a' });
        expect(plan.find((p) => p.kind === 'review').count).toBe(3);
        expect(plan[plan.length - 1]).toMatchObject({ kind: 'mixed', count: 10 });
    });

    it('does not override a clearly weaker non-D2 section', () => {
        const events = [...eventsFor('d1-a', 'domain-1', 3, 30), ...eventsFor('d2-a', 'domain-2', 18, 30)];
        const plan = buildDailyPlan({ mastery: computeMastery(events), incorrectCount: 0, sectionDomains });
        expect(plan[0].sectionId).toBe('d1-a');
        expect(plan.some((p) => p.kind === 'review')).toBe(false);
    });

    it('is deterministic and starts with Domain II when there is no data', () => {
        const a = buildDailyPlan({ mastery: computeMastery([]), incorrectCount: 0, sectionDomains });
        const b = buildDailyPlan({ mastery: computeMastery([]), incorrectCount: 0, sectionDomains });
        expect(a).toEqual(b);
        expect(a[0]).toMatchObject({ kind: 'domain', domainId: 'domain-2' });
    });
});

// Deterministic PRNG so the statistical assertions below never flake.
function seeded(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

describe('weak-area selection', () => {
    const pool = [];
    for (let d = 1; d <= 4; d++) {
        for (let s = 0; s < 5; s++) {
            for (let i = 0; i < 20; i++) {
                pool.push({ questionId: `d${d}s${s}q${i}`, domainId: `domain-${d}`, sectionId: `d${d}-s${s}`, topicTags: [`t${d}${s}`] });
            }
        }
    }
    const now = Date.now();
    // Weak: d1-s0 (all wrong). Strong: every other section answered correctly today.
    const events = [];
    for (const q of pool.filter((x) => x.questionId.endsWith('q0') || x.questionId.endsWith('q1') || x.questionId.endsWith('q2') || x.questionId.endsWith('q3') || x.questionId.endsWith('q4'))) {
        events.push({ ...q, isCorrect: q.sectionId !== 'd1-s0', timestamp: now - 1000 });
    }
    const profile = buildStudyProfile(events);

    it('over-represents weak topics but keeps the session mixed', () => {
        let weakHits = 0;
        let total = 0;
        const sectionsSeen = new Set();
        const rng = seeded(42);
        for (let i = 0; i < 40; i++) {
            const picked = selectWeakAreas(pool, profile, 20, { now, rng });
            expect(picked).toHaveLength(20);
            expect(new Set(picked.map((q) => q.questionId)).size).toBe(20);
            picked.forEach((q) => sectionsSeen.add(q.sectionId));
            weakHits += picked.filter((q) => q.sectionId === 'd1-s0').length;
            total += picked.length;
            const perSection = {};
            picked.forEach((q) => { perSection[q.sectionId] = (perSection[q.sectionId] || 0) + 1; });
            expect(Math.max(...Object.values(perSection))).toBeLessThanOrEqual(6); // 30% cap
            expect(Object.keys(perSection).length).toBeGreaterThanOrEqual(4);
        }
        // d1-s0 is 5% of the pool; weak-area sessions should give it far more.
        expect(weakHits / total).toBeGreaterThan(0.2);
        expect(sectionsSeen.size).toBeGreaterThan(5);
    });

    it('favours Domain II over other domains when mastery is equal', () => {
        const flat = buildStudyProfile([]);
        const counts = { 'domain-1': 0, 'domain-2': 0, 'domain-3': 0, 'domain-4': 0 };
        const rng = seeded(7);
        for (let i = 0; i < 300; i++) {
            selectWeakAreas(pool, flat, 30, { now, rng }).forEach((q) => { counts[q.domainId] += 1; });
        }
        expect(counts['domain-2']).toBeGreaterThan(counts['domain-1']);
        expect(counts['domain-2']).toBeGreaterThan(counts['domain-3']);
        expect(counts['domain-2']).toBeGreaterThan(counts['domain-4']);
    });
});

// ------------------------------------------------------------------- API ---

describe('study API', () => {
    setupTestDb();
    const app = makeApp();
    let bank;
    let key;
    beforeAll(async () => {
        bank = await seedFixtureBank(70);
        key = new Map(bank.questions.map((q) => [q.id, q]));
    });

    const correctIdx = (q) => q.options.indexOf(key.get(q.questionId).options[key.get(q.questionId).answerIndex]);

    async function practice(user, n, filters, pick) {
        const s = await request(app).post('/api/quiz/sessions').set(bearer(user.token)).send({ kind: 'custom', mode: 'practice', questionCount: n, filters });
        for (const q of s.body.questions) {
            await request(app).post(`/api/quiz/sessions/${s.body.session.sessionId}/answers`).set(bearer(user.token))
                .send({ questionId: q.questionId, selectedIndex: pick(q) });
        }
        await request(app).post(`/api/quiz/sessions/${s.body.session.sessionId}/submit`).set(bearer(user.token));
        return s.body.questions;
    }

    it('dashboard loads for a new user with honest empty states', async () => {
        const u = await registerUser(app);
        const res = await request(app).get('/api/study/dashboard').set(bearer(u.token));
        expect(res.status).toBe(200);
        expect(res.body.readiness.score).toBeNull();
        expect(res.body.performance.totalAttempts).toBe(0);
        expect(res.body.todaysStudy[0]).toMatchObject({ kind: 'domain', domainId: 'domain-2' });
        expect(res.body.lastMock).toBeNull();
    });

    it('review incorrect lists missed questions; retry adds an attempt and preserves the original error', async () => {
        const u = await registerUser(app);
        // Answer 6 domain-3 questions wrong, 6 domain-1 right.
        const wrongQs = await practice(u, 6, { domains: ['domain-3'] }, (q) => (correctIdx(q) + 1) % 4);
        await practice(u, 6, { domains: ['domain-1'] }, correctIdx);

        const dash = await request(app).get('/api/study/dashboard').set(bearer(u.token));
        expect(dash.body.performance.totalAttempts).toBe(12);
        expect(dash.body.incorrectOutstanding).toBe(6);
        expect(dash.body.mastery.byDomain['domain-3'].label).toBe('Weak');
        expect(dash.body.mastery.byDomain['domain-1'].sufficient).toBe(true);
        expect(dash.body.readiness.score).not.toBeNull();

        const list = await request(app).get('/api/study/incorrect').set(bearer(u.token));
        expect(list.body.total).toBe(6);
        const item = list.body.items[0];
        expect(item).toHaveProperty('explanation');
        expect(item.selectedIndex).not.toBe(item.correctIndex);
        expect(item.domainId).toBe('domain-3');
        expect(Array.isArray(item.topicTags)).toBe(true);

        // Retry view hides the answer.
        const view = await request(app).get(`/api/study/retry/${item.questionId}`).set(bearer(u.token));
        expect(JSON.stringify(view.body)).not.toMatch(/answerIndex|explanation/);

        const before = await AttemptEvent.find({ userId: u.id, questionId: item.questionId }).lean();
        const retry = await request(app).post(`/api/study/retry/${item.questionId}`).set(bearer(u.token)).send({ selectedIndex: item.correctIndex });
        expect(retry.status).toBe(200);
        expect(retry.body.isCorrect).toBe(true);

        const after = await AttemptEvent.find({ userId: u.id, questionId: item.questionId }).sort({ timestamp: 1 }).lean();
        expect(after).toHaveLength(before.length + 1);
        expect(after[0].isCorrect).toBe(false); // original error preserved
        expect(after[after.length - 1]).toMatchObject({ isCorrect: true, mode: 'review' });

        const list2 = await request(app).get('/api/study/incorrect').set(bearer(u.token));
        expect(list2.body.total).toBe(5);
        expect(wrongQs.length).toBe(6);
    });

    it('retry is refused for questions never answered incorrectly', async () => {
        const u = await registerUser(app);
        const res = await request(app).get('/api/study/retry/fx-d1-0').set(bearer(u.token));
        expect(res.status).toBe(404);
        const post = await request(app).post('/api/study/retry/fx-d1-0').set(bearer(u.token)).send({ selectedIndex: 0 });
        expect(post.status).toBe(404);
    });

    it('weak-area sessions favour the weak domain and hide answers', async () => {
        const u = await registerUser(app);
        await practice(u, 12, { domains: ['domain-4'] }, (q) => (correctIdx(q) + 1) % 4); // weak
        await practice(u, 12, { domains: ['domain-1'] }, correctIdx);                        // strong

        const bad = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'weak-areas', questionCount: 15 });
        expect(bad.status).toBe(400);

        let d4 = 0;
        let d1 = 0;
        for (let i = 0; i < 5; i++) {
            const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'weak-areas', questionCount: 20 });
            expect(s.status).toBe(201);
            expect(s.body.session.mode).toBe('practice');
            expect(s.body.questions).toHaveLength(20);
            expect(JSON.stringify(s.body.questions)).not.toMatch(/answerIndex|explanation/);
            d4 += s.body.questions.filter((q) => q.domainId === 'domain-4').length;
            d1 += s.body.questions.filter((q) => q.domainId === 'domain-1').length;
        }
        expect(d4).toBeGreaterThan(d1);
    });

    it('study data is private to each user', async () => {
        const a = await registerUser(app);
        const b = await registerUser(app);
        await practice(a, 6, { domains: ['domain-2'] }, (q) => (correctIdx(q) + 1) % 4);
        const bDash = await request(app).get('/api/study/dashboard').set(bearer(b.token));
        expect(bDash.body.performance.totalAttempts).toBe(0);
        const bList = await request(app).get('/api/study/incorrect').set(bearer(b.token));
        expect(bList.body.total).toBe(0);
        const unauth = await request(app).get('/api/study/dashboard');
        expect(unauth.status).toBe(401);
    });

    it('mock results feed the dashboard and the full mock keeps 19/60/25/26', async () => {
        const u = await registerUser(app);
        const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'preset', presetId: 'mock-full-130' });
        const counts = {};
        s.body.questions.forEach((q) => { counts[q.domainId] = (counts[q.domainId] || 0) + 1; });
        expect(counts).toEqual({ 'domain-1': 19, 'domain-2': 60, 'domain-3': 25, 'domain-4': 26 });
        for (const q of s.body.questions.slice(0, 13)) {
            await request(app).post(`/api/quiz/sessions/${s.body.session.sessionId}/answers`).set(bearer(u.token)).send({ questionId: q.questionId, selectedIndex: correctIdx(q) });
        }
        await request(app).post(`/api/quiz/sessions/${s.body.session.sessionId}/submit`).set(bearer(u.token));
        const dash = await request(app).get('/api/study/dashboard').set(bearer(u.token));
        expect(dash.body.lastMock).toMatchObject({ presetId: 'mock-full-130', correct: 13, total: 130, percent: 10 });
        expect(dash.body.readiness.components.find((c) => c.key === 'mock').score).toBe(10);
    });
});
