import { biquad, FS, gaussFrom, mulberry32, recruitFraction } from "./generator.js";
import { dist, inPolygon, polylineLength, project } from "./geometry.js";
import { CONTACT, stimPoles } from "./fieldSim.js";
import { localToGlobal } from "./panels.js";

/**
 * Field-based motor NCS simulation on an anatomy model.
 *
 * Each muscle that the recording electrodes can see is a source with a
 * motor point (end-plate zone). An electrode over the motor point sees a
 * negative-first CMAP; over the muscle but away from the motor point it sees
 * a positive dip first; off the muscle it sees only a small volume-conducted,
 * positive-first potential. The recording is V(G1) - V(G2), so a reference on
 * active muscle cancels part of the response.
 *
 * The stimulator excites every nerve whose route passes under it, with a
 * threshold set by the cathode's distance from the nerve, the nerve's depth,
 * the stimulator's rotation and its polarity. Current spread to a neighbouring
 * nerve therefore follows from the geometry. Latency is the travel time along
 * the route from the cathode to the muscle plus a terminal delay.
 *
 * Effect sizes are teaching approximations that need calibration and expert review.
 */

const STIM_MM = 14; // effective distance (lateral offset and depth) at which the maximal current has doubled
const BASE_MA = 18.6; // maximal current for a nerve directly under the cathode at zero depth

const g = (t, mu, sd) => Math.exp(-0.5 * ((t - mu) / sd) ** 2);
function bump(x, tau, k = 2) {
  if (x <= 0) return 0;
  const r = x / tau;
  return Math.pow(r, k) * Math.exp(k * (1 - r));
}

function ellipseCoords(p, s) {
  const a = (s.rot * Math.PI) / 180;
  const dx = p.x - s.cx, dy = p.y - s.cy;
  const u = dx * Math.cos(a) + dy * Math.sin(a);
  const v = -dx * Math.sin(a) + dy * Math.cos(a);
  return Math.hypot(u / s.rx, v / s.ry);
}

/** How strongly, and with what initial positivity, an electrode sees a muscle source. */
export function electrodeView(p, src) {
  const r = ellipseCoords(p, src);
  const dEP = dist(p, src.ep);
  if (r <= 1) return { inside: true, w: 0.25 + 0.75 / (1 + (dEP / 14) ** 2), lead: Math.max(0, Math.min(0.5, (dEP - 5) / 30)), dEP };
  const dEdge = (r - 1) * ((src.rx + src.ry) / 2);
  return { inside: false, w: 0.3 / (1 + (dEdge / 15) ** 2), lead: 0.6, dEP, dEdge };
}

// disp > 1 widens the CMAP (temporal dispersion over longer conduction distances).
function cmapShape(x, lead, disp = 1) {
  const shift = 0.9 * lead;
  const k = 1 - 0.5 * lead;
  return lead * bump(x, 0.7) - k * bump(x - shift, 2.2 * disp) + 0.42 * k * bump(x - shift - 2.6 * disp, 2.8 * disp);
}

