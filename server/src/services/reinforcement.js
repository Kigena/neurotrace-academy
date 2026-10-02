// Reinforcement: spaced repetition and misconception tracking.
//
// Both are derived on demand from the user's scored AttemptEvents, so there
// is no extra state to keep consistent and existing history counts at once.
// See docs/STUDY_ANALYTICS.md ("Spaced review", "Repeated mistakes").

import { codesForQuestion, describeMisconception, questionIdsForCode } from './misconceptions.js';

export const DAY_MS = 24 * 60 * 60 * 1000;
// Wait after each successful review stage; a miss restarts at stage 0.
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 16, 35];
// Correct answers on separate days (since the last miss) that count as "learned".
export const LEARNED_AFTER = 3;
export const CONFIDENCE_LEVELS = ['sure', 'unsure', 'guess'];
export const MISCONCEPTION_WINDOW_DAYS = 30;
// A code is "active" with this many errors in the window...
export const MISCONCEPTION_ACTIVE_ERRORS = 2;
// ...until this many later correct answers on questions that test it.
export const MISCONCEPTION_CLEAR_AFTER = 3;

const dayOf = (t) => Math.floor(t / DAY_MS);
const due = (stage, t) => t + REVIEW_INTERVALS_DAYS[stage] * DAY_MS;

/**
 * Replay one question's attempts (oldest first) into its review state, or
 * null if it never needed review.
 *
 * - Wrong: stage 0, due in 1 day. Confidently wrong ("sure") is flagged as a
 *   misconception and reviewed first.
 * - Correct but guessed: enters (or stays at its stage) without credit.
 * - Correct and unsure: enters at stage 1 (3 days) if not yet queued.
 * - Correct (sure / no rating) while queued: advances one stage, but only on a
 *   later calendar day than the last change, so same-day cramming earns no
 *   credit. Passing the last stage retires the question.
 */
export function scheduleQuestion(attempts) {
    let s = null;
    for (const a of attempts) {
        const t = a.timestamp;
        const conf = CONFIDENCE_LEVELS.includes(a.confidence) ? a.confidence : null;
        if (!a.isCorrect) {
            s = {
                stage: 0,
                dueAt: due(0, t),
                lapses: (s?.lapses || 0) + 1,
                correctDays: 0,
                lastChangeDay: dayOf(t),
                misconception: conf === 'sure',
                errorCode: a.errorCode || null,
                lastConfidence: conf,
                lastAt: t,
                retired: false,
            };
            continue;
        }
        if (!s || s.retired) {
            if (conf === 'guess' || conf === 'unsure') {
                const stage = conf === 'guess' ? 0 : 1;
                s = {
                    stage,
                    dueAt: due(stage, t),
                    lapses: s?.lapses || 0,
                    correctDays: 0,
                    lastChangeDay: dayOf(t),
                    misconception: false,
                    errorCode: null,
                    lastConfidence: conf,
                    lastAt: t,
                    retired: false,
                };
            }
            continue;
        }
        s.lastAt = t;
        s.lastConfidence = conf;
        if (conf === 'guess') {
            s.dueAt = due(s.stage, t);
            continue;
        }
        if (dayOf(t) <= s.lastChangeDay) continue;
        s.misconception = false;
        s.correctDays += 1;
        s.lastChangeDay = dayOf(t);
        s.stage += 1;
        if (s.stage >= REVIEW_INTERVALS_DAYS.length) {
            s.retired = true;
            s.dueAt = null;
        } else {
            s.dueAt = due(s.stage, t);
        }
    }
    return s;
}

function groupByQuestion(events) {
    const byQ = new Map();
    for (const e of events) {
        if (!byQ.has(e.questionId)) byQ.set(e.questionId, []);
        byQ.get(e.questionId).push(e);
    }
    for (const list of byQ.values()) list.sort((a, b) => a.timestamp - b.timestamp);
    return byQ;
}

/**
 * Review queue for a user. `events` in any order. Returns the due items in
 * priority order (misconceptions, then most lapses, then most overdue) and a
 * summary for the dashboard.
 */
