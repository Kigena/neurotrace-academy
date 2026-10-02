import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupTestDb, makeApp, registerUser, bearer } from './helpers.js';
import { importQuestions, loadSourceFile } from '../src/services/questionImport.js';
import { DailyPlan } from '../src/models/DailyPlan.js';
import { planDateFor } from '../src/services/dailyPlan.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const challengeDir = path.join(serverRoot, 'src/data/challenge');
const pilotFile = 'abret-challenge-pilot.json';
const pilot = loadSourceFile(path.join(challengeDir, pilotFile));
const key = new Map(pilot.questions.map((q) => [q.id, q]));

setupTestDb();
const app = makeApp();

beforeAll(async () => {
    await importQuestions({ data: pilot, sourceFile: `server/src/data/challenge/${pilotFile}` });
});

const dashboard = (token) => request(app).get('/api/study/dashboard').set(bearer(token));

async function startItem(token, item) {
    const body = { kind: 'challenge', questionCount: item.count, planItemId: item.id };
    if (item.competency) body.competencies = [item.competency];
    const s = await request(app).post('/api/quiz/sessions').set(bearer(token)).send(body);
    expect(s.status).toBe(201);
    return s.body;
}

async function answerAll(token, payload) {
    for (const q of payload.questions) {
        const src = key.get(q.questionId);
        await request(app).post(`/api/quiz/sessions/${payload.session.sessionId}/answers`).set(bearer(token))
            .send({ questionId: q.questionId, selectedIndex: q.options.indexOf(src.options[src.answerIndex]), confidence: 'sure' });
    }
}

describe("Today's Study tracking", () => {
    it('plan items carry ids and pending status, with a progress count', async () => {
        const u = await registerUser(app);
        const dash = await dashboard(u.token);
        expect(dash.status).toBe(200);
        expect(dash.body.todaysStudy.length).toBeGreaterThan(0);
        for (const [i, item] of dash.body.todaysStudy.entries()) {
            expect(item).toMatchObject({ id: `p${i + 1}`, status: 'pending' });
        }
        expect(dash.body.todaysProgress).toMatchObject({ done: 0, total: dash.body.todaysStudy.length, date: planDateFor() });
    });

    it('starting an item marks it started and fixes the plan; finishing every question marks it done', async () => {
        const u = await registerUser(app);
        const first = (await dashboard(u.token)).body.todaysStudy[0];
        expect(first.kind).toBe('challenge');

        const payload = await startItem(u.token, first);
        let dash = await dashboard(u.token);
        const started = dash.body.todaysStudy.find((i) => i.id === first.id);
        expect(started).toMatchObject({ status: 'started', sessionId: payload.session.sessionId });
        const planBefore = dash.body.todaysStudy.map(({ id, kind, competency }) => ({ id, kind, competency }));

        await answerAll(u.token, payload);
        dash = await dashboard(u.token);
        expect(dash.body.todaysStudy.find((i) => i.id === first.id).status).toBe('done');
        expect(dash.body.todaysProgress.done).toBe(1);
        // The plan stayed fixed even though new answers changed the analytics
        expect(dash.body.todaysStudy.map(({ id, kind, competency }) => ({ id, kind, competency }))).toEqual(planBefore);
    });

    it('submitting a session early also marks its item done', async () => {
        const u = await registerUser(app);
        const item = (await dashboard(u.token)).body.todaysStudy[1];
        const payload = await startItem(u.token, item);
        const sub = await request(app).post(`/api/quiz/sessions/${payload.session.sessionId}/submit`).set(bearer(u.token));
        expect(sub.status).toBe(200);
        const dash = await dashboard(u.token);
        expect(dash.body.todaysStudy.find((i) => i.id === item.id).status).toBe('done');
    });

    it('ignores unknown plan item ids and never links another user\'s plan', async () => {
        const a = await registerUser(app);
        const b = await registerUser(app);
        const aItem = (await dashboard(a.token)).body.todaysStudy[0];
        await dashboard(b.token);

        const s = await request(app).post('/api/quiz/sessions').set(bearer(b.token))
            .send({ kind: 'challenge', questionCount: 10, planItemId: 'p99' });
        expect(s.status).toBe(201);
        // b starts a session claiming a's item id: only b's own plan can change
        await request(app).post('/api/quiz/sessions').set(bearer(b.token))
            .send({ kind: 'challenge', questionCount: 10, planItemId: aItem.id });
        const aPlan = await DailyPlan.findOne({ userId: a.id }).lean();
        expect(aPlan.items.every((i) => i.status === 'pending')).toBe(true);
    });
});

describe('clinical case progress', () => {
    it('records completions per user with latest and best score', async () => {
        const u = await registerUser(app);
        const other = await registerUser(app);

        const bad = await request(app).post('/api/case-progress/case-0022').set(bearer(u.token)).send({ correct: 3, total: 2 });
        expect(bad.status).toBe(400);
        const badId = await request(app).post('/api/case-progress/bad$id').set(bearer(u.token)).send({ correct: 1, total: 2 });
        expect(badId.status).toBe(400);
        expect((await request(app).get('/api/case-progress')).status).toBe(401);

        let r = await request(app).post('/api/case-progress/case-0022').set(bearer(u.token))
            .send({ correct: 1, total: 2, title: 'Montage Selection' });
        expect(r.status).toBe(200);
        expect(r.body).toMatchObject({ caseId: 'case-0022', completions: 1, lastCorrect: 1, bestCorrect: 1, title: 'Montage Selection' });
        r = await request(app).post('/api/case-progress/case-0022').set(bearer(u.token)).send({ correct: 2, total: 2 });
        expect(r.body).toMatchObject({ completions: 2, lastCorrect: 2, bestCorrect: 2, title: 'Montage Selection' });
        r = await request(app).post('/api/case-progress/case-0022').set(bearer(u.token)).send({ correct: 0, total: 2 });
        expect(r.body).toMatchObject({ completions: 3, lastCorrect: 0, bestCorrect: 2 });

        const mine = await request(app).get('/api/case-progress').set(bearer(u.token));
        expect(mine.body.items.map((i) => i.caseId)).toEqual(['case-0022']);
        const theirs = await request(app).get('/api/case-progress').set(bearer(other.token));
        expect(theirs.body.items).toEqual([]);
    });
});
