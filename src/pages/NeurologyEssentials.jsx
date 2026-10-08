import React from "react";
import StudyGuidePage from "../components/study/StudyGuidePage.jsx";
import data from "../data/neurologyEssentials.json";

const PRACTICE = {
  text: "Questions on cranial nerves, brain landmarks, blood supply, stroke, clinical signs and neurological disorders are in this app's practice and Challenge questions under Domain I. Start a quiz and choose the neuroanatomy and brain structure topics.",
  links: [
    ["Neuroanatomy & Syndromes: lobes, arteries and EEG generators", "/neuro-syndromes?tab=anatomy"],
    ["Regions and lesions with tracings", "/neuro-syndromes?tab=regions"],
    ["Diffuse abnormalities and encephalopathy", "/diffuse-abnormalities"],
  ],
};

export default function NeurologyEssentials() {
  return <StudyGuidePage data={data} crumb="Neurology Essentials" practice={PRACTICE} />;
}
