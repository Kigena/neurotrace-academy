import { describe, expect, it } from "vitest";
import { autoMark, maximalCurrent, measuredSegment, simulate } from "../../src/ncs/generator.js";
import { techniqueChecks } from "../../src/ncs/grading.js";
import { SITES, STIM_SITES, STUDIES, stimSitesFor } from "../../src/ncs/studies.js";
import data from "../../src/data/ncsCases.json";

const good = (s) => ({
  g1: s.g1[0], g2: s.pairs ? s.pairs[s.g1[0]] : s.g2[0], ground: "x", distalCm: s.stdDist,
  cathodeDistal: true, skinPrepped: true, elbowFlexed: true,
  lff: s.type === "motor" ? 10 : 20, hff: s.type === "motor" ? 10000 : 2000,
});
const run = (id, site, setup, patient = {}, intensity) => {
  const s = STUDIES[id];
  const I = intensity ?? maximalCurrent(id, site, setup, patient) * 1.25;
  return simulate({ studyId: id, stimSiteId: site, setup, patient, intensity: I, sweepMs: s.limb === "leg" ? 50 : 30, seed: 7 });
};

describe("NCS study catalog", () => {
  it("references only defined sites", () => {
    for (const [id, s] of Object.entries(STUDIES)) {
      for (const g of [...s.g1, ...s.g2, ...(s.offPoint || [])]) expect(SITES[s.limb][g], `${id} ${g}`).toBeTruthy();
      for (const st of stimSitesFor(s)) expect(STIM_SITES[st]?.limb, `${id} ${st}`).toBe(s.limb);
    }
  });
});

describe("NCS generator", () => {
  it("gives healthy values within the reference limits", () => {
    for (const [id, s] of Object.entries(STUDIES)) {
      const r = run(id, s.distalStim, good(s));
      expect(r.problems).toEqual([]);
      if (s.type === "motor") {
        expect(r.truth.onset).toBeLessThan(s.limits.lat);
        expect(r.truth.amp).toBeGreaterThan(s.limits.amp);
      } else {
        expect(r.truth.peak).toBeLessThan(s.limits.peak);
        expect(r.truth.amp).toBeGreaterThan(s.limits.amp);
      }
    }
  });

  it("slows conduction in a cold limb and with reversed polarity", () => {
    const s = STUDIES.medianMotor;
    const warm = run("medianMotor", "medWrist", good(s)).truth.onset;
    const cold = run("medianMotor", "medWrist", good(s), { temp: { arm: 27 } }).truth.onset;
    const rev = run("medianMotor", "medWrist", { ...good(s), cathodeDistal: false }).truth.onset;
    expect(cold - warm).toBeGreaterThan(0.6);
    expect(rev - warm).toBeGreaterThan(0.3);
  });

  it("reduces amplitude when submaximal and inverts when G1 and G2 are swapped", () => {
    const s = STUDIES.medianMotor;
    const full = run("medianMotor", "medWrist", good(s)).truth.amp;
    const sub = run("medianMotor", "medWrist", good(s), {}, 12).truth.amp;
    expect(sub).toBeLessThan(full * 0.8);
    const sw = run("medianMotor", "medWrist", { ...good(s), g1: "d1", g2: "apb" });
    expect(sw.problems.map((p) => p.code)).toContain("swapped");
    const max = Math.max(...sw.data), min = Math.min(...sw.data.slice(50));
    expect(max).toBeGreaterThan(Math.abs(min)); // main deflection now positive (downward on screen)
  });

  it("flags current spread and records the neighbouring muscle when G1 sits on it", () => {
    const s = STUDIES.medianMotor;
    const ok = run("medianMotor", "medWrist", good(s), {}, 28);
    expect(ok.problems.map((p) => p.code)).not.toContain("current-spread");
    const onAdm = run("medianMotor", "medWrist", { ...good(s), g1: "adm", g2: "d5prox" }, {}, 40);
    expect(onAdm.problems.map((p) => p.code)).toContain("current-spread");
    const lowOnAdm = run("medianMotor", "medWrist", { ...good(s), g1: "adm", g2: "d5prox" }, {}, 28);
    expect(Math.max(...onAdm.data.map(Math.abs))).toBeGreaterThan(3 * Math.max(...lowOnAdm.data.slice(100).map(Math.abs)));
  });

  it("underestimates the across-elbow distance with the elbow straight", () => {
    expect(measuredSegment("ulnarMotor", "ulnAE", { elbowFlexed: true })).toBe(10);
    expect(measuredSegment("ulnarMotor", "ulnAE", { elbowFlexed: false })).toBe(8);
  });

  it("auto-marks a healthy motor onset close to the true onset", () => {
    const s = STUDIES.ulnarMotor;
    const r = run("ulnarMotor", "ulnWrist", good(s));
    expect(Math.abs(autoMark(r, "motor").onset - r.truth.onset)).toBeLessThan(0.3);
  });
});

describe("NCS technique grading", () => {
  it("passes a clean study and flags a cold one", () => {
    const s = STUDIES.medianMotor;
    const sweeps = {};
    for (const site of stimSitesFor(s)) sweeps[site] = { sweep: run("medianMotor", site, good(s)), intensity: 1.25 * maximalCurrent("medianMotor", site, good(s)), marks: {}, distCm: 22 };
    const st = { setup: good(s), machine: { gain: 5000, sweep: 3, lff: 10, hff: 10000 }, sweeps };
    const ok = techniqueChecks("medianMotor", st, { temp: { arm: 33 }, tempChecked: { arm: true }, recordedCold: {} });
    expect(ok.filter((c) => !c.ok)).toEqual([]);
    const cold = techniqueChecks("medianMotor", st, { temp: { arm: 27 }, tempChecked: { arm: true }, recordedCold: { arm: true } });
    expect(cold.some((c) => !c.ok && c.label.startsWith("Limb temperature"))).toBe(true);
  });
});

describe("NCS cases", () => {
  it("are well formed", () => {
    const ids = new Set();
    for (const c of data.cases) {
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
      for (const id of [...c.required, ...(c.optional || []), ...Object.keys(c.path), ...Object.keys(c.preset || {})]) expect(STUDIES[id], `${c.id}: ${id}`).toBeTruthy();
      for (const q of c.questions) {
        expect(q.options).toHaveLength(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
        expect(q.explanation.length).toBeGreaterThan(60);
      }
    }
  });

  it("produce abnormal values where the case says so", () => {
    const cts = data.cases.find((c) => c.id === "ncs-cts");
    const s = STUDIES.medianMotor;
    const r = run("medianMotor", "medWrist", good(s), { path: cts.path });
    expect(r.truth.onset).toBeGreaterThan(s.limits.lat);
    const une = data.cases.find((c) => c.id === "ncs-une");
    const u = STUDIES.ulnarMotor;
    const be = run("ulnarMotor", "ulnBE", good(u), { path: une.path }).truth;
    const ae = run("ulnarMotor", "ulnAE", good(u), { path: une.path }).truth;
    const cv = (10 * measuredSegment("ulnarMotor", "ulnAE", good(u))) / (ae.onset - be.onset);
    expect(cv).toBeLessThan(u.limits.cvAcross);
    expect(ae.amp).toBeLessThan(be.amp * 0.75);
  });
});
