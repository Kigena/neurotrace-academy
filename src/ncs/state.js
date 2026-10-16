import { STUDIES } from "./studies.js";

/** Starting state for one study on the NCS bench (deliberately not pre-set). */
export function emptyStudyState(studyId) {
  const study = STUDIES[studyId];
  return {
    setup: { g1: null, g2: null, ground: null, distalCm: 10, cathodeDistal: true, skinPrepped: false, elbowFlexed: false },
    machine: { gain: 1000, sweep: study.limb === "leg" ? 5 : 3, lff: 10, hff: 10000, averages: 1 },
    stimSite: study.distalStim,
    intensity: 10,
    sweeps: {},
  };
}
