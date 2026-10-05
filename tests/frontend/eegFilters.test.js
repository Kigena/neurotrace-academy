import { describe, it, expect } from "vitest";
import { FS, renderScene } from "../../src/eeg/generator.js";
import {
  highPassGain, lowPassGain, bandGain, gainToDb, timeConstantFromCutoff, cutoffFromTimeConstant,
  sensitivity, voltageFromHeight, heightFromVoltage, amplitudeFromCalibration, durationMs, widthMm, frequencyHz,
} from "../../src/eeg/filters.js";

const QUIET = { pdrUv: 0, beta: 0, theta: 0, delta: 0, noise: 0 };
const ch = (page, label) => page.channels.find((c) => c.label === label).data;
const amp = (d, a, b) => {
  const w = d.subarray(Math.round(a * FS), Math.round(b * FS));
  return (Math.max(...w) - Math.min(...w)) / 2;
};
const at = (d, t) => d[Math.round(t * FS)];

describe("filter and measurement math", () => {
  it("passes ~70.7% (-3 dB) at the cutoff and follows the single-pole formulas", () => {
    expect(highPassGain(1, 1)).toBeCloseTo(0.7071, 3);
    expect(gainToDb(highPassGain(1, 1))).toBeCloseTo(-3.01, 1);
    expect(highPassGain(1, 0.5)).toBeCloseTo(0.8944, 3);
    expect(lowPassGain(15, 15)).toBeCloseTo(0.7071, 3);
    expect(lowPassGain(60, 15)).toBeCloseTo(0.2425, 3);
    expect(bandGain(10, 1, 70)).toBeGreaterThan(0.98);
  });

  it("loses 6 dB per octave below a single-pole LFF cutoff (well below fc)", () => {
    const g1 = highPassGain(0.1, 5);
    const g2 = highPassGain(0.05, 5);
    expect(gainToDb(g2) - gainToDb(g1)).toBeCloseTo(-6, 0);
  });

  it("converts between time constant and cutoff", () => {
    expect(timeConstantFromCutoff(1.6)).toBeCloseTo(0.0995, 3);
    expect(cutoffFromTimeConstant(0.1)).toBeCloseTo(1.59, 2);
    expect(cutoffFromTimeConstant(0.03)).toBeCloseTo(5.3, 1);
    expect(cutoffFromTimeConstant(0.3)).toBeCloseTo(0.53, 2);
    expect(timeConstantFromCutoff(15) * 1000).toBeCloseTo(10.6, 1);
    expect(timeConstantFromCutoff(70) * 1000).toBeCloseTo(2.27, 1);
  });

  it("does sensitivity, amplitude, duration and frequency arithmetic", () => {
    expect(sensitivity(50, 5)).toBe(10);
    expect(voltageFromHeight(7, 14)).toBe(98);
    expect(heightFromVoltage(7, 50)).toBeCloseTo(7.14, 2);
    expect(amplitudeFromCalibration(50, 7, 12)).toBeCloseTo(85.71, 2);
    expect(durationMs(9, 30)).toBe(300);
    expect(frequencyHz(300)).toBeCloseTo(3.33, 2);
    expect(widthMm(120, 30)).toBeCloseTo(3.6, 5);
  });
});

