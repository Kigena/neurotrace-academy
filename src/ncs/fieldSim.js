import { biquad, FS, gaussFrom, mulberry32, recruitFraction } from "./generator.js";
import { dist, inPolygon, project } from "./geometry.js";
import { crossed, nerveOf, pathTime, zoneCvAt, zonesOf } from "./pathology.js";

/**
 * Field-based sensory NCS simulation on an anatomy model.
 *
 * Every electrode is a point on the skin. Its perpendicular distance to the
 * nerve sets how strongly it "sees" the travelling compound action potential,
 * and its position along the nerve sets when the potential passes it. The
 * recording is V(G1) - V(G2), so electrode separation, an electrode off the
 * nerve, or G2 too close or too far change the waveform for physical reasons.
 * The stimulator's cathode and anode are projected onto the nerve the same
 * way: distance from the nerve and rotation change the current needed, and an
 * anode lying between the cathode and the recording electrodes shifts the
 * effective stimulation point.
 *
 * Effect sizes are teaching approximations and need calibration against
 * references and expert review.
 */

export const CONTACT = {
  good: { z: 3, label: "Prepared skin, gel" },
  unprepped: { z: 14, label: "Skin not prepared" },
  dry: { z: 45, label: "No gel (dry contact)" },
};

const STIM_HALF_SPAN = 15; // mm from the stimulator centre to each pole (3 cm pole spacing)
const FIELD_MM = 8; // lateral distance at which a recording electrode sees about half the potential
const STIM_MM = 12; // lateral cathode offset at which the maximal current has doubled

export function stimPoles(stim) {
  const ux = Math.cos(stim.angle), uy = Math.sin(stim.angle);
  return {
    cathode: { x: stim.x + ux * STIM_HALF_SPAN, y: stim.y + uy * STIM_HALF_SPAN },
    anode: { x: stim.x - ux * STIM_HALF_SPAN, y: stim.y - uy * STIM_HALF_SPAN },
  };
}

const g = (t, mu, sd) => Math.exp(-0.5 * ((t - mu) / sd) ** 2);

// Monopolar potential seen by one electrode as the volley passes (negative main phase).
function monopolar(t, arrive, disp) {
  // arrive = takeoff of the negative phase; negative peak about 0.45 ms later
  return 0.15 * g(t, arrive - 0.12 * disp, 0.12 * disp) - g(t, arrive + 0.45 * disp, 0.2 * disp) + 0.3 * g(t, arrive + 1.05 * disp, 0.3 * disp);
}

/** Geometry and coupling of the current set-up (no time series). */
// Sensory branches the electrodes can see (for example the digital nerves to two fingers);
// a single-nerve model has one branch. Each branch is a full route from proximal.
export function sensoryBranches(model) {
  return model.SENS_BRANCHES || [{ id: "main", pts: model.NERVE, weight: 1, nerve: model.SENS_NERVE || "sural" }];
}

export function describeSetup(model, setup, patient = {}) {
  const branches = sensoryBranches(model);
  // The recording is about the branch under G1; where two branches run under one ring (the ring
  // finger), prefer the one the cathode is actually stimulating.
  const cath = setup.stim ? stimPoles(setup.stim).cathode : null;
  const score = (b) => project(setup.g1, b.pts).d + (cath ? 0.5 * project(cath, b.pts).d : 0);
  const primary = setup.g1 ? branches.reduce((a, b) => (score(b) < score(a) ? b : a)) : branches[0];
  const path = primary.pts;
  const onSkin = (p) => !!p && inPolygon(p, model.SKIN);
  const out = { placed: {}, onSkin: {}, proj: {} };
  for (const k of ["g1", "g2", "ground"]) {
    out.placed[k] = !!setup[k];
    out.onSkin[k] = onSkin(setup[k]);
    if (setup[k]) out.proj[k] = project(setup[k], path);
  }
  if (setup.stim) {
    const { cathode, anode } = stimPoles(setup.stim);
    const pc = project(cathode, path), pa = project(anode, path);
    const align = Math.abs(Math.cos(setup.stim.angle) * pc.tx + Math.sin(setup.stim.angle) * pc.ty);
    const towardRec = out.proj.g1 ? Math.sign(out.proj.g1.s - pc.s) : 1;
    const reversed = align > 0.5 && Math.sign(pa.s - pc.s) === towardRec;
    const contactK = setup.contact?.stim === "good" ? 1 : setup.contact?.stim === "dry" ? 1.4 : 1.15;
    const base = (patient.imaxBase ?? 18) * (nerveOf(patient, primary.nerve).imaxFactor ?? 1);
    // The impulse starts under the cathode. With the anode toward the recording electrodes the
    // cathode is farther away (longer latency) and the anode can partly block the volley (more current).
    const imax = base * (1 + (pc.d / STIM_MM) ** 2) * (1 + 0.5 * (1 - align)) * (reversed ? 1.3 : 1) * contactK;
    out.stim = { cathode, anode, pc, pa, align, reversed, imax, onSkin: onSkin(cathode) && onSkin(anode), sAct: pc.s };
  }
  out.primary = primary.id;
  if (out.proj.g1 && out.stim) out.trueDistMm = Math.abs(out.proj.g1.s - out.stim.sAct);
  if (out.proj.g1 && out.proj.g2) out.separationMm = Math.abs(out.proj.g2.s - out.proj.g1.s);
  if (setup.ground && out.stim && out.proj.g1) {
    const pg = project(setup.ground, path);
    const lo = Math.min(out.stim.sAct, out.proj.g1.s), hi = Math.max(out.stim.sAct, out.proj.g1.s);
    out.groundBetween = pg.s >= lo - 10 && pg.s <= hi + 10;
  }
  return out;
}

