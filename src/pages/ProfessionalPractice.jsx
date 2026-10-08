import React from "react";
import StudyGuidePage from "../components/study/StudyGuidePage.jsx";
import data from "../data/professionalPractice.json";

const PRACTICE = {
  text: "Questions on the ABRET Code of Ethics, HIPAA/HITECH, professional conduct, allergies and skin integrity are in this app's practice and Challenge questions under Domain IV. Start a quiz and choose the ethics and confidentiality topics.",
  links: [
    ["Lab Safety, OSHA and SDS", "/lab-safety"],
    ["Recording guide: safety screening before activation", "/neuro-syndromes?tab=recording"],
  ],
};

export default function ProfessionalPractice() {
  return <StudyGuidePage data={data} crumb="Ethics, HIPAA and Professional Practice" practice={PRACTICE} />;
}
