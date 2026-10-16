import React, { useMemo, useRef, useState } from "react";
import LimbDiagram from "./LimbDiagram.jsx";
import NcsTrace from "./NcsTrace.jsx";
import { autoMark, measuredSegment, simulate } from "../../ncs/generator.js";
import { flagsFor, measurements, techniqueChecks } from "../../ncs/grading.js";
import { emptyStudyState } from "../../ncs/state.js";
import { AVERAGES, GAINS, HFFS, LFFS, LIMB_REF_TEMP, SITES, STIM_SITES, STUDIES, SWEEPS, gainLabel, stimSitesFor } from "../../ncs/studies.js";

/**
 * Practical NCS bench: place G1, G2 and ground, choose the stimulation site,
 * distance and polarity, set the machine, stimulate, mark and measure.
 * Parent receives the full state through onChange for grading.
 */


const fmt = (v, d = 2) => (v == null || Number.isNaN(v) ? "-" : v.toFixed(d));
const fmtAmp = (uv, type) => (uv == null ? "-" : type === "motor" ? `${(uv / 1000).toFixed(1)} mV` : `${uv.toFixed(0)} µV`);

function Select({ label, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900">
        {children}
      </select>
    </label>
  );
}

export default function NcsWorkbench({ studyIds, patient, env, setEnv, states, setStates, allowTempEdit, initialStudy }) {
  const [studyId, setStudyId] = useState(initialStudy || studyIds[0]);
  const [tool, setTool] = useState(null);
  const [markMode, setMarkMode] = useState(null);
  const [showChecks, setShowChecks] = useState(false);
  const seed = useRef(1);
  const study = STUDIES[studyId];
  const st = states[studyId] || emptyStudyState(studyId);
  const limb = study.limb;
  const temp = env.temp[limb];

  const update = (fn) => setStates((all) => ({ ...all, [studyId]: fn(all[studyId] || emptyStudyState(studyId)) }));
  const setSetup = (patch) => update((s) => ({ ...s, setup: { ...s.setup, ...patch } }));
  const setMachine = (patch) => update((s) => ({ ...s, machine: { ...s.machine, ...patch } }));

  const pick = (siteId) => {
    if (!tool) return;
    setSetup({ [tool]: siteId });
    setTool(tool === "g1" ? "g2" : tool === "g2" ? "ground" : null);
  };

  const stimulate = () => {
    seed.current += 1;
    const sweep = simulate({
      studyId,
      stimSiteId: st.stimSite,
      setup: { ...st.setup, ground: st.setup.ground, lff: +st.machine.lff, hff: +st.machine.hff, averages: +st.machine.averages },
      patient: { ...patient, temp: env.temp },
      intensity: +st.intensity,
      sweepMs: st.machine.sweep * 10,
      seed: seed.current,
    });
    if (temp < LIMB_REF_TEMP[limb]) setEnv((e) => ({ ...e, recordedCold: { ...e.recordedCold, [limb]: true } }));
    update((s) => ({
      ...s,
      sweeps: { ...s.sweeps, [s.stimSite]: { ...(s.sweeps[s.stimSite] || {}), sweep, intensity: +s.intensity, marks: {} } },
    }));
  };

  const onMark = (site, mode, ms) =>
    update((s) => (s.sweeps[site] ? { ...s, sweeps: { ...s.sweeps, [site]: { ...s.sweeps[site], marks: { ...s.sweeps[site].marks, [mode]: ms } } } } : s));

  const autoMarkAll = () =>
    update((s) => {
      const sweeps = { ...s.sweeps };
      for (const [k, r] of Object.entries(sweeps)) {
        const m = autoMark(r.sweep, study.type);
        sweeps[k] = { ...r, marks: { onset: +m.onset.toFixed(2), peak: +m.peak.toFixed(2) } };
      }
      return { ...s, sweeps };
    });

  const measureSeg = (site) =>
    update((s) => ({ ...s, sweeps: { ...s.sweeps, [site]: { ...s.sweeps[site], distCm: measuredSegment(studyId, site, s.setup) } } }));

  const siteList = stimSitesFor(study);
  const rows = siteList
    .filter((s) => st.sweeps[s])
    .map((s) => {
      const r = st.sweeps[s];
      const label = s === study.distalStim ? study.distalLabel : study.proximal.find((p) => p.site === s).label;
      return { id: s, label, sub: `${r.intensity} mA`, sweep: r.sweep, marks: r.marks };
    });
  const meas = useMemo(() => measurements(studyId, st), [studyId, st]);
  const checks = useMemo(() => (showChecks ? techniqueChecks(studyId, st, { ...env, patient }) : []), [showChecks, studyId, st, env, patient]);
  const limbStims = Object.entries(STIM_SITES).filter(([, s]) => s.limb === limb);
  const last = st.sweeps[st.stimSite];

  return (
    <div className="space-y-4">
      {studyIds.length > 1 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Studies">
          {studyIds.map((id) => (
            <button key={id} type="button" role="tab" aria-selected={id === studyId}
              onClick={() => { setStudyId(id); setTool(null); setMarkMode(null); }}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${id === studyId ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
              {STUDIES[id].short}{Object.keys(states[id]?.sweeps || {}).length ? " ✓" : ""}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-5">
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">1. Patient and electrodes · {study.label}</h3>
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="text-slate-600">Skin temperature ({limb === "arm" ? "hand" : "foot"}):</span>
            {env.tempChecked[limb] ? (
              <strong className={temp < LIMB_REF_TEMP[limb] ? "text-rose-700" : "text-emerald-700"}>{temp.toFixed(1)} °C</strong>
            ) : (
              <button type="button" className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold" onClick={() => setEnv((e) => ({ ...e, tempChecked: { ...e.tempChecked, [limb]: true } }))}>Measure</button>
            )}
            <button type="button" className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900" onClick={() => setEnv((e) => ({ ...e, temp: { ...e.temp, [limb]: LIMB_REF_TEMP[limb] + 1.5 }, tempChecked: { ...e.tempChecked, [limb]: true } }))}>Warm the limb</button>
            {allowTempEdit && (
              <label className="flex items-center gap-1 text-xs text-slate-600">
                set
                <input type="range" min={24} max={35} step={0.5} value={temp} onChange={(e) => setEnv((x) => ({ ...x, temp: { ...x.temp, [limb]: +e.target.value } }))} />
              </label>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {[["g1", "Place G1 (active)", "bg-rose-600"], ["g2", "Place G2 (reference)", "bg-slate-800"], ["ground", "Place ground", "bg-green-600"]].map(([k, label, color]) => (
              <button key={k} type="button" onClick={() => setTool(tool === k ? null : k)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${tool === k ? `${color} text-white` : "border border-slate-300 bg-white text-slate-700"}`}>{label}</button>
            ))}
            <label className="flex items-center gap-1.5 text-xs text-slate-700">
              <input type="checkbox" checked={!!st.setup.skinPrepped} onChange={(e) => setSetup({ skinPrepped: e.target.checked })} /> Skin cleaned and prepared
            </label>
            {study.proximal.some((p) => p.acrossElbow) && (
              <label className="flex items-center gap-1.5 text-xs text-slate-700">
                <input type="checkbox" checked={!!st.setup.elbowFlexed} onChange={(e) => setSetup({ elbowFlexed: e.target.checked })} /> Elbow flexed (about 70-90°)
              </label>
            )}
          </div>
          {tool && <p className="text-xs text-indigo-700">Click a site on the diagram (or choose below) for {tool === "g1" ? "G1" : tool === "g2" ? "G2" : "the ground"}.</p>}
          <LimbDiagram studyId={studyId} setup={st.setup} stimSiteId={st.stimSite} tool={tool} onPick={pick} />
          <div className="grid gap-2 sm:grid-cols-3">
            {[["g1", "G1 (active)"], ["g2", "G2 (reference)"], ["ground", "Ground"]].map(([k, label]) => (
              <Select key={k} label={label} value={st.setup[k]} onChange={(v) => setSetup({ [k]: v || null })}>
                <option value="">Not placed</option>
                {Object.entries(SITES[limb]).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
                {k === "ground" && <option value="otherLimb">On the other limb</option>}
              </Select>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 xl:col-span-3">
          <h3 className="text-sm font-semibold text-slate-900">2. Machine and stimulation</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Select label="Gain" value={st.machine.gain} onChange={(v) => setMachine({ gain: +v })}>{GAINS.filter((g) => (study.type === "motor" ? g >= 500 : g <= 100)).map((g) => <option key={g} value={g}>{gainLabel(g)}</option>)}</Select>
            <Select label="Sweep" value={st.machine.sweep} onChange={(v) => setMachine({ sweep: +v })}>{SWEEPS.map((g) => <option key={g} value={g}>{g} ms/div</option>)}</Select>
            <Select label="Low filter" value={st.machine.lff} onChange={(v) => setMachine({ lff: +v })}>{LFFS.map((g) => <option key={g} value={g}>{g} Hz</option>)}</Select>
            <Select label="High filter" value={st.machine.hff} onChange={(v) => setMachine({ hff: +v })}>{HFFS.map((g) => <option key={g} value={g}>{g >= 1000 ? `${g / 1000} kHz` : `${g} Hz`}</option>)}</Select>
            <Select label="Averages" value={st.machine.averages} onChange={(v) => setMachine({ averages: +v })}>{AVERAGES.map((g) => <option key={g} value={g}>{g}</option>)}</Select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Select label="Stimulation site" value={st.stimSite} onChange={(v) => update((s) => ({ ...s, stimSite: v }))}>
              {limbStims.map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
            </Select>
            {STIM_SITES[st.stimSite]?.distal && (
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Distance from G1 (cathode to G1): {st.setup.distalCm} cm
                <input type="range" min={4} max={18} step={0.5} value={st.setup.distalCm} onChange={(e) => setSetup({ distalCm: +e.target.value })} />
              </label>
            )}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
              Current: {st.intensity} mA (0.2 ms pulse)
              <input type="range" min={0} max={100} step={1} value={st.intensity} onChange={(e) => update((s) => ({ ...s, intensity: +e.target.value }))} />
            </label>
            <button type="button" onClick={() => setSetup({ cathodeDistal: !(st.setup.cathodeDistal !== false) })} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              Flip polarity (cathode {st.setup.cathodeDistal === false ? "proximal" : "distal"})
            </button>
            <button type="button" onClick={stimulate} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Stimulate</button>
          </div>
          {last && <p className="text-xs text-slate-500">Tip: raise the current until the response stops growing, then add about 20% for a supramaximal response.</p>}
          {last?.sweep.problems.some((p) => p.code === "current-spread") && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <strong>Observation:</strong> muscles supplied by the {study.spread.nerve} nerve twitched as well. {last.sweep.problems.find((p) => p.code === "current-spread").text}
            </p>
          )}

          <NcsTrace rows={rows} gain={st.machine.gain} sweepMsPerDiv={st.machine.sweep} markMode={markMode} onMark={onMark} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setMarkMode(markMode === "onset" ? null : "onset")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${markMode === "onset" ? "bg-sky-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>Mark onset (O)</button>
            <button type="button" onClick={() => setMarkMode(markMode === "peak" ? null : "peak")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${markMode === "peak" ? "bg-pink-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>Mark negative peak (P)</button>
            <button type="button" onClick={autoMarkAll} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">Machine auto-mark</button>
            {markMode && <span className="self-center text-xs text-slate-500">Click on a trace to place the {markMode} cursor.</span>}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">3. Measurements · {study.short}</h3>
          <button type="button" onClick={() => setShowChecks((v) => !v)} className="rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800">
            {showChecks ? "Hide technique check" : "Check my technique"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-1 pr-3">Site</th>
                <th className="py-1 pr-3">{study.type === "motor" ? "Onset latency" : "Onset / peak latency"}</th>
                <th className="py-1 pr-3">Amplitude</th>
                <th className="py-1 pr-3">Distance</th>
                <th className="py-1 pr-3">Velocity</th>
                <th className="py-1 pr-3">Compared with limits</th>
              </tr>
            </thead>
            <tbody>
              {meas.map((r, i) => {
                const flags = flagsFor(studyId, r, i === 0, i > 0 ? meas[i - 1].cv : null);
                const isProx = study.type === "motor" && r.site !== study.distalStim;
                return (
                  <tr key={r.site} className="border-t border-slate-100">
                    <td className="py-1.5 pr-3 font-medium text-slate-800">{r.site === study.distalStim ? study.distalLabel : study.proximal.find((p) => p.site === r.site)?.label}</td>
                    <td className="py-1.5 pr-3">{study.type === "motor" ? `${fmt(r.onset)} ms` : `${fmt(r.onset)} / ${fmt(r.peak)} ms`}</td>
                    <td className="py-1.5 pr-3">{fmtAmp(r.amp, study.type)}</td>
                    <td className="py-1.5 pr-3">
                      {isProx ? (r.dist != null ? `${r.dist} cm` : <button type="button" onClick={() => measureSeg(r.site)} className="rounded border border-slate-300 px-2 py-0.5 text-xs">Measure segment</button>) : `${r.dist ?? st.setup.distalCm} cm`}
                    </td>
                    <td className="py-1.5 pr-3">{r.cv ? `${r.cv.toFixed(0)} m/s` : "-"}</td>
                    <td className={`py-1.5 pr-3 ${r.onset == null || r.peak == null ? "text-slate-500" : flags.length ? "text-rose-700" : "text-emerald-700"}`}>{r.onset == null || r.peak == null ? "Mark onset and peak" : flags.length ? flags.join(", ") : "Within limits"}</td>
                  </tr>
                );
              })}
              {meas.length === 0 && <tr><td colSpan={6} className="py-2 text-slate-500">No responses recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Reference limits (this app's table; labs set their own): {study.type === "motor"
            ? `distal latency ≤ ${study.limits.lat} ms at ${study.stdDist} cm, amplitude ≥ ${study.limits.amp / 1000} mV, velocity ≥ ${study.limits.cv} m/s${study.limits.cvAcross ? ` (across ${study.nerve === "ulnar" ? "elbow" : "knee"} ≥ ${study.limits.cvAcross} m/s)` : ""}`
            : `peak latency ≤ ${study.limits.peak} ms at ${study.stdDist} cm, amplitude ≥ ${study.limits.amp} µV`}.
        </p>
        {showChecks && (
          <ul className="mt-3 space-y-1.5">
            {checks.map((c) => (
              <li key={c.label} className={`rounded-lg px-3 py-2 text-sm ${c.ok ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>
                <strong>{c.ok ? "✓ " : "✗ "}{c.label}.</strong> {c.detail}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
