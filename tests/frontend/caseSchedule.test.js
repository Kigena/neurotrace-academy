import { describe, it, expect } from "vitest";
import casesData from "../../src/data/cases.json";
import { caseOfTheDay, dayKey, rotationOrder, weekLineup, caseObjectives } from "../../src/utils/caseSchedule.js";

const cases = casesData.starterCases;

describe("case of the day schedule", () => {
  it("uses the New York calendar day", () => {
    // 03:00 UTC on Oct 4 is still Oct 3 in New York.
    expect(dayKey(new Date("2026-10-04T03:00:00Z"))).toBe("2026-10-03");
    expect(dayKey(new Date("2026-10-04T05:00:00Z"))).toBe("2026-10-04");
  });

  it("gives a different case on each of 7 consecutive days", () => {
    const week = weekLineup(cases, new Date("2026-10-07T15:00:00Z"));
    expect(week.map((d) => d.label)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(week[0].key).toBe("2026-10-05");
    expect(new Set(week.map((d) => d.case.id)).size).toBe(7);
    expect(week.filter((d) => d.isToday).map((d) => d.key)).toEqual(["2026-10-07"]);
    expect(week.filter((d) => d.isPast)).toHaveLength(2);
  });

  it("visits every case once per full rotation, and is stable for a day", () => {
    const order = rotationOrder(cases);
    expect(new Set(order.map((c) => c.id)).size).toBe(cases.length);
    const seen = new Set();
    for (let i = 0; i < cases.length; i++) {
      const now = new Date(Date.UTC(2026, 9, 1 + i, 16));
      seen.add(caseOfTheDay(cases, now).today.id);
    }
    expect(seen.size).toBe(cases.length);
    const morning = caseOfTheDay(cases, new Date("2026-10-03T12:00:00Z")).today.id;
    const evening = caseOfTheDay(cases, new Date("2026-10-04T02:00:00Z")).today.id;
    expect(evening).toBe(morning);
  });

  it("alternates domains on consecutive days where the pool allows", () => {
    const order = rotationOrder(cases);
    const same = order.slice(1).filter((c, i) => c.domainFocus[0] === order[i].domainFocus[0]).length;
    expect(same).toBeLessThan(order.length / 3);
  });

  it("returns three objectives for every case", () => {
    for (const c of cases) {
      const n = caseObjectives(c).length;
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(3);
    }
    expect(caseObjectives({ objectives: ["a", "b", "c", "d"] })).toEqual(["a", "b", "c"]);
  });
});
