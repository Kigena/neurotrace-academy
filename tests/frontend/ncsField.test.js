import { describe, expect, it } from "vitest";
import * as M from "../../src/ncs/anatomy/suralView.js";
import { describeSetup, explainSetup, simulateField } from "../../src/ncs/fieldSim.js";
import { inPolygon, pointAt, polylineLength, project } from "../../src/ncs/geometry.js";
import { PROTOCOLS } from "../../src/ncs/protocols.js";

const P = PROTOCOLS["sural-anti-14"];
const s1 = project(M.PLACES.behindLatMall, M.NERVE).s;
const at = (s) => pointAt(M.NERVE, s);
const good = { g1: "good", g2: "good", ground: "good", stim: "good" };
const ideal = (o = {}) => ({
  g1: M.PLACES.behindLatMall, g2: at(s1 + 35), ground: M.PLACES.lowerCalfLat,
  stim: { ...at(s1 - 155), angle: Math.PI / 2 }, contact: good, ...o,
});
const machine = { lff: 20, hff: 2000, sweep: 1, gain: 20 };
const run = (setup, I = 30, patient = { tempC: 31 }) => simulateField({ model: M, setup, machine, patient, intensity: I, seed: 3 });

describe("sural anatomy model", () => {
  it("keeps every named place and the nerve on the skin", () => {
    for (const [id, p] of Object.entries(M.PLACES)) expect(inPolygon(p, M.SKIN), id).toBe(true);
    for (const [x, y] of M.NERVE.slice(1, -1)) expect(inPolygon({ x, y }, M.SKIN)).toBe(true);
    expect(polylineLength(M.NERVE)).toBeGreaterThan(400);
  });
});

describe("field-based sural simulation", () => {
  it("records a plausible SNAP with the reference set-up and passes the checks", () => {
    const r = run(ideal());
    expect(r.truth.amp).toBeGreaterThan(14);
    expect(r.truth.amp).toBeLessThan(22);
    expect(r.truth.peak).toBeLessThan(P.limits.peak);
    expect(Math.abs(r.geo.trueDistMm - 140)).toBeLessThan(3);
    const bad = explainSetup({ geo: r.geo, protocol: P, intensity: 30, machine, tempC: 31, tempChecked: true }).filter((x) => !x.ok);
    expect(bad).toEqual([]);
  });

  it("loses amplitude when G1 moves off the nerve or G2 is too close", () => {
    const base = run(ideal()).truth.amp;
    expect(run(ideal({ g1: { x: 187, y: 398 } })).truth.amp).toBeLessThan(base * 0.6);
    expect(run(ideal({ g2: at(s1 + 15) })).truth.amp).toBeLessThan(base * 0.8);
  });

  it("needs more current when the cathode is off the nerve or rotated across it", () => {
    const imax = describeSetup(M, ideal()).stim.imax;
    const off = describeSetup(M, ideal({ stim: { ...at(s1 - 155), x: at(s1 - 155).x - 15, angle: Math.PI / 2 } })).stim.imax;
    const rot = describeSetup(M, ideal({ stim: { ...at(s1 - 140), angle: 0 } })).stim.imax;
    expect(off).toBeGreaterThan(imax * 1.8);
    expect(rot).toBeGreaterThan(imax * 1.8);
    expect(run(ideal(), 12).truth.amp).toBeLessThan(run(ideal(), 30).truth.amp * 0.8);
  });

  it("lengthens latency and raises threshold with reversed polarity at the same stimulator position", () => {
    const fwd = run(ideal());
    const rev = run(ideal({ stim: { ...at(s1 - 155), angle: -Math.PI / 2 } }), 40);
    expect(rev.geo.stim.reversed).toBe(true);
    expect(rev.truth.onset - fwd.truth.onset).toBeGreaterThan(0.4);
    expect(rev.geo.stim.imax).toBeGreaterThan(fwd.geo.stim.imax);
  });

  it("slows conduction when cold and adds noise with poor contact or no ground", () => {
    expect(run(ideal(), 30, { tempC: 26 }).truth.onset).toBeGreaterThan(run(ideal()).truth.onset + 0.3);
    expect(run(ideal({ contact: { ...good, g1: "dry" } })).noise.mains).toBeGreaterThan(5);
    expect(run(ideal({ ground: null })).noise.mains).toBeGreaterThan(20);
  });

  it("separates the true conduction distance from where the learner thinks they measured", () => {
    const r = run(ideal({ stim: { ...at(s1 - 115), angle: Math.PI / 2 } }));
    expect(r.geo.trueDistMm).toBeLessThan(110);
    const f = explainSetup({ geo: r.geo, protocol: P, intensity: 30, machine, tempC: 31, tempChecked: true });
    expect(f.find((x) => x.id === "distance").ok).toBe(false);
  });
});

import * as A from "../../src/ncs/anatomy/medianArmView.js";
import { simulateMotor, explainMotor } from "../../src/ncs/motorField.js";
import { WORKSPACES } from "../../src/ncs/workspaces.js";

