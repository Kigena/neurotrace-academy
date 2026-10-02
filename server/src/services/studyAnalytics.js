// Study analytics: mastery, readiness, weak-area weighting and the daily
// study plan. Pure functions only; callers pass the signed-in user's own
// AttemptEvents. Nothing here is a probability of passing the exam.

import { DOMAINS } from '../blueprint/abret2026.js';

// ------------------------------------------------------------------ mastery

export const MASTERY_WINDOW = 30;        // most recent attempts considered
export const MASTERY_MIN_ATTEMPTS = 5;   // below this: "Insufficient data"
export const MASTERY_PRIOR_STRENGTH = 10; // pseudo-attempts pulling toward 50
export const MASTERY_PRIOR = 0.5;
// Weak-area ranking reacts faster than displayed mastery (lighter prior, no cap).
export const RANK_PRIOR_STRENGTH = 3;
// Higher bands need evidence spread over time (exam = retention, not cramming).
// Caps apply from the top down: the first row whose requirements are met.
export const MASTERY_EVIDENCE_CAPS = [
    { minDays: 3, minAttempts: 20, cap: 100 }, // "Strong" possible
    { minDays: 2, minAttempts: 10, cap: 84 },  // up to "Good"
    { minDays: 0, minAttempts: 0, cap: 69 },   // up to "Developing"
];
// Domains: a score above 50 counts fully only once this many sections have answers.
export const DOMAIN_FULL_COVERAGE_SECTIONS = 4;

const studyDayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
const studyDayOf = (ts) => studyDayFormat.format(new Date(ts));

/**
 * Mastery (0-100) for one topic.
 *
 *   1. Take the most recent 30 scored attempts, newest first (i = 0..n-1).
 *   2. Recency weight  w_i = 1 - 0.5 * i / 29   (newest 1.0, 30th-newest 0.5).
 *   3. Weighted accuracy  A = sum(w_i * correct_i) / sum(w_i).
 *   4. Evidence shrinkage toward 50%:
 *        raw = 100 * (n * A + 10 * 0.5) / (n + 10)
 *      (5/5 correct -> 67, 10/10 -> 75, 20/20 -> 83, 30/30 -> 88; 0/5 -> 33).
 *   5. Spaced-evidence cap: answers from a single study day cap at 69
 *      ("Developing"); "Good" needs 2+ days and 10+ answers; "Strong" needs
 *      3+ days and 20+ answers. Caps never lift a low score.
 *   6. `sufficient` is true only when n >= 5; below that the label is
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
    const rawScore = Math.round(
        (100 * (n * weightedAccuracy + MASTERY_PRIOR_STRENGTH * MASTERY_PRIOR)) / (n + MASTERY_PRIOR_STRENGTH)
    );
    const rankScore = Math.round(
        (100 * (n * weightedAccuracy + RANK_PRIOR_STRENGTH * MASTERY_PRIOR)) / (n + RANK_PRIOR_STRENGTH)
    );
    const studyDays = new Set(recent.map((e) => studyDayOf(e.timestamp))).size;
    const tier = MASTERY_EVIDENCE_CAPS.find((t) => studyDays >= t.minDays && n >= t.minAttempts);
    const score = Math.min(rawScore, tier.cap);
    const correct = recent.filter((e) => e.isCorrect).length;
    const sufficient = n >= MASTERY_MIN_ATTEMPTS;
    return {
        score,
        rawScore,
        rankScore,
        capped: score < rawScore,
        capNote: score < rawScore ? evidenceNote(studyDays, n) : null,
        studyDays,
        attempts: n,
        correct,
        accuracy: Math.round((correct / n) * 100),
        sufficient,
        label: sufficient ? masteryLabel(score) : 'Insufficient data',
    };
}

function evidenceNote(days, n) {
    const next = [...MASTERY_EVIDENCE_CAPS].reverse().find((t) => days < t.minDays || n < t.minAttempts);
    const needs = [];
    if (days < next.minDays) needs.push(`answers on ${next.minDays - days} more day${next.minDays - days === 1 ? '' : 's'}`);
    if (n < next.minAttempts) needs.push(`${next.minAttempts - n} more answers`);
    return `Capped until there is more spaced evidence: needs ${needs.join(' and ')}`;
}

/**
 * Domain mastery also needs breadth: a score above 50 counts fully only once
 * DOMAIN_FULL_COVERAGE_SECTIONS sections have answers (low scores are never
 * lifted, so weaknesses still show).
 */
