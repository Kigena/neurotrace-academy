import { describe, it, expect } from "vitest";
import data from "../../src/data/neuroSyndromes.json";
import scenes from "../../src/data/syndromeScenes.json";
import { FEATURES, matchSyndromes } from "../../src/eeg/syndromeMatch.js";
import { validateScene, ELECTRODES } from "../../src/eeg/generator.js";

const ids = (r) => r.map((s) => s.id);

describe("syndrome finder", () => {
  it("matches the classic age and feature pairs", () => {
    const at6 = ids(matchSyndromes(data.syndromes, { age: 6, feature: "gsw-3hz" }));
    expect(at6).toContain("cae");
    expect(at6).not.toContain("jme");
    expect(ids(matchSyndromes(data.syndromes, { age: 0.4, feature: "hypsarrhythmia" }))).toEqual(["west_syndrome"]);
    expect(ids(matchSyndromes(data.syndromes, { age: 15, feature: "polyspike" }))).toContain("jme");
    expect(ids(matchSyndromes(data.syndromes, { age: 8, feature: "rolandic" }))).toEqual(["rolandic"]);
    expect(ids(matchSyndromes(data.syndromes, { age: 0.05, feature: "burst-suppression" }))).toEqual(expect.arrayContaining(["ohtahara", "eme"]));
  });

  it("excludes a syndrome outside its age range", () => {
    expect(ids(matchSyndromes(data.syndromes, { age: 45, feature: "gsw-3hz" }))).toEqual([]);
    expect(ids(matchSyndromes(data.syndromes, { age: 30, feature: "hypsarrhythmia" }))).toEqual([]);
  });

  it("returns every age-appropriate syndrome when the feature is any, and everything when age is blank", () => {
    expect(matchSyndromes(data.syndromes, { age: "", feature: "any" })).toHaveLength(data.syndromes.length);
    expect(ids(matchSyndromes(data.syndromes, { age: 28, feature: "any" }))).toEqual(expect.arrayContaining(["temporal_lobe_epilepsy", "frontal_lobe_epilepsy"]));
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

describe("merged syndrome data", () => {
  const geneIds = new Set(["angelman", "rett", "lissencephaly"]);
  it("every syndrome has the merged fields, a valid group and resolvable related ids", () => {
    const known = new Set([...data.syndromes.map((s) => s.id), ...geneIds]);
    expect(data.syndromes.length).toBeGreaterThanOrEqual(20);
    for (const s of data.syndromes) {
      for (const f of ["classification", "ageText", "seizure", "pathophys", "eeg", "eegShort", "technologist", "clinical", "course", "differential", "pearls"]) expect(s[f], `${s.id}.${f}`).toBeTruthy();
      expect(["infant", "child", "adolescent"]).toContain(s.group);
      for (const r of s.related || []) expect(known.has(r), `${s.id} related ${r}`).toBe(true);
      expect(s.related || [], s.id).not.toContain("landau_kleffner");
    }
  });
  it("carries no numeric diagnostic-yield percentages", () => {
    const text = JSON.stringify(data.syndromes);
    expect(/\d+\s*%/.test(text) || /\d+-\d+%/.test(text)).toBe(false);
  });
  it("every syndrome with a tracing has a scene that validates", () => {
    for (const s of data.syndromes) if (s.scene) expect(() => validateScene(scenes[s.scene]), s.id).not.toThrow();
  });
});
