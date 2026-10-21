import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { setupTestDb, makeApp, registerUser, bearer } from './helpers.js';
import { importQuestions } from '../src/services/questionImport.js';
import { STUDY_SETS, inStudySet, selectStudySet } from '../src/services/studySets.js';

setupTestDb();
const app = makeApp();

const dir = path.resolve(__dirname, '../src/data/challenge');
const load = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8').replace(/^﻿/, ''));

beforeAll(async () => {
    for (const f of ['abret-challenge-nx.json', 'abret-challenge-saf.json']) {
        await importQuestions({ data: load(f), sourceFile: `server/src/data/challenge/${f}` });
    }
});

const create = (user, body) => request(app).post('/api/quiz/sessions').set(bearer(user.token)).send(body);

describe('study sets', () => {
    it('matches whole file prefixes only', () => {
        expect(inStudySet('diffuse-abnormalities', 'ch-dif-001')).toBe(true);
        expect(inStudySet('diffuse-abnormalities', 'ch-dif2-001')).toBe(false);
        expect(inStudySet('amplifier-controls', 'ch-dif2-001')).toBe(true);
        const pool = ['ch-nx-001', 'ch-nx-002', 'ch-saf-001'].map((questionId) => ({ questionId }));
        expect(selectStudySet(pool, 'neurology-essentials', 'all').map((q) => q.questionId).sort()).toEqual(['ch-nx-001', 'ch-nx-002']);
    });

    it('every study set prefix points at an existing Challenge file', () => {
        const prefixes = new Set();
        for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
            for (const q of load(f).questions) prefixes.add(q.id.replace(/-\d+$/, ''));
        }
        for (const [key, s] of Object.entries(STUDY_SETS)) for (const p of s.prefixes) expect(prefixes.has(p), `${key}: ${p}`).toBe(true);
    });

    it('serves only the section\'s questions, in practice mode, for 10 and "all"', async () => {
        const u = await registerUser(app);
        const ten = await create(u, { kind: 'study-set', studySet: 'neurology-essentials', questionCount: 10 });
        expect(ten.status).toBe(201);
        expect(ten.body.questions).toHaveLength(10);
        expect(ten.body.questions.every((q) => q.questionId.startsWith('ch-nx-'))).toBe(true);
        expect(ten.body.session.mode).toBe('practice');

        const all = await create(u, { kind: 'study-set', studySet: 'neurology-essentials', questionCount: 'all' });
        expect(all.status).toBe(201);
        expect(all.body.questions).toHaveLength(load('abret-challenge-nx.json').questions.length);
        expect(JSON.stringify(all.body.questions)).not.toMatch(/answerIndex|explanation/);
    });

    it('rejects unknown sets and sizes, and empty sets', async () => {
        const u = await registerUser(app);
        expect((await create(u, { kind: 'study-set', studySet: 'nope', questionCount: 10 })).status).toBe(400);
        expect((await create(u, { kind: 'study-set', studySet: 'lab-safety', questionCount: 7 })).status).toBe(400);
        expect((await create(u, { kind: 'study-set', studySet: 'acns', questionCount: 10 })).status).toBe(400);
    });

    it('reports how many questions each set holds', async () => {
        const u = await registerUser(app);
        const res = await request(app).get('/api/quiz/study-sets').set(bearer(u.token));
        expect(res.status).toBe(200);
        const byKey = Object.fromEntries(res.body.sets.map((s) => [s.key, s.count]));
        expect(byKey['neurology-essentials']).toBe(32);
        expect(byKey['lab-safety']).toBe(50);
        expect(byKey.acns).toBe(0);
    });
});
