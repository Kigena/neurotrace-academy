/**
 * NeuroLinea synthetic EEG generator.
 *
 * A "scene" describes a 10-second page: patient state, background rhythms,
 * findings, artifacts and display settings. The generator simulates the
 * referential potential at every 10-20 electrode (in uV) as a sum of sources
 * with Gaussian scalp fields, then derives montage channels as
 * input 1 - input 2 and applies the amplifier filters. Because every channel
 * is computed by subtraction, polarity, phase reversals and end-of-chain
 * behaviour are correct by construction.
 *
 * Pure and deterministic: the same scene (and seed) always gives the same
 * tracing. No browser APIs, so it also runs in Node (tests, validators).
 */

export const FS = 256; // samples per second
const PRE_ROLL_S = 3; // simulated before the page so filters settle

// Top-view scalp coordinates (nose up, Cz at the origin, ~unit radius).
export const ELECTRODES = {
  Fp1: [-0.25, 0.77], Fp2: [0.25, 0.77],
  F7: [-0.65, 0.47], F3: [-0.33, 0.4], Fz: [0, 0.38], F4: [0.33, 0.4], F8: [0.65, 0.47],
  T3: [-0.8, 0], C3: [-0.4, 0], Cz: [0, 0], C4: [0.4, 0], T4: [0.8, 0],
  T5: [-0.65, -0.47], P3: [-0.33, -0.4], Pz: [0, -0.38], P4: [0.33, -0.4], T6: [0.65, -0.47],
  O1: [-0.25, -0.77], O2: [0.25, -0.77],
  A1: [-0.97, -0.08], A2: [0.97, -0.08],
  // eye-monitor electrodes: infraorbital (below the eye) and outer canthi (LOC above, ROC below eye level)
  IO1: [-0.3, 0.98], IO2: [0.3, 0.98], LOC: [-0.62, 0.98], ROC: [0.62, 0.98],
};
export const ELECTRODE_NAMES = Object.keys(ELECTRODES);
const EYE_NAMES = ["IO1", "IO2", "LOC", "ROC"];
const CORE_NAMES = ELECTRODE_NAMES.filter((n) => !EYE_NAMES.includes(n));
const LEFT = new Set(["Fp1", "F7", "F3", "T3", "C3", "T5", "P3", "O1", "A1", "IO1", "LOC"]);
const RIGHT = new Set(["Fp2", "F8", "F4", "T4", "C4", "T6", "P4", "O2", "A2", "IO2", "ROC"]);

export const MONTAGES = {
  longitudinal: {
    label: "Longitudinal bipolar (double banana)",
    pairs: [
      ["Fp1", "F7"], ["F7", "T3"], ["T3", "T5"], ["T5", "O1"],
      ["Fp2", "F8"], ["F8", "T4"], ["T4", "T6"], ["T6", "O2"],
      ["Fp1", "F3"], ["F3", "C3"], ["C3", "P3"], ["P3", "O1"],
      ["Fp2", "F4"], ["F4", "C4"], ["C4", "P4"], ["P4", "O2"],
      ["Fz", "Cz"], ["Cz", "Pz"],
    ],
  },
  transverse: {
    label: "Transverse bipolar",
    pairs: [
      ["F7", "Fp1"], ["Fp1", "Fp2"], ["Fp2", "F8"],
      ["F7", "F3"], ["F3", "Fz"], ["Fz", "F4"], ["F4", "F8"],
      ["T3", "C3"], ["C3", "Cz"], ["Cz", "C4"], ["C4", "T4"],
      ["T5", "P3"], ["P3", "Pz"], ["Pz", "P4"], ["P4", "T6"],
      ["T5", "O1"], ["O1", "O2"], ["O2", "T6"],
    ],
  },
  eyeCheck: {
    label: "Eye-movement check (ear-referenced)",
    pairs: [
      ["Fp1", "A1"], ["IO1", "A1"], ["Fp2", "A2"], ["IO2", "A2"], ["LOC", "A1"], ["ROC", "A2"],
      ["F3", "A1"], ["F4", "A2"], ["C3", "A1"], ["C4", "A2"], ["T3", "A1"], ["T4", "A2"], ["O1", "A1"], ["O2", "A2"],
    ],
  },
  referential: {
    label: "Referential (ipsilateral ear)",
    pairs: [
      ["Fp1", "A1"], ["F3", "A1"], ["C3", "A1"], ["P3", "A1"], ["O1", "A1"], ["F7", "A1"], ["T3", "A1"], ["T5", "A1"],
      ["Fp2", "A2"], ["F4", "A2"], ["C4", "A2"], ["P4", "A2"], ["O2", "A2"], ["F8", "A2"], ["T4", "A2"], ["T6", "A2"],
    ],
  },
};

