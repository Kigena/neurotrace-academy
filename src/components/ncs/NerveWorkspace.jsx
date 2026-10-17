import React, { useCallback, useEffect, useRef, useState } from "react";
import AnatomyCanvas from "./AnatomyCanvas.jsx";
import NcsTrace from "./NcsTrace.jsx";
import { CONTACT, stimPoles } from "../../ncs/fieldSim.js";
import { autoMark } from "../../ncs/generator.js";
import { curveLength } from "../../ncs/geometry.js";
import { carryStimulator } from "../../ncs/panels.js";
import { ampOf as ampOfS, assessStudy, cvFor as cvForS, fmtAmpFor, flagsFor } from "../../ncs/assess.js";
import { AVERAGES, HFFS, LFFS, SWEEPS, gainLabel } from "../../ncs/studies.js";

/**
 * Interactive NCS workspace for one study configuration (src/ncs/workspaces.js):
 * the limb is the main interactive area, machine and patient controls sit
 * beside it and the waveform below. Modes: Guided (targets, nerve layer,
 * explanations), Practice (feedback after each stimulation) and Assessment
 * (no help until submission, then a breakdown of errors).
 */

const MODES = [
  ["guided", "Guided", "Landmarks, target zones and the nerve layer are available, with explanations after every stimulation."],
  ["practice", "Practice", "Targets and nerves are hidden. Feedback follows each stimulation."],
  ["assessment", "Assessment", "Set up, record, measure and submit on your own. You get a breakdown afterwards."],
];
const COMPARE_COLORS = ["#38bdf8", "#f472b6", "#a3e635", "#c084fc"];
const TOOLS = [["move", "Move / pan"], ["g1", "Place G1"], ["g2", "Place G2"], ["ground", "Place ground"], ["stim", "Place stimulator"], ["tape", "Tape measure"]];
const STIM_HALF = 15;
const freshContact = () => ({ g1: "unprepped", g2: "unprepped", ground: "unprepped", stim: "unprepped" });
const posKey = (s) => JSON.stringify([s.g1, s.g2, s.ground, s.stim, s.contact]);

/** Starting set-up, optionally pre-placed from place names (used by cases that start with a set-up to fix). */
function presetSetup(config, preset) {
  const base = { g1: null, g2: null, ground: null, stim: null, contact: freshContact(), elbowFlexed: false };
  if (!preset) return base;
  const P = config.model.PLACES;
  const pt = (k) => (preset[k] && P[preset[k]] ? { x: P[preset[k]].x, y: P[preset[k]].y } : null);
  const out = { ...base, g1: pt("g1"), g2: pt("g2"), ground: pt("ground") };
  if (preset.contact) out.contact = { g1: preset.contact, g2: preset.contact, ground: preset.contact, stim: preset.contact };
  if (preset.stim && P[preset.stim]) {
    const c = P[preset.stim];
    out.stim = { x: c.x, y: c.y - STIM_HALF, angle: Math.PI / 2, panel: "main" }; // cathode on the spot, anode proximal
  }
  return out;
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">{label}{children}</label>;
}
const sel = "rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900";

function RecruitPlot({ points, unit }) {
  if (!points.length) return <p className="text-xs text-slate-500">Each stimulation at this placement and site adds a point here, so you can see the response reach a plateau.</p>;
  const maxI = Math.max(40, ...points.map((p) => p.I));
  const maxA = Math.max(unit === "mV" ? 1000 : 5, ...points.map((p) => p.amp)) * 1.15;
  const W = 260, H = 110, L = 30, B = 20;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Amplitude against current">
      <line x1={L} y1={H - B} x2={W - 4} y2={H - B} stroke="#94a3b8" />
      <line x1={L} y1={4} x2={L} y2={H - B} stroke="#94a3b8" />
      <text x={W / 2} y={H - 4} fontSize="9" fill="#64748b" textAnchor="middle">current (mA)</text>
      <text x={8} y={H / 2} fontSize="9" fill="#64748b" transform={`rotate(-90 8 ${H / 2})`} textAnchor="middle">amp ({unit})</text>
      {points.map((p, i) => <circle key={i} cx={L + (p.I / maxI) * (W - L - 8)} cy={H - B - (p.amp / maxA) * (H - B - 8)} r="3.5" fill="#6366f1" />)}
      <text x={W - 6} y={12} fontSize="9" fill="#64748b" textAnchor="end">max {maxI} mA</text>
    </svg>
  );
}

