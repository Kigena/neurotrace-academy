import React from "react";
import StudyGuidePage from "../components/study/StudyGuidePage.jsx";
import data from "../data/patternsReview.json";

const PRACTICE = {
  text: "Questions on polarity and measurement, benign variants, sleep, neonatal patterns, medication effects and activation are in this app's practice and Challenge questions under Domain II. Start a quiz and choose the waveform, activation and special protocol topics.",
  links: [
    ["Montages and references", "/montages-references"],
    ["Amplifier controls: sensitivity and filters", "/amplifier-controls"],
    ["Recording guide: activation for the best yield", "/neuro-syndromes?tab=recording"],
  ],
};

export default function PatternsReview() {
  return <StudyGuidePage data={data} crumb="Patterns, Sleep, Drugs and Activation" practice={PRACTICE} />;
}
