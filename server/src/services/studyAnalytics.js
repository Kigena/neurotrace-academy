// Study analytics: mastery, readiness, weak-area weighting and the daily
// study plan. Pure functions only; callers pass the signed-in user's own
// AttemptEvents. Nothing here is a probability of passing the exam.

import { DOMAINS } from '../blueprint/abret2026.js';

// ------------------------------------------------------------------ mastery

export const MASTERY_WINDOW = 30;        // most recent attempts considered
export const MASTERY_MIN_ATTEMPTS = 5;   // below this: "Insufficient data"
export const MASTERY_PRIOR_STRENGTH = 3; // pseudo-attempts pulling toward 50
export const MASTERY_PRIOR = 0.5;

/**
 * Mastery (0-100) for one topic.
 *
 *   1. Take the most recent 30 scored attempts, newest first (i = 0..n-1).
 *   2. Recency weight  w_i = 1 - 0.5 * i / 29   (newest 1.0, 30th-newest 0.5).
 *   3. Weighted accuracy  A = sum(w_i * correct_i) / sum(w_i).
 *   4. Evidence shrinkage toward 50%:
 *        mastery = 100 * (n * A + 3 * 0.5) / (n + 3)
 *      so few attempts cannot produce an extreme score
 *      (5/5 correct -> 81, 12/12 -> 90, 30/30 -> 95; 0/5 -> 19).
 *   5. `sufficient` is true only when n >= 5; below that the label is
 *      "Insufficient data" and the score must not be presented as mastery.
 */
export function masteryFromAttempts(attempts) {
    const recent = [...attempts]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MASTERY_WINDOW);
    const n = recent.length;
    if (n === 0) {
        return { score: null, attempts: 0, correct: 0, accuracy: null, sufficient: false, label: 'No data' };
    }
    let wSum = 0;
    let wCorrect = 0;
    recent.forEach((e, i) => {
        const w = 1 - (0.5 * i) / (MASTERY_WINDOW - 1);
        wSum += w;
        if (e.isCorrect) wCorrect += w;
    });
    const weightedAccuracy = wCorrect / wSum;
    const score = Math.round(
        (100 * (n * weightedAccuracy + MASTERY_PRIOR_STRENGTH * MASTERY_PRIOR)) / (n + MASTERY_PRIOR_STRENGTH)
    );
    const correct = recent.filter((e) => e.isCorrect).length;
    const sufficient = n >= MASTERY_MIN_ATTEMPTS;
    return {
        score,
        attempts: n,
        correct,
        accuracy: Math.round((correct / n) * 100),
        sufficient,
        label: sufficient ? masteryLabel(score) : 'Insufficient data',
    };
}

export function masteryLabel(score) {
    if (score === null || score === undefined) return 'No data';
    if (score >= 85) return 'Strong';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Developing';
    return 'Weak';
}

function groupBy(events, keysFn) {
    const groups = new Map();
    for (const e of events) {
        for (const key of keysFn(e)) {
            if (key === undefined || key === null || key === '') continue;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(e);
        }
    }
    return groups;
}

export function masteryTable(events, keysFn) {
    const out = {};
    for (const [key, list] of groupBy(events, keysFn)) {
        const m = masteryFromAttempts(list);
        m.lastAttemptAt = Math.max(...list.map((e) => e.timestamp));
        out[key] = m;
    }
    return out;
}

export function computeMastery(events) {
    return {
        byDomain: masteryTable(events, (e) => [e.domainId]),
        bySection: masteryTable(events, (e) => [e.sectionId]),
        byTag: masteryTable(events, (e) => e.topicTags || []),
    };
}

// ---------------------------------------------------------- basic metrics

export function accuracyOf(events) {
    if (!events.length) return null;
    return Math.round((events.filter((e) => e.isCorrect).length / events.length) * 100);
}

