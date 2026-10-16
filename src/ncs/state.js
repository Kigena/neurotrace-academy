import { RECOMMENDED, STUDIES } from "./studies.js";

/** Starting state for one study on the NCS bench: electrodes not placed, machine at this study's defaults. */
export function emptyStudyState(studyId) {
  const study = STUDIES[studyId];
  return {
    setup: { g1: null, g2: null, ground: null, distalCm: 10, cathodeDistal: true, skinPrepped: false, elbowFlexed: false },
    machine: study.type === "motor"
      ? { gain: RECOMMENDED.motor.gain, sweep: study.limb === "leg" ? 5 : 3, lff: 10, hff: 10000, averages: 1 }
      : { gain: RECOMMENDED.sensory.gain, sweep: 1, lff: 20, hff: 2000, averages: 1 },
    stimSite: study.distalStim,
    intensity: 10,
    sweeps: {},
  };
}