describe("generator filters match the textbook model", () => {
  const cal = { at: [1], uv: 50, durS: 3 };
  const base = { seed: 1, ekg: false, background: QUIET, calibration: cal, hff: 200 };

  it("draws the calibration pulse rising upward and decaying to ~37% after one LFF time constant", () => {
    const page = renderScene({ ...base, lff: 1.6 }, "longitudinal");
    const d = ch(page, "P3-O1");
    expect(at(d, 1.01)).toBeLessThan(-40); // upward (negative) step, almost full size at onset
    const tc = timeConstantFromCutoff(1.6);
    expect(Math.abs(at(d, 1 + tc)) / 50).toBeGreaterThan(0.32); // ~37% of the 50 uV step after one TC
    expect(Math.abs(at(d, 1 + tc)) / 50).toBeLessThan(0.42);
    expect(at(d, 4.05)).toBeGreaterThan(20); // opposite-going overshoot when the pulse ends
  });

  it("a lower LFF holds the calibration pulse longer", () => {
    const slow = renderScene({ ...base, lff: 0.1 }, "longitudinal");
    const fast = renderScene({ ...base, lff: 5.3 }, "longitudinal");
    expect(Math.abs(at(ch(slow, "P3-O1"), 2.0))).toBeGreaterThan(24); // TC = 1.6 s: ~53% of 50 uV left after 1 s
    expect(Math.abs(at(ch(fast, "P3-O1"), 2.0))).toBeLessThan(2);
  });

  it("rises to ~63% of the pulse after one HFF time constant with a single-pole low-pass", () => {
    const page = renderScene({ ...base, lff: 0, hff: 15, lpOrder: 1 }, "longitudinal");
    const d = ch(page, "P3-O1");
    const rc = timeConstantFromCutoff(15);
    const frac = Math.abs(at(d, 1 + rc)) / 50;
    expect(frac).toBeGreaterThan(0.5);
    expect(frac).toBeLessThan(0.75);
    expect(Math.abs(at(d, 1.2)) / 50).toBeGreaterThan(0.97); // fully risen
  });

  it("attenuates a 1 Hz wave to ~71% at LFF 1 Hz and ~89% at LFF 0.5 Hz", () => {
    const run = (lff) => {
      const page = renderScene({ seed: 2, ekg: false, background: QUIET, hff: 200, lff, findings: [{ type: "sine", hz: 1, uv: 100, sites: ["O1"] }] }, "longitudinal");
      return amp(ch(page, "T5-O1"), 5, 9.5);
    };
    expect(run(1)).toBeGreaterThan(66);
    expect(run(1)).toBeLessThan(76);
    expect(run(0.5)).toBeGreaterThan(84);
    expect(run(0.5)).toBeLessThan(94);
  });

  it("attenuates 60 Hz with a lower HFF but only the notch removes it", () => {
    const run = (extra) => {
      const page = renderScene({ seed: 3, ekg: false, background: QUIET, lff: 1, findings: [{ type: "sine", hz: 60, uv: 100, sites: ["T3"] }], ...extra }, "longitudinal");
      return amp(ch(page, "F7-T3"), 5, 9);
    };
    expect(run({ hff: 200 })).toBeGreaterThan(85);
    expect(run({ hff: 15, lpOrder: 1 })).toBeLessThan(35);
    expect(run({ hff: 15, lpOrder: 1 })).toBeGreaterThan(15);
    expect(run({ hff: 200, notch: true })).toBeLessThan(10);
  });

  it("supports a 50 Hz notch", () => {
    const page = renderScene({ seed: 4, ekg: false, background: QUIET, lff: 1, hff: 200, notch: true, notchHz: 50, findings: [{ type: "sine", hz: 50, uv: 100, sites: ["T3"] }] }, "longitudinal");
    expect(amp(ch(page, "F7-T3"), 5, 9)).toBeLessThan(10);
  });

  it("does not change frequency: a filtered 8 Hz tone keeps its period", () => {
    const run = (lff) => {
      const page = renderScene({ seed: 5, ekg: false, background: QUIET, hff: 200, lff, findings: [{ type: "sine", hz: 8, uv: 100, sites: ["O1"] }] }, "longitudinal");
      const d = ch(page, "T5-O1");
      let crossings = 0;
      for (let i = 5 * FS; i < 9 * FS; i++) if (d[i - 1] < 0 !== d[i] < 0) crossings++;
      return crossings / 2 / 4;
    };
    expect(run(0.5)).toBeCloseTo(8, 0);
    expect(run(5.3)).toBeCloseTo(8, 0);
  });
});