export function recentPerformance(events) {
    const sorted = [...events].sort((a, b) => b.timestamp - a.timestamp);
    const last20 = sorted.slice(0, 20);
    const prev20 = sorted.slice(20, 40);
    const last20Accuracy = accuracyOf(last20);
    const prev20Accuracy = accuracyOf(prev20);
    return {
        totalAttempts: events.length,
        overallAccuracy: accuracyOf(events),
        last20Accuracy,
        last20Count: last20.length,
        prev20Accuracy,
        trend: last20Accuracy !== null && prev20Accuracy !== null && prev20.length >= 10 && last20.length >= 10
            ? last20Accuracy - prev20Accuracy
            : null,
    };
}

/** Question IDs whose MOST RECENT attempt was incorrect. */
export function outstandingIncorrect(events) {
    const latest = new Map();
    for (const e of events) {
        const cur = latest.get(e.questionId);
        if (!cur || e.timestamp > cur.timestamp) latest.set(e.questionId, e);
    }
    return [...latest.values()]
        .filter((e) => !e.isCorrect)
        .sort((a, b) => b.timestamp - a.timestamp);
}

// ---------------------------------------------------------------- readiness

export const READINESS_WEIGHTS = { domainMastery: 0.5, recentPerformance: 0.25, coverage: 0.15, mock: 0.1 };
const RECENT_MIN = 10;
const COVERAGE_MIN_ATTEMPTS_PER_SECTION = 3;

export function readinessLabel(score) {
    if (score === null) return 'Not enough data';
    if (score >= 85) return 'Strong Preparation';
    if (score >= 70) return 'Approaching Ready';
    if (score >= 50) return 'Developing';
    return 'Building Foundation';
}

/**
 * Study readiness (0-100). NOT a probability of passing.
 *
 *   50%  ABRET-weighted domain mastery: sum(weight_d * mastery_d) over the
 *        four 2026 domains. A domain with fewer than 5 attempts is counted
 *        as 0 ("not yet demonstrated"). Available once any domain has
 *        sufficient data.
 *   25%  Recent performance: accuracy over the last 20 scored attempts
 *        (needs >= 10 attempts).
 *   15%  Content coverage: share of the bank's sections with >= 3 scored
 *        attempts (needs >= 1 attempt).
 *   10%  Mock-exam performance: mean score of the last 3 submitted mock
 *        exams (needs >= 1 mock).
 *
 * Unavailable components are excluded and the remaining weights are
 * re-normalised; the response lists every component, its availability,
 * and the share of the full weight that was actually measured.
 */
