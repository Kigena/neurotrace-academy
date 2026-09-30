import { describe, it, expect } from 'vitest';
import {
    allocateByBlueprint,
    DOMAINS,
} from '../src/blueprint/abret2026.js';
import {
    buildOptionOrder,
    isPositionDependent,
    resolvePresetAllocation,
    sample,
    scoreSession,
    selectCustom,
    selectForPreset,
    toPublicQuestion,
} from '../src/services/quizEngine.js';
import { getPresets } from '../src/routes/quiz.js';

const pool = Array.from({ length: 200 }, (_, i) => ({
    questionId: `q${i}`,
    domainId: `domain-${(i % 4) + 1}`,
    sectionId: `s${i % 7}`,
    topicTags: [`t${i % 5}`],
    difficulty: ['easy', 'medium', 'hard'][i % 3],
    origin: { sourceOrder: i },
}));

describe('canonical ABRET 2026 blueprint', () => {
    it('has the official weights 15/46/19/20 summing to 100', () => {
        expect(DOMAINS.map((d) => d.weightPercent)).toEqual([15, 46, 19, 20]);
        expect(DOMAINS.map((d) => d.title)).toEqual([
            'Pre-Study Procedures', 'Performing the EEG Study', 'Post-Study Procedures', 'Ethics and Professional Issues',
        ]);
    });

    it('allocates 130 questions as 19/60/25/26 (largest remainder)', () => {
        const a = allocateByBlueprint(130);
        expect(a.map((x) => x.count)).toEqual([19, 60, 25, 26]);
        expect(a.reduce((s, x) => s + x.count, 0)).toBe(130);
    });

    it('allocates 30 questions as 4/14/6/6', () => {
        expect(allocateByBlueprint(30).map((x) => x.count)).toEqual([4, 14, 6, 6]);
    });

    it('always sums exactly and stays within one question of the exact quota', () => {
        for (let n = 0; n <= 300; n++) {
            const a = allocateByBlueprint(n);
            expect(a.reduce((s, x) => s + x.count, 0)).toBe(n);
            for (const x of a) expect(Math.abs(x.count - x.exactQuota)).toBeLessThan(1);
        }
    });

    it('every blueprint-allocated preset uses the canonical allocation', () => {
        for (const p of getPresets().filter((x) => x.allocation === 'blueprint')) {
            expect(resolvePresetAllocation(p).map((x) => x.count)).toEqual(allocateByBlueprint(p.questionCount).map((x) => x.count));
        }
        const full = getPresets().find((p) => p.id === 'mock-full-130');
        expect(full.allocation).toBe('blueprint');
        expect(full.questionCount).toBe(130);
    });
});

describe('selection', () => {
    it('custom selection samples the whole eligible pool (not the first N)', () => {
        const seen = new Set();
        for (let i = 0; i < 50; i++) {
            selectCustom(pool, { filters: {}, questionCount: 10 }).forEach((q) => seen.add(q.questionId));
        }
        // "first N then shuffle" would only ever produce q0..q9.
        expect(seen.size).toBeGreaterThan(100);
        expect([...seen].some((id) => Number(id.slice(1)) >= 100)).toBe(true);
    });

    it('custom selection respects filters and count', () => {
        const r = selectCustom(pool, { filters: { domains: ['domain-2'], difficulty: ['easy'] }, questionCount: 5 });
        expect(r).toHaveLength(5);
        expect(r.every((q) => q.domainId === 'domain-2' && q.difficulty === 'easy')).toBe(true);
    });

    it('shuffle:false keeps bank order but selection is still random', () => {
        const r = selectCustom(pool, { filters: {}, questionCount: 20, shuffle: false });
        const orders = r.map((q) => q.origin.sourceOrder);
        expect(orders).toEqual([...orders].sort((a, b) => a - b));
    });

    it('sample returns distinct items', () => {
        const s = sample(pool, 50);
        expect(new Set(s.map((q) => q.questionId)).size).toBe(50);
    });

    it('preset selection hits the exact per-domain allocation and backfills difficulty', () => {
        const full = getPresets().find((p) => p.id === 'mock-full-130');
        const big = Array.from({ length: 400 }, (_, i) => ({ ...pool[i % 200], questionId: `b${i}`, difficulty: i % 10 ? 'hard' : 'easy' }));
        const picked = selectForPreset(big, full);
        expect(picked).toHaveLength(130);
        const counts = {};
        picked.forEach((q) => { counts[q.domainId] = (counts[q.domainId] || 0) + 1; });
        expect(counts).toEqual({ 'domain-1': 19, 'domain-2': 60, 'domain-3': 25, 'domain-4': 26 });
        expect(new Set(picked.map((q) => q.questionId)).size).toBe(130);
    });
});

describe('option ordering and projection', () => {
    it('does not reorder position-dependent options', () => {
        const opts = ['a', 'b', 'Both A and B', 'none'];
        expect(isPositionDependent(opts)).toBe(true);
        expect(buildOptionOrder(opts, true)).toEqual([0, 1, 2, 3]);
    });

    it('public projection contains no answer key or explanation', () => {
        const q = { questionId: 'x', domainId: 'd', sectionId: 's', topicTags: [], difficulty: 'easy', stem: 'S', options: ['a', 'b', 'c'], answerIndex: 2, explanation: 'E', contentHash: 'h' };
        const pub = toPublicQuestion(q, [2, 0, 1]);
        expect(pub.options).toEqual(['c', 'a', 'b']);
        expect(pub).not.toHaveProperty('answerIndex');
        expect(pub).not.toHaveProperty('explanation');
        expect(pub).not.toHaveProperty('contentHash');
    });
});

describe('scoring', () => {
    const questions = new Map([
        ['a', { questionId: 'a', domainId: 'domain-1', sectionId: 's1', topicTags: ['x'], difficulty: 'easy', answerIndex: 1 }],
        ['b', { questionId: 'b', domainId: 'domain-2', sectionId: 's2', topicTags: ['x', 'y'], difficulty: 'hard', answerIndex: 0 }],
        ['c', { questionId: 'c', domainId: 'domain-2', sectionId: 's2', topicTags: ['y'], difficulty: 'hard', answerIndex: 3 }],
    ]);
    const items = [{ questionId: 'a' }, { questionId: 'b' }, { questionId: 'c' }];

    it('counts correct/attempted/total and breaks down by domain/section/tag/difficulty', () => {
        const s = scoreSession(items, { a: { originalIndex: 1 }, b: { originalIndex: 2 } }, questions);
        expect(s.correct).toBe(1);
        expect(s.attempted).toBe(2);
        expect(s.total).toBe(3);
        expect(s.percent).toBe(33);
        expect(s.percentOfAttempted).toBe(50);
        expect(s.breakdown.byDomain['domain-2']).toEqual({ correct: 0, attempted: 1, total: 2 });
        expect(s.breakdown.byTag.x).toEqual({ correct: 1, attempted: 2, total: 2 });
        expect(s.breakdown.byDifficulty.hard).toEqual({ correct: 0, attempted: 1, total: 2 });
        expect(s.breakdown.bySection.s1).toEqual({ correct: 1, attempted: 1, total: 1 });
    });
});