// ---------------------------------------------------------------- utilities

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

function gaussianRng(rng) {
  return () => {
    let u = 0;
    while (u === 0) u = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
  };
}

function rms(x) {
  let s = 0;
  for (let i = 0; i < x.length; i++) s += x[i] * x[i];
  return Math.sqrt(s / x.length) || 1;
}

function scaleTo(x, targetRms) {
  const k = targetRms / rms(x);
  for (let i = 0; i < x.length; i++) x[i] *= k;
  return x;
}

/** Band-limited noise from a two-pole resonator: waxes and wanes naturally. */
function narrowband(n, hz, bwHz, gauss) {
  const r = Math.exp((-Math.PI * bwHz) / FS);
  const w = (2 * Math.PI * hz) / FS;
  const a1 = 2 * r * Math.cos(w);
  const a2 = -r * r;
  const out = new Float64Array(n);
  let y1 = 0;
  let y2 = 0;
  const warm = FS * 2;
  for (let i = -warm; i < n; i++) {
    const y = a1 * y1 + a2 * y2 + gauss();
    y2 = y1;
    y1 = y;
    if (i >= 0) out[i] = y;
  }
  return scaleTo(out, 1);
}

function lowpassNoise(n, hz, gauss) {
  const a = Math.exp((-2 * Math.PI * hz) / FS);
  const out = new Float64Array(n);
  let y = 0;
  for (let i = -FS; i < n; i++) {
    y = a * y + (1 - a) * gauss();
    if (i >= 0) out[i] = y;
  }
  return scaleTo(out, 1);
}

/** Smooth 0..1 gate: 1 inside [from, to], cosine ramps of `ramp` seconds. */
function gateValue(t, from, to, ramp = 0.25) {
  if (t < from - ramp || t > to + ramp) return 0;
  if (t < from) return 0.5 - 0.5 * Math.cos((Math.PI * (t - from + ramp)) / ramp);
  if (t > to) return 0.5 + 0.5 * Math.cos((Math.PI * (t - to)) / ramp);
  return 1;
}

function asymGauss(t, t0, left, right) {
  const s = t < t0 ? left : right;
  const z = (t - t0) / s;
  return Math.exp(-0.5 * z * z);
}

function resolveCenter(c) {
  if (Array.isArray(c)) return c;
  if (typeof c === "string" && ELECTRODES[c]) return ELECTRODES[c];
  throw new Error(`Unknown field center ${JSON.stringify(c)}`);
}

/** Field weight at every electrode for a source centred at `center`. */
function field(center, sigma, { side } = {}) {
  const [cx, cy] = resolveCenter(center);
  const w = {};
  for (const [name, [x, y]] of Object.entries(ELECTRODES)) {
    const d2 = (x - cx) ** 2 + (y - cy) ** 2;
    let v = Math.exp(-d2 / (2 * sigma * sigma));
    if (side === "left" && RIGHT.has(name)) v *= 0.15;
    if (side === "right" && LEFT.has(name)) v *= 0.15;
    w[name] = v;
  }
  return w;
}

function addSource(V, weights, signal, gain = 1) {
  for (const name of ELECTRODE_NAMES) {
    const k = weights[name] * gain;
    if (Math.abs(k) < 1e-4) continue;
    const ch = V[name];
    for (let i = 0; i < signal.length; i++) ch[i] += k * signal[i];
  }
}

// ------------------------------------------------------------- waveforms

/** Epileptiform transient: negative main phase, small positive after-phase,
 *  optional after-going slow wave. `durMs` is the base-to-base duration. */
const K_LEFT = 0.21;
const K_RIGHT = 0.31;

function transientShape(t, t0, durMs, slowWave) {
  const d = durMs / 1000;
  // sigmas calibrated so the drawn main phase (5%-of-peak base to base,
  // after filtering) measures ~durMs with the caliper
  const m = 1.116 - 13.45 / durMs; // corrects for after-phase overlap at short durations
  const main = asymGauss(t, t0, d * K_LEFT * m, d * K_RIGHT * m);
  const after = asymGauss(t, t0 + d * 0.85, d * 0.16, d * 0.24) * 0.3;
  let v = -main + after;
  if (slowWave) v -= asymGauss(t, t0 + d * 0.85 + 0.2, 0.07, 0.1) * 0.55;
  return v;
}