export function computeReadiness({ mastery, performance, events, totalSections, mockResults }) {
    const components = [];

    // Domain mastery
    const perDomain = DOMAINS.map((d) => {
        const m = mastery.byDomain[d.legacyDomainId];
        return {
            domainId: d.legacyDomainId,
            title: d.title,
            weightPercent: d.weightPercent,
            mastery: m?.sufficient ? m.score : null,
            counted: m?.sufficient ? m.score : 0,
        };
    });
    const anyDomain = perDomain.some((d) => d.mastery !== null);
    components.push({
        key: 'domainMastery',
        label: 'ABRET-weighted domain mastery',
        weight: READINESS_WEIGHTS.domainMastery,
        available: anyDomain,
        score: anyDomain ? Math.round(perDomain.reduce((s, d) => s + (d.weightPercent / 100) * d.counted, 0)) : null,
        detail: anyDomain
            ? `${perDomain.filter((d) => d.mastery === null).length} of 4 domains not yet assessed (counted as 0)`
            : 'No domain has 5+ scored attempts yet',
        domains: perDomain,
    });

    // Recent performance
    const recentOk = performance.last20Count >= RECENT_MIN;
    components.push({
        key: 'recentPerformance',
        label: 'Recent performance (last 20 answers)',
        weight: READINESS_WEIGHTS.recentPerformance,
        available: recentOk,
        score: recentOk ? performance.last20Accuracy : null,
        detail: recentOk ? `${performance.last20Count} recent answers` : `Needs ${RECENT_MIN} answers (have ${performance.last20Count})`,
    });

    // Coverage
    const sectionCounts = new Map();
    for (const e of events) sectionCounts.set(e.sectionId, (sectionCounts.get(e.sectionId) || 0) + 1);
    const covered = [...sectionCounts.values()].filter((c) => c >= COVERAGE_MIN_ATTEMPTS_PER_SECTION).length;
    const coverageOk = events.length > 0 && totalSections > 0;
    components.push({
        key: 'coverage',
        label: 'Content coverage',
        weight: READINESS_WEIGHTS.coverage,
        available: coverageOk,
        score: coverageOk ? Math.round((Math.min(covered, totalSections) / totalSections) * 100) : null,
        detail: coverageOk ? `${covered} of ${totalSections} sections with ${COVERAGE_MIN_ATTEMPTS_PER_SECTION}+ answers` : 'No answers yet',
    });

    // Mock exams
    const lastMocks = mockResults.slice(0, 3);
    const mockOk = lastMocks.length > 0;
    components.push({
        key: 'mock',
        label: 'Mock-exam performance',
        weight: READINESS_WEIGHTS.mock,
        available: mockOk,
        score: mockOk ? Math.round(lastMocks.reduce((s, m) => s + m.percent, 0) / lastMocks.length) : null,
        detail: mockOk ? `Mean of last ${lastMocks.length} mock exam(s)` : 'No mock exam submitted yet',
    });

    const available = components.filter((c) => c.available);
    const measuredWeight = available.reduce((s, c) => s + c.weight, 0);
    const score = available.length
        ? Math.round(available.reduce((s, c) => s + c.weight * c.score, 0) / measuredWeight)
        : null;

    return {
        score,
        label: readinessLabel(score),
        measuredWeightPercent: Math.round(measuredWeight * 100),
        components,
        disclaimer: 'Study readiness summarises your practice data. It is not a probability of passing the exam.',
    };
}

// ------------------------------------------------------- weak-area weights

const DOMAIN_IMPORTANCE = Object.fromEntries(
    DOMAINS.map((d) => [d.legacyDomainId, d.weightPercent / Math.max(...DOMAINS.map((x) => x.weightPercent))])
);
const DAY = 24 * 60 * 60 * 1000;

/**
 * Selection weight for one question in a "Study my weak areas" session.
 *
 *   weakness   = 0.6 * (100 - sectionMastery)/100 + 0.4 * mean tag weakness
 *                (unseen sections/tags count as 50 mastery)
 *   w = 0.1
 *     + 4.0  * weakness^2                    (1. lowest mastery - dominant)
 *     + 2.0  * [latest attempt was wrong]    (2. recent incorrect)
 *     + 0.5  * domainWeight / 46             (3. ABRET importance)
 *     + 0.75 * [section untouched in 7 days] (4. not reviewed recently)
 */
export function weakAreaWeight(q, profile, now = Date.now()) {
    const sec = profile.mastery.bySection[q.sectionId];
    const secScore = sec ? sec.score : 50;
    const tagScores = (q.topicTags || [])
        .map((t) => profile.mastery.byTag[t]?.score)
        .filter((s) => s !== undefined && s !== null);
    const tagWeakness = tagScores.length
        ? tagScores.reduce((s, x) => s + (100 - x) / 100, 0) / tagScores.length
        : 0.5;
    const weakness = 0.6 * ((100 - secScore) / 100) + 0.4 * tagWeakness;
    const incorrect = profile.incorrectIds.has(q.questionId) ? 1 : 0;
    const importance = DOMAIN_IMPORTANCE[q.domainId] ?? 0.3;
    const lastSeen = sec?.lastAttemptAt;
    const stale = !lastSeen || now - lastSeen > 7 * DAY ? 1 : 0;
    return 0.1 + 4 * weakness * weakness + 2 * incorrect + 0.5 * importance + 0.75 * stale;
}

export function buildStudyProfile(events) {
    return {
        mastery: computeMastery(events),
        incorrectIds: new Set(outstandingIncorrect(events).map((e) => e.questionId)),
    };
}

