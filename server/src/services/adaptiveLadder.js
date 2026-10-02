// Adaptive level ladder for Challenge (L3-L6) questions.
//
// Within a practice session: a miss on an L4-L6 question inserts a
// "step-down" question one level lower on the same topic right after it;
// answering that correctly inserts a "climb-up" question back at the
// original level. Across sessions: each competency has a rung (L3-L6) that
// sets the level mix of focused Challenge sessions.

export const MIN_LEVEL = 3;
export const MAX_LEVEL = 6;
export const START_RUNG = 4;
export const PROMOTE_AFTER = 2; // consecutive correct at or above the rung
export const MAX_ADAPTIVE_INSERTS = 6; // per session
export const RECENT_CORRECT_MS = 3 * 24 * 60 * 60 * 1000;

const clampLevel = (l) => Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, l));

/**
 * Rung per competency from Challenge attempts (any order). Two consecutive
 * correct answers at or above the rung move it up; a miss at or below the
 * rung moves it down. Attempts below the rung that are correct do not count.
 */
export function ladderRungs(events) {
    const state = {};
    const sorted = events
        .filter((e) => Number.isInteger(e.cognitiveLevel) && e.cognitiveLevel >= MIN_LEVEL && e.competency)
        .sort((a, b) => a.timestamp - b.timestamp);
    for (const e of sorted) {
        const s = state[e.competency] || (state[e.competency] = { rung: START_RUNG, streak: 0, attempts: 0 });
        s.attempts += 1;
        if (e.isCorrect) {
            if (e.cognitiveLevel >= s.rung) {
                s.streak += 1;
                if (s.streak >= PROMOTE_AFTER && s.rung < MAX_LEVEL) {
                    s.rung += 1;
                    s.streak = 0;
                }
            }
        } else if (e.cognitiveLevel <= s.rung) {
            s.rung = clampLevel(s.rung - 1);
            s.streak = 0;
        }
    }
    return state;
}

/** Level mix centred on the rung: half at the rung, a quarter either side. */
export function levelMixForRung(rung) {
    const r = clampLevel(rung);
    const mix = {};
    const add = (level, share) => {
        const l = clampLevel(level);
        mix[l] = (mix[l] || 0) + share;
    };
    add(r - 1, 0.25);
    add(r, 0.5);
    add(r + 1, 0.25);
    return mix;
}

/**
 * Candidate for an adaptive insert. `failed` is the question just answered;
 * `targetLevel` the level wanted. Prefers the same section, then the same
 * competency, then one further level down (step-down only). Skips questions
 * already in the session and ones answered correctly in the last 3 days.
 */
export function pickAdaptiveQuestion(pool, { failed, targetLevel, excludeIds, events, rng = Math.random, now = Date.now(), allowLower = false }) {
    const recentCorrect = new Set(
        events.filter((e) => e.isCorrect && now - e.timestamp < RECENT_CORRECT_MS).map((e) => e.questionId)
    );
    const usable = pool.filter((q) => !excludeIds.has(q.questionId) && !recentCorrect.has(q.questionId) && q.questionId !== failed.questionId);
    const tiers = [
        (q) => q.cognitiveLevel === targetLevel && q.sectionId === failed.sectionId,
        (q) => q.cognitiveLevel === targetLevel && q.competency === failed.competency && q.domainId === failed.domainId,
        (q) => q.cognitiveLevel === targetLevel && q.competency === failed.competency,
    ];
    if (allowLower && targetLevel - 1 >= MIN_LEVEL) {
        tiers.push((q) => q.cognitiveLevel === targetLevel - 1 && q.competency === failed.competency);
    }
    for (const match of tiers) {
        const hits = usable.filter(match);
        if (hits.length) return hits[Math.floor(rng() * hits.length)];
    }
    return null;
}
