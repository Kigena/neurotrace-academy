import React from "react";
import StudyGuidePage from "../components/study/StudyGuidePage.jsx";
import TracingPractice from "../components/study/TracingPractice.jsx";
import data from "../data/acnsGuide.json";
import { ACNS_TRACING_QUESTIONS, TRACING_TOPICS } from "../data/acnsTracingPractice.js";

const PRACTICE = {
  lead: (
    <TracingPractice
      title="Tracing practice: seizures, BIRDs and the IIC"
      intro={`${ACNS_TRACING_QUESTIONS.length} questions, each on its own EEG page. Measure with the caliper, count discharges over 10 seconds, and switch to the Cz reference to compare the sides. The explanation appears as soon as you answer.`}
      questions={ACNS_TRACING_QUESTIONS}
      topics={TRACING_TOPICS}
      storageKey="neurolinea.acnsTracingPractice.v1"
    />
  ),
  studySet: "acns",
  text: "Questions on the ACNS Guidelines (exact standards and units) and the ACNS critical care EEG terminology are in this app's practice and Challenge questions under Domains II and III. Use the Name the pattern tab to practise naming tracings first.",
  links: [
    ["Diffuse abnormalities and encephalopathy patterns", "/diffuse-abnormalities"],
    ["Encephalopathy and periodic patterns with tracings", "/neuro-syndromes?tab=patterns"],
    ["Patterns, sleep, drugs and activation", "/patterns-review"],
  ],
};

export default function AcnsGuide() {
  return <StudyGuidePage data={data} crumb="ACNS Guidelines and Terminology" practice={PRACTICE} />;
}