/**
 * Weighted sampling without replacement (Efraimidis-Spirakis keys),
 * with a per-section cap so the session stays mixed.
 */
export function selectWeakAreas(pool, profile, n, { rng = Math.random, now = Date.now(), maxShare = 0.3 } = {}) {
    const cap = Math.max(1, Math.ceil(n * maxShare));
    const keyed = pool
        .map((q) => ({ q, key: Math.pow(rng(), 1 / weakAreaWeight(q, profile, now)) }))
        .sort((a, b) => b.key - a.key);
    const perSection = new Map();
    const picked = [];
    const overflow = [];
    for (const { q } of keyed) {
        if (picked.length >= n) break;
        const c = perSection.get(q.sectionId) || 0;
        if (c < cap) {
            picked.push(q);
            perSection.set(q.sectionId, c + 1);
        } else {
            overflow.push(q);
        }
    }
    // If the pool is too narrow for the cap, fill from the highest keys.
    for (const q of overflow) {
        if (picked.length >= n) break;
        picked.push(q);
    }
    return picked;
}

// --------------------------------------------------------- daily study plan

const D2_PREFERENCE_POINTS = 5; // D2 sections sort as if 5 mastery points weaker

/**
 * Deterministic "Today's Study" plan from current performance (no AI).
 *   - up to two 10-question section blocks from the weakest sections with
 *     sufficient data (mastery < 85), D2 preferred when weakness is similar
 *   - otherwise a 10-question block in the weakest assessed domain, or a
 *     Domain II starter block when there is no data
 *   - review up to 5 outstanding incorrect questions
 *   - a 10-question mixed ABRET quiz
 */
export function buildDailyPlan({ mastery, incorrectCount, sectionDomains = {} }) {
    const items = [];
    const sections = Object.entries(mastery.bySection)
        .filter(([, m]) => m.sufficient && m.score < 85)
        .map(([sectionId, m]) => ({
            sectionId,
            score: m.score,
            domainId: null,
            rank: m.score,
        }));
    // sectionDomains maps sectionId -> domainId (built from the question bank).
    for (const s of sections) {
        s.domainId = sectionDomains[s.sectionId] || null;
        s.rank = s.score - (s.domainId === 'domain-2' ? D2_PREFERENCE_POINTS : 0);
    }
    sections.sort((a, b) => a.rank - b.rank || a.sectionId.localeCompare(b.sectionId));

    for (const s of sections.slice(0, 2)) {
        items.push({
            kind: 'section',
            count: 10,
            sectionId: s.sectionId,
            domainId: s.domainId,
            mastery: s.score,
            reason: `Mastery ${s.score}% (${masteryLabel(s.score)})`,
        });
    }

    if (items.length === 0) {
        const domains = DOMAINS
            .map((d) => ({ d, m: mastery.byDomain[d.legacyDomainId] }))
            .filter((x) => x.m?.sufficient && x.m.score < 85)
            .map((x) => ({ ...x, rank: x.m.score - (x.d.legacyDomainId === 'domain-2' ? D2_PREFERENCE_POINTS : 0) }))
            .sort((a, b) => a.rank - b.rank);
        const target = domains[0]?.d || DOMAINS.find((d) => d.legacyDomainId === 'domain-2');
        items.push({
            kind: 'domain',
            count: 10,
            domainId: target.legacyDomainId,
            mastery: domains[0]?.m.score ?? null,
            reason: domains.length
                ? `Weakest assessed domain (${domains[0].m.score}%)`
                : 'Not enough data yet - start with Domain II (46% of the exam)',
        });
    }

    if (incorrectCount > 0) {
        items.push({
            kind: 'review',
            count: Math.min(5, incorrectCount),
            reason: `${incorrectCount} question(s) still answered incorrectly`,
        });
    }

    items.push({ kind: 'mixed', count: 10, reason: 'Mixed ABRET practice across all domains' });
    return items;
}
