import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { setupTestDb, makeApp, registerUser, bearer } from './helpers.js';
import { defaultSourcePath, importQuestions, loadSourceFile } from '../src/services/questionImport.js';
import {
    DIAGNOSTIC_COMPETENCIES,
    DIAGNOSTIC_FOUNDATION,
    DIAGNOSTIC_SIZE,
    diagnosticSummary,
    selectDiagnostic,
} from '../src/services/diagnostic.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacy = loadSourceFile(defaultSourcePath(serverRoot));
const challengeDir = path.join(serverRoot, 'src/data/challenge');
const challenge = fs.readdirSync(challengeDir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => ({ file: f, data: loadSourceFile(path.join(challengeDir, f)) }));
const allSource = [...legacy.questions, ...challenge.flatMap((c) => c.data.questions.map((q) => ({ ...q, bank: 'challenge' })))];
const key = new Map(allSource.map((q) => [q.id, q]));
const pool = allSource.map((q) => ({
    questionId: q.id, domainId: q.domainId, sectionId: q.sectionId,
    bank: q.bank || 'foundation', cognitiveLevel: q.cognitiveLevel, competency: q.competency,
}));

describe('diagnostic selection', () => {
    it('picks 40 unique questions: 5 Challenge per competency at L3-L5, foundation 3/9/4/4 by domain', () => {
        let seed = 11;
        const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        const picked = selectDiagnostic(pool, [], rng);
        expect(picked).toHaveLength(DIAGNOSTIC_SIZE);
        expect(new Set(picked.map((q) => q.questionId)).size).toBe(DIAGNOSTIC_SIZE);

        const ch = picked.filter((q) => q.bank === 'challenge');
        expect(ch).toHaveLength(20);
        for (const c of DIAGNOSTIC_COMPETENCIES) {
            const mine = ch.filter((q) => q.competency === c);
            expect(mine, c).toHaveLength(5);
            expect(mine.map((q) => q.cognitiveLevel).sort()).toEqual([3, 4, 4, 5, 5]);
        }
        const fd = picked.filter((q) => q.bank !== 'challenge');
        for (const [domainId, n] of Object.entries(DIAGNOSTIC_FOUNDATION)) {
            const mine = fd.filter((q) => q.domainId === domainId);
            expect(mine, domainId).toHaveLength(n);
            expect(new Set(mine.map((q) => q.sectionId)).size, `${domainId} one per section`).toBe(n);
        }
    });

    it('prefers foundation sections the user has answered least', () => {
        const d1Sections = [...new Set(pool.filter((q) => q.bank === 'foundation' && q.domainId === 'domain-1').map((q) => q.sectionId))];
        // Heavy history in every Domain I section except three
        const fresh = d1Sections.slice(0, 3);
        const events = d1Sections.slice(3).flatMap((sectionId) => Array.from({ length: 10 }, () => ({ sectionId })));
        const picked = selectDiagnostic(pool, events).filter((q) => q.bank === 'foundation' && q.domainId === 'domain-1');
        expect(new Set(picked.map((q) => q.sectionId))).toEqual(new Set(fresh));
    });

    it('summarises a submitted diagnostic and suggests a retake after 3 weeks', () => {
        expect(diagnosticSummary(null)).toEqual({ taken: false, retakeSuggested: true });
        const endTime = Date.parse('2026-10-02T12:00:00Z');
        const session = {
            sessionId: 's', endTime,
            result: { correct: 30, total: 40, percent: 75, breakdown: { byDomain: { 'domain-2': { correct: 9, total: 12 } }, byCompetency: new Map([['montage', { correct: 4, total: 5 }]]) } },
        };
        const s = diagnosticSummary(session, endTime + 5 * 86400000);
        expect(s).toMatchObject({ taken: true, percent: 75, daysSince: 5, retakeSuggested: false });
        expect(s.byDomain['domain-2'].percent).toBe(75);
        expect(s.byCompetency.montage.percent).toBe(80);
        expect(diagnosticSummary(session, endTime + 21 * 86400000).retakeSuggested).toBe(true);
    });
});

describe('diagnostic API', () => {
    setupTestDb();
    const app = makeApp();

    beforeAll(async () => {
        await importQuestions({ data: legacy });
        for (const c of challenge) await importQuestions({ data: c.data, sourceFile: `server/src/data/challenge/${c.file}` });
    });

    it('is a 60-minute timed 40-question session without answer keys; submitting fills skills and the dashboard', async () => {
        const u = await registerUser(app);
        let dash = await request(app).get('/api/study/dashboard').set(bearer(u.token));
        expect(dash.body.diagnostic.taken).toBe(false);
        const planItem = dash.body.todaysStudy.find((i) => i.kind === 'diagnostic');
        expect(planItem).toBeTruthy();

        const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'diagnostic', planItemId: planItem.id });
        expect(s.status).toBe(201);
        expect(s.body.session).toMatchObject({ kind: 'diagnostic', mode: 'timed', timeLimitSec: 3600, questionCount: 40 });
        expect(s.body.questions.every((q) => !('answerIndex' in q) && !('explanation' in q))).toBe(true);

        const sid = s.body.session.sessionId;
        for (const q of s.body.questions) {
            const src = key.get(q.questionId);
            await request(app).post(`/api/quiz/sessions/${sid}/answers`).set(bearer(u.token))
                .send({ questionId: q.questionId, selectedIndex: q.options.indexOf(src.options[src.answerIndex]) });
        }
        const sub = await request(app).post(`/api/quiz/sessions/${sid}/submit`).set(bearer(u.token));
        expect(sub.body.result).toMatchObject({ correct: 40, total: 40, percent: 100 });
        expect(Object.keys(sub.body.result.breakdown.byCompetency).sort()).toEqual([...DIAGNOSTIC_COMPETENCIES].sort());

        dash = await request(app).get('/api/study/dashboard').set(bearer(u.token));
        expect(dash.body.diagnostic).toMatchObject({ taken: true, percent: 100, retakeSuggested: false });
        for (const c of DIAGNOSTIC_COMPETENCIES) expect(dash.body.diagnostic.byCompetency[c]).toMatchObject({ correct: 5, total: 5 });
        const components = Object.fromEntries(dash.body.readiness.components.map((x) => [x.key, x]));
        for (const c of DIAGNOSTIC_COMPETENCIES) expect(components[c].assessed, c).toBe(true);
        // The plan item it was started from is done
        expect(dash.body.todaysStudy.find((i) => i.id === planItem.id).status).toBe('done');
    });
});
