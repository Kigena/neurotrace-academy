import { describe, it, expect } from "vitest";
import { FS, renderScene, validateScene } from "../../src/eeg/generator.js";

const QUIET = { pdrUv: 0, beta: 0, theta: 0, delta: 0, noise: 0 };
const peak = (data, at, win = 0.04) => {
  const i0 = Math.round((at - win) * FS);
  const i1 = Math.round((at + win) * FS);
  let m = 0;
  for (let i = i0; i < i1; i++) if (Math.abs(data[i]) > Math.abs(m)) m = data[i];
  return m;
};
const ch = (page, label) => page.channels.find((c) => c.label === label).data;
const rms = (d) => Math.sqrt(d.reduce((a, b) => a + b * b, 0) / d.length);

describe("synthetic EEG generator", () => {
  it("shows a negative spike at T3 as a phase reversal pointing toward T3", () => {
    const page = renderScene({ seed: 1, ekg: false, background: QUIET, findings: [{ type: "spike", center: "T3", at: 5, uv: 150, durMs: 50 }] });
    // F7-T3 = F7 - T3 > 0 (pen down); T3-T5 = T3 - T5 < 0 (pen up)
    expect(peak(ch(page, "F7-T3"), 5)).toBeGreaterThan(60);
    expect(peak(ch(page, "T3-T5"), 5)).toBeLessThan(-60);
  });

  it("shows an O2 spike at the end of the chain (no reversal) in the longitudinal montage", () => {
    const page = renderScene({ seed: 2, ekg: false, background: QUIET, findings: [{ type: "spike", center: "O2", at: 5, uv: 120, durMs: 50 }] });
    expect(peak(ch(page, "T6-O2"), 5)).toBeGreaterThan(30);
    expect(peak(ch(page, "P4-O2"), 5)).toBeGreaterThan(30);
    const tr = renderScene({ seed: 2, ekg: false, background: QUIET, findings: [{ type: "spike", center: "O2", at: 5, uv: 120, durMs: 50 }] }, "transverse");
    // transverse O1-O2 and O2-T6 reverse around O2
    expect(peak(ch(tr, "O1-O2"), 5)).toBeGreaterThan(30);
    expect(peak(ch(tr, "O2-T6"), 5)).toBeLessThan(-30);
  });

  it("makes a blink deflect frontopolar channels down (cornea positive)", () => {
    const page = renderScene({ seed: 3, ekg: false, background: QUIET, findings: [{ type: "blink", at: 3 }] });
    expect(peak(ch(page, "Fp1-F3"), 3.15, 0.1)).toBeGreaterThan(40);
    expect(Math.abs(peak(ch(page, "P3-O1"), 3.15, 0.1))).toBeLessThan(5);
  });

  it("blocks posterior alpha with eye opening but not mu", () => {
    const page = renderScene({ seed: 4, ekg: false, background: { pdrUv: 60, beta: 0, theta: 0, delta: 0, noise: 0 }, findings: [{ type: "eyesOpen", at: 3, uv: 1 }, { type: "eyesClosed", at: 7, uv: 1 }, { type: "mu", sides: ["left"], uv: 40 }] });
    const o = ch(page, "P3-O1");
    const closed = rms(o.subarray(0, 2.5 * FS));
    const open = rms(o.subarray(4 * FS, 6.5 * FS));
    expect(open).toBeLessThan(closed * 0.4);
    const c = ch(page, "C3-P3");
    expect(rms(c.subarray(4 * FS, 6.5 * FS))).toBeGreaterThan(4); // mu persists with eyes open
  });

  it("draws transients whose caliper-measured duration matches durMs (within 10%)", () => {
    for (const durMs of [50, 140]) {
      const page = renderScene({ seed: 1, ekg: false, background: QUIET, findings: [{ type: "sharp", center: "T6", at: 5, uv: 150, durMs }] });
      const d = ch(page, "T6-O2"); // T6 negative -> negative output (pen up)
      let ip = 5 * FS;
      for (let i = 5 * FS - 20; i < 5 * FS + 20; i++) if (d[i] < d[ip]) ip = i;
      const thr = d[ip] * 0.05;
      let a = ip;
      let b = ip;
      while (d[a] < thr) a--;
      while (d[b] < thr) b++;
      const measured = ((b - a) / FS) * 1000;
      expect(Math.abs(measured - durMs) / durMs).toBeLessThan(0.1);
    }
  });

  it("is deterministic for a given seed and changes with the seed", () => {
    const scene = { seed: 9, findings: [{ type: "mu" }] };
    expect(Array.from(ch(renderScene(scene), "C3-P3").slice(0, 50))).toEqual(Array.from(ch(renderScene(scene), "C3-P3").slice(0, 50)));
    expect(ch(renderScene({ ...scene, seed: 10 }), "C3-P3")[100]).not.toBe(ch(renderScene(scene), "C3-P3")[100]);
  });

  it("produces a 10 s page at 256 Hz in every montage and rejects unknown findings", () => {
    for (const m of ["longitudinal", "transverse", "referential"]) {
      const page = renderScene({ seed: 5 }, m);
      expect(page.channels[0].data.length).toBe(10 * FS);
    }
    expect(() => validateScene({ findings: [{ type: "nope" }] })).toThrow(/unknown finding/);
  });
});
