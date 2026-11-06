import React from "react";
import StudyGuidePage from "../components/study/StudyGuidePage.jsx";
import data from "../data/sleepStaging.json";

const PRACTICE = {
  studySet: "sleep-staging",
  text: "This set combines the sleep staging questions with the earlier sleep and neonatal questions. More sleep questions appear in the general Challenge quizzes.",
  links: [
    ["Neonatal and pediatric EEG: neonatal states and maturation", "/neonatal-pediatric"],
    ["Patterns, sleep, drugs and activation", "/patterns-review?tab=sleep"],
    ["Pattern recognition quiz", "/quiz/pattern-recognition"],
  ],
};

export default function SleepStaging() {
  return <StudyGuidePage data={data} crumb="Sleep Staging" practice={PRACTICE} />;
}
