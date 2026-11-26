import { describe, expect, it } from "vitest";
import {
  ABBREVIATION_GROUPS,
  ABBREVIATIONS,
  ambiguousAbbreviations,
  searchAbbreviations,
} from "../../src/data/abbreviations.js";

describe("abbreviations reference", () => {
  it("includes the ICU tables and the lab groups", () => {
    const ids = ABBREVIATION_GROUPS.map((g) => g.id);
    expect(ids.filter((id) => id.startsWith("icu-"))).toHaveLength(6);
    for (const id of ["recording", "montages", "patterns", "epilepsy", "medications", "evoked", "ncs", "ionm", "sleep", "orgs", "general"]) {
      expect(ids).toContain(id);
    }
    expect(ABBREVIATIONS.length).toBeGreaterThan(300);
  });

  it("has complete rows and no duplicate abbreviation within a group", () => {
    for (const g of ABBREVIATION_GROUPS) {
      const seen = new Set();
      for (const row of g.rows) {
        expect(row).toHaveLength(3);
        row.forEach((cell) => expect(String(cell).trim().length).toBeGreaterThan(0));
        expect(seen.has(row[0]), `${g.id}: ${row[0]}`).toBe(false);
        seen.add(row[0]);
      }
    }
  });

  it("finds the abbreviations from an ICU cEEG order", () => {
    for (const q of ["SAH", "H-H", "POD", "s/p", "EVD", "DCI", "cEEG", "Nimodipine"]) {
      const hits = searchAbbreviations(q);
      expect(hits.length, q).toBeGreaterThan(0);
      expect(hits[0].abbr.toLowerCase(), q).toContain(q.toLowerCase());
    }
  });

  it("searches meanings as well as abbreviations", () => {
    expect(searchAbbreviations("delayed cerebral ischemia").some((e) => e.abbr === "DCI")).toBe(true);
    expect(searchAbbreviations("")).toHaveLength(ABBREVIATIONS.length);
  });

  it("flags the same letters used with different meanings", () => {
    const tokens = ambiguousAbbreviations().map((a) => a.token);
    for (const t of ["NCS", "CSA", "SE", "RNS", "PSW"]) expect(tokens).toContain(t);
    // A term repeated with the same meaning in two groups is a duplicate, not a collision.
    for (const a of ambiguousAbbreviations()) {
      expect(new Set(a.entries.map((e) => e.meaning)).size).toBeGreaterThan(1);
    }
  });
});
