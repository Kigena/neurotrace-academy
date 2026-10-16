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
