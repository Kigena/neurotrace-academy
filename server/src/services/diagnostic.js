// 40-question diagnostic, entirely from the Challenge Bank.
//
// 10 questions per competency (L3 2, L4 3, L5 3, L6 2), so every
// higher-order readiness component gets real evidence, with domains steered
// toward the ABRET split 6/18/8/8 and unseen questions first.
// Timed (60 min), no feedback until submission.

export const DIAGNOSTIC_TIME_LIMIT_SEC = 60 * 60;
export const DIAGNOSTIC_COMPETENCIES = ['technical', 'montage', 'troubleshooting', 'clinical'];
export const DIAGNOSTIC_LEVELS = { 3: 2, 4: 3, 5: 3, 6: 2 }; // per competency
export const DIAGNOSTIC_DOMAIN_TARGET = { 'domain-1': 6, 'domain-2': 18, 'domain-3': 8, 'domain-4': 8 };
export const DIAGNOSTIC_SIZE = 40;
export const DIAGNOSTIC_RETAKE_DAYS = 21;

function shuffled(list, rng) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function selectDiagnostic(pool, events = [], rng = Math.random) {
    const seen = new Set(events.map((e) => e.questionId));
    const challenge = pool.filter((q) => q.bank === 'challenge' && Number.isInteger(q.cognitiveLevel));
    const used = new Set();
    const domainCount = {};
    const picked = [];
    const deficit = (d) => (DIAGNOSTIC_DOMAIN_TARGET[d] || 0) - (domainCount[d] || 0);

    // One slot at a time: unseen questions first, then the domain furthest below its target.
    const fill = (candidates) => {
        const best = shuffled(candidates.filter((q) => !used.has(q.questionId)), rng)
            .sort((a, b) => (seen.has(a.questionId) - seen.has(b.questionId)) || (deficit(b.domainId) - deficit(a.domainId)))[0];
        if (!best) return false;
        used.add(best.questionId);
        domainCount[best.domainId] = (domainCount[best.domainId] || 0) + 1;
        picked.push(best);
        return true;
    };

    for (const competency of DIAGNOSTIC_COMPETENCIES) {
        const mine = challenge.filter((q) => q.competency === competency);
        for (const [level, n] of Object.entries(DIAGNOSTIC_LEVELS)) {
            for (let i = 0; i < n; i++) {
                // Thin level: any level for the same competency.
                if (!fill(mine.filter((q) => q.cognitiveLevel === Number(level)))) fill(mine);
            }
        }
    }
    return shuffled(picked, rng).slice(0, DIAGNOSTIC_SIZE);
}

/**
 * Summary of a submitted diagnostic for the dashboard: score, per-domain and
 * per-competency results, and whether a retake is suggested.
 */
export function diagnosticSummary(session, now = Date.now()) {
    if (!session) return { taken: false, retakeSuggested: true };
    const r = session.result || {};
    const plain = (m) => (m instanceof Map ? Object.fromEntries(m) : m || {});
    const pct = (row) => (row && row.total ? Math.round((100 * row.correct) / row.total) : null);
    const byDomain = Object.fromEntries(Object.entries(plain(r.breakdown?.byDomain)).map(([k, v]) => [k, { ...v, percent: pct(v) }]));
    const byCompetency = Object.fromEntries(Object.entries(plain(r.breakdown?.byCompetency)).map(([k, v]) => [k, { ...v, percent: pct(v) }]));
    const daysSince = Math.floor((now - session.endTime) / 86400000);
    return {
        taken: true,
        sessionId: session.sessionId,
        endTime: session.endTime,
        percent: r.percent ?? null,
        correct: r.correct ?? null,
        total: r.total ?? null,
        byDomain,
        byCompetency,
        daysSince,
        retakeSuggested: daysSince >= DIAGNOSTIC_RETAKE_DAYS,
    };
}
