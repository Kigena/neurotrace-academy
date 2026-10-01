import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { setupTestDb, makeApp, registerUser, bearer } from './helpers.js';
import { auditBank, auditQuestion } from '../src/services/questionAudit.js';
import { runQuestionAudit } from '../src/services/qaRunner.js';
import { importQuestions, loadSourceFile, defaultSourcePath } from '../src/services/questionImport.js';
import { allocateChallengeLevels, selectChallenge } from '../src/services/quizEngine.js';
import { Question } from '../src/models/Question.js';
import { QuestionVersion } from '../src/models/QuestionVersion.js';
import { AttemptEvent } from '../src/models/AttemptEvent.js';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacy = loadSourceFile(defaultSourcePath(serverRoot));
const challengeDir = path.join(serverRoot, 'src/data/challenge');
const challengeFiles = fs.readdirSync(challengeDir).filter((f) => f.endsWith('.json')).sort();
const challengeSets = challengeFiles.map((f) => ({ file: f, data: loadSourceFile(path.join(challengeDir, f)) }));
const pilot = challengeSets.find((c) => c.file === 'abret-challenge-pilot.json').data;
const allChallenge = challengeSets.flatMap((c) => c.data.questions);

// ------------------------------------------------------------ pure audit ---

describe('QA audit heuristics', () => {
    const byId = (id) => legacy.questions.find((q) => q.id === id);

    it('flags the known sensitivity error (7 -> 14 µV/mm said to enlarge waveforms)', () => {
        const flags = auditQuestion(byId('d2-batch1-005')).map((f) => f.code);
        expect(flags).toContain('SENSITIVITY_TERMINOLOGY');
        // Correctly worded sensitivity items are not flagged.
        expect(auditQuestion(byId('d2-batch6-003')).map((f) => f.code)).not.toContain('SENSITIVITY_TERMINOLOGY');
    });

    it('flags the time-constant item whose keyed value contradicts its own calculation', () => {
        expect(auditQuestion(byId('d2-batch1-030')).map((f) => f.code)).toContain('CONTRADICTORY_EXPLANATION');
    });

    it('flags categorical filter claims, "Both A and B", duplicates and longest-answer bias', () => {
        const r = auditBank(legacy.questions);
        expect(r.total).toBe(1128);
        expect(r.byCode.FILTER_ROLLOFF_REVIEW).toBeGreaterThan(10);
        expect(r.byCode.BOTH_AB_PATTERN).toBeGreaterThan(200);
        expect(r.byCode.DUPLICATE_STEM).toBeGreaterThan(50);
        expect(r.byCode.LONGEST_ANSWER_BIAS).toBeGreaterThan(300);
        expect(r.byCode.OBVIOUS_DISTRACTOR).toBeGreaterThan(50);
    });

    it('does not rewrite question content', () => {
        const q = structuredClone(byId('d2-batch1-005'));
        auditQuestion(q);
        expect(q).toEqual(byId('d2-batch1-005'));
    });
});

// ----------------------------------------------------- pilot quality bar ---

