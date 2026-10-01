// Server-authoritative quiz engine: pure selection, ordering, projection and
// scoring helpers. Database access lives in routes/quiz.js.

import { allocateByBlueprint, DOMAINS } from '../blueprint/abret2026.js';

export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const TIME_LIMITS_SEC = { practice: null, timed: 60 * 60, mock: 120 * 60 };
export const DOMAIN_QUICKSTART = { count: 35, timeLimitSec: 60 * 60 };
export const MAX_CUSTOM_QUESTIONS = 130;
// Answers arriving slightly after expiry (network latency) are tolerated.
export const EXPIRY_GRACE_MS = 5000;

// ---------------------------------------------------------------- random ---

export function shuffle(array, rng = Math.random) {
    const out = [...array];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/**
 * Uniform random sample of `n` items. The whole eligible pool is shuffled
 * BEFORE taking n, so every eligible question can be selected.
 */
export function sample(array, n, rng = Math.random) {
    return shuffle(array, rng).slice(0, Math.max(0, n));
}

// ------------------------------------------------------------- filtering ---

export function matchesFilters(q, filters = {}) {
    const { domains = [], sections = [], tags = [], difficulty = [] } = filters;
    if (domains.length && !domains.includes(q.domainId)) return false;
    if (sections.length && !sections.includes(q.sectionId)) return false;
    if (difficulty.length && !difficulty.includes(q.difficulty)) return false;
    if (tags.length && !tags.some((t) => (q.topicTags || []).includes(t))) return false;
    return true;
}

// ------------------------------------------------------------- selection ---

export function selectCustom(pool, { filters, questionCount, shuffle: shuffleOrder = true }, rng = Math.random) {
    const eligible = pool.filter((q) => matchesFilters(q, filters));
    const chosen = sample(eligible, Math.min(questionCount, eligible.length), rng);
    // Selection is always random; `shuffle: false` only keeps bank order for display.
    return shuffleOrder ? chosen : sortByBankOrder(chosen);
}

/**
 * Domain quick start: spread questions across the domain's sections, then
 * trim to `count` (preserves the pre-existing behaviour).
 */
export function selectDomainQuickStart(pool, domainId, count = DOMAIN_QUICKSTART.count, rng = Math.random) {
    const domainQs = pool.filter((q) => q.domainId === domainId);
    const target = Math.min(count, domainQs.length);
    const bySection = new Map();
    for (const q of domainQs) {
        if (!bySection.has(q.sectionId)) bySection.set(q.sectionId, []);
        bySection.get(q.sectionId).push(q);
    }
    if (bySection.size === 0) return [];
    const perSection = Math.ceil(target / bySection.size);
    const picked = [];
    for (const qs of bySection.values()) picked.push(...sample(qs, perSection, rng));
    let result = shuffle(picked, rng).slice(0, target);
    if (result.length < target) {
        const have = new Set(result.map((q) => q.questionId));
        result = result.concat(sample(domainQs.filter((q) => !have.has(q.questionId)), target - result.length, rng));
    }
    return result;
}

/**
 * Pick `count` questions from one domain aiming at a difficulty mix. The bank
 * is heavily skewed toward "hard", so any shortfall in a difficulty band is
 * back-filled from the rest of the same domain. The domain count is therefore
 * exact whenever the domain has enough questions.
 */
export function selectFromDomainWithDifficulty(domainQs, count, difficultyDistribution, rng = Math.random) {
    const target = Math.min(count, domainQs.length);
    const picked = [];
    if (difficultyDistribution) {
        const easyN = Math.round(target * (difficultyDistribution.easy || 0));
        const mediumN = Math.round(target * (difficultyDistribution.medium || 0));
        const hardN = Math.max(0, target - easyN - mediumN);
        const wants = { easy: easyN, medium: mediumN, hard: hardN };
        for (const d of DIFFICULTIES) {
            picked.push(...sample(domainQs.filter((q) => q.difficulty === d), wants[d], rng));
        }
    }
    if (picked.length < target) {
        const have = new Set(picked.map((q) => q.questionId));
        picked.push(...sample(domainQs.filter((q) => !have.has(q.questionId)), target - picked.length, rng));
    }
    return picked.slice(0, target);
}

export function resolvePresetAllocation(preset) {
    if (preset.allocation === 'blueprint') {
        return allocateByBlueprint(preset.questionCount).map((a) => ({ domainId: a.domainId, count: a.count }));
    }
    if (preset.allocation === 'single-domain') {
        return [{ domainId: preset.domainId, count: preset.questionCount }];
    }
    throw new Error(`Unknown preset allocation: ${preset.allocation}`);
}

export function selectForPreset(pool, preset, rng = Math.random) {
    const allocation = resolvePresetAllocation(preset);
    const picked = [];
    for (const { domainId, count } of allocation) {
        const domainQs = pool.filter((q) => q.domainId === domainId);
        picked.push(...selectFromDomainWithDifficulty(domainQs, count, preset.difficultyDistribution, rng));
    }
    return preset.shuffle === false ? picked : shuffle(picked, rng);
}

function sortByBankOrder(qs) {
    return [...qs].sort((a, b) => (a.origin?.sourceOrder ?? 0) - (b.origin?.sourceOrder ?? 0));
}

// -------------------------------------------------------- option ordering ---

// Options that refer to other options by position must not be reordered.
const POSITION_DEPENDENT = /Both\s+[A-E]\s+and\s+[A-E]|All of (the )?above|None of (the )?above/i;

export function isPositionDependent(options) {
    return options.some((o) => typeof o === 'string' && POSITION_DEPENDENT.test(o));
}

/** Returns optionOrder where optionOrder[displayIndex] = canonical index. */
export function buildOptionOrder(options, shuffleOptions, rng = Math.random) {
    const identity = options.map((_, i) => i);
    if (!shuffleOptions || isPositionDependent(options)) return identity;
    return shuffle(identity, rng);
}

// ------------------------------------------------------- challenge mode ---

export const CHALLENGE_SIZES = [10, 20, 30, 50];
// Default cognitive-level mix for "Challenge me" (no L1; L2 never selected).
export const CHALLENGE_LEVEL_MIX = { 3: 0.15, 4: 0.3, 5: 0.25, 6: 0.3 };

/** Largest-remainder split of n across the level mix (ties -> higher level). */
export function allocateChallengeLevels(n, mix = CHALLENGE_LEVEL_MIX) {
    const rows = Object.entries(mix).map(([level, share]) => {
        const quota = n * share;
        return { level: Number(level), quota, count: Math.floor(quota), rem: quota - Math.floor(quota) };
    });
    let left = n - rows.reduce((s, r) => s + r.count, 0);
    for (const r of [...rows].sort((a, b) => b.rem - a.rem || b.level - a.level)) {
        if (left <= 0) break;
        r.count += 1;
        left -= 1;
    }
    return Object.fromEntries(rows.map((r) => [r.level, r.count]));
}

const DOMAIN_WEIGHT = Object.fromEntries(DOMAINS.map((d) => [d.legacyDomainId, d.weightPercent]));

/** Weighted sample without replacement, weighted by ABRET domain weight. */
function sampleByDomainWeight(list, k, rng) {
    return list
        .map((q) => ({ q, key: Math.pow(rng(), 1 / (DOMAIN_WEIGHT[q.domainId] || 10)) }))
        .sort((a, b) => b.key - a.key)
        .slice(0, k)
        .map((x) => x.q);
}

/**
 * Select a Challenge session from challenge-bank questions (L3-L6 only).
 * Each level gets its allocated share; shortfalls are back-filled from the
 * remaining L4-L6 questions first, then L3. Within a level, domains are
 * favoured in proportion to their ABRET weight.
 */
export function selectChallenge(pool, n, rng = Math.random) {
    const eligible = pool.filter((q) => Number.isInteger(q.cognitiveLevel) && q.cognitiveLevel >= 3 && q.cognitiveLevel <= 6);
    const target = Math.min(n, eligible.length);
    const alloc = allocateChallengeLevels(target);
    const picked = [];
    for (const [level, count] of Object.entries(alloc)) {
        picked.push(...sampleByDomainWeight(eligible.filter((q) => q.cognitiveLevel === Number(level)), count, rng));
    }
    if (picked.length < target) {
        const have = new Set(picked.map((q) => q.questionId));
        const rest = eligible.filter((q) => !have.has(q.questionId));
        const higher = rest.filter((q) => q.cognitiveLevel >= 4);
        const lower = rest.filter((q) => q.cognitiveLevel < 4);
        picked.push(...sampleByDomainWeight(higher, target - picked.length, rng));
        if (picked.length < target) picked.push(...sampleByDomainWeight(lower, target - picked.length, rng));
    }
    return shuffle(picked, rng);
}

// ------------------------------------------------------------ projection ---

/**
 * The only shape in which a question is sent to a client before submission.
 * Contains no answer key, explanation or content hash.
 */
export function toPublicQuestion(q, optionOrder) {
    return {
        questionId: q.questionId,
        domainId: q.domainId,
        sectionId: q.sectionId,
        topicTags: q.topicTags || [],
        difficulty: q.difficulty,
        bank: q.bank || 'foundation',
        cognitiveLevel: q.cognitiveLevel ?? null,
        competency: q.competency ?? null,
        stem: q.stem,
        options: optionOrder.map((i) => q.options[i]),
    };
}

export function displayIndexOf(optionOrder, canonicalIndex) {
    return optionOrder.indexOf(canonicalIndex);
}

// --------------------------------------------------------------- scoring ---

function bump(map, key, isCorrect, answered) {
    if (key === undefined || key === null) return;
    if (!map[key]) map[key] = { correct: 0, attempted: 0, total: 0 };
    map[key].total += 1;
    if (answered) map[key].attempted += 1;
    if (answered && isCorrect) map[key].correct += 1;
}

/**
 * Authoritative score. Ported from the former client-side
 * calculateSessionScore, extended so unanswered questions count toward
 * totals (an exam score is correct / total).
 *
 * @param items     session items [{questionId, optionOrder}]
 * @param answers   Map-like or object: questionId -> {originalIndex}
 * @param questions Map questionId -> question (with answerIndex)
 */
export function scoreSession(items, answers, questions) {
    const get = (id) => (answers instanceof Map ? answers.get(id) : answers?.[id]);
    const breakdown = { byDomain: {}, bySection: {}, byTag: {}, byDifficulty: {} };
    const perQuestion = {};
    let correct = 0;
    let attempted = 0;

    for (const item of items) {
        const q = questions.get(item.questionId);
        if (!q) continue;
        const answer = get(item.questionId);
        const answered = !!answer && Number.isInteger(answer.originalIndex);
        const isCorrect = answered && answer.originalIndex === q.answerIndex;
        if (answered) attempted += 1;
        if (isCorrect) correct += 1;
        perQuestion[item.questionId] = { answered, isCorrect };

        bump(breakdown.byDomain, q.domainId, isCorrect, answered);
        bump(breakdown.bySection, q.sectionId, isCorrect, answered);
        bump(breakdown.byDifficulty, q.difficulty, isCorrect, answered);
        for (const tag of q.topicTags || []) bump(breakdown.byTag, tag, isCorrect, answered);
    }

    const total = items.length;
    return {
        correct,
        attempted,
        total,
        percent: total ? Math.round((correct / total) * 100) : 0,
        percentOfAttempted: attempted ? Math.round((correct / attempted) * 100) : 0,
        breakdown,
        perQuestion,
    };
}

/** XP tiers preserved from the previous /quiz/sessions/complete route. */
export function xpForPercent(percent) {
    if (percent === 100) return { xp: 100, activityType: 'quiz_perfect' };
    if (percent >= 90) return { xp: 80, activityType: 'quiz_completion' };
    if (percent >= 80) return { xp: 60, activityType: 'quiz_completion' };
    if (percent >= 70) return { xp: 40, activityType: 'quiz_completion' };
    if (percent >= 60) return { xp: 30, activityType: 'quiz_completion' };
    return { xp: 20, activityType: 'quiz_completion' };
}
