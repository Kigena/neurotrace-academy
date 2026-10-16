import { assessSetup, maximalCurrent, measuredSegment } from "./generator.js";
import { LIMB_REF_TEMP, RECOMMENDED, STUDIES, stimSitesFor } from "./studies.js";

/**
 * Turn a learner's recorded study into measurements and technique checks.
 * studyState: { setup, machine, sweeps: { siteId: { sweep, intensity, marks, distCm } } }
 * env: { temp: { arm, leg }, tempChecked: { arm, leg }, recordedCold: { arm, leg } }
 */

const near = (a, b, tol) => a != null && b != null && Math.abs(a - b) <= tol;

export function measurements(studyId, st) {
  const study = STUDIES[studyId];
  const rows = [];
  let prev = null;
  for (const site of stimSitesFor(study)) {
    const rec = st.sweeps?.[site];
    if (!rec) continue;
    const m = rec.marks || {};
    const amp = m.onset != null && m.peak != null && rec.sweep
      ? Math.abs(rec.sweep.data[Math.round(m.peak * rec.sweep.fs)] - rec.sweep.data[Math.round(m.onset * rec.sweep.fs)])
      : null;
    const row = { site, onset: m.onset ?? null, peak: m.peak ?? null, amp, truth: rec.sweep?.truth, intensity: rec.intensity };
    if (study.type === "sensory") {
      row.dist = st.setup.distalCm;
      row.cv = m.onset ? (10 * row.dist) / m.onset : null;
    } else if (site !== study.distalStim) {
      row.dist = rec.distCm ?? null;
      row.cv = prev?.onset != null && row.onset != null && row.dist ? (10 * row.dist) / (row.onset - prev.onset) : null;
      row.acrossElbow = study.proximal.find((p) => p.site === site)?.acrossElbow;
      row.acrossKnee = study.proximal.find((p) => p.site === site)?.acrossKnee;
    }
    rows.push(row);
    prev = row;
  }
  return rows;
}

/** Flags against this app's reference limits. */
export function flagsFor(studyId, row, isDistal, prevCv = null) {
  const L = STUDIES[studyId].limits;
  const f = [];
  if (STUDIES[studyId].type === "sensory") {
    if (row.peak != null && row.peak > L.peak) f.push("peak latency prolonged");
    if (row.amp != null && row.amp < L.amp) f.push("low amplitude");
  } else {
    if (isDistal && row.onset != null && row.onset > L.lat) f.push("distal latency prolonged");
    if (isDistal && row.amp != null && row.amp < L.amp) f.push("low amplitude");
    const cvLim = (row.acrossElbow || row.acrossKnee) && L.cvAcross ? L.cvAcross : L.cv;
    if (!isDistal && row.cv != null && row.cv < cvLim) f.push("slow conduction velocity");
    else if (row.acrossElbow && row.cv != null && prevCv != null && prevCv - row.cv > 10) f.push("across-elbow velocity more than 10 m/s slower than forearm");
  }
  return f;
}