describe.each(challengeSets.map((c) => [c.file, c.data]))('Challenge Bank quality: %s', (file, data) => {
    const qs = data.questions;

    it.runIf(data.focus === 'core-calculations')('is a focused set of tagged core calculations at L3-L6', () => {
        expect(qs.length).toBeGreaterThanOrEqual(20);
        expect(qs.every((q) => q.cognitiveLevel >= 3 && q.cognitiveLevel <= 6)).toBe(true);
        expect(qs.every((q) => q.topicTags.includes('calc-core') && q.questionType === 'calculation')).toBe(true);
    });

    it.runIf(/^domain-[1-4]$/.test(data.focus || ''))('is a focused single-domain set covering L3-L6', () => {
        expect(qs.length).toBeGreaterThanOrEqual(20);
        expect(qs.every((q) => q.domainId === data.focus)).toBe(true);
        for (const level of [3, 4, 5, 6]) expect(qs.some((q) => q.cognitiveLevel === level)).toBe(true);
    });

    it.runIf(!data.focus)('has L3-L6 questions across all four ABRET domains, no L1/L2', () => {
        expect(qs.length).toBeGreaterThanOrEqual(40);
        expect(qs.every((q) => q.cognitiveLevel >= 3 && q.cognitiveLevel <= 6)).toBe(true);
        expect(new Set(qs.map((q) => q.domainId))).toEqual(new Set(['domain-1', 'domain-2', 'domain-3', 'domain-4']));
        for (const level of [3, 4, 5, 6]) expect(qs.some((q) => q.cognitiveLevel === level)).toBe(true);
        expect(new Set(qs.map((q) => q.competency))).toEqual(new Set(['technical', 'montage', 'troubleshooting', 'clinical']));
    });

    it('passes the audit with no flags and avoids banned option templates', () => {
        const r = auditBank(qs);
        expect(r.byCode).toEqual({});
        const banned = /\b(always|never)\b|both [a-e] and [a-e]|all of the above|none of the above/i;
        expect(qs.filter((q) => q.options.some((o) => banned.test(o))).map((q) => q.id)).toEqual([]);
    });

    it('requires multi-step reasoning in at least half of L4-L6 items', () => {
        const higher = qs.filter((q) => q.cognitiveLevel >= 4);
        expect(higher.filter((q) => q.reasoningSteps >= 2).length / higher.length).toBeGreaterThanOrEqual(0.5);
    });

    it('has no answer-position or answer-length cue', () => {
        const pos = [0, 0, 0, 0];
        let notablyLongest = 0;
        let notablyShortest = 0;
        for (const q of qs) {
            pos[q.answerIndex] += 1;
            const L = q.options.map((o) => o.length);
            const others = L.filter((_, i) => i !== q.answerIndex);
            if (L[q.answerIndex] > Math.max(...others) * 1.1) notablyLongest += 1;
            if (L[q.answerIndex] < Math.min(...others) * 0.9) notablyShortest += 1;
        }
        for (const p of pos) expect(p / qs.length).toBeGreaterThan(0.15);
        for (const p of pos) expect(p / qs.length).toBeLessThan(0.35);
        expect(notablyLongest / qs.length).toBeLessThan(0.2);
        expect(notablyShortest / qs.length).toBeLessThan(0.2);
    });

    it('every item has four options, an explanation, a learning objective and an unreviewed status', () => {
        for (const q of qs) {
            expect(q.id.startsWith('ch-')).toBe(true);
            expect(q.options).toHaveLength(4);
            expect(new Set(q.options).size).toBe(4);
            expect(q.explanation.length).toBeGreaterThan(80);
            expect(q.learningObjective).toBeTruthy();
            expect(q.qaStatus).toBe('UNREVIEWED');
        }
    });
});

describe('Challenge Bank as a whole', () => {
    it('has unique ids and stems across all files', () => {
        expect(new Set(allChallenge.map((q) => q.id)).size).toBe(allChallenge.length);
        expect(new Set(allChallenge.map((q) => q.stem.toLowerCase())).size).toBe(allChallenge.length);
    });

    it('labels every calculation item as core or beyond exam depth, never both', () => {
        const calc = allChallenge.filter((q) => q.topicTags.includes('calculation'));
        expect(calc.length).toBeGreaterThanOrEqual(40);
        for (const q of calc) {
            const n = ['calc-core', 'calc-beyond'].filter((t) => q.topicTags.includes(t)).length;
            expect(n, q.id).toBe(1);
        }
        // dB ratios and single-pole gain formulas are beyond typical exam depth
        const beyond = allChallenge.filter((q) => q.topicTags.includes('calc-beyond')).map((q) => q.id).sort();
        expect(beyond).toEqual(['ch-b2-004', 'ch-b2-005', 'ch-b2-007', 'ch-b6-004', 'ch-b6-017', 'ch-pilot-011']);
    });
});

// ------------------------------------------------------ challenge mix ---

describe('challenge level allocation', () => {
    it('follows 15/30/25/30 for L3/L4/L5/L6 with no L1/L2', () => {
        expect(allocateChallengeLevels(20)).toEqual({ 3: 3, 4: 6, 5: 5, 6: 6 });
        expect(allocateChallengeLevels(10)).toEqual({ 3: 1, 4: 3, 5: 3, 6: 3 });
        expect(allocateChallengeLevels(30)).toEqual({ 3: 4, 4: 9, 5: 8, 6: 9 }); // ties go to the higher level
        for (const n of [10, 20, 30, 50]) {
            expect(Object.values(allocateChallengeLevels(n)).reduce((a, b) => a + b, 0)).toBe(n);
        }
    });

    it('draws beyond-exam calculations about a quarter as often as core items', () => {
        const pool = Array.from({ length: 40 }, (_, i) => ({
            questionId: `q${i}`, cognitiveLevel: 4, domainId: 'domain-2',
            topicTags: i < 20 ? ['calculation', 'calc-beyond'] : ['calculation', 'calc-core'],
        }));
        let seed = 7;
        const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        let beyond = 0;
        for (let run = 0; run < 200; run++) {
            beyond += selectChallenge(pool, 10, rng).filter((q) => q.topicTags.includes('calc-beyond')).length;
        }
        const share = beyond / 2000;
        expect(share).toBeGreaterThan(0.05); // still served
        expect(share).toBeLessThan(0.3); // vs 0.5 unweighted
    });

    it('never selects L1 or L2 items', () => {
        const pool = [
            ...Array.from({ length: 20 }, (_, i) => ({ questionId: `a${i}`, cognitiveLevel: 1, domainId: 'domain-2' })),
            ...Array.from({ length: 20 }, (_, i) => ({ questionId: `b${i}`, cognitiveLevel: 2, domainId: 'domain-2' })),
            ...pilot.questions.map((q) => ({ questionId: q.id, cognitiveLevel: q.cognitiveLevel, domainId: q.domainId })),
        ];
        const picked = selectChallenge(pool, 30);
        expect(picked).toHaveLength(30);
        expect(picked.every((q) => q.cognitiveLevel >= 3)).toBe(true);
    });
});

