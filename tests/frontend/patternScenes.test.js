import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { FS, renderScene, validateScene } from "../../src/eeg/generator.js";

const root = path.resolve(__dirname, "../..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, "src/data", f), "utf8"));
const library = read("neurotrace_patterns_library_v2.json");
const scenes = read("patternScenes.json");

const ch = (page, label) => page.channels.find((c) => c.label === label).data;
const win = (d, a, b) => d.subarray(Math.round(a * FS), Math.round(b * FS));
const pp = (d, a, b) => {
  const w = win(d, a, b);
  return Math.max(...w) - Math.min(...w);
};
const QUIET = { pdrUv: 0, beta: 0, theta: 0, delta: 0, noise: 0 };

describe("pattern recognition tracings", () => {
  it("every library pattern has a generated tracing and no old image fields remain", () => {
    expect(library.filter((p) => !scenes[p.id]).map((p) => p.id)).toEqual([]);
    expect(Object.keys(scenes).filter((id) => !library.some((p) => p.id === id))).toEqual([]);
    expect(library.filter((p) => p.image || p.images).map((p) => p.id)).toEqual([]);
  });

  it("every scene is valid, has a caption and renders with any seed", () => {
    for (const [id, { scene, note }] of Object.entries(scenes)) {
      expect(note.length, id).toBeGreaterThan(40);
      expect(() => validateScene(scene), id).not.toThrow();
      const page = renderScene({ ...scene, seed: 98765 }, scene.montages?.[0] || scene.montage);
      expect(page.channels.every((c) => c.data.every(Number.isFinite)), id).toBe(true);
    }
  }, 60000); // renders every pattern page

  it("each quiz category has enough patterns to build four-option questions", () => {
    const count = (cats) => library.filter((p) => cats.includes(p.category)).length;
    expect(count(["NORMAL"])).toBeGreaterThanOrEqual(4);
    expect(count(["NORMAL_VARIANT", "BENIGN_VARIANT"])).toBeGreaterThanOrEqual(4);
    expect(count(["EPILEPTIFORM", "ICTAL", "INTERICTAL"])).toBeGreaterThanOrEqual(4);
    expect(count(["SLOWING"])).toBeGreaterThanOrEqual(4);
    expect(count(["ARTIFACT"])).toBeGreaterThanOrEqual(4);
  });
});

describe("new generator findings", () => {
  it("lambda-style transients with negative uv are surface positive at O1 (downward in O1-LE)", () => {
    const page = renderScene({ background: QUIET, ekg: false, findings: [{ type: "sharp", center: [0, -0.8], sigma: 0.33, uv: -70, durMs: 220, at: [5] }] }, "linkedEars");
    const d = win(ch(page, "O1-LE"), 4.8, 5.3);
    // main phase positive: the positive peak dominates the small negative after-phase
    expect(Math.max(...d)).toBeGreaterThan(Math.abs(Math.min(...d)));
    expect(Math.max(...d)).toBeGreaterThan(30);
  });

  it("positive arciform bursts are positive at T6 and keep their frequency", () => {
    const page = renderScene({ background: QUIET, ekg: false, findings: [{ type: "arciform", polarity: "positive", center: "T6", hz: 14, uv: 60, runs: [[2, 6]] }] }, "referentialA1");
    const d = win(ch(page, "T6-A1"), 3, 5);
    // sharp peaks point positive: the positive extreme exceeds the negative one
    expect(Math.max(...d)).toBeGreaterThan(-Math.min(...d));
    let crossings = 0;
    for (let i = 1; i < d.length; i++) if (d[i - 1] < 0 && d[i] >= 0) crossings += 1;
    expect(crossings / 2).toBeCloseTo(14, 0);
    expect(pp(ch(page, "T6-A1"), 7, 9)).toBeLessThan(2);
  });

  it("a K-complex lasts at least 0.5 s and is maximal frontocentrally", () => {
    const page = renderScene({ background: QUIET, ekg: false, findings: [{ type: "kComplex", at: [4], uv: 200 }] }, "linkedEars");
    const d = ch(page, "F3-LE");
    const thr = 0.05 * Math.max(...win(d, 3, 5.5).map(Math.abs));
    const idx = [...win(d, 3, 5.5)].map((v, i) => [v, i]).filter(([v]) => Math.abs(v) > thr).map(([, i]) => i);
    expect((idx[idx.length - 1] - idx[0]) / FS).toBeGreaterThan(0.5);
    expect(pp(d, 3, 5.5)).toBeGreaterThan(pp(ch(page, "O1-LE"), 3, 5.5));
  });

  it("photic responses follow the flash rate only during stimulation", () => {
    const page = renderScene({ background: QUIET, ekg: false, findings: [{ type: "photic", hz: 8, from: 2, to: 6, uv: 30 }] }, "linkedEars");
    const d = ch(page, "O1-LE");
    expect(pp(d, 3, 5)).toBeGreaterThan(15);
    expect(pp(d, 7, 9.5)).toBeLessThan(2);
    expect(page.markers.map((m) => m.label)).toContain("Photic 8 Hz");
  });

  it("gsw with tScale 1 is identical to the default complex", () => {
    const base = { background: QUIET, ekg: false, findings: [{ type: "gsw", from: 2, to: 8, uv: 300 }] };
    const a = renderScene(base, "linkedEars");
    const b = renderScene({ ...base, findings: [{ ...base.findings[0], tScale: 1 }] }, "linkedEars");
    expect(ch(a, "F3-LE")).toEqual(ch(b, "F3-LE"));
  });
});