let idealPeak = null;
function idealAmplitude() {
  // Bipolar amplitude of the reference configuration (on-nerve, 35 mm spacing, 140 mm, 50 m/s).
  if (idealPeak) return idealPeak;
  let m = 0;
  for (let t = 0; t < 8; t += 0.02) m = Math.max(m, Math.abs(monopolar(t, 2.92, 1.35) - monopolar(t, 3.65, 1.44)));
  idealPeak = m / 1.275; // the amplifier filters take off part of the peak; calibrated so the reference set-up shows about patient.amp
  return idealPeak;
}

/**
 * Simulate one stimulation.
 * setup: { g1, g2, ground, stim: {x, y, angle}, contact: { g1, g2, ground, stim } }
 * machine: { lff, hff, averages, sweep }
 * patient: { tempC, refTempC, cv, amp, ampFactor, cvFactor, absent }
 */
export function simulateField({ model, setup, machine = {}, patient = {}, intensity = 0, seed = 1 }) {
  const sweepMs = (machine.sweep ?? 1) * 10;
  const n = Math.round(sweepMs * FS) + 1;
  const rng = mulberry32(seed);
  const geo = describeSetup(model, setup, patient);
  const resp = new Float64Array(n);
  const extra = new Float64Array(n);
  const dT = Math.max(0, (patient.refTempC ?? 30) - (patient.tempC ?? 31));
  const cv = (patient.cv ?? 48) * (1 - 0.035 * dT) * (patient.cvFactor ?? 1); // m/s = mm/ms
  const ampScale = (patient.amp ?? 18) * (patient.ampFactor ?? 1) * (1 + 0.04 * dT);
  const st = geo.stim;
  const rec = geo.onSkin.g1 && geo.onSkin.g2;
  const frac = st && st.onSkin ? recruitFraction(intensity, st.imax) : 0;

  if (rec && st?.onSkin && intensity > 0 && !patient.absent) {
    const A0 = ampScale / idealAmplitude();
    const elec = [["g1", 1], ["g2", -1]];
    for (const b of sensoryBranches(model)) {
      const pcb = project(st.cathode, b.pts);
      const sAct = pcb.s; // each nerve is excited under the cathode, by its own distance from it
      const np = nerveOf(patient, b.nerve);
      if (np.sensoryAbsent) continue;
      const zones = zonesOf(patient, b.nerve);
      const cvB = cv * (np.cvFactor ?? 1);
      const imaxB = st.imax * (1 + (pcb.d / STIM_MM) ** 2) / (1 + (st.pc.d / STIM_MM) ** 2);
      const A = A0 * (np.sensoryAmp ?? 1) * recruitFraction(intensity, imaxB);
      if (A <= 0) continue;
      for (const [k, sign] of elec) {
        const p = project(setup[k], b.pts);
        const w = (b.weight ?? 1) * (model.nerveScale ? model.nerveScale(p.s) : 1) / (1 + (p.d / FIELD_MM) ** 2);
        if (w < 0.005) continue;
        const L = Math.abs(p.s - sAct);
        const arrive = pathTime(b.pts, sAct, p.s, (y) => cvB * zoneCvAt(zones, y, "sensory"));
        const lesion = crossed(b.pts, sAct, p.s, zones, "sensory");
        const disp = (1 + 0.35 * (L / 140)) * (1 + 0.04 * dT) * lesion.disp;
        const Ae = A * lesion.conduct / Math.sqrt(lesion.disp);
        for (let i = 0; i < n; i++) resp[i] += sign * Ae * w * monopolar(i / FS, arrive, disp);
      }
    }
  }

  // Stimulus artifact: grows with current, falls with distance to G1, worse without a good ground.
  if (st && intensity > 0 && geo.placed.g1) {
    const dC = Math.max(20, dist(st.cathode, setup.g1));
    const groundK = !geo.onSkin.ground ? 6 : geo.groundBetween ? 1 : 1.8;
    const art = 900 * (intensity / 20) * (60 / dC) ** 1.5 * groundK;
    for (let i = 0; i < n; i++) {
      const t = i / FS;
      extra[i] += art * (g(t, 0.05, 0.03) - 0.5 * g(t, 0.14, 0.04)) + 0.12 * art * Math.exp(-t / 0.3) * (t > 0.1 ? 1 : 0);
    }
  }

  // Contact: impedance per electrode sets random noise, mains pickup (imbalance) and drift.
  const z = (k) => (geo.onSkin[k] ? CONTACT[setup.contact?.[k] ?? "good"].z : 1000);
  const z1 = z("g1"), z2 = z("g2"), zg = geo.placed.ground ? z("ground") : 1000;
  const avg = Math.max(1, machine.averages ?? 1);
  const k = 1 / Math.sqrt(avg);
  const white = 0.5 * Math.sqrt((z1 + z2) / 6);
  let mains = 0.3 + 0.25 * Math.abs(z1 - z2) + (zg >= 1000 ? 40 : zg > 20 ? 6 : 0);
  mains = Math.min(mains, 400);
  const drift = (z1 > 20 || z2 > 20) ? 0.15 * (z1 + z2) : 0;
  const ph = rng() * 6.283, ph2 = rng() * 6.283;
  for (let i = 0; i < n; i++) {
    const t = i / FS;
    extra[i] += k * (mains * Math.sin(ph + 2 * Math.PI * 0.06 * t) + white * gaussFrom(rng)) + drift * Math.sin(ph2 + 2 * Math.PI * 0.002 * t);
  }

  const filt = (x) => {
    let y = x;
    if (machine.lff) y = biquad(y, "high", machine.lff);
    if (machine.hff) y = biquad(y, "low", machine.hff);
    return y;
  };
  const fr = filt(resp), fe = filt(extra);
  const data = new Float32Array(n);
  for (let i = 0; i < n; i++) data[i] = fr[i] + fe[i];

  // What a careful reader can measure: filtered, noise-free response.
  let pi = 0;
  for (let i = 0; i < n; i++) if (fr[i] < fr[pi]) pi = i;
  const amp = Math.abs(fr[pi]);
  let onI = null;
  if (amp > 0.3) {
    for (let i = pi; i > 0; i--) if (fr[i] > -0.05 * amp && fr[i - 1] >= fr[i]) { onI = i; break; }
  }
  return {
    fs: FS,
    sweepMs,
    data,
    truth: { present: amp > 0.3, amp, peak: pi / FS, onset: onI != null ? onI / FS : null, frac, imax: st?.imax ?? null, trueDistMm: geo.trueDistMm ?? null, cv },
    geo,
    noise: { z1, z2, zg, mains, white },
  };
}

