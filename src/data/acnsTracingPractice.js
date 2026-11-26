// Tracing practice for the ACNS Guidelines and Terminology page (Practice tab):
// seizures and status, BIRDs, and the ictal-interictal continuum, each question
// built on a NeuroLinea synthetic tracing from src/eeg/generator.js.
//
// Original questions written for NeuroLinea (AI-drafted against the ACNS 2021
// critical care EEG terminology as taught on this page; requires expert review).
// In the source, option 0 is correct; options are shuffled deterministically
// below so the answer position is spread evenly and stable between visits.

export const TRACING_TOPICS = [
  { key: "seizure", label: "Seizures and status" },
  { key: "birds", label: "BIRDs" },
  { key: "iic", label: "Ictal-interictal continuum" },
];

// ------------------------------------------------------------ scene helpers

const ICU = { pdrHz: 0, pdrUv: 0, theta: 4, delta: 3.5, beta: 1.5, noise: 2.5 };
const SLOW = { pdrHz: 7, pdrUv: 20, theta: 5, delta: 3, beta: 2, noise: 3 };

function scene(seed, ageYears, findings, extra = {}) {
  return {
    seed,
    ageYears,
    state: "stupor",
    sensitivity: 7,
    montage: "longitudinal",
    montages: ["longitudinal", "referentialCz"],
    background: ICU,
    findings,
    ...extra,
  };
}

const LEFT_C = [-0.62, 0.15];
const RIGHT_C = [0.62, 0.15];

/** Periodic discharges at `hz` (interval 1/hz). */
function pds({ hz, side, center, sigma = 0.36, uv = 140, durMs = 150, shape = "sharp", from, to, firstAt = 0.4, jitterS = 0.03, ...rest }) {
  return {
    type: "periodic",
    intervalS: +(1 / hz).toFixed(3),
    side,
    center: center ?? (side === "left" ? LEFT_C : side === "right" ? RIGHT_C : [0, 0.25]),
    sigma,
    uv,
    durMs,
    shape,
    firstAt,
    jitterS,
    ...(from !== undefined ? { from } : {}),
    ...(to !== undefined ? { to } : {}),
    ...rest,
  };
}

/** Generalized periodic discharges: a mirrored pair keeps them synchronous AND symmetric on both sides. */
const gpds = (hz, extra = {}) => pds({ hz, center: [-0.35, 0.3], sigma: 0.42, mirror: true, diffuse: 0.2, ...extra });

/** Rhythmic delta; `side` confines it to one hemisphere (LRDA). */
function rda({ hz, side, center, sigma = 0.36, uv = 120, runs }) {
  return {
    type: "rhythmicDelta",
    hz,
    uv,
    sigma,
    center: center ?? (side === "left" ? [-0.62, -0.05] : side === "right" ? [0.62, -0.05] : [0, 0.45]),
    ...(side ? { side } : {}),
    ...(runs ? { runs } : {}),
  };
}

/** Rhythmic ictal-type activity: evolving when hzStart differs from hzEnd. */
function rhythmRun({ center, side, start, end, hzStart, hzEnd = hzStart, uvStart = 60, uvEnd = uvStart, sigma = 0.28, rampS = 0.15, spread }) {
  return { type: "ictal", center, side, start, end, hzStart, hzEnd, uvStart, uvEnd, sigma, rampS, ...(spread ? { spread } : {}) };
}

const sharps = (at, center, uv = 120) => ({ type: "sharp", at, center, sigma: 0.22, uv, durMs: 110 });

/** Fast activity riding on each periodic discharge (+F). */
function plusF(times, center, side) {
  return { type: "rhythm", hz: 14, bwHz: 1.5, uv: 120, center, sigma: 0.32, side, rampS: 0.04, runs: times.map((t) => [t - 0.03, t + 0.32]) };
}

const series = (first, interval, until) => {
  const out = [];
  for (let t = first; t < until; t += interval) out.push(+t.toFixed(3));
  return out;
};

// ------------------------------------------------------------ questions

