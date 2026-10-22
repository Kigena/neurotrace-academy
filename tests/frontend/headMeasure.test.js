import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { ELECTRODE_ORDER, buildMesh, dist, idealPositions, nearestOnPath, pointAlong, tapePath } from "../../src/neuro/headMeasure.js";
import { LANDMARKS } from "../../src/neuro/headModel.js";
import { STEPS, checkCalc, gradeMark } from "../../src/neuro/headLabSteps.js";

const dir = path.resolve(__dirname, "../../public/models/head");
const gltf = JSON.parse(fs.readFileSync(path.join(dir, "head.gltf"), "utf8"));
const bin = fs.readFileSync(path.join(dir, "head.bin"));
const view = (i, Type, size) => {
  const bv = gltf.bufferViews[gltf.accessors[i].bufferView];
  const out = new Type(gltf.accessors[i].count * size);
  out.set(new Type(bin.buffer.slice(bin.byteOffset + bv.byteOffset, bin.byteOffset + bv.byteOffset + bv.byteLength)));
  return out;
};
const mesh = buildMesh(view(0, Float32Array, 3), view(2, Uint32Array, 1), LANDMARKS);
const { positions: P, arcs } = idealPositions(mesh);

describe("10-20 measurement geometry", () => {
  it("measures adult-sized arcs on the life-size head", () => {
    expect(arcs.midline).toBeGreaterThan(33); // nasion-inion
    expect(arcs.midline).toBeLessThan(40);
    expect(arcs.coronal).toBeGreaterThan(32); // preauricular to preauricular
    expect(arcs.coronal).toBeLessThan(40);
    expect(arcs.leftHalf + arcs.rightHalf).toBeGreaterThan(52); // head circumference
    expect(arcs.leftHalf + arcs.rightHalf).toBeLessThan(64);
    expect(arcs.leftHalf).toBeCloseTo(arcs.rightHalf, 1);
  });

  it("places all 21 electrodes, midline ones on the midline and pairs mirrored", () => {
    for (const n of ELECTRODE_ORDER) expect(P[n], n).toHaveLength(3);
    for (const n of ["Fpz", "Fz", "Cz", "Pz", "Oz"]) expect(Math.abs(P[n][0]), n).toBeLessThan(0.2);
    for (const [l, r] of [["Fp1", "Fp2"], ["F7", "F8"], ["F3", "F4"], ["T3", "T4"], ["C3", "C4"], ["T5", "T6"], ["P3", "P4"], ["O1", "O2"]]) {
      expect(P[l][0], l).toBeGreaterThan(0); // left electrodes on the patient's left (+x)
      expect(P[l][0] + P[r][0], `${l}/${r}`).toBeCloseTo(0, 1);
      expect(P[l][1], `${l}/${r}`).toBeCloseTo(P[r][1], 1);
    }
  });

  it("keeps the midline in order with Cz near the vertex", () => {
    const z = ["Fpz", "Fz", "Cz", "Pz", "Oz"].map((n) => P[n][2]);
    for (let i = 1; i < z.length; i++) expect(z[i]).toBeLessThan(z[i - 1]);
    expect(dist(P.Cz, LANDMARKS.vertex)).toBeLessThan(1.5);
  });

  it("agrees between the coronal and circumference measurements for T3/T4", () => {
    const left = tapePath(mesh, P.Fpz, P.Oz, P.T3);
    const mid = pointAlong(left.path, left.length / 2);
    expect(dist(mid, P.T3)).toBeLessThan(1.5);
    expect(nearestOnPath(left.path, P.F7).d).toBeLessThan(0.3);
  });

  it("spaces neighbours by about 10% and 20% of the arcs", () => {
    expect(dist(P.Fz, P.Cz)).toBeGreaterThan(0.17 * arcs.midline);
    expect(dist(P.Fz, P.Cz)).toBeLessThan(0.21 * arcs.midline);
    expect(dist(P.Fp1, P.Fp2)).toBeGreaterThan(0.08 * (arcs.leftHalf + arcs.rightHalf));
  });
});

describe("10-20 lab script", () => {
  it("refers only to known landmarks, electrodes and earlier tapes", () => {
    const known = new Set([...ELECTRODE_ORDER, "nasion", "inion", "lpa", "rpa", "vertex"]);
    const tapes = new Set();
    for (const s of STEPS) for (const t of s.tasks) {
      if (t.type === "pick") expect(known.has(t.target), t.target).toBe(true);
      if (t.type === "tape") { for (const k of [t.from, t.to, t.via]) expect(known.has(k), k).toBe(true); tapes.add(t.id); }
      if (t.type === "calc" || t.type === "mark") expect(tapes.has(t.tape), `${t.type} before tape ${t.tape}`).toBe(true);
      if (t.type === "mark") expect(ELECTRODE_ORDER).toContain(t.electrode);
    }
    const marked = STEPS.flatMap((s) => s.tasks.filter((t) => t.type === "mark").map((t) => t.electrode));
    expect(new Set(marked).size).toBe(marked.length);
    expect([...marked].sort()).toEqual([...ELECTRODE_ORDER].sort()); // every electrode is marked exactly once
  });

  it("ships the head model with its licence notice", () => {
    expect(fs.readFileSync(path.join(dir, "LICENSE.txt"), "utf8")).toMatch(/Fab Standard License/);
  });

  it("grades placements and calculations", () => {
    expect(gradeMark(0.6)).toBe("good");
    expect(gradeMark(1.6)).toBe("close");
    expect(gradeMark(3)).toBe("off");
    expect(checkCalc("3.7", 37.05, 0.1)).toBe(true);
    expect(checkCalc("3,7", 37.05, 0.1)).toBe(true);
    expect(checkCalc("4.2", 37.05, 0.1)).toBe(false);
  });
});