describe("median motor arm model", () => {
  const PL = A.PLACES;
  const M = PROTOCOLS["median-motor-apb"];
  const mset = (o = {}) => ({ g1: PL.apbMotorPoint, g2: PL.thumbMcp, ground: PL.palmGround, stim: { x: PL.wristMedian8.x, y: PL.wristMedian8.y - 15, angle: Math.PI / 2 }, contact: good, ...o });
  const mach = { lff: 10, hff: 10000, sweep: 3, gain: 5000 };
  const mrun = (setup, I = 30, patient = { tempC: 33 }) => simulateMotor({ model: A, setup, machine: mach, patient, intensity: I, seed: 2 });

  it("keeps the places on the skin", () => {
    for (const [id, p] of Object.entries(PL)) expect(inPolygon(p, A.SKIN), id).toBe(true);
  });

  it("gives a normal CMAP with the standard set-up and a plausible forearm velocity", () => {
    const w = mrun(mset());
    expect(w.truth.onset).toBeLessThan(M.limits.lat);
    expect(w.truth.amp / 1000).toBeGreaterThan(M.limits.amp);
    expect(w.truth.positiveFirst).toBe(false);
    expect(Math.abs(w.geo.surfaceDistMm - 80)).toBeLessThan(3);
    const e = mrun(mset({ stim: { x: PL.elbowMedian.x, y: PL.elbowMedian.y - 15, angle: Math.PI / 2 } }), 45);
    const route = A.NERVES.median.routes.apb;
    const seg = project(w.geo.stim.cathode, route).s - project(e.geo.stim.cathode, route).s;
    const cv = seg / (e.truth.onset - w.truth.onset);
    expect(cv).toBeGreaterThan(50);
    expect(cv).toBeLessThan(65);
    const bad = explainMotor({ geo: w.geo, protocol: M, intensity: 30, machine: mach, tempC: 33, tempChecked: true, site: "distal", model: A }).filter((x) => !x.ok);
    expect(bad).toEqual([]);
  });

  it("starts with a positive dip when G1 is off the motor point", () => {
    expect(mrun(mset({ g1: PL.thenarProximal })).truth.positiveFirst).toBe(true);
  });

  it("records a small positive-first response when only the ulnar nerve is stimulated", () => {
    const u = mrun(mset({ stim: { x: PL.wristUlnar.x, y: PL.wristUlnar.y - 15, angle: Math.PI / 2 } }), 35);
    expect(u.truth.positiveFirst).toBe(true);
    expect(u.truth.amp).toBeLessThan(2500);
  });

  it("flags current spread to the ulnar nerve at very high current", () => {
    const hi = mrun(mset(), 80);
    expect(hi.truth.fired.ulnarThenar).toBeGreaterThan(0.3);
    const f = explainMotor({ geo: hi.geo, protocol: M, intensity: 80, machine: mach, tempC: 33, tempChecked: true, site: "distal", model: A });
    expect(f.some((x) => x.id === "spread" && !x.ok)).toBe(true);
  });

  it("lengthens latency with reversed polarity and with cold", () => {
    const base = mrun(mset()).truth.onset;
    const rev = mrun(mset({ stim: { x: PL.wristMedian8.x, y: PL.wristMedian8.y - 15, angle: -Math.PI / 2 } }), 50);
    expect(rev.geo.stim.reversed).toBe(true);
    expect(rev.truth.onset - base).toBeGreaterThan(0.3);
    expect(mrun(mset(), 30, { tempC: 28 }).truth.onset - base).toBeGreaterThan(0.4);
  });

  it("defines complete workspace configurations", () => {
    for (const w of Object.values(WORKSPACES)) {
      expect(w.sites.length).toBeGreaterThan(0);
      for (const flexed of [true, false]) {
        const setup = { elbowFlexed: flexed };
        for (const t of w.targets(setup)) {
          const m = (t.panel ?? "main") === "main" ? w.model : w.panels.find((p) => p.id === t.panel).model(setup);
          expect(inPolygon(t, m.SKIN), `${w.id} ${t.label}`).toBe(true);
        }
      }
      expect(w.model.VIEWS.length).toBeGreaterThan(2);
    }
  });
});

import { EXTENDED, FLEXED } from "../../src/ncs/anatomy/ulnarElbowView.js";
import { carryStimulator, globalToLocal, localToGlobal } from "../../src/ncs/panels.js";
import { dist } from "../../src/ncs/geometry.js";

