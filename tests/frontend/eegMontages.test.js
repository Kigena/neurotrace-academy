import { describe, it, expect } from "vitest";
import { FS, renderScene, MONTAGES, validateScene } from "../../src/eeg/generator.js";

const QUIET = { pdrUv: 0, beta: 0, theta: 0, delta: 0, noise: 0 };
const base = { seed: 3, ekg: false, background: QUIET };
const peak = (page, label, at, win = 0.06) => {
  const d = page.channels.find((c) => c.label === label).data;
  let m = 0;
  for (let i = Math.round((at - win) * FS); i < Math.round((at + win) * FS); i++) if (Math.abs(d[i]) > Math.abs(m)) m = d[i];
  return m;
};
const spikeAt = (center, extra = {}) => ({ type: "spike", center, sigma: 0.15, at: 5, uv: 150, durMs: 50, ...extra });

describe("reference montages", () => {
  it("lists every montage the viewer offers", () => {
    for (const k of ["referentialA2", "referentialA1", "referentialCz", "linkedEars", "average", "laplacian"]) expect(MONTAGES[k]).toBeTruthy();
    expect(() => validateScene({ ...base, montages: ["average", "laplacian", "linkedEars"], findings: [spikeAt("T3")] })).not.toThrow();
  });

  it("contaminates the ipsilateral ear: T3-A1 shrinks and the other A1 channels deflect DOWN (positive)", () => {
    const scene = { ...base, findings: [spikeAt("T3")] };
    const ipsi = renderScene(scene, "referential");
    const a2 = renderScene(scene, "referentialA2");
    expect(peak(ipsi, "T3-A1", 5)).toBeLessThan(-40);
    expect(Math.abs(peak(ipsi, "T3-A1", 5))).toBeLessThan(Math.abs(peak(a2, "T3-A2", 5)) * 0.7); // smaller than the true amplitude
    for (const l of ["F3-A1", "C3-A1", "P3-A1", "O1-A1"]) expect(peak(ipsi, l, 5)).toBeGreaterThan(30); // spurious downward deflection
    for (const l of ["F3-A2", "P3-A2", "O1-A2", "O2-A2"]) expect(Math.abs(peak(a2, l, 5))).toBeLessThan(5); // clean with the other ear
    expect(Math.abs(peak(ipsi, "O2-A2", 5))).toBeLessThan(5); // the right side uses the clean ear
    // referring everything to the contaminated ear spreads the discharge to every channel
    const a1 = renderScene(scene, "referentialA1");
    expect(peak(a1, "O2-A1", 5)).toBeGreaterThan(30);
  });

  it("a Cz reference shows the true T3 amplitude and spares the other channels", () => {
    const page = renderScene({ ...base, findings: [spikeAt("T3")] }, "referentialCz");
    expect(peak(page, "T3-Cz", 5)).toBeLessThan(-120);
    for (const l of ["F3-Cz", "O1-Cz", "O2-Cz"]) expect(Math.abs(peak(page, l, 5))).toBeLessThan(5);
  });

  it("a vertex wave contaminates every channel when Cz is the reference", () => {
    const page = renderScene({ ...base, findings: [{ type: "vertex", at: 5, uv: 110 }] }, "referentialCz");
    for (const l of ["F3-Cz", "O1-Cz", "T4-Cz"]) expect(peak(page, l, 5, 0.2)).toBeGreaterThan(40);
  });

  it("EKG has opposite polarity at the two ears and linking the ears cancels it", () => {
    const scene = { seed: 4, ekg: true, background: QUIET, ekgOppositeEars: true, ekgContamination: 30 };
    const ipsi = renderScene(scene, "referential");
    const a = ipsi.channels.find((c) => c.label === "O1-A1").data;
    const b = ipsi.channels.find((c) => c.label === "O2-A2").data;
    let cab = 0, aa = 0, bb = 0;
    for (let i = 0; i < a.length; i++) { cab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
    expect(cab / Math.sqrt(aa * bb)).toBeLessThan(-0.9);
    const linked = renderScene(scene, "linkedEars").channels.find((c) => c.label === "O1-LE").data;
    const rms = (d) => Math.sqrt(d.reduce((x, y) => x + y * y, 0) / d.length);
    expect(rms(linked)).toBeLessThan(0.1 * rms(a));
  });

  it("an average reference puts the negative peak at the focus and small positive deflections elsewhere", () => {
    const page = renderScene({ ...base, findings: [spikeAt("F4", { sigma: 0.17 })] }, "average");
    expect(peak(page, "F4-AV", 5)).toBeLessThan(-100);
    for (const l of ["T3-AV", "O1-AV", "C4-AV"]) {
      const v = peak(page, l, 5);
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(25);
    }
  });

  it("including Fp1/Fp2 in the average lets an eye blink spill an inverted deflection into every channel", () => {
    const blink = { ...base, findings: [{ type: "blink", at: 5, uv: 380 }] };
    const excluded = renderScene(blink, "average");
    const included = renderScene({ ...blink, avgExclude: [] }, "average");
    const spill = (page) => Math.abs(peak(page, "O1-AV", 5.1, 0.2));
    expect(spill(included)).toBeGreaterThan(3 * spill(excluded) + 5);
    expect(peak(included, "O1-AV", 5.1, 0.2)).toBeLessThan(0); // inverted (upward)
  });

  it("the Laplacian derivation sharpens a focus relative to its neighbours", () => {
    const page = renderScene({ ...base, findings: [spikeAt("C3", { sigma: 0.2 })] }, "laplacian");
    const c3 = Math.abs(peak(page, "C3-Lap", 5));
    expect(c3).toBeGreaterThan(80);
    for (const l of ["F3-Lap", "P3-Lap", "T3-Lap"]) expect(Math.abs(peak(page, l, 5))).toBeLessThan(0.6 * c3);
  });
});

describe("bipolar phase reversal rules", () => {
  it("a positive-polarity spike gives a positive phase reversal (deflections point away from each other)", () => {
    const page = renderScene({ ...base, findings: [spikeAt("C3", { uv: -150 })] }, "longitudinal");
    expect(peak(page, "F3-C3", 5)).toBeLessThan(-60); // up
    expect(peak(page, "C3-P3", 5)).toBeGreaterThan(60); // down
  });

  it("equal amplitude at two adjacent electrodes cancels in the channel between them", () => {
    const page = renderScene({ ...base, findings: [spikeAt([-0.2, 0])] }, "transverse");
    expect(Math.abs(peak(page, "C3-Cz", 5))).toBeLessThan(1);
    expect(Math.abs(peak(page, "T3-C3", 5))).toBeGreaterThan(30);
    expect(Math.abs(peak(page, "Cz-C4", 5))).toBeGreaterThan(30);
  });

  it("simultaneous T3 and T4 foci give a positive phase reversal at Cz in the transverse chain (butterfly)", () => {
    const page = renderScene({ ...base, findings: [spikeAt("T3", { sigma: 0.28 }), spikeAt("T4", { sigma: 0.28 })] }, "transverse");
    expect(peak(page, "T3-C3", 5)).toBeLessThan(-30); // up
    expect(peak(page, "C3-Cz", 5)).toBeLessThan(-10); // up
    expect(peak(page, "Cz-C4", 5)).toBeGreaterThan(10); // down: the C3-Cz / Cz-C4 pair points away from each other at Cz
    expect(peak(page, "C4-T4", 5)).toBeGreaterThan(30); // down
  });
});