// --------------------------------------------------------------- API ---

describe('Challenge mode and QA statuses (API)', () => {
    setupTestDb();
    const app = makeApp();
    const key = new Map(allChallenge.map((q) => [q.id, q]));

    beforeAll(async () => {
        await importQuestions({ data: legacy });
        for (const c of challengeSets) {
            const r = await importQuestions({ data: c.data, sourceFile: `server/src/data/challenge/${c.file}` });
            expect(r.bank).toBe('challenge');
            expect(r.inserted).toBe(c.data.questions.length);
            expect(r.failed).toBe(0);
        }
    });

    it('stores pilot questions in the challenge bank with their metadata; legacy stays foundation', async () => {
        const ch = await Question.findOne({ questionId: 'ch-pilot-001' }).lean();
        expect(ch).toMatchObject({ bank: 'challenge', qaStatus: 'UNREVIEWED', cognitiveLevel: 3, competency: 'technical' });
        expect(ch.origin.type).toBe('neurolinea-challenge-bank');
        const legacyDoc = await Question.findOne({ questionId: 'd1-s1-q1' }).lean();
        expect(legacyDoc.bank).toBe('foundation');
    });

    it('re-importing the legacy bank after the schema change creates no new versions', async () => {
        const before = await QuestionVersion.countDocuments();
        const r = await importQuestions({ data: legacy });
        expect(r.inserted).toBe(0);
        expect(r.updated).toBe(0);
        expect(await QuestionVersion.countDocuments()).toBe(before);
    });

    it('the audit runner is a dry run by default and applies known issues idempotently', async () => {
        const dry = await runQuestionAudit({ dryRun: true });
        expect(dry.knownIssuesApplied).toBe(3);
        expect(await Question.countDocuments({ qaStatus: 'NEEDS_REVISION' })).toBe(0);

        const applied = await runQuestionAudit({ dryRun: false });
        expect(applied.knownIssuesApplied).toBe(3);
        expect(applied.knownIssuesMissing).toEqual([]);
        const flagged = await Question.find({ qaStatus: 'NEEDS_REVISION' }).select('questionId qaFlags').lean();
        expect(flagged.map((d) => d.questionId).sort()).toEqual(['d2-batch1-005', 'd2-batch1-030', 'd2-batch7-001']);
        const sens = flagged.find((d) => d.questionId === 'd2-batch1-005');
        expect(sens.qaFlags.some((f) => f.source === 'manual' && f.code === 'SENSITIVITY_TERMINOLOGY')).toBe(true);

        const again = await runQuestionAudit({ dryRun: false });
        expect(again.knownIssuesApplied).toBe(0);
        const sens2 = await Question.findOne({ questionId: 'd2-batch1-005' }).lean();
        expect(sens2.qaFlags.filter((f) => f.source === 'manual')).toHaveLength(1);

        // Content untouched
        const doc = await Question.findOne({ questionId: 'd2-batch1-005' }).select('+answerIndex').lean();
        const src = legacy.questions.find((q) => q.id === 'd2-batch1-005');
        expect(doc.stem).toBe(src.stem);
        expect(doc.answerIndex).toBe(src.answerIndex);
    });

    it('NEEDS_REVISION questions are never served', async () => {
        const u = await registerUser(app);
        const sections = ['d2-s1', 'd2-filters-time-constants', 'd2-amplifiers-sensitivity', 'd1-basic-eeg-physics-instrumentation'];
        const all = new Set();
        for (let i = 0; i < 4; i++) {
            const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token))
                .send({ kind: 'custom', mode: 'practice', questionCount: 130, filters: { sections } });
            expect(s.status).toBe(201);
            s.body.questions.forEach((q) => all.add(q.questionId));
        }
        for (const id of ['d2-batch1-005', 'd2-batch1-030', 'd2-batch7-001']) expect(all.has(id)).toBe(false);
    });

    it('standard sessions never include Challenge Bank questions', async () => {
        const u = await registerUser(app);
        const full = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'preset', presetId: 'mock-full-130' });
        expect(full.body.questions.some((q) => q.questionId.startsWith('ch-'))).toBe(false);
        const custom = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'custom', mode: 'practice', questionCount: 100 });
        expect(custom.body.questions.some((q) => q.questionId.startsWith('ch-'))).toBe(false);
    });

    it('Challenge me: valid sizes only, L3-L6 challenge items, no answer key, attempts tagged', async () => {
        const u = await registerUser(app);
        const bad = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'challenge', questionCount: 15 });
        expect(bad.status).toBe(400);

        for (const n of [10, 20, 30, 50]) {
            const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'challenge', questionCount: n });
            expect(s.status).toBe(201);
            expect(s.body.questions).toHaveLength(Math.min(n, allChallenge.length));
            expect(s.body.questions.every((q) => q.questionId.startsWith('ch-') && q.bank === 'challenge')).toBe(true);
            expect(s.body.questions.every((q) => q.cognitiveLevel >= 3)).toBe(true);
            expect(s.body.questions.every((x) => !('answerIndex' in x) && !('explanation' in x) && !('correctIndex' in x))).toBe(true);
        }

        const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'challenge', questionCount: 20 });
        const levels = {};
        s.body.questions.forEach((q) => { levels[q.cognitiveLevel] = (levels[q.cognitiveLevel] || 0) + 1; });
        expect(levels).toEqual({ 3: 3, 4: 6, 5: 5, 6: 6 });

        const q = s.body.questions[0];
        const src = key.get(q.questionId);
        const ans = await request(app).post(`/api/quiz/sessions/${s.body.session.sessionId}/answers`).set(bearer(u.token))
            .send({ questionId: q.questionId, selectedIndex: q.options.indexOf(src.options[src.answerIndex]) });
        expect(ans.body.isCorrect).toBe(true);
        const ev = await AttemptEvent.findOne({ sessionId: s.body.session.sessionId }).lean();
        expect(ev).toMatchObject({ bank: 'challenge', cognitiveLevel: src.cognitiveLevel, competency: src.competency });
    });

    it('the calculation drill serves only core exam calculations', async () => {
        const u = await registerUser(app);
        const core = allChallenge.filter((q) => q.topicTags.includes('calc-core')).length;
        for (const n of [10, 20]) {
            const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token))
                .send({ kind: 'challenge', questionCount: n, focus: 'calc-core' });
            expect(s.status).toBe(201);
            expect(s.body.questions).toHaveLength(Math.min(n, core));
            expect(s.body.questions.every((q) => q.topicTags.includes('calc-core'))).toBe(true);
            expect(s.body.session.config?.tags ?? ['calc-core']).toContain('calc-core');
            await request(app).post(`/api/quiz/sessions/${s.body.session.sessionId}/abandon`).set(bearer(u.token));
        }
    });

    it('challenge answers feed the higher-order readiness components', async () => {
        const u = await registerUser(app);
        // One focused 10-question session per competency guarantees 5+ answers each.
        for (const competency of ['technical', 'montage', 'troubleshooting', 'clinical']) {
            const s = await request(app).post('/api/quiz/sessions').set(bearer(u.token))
                .send({ kind: 'challenge', questionCount: 10, competencies: [competency] });
            expect(s.status).toBe(201);
            for (const q of s.body.questions) {
                const src = key.get(q.questionId);
                await request(app).post(`/api/quiz/sessions/${s.body.session.sessionId}/answers`).set(bearer(u.token))
                    .send({ questionId: q.questionId, selectedIndex: q.options.indexOf(src.options[src.answerIndex]) });
            }
        }
        const dash = await request(app).get('/api/study/dashboard').set(bearer(u.token));
        const c = Object.fromEntries(dash.body.readiness.components.map((x) => [x.key, x]));
        for (const k of ['technical', 'montage', 'troubleshooting', 'clinical']) {
            expect(c[k].assessed).toBe(true);
            expect(c[k].score).toBeGreaterThanOrEqual(85);
        }
        expect(c.foundation.assessed).toBe(false);
        expect(dash.body.mastery.byCompetency.montage.sufficient).toBe(true);
        // Today's Study is Challenge-first when the bank is available
        expect(dash.body.challengeAvailable).toBeGreaterThan(0);
        expect(dash.body.todaysStudy[0].kind).toBe('challenge');
        const focus = dash.body.todaysStudy[0].competency;
        const focused = await request(app).post('/api/quiz/sessions').set(bearer(u.token)).send({ kind: 'challenge', questionCount: 10, competencies: [focus] });
        expect(focused.status).toBe(201);
        expect(focused.body.questions.every((q) => q.competency === focus)).toBe(true);
    });
});
