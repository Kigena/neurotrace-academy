// 40-question diagnostic.
//
// Sized to give real signal rather than one answer per section (section
// mastery needs 5 answers):
// - 20 Challenge questions, 5 per competency at L3/L4/L4/L5/L5, which is
//   enough to assess all four higher-order readiness components;
// - 20 foundation questions split 3/9/4/4 by ABRET domain weight, one per
//   section, choosing the sections the user has answered least first.
// Timed (60 min), no feedback until submission.

export const DIAGNOSTIC_TIME_LIMIT_SEC = 60 * 60;
export const DIAGNOSTIC_COMPETENCIES = ['technical', 'montage', 'troubleshooting', 'clinical'];
export const DIAGNOSTIC_LEVELS = { 3: 1, 4: 2, 5: 2 }; // per competency
export const DIAGNOSTIC_FOUNDATION = { 'domain-1': 3, 'domain-2': 9, 'domain-3': 4, 'domain-4': 4 };
export const DIAGNOSTIC_SIZE = 40;
export const DIAGNOSTIC_RETAKE_DAYS = 21;

function sample(list, n, rng) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
}

export function selectDiagnostic(pool, events = [], rng = Math.random) {
    const picked = [];
    const used = new Set();
    const take = (qs) => {
        for (const q of qs) {
            if (!used.has(q.questionId)) {
                used.add(q.questionId);
                picked.push(q);
            }
        }
    };

    const challenge = pool.filter((q) => q.bank === 'challenge' && Number.isInteger(q.cognitiveLevel));
    for (const competency of DIAGNOSTIC_COMPETENCIES) {
        const mine = challenge.filter((q) => q.competency === competency);
        let need = 0;
        for (const [level, n] of Object.entries(DIAGNOSTIC_LEVELS)) {
            need += n;
            take(sample(mine.filter((q) => q.cognitiveLevel === Number(level) && !used.has(q.questionId)), n, rng));
        }
        // Thin levels: top up from the same competency at L3-L6.
        const have = picked.filter((q) => q.competency === competency && q.bank === 'challenge').length;
        if (have < need) take(sample(mine.filter((q) => !used.has(q.questionId)), need - have, rng));
    }

    const seen = new Map();
    for (const e of events) seen.set(e.sectionId, (seen.get(e.sectionId) || 0) + 1);
    const foundation = pool.filter((q) => q.bank !== 'challenge');
    for (const [domainId, n] of Object.entries(DIAGNOSTIC_FOUNDATION)) {
        const inDomain = foundation.filter((q) => q.domainId === domainId);
        const sections = sample([...new Set(inDomain.map((q) => q.sectionId))], Infinity, rng)
            .sort((a, b) => (seen.get(a) || 0) - (seen.get(b) || 0));
        const chosen = [];
        for (const sectionId of sections) {
            if (chosen.length >= n) break;
            const [q] = sample(inDomain.filter((x) => x.sectionId === sectionId && !used.has(x.questionId)), 1, rng);
            if (q) {
                chosen.push(q);
                used.add(q.questionId);
            }
        }
        if (chosen.length < n) {
            const extra = sample(inDomain.filter((x) => !used.has(x.questionId)), n - chosen.length, rng);
            for (const q of extra) used.add(q.questionId);
            chosen.push(...extra);
        }
        picked.push(...chosen);
    }

    return sample(picked, picked.length, rng).slice(0, DIAGNOSTIC_SIZE);
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
