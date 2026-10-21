import React from "react";
import StudyGuidePage from "../components/study/StudyGuidePage.jsx";
import data from "../data/neonatalPediatric.json";

const PRACTICE = {
  studySet: "neonatal-pediatric",
  text: "Questions on postmenstrual age, neonatal states and graphoelements, abnormal neonatal patterns and seizures, and infant and child milestones are in this app's practice and Challenge questions under Domain II. Try the Name the age tab first.",
  links: [
    ["Epilepsy syndromes (infantile spasms, LGS, childhood epilepsies)", "/neuro-syndromes"],
    ["ACNS Guidelines and Terminology", "/acns"],
    ["ICU and Continuous EEG (neonatal cooling orders)", "/icu-eeg"],
  ],
};

export default function NeonatalPediatric() {
  return <StudyGuidePage data={data} crumb="Neonatal and Pediatric EEG" practice={PRACTICE} />;
}
