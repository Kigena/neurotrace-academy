import { describe, it, expect } from 'vitest';
import casesData from '../../src/data/cases.json';
import { normalizeStep, stepHeading } from '../../src/utils/caseSteps.js';

describe('case steps', () => {
    it('every starter case step normalises to a renderable step (both data shapes)', () => {
        for (const c of casesData.starterCases) {
            const steps = (c.taskFlow || []).map((s, i) => normalizeStep(s, i, c.id));
            expect(steps.length, c.id).toBeGreaterThan(0);
            for (const [i, s] of steps.entries()) {
                expect(s.stepId, c.id).toBeTruthy();
                expect(s.prompt, `${c.id} step ${i + 1} prompt`).toBeTruthy();
                expect(s.options.length, `${c.id} step ${i + 1} options`).toBeGreaterThanOrEqual(2);
                expect(Number.isInteger(s.answerIndex) && s.answerIndex < s.options.length, `${c.id} step ${i + 1} key`).toBe(true);
                expect(typeof stepHeading(s, i)).toBe('string');
            }
            expect(new Set(steps.map((s) => s.stepId)).size, `${c.id} unique step ids`).toBe(steps.length);
        }
    });

    it('maps the newer { step, title, question, correctAnswer } shape', () => {
        const s = normalizeStep({ step: 2, title: 'Phase Reversal', description: 'ctx', question: 'Q?', options: ['a', 'b'], correctAnswer: 1 }, 1, 'case-0022');
        expect(s).toMatchObject({ stepId: 'case-0022-step2', prompt: 'Q?', answerIndex: 1, description: 'ctx' });
        expect(stepHeading(s, 1)).toBe('Phase Reversal');
        expect(stepHeading(normalizeStep({ type: 'history-questions' }, 0), 0)).toBe('History Questions');
        expect(stepHeading(normalizeStep({}, 2), 2)).toBe('Step 3');
    });
});