// ------------------------------------------------------------- generator

const DEFAULT_BG = {
  awake: { pdrHz: 10, pdrUv: 45, beta: 4, theta: 3, delta: 2, noise: 4 },
  drowsy: { pdrHz: 8.5, pdrUv: 15, beta: 5, theta: 7, delta: 3, noise: 4 },
  n2: { pdrHz: 0, pdrUv: 0, beta: 2.5, theta: 5, delta: 6, noise: 3 },
  stupor: { pdrHz: 0, pdrUv: 0, beta: 2, theta: 10, delta: 14, noise: 4 },
  semicomatose: { pdrHz: 0, pdrUv: 0, beta: 1, theta: 1, delta: 0, noise: 2.5 },
};

export const FINDING_TYPES = [
  "mu", "muShapedAlpha", "firda", "polymorphicDelta", "spike", "sharp", "gsw", "polyspikeWave",
  "vertex", "spindle", "blink", "eyesClosed", "eyesOpen", "lateralEye", "muscle", "electrodePop",
  "diffuseSlowing", "triphasic", "rhythmicDelta", "glossokinetic", "sine",
];

/**
 * Generate referential electrode signals for a scene.
 * Returns { t0, n, V: {electrode: Float64Array}, ekg: Float64Array, markers }.
 */