export function techniqueChecks(studyId, st, env = {}) {
  const study = STUDIES[studyId];
  const checks = [];
  const add = (label, ok, detail) => checks.push({ label, ok, detail });
  const setup = st.setup || {};
  const a = assessSetup(studyId, study.distalStim, setup);
  add("Active and reference electrodes", a.g1 === "ok" && a.g2 === "ok",
    a.problems.filter((p) => ["swapped", "off-motor-point", "g1-wrong-site", "g2-wrong-site", "g2-other-digit", "electrodes-missing"].includes(p.code)).map((p) => p.text).join(" ") || "G1 and G2 correctly placed.");
  add("Ground on the same limb, between stimulator and recording", a.ground === "ok", a.ground === "ok" ? "Ground placed." : a.problems.find((p) => p.code.startsWith("no-ground") || p.code === "ground-far")?.text);
  add("Skin prepared", setup.skinPrepped === true, setup.skinPrepped ? "Skin cleaned." : "Clean and lightly abrade the skin before placing electrodes.");
  add("Cathode toward the recording electrodes", setup.cathodeDistal !== false, setup.cathodeDistal === false ? "Flip the stimulator: cathode distal, anode proximal." : "Polarity correct.");
  add(`Standard distal distance (${study.stdDist} cm)`, near(setup.distalCm, study.stdDist, 0.5),
    near(setup.distalCm, study.stdDist, 0.5) ? "Distance matches the reference table." : `You used ${setup.distalCm} cm; the reference limits assume ${study.stdDist} cm.`);
  if (study.proximal.some((p) => p.acrossElbow)) {
    add("Elbow flexed for the across-elbow segment", setup.elbowFlexed === true, setup.elbowFlexed ? "Elbow flexed." : "Flex the elbow (about 70-90 degrees) before stimulating and measuring across the elbow; with the elbow straight the tape underestimates the nerve length and the across-elbow velocity looks falsely slow.");
  }
  const rec = RECOMMENDED[study.type];
  const m = st.machine || {};
  const gainOk = m.gain >= rec.gainOk[0] && m.gain <= rec.gainOk[1];
  add("Gain", gainOk, gainOk ? "Gain suits the response size." : `For ${study.type} studies this app recommends about ${study.type === "motor" ? "2-5 mV/div" : "10-20 µV/div"}.`);
  const filtOk = m.lff >= rec.lff[0] && m.lff <= rec.lff[1] && m.hff >= rec.hff[0] && m.hff <= rec.hff[1];
  add("Filters", filtOk, filtOk ? "Filter settings appropriate." : study.type === "motor" ? "Motor: low filter about 2-10 Hz, high filter about 10 kHz." : "Sensory: low filter about 10-20 Hz, high filter about 2 kHz.");
  const sites = stimSitesFor(study);
  const missing = sites.filter((s) => !st.sweeps?.[s]);
  add("All stimulation sites recorded", missing.length === 0, missing.length ? `Still to record: ${missing.join(", ")}.` : "All sites recorded.");
  const sub = [], over = [];
  for (const s of sites) {
    const r = st.sweeps?.[s];
    if (!r) continue;
    const imax = maximalCurrent(studyId, s, setup, env.patient || {});
    if (r.intensity < 1.2 * imax) sub.push(s);
    if (r.intensity > 1.6 * imax && study.spread && s === study.distalStim) over.push(s);
  }
  add("Supramaximal stimulation", sub.length === 0 && sites.some((s) => st.sweeps?.[s]),
    sub.length ? `Submaximal at ${sub.join(", ")}: raise the current until the response stops growing, then add about 20%.` : over.length ? "Supramaximal, but the current was high enough to spread to a neighbouring nerve." : "Responses were supramaximal.");
  if (over.length) add("Avoid excessive current", false, "Very high current at the wrist can spread to the neighbouring nerve and change the waveform.");
  const segs = study.proximal.filter((p) => st.sweeps?.[p.site]);
  if (segs.length) {
    const unmeasured = segs.filter((p) => st.sweeps[p.site].distCm == null);
    add("Segment distances measured", unmeasured.length === 0, unmeasured.length ? "Measure each segment with the tape before calculating velocity." : "Segments measured.");
  }
  const limb = study.limb;
  if (env.temp) {
    const cold = env.recordedCold?.[limb];
    add(`Limb temperature (at least ${LIMB_REF_TEMP[limb]} °C)`, !cold && !!env.tempChecked?.[limb],
      cold ? "You recorded while the limb was below the reference temperature. Warm the limb first; cold slows conduction and raises amplitude." : env.tempChecked?.[limb] ? "Temperature checked." : "Remember to measure the skin temperature.");
  }
  return checks;
}

/** Measurement accuracy against what the screen shows. */
export function accuracyChecks(studyId, st) {
  const study = STUDIES[studyId];
  const out = [];
  for (const row of measurements(studyId, st)) {
    const t = row.truth;
    if (!t?.present) continue;
    if (study.type === "motor") out.push({ site: row.site, what: "onset latency", ok: near(row.onset, t.onset, 0.3), yours: row.onset, ref: t.onset });
    else out.push({ site: row.site, what: "peak latency", ok: near(row.peak, t.peak, 0.2), yours: row.peak, ref: t.peak });
    out.push({ site: row.site, what: "amplitude", ok: row.amp != null && Math.abs(row.amp - t.amp) <= 0.15 * t.amp, yours: row.amp, ref: t.amp });
  }
  return out;
}

export function measuredDistance(studyId, siteId, setup) {
  return measuredSegment(studyId, siteId, setup);
}
