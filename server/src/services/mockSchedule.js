// Full mock exam schedule up to exam day.
//
// A 130-question mock every 14 days, starting from the first full mock taken
// (or today if none), with the last one 7 days before the exam. Each slot
// covers the 6 days before its target date through 7 days after; the first
// submitted full mock inside a slot completes it.

import { PLAN_TIME_ZONE } from './dailyPlan.js';

export const EXAM_DATE = '2026-12-14'; // see src/config/examConfig.js
export const FULL_MOCK_PRESET = 'mock-full-130';
export const MOCK_INTERVAL_DAYS = 14;
export const FINAL_MOCK_DAYS_BEFORE = 7;
const EARLY_DAYS = 6;
const LATE_DAYS = 7;

const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: PLAN_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
const dayNumber = (ymd) => {
    const [y, m, d] = ymd.split('-').map(Number);
    return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};
const dayOf = (ts) => dayNumber(fmt.format(new Date(ts)));
const ymdOf = (n) => new Date(n * 86400000).toISOString().slice(0, 10);

/**
 * @param mocks submitted full mocks: [{ endTime, percent, correct, total }]
 * @returns { slots: [{ date, status, mock }], next, dueNow, examDate, daysToExam }
 *   status: done | due | upcoming | missed
 */
export function buildMockSchedule({ mocks = [], now = Date.now(), examDate = EXAM_DATE } = {}) {
    const today = dayOf(now);
    const exam = dayNumber(examDate);
    const final = exam - FINAL_MOCK_DAYS_BEFORE;
    const taken = mocks
        .filter((m) => Number.isFinite(m.endTime))
        .map((m) => ({ ...m, day: dayOf(m.endTime) }))
        .sort((a, b) => a.day - b.day);

    if (today > exam) return { slots: [], next: null, dueNow: false, examDate, daysToExam: exam - today };

    const start = taken.length ? Math.min(taken[0].day, today) : today;
    const targets = [];
    for (let t = start; t < final; t += MOCK_INTERVAL_DAYS) targets.push(t);
    // Keep the final mock about a week before the exam, never two within a week.
    if (targets.length && final - targets[targets.length - 1] < EARLY_DAYS + 1) targets.pop();
    if (final >= start) targets.push(final);

    const used = new Set();
    const slots = targets.map((t) => {
        const mock = taken.find((m, i) => !used.has(i) && m.day >= t - EARLY_DAYS && m.day <= t + LATE_DAYS);
        if (mock) used.add(taken.indexOf(mock));
        let status;
        if (mock) status = 'done';
        else if (today > t + LATE_DAYS) status = 'missed';
        else if (today >= t) status = 'due';
        else status = 'upcoming';
        return {
            date: ymdOf(t),
            status,
            canTakeEarly: !mock && today >= t - EARLY_DAYS && today < t,
            mock: mock ? { endTime: mock.endTime, percent: mock.percent, correct: mock.correct, total: mock.total } : null,
        };
    });
    const next = slots.find((s) => s.status === 'due' || s.status === 'upcoming') || null;
    return { slots, next, dueNow: next?.status === 'due', examDate, daysToExam: exam - today };
}
