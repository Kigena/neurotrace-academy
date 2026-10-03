import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { setupTestDb, makeApp, registerUser, bearer } from './helpers.js';
import GamificationService, { PERFECT_MIN_QUESTIONS } from '../src/services/gamificationService.js';
import { QuizSession } from '../src/models/QuizSession.js';
import UserProgress from '../src/models/UserProgress.js';

setupTestDb();
const app = makeApp();

beforeAll(async () => {
    await GamificationService.initializeDefaultAchievements();
});

let n = 0;
function session(userId, { status = 'submitted', mode = 'practice', total, correct, answered = total }) {
    n += 1;
    const items = Array.from({ length: total }, (_, i) => ({ questionId: `q${n}-${i}`, optionOrder: [0, 1, 2, 3] }));
    const answers = Object.fromEntries(items.slice(0, answered).map((it, i) => [it.questionId, {
        chosenIndex: 0, originalIndex: i < correct ? 0 : 1, isCorrect: i < correct, answeredAt: new Date(),
    }]));
    return QuizSession.create({
        userId, sessionId: `s_${n}_${Date.now()}`, engineVersion: 2, mode, kind: 'custom', status,
        items, questionIds: items.map((i) => i.questionId), answers, startTime: Date.now(),
        result: status === 'submitted' ? { correct, attempted: answered, total, percent: Math.round((100 * correct) / total) } : undefined,
    });
}

const unlockedKeys = async (token) => (await request(app).get('/api/gamification/achievements').set(bearer(token)))
    .body.filter((a) => a.unlocked).map((a) => a.key);

describe('badge calculation', () => {
    it('counts the quiz engine\'s activity types (quiz_completion / quiz_perfect)', async () => {
        const p = new UserProgress({ user: new mongoose.Types.ObjectId() });
        await GamificationService.updateStats(p, 'quiz_completion', {});
        await GamificationService.updateStats(p, 'quiz_perfect', {});
        expect(p.stats.quizzesCompleted).toBe(2);
        expect(p.stats.quizzesPerfect).toBe(1);
    });

    it('derives quiz badges from completed sessions: submitted or fully answered practice; perfect needs 10+ questions', async () => {
        const u = await registerUser(app);
        await session(u.id, { total: 12, correct: 12 }); // perfect
        await session(u.id, { status: 'active', total: 3, correct: 2 }); // practice, fully answered
        await session(u.id, { status: 'submitted', total: 1, correct: 1 }); // completed, too short for "perfect"
        await session(u.id, { status: 'abandoned', total: 10, correct: 2, answered: 4 }); // not completed

        expect(await unlockedKeys(u.token)).toContain('first_quiz');
        const prog = (await request(app).get('/api/gamification/progress').set(bearer(u.token))).body;
        const stats = prog.stats || prog.progress?.stats;
        expect(stats.quizzesCompleted).toBe(3);
        expect(stats.quizzesPerfect).toBe(1);
    });

    it('perfectionist unlocks after 5 perfect quizzes of 10+ questions', async () => {
        const u = await registerUser(app);
        for (let i = 0; i < 4; i++) await session(u.id, { total: PERFECT_MIN_QUESTIONS, correct: PERFECT_MIN_QUESTIONS });
        expect(await unlockedKeys(u.token)).not.toContain('perfectionist');
        await session(u.id, { total: 20, correct: 20 });
        expect(await unlockedKeys(u.token)).toContain('perfectionist');
    });

    it('records distinct studied patterns and syndromes once each', async () => {
        const u = await registerUser(app);
        const post = (body) => request(app).post('/api/gamification/studied').set(bearer(u.token)).send(body);
        expect((await post({ kind: 'pattern', id: 'spike-wave-3hz' })).body).toMatchObject({ firstTime: true, studied: 1 });
        expect((await post({ kind: 'pattern', id: 'spike-wave-3hz' })).body).toMatchObject({ firstTime: false, studied: 1 });
        expect((await post({ kind: 'pattern', id: 'lpds' })).body).toMatchObject({ firstTime: true, studied: 2 });
        expect((await post({ kind: 'syndrome', id: 'cae' })).body).toMatchObject({ firstTime: true, studied: 1 });
        expect((await post({ kind: 'video', id: 'x' })).status).toBe(400);
        expect((await post({ kind: 'pattern', id: 'bad id!' })).status).toBe(400);
        expect((await request(app).post('/api/gamification/studied').send({ kind: 'pattern', id: 'x' })).status).toBe(401);
        const p = await UserProgress.findOne({ user: u.id }).lean();
        expect(p.stats.patternsStudied).toBe(2);
        expect(p.stats.syndromesStudied).toBe(1);
        expect(p.xp).toBeGreaterThan(0);
    });

    it('reconciling twice does not unlock or award anything twice', async () => {
        const u = await registerUser(app);
        await session(u.id, { total: 10, correct: 10 });
        await request(app).get('/api/gamification/achievements').set(bearer(u.token));
        const xp1 = (await UserProgress.findOne({ user: u.id }).lean()).xp;
        await request(app).get('/api/gamification/achievements').set(bearer(u.token));
        const p = await UserProgress.findOne({ user: u.id }).lean();
        expect(p.xp).toBe(xp1);
        expect(new Set(p.unlockedAchievements.map((a) => String(a.achievement))).size).toBe(p.unlockedAchievements.length);
    });
});