/**
 * Props for use inside a graded case: patient (pathology merged into every
 * simulation), initialTemp (limb temperature at the start), preset (electrode
 * and stimulator places by name), onState (reports records, marks and
 * distances to the case) and caseMode (hides the standalone Assessment mode,
 * since the case scores the work itself).
 */
export default function NerveWorkspace({ config, patient: casePatient, initialTemp, preset, onState, caseMode = false }) {
  const { model: MODEL, protocol: P, kind } = config;
  const motor = kind === "motor";
  const fmtAmp = fmtAmpFor(kind);
  const [mode, setMode] = useState(caseMode ? "practice" : "guided");
  const [panel, setPanel] = useState("main");
  const [views, setViews] = useState({});
  const [layers, setLayers] = useState({ muscle: false, bone: true, nerve: false, landmarks: true });
  const [tool, setTool] = useState("g1");
  const [setup, setSetup] = useState(() => presetSetup(config, preset));
  const [tapeState, setTapeState] = useState({ key: "main", pts: [], active: false });
  const [showTargets, setShowTargets] = useState(false);
  const [machine, setMachine] = useState({ ...P.settings });
  const [intensity, setIntensity] = useState(10);
  const startTemp = initialTemp ?? (motor ? 29.5 : 28.5);
  const [temp, setTemp] = useState({ c: startTemp, checked: false });
  const [site, setSite] = useState(config.sites[0].id);
  const [records, setRecords] = useState({});
  const [marks, setMarks] = useState({});
  const [markMode, setMarkMode] = useState(null);
  const [dists, setDists] = useState({});
  const [recruit, setRecruit] = useState({ key: "", points: [] });
  const [saved, setSaved] = useState([]);
  const [compare, setCompare] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [full, setFull] = useState(false);
  const seed = useRef(1);
  useEffect(() => {
    if (!full) return undefined;
    const onKey = (e) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  const panelDef = config.panels?.find((p) => p.id === panel);
  const viewModel = panel === "main" || !panelDef ? MODEL : panelDef.model(setup);
  const panelKey = panel === "main" ? "main" : `${panel}-${viewModel.id}`;
  const view = views[panelKey] ?? viewModel.VIEWS[0].box;
  const setView = useCallback((v) => setViews((all) => ({ ...all, [panelKey]: typeof v === "function" ? v(all[panelKey] ?? viewModel.VIEWS[0].box) : v })), [panelKey, viewModel]);
  const tape = tapeState.key === panelKey ? tapeState.pts : [];
  const tapeActive = tapeState.key === panelKey && tapeState.active;
  // Accepts a list or an updater (current points -> new points), so press and release in one gesture both count.
  const setTape = (v) => setTapeState((t) => {
    const cur = t.key === panelKey ? t.pts : [];
    return { key: panelKey, pts: typeof v === "function" ? v(cur) : v, active: t.key === panelKey ? t.active : false };
  });
  const setTapeActive = (active) => setTapeState((t) => ({ ...t, key: panelKey, active }));
  const stimPanel = setup.stim?.panel ?? "main";
  const canvasSetup = {
    ...setup,
    g1: panel === "main" ? setup.g1 : null,
    g2: panel === "main" ? setup.g2 : null,
    ground: panel === "main" ? setup.ground : null,
    stim: setup.stim && stimPanel === panel ? setup.stim : null,
  };
  const assessment = mode === "assessment";
  const reveal = !!submitted;
  const effLayers = {
    ...layers,
    nerve: (mode === "guided" && layers.nerve) || reveal,
    muscle: (mode !== "assessment" && layers.muscle) || (reveal && layers.muscle),
    landmarks: mode !== "assessment" ? layers.landmarks : false,
    bone: mode !== "assessment" ? layers.bone : reveal,
  };
  // Target zones are hints, shown only when asked for in Guided mode (or after an assessment).
  const targets = (mode === "guided" && showTargets) || reveal ? config.targets(setup).filter((t) => (t.panel ?? "main") === panel) : null;

  const place = (key, value) => {
    if (submitted) return;
    if (key !== "stim" && panel !== "main") return; // recording electrodes and ground live on the main view
    setSetup((s) => ({ ...s, [key]: key === "stim" && value ? { ...value, panel } : value }));
  };
  const toggleElbow = (flexed) => {
    setSetup((s) => {
      const next = { ...s, elbowFlexed: flexed };
      const elbow = config.panels?.find((p) => p.id === "elbow");
      if (elbow && s.stim?.panel === "elbow") next.stim = carryStimulator(s.stim, elbow.model(s), elbow.model(next), MODEL, elbow.nerve, config.ctx.anchors);
      return next;
    });
  };
  const placeAt = (key, placeId) => {
    if (!placeId) return place(key, null);
    const p = (key === "stim" ? viewModel : MODEL).PLACES[placeId];
    if (key !== "stim") return place(key, { x: p.x, y: p.y });
    // Put the cathode on the chosen spot; the stimulator body extends proximally.
    const angle = setup.stim?.angle ?? Math.PI / 2;
    return place("stim", { x: p.x - Math.cos(angle) * STIM_HALF, y: p.y - Math.sin(angle) * STIM_HALF, angle });
  };

  const stimulate = () => {
    seed.current += 1;
    const r = config.simulate({ model: MODEL, setup, machine, patient: { ...(config.patient || {}), ...(casePatient || {}), tempC: temp.c, refTempC: P.targetTempC }, intensity, seed: seed.current });
    const rec = { sweep: r, intensity, temp: temp.c, setup, cathode: setup.stim ? stimPoles(setup.stim).cathode : null };
    setRecords((x) => ({ ...x, [site]: rec }));
    setMarks((m) => ({ ...m, [site]: {} }));
    const key = posKey(setup) + site;
    setRecruit((rc) => ({ key, points: [...(rc.key === key ? rc.points : []), { I: intensity, amp: r.truth.amp }] }));
    if (!assessment) setFeedback(config.explain({ geo: r.geo, protocol: P, intensity, machine, tempC: temp.c, tempChecked: temp.checked, site, model: MODEL, setup }));
  };

  const savePlacement = () => {
    const rec = records[site];
    if (!rec) return;
    setSaved((s) => [...s, { id: `p${Date.now()}`, name: `Placement ${s.length + 1} (${config.sites.find((x) => x.id === site).label})`, site, setup, sweep: rec.sweep, color: COMPARE_COLORS[s.length % COMPARE_COLORS.length] }]);
  };

  const S = { records, marks, dists, tempChecked: temp.checked, machine };
  const ampOf = (sid) => ampOfS(S, sid);
  const tapeCm = tape.length > 1 ? curveLength(tape) / 10 : null;
  const cvFor = (sid) => cvForS(config, S, sid);
  const flags = (sid) => flagsFor(config, S, sid);
  const distalRec = records.distal;
  const distanceValid = distalRec && (motor ? Math.abs((distalRec.sweep.geo.surfaceDistMm ?? 0) - P.distanceMm) <= 5 : Math.abs((distalRec.sweep.geo.trueDistMm ?? 0) - P.distanceMm) <= 10);

  useEffect(() => {
    onState?.({ records, marks, dists, tempChecked: temp.checked, machine });
  }, [onState, records, marks, dists, temp.checked, machine]);

  const submit = () => {
    setSubmitted(assessStudy(config, S));
    setLayers((l) => ({ ...l, nerve: true }));
  };

  const reset = () => {
    setSetup(presetSetup(config, preset));
    setRecords({}); setMarks({}); setTapeState({ key: "main", pts: [], active: false }); setPanel("main"); setDists({}); setFeedback(null); setSubmitted(null); setSite(config.sites[0].id);
    setRecruit({ key: "", points: [] }); setTemp({ c: startTemp, checked: false }); setMachine({ ...P.settings }); setTool("g1");
  };

  const rows = config.sites.filter((s) => records[s.id]).map((s) => ({
    id: s.id, label: s.label, sub: `${records[s.id].intensity} mA`, sweep: records[s.id].sweep, marks: marks[s.id] || {},
    overlays: saved.filter((x) => compare.includes(x.id) && x.site === s.id).map((x) => ({ id: x.id, sweep: x.sweep, color: x.color })),
  }));
  useEffect(() => {
    if (!tapeActive) return undefined;
    const onKey = (e) => e.key === "Escape" && setTapeState((t) => ({ ...t, active: false }));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tapeActive]);

  const canvasH = full ? Math.max(420, (typeof window !== "undefined" ? window.innerHeight : 800) - 170) : 620;
  const autoMarkAll = () => setMarks(Object.fromEntries(Object.entries(records).map(([sid, r]) => {
    const m = autoMark(r.sweep, kind);
    return [sid, { onset: +m.onset.toFixed(2), peak: +m.peak.toFixed(2) }];
  })));

  const anatomy = (
    <section className={full ? "fixed inset-0 z-50 flex flex-col gap-2 overflow-auto bg-white p-3" : "space-y-2 rounded-xl border border-slate-200 bg-white p-3 lg:col-span-2"}>
      {config.panels && (
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Anatomy views">
          {config.panels.map((p) => (
            <button key={p.id} type="button" role="tab" aria-selected={panel === p.id} onClick={() => { setPanel(p.id); if (p.id !== "main" && ["g1", "g2", "ground"].includes(tool)) setTool("stim"); }}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${panel === p.id ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>{p.label}</button>
          ))}
          {stimPanel !== panel && setup.stim && <span className="text-xs text-slate-500">The stimulator is on the other view.</span>}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {TOOLS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTool(id)} disabled={(!!submitted && id !== "move") || (panel !== "main" && ["g1", "g2", "ground"].includes(id))}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${tool === id ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white text-slate-700"} disabled:opacity-40`}>{label}</button>
        ))}
        {tapeActive && <button type="button" onClick={() => setTapeActive(false)} className="rounded-md bg-violet-600 px-2 py-1.5 text-xs font-semibold text-white">Finish tape</button>}
        {tape.length > 0 && <button type="button" onClick={() => setTapeState({ key: panelKey, pts: [], active: false })} className="rounded-md border border-violet-300 px-2 py-1.5 text-xs font-semibold text-violet-700">Clear tape</button>}
        <span className="mx-1 h-5 w-px bg-slate-200" />
        {viewModel.VIEWS.map((v) => <button key={v.id} type="button" onClick={() => setView(v.box)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">{v.label}</button>)}
        <button type="button" aria-label="Zoom in" onClick={() => setView((v) => ({ x: v.x + v.w * 0.1, y: v.y + v.h * 0.1, w: v.w * 0.8, h: v.h * 0.8 }))} className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-bold">+</button>
        <button type="button" aria-label="Zoom out" onClick={() => setView((v) => ({ x: v.x - v.w * 0.125, y: v.y - v.h * 0.125, w: v.w * 1.25, h: v.h * 1.25 }))} className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-bold">&minus;</button>
        <button type="button" onClick={() => setFull((f) => !f)} className="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-semibold">{full ? "Exit full screen" : "Full screen"}</button>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-700">
        {[["landmarks", "Landmark labels"], ["bone", "Bone"], ["muscle", "Muscle"], ["nerve", "Nerve"]].map(([k, label]) => {
          const locked = (k === "nerve" && mode !== "guided") || (mode === "assessment" && k !== "nerve");
          return (
            <label key={k} className={`flex items-center gap-1 ${locked && !reveal ? "opacity-40" : ""}`} title={locked ? "Not available in this mode" : ""}>
              <input type="checkbox" disabled={locked && !reveal} checked={!!effLayers[k]} onChange={(e) => setLayers((l) => ({ ...l, [k]: e.target.checked }))} /> {label}
            </label>
          );
        })}
        {mode === "guided" && (
          <label className="flex items-center gap-1 font-semibold text-emerald-800">
            <input type="checkbox" checked={showTargets} onChange={(e) => setShowTargets(e.target.checked)} /> Show target zones (hints)
          </label>
        )}
        <span className="text-slate-500">
          {tool === "tape"
            ? (tapeActive
              ? "Tape: hold and trace along the nerve, or move and click to add bends; the tape curves smoothly and the distance follows the pointer. Double-click, Esc or Finish to end."
              : "Tape: press on the start point to measure. After finishing, drag the white points to bend the tape along the nerve.")
            : "Scroll to zoom, drag the background to pan, drag electrodes to move them, drag the blue handle to rotate the stimulator."}
        </span>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-slate-200">
        <AnatomyCanvas model={viewModel} view={view} setView={setView} layers={effLayers} setup={canvasSetup} onPlace={place}
          tool={submitted ? "move" : tool} onToolDone={() => setTool("move")} tape={tape} setTape={setTape} tapeActive={tapeActive} setTapeActive={setTapeActive} targets={targets} height={canvasH} />
        <div className="pointer-events-none absolute inset-x-0 top-1 text-center text-xs font-semibold text-slate-600">&uarr; {viewModel.ORIENTATION.top}</div>
        <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-xs font-semibold text-slate-600">&darr; {viewModel.ORIENTATION.bottom}</div>
        <div className="pointer-events-none absolute left-1 top-1/2 max-w-[5rem] -translate-y-1/2 text-xs font-semibold text-slate-600">&larr; {viewModel.ORIENTATION.left}</div>
        <div className="pointer-events-none absolute right-1 top-1/2 max-w-[5rem] -translate-y-1/2 text-right text-xs font-semibold text-slate-600">{viewModel.ORIENTATION.right} &rarr;</div>
        <div className="pointer-events-none absolute left-2 top-6 rounded bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-800">{viewModel.ORIENTATION.title}</div>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-slate-600">Place by landmark (keyboard and screen-reader alternative)</summary>
        <div className="mt-2 grid gap-2 sm:grid-cols-4">
          {[["g1", "G1"], ["g2", "G2"], ["ground", "Ground"], ["stim", "Stimulator cathode"]].map(([k, label]) => (
            <Field key={k} label={label}>
              <select className={sel} value="" onChange={(e) => placeAt(k, e.target.value)}>
                <option value="">Choose a landmark…</option>
                {Object.entries((k === "stim" ? viewModel : MODEL).PLACES).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}
              </select>
            </Field>
          ))}
          <Field label="Stimulator: cathode points">
            <select className={sel} value={setup.stim ? (Math.sin(setup.stim.angle) >= 0 ? "distal" : "proximal") : ""} onChange={(e) => setup.stim && place("stim", { ...setup.stim, angle: e.target.value === "distal" ? Math.PI / 2 : -Math.PI / 2 })}>
              <option value="">-</option>
              <option value="distal">Distal (toward the recording electrodes)</option>
              <option value="proximal">Proximal (away from them)</option>
            </select>
          </Field>
        </div>
      </details>
      <p className="text-[11px] text-slate-500">Teaching schematic drawn from standard surface-anatomy descriptions; landmarks, nerve courses and motor points are awaiting expert anatomical review.</p>
    </section>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {MODES.filter(([id]) => !caseMode || id !== "assessment").map(([id, label, hint]) => (
          <button key={id} type="button" title={hint} onClick={() => { setMode(id); setSubmitted(null); setFeedback(null); }}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${mode === id ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>{label}</button>
        ))}
        <span className="text-sm text-slate-600">{MODES.find(([id]) => id === mode)[2]}</span>
        <button type="button" onClick={reset} className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">Start again</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {anatomy}
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">{P.label}</h3>
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2 text-sm">
            <span className="text-slate-600">{config.limb === "hand" ? "Hand" : "Foot"} temperature:</span>
            {temp.checked ? <strong className={temp.c < P.targetTempC ? "text-rose-700" : "text-emerald-700"}>{temp.c.toFixed(1)} °C</strong>
              : <button type="button" onClick={() => setTemp((t) => ({ ...t, checked: true }))} className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold">Measure</button>}
            <button type="button" onClick={() => setTemp({ c: P.targetTempC + 1.5, checked: true })} className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">Warm the {config.limb}</button>
          </div>
          {config.elbowToggle && (
            <label className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-sm text-slate-700">
              <input type="checkbox" checked={!!setup.elbowFlexed} disabled={!!submitted} onChange={(e) => toggleElbow(e.target.checked)} />
              Elbow flexed about 90° (otherwise straight)
            </label>
          )}
          <div className="grid grid-cols-2 gap-2">
            {[["g1", "G1 contact"], ["g2", "G2 contact"], ["ground", "Ground contact"], ["stim", "Stimulator contact"]].map(([k, label]) => (
              <Field key={k} label={label}>
                <select className={sel} value={setup.contact[k]} onChange={(e) => setSetup((s) => ({ ...s, contact: { ...s.contact, [k]: e.target.value } }))}>
                  {Object.entries(CONTACT).map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}
                </select>
              </Field>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Sensitivity">
              <select className={sel} value={machine.gain} onChange={(e) => setMachine((m) => ({ ...m, gain: +e.target.value }))}>{config.gains.map((g) => <option key={g} value={g}>{gainLabel(g)}</option>)}</select>
            </Field>
            <Field label="Sweep">
              <select className={sel} value={machine.sweep} onChange={(e) => setMachine((m) => ({ ...m, sweep: +e.target.value }))}>{SWEEPS.map((g) => <option key={g} value={g}>{g} ms/div</option>)}</select>
            </Field>
            <Field label="Low filter">
              <select className={sel} value={machine.lff} onChange={(e) => setMachine((m) => ({ ...m, lff: +e.target.value }))}>{LFFS.map((g) => <option key={g} value={g}>{g} Hz</option>)}</select>
            </Field>
            <Field label="High filter">
              <select className={sel} value={machine.hff} onChange={(e) => setMachine((m) => ({ ...m, hff: +e.target.value }))}>{HFFS.map((g) => <option key={g} value={g}>{g >= 1000 ? `${g / 1000} kHz` : `${g} Hz`}</option>)}</select>
            </Field>
            <Field label="Averages">
              <select className={sel} value={machine.averages} onChange={(e) => setMachine((m) => ({ ...m, averages: +e.target.value }))}>{AVERAGES.map((g) => <option key={g} value={g}>{g}</option>)}</select>
            </Field>
            {config.sites.length > 1 && (
              <Field label="Record this stimulation as">
                <select className={sel} value={site} onChange={(e) => setSite(e.target.value)}>{config.sites.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
              </Field>
            )}
          </div>
          <Field label={`Current: ${intensity} mA (0.2 ms)`}>
            <input type="range" min={0} max={100} step={1} value={intensity} onChange={(e) => setIntensity(+e.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={stimulate} disabled={!!submitted} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">Stimulate</button>
            <button type="button" onClick={savePlacement} disabled={!records[site]} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40">Save placement</button>
          </div>
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Recruitment at this placement</h4>
            <RecruitPlot unit={motor ? "mV" : "µV"} points={recruit.key === posKey(setup) + site ? recruit.points.map((p) => ({ ...p, amp: motor ? p.amp / 1000 : p.amp })) : []} />
          </div>
          {mode === "guided" && (
            <details open className="text-sm text-slate-700">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-500">Protocol steps</summary>
              <ol className="mt-1 list-decimal space-y-1 pl-5">{P.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </details>
          )}
        </section>
      </div>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <NcsTrace rows={rows} gain={machine.gain} sweepMsPerDiv={machine.sweep} markMode={markMode} onMark={(sid, m, ms) => setMarks((x) => ({ ...x, [sid]: { ...(x[sid] || {}), [m]: ms } }))} />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setMarkMode(markMode === "onset" ? null : "onset")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${markMode === "onset" ? "bg-sky-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>Mark onset (O)</button>
          <button type="button" onClick={() => setMarkMode(markMode === "peak" ? null : "peak")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${markMode === "peak" ? "bg-pink-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>Mark negative peak (P)</button>
          {!assessment && <button type="button" disabled={!rows.length} onClick={autoMarkAll} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40">Machine auto-mark</button>}
          {markMode && <span className="self-center text-xs text-slate-500">Click on a trace to place the {markMode} cursor.</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="py-1 pr-3">Site</th><th className="py-1 pr-3">{motor ? "Onset latency" : "Onset / peak"}</th><th className="py-1 pr-3">Amplitude</th><th className="py-1 pr-3">Distance you measured</th><th className="py-1 pr-3">Velocity</th><th className="py-1 pr-3">Compared with limits</th></tr>
            </thead>
            <tbody>
              {config.sites.map((s) => {
                const m = marks[s.id] || {};
                const f = flags(s.id);
                const marked = m.onset != null && m.peak != null;
                return (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="py-1.5 pr-3 font-medium">{s.label}</td>
                    <td className="py-1.5 pr-3">{motor ? `${m.onset?.toFixed(2) ?? "-"} ms` : `${m.onset?.toFixed(2) ?? "-"} / ${m.peak?.toFixed(2) ?? "-"} ms`}</td>
                    <td className="py-1.5 pr-3">{fmtAmp(ampOf(s.id))}</td>
                    <td className="py-1.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        <input type="number" step="0.1" value={dists[s.id] ?? ""} onChange={(e) => setDists((d) => ({ ...d, [s.id]: e.target.value }))} className="w-20 rounded border border-slate-300 px-2 py-1" aria-label={s.distLabel} title={s.distLabel} />
                        <span className="text-xs text-slate-500">cm</span>
                        {tapeCm != null && <button type="button" onClick={() => setDists((d) => ({ ...d, [s.id]: tapeCm.toFixed(1) }))} className="rounded border border-violet-300 px-1.5 py-0.5 text-xs text-violet-700">tape {tapeCm.toFixed(1)}</button>}
                      </div>
                      <div className="text-[11px] text-slate-500">{s.distLabel}</div>
                    </td>
                    <td className="py-1.5 pr-3">{cvFor(s.id) ? `${cvFor(s.id).toFixed(0)} m/s` : "-"}</td>
                    <td className={`py-1.5 pr-3 ${!records[s.id] || !marked ? "text-slate-500" : f.length ? "text-rose-700" : "text-emerald-700"}`}>{!records[s.id] ? "Not recorded" : !marked ? "Mark onset and peak" : f.length ? f.join(", ") : "Within limits"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          Reference limits for this protocol (this app's table; labs set their own): {motor
            ? `distal latency ≤ ${P.limits.lat} ms at ${P.distanceMm / 10} cm, amplitude ≥ ${P.limits.amp} mV, forearm velocity ≥ ${P.limits.cv} m/s`
            : `peak latency ≤ ${P.limits.peak} ms, amplitude ≥ ${P.limits.amp} µV, at ${P.distanceMm / 10} cm`}.
          {distalRec && !distanceValid && !assessment ? ` Your distal stimulation distance differs from ${P.distanceMm / 10} cm, so the distal limits do not apply to this recording.` : ""}
        </p>

        {saved.length > 0 && (
          <div className="rounded-lg border border-slate-200 p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Saved placements: tick to overlay on the matching trace</h4>
            <ul className="space-y-1 text-sm">
              {saved.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-2">
                  <input type="checkbox" checked={compare.includes(s.id)} onChange={(e) => setCompare((c) => (e.target.checked ? [...c, s.id] : c.filter((x) => x !== s.id)))} aria-label={`Overlay ${s.name}`} />
                  <span className="inline-block h-2 w-6 rounded" style={{ background: s.color }} />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-slate-500">{fmtAmp(s.sweep.truth.amp)}</span>
                  {!submitted && <button type="button" onClick={() => setSetup(s.setup)} className="rounded border border-slate-300 px-2 py-0.5 text-xs">Restore</button>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback && !assessment && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">What this stimulation tells you</h4>
            <ul className="space-y-1.5">
              {feedback.filter((f) => mode === "guided" || !f.ok).map((f, i) => (
                <li key={`${f.id}-${i}`} className={`rounded-lg px-3 py-2 text-sm ${f.ok ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>{f.ok ? "✓ " : "⚠ "}{f.text}</li>
              ))}
              {mode === "practice" && feedback.every((f) => f.ok) && <li className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">No technical problems found in this stimulation.</li>}
            </ul>
          </div>
        )}

        {assessment && !submitted && (
          <button type="button" onClick={submit} disabled={!Object.keys(records).length} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Submit for assessment</button>
        )}
        {submitted && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Assessment breakdown</h4>
            <p className="text-sm text-slate-600">
              Technique {submitted.items.filter((i) => i.ok).length}/{submitted.items.length} · Measurement {submitted.meas.filter((i) => i.ok).length}/{submitted.meas.length}. Nerves and target zones are now shown on the limb.
            </p>
            <ul className="space-y-1.5">
              {[...submitted.items, ...submitted.meas].map((f, i) => (
                <li key={i} className={`rounded-lg px-3 py-2 text-sm ${f.ok ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>{f.ok ? "✓ " : "✗ "}{f.text}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
