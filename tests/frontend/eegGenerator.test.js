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

  it("draws triphasic waves with a dominant positive phase that reaches the posterior leads ~lagMs later", () => {
    const scene = { seed: 7, ekg: false, background: QUIET, findings: [{ type: "triphasic", at: 5, uv: 100, lagMs: 130 }] };
    const page = renderScene(scene, "referential");
    const peakTime = (label) => {
      const d = ch(page, label);
      let ip = 4.5 * FS;
      for (let i = 4.5 * FS; i < 5.8 * FS; i++) if (d[i] > d[ip]) ip = i;
      return { t: ip / FS, v: d[ip], min: Math.min(...d.subarray(4 * FS, 6 * FS)) };
    };
    const f = peakTime("Fp1-A1");
    const p = peakTime("O1-A1");
    expect(f.v).toBeGreaterThan(Math.abs(f.min)); // positive phase dominates
    expect(f.v).toBeGreaterThan(p.v); // frontal maximum
    expect(Math.abs((p.t - f.t) * 1000 - 130)).toBeLessThan(25);
  });

  it("scales diffuse slowing frequency with hz", () => {
    const crossings = (hz) => {
      const page = renderScene({ seed: 8, ekg: false, background: QUIET, findings: [{ type: "diffuseSlowing", hz, bwHz: 0.6, uv: 60 }] }, "referential");
      const d = ch(page, "F3-A1");
      let c = 0;
      for (let i = 1; i < d.length; i++) if (d[i - 1] < 0 !== d[i] < 0) c++;
      return c;
    };
    expect(crossings(3)).toBeGreaterThan(crossings(1.5) * 1.4);
  });

  describe("eye-monitor electrodes (eyeCheck montage)", () => {
    const corr = (a, b) => {
      let sa = 0, sb = 0, sab = 0;
      for (let i = 0; i < a.length; i++) { sa += a[i] * a[i]; sb += b[i] * b[i]; sab += a[i] * b[i]; }
      return sab / Math.sqrt(sa * sb);
    };
    const run = (findings) => renderScene({ seed: 11, ekg: false, background: QUIET, findings }, "eyeCheck");

    it("makes vertical eye movements out of phase between Fp and infraorbital leads", () => {
      const page = run([{ type: "blink", at: 3 }]);
      expect(peak(ch(page, "Fp1-A1"), 3.15, 0.1)).toBeGreaterThan(20);
      expect(peak(ch(page, "IO1-A1"), 3.15, 0.1)).toBeLessThan(-20);
      expect(peak(ch(page, "LOC-A1"), 3.15, 0.1) * peak(ch(page, "ROC-A2"), 3.15, 0.1)).toBeLessThan(0);
    });

    it("makes frontal delta in phase between Fp and infraorbital leads", () => {
      const page = run([{ type: "firda", hz: 2, uv: 150 }]);
      expect(corr(ch(page, "Fp1-A1"), ch(page, "IO1-A1"))).toBeGreaterThan(0.8);
      expect(corr(ch(page, "Fp2-A2"), ch(page, "IO2-A2"))).toBeGreaterThan(0.8);
    });

    it("makes glossokinetic potentials in phase and larger at the infraorbital leads", () => {
      const page = run([{ type: "glossokinetic", at: [3, 6] }]);
      expect(corr(ch(page, "Fp1-A1"), ch(page, "IO1-A1"))).toBeGreaterThan(0.95);
      expect(Math.abs(peak(ch(page, "IO1-A1"), 3.4, 0.4))).toBeGreaterThan(1.5 * Math.abs(peak(ch(page, "Fp1-A1"), 3.4, 0.4)));
    });

    it("makes lateral gaze out of phase between the outer canthus leads", () => {
      const page = run([{ type: "lateralEye", at: 3, durS: 1.5, dir: "left" }]);
      expect(peak(ch(page, "LOC-A1"), 3.8, 0.4) * peak(ch(page, "ROC-A2"), 3.8, 0.4)).toBeLessThan(0);
    });
  });

  it("puts regional rhythmic delta where the center says (occipital vs frontal)", () => {
    const rmsAt = (findings, label) => rms(ch(renderScene({ seed: 12, ekg: false, background: QUIET, findings }, "referential"), label));
    const occ = [{ type: "rhythmicDelta", hz: 3, uv: 150 }];
    expect(rmsAt(occ, "O1-A1")).toBeGreaterThan(2 * rmsAt(occ, "Fp1-A1"));
    const fr = [{ type: "firda", hz: 2, uv: 150 }];
    expect(rmsAt(fr, "Fp1-A1")).toBeGreaterThan(2 * rmsAt(fr, "O1-A1"));
  });

  it("confines focal delta to its region and to its runs", () => {
    const page = renderScene({ seed: 13, ekg: false, background: QUIET, hff: 200, findings: [{ type: "focalDelta", center: "T3", uv: 90, hz: 1.3, runs: [[2, 8]] }] }, "referential");
    const inside = (l) => rms(ch(page, l).subarray(3 * FS, 7 * FS));
    expect(inside("T3-A1")).toBeGreaterThan(3 * inside("O2-A2"));
    expect(inside("T3-A1")).toBeGreaterThan(3 * inside("F4-A2"));
    expect(rms(ch(page, "T3-A1").subarray(0, 1 * FS))).toBeLessThan(0.2 * inside("T3-A1"));
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

describe("sweat artifact", () => {
  const p2p = (d) => Math.max(...d) - Math.min(...d);
  const scene = (lff) => ({ seed: 9, ekg: false, lff, background: QUIET, findings: [{ type: "sweat", uv: 150, sites: ["F8", "T4"] }] });
  it("drifts slowly only in channels that include a sweaty electrode", () => {
    const page = renderScene(scene(0.1));
    expect(p2p(ch(page, "F8-T4"))).toBeGreaterThan(40);
    expect(p2p(ch(page, "F7-T3"))).toBeLessThan(5);
  });
  it("is removed largely by raising the low-frequency filter", () => {
    const low = p2p(ch(renderScene(scene(0.1)), "F8-T4"));
    const high = p2p(ch(renderScene(scene(5)), "F8-T4"));
    expect(high).toBeLessThan(low * 0.25);
  });
});
