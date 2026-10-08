import React from "react";
import StudyGuidePage from "../components/study/StudyGuidePage.jsx";
import data from "../data/labSafety.json";

const PRACTICE = {
  text: "Questions on OSHA, Safety Data Sheets, electrical safety, infection control, fire and emergencies are in this app's practice and Challenge questions under Domain IV. Start a quiz and choose the safety topics.",
  links: [
    ["Recording guide: hyperventilation and photic safety screening", "/neuro-syndromes?tab=recording"],
    ["Amplifier controls and grounding", "/amplifier-controls"],
  ],
};

export default function LabSafety() {
  return <StudyGuidePage data={data} crumb="Lab Safety, OSHA and SDS" practice={PRACTICE} />;
}