// Travel time (ms) from arc length s0 to the end of the route; slower distal segment.
function travelTime(route, s0, nerve, cvScale) {
  let acc = 0, t = 0;
  for (let i = 1; i < route.length; i++) {
    const [x0, y0] = route[i - 1];
    const [x1, y1] = route[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const a = Math.max(acc, s0), b = acc + len;
    if (b > a) {
      const cv = ((y0 + y1) / 2 >= nerve.distalFromY ? nerve.distalCv : nerve.cv) * cvScale;
      t += (b - a) / cv;
    }
    acc += len;
  }
  return t;
}

/**
 * Coupling of the stimulator to one nerve route. When the stimulator sits on
 * a secondary panel (ctx.panelOf), the cathode is projected onto that panel's
 * drawing of the nerve and its arc length mapped onto the main route.
 */
function stimCoupling(model, nerveId, routeId, setup, ctx) {
  const nerve = model.NERVES[nerveId];
  const route = nerve.routes[routeId];
  const { cathode, anode } = stimPoles(setup.stim);
  const contactK = setup.contact?.stim === "good" ? 1 : setup.contact?.stim === "dry" ? 1.4 : 1.15;
  const panel = ctx?.panelOf?.(setup);
  if (panel) {
    const pn = panel.NERVES[nerveId];
    if (!pn) return { nerve, route, pc: { s: 0, d: Infinity, x: 0, y: 0 }, depth: Infinity, deff: Infinity, align: 0, reversed: false, imax: Infinity };
    const lc = project(cathode, pn.route), la = project(anode, pn.route);
    const depth = pn.depth(lc.y, lc);
    const deff = Math.hypot(lc.d, depth);
    const align = Math.abs(Math.cos(setup.stim.angle) * lc.tx + Math.sin(setup.stim.angle) * lc.ty);
    const reversed = align > 0.5 && la.s > lc.s;
    const imax = BASE_MA * (1 + (deff / STIM_MM) ** 2) * (1 + 0.5 * (1 - align)) * (reversed ? 1.3 : 1) * contactK;
    const g = localToGlobal(panel, model, nerveId, ctx.anchors, lc.s);
    return { nerve, route, pc: { ...lc, s: g, local: lc.s }, depth, deff, align, reversed, imax, panel: true };
  }
  const pc = project(cathode, route), pa = project(anode, route);
  const depth = nerve.depth(pc.y);
  const deff = Math.hypot(pc.d, depth);
  const align = Math.abs(Math.cos(setup.stim.angle) * pc.tx + Math.sin(setup.stim.angle) * pc.ty);
  const reversed = align > 0.5 && pa.s > pc.s; // anode lies distal, toward the muscle
  const imax = BASE_MA * (1 + (deff / STIM_MM) ** 2) * (1 + 0.5 * (1 - align)) * (reversed ? 1.3 : 1) * contactK;
  return { nerve, route, pc, pa, depth, deff, align, reversed, imax };
}

export function describeMotor(model, setup, opts = {}) {
  const onSkin = (p) => !!p && inPolygon(p, model.SKIN);
  const target = model.SOURCES.find((s) => s.id === opts.targetId) || model.SOURCES[0];
  const panel = opts.ctx?.panelOf?.(setup);
  const out = { placed: {}, onSkin: {}, views: {} };
  for (const k of ["g1", "g2", "ground"]) {
    out.placed[k] = !!setup[k];
    out.onSkin[k] = onSkin(setup[k]);
  }
  for (const k of ["g1", "g2"]) if (setup[k]) out.views[k] = Object.fromEntries(model.SOURCES.map((s) => [s.id, electrodeView(setup[k], s)]));
  if (setup.stim) {
    const { cathode, anode } = stimPoles(setup.stim);
    const tgt = stimCoupling(model, target.nerve, target.route, setup, opts.ctx);
    const nerves = {};
    for (const s of model.SOURCES) if (!nerves[s.nerve]) nerves[s.nerve] = stimCoupling(model, s.nerve, s.route, setup, opts.ctx);
    const stimOnSkin = panel ? inPolygon(cathode, panel.SKIN) && inPolygon(anode, panel.SKIN) : onSkin(cathode) && onSkin(anode);
    out.stim = { cathode, anode, onSkin: stimOnSkin, target: tgt, nerves, imax: tgt.imax, reversed: tgt.reversed, align: tgt.align, panel: !!panel };
    if (setup.g1 && !panel) out.surfaceDistMm = dist(setup.g1, cathode);
    out.nerveDistMm = polylineLength(tgt.route) - tgt.pc.s; // along the nerve, cathode to the muscle
  }
  out.target = target;
  if (setup.ground && setup.stim && setup.g1 && panel) out.groundBetween = true; // stimulation proximal to the whole limb segment
  else if (setup.ground && setup.stim && setup.g1) {
    const c = out.stim.cathode;
    const lo = Math.min(c.y, setup.g1.y) - 15, hi = Math.max(c.y, setup.g1.y) + 15;
    out.groundBetween = setup.ground.y >= lo && setup.ground.y <= hi;
  }
  return out;
}

/**
 * Simulate one stimulation.
 * setup: { g1, g2, ground, stim: {x, y, angle}, contact: {...} }
 * patient: { tempC, refTempC, ampFactor, cvFactor, termAdd }
 */
export function simulateMotor({ model, setup, machine = {}, patient = {}, intensity = 0, seed = 1, targetId, ctx }) {
  const sweepMs = (machine.sweep ?? 3) * 10;
  const n = Math.round(sweepMs * FS) + 1;
  const rng = mulberry32(seed);
  const geo = describeMotor(model, setup, { targetId, ctx });
  const resp = new Float64Array(n);
  const extra = new Float64Array(n);
  const dT = Math.max(0, (patient.refTempC ?? 32) - (patient.tempC ?? 32.5));
  const cvScale = (1 - 0.035 * dT) * (patient.cvFactor ?? 1);
  const rec = geo.onSkin.g1 && geo.onSkin.g2;
  const fired = {};

  if (rec && geo.stim?.onSkin) {
    for (const src of model.SOURCES) {
      const c = stimCoupling(model, src.nerve, src.route, setup, ctx);
      const frac = recruitFraction(intensity, c.imax);
      fired[src.id] = frac;
      if (frac <= 0) continue;
      const lat = (c.nerve.term + (patient.termAdd ?? 0)) * (1 + 0.08 * dT) + travelTime(c.route, c.pc.s, c.nerve, cvScale);
      // Longer conduction distance: slight physiological dispersion and amplitude fall.
      const pathMm = Math.max(0, polylineLength(c.route) - c.pc.s);
      const disp = 1 + 0.0006 * pathMm;
      const A = src.amp * (patient.ampFactor ?? 1) * frac * (1 + 0.025 * dT) / (1 + 0.0003 * pathMm);
      for (const [k, sign] of [["g1", 1], ["g2", -1]]) {
        const ev = geo.views[k][src.id];
        for (let i = 0; i < n; i++) resp[i] += sign * A * ev.w * cmapShape(i / FS - lat, ev.lead, disp);
      }
    }
  }

  if (geo.stim && intensity > 0 && geo.placed.g1) {
    const dC = Math.max(25, dist(geo.stim.cathode, setup.g1));
    const groundK = !geo.onSkin.ground ? 6 : geo.groundBetween ? 1 : 1.8;
    const art = 900 * (intensity / 20) * (60 / dC) ** 1.5 * groundK;
    for (let i = 0; i < n; i++) {
      const t = i / FS;
      extra[i] += art * (g(t, 0.05, 0.03) - 0.5 * g(t, 0.14, 0.04)) + 0.12 * art * Math.exp(-t / 0.3) * (t > 0.1 ? 1 : 0);
    }
  }
  const z = (k) => (geo.onSkin[k] ? CONTACT[setup.contact?.[k] ?? "good"].z : 1000);
  const z1 = z("g1"), z2 = z("g2"), zg = geo.placed.ground ? z("ground") : 1000;
  const k = 1 / Math.sqrt(Math.max(1, machine.averages ?? 1));
  const white = 3 * Math.sqrt((z1 + z2) / 6);
  const mains = Math.min(400, 0.5 + 0.4 * Math.abs(z1 - z2) + (zg >= 1000 ? 60 : zg > 20 ? 8 : 0));
  const drift = z1 > 20 || z2 > 20 ? 0.6 * (z1 + z2) : 0;
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
  let peakAbs = 0, pi = 0;
  for (let i = 0; i < n; i++) {
    data[i] = fr[i] + fe[i];
    peakAbs = Math.max(peakAbs, Math.abs(fr[i]));
    if (fr[i] < fr[pi]) pi = i;
  }
  let onI = null;
  if (peakAbs > 50) for (let i = Math.round(0.5 * FS); i < n; i++) if (Math.abs(fr[i]) > 0.02 * peakAbs) { onI = i; break; }
  return {
    fs: FS,
    sweepMs,
    data,
    truth: { present: peakAbs > 50, amp: Math.abs(Math.min(0, fr[pi])), peak: pi / FS, onset: onI != null ? onI / FS : null, positiveFirst: onI != null && fr[onI] > 0, imax: geo.stim?.imax ?? null, fired },
    geo,
    noise: { z1, z2, zg, mains, white },
  };
}

/**
 * Mechanism-level feedback for a motor stimulation. Study-specific wording
 * comes from protocol.hints.
 */
export function explainMotor({ geo, protocol, intensity, machine, tempC, tempChecked, site, model, setup }) {
  const out = [];
  const add = (id, ok, text) => out.push({ id, ok, text });
  const cm = (mm) => (mm / 10).toFixed(1);
  const H = protocol.hints;
  const target = geo.target || model.SOURCES[0];
  const nerveName = model.NERVES[target.nerve].label.toLowerCase();
  if (!geo.placed.g1 || !geo.placed.g2) add("electrodes", false, "Place both recording electrodes (G1 and G2).");
  else {
    if (!geo.onSkin.g1 || !geo.onSkin.g2) add("off-skin", false, "An electrode is off the limb, so that input is open and the trace fills with mains noise.");
    const v1 = geo.views.g1[target.id];
    if (!v1.inside) add("g1-muscle", false, `G1 is not over the ${target.label}. It records only a small, positive-first potential conducted from a distance. ${H.g1Fix}`);
    else add("g1-mp", v1.dEP <= 6, v1.dEP <= 6
      ? `G1 is over the ${H.muscle} motor point, so the CMAP starts with a sharp negative takeoff.`
      : `G1 is on the ${H.muscle} about ${cm(v1.dEP)} cm from its motor point, so the potential starts away from G1 and the CMAP begins with a positive dip. Move G1 toward the middle of the muscle belly until the takeoff is negative and the amplitude is largest.`);
    const onMuscle = model.SOURCES.filter((s) => geo.views.g2[s.id].inside);
    add("g2", onMuscle.length === 0, onMuscle.length === 0
      ? H.g2Ok
      : `G2 sits on the ${onMuscle.map((s) => s.label).join(" and ")}, so it picks up the same muscle activity and part of the response cancels. ${H.g2Fix}`);
  }
  if (!geo.placed.ground) add("ground", false, "No ground: expect a large stimulus artifact and mains noise.");
  else if (!geo.onSkin.ground) add("ground", false, "The ground is off the limb.");
  else add("ground", geo.groundBetween !== false, geo.groundBetween === false ? "Place the ground between the stimulator and the recording electrodes." : "Ground placed between stimulator and recording electrodes.");
  const st = geo.stim;
  if (!st) add("stim", false, `Place the stimulator over the ${nerveName}.`);
  else {
    const t = st.target;
    if (H.sitePanel && site && H.sitePanel[site] !== undefined && H.sitePanel[site] !== st.panel) {
      add("panel", false, H.sitePanel[site] ? `Stimulate the ${H.siteNames[site]} site from the medial elbow view.` : `Stimulate the ${H.siteNames[site]} site on the forearm and hand view.`);
    }
    add("stim-nerve", t.pc.d <= 6, t.pc.d <= 6
      ? `The cathode is over the ${nerveName}.`
      : `The cathode is about ${Number.isFinite(t.pc.d) ? cm(t.pc.d) : "far"} cm from the ${nerveName}${H.siteHint?.[site] ? ` (${H.siteHint[site]})` : ""}, so far more current is needed${Number.isFinite(t.imax) ? ` (maximal at about ${Math.round(t.imax)} mA)` : ""}.`);
    if (t.align < 0.7) add("stim-angle", false, "The stimulator is rotated across the nerve; align both poles along it.");
    add("polarity", !t.reversed, t.reversed
      ? "The anode lies between the cathode and the recording electrodes. The impulse starts under the cathode, now farther from the muscle, so the latency is longer, and the anode can partly block it. Turn the stimulator so the cathode points toward the hand."
      : "Cathode toward the recording electrodes.");
    if (site === "distal" && geo.surfaceDistMm != null) {
      const off = Math.abs(geo.surfaceDistMm - protocol.distanceMm);
      add("distance", off <= 5, off <= 5
        ? `Cathode ${cm(geo.surfaceDistMm)} cm from G1.`
        : `The cathode is ${cm(geo.surfaceDistMm)} cm from G1, but the distal latency limit assumes ${cm(protocol.distanceMm)} cm, so the comparison does not apply.`);
    }
    if (H.elbowFlexed && (site === "be" || site === "ae") && setup && !setup.elbowFlexed) {
      add("elbow", false, "The elbow is straight. The ulnar nerve then lies slack in the groove, so a tape on the skin measures less than the nerve length and the across-elbow velocity comes out falsely slow. Flex the elbow to about 70-90° for stimulation and measurement.");
    }
    if (intensity > 0) {
      if (Number.isFinite(t.imax) && intensity < 1.2 * t.imax) add("supramax", false, "The response may still be submaximal: raise the current until the amplitude stops growing, then add about 20%.");
      else if (Number.isFinite(t.imax)) add("supramax", true, `Supramaximal for the ${nerveName}.`);
      for (const [nid, c] of Object.entries(st.nerves).filter(([nid]) => nid !== target.nerve)) {
        if (Number.isFinite(c.imax) && recruitFraction(intensity, c.imax) > 0.1) add("spread", false, `At ${Math.round(intensity)} mA the current also reaches the ${model.NERVES[nid].label.toLowerCase()}, whose muscles add a volume-conducted component and change the size and shape of the response. Lower the current or move the cathode onto the ${nerveName}.`);
      }
    }
  }
  const s = protocol.settings;
  add("settings", machine.gain >= 2000 && machine.gain <= 5000 && machine.lff >= 2 && machine.lff <= 10 && machine.hff >= 5000,
    `Motor settings for this protocol: ${s.gain / 1000} mV/div, low filter ${s.lff} Hz, high filter ${s.hff / 1000} kHz.`);
  if (!tempChecked) add("temp", false, "Measure the hand temperature first.");
  else add("temp", tempC >= protocol.targetTempC, tempC >= protocol.targetTempC ? "Hand warm enough." : `The hand is ${tempC.toFixed(1)} °C; warm it to at least ${protocol.targetTempC} °C. Cold prolongs latencies and slows conduction.`);
  return out;
}