export function withDomainCoverage(m, events) {
    if (!m || m.score === null) return m;
    const sections = new Set(events.map((e) => e.sectionId)).size;
    const coverage = Math.min(1, sections / DOMAIN_FULL_COVERAGE_SECTIONS);
    if (m.score <= 50 || coverage >= 1) return { ...m, sectionsCovered: sections };
    const score = Math.round(50 + (m.score - 50) * coverage);
    return {
        ...m,
        score,
        sectionsCovered: sections,
        capped: true,
        capNote: [m.capNote, `answers in ${DOMAIN_FULL_COVERAGE_SECTIONS - sections} more section${DOMAIN_FULL_COVERAGE_SECTIONS - sections === 1 ? '' : 's'} of this domain`]
            .filter(Boolean).join('; '),
        label: m.sufficient ? masteryLabel(score) : m.label,
    };
}

function domainMasteryTable(events) {
    const table = masteryTable(events, (e) => [e.domainId]);
    for (const [domainId, m] of Object.entries(table)) {
        table[domainId] = withDomainCoverage(m, events.filter((e) => e.domainId === domainId));
    }
    return table;
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
    const challenge = events.filter((e) => e.bank === 'challenge');
    return {
        byDomain: domainMasteryTable(events),
        bySection: masteryTable(events, (e) => [e.sectionId]),
        byTag: masteryTable(events, (e) => e.topicTags || []),
        // Challenge Bank only
        byCompetency: masteryTable(challenge, (e) => [e.competency]),
        byLevel: masteryTable(challenge, (e) => (e.cognitiveLevel ? [`L${e.cognitiveLevel}`] : [])),
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

/**
 * Higher-order competencies. Evidence comes only from Challenge Bank
 * attempts (L3-L6), so foundation-bank recall cannot inflate them.
 */
export const HIGHER_ORDER_COMPETENCIES = [
    { key: 'technical', label: 'Technical reasoning' },
    { key: 'montage', label: 'Montage / localization' },
    { key: 'troubleshooting', label: 'Troubleshooting' },
    { key: 'clinical', label: 'Clinical integration' },
];

export const READINESS_WEIGHTS = {
    foundation: 0.2,
    technical: 0.15,
    montage: 0.15,
    troubleshooting: 0.15,
    clinical: 0.15,
    mock: 0.2,
};

export const isChallengeEvent = (e) => e.bank === 'challenge';

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
 *   20%  Foundation mastery - ABRET-weighted (15/46/19/20) domain mastery on
 *        the foundation (legacy) bank.
 *   15%  Technical reasoning      \
 *   15%  Montage / localization    |  mastery on Challenge Bank (L3-L6)
 *   15%  Troubleshooting           |  questions of that competency
 *   15%  Clinical integration     /
 *   20%  Mock performance - mean of the last 3 submitted mock exams.
 *
 * Anything not yet assessed (a domain or competency with < 5 answers, or no
 * mock) counts as 0 and is labelled as such. Unassessed components are not
 * re-normalised away: perfect foundation-bank scores alone can reach at most
 * 20, and foundation plus mocks at most 40 ("Building Foundation").
 * The score is null only when there is no data at all.
 */
export function computeReadiness({ events, mockResults }) {
    const foundationEvents = events.filter((e) => !isChallengeEvent(e));
    const challengeEvents = events.filter((e) => isChallengeEvent(e) && (e.cognitiveLevel ?? 3) >= 3);
    const components = [];

    // Foundation mastery (domain-weighted)
    const foundationByDomain = domainMasteryTable(foundationEvents);
    const perDomain = DOMAINS.map((d) => {
        const m = foundationByDomain[d.legacyDomainId];
        return {
            domainId: d.legacyDomainId,
            title: d.title,
            weightPercent: d.weightPercent,
            mastery: m?.sufficient ? m.score : null,
        };
    });
    const assessedDomains = perDomain.filter((d) => d.mastery !== null).length;
    components.push({
        key: 'foundation',
        label: 'Foundation mastery',
        weight: READINESS_WEIGHTS.foundation,
        assessed: assessedDomains > 0,
        score: Math.round(perDomain.reduce((s, d) => s + (d.weightPercent / 100) * (d.mastery ?? 0), 0)),
        detail: assessedDomains
            ? `Foundation bank; ${4 - assessedDomains} of 4 domains not yet assessed (counted as 0)`
            : 'Foundation bank: no domain has 5+ answers yet (counted as 0)',
        domains: perDomain,
    });

    // Higher-order competencies (Challenge Bank only)
    const byCompetency = masteryTable(challengeEvents, (e) => [e.competency]);
    for (const c of HIGHER_ORDER_COMPETENCIES) {
        const m = byCompetency[c.key];
        const assessed = !!m?.sufficient;
        components.push({
            key: c.key,
            label: c.label,
            weight: READINESS_WEIGHTS[c.key],
            assessed,
            score: assessed ? m.score : 0,
            detail: assessed
                ? `${m.attempts} recent Challenge answers, ${m.accuracy}% correct`
                : `Challenge Bank: ${m?.attempts || 0}/5 answers - not yet assessed (counted as 0)`,
        });
    }

    // Mock exams
    const lastMocks = mockResults.slice(0, 3);
    components.push({
        key: 'mock',
        label: 'Mock performance',
        weight: READINESS_WEIGHTS.mock,
        assessed: lastMocks.length > 0,
        score: lastMocks.length ? Math.round(lastMocks.reduce((s, m) => s + m.percent, 0) / lastMocks.length) : 0,
        detail: lastMocks.length
            ? `Mean of last ${lastMocks.length} mock exam(s)`
            : 'No mock exam submitted yet (counted as 0)',
    });

    // Backwards-compatible field used by the UI breakdown
    for (const c of components) c.available = c.assessed;

    const anyData = events.length > 0 || mockResults.length > 0;
    const score = anyData ? Math.round(components.reduce((s, c) => s + c.weight * c.score, 0)) : null;
    const assessedWeight = components.filter((c) => c.assessed).reduce((s, c) => s + c.weight, 0);

    return {
        score,
        label: readinessLabel(score),
        measuredWeightPercent: Math.round(assessedWeight * 100),
        components,
        disclaimer: 'Study readiness summarises your practice data. It is not a probability of passing the exam. Unassessed parts count as 0.',
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
    // Ranking uses a faster-reacting estimate (lighter prior, no spaced-evidence
    // cap): the cap limits what is displayed as mastery, not how weak a topic
    // looks relative to the others.
    const rank = (m) => (m ? (m.rankScore ?? m.score) : undefined);
    const sec = profile.mastery.bySection[q.sectionId];
    const secScore = sec ? rank(sec) : 50;
    const tagScores = (q.topicTags || [])
        .map((t) => rank(profile.mastery.byTag[t]))
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
export function buildDailyPlan({ mastery, incorrectCount, sectionDomains = {}, challengeAvailable = 0, reviewsDue = 0, misconception = null }) {
    const items = [];

    // Reinforcement first: due spaced reviews, then one repeated mistake.
    if (reviewsDue > 0) {
        items.push({
            kind: 'reviews',
            count: Math.min(20, reviewsDue) > 10 ? 20 : 10,
            due: reviewsDue,
            reason: `${reviewsDue} question(s) due for spaced review`,
        });
    }
    if (misconception) {
        items.push({
            kind: 'misconception',
            count: 5,
            code: misconception.code,
            title: misconception.title,
            reason: `Made ${misconception.recentErrors}× in the last 30 days`,
        });
    }

    // Challenge-first plan: the foundation bank is mostly recall, so when the
    // Challenge Bank is available, Today's Study is built from it.
    if (challengeAvailable > 0) {
        const competencies = HIGHER_ORDER_COMPETENCIES.map((c, order) => {
            const m = mastery.byCompetency?.[c.key];
            // Unassessed competencies rank as weakest; Technical/Montage first on ties
            const rank = m?.sufficient ? m.score : -1;
            return { ...c, order, rank, mastery: m?.sufficient ? m.score : null, attempts: m?.attempts || 0 };
        }).sort((x, y) => x.rank - y.rank || x.order - y.order);
        const focus = competencies[0];
        items.push({
            kind: 'challenge',
            count: 10,
            competency: focus.key,
            mastery: focus.mastery,
            reason: focus.mastery === null
                ? `${focus.label}: not yet assessed (${focus.attempts}/5 Challenge answers)`
                : `${focus.label}: weakest higher-order skill (${focus.mastery}%)`,
        });
        items.push({ kind: 'challenge', count: 10, reason: 'Mixed L3-L6 Challenge questions across all competencies' });
        if (incorrectCount > 0) {
            items.push({ kind: 'review', count: Math.min(5, incorrectCount), reason: `${incorrectCount} question(s) still answered incorrectly` });
        }
        return items;
    }

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
