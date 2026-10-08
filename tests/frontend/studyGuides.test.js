import { describe, expect, it } from "vitest";
import neuro from "../../src/data/neurologyEssentials.json";
import safety from "../../src/data/labSafety.json";
import ethics from "../../src/data/professionalPractice.json";

const KINDS = new Set(["text", "list", "table", "cards", "steps", "flow"]);

describe.each([
  ["neurology essentials", neuro],
  ["lab safety", safety],
  ["ethics and professional practice", ethics],
])("%s study guide", (_, data) => {
  it("has unique tabs whose sections match the renderer schema", () => {
    expect(data.title).toBeTruthy();
    const ids = data.tabs.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("mistakes");
    expect(ids).not.toContain("practice");
    for (const t of data.tabs) {
      expect(t.sections.length, t.id).toBeGreaterThan(0);
      for (const s of t.sections) {
        expect(KINDS.has(s.kind), `${t.id}: ${s.title}`).toBe(true);
        if (s.kind === "text") expect(s.text).toBeTruthy();
        if (s.kind === "list" || s.kind === "steps" || s.kind === "flow") expect(s.items.length).toBeGreaterThan(0);
        if (s.kind === "cards") expect(s.cards.length).toBeGreaterThan(0);
        if (s.kind === "table") for (const r of s.rows) expect(r.length, `${t.id}: ${s.title}`).toBe(s.head.length);
      }
    }
  });
  it("has common mistakes as wrong/correct pairs", () => {
    expect(data.mistakes.length).toBeGreaterThanOrEqual(8);
    for (const m of data.mistakes) expect(m).toHaveLength(2);
  });
});