export function generateReferential(scene) {
  const seconds = scene.seconds ?? 10;
  const n = Math.round((seconds + PRE_ROLL_S) * FS);
  const rng = mulberry32((scene.seed ?? 1) * 2654435761);
  const gauss = gaussianRng(rng);
  const time = (i) => i / FS - PRE_ROLL_S; // page time in seconds
  const state = scene.state || "awake";
  const bg = { ...DEFAULT_BG[state] || DEFAULT_BG.awake, ...(scene.background || {}) };
  const findings = scene.findings || [];
  const markers = [];

  const V = {};
  for (const name of ELECTRODE_NAMES) V[name] = new Float64Array(n);

  // Per-hemisphere attenuation (e.g. a destructive lesion).
  const attenuate = { left: 1, right: 1 };
  for (const f of findings) if (f.type === "polymorphicDelta") attenuate[f.side || "left"] = f.attenuate ?? 0.45;
  const sideGain = (name) => (LEFT.has(name) ? attenuate.left : RIGHT.has(name) ? attenuate.right : (attenuate.left + attenuate.right) / 2);

  // Eye state over the page (alpha blocks with eyes open).
  const eyeEvents = findings.filter((f) => f.type === "eyesOpen" || f.type === "eyesClosed").sort((a, b) => a.at - b.at);
  const eyesOpenAt = (t) => {
    let open = scene.eyesOpen ?? false;
    for (const e of eyeEvents) if (t >= e.at) open = e.type === "eyesOpen";
    return open;
  };

  // --- local background at each electrode (independent, so bipolar pairs differ)
  // Eye-monitor electrodes use a separate random stream so adding them never changes existing pages.
  const eyeGauss = gaussianRng(mulberry32((scene.seed ?? 1) * 40503 + 7));
  for (const name of EYE_NAMES) {
    const white = lowpassNoise(n, 30, eyeGauss);
    for (let i = 0; i < n; i++) V[name][i] += bg.noise * 0.3 * white[i];
  }
  for (const name of CORE_NAMES) {
    const g = sideGain(name) * (name === "A1" || name === "A2" ? 0.6 : 1);
    const ch = V[name];
    const slow = lowpassNoise(n, 2.5, gauss);
    const theta = narrowband(n, 5.5, 2.5, gauss);
    const beta = narrowband(n, 20, 8, gauss);
    const white = lowpassNoise(n, 30, gauss);
    const [x, y] = ELECTRODES[name];
    const betaW = 0.6 + 0.6 * Math.max(0, y); // beta a little more anterior
    for (let i = 0; i < n; i++) {
      ch[i] += g * (bg.delta * slow[i] + bg.theta * theta[i] + bg.beta * betaW * beta[i]) + bg.noise * 0.3 * white[i];
    }
    void x;
  }

  // --- shared diffuse slow activity (stupor/encephalopathy) so it shows widely
  if (bg.delta > 6 || bg.theta > 7) {
    const diffuse = narrowband(n, 4, 3, gauss);
    addSource(V, field([0, 0.1], 0.9), diffuse, 0.6 * bg.theta);
  }

  // --- posterior dominant rhythm
  if (bg.pdrHz > 0 && bg.pdrUv > 0) {
    const common = narrowband(n, bg.pdrHz, 0.9, gauss);
    const own = [narrowband(n, bg.pdrHz, 0.9, gauss), narrowband(n, bg.pdrHz, 0.9, gauss)];
    const amp = bg.pdrUv / 2.8;
    // Alpha blocks with eye opening; a one-pole smoother (~150 ms) avoids a hard step.
    const react = new Float64Array(n);
    const k = Math.exp(-1 / (0.15 * FS));
    let r = eyesOpenAt(time(0)) ? 0.12 : 1;
    for (let i = 0; i < n; i++) {
      r = k * r + (1 - k) * (eyesOpenAt(time(i)) ? 0.12 : 1);
      react[i] = r;
    }
    ["left", "right"].forEach((side, j) => {
      const sig = new Float64Array(n);
      const gSide = attenuate[side];
      for (let i = 0; i < n; i++) sig[i] = (0.75 * common[i] + 0.45 * own[j][i]) * amp * react[i] * gSide;
      addSource(V, field(side === "left" ? [-0.22, -0.72] : [0.22, -0.72], 0.33), sig);
    });
  }

  // --- findings
  for (const f of findings) {
    switch (f.type) {
      case "mu": {
        const hz = f.hz ?? 9.5;
        const amp = (f.uv ?? 40) / 2.4;
        for (const side of f.sides || ["left", "right"]) {
          const env = narrowband(n, 0.6, 0.8, gauss);
          const sig = new Float64Array(n);
          let phi = rng() * 6.28;
          for (let i = 0; i < n; i++) {
            phi += (2 * Math.PI * (hz + 0.25 * Math.sin(i / 300))) / FS;
            const e = 0.55 + 0.45 * Math.tanh(env[i]);
            // arciform: sharp negative peaks, rounded positive phase
            sig[i] = -amp * e * (Math.cos(phi) + 0.38 * Math.cos(2 * phi));
          }
          addSource(V, field(side === "left" ? "C3" : "C4", 0.17), sig);
        }
        break;
      }
      case "muShapedAlpha": {
        // posterior alpha with a superimposed 2nd harmonic/beta -> arciform look
        const hz = f.hz ?? 10;
        const amp = (f.uv ?? 50) / 2.4;
        for (const side of ["left", "right"]) {
          const env = narrowband(n, 0.5, 0.7, gauss);
          const sig = new Float64Array(n);
          let phi = rng() * 6.28;
          for (let i = 0; i < n; i++) {
            phi += (2 * Math.PI * hz) / FS;
            const e = 0.5 + 0.5 * Math.tanh(1.2 * env[i]);
            sig[i] = -amp * e * (Math.cos(phi) + 0.42 * Math.cos(2 * phi + 0.3));
          }
          addSource(V, field(side === "left" ? [-0.25, -0.75] : [0.28, -0.72], 0.3), sig);
        }
        break;
      }
      case "firda":
      case "rhythmicDelta": {
        const hz = f.hz ?? 2;
        const amp = f.uv ?? 180;
        const runs = f.runs || [[0, seconds]];
        const sig = new Float64Array(n);
        let phi = rng() * 6.28;
        for (let i = 0; i < n; i++) {
          const t = time(i);
          phi += (2 * Math.PI * (hz + 0.08 * Math.sin(t))) / FS;
          let g = 0;
          for (const [a, b] of runs) g = Math.max(g, gateValue(t, a, b, 0.4));
          sig[i] = -amp * g * (Math.sin(phi) + 0.22 * Math.sin(2 * phi + 0.9));
        }
        addSource(V, field(f.center ?? (f.type === "rhythmicDelta" ? [0, -0.65] : [0, 0.62]), f.sigma ?? 0.42), sig);
        break;
      }
      case "polymorphicDelta": {
        const side = f.side || "left";
        const s = side === "left" ? -1 : 1;
        const amp = f.uv ?? 30;
        const centers = [[s * 0.62, 0.3], [s * 0.45, -0.1], [s * 0.55, -0.45]];
        for (const c of centers) {
          const sig = narrowband(n, 1.4, 1.3, gauss);
          scaleTo(sig, amp);
          addSource(V, field(c, 0.3, { side }), sig);
        }
        break;
      }
      case "spike":
      case "sharp": {
        const dur = f.durMs ?? (f.type === "spike" ? 50 : 130);
        const amp = f.uv ?? 120;
        const w = field(f.center || "T3", f.sigma ?? 0.2);
        const times = Array.isArray(f.at) ? f.at : [f.at];
        const sig = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          const t = time(i);
          let v = 0;
          for (const t0 of times) if (Math.abs(t - t0) < 0.6) v += transientShape(t, t0, dur, f.slowWave ?? false);
          sig[i] = amp * v;
        }
        addSource(V, w, sig);
        break;
      }
      case "gsw": {
        const amp = f.uv ?? 350;
        const from = f.from ?? 3;
        const to = Math.min(f.to ?? seconds, seconds + 1);
        const startHz = f.startHz ?? 3.5;
        const endHz = f.hz ?? 3;
        const sig = new Float64Array(n);
        const onsets = [];
        let tk = from;
        while (tk < to) {
          onsets.push(tk);
          const frac = (tk - from) / Math.max(0.1, to - from);
          tk += 1 / (startHz + (endHz - startHz) * Math.min(1, frac * 2.5));
        }
        for (let i = 0; i < n; i++) {
          const t = time(i);
          let v = 0;
          for (const t0 of onsets) {
            if (t < t0 - 0.1 || t > t0 + 0.45) continue;
            v += -0.8 * asymGauss(t, t0, 0.009, 0.015); // spike
            v += 0.35 * asymGauss(t, t0 + 0.05, 0.02, 0.03); // positive trough
            v += -1.0 * asymGauss(t, t0 + 0.17, 0.06, 0.07); // dome (slow wave)
          }
          sig[i] = amp * v;
        }
        addSource(V, field(f.center ?? [0, 0.35], f.sigma ?? 0.62), sig);
        markers.push({ at: from, label: f.label ?? "" });
        break;
      }
      case "polyspikeWave": {
        const amp = f.uv ?? 260;
        const t0 = f.at ?? 4;
        const k = f.spikes ?? 4;
        const sig = new Float64Array(n);
        const spikeTimes = Array.from({ length: k }, (_, j) => t0 + j * (0.055 + 0.02 * rng()));
        const spikeAmps = spikeTimes.map((_, j) => (0.7 + 0.3 * rng()) * (j % 2 ? 0.8 : 1));
        for (let i = 0; i < n; i++) {
          const t = time(i);
          if (t < t0 - 0.2 || t > t0 + 1.2) continue;
          let v = 0;
          spikeTimes.forEach((ts, j) => {
            v += -spikeAmps[j] * asymGauss(t, ts, 0.007, 0.012);
            v += 0.25 * asymGauss(t, ts + 0.025, 0.01, 0.012);
          });
          const last = spikeTimes[k - 1];
          v += -0.9 * asymGauss(t, last + 0.22, 0.08, 0.12);
          sig[i] = amp * v;
        }
        addSource(V, field([0, 0.3], 0.5), sig);
        if (f.marker) markers.push({ at: t0, label: f.marker });
        break;
      }
      case "diffuseSlowing": {
        // Irregular slow activity spread over the whole scalp, optionally frontally predominant
        // and optionally limited to `runs`. `uv` is the approximate peak amplitude at the scalp.
        const hz = f.hz ?? 1.5;
        const bw = f.bwHz ?? 1;
        const amp = (f.uv ?? 30) / 2.8;
        const front = f.frontal ?? 0.3;
        const runs = f.runs || [[0, seconds]];
        const gate = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          let g = 0;
          for (const [a, b] of runs) g = Math.max(g, gateValue(time(i), a, b, 0.5));
          gate[i] = g;
        }
        const regions = [[[0, 0.55], 1 + front], [[0, 0], 1], [[0, -0.5], Math.max(0.3, 1 - front * 0.8)]];
        for (const [center, k] of regions) {
          const sig = narrowband(n, hz, bw, gauss);
          for (let i = 0; i < n; i++) sig[i] *= amp * k * gate[i] * 0.85;
          addSource(V, field(center, 0.5), sig);
        }
        for (const name of CORE_NAMES) {
          const loc = narrowband(n, hz, bw, gauss);
          const k = Math.max(0.3, 1 + front * ELECTRODES[name][1]) * amp * 0.5;
          const ch = V[name];
          for (let i = 0; i < n; i++) ch[i] += loc[i] * k * gate[i];
        }
        break;
      }
      case "triphasic": {
        // Blunt triphasic waves: small negative, dominant POSITIVE, then negative phase; frontal maximum
        // that reaches the posterior leads `lagMs` later.
        const amp = f.uv ?? 90;
        const lag = (f.lagMs ?? 130) / 1000;
        const ds = (f.durMs ?? 450) / 450;
        const times = Array.isArray(f.at) ? f.at : [f.at];
        const wave = (t, t0) =>
          -0.22 * asymGauss(t, t0 - 0.13 * ds, 0.05 * ds, 0.06 * ds) +
          asymGauss(t, t0, 0.07 * ds, 0.1 * ds) -
          0.28 * asymGauss(t, t0 + 0.21 * ds, 0.08 * ds, 0.12 * ds);
        const front = new Float64Array(n);
        const post = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          const t = time(i);
          for (const t0 of times) {
            if (Math.abs(t - t0) > 0.8) continue;
            front[i] += amp * wave(t, t0);
            post[i] += amp * 0.6 * wave(t, t0 + lag);
          }
        }
        addSource(V, field([0, 0.55], 0.45), front);
        addSource(V, field([0, -0.35], 0.5), post);
        break;
      }
      case "vertex": {
        const amp = f.uv ?? 110;
        const times = Array.isArray(f.at) ? f.at : [f.at];
        const sig = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          const t = time(i);
          let v = 0;
          for (const t0 of times) if (Math.abs(t - t0) < 0.6) v += -asymGauss(t, t0, 0.035, 0.05) + 0.35 * asymGauss(t, t0 + 0.14, 0.05, 0.08);
          sig[i] = amp * v;
        }
        addSource(V, field("Cz", 0.32), sig);
        break;
      }
      case "spindle": {
        const amp = f.uv ?? 30;
        const hz = f.hz ?? 13;
        const times = Array.isArray(f.at) ? f.at : [f.at];
        const dur = f.durS ?? 0.9;
        const sig = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          const t = time(i);
          let v = 0;
          for (const t0 of times) {
            const x = (t - t0) / dur;
            if (x < 0 || x > 1) continue;
            v += Math.sin(Math.PI * x) ** 2 * Math.sin(2 * Math.PI * hz * (t - t0));
          }
          sig[i] = amp * v;
        }
        addSource(V, field([0, 0.05], 0.45), sig);
        break;
      }
      case "blink":
      case "eyesClosed":
      case "eyesOpen": {
        // Cornea positive: upward eye movement makes Fp1/Fp2 positive.
        const amp = f.uv ?? (f.type === "eyesOpen" ? 260 : 380);
        const times = Array.isArray(f.at) ? f.at : [f.at];
        const sig = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          const t = time(i);
          let v = 0;
          for (const t0 of times) v += asymGauss(t, t0 + 0.12, 0.07, 0.16);
          sig[i] = amp * v;
        }
        const wBlink = field([0, 1.08], 0.3);
        Object.assign(wBlink, { IO1: -0.85, IO2: -0.85, LOC: 0.8, ROC: -0.8 }); // cornea moves away from the infraorbital leads
        addSource(V, wBlink, sig);
        if (f.type !== "blink") markers.push({ at: times[0], label: f.type === "eyesOpen" ? "Eyes open" : "Eyes closed" });
        break;
      }
      case "lateralEye": {
        // Looking left: left cornea nears F7 (positive), right retina nears F8 (negative).
        const amp = f.uv ?? 70;
        const sgn = f.dir === "right" ? -1 : 1;
        const t0 = f.at ?? 2;
        const dur = f.durS ?? 1.5;
        const sig = new Float64Array(n);
        for (let i = 0; i < n; i++) sig[i] = amp * sgn * gateValue(time(i), t0, t0 + dur, 0.35);
        addSource(V, field("F7", 0.2), sig, 1);
        addSource(V, field("F8", 0.2), sig, -1);
        const lw = { LOC: 0.9, ROC: -0.9, IO1: 0.55, IO2: -0.55 };
        addSource(V, Object.fromEntries(ELECTRODE_NAMES.map((nm) => [nm, lw[nm] || 0])), sig);
        break;
      }
      case "sine": {
        // A pure tone on named electrodes (not common-mode): 60 Hz pickup from a poor electrode, or a test signal.
        const hz = f.hz ?? 60;
        const amp = f.uv ?? 30;
        const from = f.from ?? -Infinity;
        const to = f.to ?? Infinity;
        for (const site of f.sites || ["T3"]) {
          if (!V[site]) throw new Error(`Unknown electrode ${site}`);
          const ch = V[site];
          for (let i = 0; i < n; i++) {
            const t = time(i);
            if (t >= from && t <= to) ch[i] += amp * Math.sin(2 * Math.PI * hz * t);
          }
        }
        break;
      }
      case "glossokinetic": {
        // Tongue potential: slow wave in phase on both sides, larger at the infraorbital leads than at Fp1/Fp2.
        const amp = f.uv ?? 90;
        const times = Array.isArray(f.at) ? f.at : [f.at];
        const sig = new Float64Array(n);
        for (let i = 0; i < n; i++) {
          let v = 0;
          for (const t0 of times) v += asymGauss(time(i), t0 + 0.4, 0.2, 0.3);
          sig[i] = -amp * v;
        }
        const gw = { IO1: 1, IO2: 1, Fp1: 0.55, Fp2: 0.55, LOC: 0.5, ROC: 0.5, F7: 0.3, F8: 0.3, F3: 0.3, F4: 0.3, Fz: 0.3, T3: 0.12, T4: 0.12 };
        addSource(V, Object.fromEntries(ELECTRODE_NAMES.map((nm) => [nm, gw[nm] || 0])), sig);
        break;
      }
      case "muscle": {
        const amp = f.uv ?? 14;
        const sites = f.sites || ["F7", "T3", "F8", "T4"];
        for (const s of sites) {
          const sig = narrowband(n, 55, 30, gauss);
          for (let i = 0; i < n; i++) sig[i] *= amp * gateValue(time(i), f.from ?? 0, f.to ?? seconds, 0.05);
          addSource(V, field(s, 0.12), sig);
        }
        break;
      }
      case "electrodePop": {
        const ch = V[f.electrode || "T4"];
        const times = Array.isArray(f.at) ? f.at : [f.at];
        for (let i = 0; i < n; i++) {
          const t = time(i);
          for (const t0 of times) if (t >= t0) ch[i] += (f.uv ?? 200) * Math.exp(-(t - t0) / 0.12);
        }
        break;
      }
      default:
        throw new Error(`Unknown finding type ${f.type}`);
    }
  }

  // --- EKG channel and small ear/temporal contamination
  const ekg = new Float64Array(n);
  if (scene.ekg !== false) {
    const bpm = scene.heartRate ?? 72;
    const rr = 60 / bpm;
    let tb = -PRE_ROLL_S + rng() * rr;
    const beats = [];
    while (tb < seconds + 1) {
      beats.push(tb);
      tb += rr * (0.97 + 0.06 * rng());
    }
    for (let i = 0; i < n; i++) {
      const t = time(i);
      let v = 0;
      for (const b of beats) {
        if (Math.abs(t - b) > 0.5) continue;
        v += 0.12 * asymGauss(t, b - 0.16, 0.03, 0.03); // P
        v += -0.1 * asymGauss(t, b - 0.025, 0.008, 0.008); // Q
        v += 1.0 * asymGauss(t, b, 0.01, 0.012); // R
        v += -0.22 * asymGauss(t, b + 0.03, 0.01, 0.014); // S
        v += 0.28 * asymGauss(t, b + 0.25, 0.06, 0.07); // T
      }
      ekg[i] = -900 * v; // displayed with negative up: R points up
    }
    const contam = scene.ekgContamination ?? 4;
    for (const [name, k] of [["A1", 1], ["T5", 0.35], ["T3", 0.25], ["A2", 0.4]]) {
      const ch = V[name];
      for (let i = 0; i < n; i++) ch[i] += (k * contam * ekg[i]) / 900;
    }
  }

  return { n, preRoll: PRE_ROLL_S * FS, V, ekg, markers };
}