const RAW = [
  // ---------------------------------------------------- seizures and status
  {
    id: "acns-t01",
    topic: "seizure",
    scene: scene(701, 64, [
      rhythmRun({ center: "T3", side: "left", start: 2, end: 14, hzStart: 7, hzEnd: 3.5, uvStart: 25, uvEnd: 110, rampS: 0.6, spread: { center: "C3", delayS: 2.5, k: 0.6, sigma: 0.3 } }),
    ], { seconds: 15, sensitivity: 10 }),
    caption: "15-second page; no clinical change.",
    q: "A 64-year-old after a left MCA stroke is unresponsive. There is no clinical change during this 15-second page. What is the left temporal activity?",
    o: [
      "An electrographic seizure: evolving rhythmic activity lasting at least 10 s",
      "Definite BIRDs, because the rhythm evolves and starts faster than 4 Hz",
      "IIC criterion C: lateralized rhythmic delta with a plus modifier",
      "LPDs, because the activity stays over the left hemisphere",
    ],
    why: "A low-voltage rhythm of about 7 Hz starts at T3 at about 2 s, slows step by step to about 3.5 Hz (evolution in frequency) and spreads into C3 (evolution in location), lasting about 12 s. Any pattern with definite evolution lasting 10 s or more is an electrographic seizure (ESz), at any frequency. BIRDs stop short of 10 s; IIC applies only to patterns that do NOT meet seizure criteria; and these are continuous rhythmic waves, not discharges with a gap between them. No clinical sign is needed: this is a nonconvulsive ESz. The growing amplitude is typical of seizures but is not one of the three evolution categories.",
    rule: "Definite evolution + at least 10 s = ESz, whatever the frequency.",
  },
  {
    id: "acns-t02",
    topic: "seizure",
    scene: scene(702, 70, [gpds(3, { uv: 130, durMs: 120, jitterS: 0.015, firstAt: 0.2 })], { sensitivity: 10 }),
    q: "A 70-year-old after cardiac arrest. These generalized discharges continue unchanged for 2 minutes. Count them on this 10-second page. Which term applies?",
    o: [
      "An electrographic seizure: epileptiform discharges over 2.5 Hz for 10 s or more",
      "GPDs at 3 Hz, IIC criterion A, because the pattern never evolves",
      "Not a seizure, because a seizure needs evolution in frequency or location",
      "BIRDs, because the discharges repeat faster than 2.5 Hz",
    ],
    why: "About 30 discharges in 10 s: 3 Hz. The first ESz criterion is epileptiform discharges averaging more than 2.5 Hz for at least 10 s (more than 25 discharges in 10 s), and it needs no evolution; evolution is the second, separate criterion. IIC criterion A stops at 2.5 Hz. BIRDs must be faster than 4 Hz and shorter than 10 s. At 2 minutes this is an ESz; continuing for 10 minutes would make it ESE.",
    rule: "More than 25 discharges in 10 s = ESz; evolution is not required.",
  },
  {
    id: "acns-t03",
    topic: "seizure",
    scene: scene(703, 58, [rhythmRun({ center: "F4", side: "right", start: 0.3, end: 10.5, hzStart: 5, hzEnd: 3, uvStart: 45, uvEnd: 120, sigma: 0.32, rampS: 0.3 })]),
    q: "The right frontal seizure on this page began 12 minutes ago and is still going. The patient has no visible movements. How is it classified now?",
    o: [
      "Electrographic status epilepticus: 10 continuous minutes reached",
      "An electrographic seizure only, because status needs clinical signs",
      "Electroclinical status epilepticus, because it has lasted over 5 minutes",
      "IIC, because the patient has no clinical correlate",
    ],
    why: "An ESz becomes electrographic status epilepticus (ESE) when it lasts at least 10 continuous minutes, or when seizures add up to at least 20% of any 60-minute period. No clinical sign is required: 'electrographic' means it is defined by the EEG alone. The 5-minute rule belongs to electroclinical status with bilateral tonic-clonic activity. A pattern that meets seizure criteria is never IIC, with or without clinical signs.",
    rule: "ESE: 10 continuous minutes, or 20% of any hour.",
  },
  {
    id: "acns-t04",
    topic: "seizure",
    scene: scene(704, 49, [rhythmRun({ center: "T3", side: "left", start: 2, end: 15.5, hzStart: 6, hzEnd: 3.5, uvStart: 30, uvEnd: 115, rampS: 0.5, spread: { center: "T5", delayS: 2, k: 0.55, sigma: 0.3 } })], { seconds: 15, sensitivity: 10 }),
    caption: "The start of one of the seizures; 15-second page.",
    q: "Over the last hour, seizures like this one each lasted about 40 s and recurred every 3 minutes, with recovery of the background in between. Does the hour meet electrographic status epilepticus?",
    o: [
      "Yes: about 13 minutes of seizure is over 20% of the hour",
      "No: no single seizure lasted 10 minutes",
      "No: recurrent seizures with recovery are ESz, never ESE",
      "Yes, but only if the patient had clinical signs",
    ],
    why: "One seizure every 3 minutes is 20 seizures an hour; 20 × 40 s = 800 s, about 13.3 minutes. 20% of 60 minutes is 12 minutes, so the seizure burden meets ESE even though each seizure is short. The 10-continuous-minute rule and the 20%-of-an-hour rule are alternatives: either one is enough. Clinical signs are not needed for ESE.",
    rule: "20% of an hour = 12 minutes of seizure.",
  },
  {
    id: "acns-t05",
    topic: "seizure",
    scene: scene(705, 77, [rhythmRun({ center: "T4", side: "right", start: 1.5, end: 15.5, hzStart: 6.5, hzEnd: 4, uvStart: 30, uvEnd: 105, rampS: 0.5 })], { seconds: 15, sensitivity: 10 }),
    caption: "The start of one of the seizures; 15-second page.",
    q: "In the last hour there were 10 seizures like this one, each lasting about 50 s, with recovery in between. Does the hour meet electrographic status epilepticus?",
    o: [
      "No: about 8 minutes is under 12 minutes, so these are ESz but not ESE",
      "Yes: ten seizures in one hour is always status epilepticus",
      "Yes: any seizure lasting over 30 s counts as status epilepticus",
      "No: they are IIC, because each one lasts under a minute",
    ],
    why: "10 × 50 s = 500 s, about 8.3 minutes, which is about 14% of the hour. ESE needs 10 continuous minutes or at least 20% of any 60 minutes (12 minutes), so these are repeated electrographic seizures without ESE. Keep counting: the burden is judged over ANY 60-minute window, so it can cross 20% later. Each one evolves and lasts over 10 s, so each is an ESz, not IIC.",
    rule: "Burden = number × duration; compare it with 12 minutes per hour.",
  },
  {
    id: "acns-t06",
    topic: "seizure",
    scene: scene(706, 61, [rhythmRun({ center: "C4", side: "right", start: 3, end: 7, hzStart: 6, hzEnd: 4.5, uvStart: 40, uvEnd: 100, sigma: 0.3 })], {
      annotations: [{ at: 3.3, label: "L face twitching" }],
    }),
    q: "During this 4-second right central rhythm the nurse marks left facial twitching that starts and stops with it. What is it?",
    o: [
      "An electroclinical seizure: a definite time-locked clinical sign, any duration",
      "Definite BIRDs, because it evolves and lasts under 10 s",
      "Not a seizure, because an electrographic seizure must last 10 s",
      "Muscle artifact caused by the facial twitching",
    ],
    why: "An electroclinical seizure (ECSz) is any EEG pattern with a definite clinical correlate time-locked to it, of any duration. The 10-second minimum applies to electrographic seizures, which are defined by the EEG alone. BIRDs, by definition, have no definite clinical correlate, so a time-locked sign moves the event out of BIRDs. Muscle artifact from twitching would be brief high-frequency bursts at the facial and temporal electrodes, not an evolving 6 to 4.5 Hz rhythm over C4 on the side opposite the face twitching.",
    rule: "Definite time-locked clinical sign = ECSz, even if under 10 s.",
  },
  {
    id: "acns-t07",
    topic: "seizure",
    scene: scene(707, 35, [rhythmRun({ center: [0, 0.15], start: 0.3, end: 10.5, hzStart: 9, hzEnd: 6, uvStart: 40, uvEnd: 130, sigma: 0.5, rampS: 0.3 })], { sensitivity: 10 }),
    q: "This generalized seizure is a bilateral tonic-clonic convulsion that is still going. How long must it continue before it meets electroclinical status epilepticus?",
    o: [
      "5 continuous minutes",
      "10 continuous minutes",
      "30 continuous minutes",
      "20% of any 60-minute period only",
    ],
    why: "Electroclinical status epilepticus (ECSE) is an electroclinical seizure lasting at least 10 continuous minutes or at least 20% of any 60 minutes, EXCEPT with bilateral tonic-clonic activity, where 5 continuous minutes is enough. That matches the ILAE t1 time point for convulsive status, when treatment should already be under way. 30 minutes is the old definition and the ILAE t2 point for convulsive status, when long-term harm becomes likely.",
    rule: "Bilateral tonic-clonic: ECSE at 5 minutes. Everything else: 10 minutes or 20% of an hour.",
  },
  {
    id: "acns-t08",
    topic: "seizure",
    scene: scene(708, 52, [rhythmRun({ center: "F3", side: "left", start: 0.3, end: 10.5, hzStart: 4.5, hzEnd: 3, uvStart: 50, uvEnd: 120, sigma: 0.32, rampS: 0.3 })]),
    q: "This left frontal seizure began 7 minutes ago with impaired awareness and right arm jerking, and it is still going. Does it meet electroclinical status epilepticus yet?",
    o: [
      "Not yet: focal ECSE needs 10 continuous minutes",
      "Yes: any electroclinical seizure over 5 minutes is status",
      "Yes: 7 minutes is already over 20% of an hour",
      "No: focal seizures can never be status epilepticus",
    ],
    why: "Without bilateral tonic-clonic activity, ECSE needs 10 continuous minutes, or seizures totalling at least 20% (12 minutes) of any hour. Seven minutes meets neither, although it will at 10 minutes. The 5-minute rule is only for bilateral tonic-clonic convulsions. The ILAE t1 point for focal status with impaired awareness is also 10 minutes. Treatment decisions are the physician's; the definitions keep reports consistent.",
    rule: "Focal ECSE: 10 continuous minutes (or 12 minutes in any hour).",
  },
  {
    id: "acns-t09",
    topic: "seizure",
    scene: scene(709, 58, [pds({ hz: 2, side: "left", uv: 130 })], { background: SLOW }),
    q: "A stuporous 58-year-old has had these left-sided discharges for the past 6 minutes. After IV lorazepam they stop, and within minutes the patient opens their eyes and follows commands. How is the pattern classified now?",
    o: [
      "An electroclinical seizure: EEG and clinical improvement after a parenteral ASM",
      "Possible electroclinical status, because only the EEG can be judged",
      "IIC unchanged, because a response to treatment does not change the name",
      "An electrographic seizure, because the discharges are faster than 2 Hz",
    ],
    why: "These are LPDs at about 2 Hz, which on their own are IIC criterion A. The second ECSz criterion is a pattern that shows BOTH EEG and clinical improvement after a parenteral antiseizure medication, so this pattern is reclassified as an electroclinical seizure. Possible ECSE is the opposite situation: EEG improvement WITHOUT clinical improvement, after at least 10 minutes. The ESz frequency threshold is MORE than 2.5 Hz, so 2 Hz LPDs are not an ESz by rate.",
    rule: "EEG + clinical improvement after IV ASM = ECSz.",
  },
  {
    id: "acns-t10",
    topic: "seizure",
    scene: scene(710, 69, [pds({ hz: 1.5, side: "right", uv: 140, shape: "sharpSlow", durMs: 180 })]),
    q: "These right-sided discharges have been present for 40 minutes. After an IV antiseizure medication the pattern resolves on EEG, but the patient remains comatose with no clinical change. How is it classified?",
    o: [
      "Possible electroclinical status epilepticus",
      "An electroclinical seizure, because the EEG improved",
      "Electrographic status epilepticus, because it lasted over 10 minutes",
      "Not epileptic, because the patient did not improve",
    ],
    why: "LPDs at about 1.5 Hz are IIC criterion A. Possible ECSE is an IIC pattern present for at least 10 continuous minutes or 20% of an hour that improves on EEG with a parenteral antiseizure medication WITHOUT clinical improvement. An ECSz by treatment response needs both EEG and clinical improvement. ESE needs a pattern that meets ESz criteria, and 1.5 Hz LPDs do not. A lack of clinical improvement does not prove the pattern was not ictal (recovery can lag, especially in coma), which is why the term is 'possible'.",
    rule: "EEG better, patient not = possible ECSE.",
  },
  {
    id: "acns-t11",
    topic: "seizure",
    scene: scene(711, 66, [rhythmRun({ center: "T4", side: "right", start: 1.5, end: 15.5, hzStart: 1.8, hzEnd: 3.6, uvStart: 70, uvEnd: 130, sigma: 0.32, rampS: 0.5 })], { seconds: 15, sensitivity: 10 }),
    caption: "15-second page.",
    q: "This right temporal rhythm starts at about 2 Hz and speeds up to about 3.5 Hz over 13 s. Why is it an electrographic seizure even though it starts below 2.5 Hz?",
    o: [
      "Definite evolution lasting at least 10 s is a seizure at any frequency",
      "It is not a seizure: anything that starts below 2.5 Hz is IIC",
      "Rhythmic delta faster than 2 Hz is always a seizure",
      "Any lateralized rhythm is a seizure once it reaches 3 Hz",
    ],
    why: "The frequency rises in steps of at least 0.5 Hz (about 2 → 2.5 → 3 → 3.5 Hz), each step held for at least 3 cycles: two or more consecutive changes in the same direction is definite evolution in frequency. ESz has two separate criteria: epileptiform discharges averaging more than 2.5 Hz for 10 s, OR any pattern with definite evolution lasting at least 10 s. The 2.5 Hz threshold belongs to the first criterion only.",
    rule: "Frequency evolution: two consecutive steps of at least 0.5 Hz in the same direction.",
  },
  {
    id: "acns-t12",
    topic: "seizure",
    scene: scene(712, 45, [rhythmRun({ center: "O1", side: "left", start: 1, end: 15.5, hzStart: 8, hzEnd: 4, uvStart: 30, uvEnd: 100, rampS: 0.5, spread: { center: "P3", delayS: 3, k: 0.6, sigma: 0.3 } })], { seconds: 15, background: SLOW, state: "drowsy" }),
    caption: "15-second page; no clinical change seen on video.",
    q: "A report describes this evolving left occipital event, with no clinical signs on video, as a seizure. Which wording does ACNS 2021 prefer?",
    o: [
      "Nonconvulsive electrographic seizure",
      "Subclinical electrographic seizure",
      "Interictal seizure",
      "Possible seizure (IIC)",
    ],
    why: "'Nonconvulsive' is preferred over 'subclinical', because seizures without obvious signs often have subtle effects (on awareness, vision or behaviour) that bedside observation can miss. It evolves in frequency (8 → 4 Hz) and location (spreading into P3) for over 10 s, so it is a definite ESz, not IIC. 'Interictal' means between seizures.",
    rule: "Say 'nonconvulsive', not 'subclinical'.",
  },
  {
    id: "acns-t13",
    topic: "seizure",
    scene: scene(713, 71, [pds({ hz: 1, side: "left", center: "C3", sigma: 0.3, uv: 150, shape: "sharpSlow", durMs: 170 })], {
      background: SLOW,
      state: "awake",
      annotations: [{ at: 0.75, label: "R hand jerks with each discharge" }],
    }),
    q: "Each of these left central discharges is followed by a right-hand jerk, and this has continued for 30 minutes. How is it classified?",
    o: [
      "Electroclinical status epilepticus (epilepsia partialis continua)",
      "IIC criterion B, because 1 Hz LPDs need a plus modifier",
      "LPDs at 1 Hz with an unrelated movement artifact",
      "Electrographic status, because the discharges are under 2.5 Hz",
    ],
    why: "Any EEG pattern with a definite time-locked clinical correlate is an electroclinical seizure, even 1 Hz LPDs that would otherwise be plain LPDs. Lasting 30 continuous minutes (more than 10) makes it ECSE; continuous focal jerking like this is called epilepsia partialis continua. ESE requires the EEG alone to meet ESz criteria, which 1 Hz LPDs do not. Record video, annotate the jerks and notify the reader per protocol.",
    rule: "Time-locked jerks turn even slow LPDs into an electroclinical seizure.",
  },

  // ---------------------------------------------------- BIRDs
  {
    id: "acns-t14",
    topic: "birds",
    scene: scene(714, 55, [rhythmRun({ center: "T3", side: "left", start: 4, end: 6, hzStart: 6, uvStart: 75, sigma: 0.24 })]),
    q: "A comatose 55-year-old with no seizures or discharges seen so far. This left temporal run has no clinical change. What is it?",
    o: [
      "Possible BIRDs: sharply contoured, with no evolution and no match",
      "Definite BIRDs, because any run faster than 4 Hz is definite",
      "An electrographic seizure, because it is faster than 2.5 Hz",
      "LRDA, because it stays over the left temporal chain",
    ],
    why: "BIRDs: rhythmic activity faster than 4 Hz, at least 6 waves at a regular rate, lasting 0.5 s to under 10 s, not a normal pattern or benign variant, not part of burst suppression, and with no definite clinical correlate. This run is about 6 Hz for about 2 s (about 12 waves), sharply contoured, with no evolution and nothing in this patient to match it to, so it is POSSIBLE BIRDs. An ESz needs at least 10 s. Rhythmic delta is 4 Hz or slower.",
    rule: "Sharp, brief, over 4 Hz, nothing else = possible BIRDs.",
  },
  {
    id: "acns-t15",
    topic: "birds",
    scene: scene(715, 55, [rhythmRun({ center: "T3", side: "left", start: 5, end: 7, hzStart: 6, uvStart: 75, sigma: 0.24 })]),
    q: "Earlier today this patient had seizures that began at T3 and T5 with the same sharp 6 Hz rhythm. Now this 2-second run appears, with no clinical change. What is it?",
    o: [
      "Definite BIRDs: it matches the patient's own seizures",
      "Possible BIRDs, because the run does not evolve",
      "An electrographic seizure, because it matches a seizure",
      "A benign variant, because it is brief and unchanging",
    ],
    why: "A match in morphology and location to the patient's own interictal discharges or seizures makes BIRDs DEFINITE, even without evolution. It is still BIRDs, not a seizure, because it lasts under 10 s and has no clinical correlate. Without the earlier seizures to compare with, the same run would be possible BIRDs.",
    rule: "Definite BIRDs: evolution, or a match to the patient's own discharges or seizures.",
  },
  {
    id: "acns-t16",
    topic: "birds",
    scene: scene(716, 62, [rhythmRun({ center: "F8", side: "right", start: 3, end: 8, hzStart: 8, hzEnd: 5, uvStart: 30, uvEnd: 95, sigma: 0.26 })]),
    q: "This right frontotemporal run has no clinical change. What is it?",
    o: [
      "Definite BIRDs (evolving BIRDs)",
      "An electrographic seizure, because it evolves",
      "Possible BIRDs, because it is under 10 s",
      "Right-sided IIC, criterion C",
    ],
    why: "It slows from about 8 Hz to about 5 Hz (evolution in frequency), stays faster than 4 Hz, and lasts about 5 s. Evolution makes BIRDs definite ('evolving BIRDs'). The same evolving rhythm lasting 10 s or more would be an electrographic seizure. IIC criterion C is for rhythmic DELTA (4 Hz or slower).",
    rule: "Evolving and under 10 s = evolving BIRDs; 10 s or more = ESz.",
  },
  {
    id: "acns-t17",
    topic: "birds",
    scene: scene(717, 59, [rhythmRun({ center: "T3", side: "left", start: 4, end: 4.4, hzStart: 7, uvStart: 85, sigma: 0.24, rampS: 0.04 })]),
    q: "This left temporal burst is sharply contoured at about 7 Hz. Use the caliper. Does it qualify as BIRDs?",
    o: [
      "No: it lasts under 0.5 s and has fewer than 6 waves",
      "Yes: any sharp run faster than 4 Hz is BIRDs",
      "Yes: it is possible BIRDs, because it does not evolve",
      "No: BIRDs must be slower than 4 Hz",
    ],
    why: "The burst lasts about 0.4 s and contains about 3 waves. BIRDs need at least 6 waves at a regular rate AND a duration of at least 0.5 s. Describe what it is (a brief sharply contoured burst) without calling it BIRDs. BIRDs are FASTER than 4 Hz; 4 Hz or slower would be rhythmic delta.",
    rule: "BIRDs minimum: 6 waves and 0.5 s.",
  },
  {
    id: "acns-t18",
    topic: "birds",
    scene: scene(718, 68, [rhythmRun({ center: "F3", side: "left", start: 3, end: 6, hzStart: 3, uvStart: 110, sigma: 0.3, rampS: 0.2 })]),
    q: "This left frontal run is sharply contoured at about 3 Hz, lasts about 3 s and does not evolve. Is it BIRDs?",
    o: [
      "No: BIRDs must be faster than 4 Hz; this is very brief LRDA",
      "Yes: possible BIRDs, sharply contoured and under 10 s",
      "Yes: definite BIRDs, because it is sharply contoured",
      "No: it is a seizure, because it is faster than 2.5 Hz",
    ],
    why: "BIRDs are faster than 4 Hz. A 3 Hz run of 9 waves is rhythmic delta (0.5 to 4 Hz, at least 6 cycles) on one side: very brief LRDA. ACNS allows frequencies of 3, 3.5 and 4 Hz for RDA, PDs and SW only when the pattern is very brief, since longer runs of epileptiform discharges over 2.5 Hz would be seizures. The ESz rate criterion needs at least 10 s, and this lasts 3 s.",
    rule: "4 Hz or slower: not BIRDs.",
  },
  {
    id: "acns-t19",
    topic: "birds",
    scene: scene(719, 47, [{ type: "burst", runs: [[1.5, 3], [6.4, 7.8]], uv: 150 }], { state: "semicomatose", background: { pdrHz: 0, pdrUv: 0, theta: 0.5, delta: 0, beta: 0.5, noise: 2 }, sensitivity: 10 }),
    q: "A patient on a propofol infusion. The bursts on this page contain sharply contoured activity faster than 4 Hz lasting 1 to 2 s. Are these BIRDs?",
    o: [
      "No: activity within burst suppression is excluded from BIRDs",
      "Yes: possible BIRDs, sharply contoured runs under 10 s",
      "Yes: definite BIRDs, because they repeat",
      "No: they are seizures, because they recur",
    ],
    why: "BIRDs exclude activity that is part of a burst-suppression or burst-attenuation pattern. These are bursts separated by suppression in a sedated patient: describe the pattern as burst suppression (with the percentage of suppression), and note sharply contoured or epileptiform bursts if present. The reader decides whether bursts are 'highly epileptiform'.",
    rule: "Burst suppression is not BIRDs.",
  },
  {
    id: "acns-t20",
    topic: "birds",
    scene: scene(720, 34, [{ type: "temporalTheta", at: [3.5], hz: 5.5, durS: 3, sides: ["left"], uv: 70 }], { state: "drowsy", background: { pdrHz: 8.5, pdrUv: 15, theta: 6, delta: 2, beta: 4, noise: 4 } }),
    q: "A 34-year-old, drowsy. This 3-second left mid-temporal run of 5 to 6 Hz theta appears only in drowsiness and does not evolve. What is the best interpretation?",
    o: [
      "A benign variant (rhythmic mid-temporal theta of drowsiness), not BIRDs",
      "Possible BIRDs, sharply contoured and faster than 4 Hz",
      "Definite BIRDs, because it is temporal like most seizures",
      "An electrographic seizure arising from the left temporal lobe",
    ],
    why: "Rhythmic mid-temporal theta of drowsiness (RMTD, formerly 'psychomotor variant') is a run of 5 to 7 Hz theta, often notched, over the mid-temporal region, appearing in drowsiness and not evolving. BIRDs explicitly exclude known normal patterns and benign variants, so check the patient's state and the morphology before calling BIRDs. It is under 10 s and does not evolve, so it is not a seizure either.",
    rule: "Rule out normal patterns and benign variants before calling BIRDs.",
  },
  {
    id: "acns-t21",
    topic: "birds",
    scene: scene(721, 60, [{ type: "rhythm", hz: 5, bwHz: 0.15, uv: 180, center: "T4", sigma: 0.26, side: "right", runs: [[3, 5]], rampS: 0.15 }]),
    q: "This right temporal run is smooth and sinusoidal at about 5 Hz, lasts 2 s and does not evolve. The patient has no known discharges or seizures. Is it BIRDs?",
    o: [
      "No: it has no evolution, no match and no sharp contour",
      "Yes: possible BIRDs, because it is faster than 4 Hz",
      "Yes: definite BIRDs, because it is lateralized",
      "No: BIRDs must last at least 10 s",
    ],
    why: "Besides the rate (over 4 Hz) and duration (0.5 s to under 10 s) rules, BIRDs need at least one of: evolution, the same morphology and location as the patient's own discharges or seizures, or sharp contour (which on its own gives possible BIRDs). A blunt, non-evolving run with nothing to match is not BIRDs; describe it as a brief run of theta. BIRDs last UNDER 10 s.",
    rule: "BIRDs need evolution, a match, or sharp contour.",
  },
  {
    id: "acns-t22",
    topic: "birds",
    scene: scene(722, 73, [rhythmRun({ center: [0, 0.2], start: 4, end: 5.5, hzStart: 5, uvStart: 110, sigma: 0.45 })]),
    q: "This 1.5-second generalized run is sharply contoured at about 5 Hz, in a comatose patient with no clinical change and no earlier discharges. Can BIRDs be generalized?",
    o: [
      "Yes: BIRDs can be focal or generalized; this is possible BIRDs",
      "No: BIRDs must be focal, so this is GRDA",
      "No: a generalized run like this is an absence seizure",
      "No: generalized runs are always part of burst suppression",
    ],
    why: "BIRDs can be focal (lateralized, bilateral independent, unilateral independent or multifocal) or generalized. This run is over 4 Hz, about 7 waves, 1.5 s long and sharply contoured, without evolution or a match: possible BIRDs. GRDA is 4 Hz or slower. An absence seizure has a clinical correlate (and typically 3 Hz spike-and-wave), and this background is continuous, so it is not burst suppression.",
    rule: "BIRDs can be L, BI, UI, Mf or generalized.",
  },
  {
    id: "acns-t23",
    topic: "birds",
    scene: scene(723, 66, [rhythmRun({ center: "T5", side: "left", start: 5, end: 6, hzStart: 7, uvStart: 75, sigma: 0.24, rampS: 0.08 })]),
    q: "Use the caliper on this left posterior temporal run. How long is it, and does it meet the BIRDs duration and wave-count rules?",
    o: [
      "About 1 s with about 7 waves: it meets both rules",
      "About 1 s: too short, because BIRDs need at least 2 s",
      "About 3 s: too long, because BIRDs must be under 2 s",
      "About 1 s with about 7 waves: too few, BIRDs need 10",
    ],
    why: "The run spans about 1 s at about 7 Hz, so about 7 waves. BIRDs last from 0.5 s to under 10 s and contain at least 6 waves at a regular rate, so this meets both rules. Sharply contoured, without evolution or a match, it is possible BIRDs.",
    rule: "BIRDs: 0.5 s to under 10 s, and at least 6 waves.",
  },
  {
    id: "acns-t24",
    topic: "birds",
    scene: scene(724, 57, [
      rhythmRun({ center: "T4", side: "right", start: 2, end: 4.5, hzStart: 7, hzEnd: 5, uvStart: 35, uvEnd: 90, sigma: 0.25 }),
      rhythmRun({ center: "T4", side: "right", start: 7.5, end: 9.5, hzStart: 7, hzEnd: 5.5, uvStart: 35, uvEnd: 85, sigma: 0.25 }),
    ]),
    q: "You see several runs like these in the first hour of cEEG, with no clinical change. What should you do?",
    o: [
      "Annotate each run and notify the reader per protocol",
      "Ignore them: runs under 10 s never matter clinically",
      "Raise the low-frequency filter to 5 Hz to remove them",
      "Stop the study: these runs mean the electrodes are failing",
    ],
    why: "These are evolving BIRDs (brief potentially ictal rhythmic discharges). BIRDs are associated with a higher risk of seizures and can be the first sign of seizure risk in a patient. Mark each run so the reader can find it, keep recording, and notify the physician per your facility's protocol. Never filter away real cerebral activity.",
    rule: "BIRDs: annotate, keep recording, notify per protocol.",
  },
  {
    id: "acns-t25",
    topic: "birds",
    scene: scene(725, 63, [rhythmRun({ center: "T3", side: "left", start: 2, end: 8, hzStart: 1.5, hzEnd: 3, uvStart: 90, uvEnd: 140, sigma: 0.3, rampS: 0.3 })]),
    q: "This left temporal rhythm speeds up from about 1.5 Hz to about 3 Hz and stops after about 6 s. What is it?",
    o: [
      "An evolving rhythmic pattern under 10 s: neither an ESz nor BIRDs",
      "Definite BIRDs, because it evolves and lasts under 10 s",
      "An electrographic seizure, because it shows definite evolution",
      "IIC criterion A, because the rhythm averages over 1 Hz",
    ],
    why: "Evolution makes a seizure only when it lasts at least 10 s. BIRDs must be faster than 4 Hz. On the 10-second line: under 10 s it is BIRDs (if faster than 4 Hz) or an evolving rhythmic or periodic pattern; describe this one as very brief evolving LRDA. IIC criterion A applies to PDs and SW, not to rhythmic delta.",
    rule: "Evolving, under 10 s and 4 Hz or slower: an evolving RPP, not BIRDs.",
  },

  // ---------------------------------------------------- ictal-interictal continuum
  {
    id: "acns-t26",
    topic: "iic",
    scene: scene(726, 74, [pds({ hz: 2, side: "left", uv: 130 })]),
    q: "These left-sided discharges continue unchanged for 30 minutes in a stuporous patient. Count them over 10 s. How are they classified?",
    o: [
      "LPDs at 2 Hz: IIC criterion A (over 1 and up to 2.5 Hz)",
      "An electrographic seizure, because they are periodic and lateralized",
      "LPDs at 2 Hz, not IIC, because there is no plus modifier",
      "Electrographic status epilepticus, because they last 30 minutes",
    ],
    why: "About 20 discharges in 10 s: 2 Hz. Criterion A is any PDs or SW averaging more than 1 and up to 2.5 Hz over 10 s, and it needs no plus modifier (plus modifiers or fluctuation are needed only at 0.5 to 1 Hz, criterion B). An ESz needs more than 2.5 Hz or definite evolution, so neither ESz nor ESE applies, however long the pattern lasts.",
    rule: "Criterion A: PDs or SW over 1 and up to 2.5 Hz; no plus needed.",
  },
  {
    id: "acns-t27",
    topic: "iic",
    scene: scene(727, 66, [{ type: "triphasic", at: series(0.45, 0.6, 10), uv: 170, durMs: 380 }], { sensitivity: 7 }),
    q: "A 66-year-old in hepatic failure. These blunt, frontally predominant discharges with three phases fill the record. How are they classified?",
    o: [
      "GPDs with triphasic morphology at about 1.7 Hz: IIC criterion A",
      "Triphasic waves, a metabolic pattern that cannot be IIC",
      "GRDA at about 2 Hz, because the waves are blunt",
      "An electrographic seizure, because they are generalized",
    ],
    why: "'Triphasic waves' is no longer a pattern name: ACNS 2021 calls them GPDs (or SW) with triphasic morphology. About 17 in 10 s is about 1.7 Hz. Criterion A is defined by the EEG, not the cause, so GPDs averaging over 1 and up to 2.5 Hz are IIC whatever the clinical story; the reader then interprets them with the context (metabolic encephalopathy or nonconvulsive seizures). Each complex is separate, so they are periodic, not rhythmic delta.",
    rule: "Triphasic = a morphology of GPDs; the IIC rate rules still apply.",
  },
  {
    id: "acns-t28",
    topic: "iic",
    scene: scene(728, 69, [pds({ hz: 0.8, side: "left", uv: 150, shape: "sharpSlow", durMs: 190 })], { background: SLOW, state: "awake" }),
    q: "These left-sided discharges recur about every 1.25 s, with no superimposed fast or rhythmic activity and no fluctuation. Are they IIC?",
    o: [
      "No: LPDs at 0.8 Hz need a plus modifier or fluctuation",
      "Yes: all LPDs are IIC criterion A",
      "Yes: criterion B, because they are under 1 Hz",
      "No: they are an electrographic seizure",
    ],
    why: "Every 1.25 s is 0.8 Hz. Criterion B covers PDs or SW at 0.5 to 1 Hz only WITH a plus modifier or fluctuation. Without them, report them as LPDs with their modifiers (frequency, prevalence, sharpness, phases, amplitude). LPDs are still important to report, because they are associated with seizures.",
    rule: "0.5 to 1 Hz PDs: IIC only with a plus modifier or fluctuation.",
  },
  (() => {
    const times = series(0.5, 1.3, 10);
    return {
      id: "acns-t29",
      topic: "iic",
      scene: scene(729, 71, [pds({ hz: 1 / 1.3, side: "left", uv: 140, shape: "sharpSlow", durMs: 180, jitterS: 0 }), plusF(times, LEFT_C, "left")]),
      q: "These left discharges recur about every 1.3 s. Look at what rides on each discharge. How are they classified?",
      o: [
        "LPDs+F at about 0.8 Hz: IIC criterion B",
        "LPDs at 0.8 Hz: not IIC, because they are under 1 Hz",
        "LPDs+R at about 0.8 Hz: IIC criterion A",
        "An electrographic seizure, because fast activity is ictal",
      ],
      why: "About 8 discharges in 10 s, so about 0.8 Hz. Each discharge carries a short burst of low-voltage fast (beta) activity that belongs to the discharge, not the background: +F. Criterion B is PDs or SW at 0.5 to 1 Hz WITH a plus modifier or fluctuation, so this is IIC. +R would be superimposed rhythmic delta, and criterion A is for rates over 1 Hz.",
      rule: "+F = fast activity riding on the discharges.",
    };
  })(),
  {
    id: "acns-t30",
    topic: "iic",
    scene: scene(730, 64, [pds({ hz: 0.7, side: "left", uv: 150, shape: "sharpSlow", durMs: 180 }), rda({ hz: 2, side: "left", uv: 55, center: [-0.62, 0.05] })]),
    q: "Left-sided discharges recur about every 1.4 s, with continuous rhythmic slow waves over the same region between them. How are they classified?",
    o: [
      "LPDs+R at about 0.7 Hz: IIC criterion B",
      "LRDA at 2 Hz without a plus modifier: not IIC",
      "LPDs+S at about 0.7 Hz: IIC criterion B",
      "BIPDs, because two patterns are present",
    ],
    why: "Discharges about every 1.4 s are about 0.7 Hz. Superimposed rhythmic (or quasi-rhythmic) delta is +R, a plus modifier used for PDs only; +S (sharp waves) is used for RDA only. PDs at 0.5 to 1 Hz with a plus modifier meet criterion B. BIPDs means independent PDs over BOTH hemispheres; here everything is on the left.",
    rule: "+R for PDs; +S for RDA; +F for both.",
  },
  {
    id: "acns-t31",
    topic: "iic",
    scene: scene(731, 58, [rda({ hz: 1.5, side: "left", uv: 130 }), sharps([2.2, 5.6, 8.4], "T3", 130)]),
    q: "Continuous left-sided rhythmic delta at about 1.5 Hz, with sharp waves mixed in, for 20 minutes. How is it classified?",
    o: [
      "LRDA+S at about 1.5 Hz: IIC criterion C",
      "LRDA at 1.5 Hz: not IIC, because RDA is never IIC",
      "LPDs at 1.5 Hz: IIC criterion A",
      "GRDA+S at 1.5 Hz: IIC criterion C",
    ],
    why: "No gap between the waves makes it RDA, not PDs, and it is confined to the left: LRDA. Sharp waves at least once every 10 s that are not a spike-and-wave pattern give +S. Criterion C is lateralized RDA (LRDA, BIRDA, UIRDA or MfRDA) averaging more than 1 Hz for at least 10 s, with a plus modifier or fluctuation. GRDA is excluded from criterion C.",
    rule: "Criterion C: lateralized RDA over 1 Hz + plus or fluctuation.",
  },
  {
    id: "acns-t32",
    topic: "iic",
    scene: scene(732, 60, [rda({ hz: 1.5, side: "left", uv: 120 })]),
    q: "Continuous left-sided rhythmic delta at about 1.5 Hz with no sharp waves, no superimposed fast activity and no fluctuation. Is it IIC?",
    o: [
      "No: LRDA needs a plus modifier or fluctuation to be IIC",
      "Yes: criterion C, because it averages over 1 Hz",
      "Yes: criterion A, because it averages over 1 Hz",
      "No: LRDA can never be part of the IIC at any rate",
    ],
    why: "Criterion C needs lateralized RDA over 1 Hz AND a plus modifier or fluctuation. Criterion A covers only PDs and SW. Plain LRDA is still important: like LPDs, it is associated with seizures, so report it with its prevalence, duration and frequency.",
    rule: "Plain LRDA is reported, but it is not IIC.",
  },
  {
    id: "acns-t33",
    topic: "iic",
    scene: scene(733, 79, [rda({ hz: 2, center: [0, 0.5], sigma: 0.6, uv: 115 }), sharps([2.5, 6.1], [0, 0.45], 110)]),
    q: "Frontally predominant rhythmic delta at about 2 Hz, synchronous and symmetric over both sides, with occasional sharp waves. Is it IIC?",
    o: [
      "No: GRDA is excluded from criterion C, even with +S",
      "Yes: GRDA+S over 1 Hz meets criterion C",
      "Yes: GRDA+S meets criterion A",
      "No: GRDA+S is always an electrographic seizure",
    ],
    why: "Bilateral, synchronous and symmetric means generalized: GRDA+S, frontally predominant, about 2 Hz. Criterion C lists only the lateralized forms (LRDA, BIRDA, UIRDA, MfRDA); GRDA is excluded even with a plus modifier. Criterion A is for PDs and SW. Name it fully, for example 'frontally predominant GRDA+S, 2 Hz', with its prevalence and duration.",
    rule: "GRDA is never IIC criterion C.",
  },
  {
    id: "acns-t34",
    topic: "iic",
    scene: scene(734, 67, [rda({ hz: 0.8, side: "left", uv: 150 }), sharps([1.8, 6.6], "T3", 130)]),
    q: "Left-sided rhythmic delta at about 0.8 Hz with sharp waves mixed in, continuous for 30 minutes. Is it IIC?",
    o: [
      "No: criterion C needs RDA averaging more than 1 Hz",
      "Yes: criterion C, because +S is present",
      "Yes: criterion B, because it is 0.5 to 1 Hz with +S",
      "No: rhythmic delta cannot have a plus modifier",
    ],
    why: "Criterion B (0.5 to 1 Hz with a plus modifier or fluctuation) applies only to PDs and SW. For RDA, criterion C requires a rate of more than 1 Hz. So LRDA+S at 0.8 Hz is described and reported, but it is not IIC. RDA can carry +F or +S.",
    rule: "RDA: over 1 Hz for criterion C; the 0.5 to 1 Hz band is for PDs and SW only.",
  },
  {
    id: "acns-t35",
    topic: "iic",
    scene: scene(735, 41, [{ type: "gsw", from: 0.2, to: 10.6, startHz: 2, hz: 2, uv: 220, label: "" }]),
    q: "These generalized spike-and-slow-wave complexes follow each other with no gap, at about 2 Hz, for 30 minutes. The neurological exam is unchanged. How are they classified?",
    o: [
      "GSW at about 2 Hz: IIC criterion A",
      "An electrographic seizure, because spike-and-wave is always ictal",
      "GPDs at 2 Hz, because the complexes repeat",
      "Not IIC, because spike-and-wave is excluded from criterion A",
    ],
    why: "SW is a spike, polyspike or sharp wave consistently followed by a slow wave, repeating with no interval between complexes (with an interval it would be PDs). Criterion A includes SW averaging over 1 and up to 2.5 Hz. At more than 2.5 Hz for 10 s or more (for example 3 Hz GSW) it would be an electrographic seizure.",
    rule: "SW and PDs share the IIC rate rules.",
  },
  {
    id: "acns-t36",
    topic: "iic",
    scene: scene(736, 38, [{ type: "gsw", from: 0.3, to: 11, startHz: 3.2, hz: 3, uv: 240, label: "" }]),
    q: "These generalized spike-and-wave complexes at about 3 Hz continue for 2 minutes in a stuporous patient. How are they classified?",
    o: [
      "An electrographic seizure: SW over 2.5 Hz for 10 s or more",
      "IIC criterion A, because spike-and-wave is always IIC",
      "BIRDs, because the rhythm is generalized and fast",
      "GPDs at 3 Hz, because there is a gap between complexes",
    ],
    why: "About 30 complexes in 10 s, so about 3 Hz. Epileptiform discharges (including SW) averaging more than 2.5 Hz for at least 10 s meet the first ESz criterion. IIC criterion A stops at 2.5 Hz. BIRDs are under 10 s and faster than 4 Hz. Each spike is followed by its slow wave with no gap, so it is SW, not PDs.",
    rule: "SW over 2.5 Hz for 10 s = ESz.",
  },
  {
    id: "acns-t37",
    topic: "iic",
    scene: scene(737, 72, [pds({ hz: 2.5, side: "left", uv: 120, durMs: 110, firstAt: 0.2, jitterS: 0.01 })]),
    q: "You count exactly 25 left-sided discharges on this 10-second page, unchanged for 20 minutes. How are they classified?",
    o: [
      "IIC criterion A: up to 2.5 Hz (25 in 10 s) is still IIC",
      "An electrographic seizure: 25 in 10 s is over 2.5 Hz",
      "Electrographic status, because the pattern lasts 20 minutes",
      "LPDs only, because there is no plus modifier",
    ],
    why: "Criterion A runs from more than 1.0 up to AND INCLUDING 2.5 Hz: more than 10 and up to 25 discharges in 10 s. The ESz threshold is MORE than 2.5 Hz (more than 25 in 10 s, so 26 or more). At the boundary, count carefully and check several 10-second windows. Without an ESz there is no ESE, however long the pattern lasts.",
    rule: "25 in 10 s = IIC; 26 or more = ESz.",
  },
  {
    id: "acns-t38",
    topic: "iic",
    scene: scene(738, 76, [pds({ hz: 1.8, side: "left", uv: 130, from: 3.3 })], { annotations: [{ at: 3, label: "Sternal rub" }] }),
    q: "These left-sided discharges start after a sternal rub, and repeated stimulation reproducibly brings them back. How are they named and classified?",
    o: [
      "SI-LPDs at about 1.8 Hz: still IIC criterion A",
      "ST-LPDs, because the stimulus changes the pattern",
      "Artifact from the sternal rub, so they are not reported",
      "SI-LPDs, which cannot be IIC because they are stimulus-induced",
    ],
    why: "A pattern reproducibly brought on (or made worse) by an alerting stimulus takes the SI- prefix. The prefix does not remove IIC status: SI-LPDs at about 1.8 Hz still meet criterion A. ST- (stimulus-terminated) is the opposite: reproducibly stopped or attenuated. Rub artifact would occur during the rub itself, not as a train of sharp discharges continuing afterwards. Always annotate each stimulus so the reader can judge the effect.",
    rule: "SI- = brought on or made worse; ST- = stopped or reduced.",
  },
  {
    id: "acns-t39",
    topic: "iic",
    scene: scene(739, 68, [pds({ hz: 1.5, side: "left", uv: 130, to: 4.1 })], { annotations: [{ at: 3.9, label: "Name called loudly" }] }),
    q: "Calling the patient's name loudly reproducibly stops these left-sided discharges for several seconds. How is that effect coded?",
    o: [
      "ST- (stimulus-terminated): ST-LPDs",
      "SI- (stimulus-induced): SI-LPDs",
      "Fluctuating LPDs, because the pattern changes",
      "No modifier, because stimulus effects are not coded",
    ],
    why: "ST- (new in 2021) marks a pattern that is reproducibly terminated or attenuated by an alerting stimulus. SI- is the opposite: brought on or made worse. Fluctuation refers to spontaneous changes in frequency, morphology or location. One coincidence is not enough: the effect must be reproducible, so mark every stimulus.",
    rule: "Stimulus stops it reproducibly = ST-.",
  },
  {
    id: "acns-t40",
    topic: "iic",
    scene: scene(740, 70, [
      pds({ hz: 0.625, side: "left", uv: 140, shape: "sharpSlow", durMs: 180, from: 0, to: 5 }),
      pds({ hz: 1.25, side: "left", uv: 140, shape: "sharpSlow", durMs: 180, from: 5, to: 10, firstAt: 0.3 }),
      pds({ hz: 0.625, side: "left", uv: 140, shape: "sharpSlow", durMs: 180, from: 10, to: 15, firstAt: 0.3 }),
      pds({ hz: 1.25, side: "left", uv: 140, shape: "sharpSlow", durMs: 180, from: 15, to: 20, firstAt: 0.3 }),
    ], { seconds: 20 }),
    caption: "20-second page.",
    q: "Over this 20-second page the left discharges switch between about 0.6 Hz and about 1.2 Hz three times, averaging about 0.9 Hz. How are they classified?",
    o: [
      "Fluctuating LPDs at 0.5 to 1 Hz: IIC criterion B",
      "Evolving LPDs: an electrographic seizure",
      "LPDs under 1 Hz: not IIC without a plus modifier",
      "IIC criterion A, because they reach 1.2 Hz",
    ],
    why: "Fluctuation is three or more changes, no more than 1 minute apart, in frequency (by at least 0.5 Hz), morphology or location, that do not meet evolution. Evolution needs two consecutive changes in the SAME direction (for example 0.6 → 1.2 → 1.8 Hz); back-and-forth change is fluctuation. Criterion B accepts fluctuation in place of a plus modifier. Criterion A uses the AVERAGE over 10 s (about 0.9 Hz here), not the fastest stretch.",
    rule: "Back and forth = fluctuating; one direction, step by step = evolving.",
  },
  {
    id: "acns-t41",
    topic: "iic",
    scene: scene(741, 62, [
      pds({ hz: 1.25, side: "left", center: [-0.62, 0.2], sigma: 0.33, uv: 130 }),
      pds({ hz: 1.55, side: "right", center: [0.62, -0.15], sigma: 0.33, uv: 120, firstAt: 0.15 }),
    ]),
    q: "Discharges appear over each hemisphere at different rates and are not time-locked to each other. What is the name, and is it IIC?",
    o: [
      "BIPDs, each side averaging over 1 Hz: IIC criterion A",
      "GPDs at about 1.4 Hz: IIC criterion A",
      "BIRDs, because they are bilateral and independent",
      "Right-sided LPDs only: IIC criterion A",
    ],
    why: "BI (bilateral independent) means two independent lateralized patterns, one in each hemisphere, at the same time: BIPDs. GPDs would be synchronous and symmetric. BIRDs is a different term: brief potentially ictal rhythmic discharges. Criterion A applies to PDs in any location averaging over 1 and up to 2.5 Hz; here about 1.25 Hz on the left and 1.5 Hz on the right.",
    rule: "BI = independent on both sides; G = synchronous and symmetric.",
  },
  {
    id: "acns-t42",
    topic: "iic",
    scene: scene(742, 66, [
      rda({ hz: 1.4, side: "left", center: [-0.6, 0.3], uv: 115 }),
      rda({ hz: 2, side: "right", center: [0.6, -0.3], uv: 100 }),
      sharps([3.1], "F7", 120),
      sharps([7.4], "T6", 120),
    ]),
    q: "Independent rhythmic delta runs over each hemisphere at different rates, with occasional sharp waves. Which name fits, and is it IIC?",
    o: [
      "BIRDA+S, each side over 1 Hz: IIC criterion C",
      "BIRDs: brief potentially ictal rhythmic discharges",
      "GRDA+S, which is excluded from criterion C",
      "BIPDs: IIC criterion A",
    ],
    why: "BIRDA is bilateral independent rhythmic delta activity, about 1.4 Hz on the left and 2 Hz on the right. It looks like 'BIRDs' but names a location; BIRDs are brief runs (under 10 s) faster than 4 Hz. BIRDA is one of the lateralized forms eligible for criterion C, so over 1 Hz with +S it is IIC. It is not GRDA (not synchronous) and not BIPDs (no gap between waves).",
    rule: "BIRDA is a location; BIRDs are brief runs.",
  },
  {
    id: "acns-t43",
    topic: "iic",
    scene: scene(743, 75, [pds({ hz: 2, side: "right", uv: 130 })]),
    q: "You find this pattern at the start of a new ICU recording. Besides annotating it, which step most helps the reader apply the ACNS 2021 terms?",
    o: [
      "Test and annotate alerting stimuli to show any SI- or ST- effect",
      "Switch to a 5 Hz low-frequency filter for the rest of the study",
      "Shorten the recording, because IIC patterns are not seizures",
      "Lower the sensitivity until the discharges are no longer seen",
    ],
    why: "Stimulus effects (SI- and ST-) are part of the ACNS name, and only the technologist can supply them, by testing reactivity with standard stimuli and annotating each one. Also annotate medication doses and times (for example IV lorazepam), so the reader can judge EEG and clinical response (ECSz or possible ECSE). Filtering, shortening or hiding the pattern removes the evidence the reader needs.",
    rule: "Annotate stimuli and medication times: they change the classification.",
  },
  {
    id: "acns-t44",
    topic: "iic",
    scene: scene(744, 81, [gpds(1.5, { uv: 120, shape: "sharpSlow", durMs: 180 })]),
    q: "These generalized discharges at about 1.5 Hz are IIC criterion A. Which statement about the IIC is correct?",
    o: [
      "It describes the EEG; the clinical meaning needs physician judgment",
      "It means the patient is having continuous seizures",
      "It means the pattern is interictal and therefore harmless",
      "It can be named only after an antiseizure medication trial",
    ],
    why: "The IIC is a purely electrographic description (also called possible ESz or possible ESE), not a diagnosis. These patterns may be contributing to impaired alertness, causing clinical signs or adding to neuronal injury, and they need clinical interpretation. A medication trial can reclassify a pattern (ECSz or possible ECSE), but it is not needed to name it IIC.",
    rule: "IIC: an EEG description that needs clinical interpretation.",
  },
];

// ------------------------------------------------------------ deterministic shuffle

const SALT = "s838"; // chosen so the correct answer is spread across A to D

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function shuffled(q) {
  let s = hash(`${SALT}:${q.id}`) || 1;
  const rnd = () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296;
  const order = q.o.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.o[i]), answer: order.indexOf(0) };
}

/** Questions with shuffled `options` and the index of the correct one in `answer` (source order kept in `o`). */
export const ACNS_TRACING_QUESTIONS = RAW.map(shuffled);