describe("ulnar motor across the elbow", () => {
  const W = WORKSPACES.ulnarMotor;
  const A2 = W.model;
  const U = PROTOCOLS["ulnar-motor-adm"];
  const anchors = A2.ULNAR_ANCHORS;
  const stimAt = (place, panel, model) => {
    const route = panel === "elbow" ? model.NERVES.ulnar.route : A2.NERVES.ulnar.routes.adm;
    const pr = project(place, route);
    const ang = Math.atan2(pr.ty, pr.tx);
    return { x: place.x - Math.cos(ang) * 15, y: place.y - Math.sin(ang) * 15, angle: ang, panel };
  };
  const setupFor = (stim, flexed) => ({ g1: A2.PLACES.hypothenar, g2: A2.PLACES.littleFinger, ground: A2.PLACES.palmGround, stim, contact: good, elbowFlexed: flexed });
  const urun = (stim, flexed, I = 50) => W.simulate({ model: A2, setup: setupFor(stim, flexed), machine: { lff: 10, hff: 10000, sweep: 3 }, patient: { tempC: 33 }, intensity: I, seed: 5 });

  it("keeps elbow places on the skin and maps both geometries onto the same nerve", () => {
    for (const m of [FLEXED, EXTENDED]) {
      for (const [id, p] of Object.entries(m.PLACES)) expect(inPolygon(p, m.SKIN), `${m.id} ${id}`).toBe(true);
      const sBe = project(m.PLACES.be, m.NERVES.ulnar.route).s;
      const g = localToGlobal(m, A2, "ulnar", anchors, sBe);
      expect(Math.abs(globalToLocal(m, A2, "ulnar", anchors, g) - sBe)).toBeLessThan(0.5);
    }
  });

  it("gives the same latencies flexed or straight but a shorter skin tape when straight", () => {
    const lat = (m, flexed) => urun(stimAt(m.PLACES.ae, "elbow", m), flexed).truth.onset - urun(stimAt(m.PLACES.be, "elbow", m), flexed).truth.onset;
    expect(Math.abs(lat(FLEXED, true) - lat(EXTENDED, false))).toBeLessThan(0.05);
    expect(dist(EXTENDED.PLACES.ae, EXTENDED.PLACES.be)).toBeLessThan(dist(FLEXED.PLACES.ae, FLEXED.PLACES.be));
  });

  it("records increasing latencies at wrist, below and above elbow within the limits", () => {
    const w = urun(stimAt(A2.PLACES.wristUlnar, "main"), true, 35);
    const be = urun(stimAt(FLEXED.PLACES.be, "elbow", FLEXED), true);
    const ae = urun(stimAt(FLEXED.PLACES.ae, "elbow", FLEXED), true);
    expect(w.truth.onset).toBeLessThan(U.limits.lat);
    expect(w.truth.amp / 1000).toBeGreaterThan(U.limits.amp);
    expect(be.truth.onset).toBeGreaterThan(w.truth.onset);
    expect(ae.truth.onset).toBeGreaterThan(be.truth.onset);
    expect(100 / (ae.truth.onset - be.truth.onset)).toBeGreaterThan(U.limits.cvAcross);
    expect(ae.truth.amp).toBeGreaterThan(0.8 * be.truth.amp);
  });

  it("warns when the elbow is straight and when the above-elbow cathode drifts onto the median nerve", () => {
    const be = urun(stimAt(EXTENDED.PLACES.be, "elbow", EXTENDED), false);
    const f = explainMotor({ geo: be.geo, protocol: U, intensity: 50, machine: { gain: 5000, lff: 10, hff: 10000 }, tempC: 33, tempChecked: true, site: "be", model: A2, setup: setupFor(null, false) });
    expect(f.some((x) => x.id === "elbow" && !x.ok)).toBe(true);
    const med = urun(stimAt(FLEXED.MEDIAN_SPOT, "elbow", FLEXED), true, 30);
    expect(med.truth.fired.apb).toBeGreaterThan(0.5);
    expect(med.truth.fired.adm).toBeLessThan(0.2);
    // Excessive current at the correct above-elbow site also reaches the nearby median nerve.
    const over = urun(stimAt(FLEXED.PLACES.ae, "elbow", FLEXED), true, 60);
    expect(over.truth.fired.apb).toBeGreaterThan(0.3);
    const g = explainMotor({ geo: over.geo, protocol: U, intensity: 60, machine: { gain: 5000, lff: 10, hff: 10000 }, tempC: 33, tempChecked: true, site: "ae", model: A2, setup: setupFor(null, true) });
    expect(g.some((x) => x.id === "spread" && !x.ok)).toBe(true);
  });

  it("carries the stimulator to the other geometry at the same place along the nerve", () => {
    const st = stimAt(FLEXED.PLACES.be, "elbow", FLEXED);
    const moved = carryStimulator(st, FLEXED, EXTENDED, A2, "ulnar", anchors);
    const g1 = localToGlobal(FLEXED, A2, "ulnar", anchors, project(st, FLEXED.NERVES.ulnar.route).s);
    const g2 = localToGlobal(EXTENDED, A2, "ulnar", anchors, project(moved, EXTENDED.NERVES.ulnar.route).s);
    expect(Math.abs(g1 - g2)).toBeLessThan(2);
  });
});