// ---------------------------------------------------------------- filters

function highpass(x, lffHz) {
  if (!lffHz) return x;
  const tc = 1 / (2 * Math.PI * lffHz);
  const dt = 1 / FS;
  const a = tc / (tc + dt);
  const y = new Float64Array(x.length);
  for (let i = 1; i < x.length; i++) y[i] = a * (y[i - 1] + x[i] - x[i - 1]);
  return y;
}

function lowpass(x, hffHz, order = 2) {
  if (!hffHz || hffHz >= FS / 2) return x;
  if (order === 1) {
    // single-pole RC (6 dB/octave): rise time constant TC = 1 / (2 pi f)
    const rc = 1 / (2 * Math.PI * hffHz);
    const a = 1 / FS / (rc + 1 / FS);
    const out = new Float64Array(x.length);
    for (let i = 1; i < x.length; i++) out[i] = out[i - 1] + a * (x[i] - out[i - 1]);
    return out;
  }
  // 2nd-order Butterworth via bilinear transform
  const k = Math.tan((Math.PI * hffHz) / FS);
  const q = Math.SQRT1_2;
  const norm = 1 / (1 + k / q + k * k);
  const b0 = k * k * norm;
  const b1 = 2 * b0;
  const a1 = 2 * (k * k - 1) * norm;
  const a2 = (1 - k / q + k * k) * norm;
  const y = new Float64Array(x.length);
  for (let i = 2; i < x.length; i++) {
    y[i] = b0 * x[i] + b1 * x[i - 1] + b0 * x[i - 2] - a1 * y[i - 1] - a2 * y[i - 2];
  }
  return y;
}

