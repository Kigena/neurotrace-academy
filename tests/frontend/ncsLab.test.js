import { describe, expect, it } from "vitest";
import { autoMark, maximalCurrent, measuredSegment, simulate } from "../../src/ncs/generator.js";
import { techniqueChecks } from "../../src/ncs/grading.js";
import { SITES, STIM_SITES, STUDIES, stimSitesFor } from "../../src/ncs/studies.js";
import data from "../../src/data/ncsCases.json";
import { WORKSPACES } from "../../src/ncs/workspaces.js";
import { idealRecord } from "../../src/ncs/ideal.js";

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

describe("NCS cases on the interactive workspace", () => {
  const rec = (studyId, siteId, c) => idealRecord(WORKSPACES[studyId], siteId, c.ws || {});
  const byId = (id) => data.cases.find((c) => c.id === id);
  const segCv = (a, b) => Math.abs(a.geo.stim.target.pc.s - b.geo.stim.target.pc.s) / (b.truth.onset - a.truth.onset);

  it("are well formed", () => {
    const ids = new Set();
    for (const c of data.cases) {
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
      for (const id of [...c.required, ...(c.optional || []), ...Object.keys(c.preset || {})]) expect(WORKSPACES[id], `${c.id}: ${id}`).toBeTruthy();
      for (const [id, pre] of Object.entries(c.preset || {})) for (const k of ["g1", "g2", "ground", "stim"]) if (pre[k]) expect(WORKSPACES[id].model.PLACES[pre[k]], `${c.id} ${k}`).toBeTruthy();
      expect(c.ws).toBeTruthy();
      for (const q of c.questions) {
        expect(q.options).toHaveLength(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
        expect(q.explanation.length).toBeGreaterThan(60);
      }
    }
  });

  it("carpal tunnel: slow median across the wrist, normal palm and ulnar", () => {
    const c = byId("ncs-cts");
    const L = WORKSPACES.medianMotor.protocol.limits, LS = WORKSPACES.medianSensory.protocol;
    expect(rec("medianMotor", "distal", c).truth.onset).toBeGreaterThan(L.lat);
    expect(rec("medianSensory", "distal", c).truth.peak).toBeGreaterThan(LS.limits.peak);
    expect(rec("medianSensory", "palm", c).truth.peak).toBeLessThan(LS.siteLimits.palm.peak);
    expect(rec("ulnarSensory", "distal", c).truth.peak).toBeLessThan(WORKSPACES.ulnarSensory.protocol.limits.peak);
  });

  it("ulnar neuropathy at the elbow: slowing and drop across the elbow only", () => {
    const c = byId("ncs-une");
    const w = rec("ulnarMotor", "distal", c), be = rec("ulnarMotor", "be", c), ae = rec("ulnarMotor", "ae", c);
    expect(segCv(w, be)).toBeGreaterThan(WORKSPACES.ulnarMotor.protocol.limits.cv);
    expect(segCv(be, ae)).toBeLessThan(WORKSPACES.ulnarMotor.protocol.limits.cvAcross);
    expect(ae.truth.amp).toBeLessThan(0.8 * be.truth.amp);
  });

  it("axonal neuropathy, AIDP with sural sparing, and fibular neuropathy at the fibular head", () => {
    expect(rec("sural", "distal", byId("ncs-axonal")).truth.amp).toBeLessThan(WORKSPACES.sural.protocol.limits.amp);
    const g = byId("ncs-aidp");
    expect(rec("medianSensory", "distal", g).truth.present).toBe(false);
    expect(rec("sural", "distal", g).truth.amp).toBeGreaterThan(WORKSPACES.sural.protocol.limits.amp);
    expect(segCv(rec("medianMotor", "distal", g), rec("medianMotor", "elbow", g))).toBeLessThan(WORKSPACES.medianMotor.protocol.limits.cv);
    const f = byId("ncs-fibular");
    const bfh = rec("fibularMotor", "bfh", f), pop = rec("fibularMotor", "pop", f);
    expect(segCv(rec("fibularMotor", "distal", f), bfh)).toBeGreaterThan(WORKSPACES.fibularMotor.protocol.limits.cv);
    expect(segCv(bfh, pop)).toBeLessThan(WORKSPACES.fibularMotor.protocol.limits.cvAcross);
  });

  it("healthy cases stay within limits once the limb is warm", () => {
    for (const id of ["ncs-cold", "ncs-dip", "ncs-root"]) {
      const c = byId(id);
      for (const sid of c.required) {
        const cfg = WORKSPACES[sid];
        const r = idealRecord(cfg, "distal", c.ws);
        if (cfg.kind === "motor") expect(r.truth.onset, `${id} ${sid}`).toBeLessThan(cfg.protocol.limits.lat);
        else expect(r.truth.peak, `${id} ${sid}`).toBeLessThan(cfg.protocol.limits.peak);
      }
    }
  });
});
