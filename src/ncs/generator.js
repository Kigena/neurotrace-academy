import { LIMB_REF_TEMP, STIM_SITES, STUDIES } from "./studies.js";

/**
 * NeuroLinea synthetic nerve conduction generator.
 *
 * simulate() returns one sweep for one stimulation: the voltage G1 minus G2 in
 * microvolts (so a negative CMAP or SNAP peak is a negative number; the display
 * plots negative up), sampled at FS samples per millisecond, after the
 * amplifier filters. It also returns the "truth" (onset, peak, amplitude) for
 * grading and the list of technique problems that shaped the response.
 *
 * Technique effects are modelled so that the waveform itself shows the
 * mistake: off-motor-point G1 gives an initial positive dip, swapped G1/G2
 * inverts the response, submaximal current lowers the amplitude, a reversed
 * stimulator lengthens the latency, a cold limb slows conduction, low
 * high-frequency filters blunt and delay sensory peaks, poor grounding adds
 * mains noise and stimulus artifact.
 */

export const FS = 50; // samples per ms (50 kHz)

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussFrom(rng) {
  let u = 0;
  while (u === 0) u = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

// Smooth one-sided bump: 0 before x=0, peak 1 at x=tau.
function bump(x, tau, k = 2) {
  if (x <= 0) return 0;
  const r = x / tau;
  return Math.pow(r, k) * Math.exp(k * (1 - r));
}

function gauss(x, mu, sd) {
  const z = (x - mu) / sd;
  return Math.exp(-0.5 * z * z);
}

// Second-order Butterworth biquad (bilinear transform), applied causally like an analog amplifier.
function biquad(data, type, fc) {
  const fs = FS * 1000;
  const w = Math.tan((Math.PI * Math.min(fc, fs * 0.45)) / fs);
  const q = Math.SQRT1_2;
  const n = 1 / (1 + w / q + w * w);
  let b0, b1, b2;
  if (type === "low") {
    b0 = w * w * n;
    b1 = 2 * b0;
    b2 = b0;
  } else {
    b0 = n;
    b1 = -2 * n;
    b2 = n;
  }
  const a1 = 2 * (w * w - 1) * n;
  const a2 = (1 - w / q + w * w) * n;
  const out = new Float64Array(data.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < data.length; i++) {
    const x0 = data[i];
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    out[i] = y0;
    x2 = x1; x1 = x0; y2 = y1; y1 = y0;
  }
  return out;
}

/** Recruitment curve: fraction of the maximal response at a given current. */
export function recruitFraction(intensity, imax) {
  if (intensity <= 0) return 0;
  const f = 1 / (1 + Math.exp(-(intensity - 0.6 * imax) / (0.08 * imax)));
  const f0 = 1 / (1 + Math.exp((0.6 * imax) / (0.08 * imax)));
  return Math.max(0, Math.min(1, (f - f0) / (1 - f0)));
}

/** Current at which this set-up reaches a maximal response (mA). */
export function maximalCurrent(studyId, stimSiteId, setup = {}, patient = {}) {
  const study = STUDIES[studyId];
  const path = patient.path?.[studyId] || {};
  let imax = study.healthy.imax * (path.imaxFactor ?? 1);
  if (stimSiteId !== study.distalStim) imax *= 1.25; // deeper proximal sites
  if (setup.cathodeDistal === false) imax *= 1.3;
  if (setup.skinPrepped === false) imax *= 1.15;
  return imax;
}

/**
 * Describe what the electrode set-up does, independent of current.
 * Returns { g1, g2, ground, stim, problems: [{code, text}] }.
 */
export function assessSetup(studyId, stimSiteId, setup) {
  const study = STUDIES[studyId];
  const problems = [];
  const add = (code, text) => problems.push({ code, text });
  const g1 = setup.g1, g2 = setup.g2;
  let g1State = "ok";
  if (!g1 || !g2) {
    g1State = "missing";
    add("electrodes-missing", "Place both recording electrodes (G1 active and G2 reference).");
  } else if (study.g1.includes(g2) && study.g2.includes(g1)) {
    g1State = "swapped";
    add("swapped", "G1 and G2 are reversed, so the response is upside down. G1 goes on the muscle belly (motor) or the proximal ring (sensory).");
  } else if (!study.g1.includes(g1)) {
    if (study.type === "motor" && (study.offPoint || []).includes(g1)) {
      g1State = "offPoint";
      add("off-motor-point", "G1 is not over the motor point, so the CMAP starts with a positive dip. Move G1 to the middle of the muscle belly.");
    } else {
      g1State = "wrong";
      add("g1-wrong-site", "G1 is not over the structure this study records from.");
    }
  }
  let g2State = "ok";
  if (g1State === "ok" && g2) {
    if (study.type === "sensory" && study.pairs && study.pairs[g1] !== g2) {
      g2State = study.g2.includes(g2) ? "otherDigit" : "wrong";
    } else if (!study.g2.includes(g2)) {
      g2State = "wrong";
    }
    if (g2State === "otherDigit") add("g2-other-digit", "G2 must be on the same digit as G1, 3-4 cm distal.");
    if (g2State === "wrong") {
      add("g2-wrong-site", study.type === "motor"
        ? "G2 should sit on a nearby electrically quiet site (tendon or bone distal to the muscle), not on active muscle."
        : "G2 should sit 3-4 cm distal to G1 along the same nerve.");
    }
  }
  let ground = "ok";
  if (!setup.ground) {
    ground = "none";
    add("no-ground", "No ground electrode: expect large stimulus artifact and mains (60 Hz) noise.");
  } else if (setup.ground === "otherLimb") {
    ground = "far";
    add("ground-far", "Place the ground on the same limb, between the stimulator and the recording electrodes.");
  }
  const site = STIM_SITES[stimSiteId];
  let stim = "ok";
  if (!site || site.limb !== study.limb) {
    stim = "wrongLimb";
    add("stim-wrong", "This stimulation site is not on the limb being studied.");
  } else if (site.nerve !== study.nerve) {
    stim = "wrongNerve";
    add("stim-wrong-nerve", `This site stimulates the ${site.nerve} nerve, not the ${study.nerve} nerve.`);
  }
  if (setup.cathodeDistal === false) add("cathode-reversed", "The cathode should face the recording electrodes (anode proximal). Reversed polarity lengthens the latency and needs more current.");
  if (setup.skinPrepped === false) add("skin-not-prepped", "Clean and lightly abrade the skin: high impedance adds noise and raises the current needed.");
  return { g1: g1State, g2: g2State, ground, stim, problems };
}

/** True latency model for a study and site, in ms (before technique offsets). */
export function trueTiming(studyId, stimSiteId, distalCm, patient = {}) {
  const study = STUDIES[studyId];
  const path = patient.path?.[studyId] || {};
  const limbTemp = patient.temp?.[study.limb] ?? LIMB_REF_TEMP[study.limb];
  const dT = Math.max(0, LIMB_REF_TEMP[study.limb] - limbTemp);
  const cvScale = (1 - 0.035 * dT) * (path.cvFactor ?? 1);
  if (study.type === "sensory") {
    const cv = (path.cv ?? study.healthy.cv) * cvScale;
    const onset = (10 * distalCm) / cv + (path.onsetAdd ?? 0) * (1 + 0.05 * dT);
    return { onset, cv, dT };
  }
  const term = (study.healthy.term + (path.termAdd ?? 0)) * (1 + 0.08 * dT);
  const cvDistal = study.healthy.cvDistal * cvScale;
  const distal = term + (10 * distalCm) / cvDistal;
  if (stimSiteId === study.distalStim) return { onset: distal, cv: cvDistal, dT };
  // proximal: anatomical position from the standard distal site
  let t = term + (10 * study.stdDist) / cvDistal;
  for (const p of study.proximal) {
    const cv = (path.cvSeg?.[p.site] ?? study.healthy.cvSeg[p.site]) * cvScale;
    t += (10 * p.segCm) / cv;
    if (p.site === stimSiteId) return { onset: t, cv, dT };
  }
  return { onset: distal, cv: cvDistal, dT };
}

/** Distance the tape measure reads for a proximal segment (cm). */
export function measuredSegment(studyId, stimSiteId, setup = {}) {
  const study = STUDIES[studyId];
  const idx = study.proximal.findIndex((p) => p.site === stimSiteId);
  if (idx < 0) return null;
  const p = study.proximal[idx];
  const distal = setup.distalCm ?? study.stdDist;
  let cm = idx === 0 ? p.segCm + (study.stdDist - distal) : p.segCm;
  // With the elbow straight the ulnar nerve lies slack in the groove, so the
  // skin measurement across the elbow underestimates the nerve length.
  if (p.acrossElbow && setup.elbowFlexed === false) cm -= 2;
  return cm;
}

function ampAtSite(study, stimSiteId, path) {
  let amp = study.healthy.amp * (path.amp ?? 1);
  let disp = 1;
  if (stimSiteId !== study.distalStim) {
    for (const p of study.proximal) {
      amp *= 0.95 * (path.block?.[p.site] ?? 1);
      disp *= 1.06 * (path.disp?.[p.site] ?? 1);
      if (p.site === stimSiteId) break;
    }
  }
  return { amp, disp };
}

/**
 * Simulate one stimulation.
 * opts: { studyId, stimSiteId, setup, patient, intensity (mA), sweepMs, seed }
 * setup: { g1, g2, ground, distalCm, cathodeDistal, skinPrepped, elbowFlexed, lff, hff, averages }
 */
export function simulate({ studyId, stimSiteId, setup = {}, patient = {}, intensity = 0, sweepMs = 20, seed = 1 }) {
  const study = STUDIES[studyId];
  if (!study) throw new Error(`unknown study ${studyId}`);
  const rng = mulberry32(seed);
  const n = Math.round(sweepMs * FS) + 1;
  const raw = new Float64Array(n); // response only
  const extra = new Float64Array(n); // artifact and noise
  const tAt = (i) => i / FS;
  const path = patient.path?.[studyId] || {};
  const assessed = assessSetup(studyId, stimSiteId, setup);
  const distalCm = setup.distalCm ?? study.stdDist;
  const timing = trueTiming(studyId, stimSiteId, distalCm, patient);
  const imax = maximalCurrent(studyId, stimSiteId, setup, patient);
  const frac = recruitFraction(intensity, imax);
  const dT = timing.dT;

  let onset = timing.onset;
  if (setup.cathodeDistal === false) onset += (10 * 2) / timing.cv; // ~2 cm cathode-anode spacing
  if (study.type === "motor" && frac > 0 && frac < 0.9) onset += 0.15 * (1 - frac);

  const site = STIM_SITES[stimSiteId];
  const sameNerve = assessed.stim === "ok";
  const absent = path.absent || assessed.stim === "wrongLimb";
  let peak = null, amp = 0;

  if (!absent && frac > 0) {
    if (study.type === "motor") {
      const { amp: a0, disp } = ampAtSite(study, stimSiteId, path);
      const tempAmp = 1 + 0.025 * dT;
      let A = a0 * frac * tempAmp * (sameNerve ? 1 : 0.12);
      const tauN = 2.2 * disp * (1 + 0.03 * dT);
      let lead = 0; // initial positive dip
      let negScale = 1;
      if (!sameNerve || assessed.g1 === "offPoint") { lead = 0.3; negScale = 0.75; }
      if (assessed.g1 === "wrong") { A *= 0.15; lead = 0.5; }
      if (assessed.g2 === "wrong") A *= 0.45; // reference on active tissue cancels part of the response
      const spread = study.spread && site?.distal && intensity > 1.6 * imax;
      const sign = assessed.g1 === "swapped" ? -1 : 1;
      const shift = lead > 0 ? 0.6 : 0;
      for (let i = 0; i < n; i++) {
        const x = tAt(i) - onset;
        let v = lead * A * bump(x, 0.7, 2);
        v += -negScale * A * bump(x - shift, tauN, 2);
        v += 0.42 * negScale * A * bump(x - shift - 2.6 * disp, 2.8 * disp, 2);
        if (spread) v += 0.3 * a0 * (0.6 * bump(x - 0.2, 0.8, 2) - bump(x - 0.9, 2.4, 2));
        raw[i] += sign * v;
      }
      peak = onset + shift + tauN;
      amp = negScale * A * (assessed.g1 === "swapped" ? -1 : 1);
    } else {
      const tempAmp = 1 + 0.04 * dT;
      let A = study.healthy.amp * (path.amp ?? 1) * frac * tempAmp * (sameNerve ? 1 : 0.05);
      // closer rings record a smaller potential (14 cm and 3-4 cm spacing assumed standard)
      if (assessed.g2 === "otherDigit") A *= 0.7;
      if (assessed.g2 === "wrong") A *= 0.5;
      if (assessed.g1 === "wrong") A *= 0.1;
      const disp = (1 + 0.04 * dT) * (path.disp ?? 1);
      const pk = onset + 0.6 * disp;
      const sign = assessed.g1 === "swapped" ? -1 : 1;
      for (let i = 0; i < n; i++) {
        const t = tAt(i);
        let v = 0.12 * A * gauss(t, onset + 0.12, 0.12 * disp);
        v += -A * gauss(t, pk, 0.27 * disp);
        v += 0.35 * A * gauss(t, pk + 0.75 * disp, 0.45 * disp);
        raw[i] += sign * v;
      }
      peak = pk;
      amp = A * (assessed.g1 === "swapped" ? -1 : 1);
    }
  }

  // Stimulus artifact (biphasic spike plus decay), bigger with current, poor grounding and short distance.
  const groundK = assessed.ground === "none" ? 6 : assessed.ground === "far" ? 2.5 : 1;
  const distK = study.type === "sensory" ? 14 / Math.max(4, distalCm) : 1;
  const art = intensity > 0 ? 180 * (intensity / 20) * groundK * distK * (stimSiteId === study.distalStim ? 1 : 0.4) : 0;
  for (let i = 0; i < n; i++) {
    const t = tAt(i);
    extra[i] += art * (gauss(t, 0.05, 0.03) - 0.5 * gauss(t, 0.14, 0.04)) + art * 0.15 * Math.exp(-t / 0.35) * (t > 0.1 ? 1 : 0);
  }

  // Noise: random plus 60 Hz mains, reduced by averaging.
  const avg = Math.max(1, setup.averages ?? 1);
  let mains = 0.6, white = study.type === "sensory" ? 1.2 : 4;
  if (assessed.ground === "none") mains = 40;
  else if (assessed.ground === "far") mains = 8;
  if (setup.skinPrepped === false) { mains *= 2.5; white *= 2.5; }
  const phase = rng() * 2 * Math.PI;
  const k = 1 / Math.sqrt(avg);
  for (let i = 0; i < n; i++) {
    extra[i] += k * (mains * Math.sin(phase + 2 * Math.PI * 0.06 * tAt(i)) + white * gaussFrom(rng));
  }

  const filt = (x) => {
    let y = x;
    if (setup.lff) y = biquad(y, "high", setup.lff);
    if (setup.hff) y = biquad(y, "low", setup.hff);
    return y;
  };
  const resp = filt(raw);
  const other = filt(extra);
  const data = new Float32Array(n);
  for (let i = 0; i < n; i++) data[i] = resp[i] + other[i];
  // What a careful reader can measure on screen: filtered, noise-free response.
  if (amp) {
    let pi = 0;
    for (let i = 0; i < n; i++) if (Math.abs(resp[i]) > Math.abs(resp[pi])) pi = i;
    const shownPeak = pi / FS;
    if (Math.sign(resp[pi]) === Math.sign(-amp)) peak = shownPeak;
    amp = Math.sign(amp) * Math.abs(resp[pi]);
  }

  return {
    fs: FS,
    sweepMs,
    data,
    truth: { onset: amp ? onset : null, peak: amp ? peak : null, amp: Math.abs(amp), frac, imax, present: !!amp },
    problems: assessed.problems,
    assessed,
  };
}

/**
 * Machine-style automatic marking on the displayed (filtered) waveform:
 * onset = first departure from baseline after the artifact, peak = largest
 * negative point. Like a real machine it can be fooled by an initial
 * positive dip or by noise.
 */
export function autoMark(sweep, type) {
  const { data, fs } = sweep;
  const start = Math.round(0.8 * fs);
  let peakI = start, peakV = Infinity;
  for (let i = start; i < data.length; i++) if (data[i] < peakV) { peakV = data[i]; peakI = i; }
  // Walk back from the peak to the takeoff: the last point before the peak
  // that is within 3% of the most positive value in the preceding window.
  const win = Math.round((type === "sensory" ? 1.2 : 3.5) * fs);
  const from = Math.max(start, peakI - win);
  let top = -Infinity;
  for (let i = from; i <= peakI; i++) top = Math.max(top, data[i]);
  const thr = 0.03 * (top - peakV);
  let onI = from;
  for (let i = peakI; i >= from; i--) if (data[i] >= top - thr) { onI = i; break; }
  return { onset: onI / fs, peak: peakI / fs, amp: Math.abs(peakV - data[onI]) };
}

/** Amplitude between a baseline point (onset cursor) and a peak cursor. */
export function ampBetween(sweep, onsetMs, peakMs) {
  const at = (ms) => sweep.data[Math.max(0, Math.min(sweep.data.length - 1, Math.round(ms * sweep.fs)))];
  return Math.abs(at(peakMs) - at(onsetMs));
}
