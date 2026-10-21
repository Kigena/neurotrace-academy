import React from "react";
import StudyGuidePage from "../components/study/StudyGuidePage.jsx";
import data from "../data/icuEeg.json";

const PRACTICE = {
  studySet: "icu-eeg",
  text: "Questions on ICU order abbreviations, cEEG indications, stimulation and reactivity, ICU artifacts and quantitative trends are in this app's practice and Challenge questions under Domains I and II. Try the Reactivity lab tab first.",
  links: [
    ["ACNS Guidelines and Terminology (seizure, IIC and status criteria)", "/acns"],
    ["Diffuse abnormalities and coma patterns", "/diffuse-abnormalities"],
    ["Encephalopathy patterns with tracings", "/neuro-syndromes?tab=patterns"],
  ],
};

export default function IcuEeg() {
  return <StudyGuidePage data={data} crumb="ICU and Continuous EEG" practice={PRACTICE} />;
}
