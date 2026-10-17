import { dist } from "./geometry.js";

/**
 * Measurement, flags and scoring for one study recorded in the interactive
 * workspace. Shared by the workspace's Assessment mode and the graded cases.
 *
 * state = { records: {siteId: {sweep, intensity, temp, setup, cathode}},
 *           marks: {siteId: {onset, peak}}, dists: {siteId: "cm"},
 *           tempChecked, machine }
 */

export const fmtAmpFor = (kind) => (uv) => (uv == null ? "-" : kind === "motor" ? `${(uv / 1000).toFixed(2)} mV` : `${uv.toFixed(1)} µV`);

export function ampOf(state, sid) {
  const r = state.records[sid], m = state.marks[sid] || {};
  if (!r || m.onset == null || m.peak == null) return null;
  const d = r.sweep.data, fs = r.sweep.fs;
  return Math.abs(d[Math.round(m.peak * fs)] - d[Math.round(m.onset * fs)]);
}

export const onsetOf = (state, sid) => state.marks[sid]?.onset ?? null;

export function prevSite(config, sid) {
  const i = config.sites.findIndex((x) => x.id === sid);
  return i > 0 ? config.sites[i - 1].id : null;
}

/** Velocity from the learner's distance and marks (sensory: per site; motor: per segment). */
export function cvFor(config, state, sid) {
  const d = +state.dists[sid];
  if (!d) return null;
  if (config.kind !== "motor") return onsetOf(state, sid) ? (10 * d) / onsetOf(state, sid) : null;
  const prev = prevSite(config, sid);
  if (!prev) return null;
  const a = onsetOf(state, prev), b = onsetOf(state, sid);
  return a != null && b != null && b > a ? (10 * d) / (b - a) : null;
}

/** Comparison of the learner's values with the protocol's reference limits. */
export function flagsFor(config, state, sid) {
  const P = config.protocol;
  const out = [];
  const L = P.siteLimits?.[sid] || P.limits;
  const a = ampOf(state, sid);
  if (config.kind === "motor") {
    const on = onsetOf(state, sid);
    if (sid === "distal" && on != null && on > L.lat) out.push("distal latency prolonged");
    if (sid === "distal" && a != null && a / 1000 < L.amp) out.push("low amplitude");
    const across = config.sites.find((x) => x.id === sid)?.across;
    const cv = cvFor(config, state, sid);
    if (sid !== "distal" && cv != null && cv < (across && L.cvAcross ? L.cvAcross : L.cv)) out.push(across ? "slow velocity across the lesion-prone segment" : "slow velocity");
    const prev = prevSite(config, sid);
    const maxDrop = P.maxDrop ?? 0.2; // tibial studies allow much larger normal drops
    if (prev && a != null && ampOf(state, prev) != null && a < (1 - maxDrop) * ampOf(state, prev)) out.push(`amplitude drop over ${Math.round(maxDrop * 100)}% from the previous site`);
  } else {
    if (state.marks[sid]?.peak != null && state.marks[sid].peak > L.peak) out.push("peak latency prolonged");
    if (a != null && a < L.amp) out.push("low amplitude");
  }
  return out;
}

/** Rows for a results table. */
export function resultRows(config, state) {
  return config.sites.map((s) => {
    const m = state.marks[s.id] || {};
    return {
      site: s.id, label: s.label, recorded: !!state.records[s.id], onset: m.onset ?? null, peak: m.peak ?? null,
      amp: ampOf(state, s.id), cv: cvFor(config, state, s.id), marked: m.onset != null && m.peak != null, flags: flagsFor(config, state, s.id),
    };
  });
}