/**
 * Mechanism-level feedback on the set-up and the last stimulation.
 * Returns [{ id, ok, text }]. Wording uses surface landmarks, not the hidden nerve.
 */
export function explainSetup({ geo, protocol, intensity, machine, tempC, tempChecked, site }) {
  const out = [];
  const H = protocol.hints || {};
  const limb = H.limb || "foot";
  const targetMm = protocol.siteDistanceMm?.[site] ?? protocol.distanceMm;
  const add = (id, ok, text) => out.push({ id, ok, text });
  const cm = (mm) => (mm / 10).toFixed(1);
  if (!geo.placed.g1 || !geo.placed.g2) add("electrodes", false, "Place both recording electrodes (G1 and G2) on the skin.");
  else {
    if (!geo.onSkin.g1 || !geo.onSkin.g2) add("off-skin", false, "An electrode is off the limb, so that input is open: the trace fills with mains noise.");
    const d1 = geo.proj.g1.d;
    const pct = Math.round(100 / (1 + (d1 / FIELD_MM) ** 2));
    add("g1-nerve", d1 <= 5, d1 <= 5
      ? "G1 sits over the nerve course."
      : `G1 is about ${cm(d1)} cm from the nerve course, so it sees only about ${pct}% of the potential it would directly over the nerve. ${H.g1Where || ""}`);
    const sep = geo.separationMm;
    const [lo, hi] = protocol.separationMm;
    add("separation", sep >= lo - 3 && sep <= hi + 5, sep < lo - 3
      ? `G1 and G2 are only ${cm(sep)} cm apart along the nerve. Both pick up the volley at almost the same time, so their signals cancel and the SNAP shrinks.`
      : sep > hi + 5
        ? `G1 and G2 are ${cm(sep)} cm apart along the nerve. G2 records its own later deflection, which distorts the waveform and the duration.`
        : `G1-G2 spacing ${cm(sep)} cm along the nerve.`);
    if (geo.proj.g2.d > 15) add("g2-off", false, `G2 is about ${cm(geo.proj.g2.d)} cm off the nerve course, so the recording no longer matches the bipolar reference method: it becomes nearly monopolar, or it picks up a different nerve whose signal cancels part of G1's. ${H.g2Fix || ""}`);
  }
  if (!geo.placed.ground) add("ground", false, "No ground: expect a large stimulus artifact and mains noise.");
  else if (!geo.onSkin.ground) add("ground", false, "The ground is off the limb, so it is not grounding the patient.");
  else if (geo.groundBetween === false && !H.groundOnLimb) add("ground", false, "Place the ground between the stimulator and the recording electrodes to reduce the stimulus artifact.");
  else add("ground", true, H.groundOnLimb ? "Ground on the same limb." : "Ground placed between stimulator and recording electrodes.");
  const st = geo.stim;
  if (!st) add("stim", false, H.stimWhere || "Place the stimulator over the nerve.");
  else {
    if (!st.onSkin) add("stim-skin", false, "The stimulator is not fully on the skin.");
    add("stim-nerve", st.pc.d <= 6, st.pc.d <= 6
      ? "The cathode is over the nerve course."
      : `The cathode is about ${cm(st.pc.d)} cm from the nerve, so far more current is needed (maximal response at about ${Math.round(st.imax)} mA).`);
    if (st.align < 0.7) add("stim-angle", false, "The stimulator is rotated across the nerve. Align both poles along the nerve so the current flows along it.");
    add("polarity", !st.reversed, st.reversed
      ? "The anode lies between the cathode and the recording electrodes. The impulse starts under the cathode, which is now farther from G1, so the latency is longer, and the anode can partly block the volley, so more current is needed. Turn the stimulator so the cathode faces G1."
      : "Cathode toward the recording electrodes.");
    if (geo.trueDistMm != null) {
      const off = Math.abs(geo.trueDistMm - targetMm);
      add("distance", off <= 10, off <= 10
        ? `Stimulation about ${cm(geo.trueDistMm)} cm from G1 along the nerve.`
        : `The cathode is about ${cm(geo.trueDistMm)} cm from G1 along the nerve, but the reference values for this site assume ${cm(targetMm)} cm, so the comparison does not apply.`);
    }
    if (intensity > 0 && st.imax) {
      if (intensity < 1.2 * st.imax) add("supramax", false, "The response may still be submaximal: raise the current until the amplitude stops growing, then add about 20%.");
      else if (intensity > 1.8 * st.imax) add("supramax", false, "Far more current than needed: more discomfort and stimulus artifact without a larger response.");
      else add("supramax", true, "Supramaximal stimulation.");
    }
  }
  const s = protocol.settings;
  add("settings", machine.gain <= 50 && machine.lff >= 10 && machine.lff <= 20 && machine.hff >= 2000 && machine.hff <= 3000,
    `Sensory settings for this protocol: ${s.gain} µV/div, low filter ${s.lff} Hz, high filter ${s.hff / 1000} kHz.`);
  if (!tempChecked) add("temp", false, `Measure the ${limb} temperature first.`);
  else add("temp", tempC >= protocol.targetTempC, tempC >= protocol.targetTempC ? `${limb[0].toUpperCase()}${limb.slice(1)} warm enough.` : `The ${limb} is ${tempC.toFixed(1)} °C; warm it to at least ${protocol.targetTempC} °C. Cold slows conduction and enlarges the SNAP.`);
  return out;
}