function notchFilter(x, hz = 60) {
  const w = (2 * Math.PI * hz) / FS;
  const r = 0.97;
  const y = new Float64Array(x.length);
  for (let i = 2; i < x.length; i++) {
    y[i] = x[i] - 2 * Math.cos(w) * x[i - 1] + x[i - 2] + 2 * r * Math.cos(w) * y[i - 1] - r * r * y[i - 2];
  }
  return y;
}

/**
 * Render a scene in a montage. Returns
 * { channels: [{label, data (uV, page only)}], ekg, markers, seconds, fs }.
 */
export function renderScene(scene, montageKey) {
  const key = montageKey || scene.montage || "longitudinal";
  const montage = MONTAGES[key];
  if (!montage) throw new Error(`Unknown montage ${key}`);
  const ref = generateReferential(scene);
  const lff = scene.lff ?? 1;
  const hff = scene.hff ?? 70;
  const lpOrder = scene.lpOrder ?? 2;
  // Calibration signal: a square pulse injected into every channel ahead of the filters.
  // Negative voltage = upward deflection, so the pulse rises on screen like a bedside calibration.
  let cal = null;
  if (scene.calibration) {
    const { at = [0.6], uv = 50, durS = 1.5 } = scene.calibration;
    cal = new Float64Array(ref.n);
    for (let i = 0; i < ref.n; i++) {
      const t = i / FS - PRE_ROLL_S;
      for (const t0 of at) if (t >= t0 && t < t0 + durS) cal[i] = -uv;
    }
  }
  const channels = montage.pairs.map(([a, b]) => {
    const raw = new Float64Array(ref.n);
    for (let i = 0; i < ref.n; i++) raw[i] = ref.V[a][i] - ref.V[b][i] + (cal ? cal[i] : 0);
    let y = lowpass(highpass(raw, lff), hff, lpOrder);
    if (scene.notch) y = notchFilter(y, scene.notchHz ?? 60);
    return { label: `${a}-${b}`, inputs: [a, b], data: y.subarray(ref.preRoll) };
  });
  const ekg = scene.ekg === false ? null : lowpass(highpass(ref.ekg, lff), hff, lpOrder).subarray(ref.preRoll);
  return { channels, ekg, markers: ref.markers, seconds: scene.seconds ?? 10, fs: FS, montage: key, montageLabel: montage.label };
}

/** Throws if a scene is malformed (used by the case validator). */
export function validateScene(scene) {
  if (!scene || typeof scene !== "object") throw new Error("scene must be an object");
  for (const f of scene.findings || []) if (!FINDING_TYPES.includes(f.type)) throw new Error(`unknown finding ${f.type}`);
  for (const m of scene.montages || [scene.montage || "longitudinal"]) if (!MONTAGES[m]) throw new Error(`unknown montage ${m}`);
  if (scene.calibration && !(scene.calibration.at || [0.6]).every(Number.isFinite)) throw new Error("calibration.at must be numbers");
  renderScene(scene);
  return true;
}
