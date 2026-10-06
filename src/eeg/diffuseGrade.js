/**
 * Logic for the diffuse-abnormality grading teaching scheme (grades I to VI) and the Glasgow Coma Scale.
 * Pure functions so the study page and the tests share one source of truth.
 */

export const BACKGROUND_OPTIONS = [
  ["normal", "Normal (alpha 8 Hz or faster)"],
  ["mild", "Mildly slow (about 7 to just under 8 Hz)"],
  ["moderate", "Moderately slow (about 4 to 6 Hz)"],
  ["slower", "Slower than 4 Hz"],
  ["minimal", "Minimal or no background activity"],
];
export const EXCESS_OPTIONS = [
  ["none", "No significant excess of theta or delta"],
  ["theta", "Theta is dominant (with some delta)"],
  ["delta", "Delta is dominant"],
];

export const GRADES = {
  IA: { label: "Grade IA", short: "Mild background slowing (7 to under 8 Hz) without excess theta or delta", pattern: "background slowing only" },
  IB: { label: "Grade IB", short: "Moderate background slowing (4 to 6 Hz) without excess theta or delta", pattern: "background slowing only" },
  IIA: { label: "Grade IIA", short: "Dominant theta with some delta, background normal or near-normal", pattern: "excess theta-delta with a normal background" },
  IIB: { label: "Grade IIB", short: "Dominant theta with some delta, background slow", pattern: "slow background plus theta-delta" },
  IIIA: { label: "Grade IIIA", short: "Dominant delta, background normal or near-normal", pattern: "excess theta-delta with a normal background" },
  IIIB: { label: "Grade IIIB", short: "Dominant delta, background slow", pattern: "slow background plus theta-delta" },
  IVA: { label: "Grade IVA", short: "Delta above 50 µV with minimal or no background", pattern: "delta without a background" },
  IVB: { label: "Grade IVB", short: "Delta below 50 µV with minimal or no background", pattern: "delta without a background" },
  VA: { label: "Grade VA", short: "Burst suppression, suppression periods under 5 seconds", pattern: "burst suppression" },
  VB: { label: "Grade VB", short: "Burst suppression, suppression periods over 5 seconds", pattern: "burst suppression" },
  VIA: { label: "Grade VIA", short: "Near electrocerebral inactivity", pattern: "near electrocerebral inactivity" },
  VIB: { label: "Grade VIB", short: "Electrocerebral inactivity", pattern: "electrocerebral inactivity" },
};

/**
 * Pick a grade from what is seen on the page.
 * features: { eci: 'none'|'near'|'complete', burst: false | { suppressionSeconds }, background, excess, deltaUv }
 * Returns { grade, note } where grade is a key of GRADES or null.
 */
export function gradeDiffuse(f) {
  if (f.eci === "complete") return { grade: "VIB", note: "If the reader has found no cerebral activity, this scale calls it grade VIB. Only artifact such as the EKG remains. Whether a record is electrocerebral inactivity is the reader's decision under the guideline." };
  if (f.eci === "near") return { grade: "VIA", note: "Very little cerebral activity remains. The reader decides how to classify it." };
  if (f.burst) {
    const s = Number(f.burst.suppressionSeconds);
    if (!Number.isFinite(s) || s < 0) return { grade: null, note: "Enter how long the suppression periods last." };
    return { grade: s < 5 ? "VA" : "VB", note: "Bursts alternate with suppression; the grade depends on how long the suppression lasts." };
  }
  if (f.background === "minimal") {
    if (f.excess === "delta") {
      const uv = Number(f.deltaUv);
      if (!Number.isFinite(uv) || uv <= 0) return { grade: null, note: "Enter the delta amplitude in µV." };
      return { grade: uv > 50 ? "IVA" : "IVB", note: "Delta is present with minimal or no background; the grade depends on the amplitude." };
    }
    return { grade: null, note: "Minimal background without dominant delta is not covered by grades I to IV. Check the technical side (contacts, sensitivity, EKG channel), describe what you see and tell the reader." };
  }
  if (f.excess === "none") {
    if (f.background === "mild") return { grade: "IA", note: "Slowing of the background alone suggests dysfunction of the cortex in this teaching model." };
    if (f.background === "moderate") return { grade: "IB", note: "Slowing of the background alone suggests dysfunction of the cortex in this teaching model." };
    if (f.background === "slower") return { grade: null, note: "A background slower than 4 Hz is not named in grade I. Describe what you see and let the reader decide." };
    return { grade: null, note: "A normal background with no excess slowing is not a diffuse abnormality." };
  }
  const normal = f.background === "normal";
  const base = f.excess === "theta" ? "II" : "III";
  return {
    grade: base + (normal ? "A" : "B"),
    note: normal
      ? "Theta-delta activity over a normal background suggests white-matter involvement in this teaching model."
      : "A slow background plus theta-delta activity suggests involvement of both the cortex and the white matter in this teaching model.",
  };
}

/** Glasgow Coma Scale total and severity band: eye 1-4, verbal 1-5, motor 1-6; 3-8 severe, 9-12 moderate, 13-15 mild. */
export function gcsSeverity(eye, verbal, motor) {
  const e = Math.min(4, Math.max(1, Math.round(eye)));
  const v = Math.min(5, Math.max(1, Math.round(verbal)));
  const m = Math.min(6, Math.max(1, Math.round(motor)));
  const total = e + v + m;
  const band = total <= 8 ? "severe" : total <= 12 ? "moderate" : "mild";
  return { eye: e, verbal: v, motor: m, total, band };
}

export const GCS_EYE = [
  [4, "Opens eyes spontaneously"],
  [3, "Opens eyes to voice"],
  [2, "Opens eyes to pain"],
  [1, "No eye opening"],
];
export const GCS_VERBAL = [
  [5, "Oriented, converses normally"],
  [4, "Confused conversation"],
  [3, "Inappropriate words"],
  [2, "Incomprehensible sounds"],
  [1, "No verbal response"],
];
export const GCS_MOTOR = [
  [6, "Obeys commands"],
  [5, "Localizes pain"],
  [4, "Withdraws from pain"],
  [3, "Abnormal flexion"],
  [2, "Extension"],
  [1, "No motor response"],
];
