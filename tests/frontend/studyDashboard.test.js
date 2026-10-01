import { describe, it, expect } from 'vitest';
import { EXAM_CONFIG, daysUntilExam, countdownText } from '../../src/config/examConfig.js';
import { planItemLabel, scoreTone } from '../../src/utils/studyLabels.js';

describe('exam countdown', () => {
  it('targets the ABRET R.EEG T. exam on December 14, 2026 at 12:30 PM in Asheville, NC', () => {
    expect(EXAM_CONFIG).toMatchObject({
      exam: 'ABRET R.EEG T.',
      date: '2026-12-14',
      time: '12:30',
      location: 'Asheville, North Carolina',
    });
  });

  it('counts calendar days in the exam time zone', () => {
    expect(daysUntilExam(new Date('2026-09-30T16:00:00Z'))).toBe(75);
    expect(countdownText(new Date('2026-09-30T16:00:00Z'))).toBe('75 DAYS UNTIL R.EEG T. EXAM');
    // 11 PM in New York on Dec 13 is still "1 day" even though it is Dec 14 in UTC.
    expect(daysUntilExam(new Date('2026-12-14T04:00:00Z'))).toBe(1);
    expect(countdownText(new Date('2026-12-14T15:00:00Z'))).toBe('R.EEG T. EXAM IS TODAY');
    expect(daysUntilExam(new Date('2026-12-20T15:00:00Z'))).toBeLessThan(0);
  });
});

describe("today's study labels", () => {
  it('describes plan items in plain language', () => {
    expect(planItemLabel({ kind: 'section', count: 10, sectionId: 'd2-filters-time-constants' })).toBe('10 questions: Filters & Time Constants');
    expect(planItemLabel({ kind: 'review', count: 5 })).toBe('Review 5 incorrect questions');
    expect(planItemLabel({ kind: 'mixed', count: 10 })).toBe('10-question mixed ABRET quiz');
  });

  it('greys out scores without sufficient evidence', () => {
    expect(scoreTone(95, false).bar).toBe('bg-slate-300');
    expect(scoreTone(95, true).bar).toBe('bg-emerald-500');
    expect(scoreTone(30, true).bar).toBe('bg-red-500');
  });
});

describe('challenge plan labels', () => {
  it('describes challenge-focused plan items', () => {
    expect(planItemLabel({ kind: 'challenge', count: 10, competency: 'troubleshooting' })).toBe('10 Challenge questions: Troubleshooting');
    expect(planItemLabel({ kind: 'challenge', count: 10 })).toBe('10 mixed Challenge questions (L3-L6)');
  });
});
