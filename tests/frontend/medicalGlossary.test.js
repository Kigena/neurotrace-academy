import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { tokenizeMedicalText } from "../../src/data/medicalGlossary.js";
import MedicalText from "../../src/components/MedicalText.jsx";

describe("medical glossary tokenization", () => {
  it("adds the requested homonymous hemianopia definition", () => {
    const parts = tokenizeMedicalText("The patient has a left homonymous hemianopia.");
    const term = parts.find((part) => part.term === "homonymous hemianopia");

    expect(term?.definition).toContain("Both eyes miss the same side of the world");
  });

  it("matches terms without changing their displayed capitalization", () => {
    const parts = tokenizeMedicalText("EEG findings can be postictal.");

    expect(parts.filter((part) => part.definition).map((part) => part.text)).toEqual(["EEG", "postictal"]);
  });

  it("prefers a complete phrase over a shorter term inside it", () => {
    const parts = tokenizeMedicalText("Homonymous hemianopia may occur with macular sparing.");

    expect(parts.filter((part) => part.definition).map((part) => part.term)).toEqual([
      "homonymous hemianopia",
      "macular sparing",
    ]);
  });

  it("leaves ordinary text alone", () => {
    expect(tokenizeMedicalText("Choose the best answer.")).toEqual([{ text: "Choose the best answer." }]);
  });

  it("explains the screenshot's abbreviations, including mixed-case and plural labels", () => {
    const text = "IIC ESz ESE PD PDs SW RDA LRDA BIRDA UIRDA MfRDA GRDA Hz";
    const terms = tokenizeMedicalText(text).filter((part) => part.definition);
    expect(terms.map((part) => part.text)).toEqual(text.split(" "));
    expect(terms.every((part) => part.definition.length > 10)).toBe(true);
  });

  it("distinguishes BIRDA location patterns from brief BIRDs", () => {
    const parts = tokenizeMedicalText("BIRDA and BIRDs").filter((part) => part.definition);
    expect(parts[0].definition).toContain("Bilateral independent rhythmic delta activity");
    expect(parts[1].definition).toContain("Brief potentially ictal rhythmic discharges");
  });

  it("explains stimulus prefixes attached to pattern names", () => {
    const parts = tokenizeMedicalText("SI-LPDs and ST-GRDA");
    expect(parts.filter((part) => part.definition).map((part) => part.text)).toEqual(["SI-", "LPDs", "ST-", "GRDA"]);
    expect(parts.map((part) => part.text).join("")).toBe("SI-LPDs and ST-GRDA");
  });

  it("does not match abbreviations inside longer words", () => {
    const text = "PDA software EEGs";
    expect(tokenizeMedicalText(text)).toEqual([{ text }]);
  });

  it("renders an accessible, focusable inline definition", () => {
    const html = renderToStaticMarkup(React.createElement(MedicalText, null, "Left homonymous hemianopia"));

    expect(html).toContain("<dfn");
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("Plain-language definition");
  });
});
