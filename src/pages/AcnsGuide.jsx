import React from "react";
import StudyGuidePage from "../components/study/StudyGuidePage.jsx";
import data from "../data/acnsGuide.json";

const PRACTICE = {
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
