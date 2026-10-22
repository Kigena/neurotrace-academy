/**
 * The guided 10-20 measurement procedure for the skills lab, as data.
 *
 * Task types:
 *  - pick: click a landmark on the head.
 *  - tape: drag a tape from one point to another along the correct route
 *          (`via` is a point the tape must pass near).
 *  - calc: work out a percentage of the last tape measurement.
 *  - mark: place an electrode on the scalp along the current tape.
 * Points are landmark names (nasion, inion, lpa, rpa, vertex) or electrode
 * names, resolved against the model's landmarks and ideal positions.
 */

export const TOLERANCE = { landmark: 1.0, endpoint: 1.5, via: 2.5, good: 1.0, close: 2.0, calc: 0.2 };

const marks = (tape, list, from) => list.map(([electrode, pct]) => ({
  type: "mark", electrode, tape,
  prompt: `Mark ${electrode} at ${pct}% of the ${tape === "midline" ? "nasion-inion" : tape === "coronal" ? "preauricular-to-preauricular" : "half-circumference"} distance from ${from}.`,
}));

export const STEPS = [
  {
    id: "landmarks",
    title: "Find the landmarks",
    intro: "All 10-20 measurements start from four skull landmarks. Rotate the head and click each one.",
    tasks: [
      { type: "pick", target: "nasion", prompt: "Click the nasion: the dip at the bridge of the nose, level with the eyes." },
      { type: "pick", target: "inion", prompt: "Click the inion: the most prominent bony point at the back of the skull, in the midline." },
      { type: "pick", target: "lpa", prompt: "Click the left preauricular point, just in front of the left tragus." },
      { type: "pick", target: "rpa", prompt: "Click the right preauricular point, just in front of the right tragus." },
    ],
  },
  {
    id: "midline",
    title: "Nasion to inion",
    intro: "Measure from nasion to inion over the vertex. Fpz is 10% from the nasion, then Fz, Cz and Pz follow at 20% steps, and Oz sits 10% above the inion. Fpz and Oz are measuring points (Fpz is often used for the ground). Mark each point with a short cross line along the tape.",
    tasks: [
      { type: "tape", id: "midline", from: "nasion", to: "inion", via: "vertex", prompt: "Drag the tape from the nasion, over the top of the head, to the inion." },
      { type: "calc", tape: "midline", fraction: 0.1, prompt: "What is 10% of this distance, in cm?" },
      { type: "calc", tape: "midline", fraction: 0.2, prompt: "And 20%?" },
      ...marks("midline", [["Fpz", 10], ["Fz", 30], ["Cz", 50], ["Pz", 70], ["Oz", 90]], "the nasion"),
    ],
  },
  {
    id: "coronal",
    title: "Preauricular to preauricular",
    intro: "Measure from the left to the right preauricular point through Cz. T3 is 10% up from the left point, C3 a further 20%, Cz at 50% (it should match your first Cz), then C4 at 70% and T4 at 90%. In the 10-10 system T3/T4 are called T7/T8.",
    tasks: [
      { type: "tape", id: "coronal", from: "lpa", to: "rpa", via: "Cz", prompt: "Drag the tape from the left preauricular point, over Cz, to the right preauricular point." },
      { type: "calc", tape: "coronal", fraction: 0.1, prompt: "What is 10% of this distance, in cm?" },
      { type: "calc", tape: "coronal", fraction: 0.2, prompt: "And 20%?" },
      ...marks("coronal", [["T3", 10], ["C3", 30], ["C4", 70], ["T4", 90]], "the left preauricular point"),
    ],
  },
  {
    id: "left",
    title: "Left half-circumference",
    intro: "Measure around the left side of the head from Fpz through T3 to Oz. Fp1 is 10% of this half (5% of the whole circumference) from Fpz; F7, T3 and T5 follow at 20% steps (T3 at 50% should land on the T3 you marked from the coronal tape), and O1 is 10% of the half before Oz. In the 10-10 system T5 is called P7.",
    tasks: [
      { type: "tape", id: "left", from: "Fpz", to: "Oz", via: "T3", prompt: "Drag the tape from Fpz around the LEFT side, through T3, to Oz." },
      { type: "calc", tape: "left", fraction: 0.1, prompt: "What is 10% of this half-circumference, in cm?" },
      { type: "calc", tape: "left", fraction: 0.2, prompt: "And 20%?" },
      ...marks("left", [["Fp1", 10], ["F7", 30], ["T5", 70], ["O1", 90]], "Fpz"),
    ],
  },
  {
    id: "right",
    title: "Right half-circumference",
    intro: "Repeat on the right side, from Fpz through T4 to Oz, for Fp2, F8, T6 (P8) and O2. The two halves should be within about 1 cm of each other.",
    tasks: [
      { type: "tape", id: "right", from: "Fpz", to: "Oz", via: "T4", prompt: "Drag the tape from Fpz around the RIGHT side, through T4, to Oz." },
      ...marks("right", [["Fp2", 10], ["F8", 30], ["T6", 70], ["O2", 90]], "Fpz"),
    ],
  },
  {
    id: "midway",
    title: "F3, F4, P3 and P4",
    intro: "The parasagittal electrodes sit where two midway lines cross: F3 is halfway from Fp1 to C3 and halfway from F7 to Fz; P3 is halfway from C3 to O1 and halfway from T5 to Pz; the right side likewise. Tape both lines and mark the crossing. Ear (A1/A2) and ground electrodes are not part of this exercise.",
    tasks: [
      { type: "tape", id: "f3", from: "Fp1", to: "C3", via: "F3", prompt: "Tape from Fp1 to C3." },
      { type: "tape", id: "f3b", from: "F7", to: "Fz", via: "F3", prompt: "Now tape from F7 to Fz." },
      { type: "mark", electrode: "F3", tape: "f3", tapes: ["f3", "f3b"], prompt: "Mark F3 where the two midpoints (50%) cross." },
      { type: "tape", id: "f4", from: "Fp2", to: "C4", via: "F4", prompt: "Tape from Fp2 to C4." },
      { type: "tape", id: "f4b", from: "F8", to: "Fz", via: "F4", prompt: "Now tape from F8 to Fz." },
      { type: "mark", electrode: "F4", tape: "f4", tapes: ["f4", "f4b"], prompt: "Mark F4 where the two midpoints (50%) cross." },
      { type: "tape", id: "p3", from: "C3", to: "O1", via: "P3", prompt: "Tape from C3 to O1." },
      { type: "tape", id: "p3b", from: "T5", to: "Pz", via: "P3", prompt: "Now tape from T5 to Pz." },
      { type: "mark", electrode: "P3", tape: "p3", tapes: ["p3", "p3b"], prompt: "Mark P3 where the two midpoints (50%) cross." },
      { type: "tape", id: "p4", from: "C4", to: "O2", via: "P4", prompt: "Tape from C4 to O2." },
      { type: "tape", id: "p4b", from: "T6", to: "Pz", via: "P4", prompt: "Now tape from T6 to Pz." },
      { type: "mark", electrode: "P4", tape: "p4", tapes: ["p4", "p4b"], prompt: "Mark P4 where the two midpoints (50%) cross." },
    ],
  },
];

/** Grade a placed electrode by its distance (cm) from the ideal position. */
export function gradeMark(distanceCm) {
  if (distanceCm <= TOLERANCE.good) return "good";
  if (distanceCm <= TOLERANCE.close) return "close";
  return "off";
}

/** Check a calculation answer against the measured length. */
export function checkCalc(answer, length, fraction) {
  const v = Number.parseFloat(String(answer).replace(",", "."));
  return Number.isFinite(v) && Math.abs(v - length * fraction) <= TOLERANCE.calc;
}
