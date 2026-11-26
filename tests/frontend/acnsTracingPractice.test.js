import { describe, expect, it } from "vitest";
import { ACNS_TRACING_QUESTIONS, TRACING_TOPICS } from "../../src/data/acnsTracingPractice.js";
import { validateScene } from "../../src/eeg/generator.js";

const byId = Object.fromEntries(ACNS_TRACING_QUESTIONS.map((q) => [q.id, q]));

/** Discharges a periodic finding places on the page (same rule as the generator, without jitter). */
function dischargesOnPage(q) {
  const seconds = q.scene.seconds ?? 10;
  let count = 0;
  for (const f of q.scene.findings.filter((x) => x.type === "periodic")) {
    const to = Math.min(f.to ?? seconds, seconds);
    for (let t = (f.from ?? 0) + (f.firstAt ?? 0.3); t < to; t += f.intervalS) count++;
  }
  return count;
}

describe("ACNS tracing practice", () => {
  it("covers seizures, BIRDs and the IIC with enough questions", () => {
    expect(ACNS_TRACING_QUESTIONS.length).toBeGreaterThanOrEqual(40);
    for (const t of TRACING_TOPICS) {
      expect(ACNS_TRACING_QUESTIONS.filter((q) => q.topic === t.key).length, t.key).toBeGreaterThanOrEqual(10);
    }
  });

  it("has complete, unique questions with valid tracings", () => {
    const ids = new Set();
    for (const q of ACNS_TRACING_QUESTIONS) {
      expect(ids.has(q.id), q.id).toBe(false);
      ids.add(q.id);
      expect(TRACING_TOPICS.map((t) => t.key)).toContain(q.topic);
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.options[q.answer], q.id).toBe(q.o[0]);
      expect(q.why.length, q.id).toBeGreaterThan(80);
      expect(() => validateScene(q.scene), q.id).not.toThrow();
    }
  });

  it("does not give the answer away by length or position", () => {
    const positions = [0, 0, 0, 0];
    for (const q of ACNS_TRACING_QUESTIONS) {
      positions[q.answer]++;
      const longestDistractor = Math.max(...q.o.slice(1).map((s) => s.length));
      expect(q.o[0].length, q.id).toBeLessThanOrEqual(1.25 * longestDistractor);
    }
    for (const n of positions) expect(n).toBeGreaterThanOrEqual(Math.floor(ACNS_TRACING_QUESTIONS.length / 5));
  });

  it("draws the discharge counts the questions rely on", () => {
    expect(dischargesOnPage(byId["acns-t37"])).toBe(25); // exactly 2.5 Hz: still IIC
    expect(dischargesOnPage(byId["acns-t02"])).toBeGreaterThan(25); // 3 Hz GPDs: ESz
    expect(dischargesOnPage(byId["acns-t26"])).toBe(20); // 2 Hz LPDs
    const fluct = dischargesOnPage(byId["acns-t40"]) / 2; // 20-second page, per 10 s
    expect(fluct).toBeGreaterThanOrEqual(5);
    expect(fluct).toBeLessThanOrEqual(10); // 0.5 to 1 Hz on average: criterion B territory
  });
});
