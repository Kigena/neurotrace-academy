import { describe, it, expect } from "vitest";
import { analysePhase } from "../../src/eeg/phase.js";

const text = (v) => analysePhase(v).notes.join(" | ");

describe("phase-reversal calculator logic", () => {
  it("finds a negative reversal when the neighbours point toward each other", () => {
    const r = analysePhase([-30, -90, -50, -20]);
    expect(r.dir).toEqual(["down", "up", "up"]);
    expect(text([-30, -90, -50, -20])).toMatch(/toward each other: negative phase reversal at electrode 2/);
  });

  it("finds a positive reversal when they point away", () => {
    expect(text([30, 90, 50, 20])).toMatch(/away from each other: positive phase reversal at electrode 2/);
  });

  it("reports a double reversal for two peaks", () => {
    const t = text([-90, -50, -90, -20]);
    expect(t).toMatch(/positive phase reversal at electrode 2/);
    expect(t).toMatch(/negative phase reversal at electrode 3/);
    expect(t).toMatch(/double phase reversal/);
  });

  it("says there is no reversal at the end of a chain", () => {
    expect(text([-90, -70, -50, -30])).toMatch(/No phase reversal/);
  });

  it("explains a flat channel between two equal electrodes and where the focus lies", () => {
    const t = text([-30, -90, -90, -30]);
    expect(t).toMatch(/flat/);
    expect(t).toMatch(/most negative potential is shared by electrodes 2 and 3/);
    expect(text([30, 90, 90, 30])).toMatch(/most positive potential is shared by electrodes 2 and 3/);
  });

  it("still states there is no reversal when a flat channel sits at the end", () => {
    const t = text([10, 10, 50, 90]);
    expect(t).toMatch(/Channel 1 is flat/);
    expect(t).toMatch(/No phase reversal/);
  });

  it("handles all-equal potentials and rounds decimals", () => {
    expect(text([0, 0, 0, 0])).toBe("All channels are flat: every electrode has the same potential.");
    expect(analysePhase([0.1, 0.4, 0.7, 1.0]).ch).toEqual([-0.3, -0.3, -0.3]);
  });
});