export function buildReviewQueue(events, now = Date.now()) {
    const items = [];
    let retired = 0;
    for (const [questionId, list] of groupByQuestion(events)) {
        const s = scheduleQuestion(list);
        if (!s) continue;
        if (s.retired) {
            retired += 1;
            continue;
        }
        items.push({ questionId, ...s, isDue: s.dueAt <= now });
    }
    const dueItems = items
        .filter((i) => i.isDue)
        .sort((a, b) => (b.misconception - a.misconception) || (b.lapses - a.lapses) || (a.dueAt - b.dueAt));
    return {
        due: dueItems,
        summary: {
            dueNow: dueItems.length,
            misconceptionsDue: dueItems.filter((i) => i.misconception).length,
            dueThisWeek: items.filter((i) => i.dueAt <= now + 7 * DAY_MS).length,
            inReview: items.length,
            learning: items.filter((i) => i.correctDays < LEARNED_AFTER).length,
            learned: items.filter((i) => i.correctDays >= LEARNED_AFTER).length + retired,
            nextDueAt: items.filter((i) => !i.isDue).reduce((m, i) => Math.min(m, i.dueAt), Infinity),
        },
    };
}

/**
 * Repeated mistakes from error codes recorded on wrong answers. A code is
 * active with MISCONCEPTION_ACTIVE_ERRORS errors in the last 30 days and
 * fewer than MISCONCEPTION_CLEAR_AFTER correct answers, since its last
 * error, on questions that offer that mistake as a distractor.
 */
export function misconceptionSummary(events, now = Date.now(), { codesFor = codesForQuestion } = {}) {
    const since = now - MISCONCEPTION_WINDOW_DAYS * DAY_MS;
    const stats = new Map();
    const get = (code) => {
        if (!stats.has(code)) stats.set(code, { code, errors: 0, recentErrors: 0, lastErrorAt: 0, clears: 0 });
        return stats.get(code);
    };
    for (const e of [...events].sort((a, b) => a.timestamp - b.timestamp)) {
        if (!e.isCorrect && e.errorCode) {
            const s = get(e.errorCode);
            s.errors += 1;
            if (e.timestamp >= since) s.recentErrors += 1;
            s.lastErrorAt = e.timestamp;
            s.clears = 0;
        } else if (e.isCorrect) {
            for (const code of codesFor(e.questionId)) {
                const s = stats.get(code);
                if (s && e.timestamp > s.lastErrorAt) s.clears += 1;
            }
        }
    }
    return [...stats.values()]
        .map((s) => ({
            ...s,
            ...describeMisconception(s.code),
            active: s.recentErrors >= MISCONCEPTION_ACTIVE_ERRORS && s.clears < MISCONCEPTION_CLEAR_AFTER,
            clearProgress: Math.min(s.clears, MISCONCEPTION_CLEAR_AFTER),
            clearTarget: MISCONCEPTION_CLEAR_AFTER,
            questionsAvailable: questionIdsForCode(s.code).length,
        }))
        .filter((s) => s.title)
        .sort((a, b) => (b.active - a.active) || (b.recentErrors - a.recentErrors) || (b.lastErrorAt - a.lastErrorAt));
}

/**
 * Questions for a misconception drill: questions offering that mistake,
 * preferring ones never answered, then ones last answered wrongly, and
 * skipping any answered correctly in the last 3 days.
 */
export function selectMisconceptionDrill(pool, code, events, n, { rng = Math.random, now = Date.now(), idsFor = questionIdsForCode } = {}) {
    const ids = new Set(idsFor(code));
    const last = new Map();
    for (const e of events) {
        const prev = last.get(e.questionId);
        if (!prev || e.timestamp > prev.timestamp) last.set(e.questionId, e);
    }
    const ranked = pool
        .filter((q) => ids.has(q.questionId))
        .filter((q) => {
            const l = last.get(q.questionId);
            return !(l && l.isCorrect && now - l.timestamp < 3 * DAY_MS);
        })
        .map((q) => {
            const l = last.get(q.questionId);
            const tier = !l ? 0 : l.isCorrect ? 2 : 1;
            return { q, key: tier + rng() };
        })
        .sort((a, b) => a.key - b.key);
    return ranked.slice(0, n).map((x) => x.q);
}
