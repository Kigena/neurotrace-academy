import fs from 'fs';
import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupTestDb } from './helpers.js';
import {
    defaultSourcePath,
    importQuestions,
    loadSourceFile,
    seedBlueprint,
} from '../src/services/questionImport.js';
import { Question } from '../src/models/Question.js';
import { QuestionVersion } from '../src/models/QuestionVersion.js';
import { BlueprintNode } from '../src/models/BlueprintNode.js';

setupTestDb();

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = loadSourceFile(defaultSourcePath(serverRoot));

describe('legacy question bank import', () => {
    let first;

    it('imports every source question and reconciles to the source count', async () => {
        first = await importQuestions({ data: source });
        expect(first.sourceCount).toBe(source.questions.length);
        expect(first.sourceCount).toBe(1128);
        expect(first.inserted).toBe(1128);
        expect(first.unchanged).toBe(0);
        expect(first.updated).toBe(0);
        expect(first.failed).toBe(0);
        expect(first.reconciled).toBe(true);
        expect(first.versionsCreated).toBe(1128);
        expect(await Question.countDocuments()).toBe(1128);
        expect(await QuestionVersion.countDocuments()).toBe(1128);
        expect(first.domainCounts).toEqual({ 'domain-1': 419, 'domain-2': 331, 'domain-3': 219, 'domain-4': 159 });
        expect(Object.keys(first.sectionCounts)).toHaveLength(47);
    });

    it('reports duplicate stems without de-duplicating them; at most one copy per group stays in service', () => {
        const groups = new Map();
        for (const q of source.questions) {
            const k = q.stem.trim().toLowerCase();
            groups.set(k, [...(groups.get(k) || []), q.id]);
        }
        const dups = [...groups.values()].filter((g) => g.length > 1);
        expect(first.qa.duplicateStemGroups).toBe(dups.length);
        expect(first.qa.duplicateStemExtraCopies).toBe(dups.reduce((n, g) => n + g.length - 1, 0));
        expect(first.qa.duplicateSourceIds).toEqual([]);
        const issues = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/data/qa/known-issues.json'), 'utf8')).issues;
        const retired = new Set(issues.filter((i) => i.qaStatus === 'REJECTED').map((i) => i.questionId));
        for (const g of dups) expect(g.filter((id) => !retired.has(id)).length, g.join(',')).toBeLessThanOrEqual(1);
    });

    it('preserves IDs, text, options, answer and explanation exactly', async () => {
        for (const q of [source.questions[0], source.questions[500], source.questions[1127]]) {
            const doc = await Question.findOne({ questionId: q.id }).select('+answerIndex +explanation').lean();
            expect(doc.stem).toBe(q.stem);
            expect(doc.options).toEqual(q.options);
            expect(doc.answerIndex).toBe(q.answerIndex);
            expect(doc.explanation).toBe(q.explanation);
            expect(doc.domainId).toBe(q.domainId);
            expect(doc.sectionId).toBe(q.sectionId);
            expect(doc.topicTags).toEqual(q.topicTags);
            expect(doc.difficulty).toBe(q.difficulty);
            expect(doc.origin.type).toBe('legacy-neurolinea-bank');
            expect(doc.version).toBe(1);
            expect(doc.reviewStatus).toBe('unreviewed');
            expect(doc.cognitiveLevel).toBeNull();
            expect(doc.abretObjectiveId).toBeNull();
        }
    });

    it('keeps the answer key out of ordinary queries', async () => {
        const doc = await Question.findOne({ questionId: source.questions[0].id }).lean();
        expect(doc.answerIndex).toBeUndefined();
        expect(doc.explanation).toBeUndefined();
    });

    it('is idempotent: a second run inserts nothing and creates no versions', async () => {
        const second = await importQuestions({ data: source });
        expect(second.inserted).toBe(0);
        expect(second.unchanged).toBe(1128);
        expect(second.updated).toBe(0);
        expect(second.failed).toBe(0);
        expect(second.versionsCreated).toBe(0);
        expect(second.reconciled).toBe(true);
        expect(await Question.countDocuments()).toBe(1128);
        expect(await QuestionVersion.countDocuments()).toBe(1128);
    });

    it('a changed source question is updated and a new version appended (old version kept)', async () => {
        const changed = structuredClone(source);
        const target = changed.questions[3];
        const originalStem = target.stem;
        target.explanation = `${target.explanation} (revised)`;

        const third = await importQuestions({ data: changed });
        expect(third.updated).toBe(1);
        expect(third.unchanged).toBe(1127);
        expect(third.versionsCreated).toBe(1);

        const versions = await QuestionVersion.find({ questionId: target.id }).sort({ version: 1 }).lean();
        expect(versions.map((v) => v.version)).toEqual([1, 2]);
        expect(versions[0].snapshot.explanation).toBe(source.questions[3].explanation);
        expect(versions[1].snapshot.explanation).toBe(target.explanation);
        const doc = await Question.findOne({ questionId: target.id }).select('+explanation').lean();
        expect(doc.version).toBe(2);
        expect(doc.stem).toBe(originalStem);
    });

    it('reports invalid records as failed without writing them', async () => {
        const bad = { version: 'x', questions: [
            { id: 'bad-1', domainId: 'domain-1', sectionId: 's', difficulty: 'easy', stem: 'S', options: ['a', 'b'], answerIndex: 5 },
            { id: 'bad.2', domainId: 'domain-1', sectionId: 's', difficulty: 'easy', stem: 'S', options: ['a', 'b'], answerIndex: 0 },
        ] };
        const r = await importQuestions({ data: bad });
        expect(r.failed).toBe(2);
        expect(r.reconciled).toBe(true);
        expect(await Question.countDocuments({ questionId: { $in: ['bad-1', 'bad.2'] } })).toBe(0);
    });

    it('dry run writes nothing', async () => {
        const before = await Question.countDocuments();
        const r = await importQuestions({ data: { questions: [{ id: 'dry-1', domainId: 'domain-1', sectionId: 's', difficulty: 'easy', stem: 'S', options: ['a', 'b'], answerIndex: 0 }] }, dryRun: true });
        expect(r.inserted).toBe(1);
        expect(await Question.countDocuments()).toBe(before);
    });
});

describe('blueprint seeding', () => {
    it('creates the exam root and four 2026 domains with canonical weights, idempotently', async () => {
        await seedBlueprint();
        await seedBlueprint();
        const nodes = await BlueprintNode.find().sort({ sortOrder: 1 }).lean();
        expect(nodes).toHaveLength(5);
        const domains = nodes.filter((n) => n.nodeType === 'domain');
        expect(domains.map((d) => d.weightPercent)).toEqual([15, 46, 19, 20]);
        expect(domains.map((d) => d.legacyDomainId)).toEqual(['domain-1', 'domain-2', 'domain-3', 'domain-4']);
        expect(domains.every((d) => d.parentCode === 'ABRET-REEGT-2026')).toBe(true);
        expect(domains[0].source.document).toBe('2026 ABRET R. EEG T. Candidate Handbook');
        expect(domains[0].source.year).toBe(2026);
    });
});
