/**
 * Syndrome finder: filter the teaching table by the patient's age and the main EEG feature seen.
 * Pure functions so the page and the tests share one source of truth.
 */

export const FEATURES = [
  ["any", "Any feature"],
  ["gsw-3hz", "Generalized 3 Hz spike-and-wave, abrupt onset"],
  ["polyspike", "Irregular generalized polyspike-wave (4 to 6 Hz)"],
  ["slow-sw", "Slow (below 2.5 Hz) generalized spike-and-wave"],
  ["pfa", "Generalized paroxysmal fast activity in sleep"],
  ["hypsarrhythmia", "Chaotic, very high-amplitude slow waves with multifocal spikes"],
  ["burst-suppression", "Burst suppression in wakefulness and sleep"],
  ["esws", "Near-continuous spike-wave in non-REM sleep"],
  ["rolandic", "Centrotemporal spikes with a frontal positive pole"],
  ["occipital", "Occipital spikes that change with eye opening"],
  ["focal-temporal", "Anterior temporal sharp waves"],
  ["focal-frontal", "Frontal spikes or rapid bilateral spread"],
  ["photosensitive", "Photoparoxysmal response"],
];

/**
 * @param {Array} syndromes entries with ageMin, ageMax (years) and features[]
 * @param {{age: number|null, feature: string}} q
 */
export function matchSyndromes(syndromes, { age, feature }) {
  const a = age == null || age === "" || Number.isNaN(Number(age)) ? null : Number(age);
  return syndromes.filter((s) => {
    const ageOk = a == null || (a >= s.ageMin && a <= s.ageMax);
    const featOk = !feature || feature === "any" || (s.features || []).includes(feature);
    return ageOk && featOk;
  });
}