/** Technique items and measurement accuracy against the true values. */
export function assessStudy(config, state) {
  const { protocol: P, model, kind } = config;
  const motor = kind === "motor";
  const fmtAmp = fmtAmpFor(kind);
  const items = [];
  for (const s of config.sites) {
    const r = state.records[s.id];
    if (!r) { items.push({ ok: false, text: `${s.label}: no response recorded.` }); continue; }
    for (const f of config.explain({ geo: r.sweep.geo, protocol: P, intensity: r.intensity, machine: state.machine, tempC: r.temp, tempChecked: state.tempChecked, site: s.id, model, setup: r.setup })) {
      if (!items.some((x) => x.id === f.id && x.ok === f.ok && x.text.endsWith(f.text))) items.push({ ...f, text: `${s.label}: ${f.text}` });
    }
  }
  const meas = [];
  for (const s of config.sites) {
    const r = state.records[s.id];
    const t = r?.sweep.truth;
    if (!t?.present) continue;
    const m = state.marks[s.id] || {};
    meas.push({ ok: m.onset != null && t.onset != null && Math.abs(m.onset - t.onset) <= 0.2, text: `${s.label} onset: you marked ${m.onset?.toFixed(2) ?? "nothing"} ms; the screen shows about ${t.onset?.toFixed(2)} ms.` });
    if (!motor) meas.push({ ok: m.peak != null && Math.abs(m.peak - t.peak) <= 0.2, text: `${s.label} peak: you marked ${m.peak?.toFixed(2) ?? "nothing"} ms; the screen shows about ${t.peak.toFixed(2)} ms.` });
    const a = ampOf(state, s.id);
    meas.push({ ok: a != null && Math.abs(a - t.amp) <= 0.15 * t.amp, text: `${s.label} amplitude: you measured ${a != null ? fmtAmp(a) : "nothing"}; the screen shows about ${fmtAmp(t.amp)}.` });
  }
  const dists = state.dists;
  const entered = (sid) => dists[sid] !== undefined && dists[sid] !== "";
  for (const s of config.sites.filter((x) => !motor || x.id === "distal")) {
    const r = state.records[s.id];
    if (!r) continue;
    const actual = motor ? r.sweep.geo.surfaceDistMm : r.sweep.geo.trueDistMm;
    if (actual != null) meas.push({ ok: entered(s.id) && Math.abs(+dists[s.id] * 10 - actual) <= 5, text: `${s.label} distance: you entered ${dists[s.id] || "nothing"} cm; it was ${(actual / 10).toFixed(1)} cm.` });
    if (!motor && r.sweep.truth.onset && cvFor(config, state, s.id)) {
      const trueCv = r.sweep.geo.trueDistMm / r.sweep.truth.onset;
      meas.push({ ok: Math.abs(cvFor(config, state, s.id) - trueCv) <= 3, text: `${s.label} velocity: you calculated ${cvFor(config, state, s.id).toFixed(0)} m/s; with the true distance and onset it is about ${trueCv.toFixed(0)} m/s.` });
    }
  }
  if (motor) {
    for (const st of config.sites) {
      const prev = prevSite(config, st.id);
      const a = state.records[prev], b = state.records[st.id];
      if (!prev || !a || !b) continue;
      const sa = a.sweep.geo.stim?.target?.pc?.s, sb = b.sweep.geo.stim?.target?.pc?.s;
      if (sa == null || sb == null) continue;
      const nerveSeg = Math.abs(sa - sb);
      meas.push({ ok: entered(st.id) && Math.abs(+dists[st.id] * 10 - nerveSeg) <= 10, text: `${st.label} segment: you entered ${dists[st.id] || "nothing"} cm; the nerve between the two cathode positions is ${(nerveSeg / 10).toFixed(1)} cm.` });
      const t1 = a.sweep.truth.onset, t2 = b.sweep.truth.onset;
      const cv = cvFor(config, state, st.id);
      if (t1 != null && t2 != null && t2 > t1 && cv) {
        const trueCv = nerveSeg / (t2 - t1);
        meas.push({ ok: Math.abs(cv - trueCv) <= 4, text: `${st.label} velocity: you calculated ${cv.toFixed(0)} m/s; with the true nerve length and onsets it is about ${trueCv.toFixed(0)} m/s.` });
      }
    }
  }
  return { items: items.length ? items : [{ ok: false, text: "No response recorded." }], meas };
}

/** Surface distance between two recorded cathodes (for display). */
export const cathodeGap = (a, b) => (a?.cathode && b?.cathode ? dist(a.cathode, b.cathode) : null);
