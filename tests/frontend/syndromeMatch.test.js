import { describe, it, expect } from "vitest";
import data from "../../src/data/neuroSyndromes.json";
import scenes from "../../src/data/syndromeScenes.json";
import { FEATURES, matchSyndromes } from "../../src/eeg/syndromeMatch.js";
import { validateScene, ELECTRODES } from "../../src/eeg/generator.js";

const ids = (r) => r.map((s) => s.id);

describe("syndrome finder", () => {
  it("matches the classic age and feature pairs", () => {
    expect(ids(matchSyndromes(data.syndromes, { age: 6, feature: "gsw-3hz" }))).toEqual(["cae"]);
    expect(ids(matchSyndromes(data.syndromes, { age: 0.4, feature: "hypsarrhythmia" }))).toEqual(["west"]);
    expect(ids(matchSyndromes(data.syndromes, { age: 15, feature: "polyspike" }))).toEqual(["jme"]);
    expect(ids(matchSyndromes(data.syndromes, { age: 8, feature: "rolandic" }))).toEqual(["rolandic"]);
    expect(ids(matchSyndromes(data.syndromes, { age: 0.05, feature: "burst-suppression" }))).toEqual(["ohtahara"]);
  });

  it("excludes a syndrome outside its age range", () => {
    expect(ids(matchSyndromes(data.syndromes, { age: 40, feature: "gsw-3hz" }))).toEqual([]);
    expect(ids(matchSyndromes(data.syndromes, { age: 30, feature: "hypsarrhythmia" }))).toEqual([]);
  });

  it("returns every age-appropriate syndrome when the feature is any, and everything when age is blank", () => {
    expect(matchSyndromes(data.syndromes, { age: "", feature: "any" })).toHaveLength(data.syndromes.length);
    expect(ids(matchSyndromes(data.syndromes, { age: 28, feature: "any" }))).toEqual(expect.arrayContaining(["tle", "fle"]));
  });

  it("every feature in the menu is carried by at least one syndrome", () => {
    for (const [f] of FEATURES.filter(([k]) => k !== "any")) {
      expect(data.syndromes.some((s) => (s.features || []).includes(f)), f).toBe(true);
    }
  });
});

describe("teaching data", () => {
  it("every region, syndrome and pattern points to a scene that renders", () => {
    const keys = [
      ...data.regions.map((r) => r.scene),
      ...data.syndromes.flatMap((s) => [s.scene, s.scene2]),
      ...data.patterns.map((p) => p.scene),
    ].filter(Boolean);
    expect(keys.length).toBeGreaterThan(20);
    for (const k of keys) {
      expect(scenes[k], k).toBeTruthy();
      expect(() => validateScene(scenes[k]), k).not.toThrow();
    }
  });

  it("every region lists real 10-20 electrodes, with no electrode in two regions", () => {
    const seen = new Set();
    for (const r of data.regions) {
      for (const e of r.electrodes) {
        expect(ELECTRODES[e], e).toBeTruthy();
        expect(seen.has(e), `${e} appears twice`).toBe(false);
        seen.add(e);
      }
    }
  });

  it("syndrome age ranges are consistent", () => {
    for (const s of data.syndromes) expect(s.ageMin).toBeLessThan(s.ageMax);
  });
});

describe("genetics tab data", () => {
  const gen = data.genetics;
  it("every gene card has its fields, a valid group and a scene that validates", () => {
    const groups = new Set(gen.groups.map(([id]) => id));
    expect(gen.items.length).toBeGreaterThanOrEqual(15);
    for (const g of gen.items) {
      for (const f of ["id", "label", "name", "group", "gene", "age", "clinical", "mechanism", "eeg", "technologist"]) expect(g[f], `${g.id}.${f}`).toBeTruthy();
      expect(groups.has(g.group), g.id).toBe(true);
      for (const k of [g.scene, g.scene2].filter(Boolean)) {
        expect(scenes[k], k).toBeTruthy();
        expect(() => validateScene(scenes[k]), k).not.toThrow();
      }
    }
    expect(new Set(gen.items.map((g) => g.id)).size).toBe(gen.items.length);
  });
});
