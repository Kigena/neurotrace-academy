import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { setupTestDb, makeApp, registerUser, bearer, seedFixtureBank } from './helpers.js';
import { computeWeakTopics } from '../src/services/progressStats.js';
import { AttemptEvent } from '../src/models/AttemptEvent.js';

setupTestDb();
const app = makeApp();

let bank;
beforeAll(async () => {
    bank = await seedFixtureBank(40);
});

function ev(tag, isCorrect, t) {
    return { topicTags: [tag], isCorrect, timestamp: t };
}

describe('weak-topic rule (unchanged semantics)', () => {
    it('flags a tag with >= minAttempts and accuracy < 70% over the last k', () => {
        const events = [
            ...Array.from({ length: 10 }, (_, i) => ev('weak', i < 3, i)),   // 30%
            ...Array.from({ length: 10 }, (_, i) => ev('strong', i < 9, i)), // 90%
            ...Array.from({ length: 3 }, (_, i) => ev('few', false, i)),     // too few
        ];
        const weak = computeWeakTopics(events, 30, 5);
        expect(Object.keys(weak)).toEqual(['weak']);
        expect(weak.weak.accuracy).toBe(30);
        expect(weak.weak.attempts).toBe(10);
    });

    it('uses only the most recent k attempts and computes the trend', () => {
        // 20 old wrong answers, then 10 recent correct ones.
        const events = [
            ...Array.from({ length: 20 }, (_, i) => ev('t', false, i)),
            ...Array.from({ length: 10 }, (_, i) => ev('t', true, 100 + i)),
        ];
        const w = computeWeakTopics(events, 30, 5).t;
        expect(w.accuracy).toBe(33);
        expect(w.last10Accuracy).toBe(100);
        expect(w.prev10Accuracy).toBe(0);
        expect(w.trend).toBe(100);
        expect(computeWeakTopics(events, 10, 5).t).toBeUndefined(); // last 10 are all correct
    });
});

describe('progress isolation between users', () => {
    it("user A's attempts never affect user B's progress, weak topics or history", async () => {
        const a = await registerUser(app, { name: 'A' });
        const b = await registerUser(app, { name: 'B' });
        const key = new Map(bank.questions.map((q) => [q.id, q]));

        // User A answers 12 practice questions in domain-2 deliberately wrong.
        const s = await request(app).post('/api/quiz/sessions').set(bearer(a.token))
            .send({ kind: 'custom', mode: 'practice', questionCount: 12, filters: { domains: ['domain-2'] } });
        expect(s.status).toBe(201);
        for (const q of s.body.questions) {
            const src = key.get(q.questionId);
            const correct = q.options.indexOf(src.options[src.answerIndex]);
            await request(app).post(`/api/quiz/sessions/${s.body.session.sessionId}/answers`).set(bearer(a.token))
                .send({ questionId: q.questionId, selectedIndex: (correct + 1) % 4 });
        }

        const aWeak = await request(app).get('/api/progress/weak-topics?k=30&minAttempts=5').set(bearer(a.token));
        expect(aWeak.status).toBe(200);
        expect(aWeak.body.totals.totalAttempts).toBe(12);
        expect(aWeak.body.weakTopics['tag-d2']).toBeTruthy();

        const bWeak = await request(app).get('/api/progress/weak-topics?k=30&minAttempts=5').set(bearer(b.token));
        expect(bWeak.body.totals.totalAttempts).toBe(0);
        expect(bWeak.body.weakTopics).toEqual({});

        const bProgress = await request(app).get('/api/progress').set(bearer(b.token));
        expect(bProgress.body).toEqual([]);

        const bSessions = await request(app).get('/api/sessions').set(bearer(b.token));
        expect(bSessions.body).toEqual([]);

        const bStats = await request(app).get('/api/quiz/stats').set(bearer(b.token));
        expect(bStats.body.totalQuizzes).toBe(0);
    });

    it('legacy events without a userId are not attributed to anyone', async () => {
        await AttemptEvent.create({ questionId: 'fx-d1-0', domainId: 'domain-1', sectionId: 'd1-sec-0', topicTags: ['orphan'], isCorrect: false, timestamp: Date.now() });
        const c = await registerUser(app);
        const res = await request(app).get('/api/progress').set(bearer(c.token));
        expect(res.body).toEqual([]);
    });
});
