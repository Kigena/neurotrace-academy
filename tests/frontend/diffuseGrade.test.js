import { describe, it, expect } from "vitest";
import { gradeDiffuse, gcsSeverity, GRADES } from "../../src/eeg/diffuseGrade.js";

const g = (f) => gradeDiffuse({ eci: "none", burst: false, ...f }).grade;

describe("diffuse abnormality grade finder", () => {
  it("grades background slowing without excess theta or delta as I", () => {
    expect(g({ background: "mild", excess: "none" })).toBe("IA");
    expect(g({ background: "moderate", excess: "none" })).toBe("IB");
    expect(g({ background: "normal", excess: "none" })).toBeNull();
  });

  it("splits grades II and III on whether the background is normal or slow", () => {
    expect(g({ background: "normal", excess: "theta" })).toBe("IIA");
    expect(g({ background: "moderate", excess: "theta" })).toBe("IIB");
    expect(g({ background: "normal", excess: "delta" })).toBe("IIIA");
    expect(g({ background: "moderate", excess: "delta" })).toBe("IIIB");
    // a 7 to just under 8 Hz background is already slowed, so with excess slow waves it is the B grade
    expect(g({ background: "mild", excess: "theta" })).toBe("IIB");
    expect(g({ background: "mild", excess: "delta" })).toBe("IIIB");
    expect(g({ background: "slower", excess: "delta" })).toBe("IIIB");
  });

  it("does not grade a minimal background without delta, or a background slower than 4 Hz alone", () => {
    expect(g({ background: "minimal", excess: "theta" })).toBeNull();
    expect(g({ background: "minimal", excess: "none" })).toBeNull();
    expect(g({ background: "slower", excess: "none" })).toBeNull();
  });

  it("grades delta with a minimal background by amplitude (50 uV boundary)", () => {
    expect(g({ background: "minimal", excess: "delta", deltaUv: 80 })).toBe("IVA");
    expect(g({ background: "minimal", excess: "delta", deltaUv: 50 })).toBe("IVB");
    expect(g({ background: "minimal", excess: "delta", deltaUv: 30 })).toBe("IVB");
    expect(g({ background: "minimal", excess: "delta", deltaUv: "" })).toBeNull();
  });

  it("grades burst suppression by suppression length (5 s boundary)", () => {
    expect(g({ burst: { suppressionSeconds: 2 } })).toBe("VA");
    expect(g({ burst: { suppressionSeconds: 4.9 } })).toBe("VA");
    expect(g({ burst: { suppressionSeconds: 5 } })).toBe("VB");
    expect(g({ burst: { suppressionSeconds: 9 } })).toBe("VB");
  });

  it("puts electrocerebral inactivity above everything else", () => {
    expect(g({ eci: "near", background: "normal", excess: "none" })).toBe("VIA");
    expect(g({ eci: "complete", burst: { suppressionSeconds: 2 } })).toBe("VIB");
  });

  it("every grade it can return has a description", () => {
    for (const code of ["IA", "IB", "IIA", "IIB", "IIIA", "IIIB", "IVA", "IVB", "VA", "VB", "VIA", "VIB"]) {
      expect(GRADES[code].short.length).toBeGreaterThan(10);
    }
  });
});

describe("Glasgow Coma Scale", () => {
  it("adds eye, verbal and motor scores and bands the total", () => {
    expect(gcsSeverity(4, 5, 6)).toMatchObject({ total: 15, band: "mild" });
    expect(gcsSeverity(3, 4, 5)).toMatchObject({ total: 12, band: "moderate" });
    expect(gcsSeverity(2, 3, 4)).toMatchObject({ total: 9, band: "moderate" });
    expect(gcsSeverity(2, 2, 4)).toMatchObject({ total: 8, band: "severe" });
    expect(gcsSeverity(1, 1, 1)).toMatchObject({ total: 3, band: "severe" });
    expect(gcsSeverity(4, 4, 5)).toMatchObject({ total: 13, band: "mild" });
  });

  it("keeps each component inside its range", () => {
    expect(gcsSeverity(9, 9, 9)).toMatchObject({ eye: 4, verbal: 5, motor: 6, total: 15 });
    expect(gcsSeverity(0, 0, 0)).toMatchObject({ total: 3 });
  });
});
