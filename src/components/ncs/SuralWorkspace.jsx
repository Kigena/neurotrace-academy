import React, { useEffect, useMemo, useRef, useState } from "react";
import AnatomyCanvas from "./AnatomyCanvas.jsx";
import NcsTrace from "./NcsTrace.jsx";
import * as MODEL from "../../ncs/anatomy/suralView.js";
import { CONTACT, describeSetup, explainSetup, simulateField } from "../../ncs/fieldSim.js";
import { autoMark } from "../../ncs/generator.js";
import { pointAt, polylineLength, project } from "../../ncs/geometry.js";
import { PROTOCOLS, SENSORY_GAINS } from "../../ncs/protocols.js";
import { HFFS, LFFS, SWEEPS, AVERAGES } from "../../ncs/studies.js";

/**
 * Sural sensory workspace: the leg is the main interactive area, machine and
 * patient controls sit beside it and the waveform below. Three modes:
 * Guided (targets, nerve layer, explanations), Practice (no targets, feedback
 * after each stimulation) and Assessment (no help until submission, then a
 * breakdown of errors).
 */

const PROTOCOL = PROTOCOLS["sural-anti-14"];
const MODES = [
  ["guided", "Guided", "Landmarks, target zones and the nerve layer are available, with explanations after every stimulation."],
  ["practice", "Practice", "Targets and the nerve are hidden. Feedback follows each stimulation."],
  ["assessment", "Assessment", "Set up, record, measure and submit on your own. You get a breakdown afterwards."],
];
const COMPARE_COLORS = ["#38bdf8", "#f472b6", "#a3e635", "#c084fc"];
const TOOLS = [["move", "Move / pan"], ["g1", "Place G1"], ["g2", "Place G2"], ["ground", "Place ground"], ["stim", "Place stimulator"], ["tape", "Tape measure"]];

const posKey = (s) => JSON.stringify([s.g1, s.g2, s.ground, s.stim, s.contact]);

function Field({ label, children }) {
  return <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">{label}{children}</label>;
}
const sel = "rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900";

function RecruitPlot({ points }) {
  if (!points.length) return <p className="text-xs text-slate-500">Each stimulation at this placement adds a point here, so you can see the response reach a plateau.</p>;
  const maxI = Math.max(40, ...points.map((p) => p.I));
  const maxA = Math.max(5, ...points.map((p) => p.amp)) * 1.15;
  const W = 260, H = 110, L = 30, B = 20;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Amplitude against current">
      <line x1={L} y1={H - B} x2={W - 4} y2={H - B} stroke="#94a3b8" />
      <line x1={L} y1={4} x2={L} y2={H - B} stroke="#94a3b8" />
      <text x={W / 2} y={H - 4} fontSize="9" fill="#64748b" textAnchor="middle">current (mA)</text>
      <text x={8} y={H / 2} fontSize="9" fill="#64748b" transform={`rotate(-90 8 ${H / 2})`} textAnchor="middle">amp (µV)</text>
      {points.map((p, i) => (
        <circle key={i} cx={L + (p.I / maxI) * (W - L - 8)} cy={H - B - (p.amp / maxA) * (H - B - 8)} r="3.5" fill="#6366f1" />
      ))}
      <text x={W - 6} y={12} fontSize="9" fill="#64748b" textAnchor="end">max {maxI} mA</text>
    </svg>
  );
}

export default function SuralWorkspace() {
  const [mode, setMode] = useState("guided");
  const [view, setView] = useState(MODEL.VIEWS[0].box);
  const [layers, setLayers] = useState({ muscle: false, bone: true, nerve: false, landmarks: true });
  const [tool, setTool] = useState("g1");
  const [setup, setSetup] = useState({ g1: null, g2: null, ground: null, stim: null, contact: { g1: "unprepped", g2: "unprepped", ground: "unprepped", stim: "unprepped" } });
  const [tape, setTape] = useState([]);
  const [machine, setMachine] = useState({ ...PROTOCOL.settings });
  const [intensity, setIntensity] = useState(10);
  const [temp, setTemp] = useState({ c: 28.5, checked: false });
  const [sweep, setSweep] = useState(null);
  const [marks, setMarks] = useState({});
  const [markMode, setMarkMode] = useState(null);
  const [distCm, setDistCm] = useState("");
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

  const assessment = mode === "assessment";
  const reveal = !!submitted;
  const effLayers = {
    ...layers,
    nerve: (mode === "guided" && layers.nerve) || reveal,
    muscle: mode !== "assessment" && layers.muscle,
    landmarks: mode !== "assessment" ? layers.landmarks : false,
    bone: mode !== "assessment" ? layers.bone : reveal,
  };

  const s1 = project(MODEL.PLACES.behindLatMall, MODEL.NERVE).s;
  const targets = (mode === "guided" || reveal) ? [
    { ...MODEL.PLACES.behindLatMall, r: 6, label: "G1" },
    { ...pointAt(MODEL.NERVE, s1 + 35), r: 6, label: "G2" },
    { ...pointAt(MODEL.NERVE, s1 - 140), r: 8, label: "Cathode" },
    { ...pointAt(MODEL.NERVE, s1 - 60), r: 16, label: "Ground zone" },
  ] : null;

  const geo = useMemo(() => describeSetup(MODEL, setup), [setup]);
  const place = (key, value) => {
    if (submitted) return;
    setSetup((s) => ({ ...s, [key]: value }));
  };
  const placeAt = (key, placeId) => {
    if (!placeId) return place(key, null);
    const p = MODEL.PLACES[placeId];
    place(key, key === "stim" ? { x: p.x, y: p.y, angle: setup.stim?.angle ?? Math.PI / 2 } : { x: p.x, y: p.y });
  };

  const stimulate = () => {
    seed.current += 1;
    const r = simulateField({ model: MODEL, setup, machine, patient: { tempC: temp.c, refTempC: PROTOCOL.targetTempC }, intensity, seed: seed.current });
    r.intensity = intensity;
    r.temp = temp.c;
    setSweep(r);
    setMarks({});
    const key = posKey(setup);
    setRecruit((rc) => ({ key, points: [...(rc.key === key ? rc.points : []), { I: intensity, amp: r.truth.amp }] }));
    if (!assessment) setFeedback(explainSetup({ geo: r.geo, protocol: PROTOCOL, intensity, machine, tempC: temp.c, tempChecked: temp.checked }));
  };

  const savePlacement = () => {
    if (!sweep) return;
    const id = `p${Date.now()}`;
    setSaved((s) => [...s, { id, name: `Placement ${s.length + 1}`, setup, sweep, color: COMPARE_COLORS[s.length % COMPARE_COLORS.length] }]);
  };

  const ampFromMarks = sweep && marks.onset != null && marks.peak != null
    ? Math.abs(sweep.data[Math.round(marks.peak * sweep.fs)] - sweep.data[Math.round(marks.onset * sweep.fs)]) : null;
  const tapeCm = tape.length > 1 ? polylineLength(tape) / 10 : null;
  const cvLearner = marks.onset && distCm ? (10 * +distCm) / marks.onset : null;
  const trueDistOk = geo.trueDistMm != null && Math.abs(geo.trueDistMm - PROTOCOL.distanceMm) <= 10;

  const submit = () => {
    const t = sweep?.truth;
    const items = sweep ? explainSetup({ geo: sweep.geo, protocol: PROTOCOL, intensity: sweep.intensity, machine, tempC: sweep.temp, tempChecked: temp.checked }) : [{ id: "none", ok: false, text: "No response recorded." }];
    const meas = [];
    if (t?.present) {
      meas.push({ ok: marks.onset != null && Math.abs(marks.onset - t.onset) <= 0.2, text: `Onset latency: you marked ${marks.onset?.toFixed(2) ?? "nothing"} ms; the screen shows about ${t.onset?.toFixed(2)} ms.` });
      meas.push({ ok: marks.peak != null && Math.abs(marks.peak - t.peak) <= 0.2, text: `Peak latency: you marked ${marks.peak?.toFixed(2) ?? "nothing"} ms; the screen shows about ${t.peak.toFixed(2)} ms.` });
      meas.push({ ok: ampFromMarks != null && Math.abs(ampFromMarks - t.amp) <= 0.15 * t.amp, text: `Amplitude: you measured ${ampFromMarks?.toFixed(1) ?? "nothing"} µV; the screen shows about ${t.amp.toFixed(1)} µV.` });
      if (t.trueDistMm != null) {
        meas.push({ ok: distCm !== "" && Math.abs(+distCm * 10 - t.trueDistMm) <= 5, text: `Distance: you entered ${distCm || "nothing"} cm; the conduction distance along the nerve was ${(t.trueDistMm / 10).toFixed(1)} cm.` });
        const trueCv = t.onset ? t.trueDistMm / t.onset : null;
        if (cvLearner && trueCv) meas.push({ ok: Math.abs(cvLearner - trueCv) <= 3, text: `Velocity: you calculated ${cvLearner.toFixed(0)} m/s; with the true distance and the true onset it is about ${trueCv.toFixed(0)} m/s.` });
      }
    }
    setSubmitted({ items, meas });
    setLayers((l) => ({ ...l, nerve: true }));
  };

  const reset = () => {
    setSetup({ g1: null, g2: null, ground: null, stim: null, contact: { g1: "unprepped", g2: "unprepped", ground: "unprepped", stim: "unprepped" } });
    setSweep(null); setMarks({}); setTape([]); setDistCm(""); setFeedback(null); setSubmitted(null);
    setRecruit({ key: "", points: [] }); setTemp({ c: 28.5, checked: false }); setMachine({ ...PROTOCOL.settings }); setTool("g1");
  };

  const rows = sweep ? [{
    id: "sural", label: "Calf", sub: `${sweep.intensity} mA`, sweep, marks,
    overlays: saved.filter((s) => compare.includes(s.id)).map((s) => ({ id: s.id, sweep: s.sweep, color: s.color })),
  }] : [];
  const canvasH = full ? Math.max(420, (typeof window !== "undefined" ? window.innerHeight : 800) - 170) : 600;

  const anatomy = (
    <section className={full ? "fixed inset-0 z-50 flex flex-col gap-2 overflow-auto bg-white p-3" : "space-y-2 rounded-xl border border-slate-200 bg-white p-3 lg:col-span-2"}>
      <div className="flex flex-wrap items-center gap-1.5">
        {TOOLS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTool(id)} disabled={!!submitted && id !== "move"}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${tool === id ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white text-slate-700"} disabled:opacity-40`}>{label}</button>
        ))}
        {tape.length > 0 && <button type="button" onClick={() => setTape([])} className="rounded-md border border-violet-300 px-2 py-1.5 text-xs font-semibold text-violet-700">Clear tape</button>}
        <span className="mx-1 h-5 w-px bg-slate-200" />
        {MODEL.VIEWS.map((v) => (
          <button key={v.id} type="button" onClick={() => setView(v.box)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700">{v.label}</button>
        ))}
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
        <span className="text-slate-500">Scroll to zoom, drag the background to pan, drag electrodes to move them, drag the blue handle to rotate the stimulator.</span>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-slate-200">
        <AnatomyCanvas model={MODEL} view={view} setView={setView} layers={effLayers} setup={setup} onPlace={place}
          tool={submitted ? "move" : tool} onToolDone={() => setTool("move")} tape={tape} setTape={setTape} targets={targets} height={canvasH} />
        <div className="pointer-events-none absolute inset-x-0 top-1 text-center text-xs font-semibold text-slate-600">&uarr; {MODEL.ORIENTATION.top}</div>
        <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-xs font-semibold text-slate-600">&darr; {MODEL.ORIENTATION.bottom}</div>
        <div className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600">&larr; {MODEL.ORIENTATION.left}</div>
        <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600">{MODEL.ORIENTATION.right} &rarr;</div>
        <div className="pointer-events-none absolute left-2 top-6 rounded bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-800">{MODEL.ORIENTATION.title}</div>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-slate-600">Place by landmark (keyboard and screen-reader alternative)</summary>
        <div className="mt-2 grid gap-2 sm:grid-cols-4">
          {[["g1", "G1"], ["g2", "G2"], ["ground", "Ground"], ["stim", "Stimulator centre"]].map(([k, label]) => (
            <Field key={k} label={label}>
              <select className={sel} value="" onChange={(e) => placeAt(k, e.target.value)}>
                <option value="">Choose a landmark…</option>
                {Object.entries(MODEL.PLACES).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}
              </select>
            </Field>
          ))}
          <Field label="Stimulator: cathode points">
            <select className={sel} value={setup.stim ? (Math.sin(setup.stim.angle) >= 0 ? "distal" : "proximal") : ""} onChange={(e) => setup.stim && place("stim", { ...setup.stim, angle: e.target.value === "distal" ? Math.PI / 2 : -Math.PI / 2 })}>
              <option value="">-</option>
              <option value="distal">Distal (toward G1)</option>
              <option value="proximal">Proximal (away from G1)</option>
            </select>
          </Field>
        </div>
      </details>
      <p className="text-[11px] text-slate-500">Teaching schematic of the right lower leg drawn from standard surface anatomy descriptions; landmark positions and the nerve course are awaiting expert anatomical review.</p>
    </section>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {MODES.map(([id, label, hint]) => (
          <button key={id} type="button" title={hint} onClick={() => { setMode(id); setSubmitted(null); setFeedback(null); }}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${mode === id ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>{label}</button>
        ))}
        <span className="text-sm text-slate-600">{MODES.find(([id]) => id === mode)[2]}</span>
        <button type="button" onClick={reset} className="ml-auto rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">Start again</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {anatomy}
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">{PROTOCOL.label}</h3>
          <div className="space-y-1 rounded-lg bg-slate-50 p-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600">Foot temperature:</span>
              {temp.checked ? <strong className={temp.c < PROTOCOL.targetTempC ? "text-rose-700" : "text-emerald-700"}>{temp.c.toFixed(1)} °C</strong>
                : <button type="button" onClick={() => setTemp((t) => ({ ...t, checked: true }))} className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold">Measure</button>}
              <button type="button" onClick={() => setTemp({ c: 32, checked: true })} className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">Warm the foot</button>
            </div>
          </div>
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
              <select className={sel} value={machine.gain} onChange={(e) => setMachine((m) => ({ ...m, gain: +e.target.value }))}>{SENSORY_GAINS.map((g) => <option key={g} value={g}>{g} µV/div</option>)}</select>
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
          </div>
          <Field label={`Current: ${intensity} mA (0.2 ms)`}>
            <input type="range" min={0} max={100} step={1} value={intensity} onChange={(e) => setIntensity(+e.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={stimulate} disabled={!!submitted} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">Stimulate</button>
            <button type="button" onClick={savePlacement} disabled={!sweep} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40">Save placement</button>
          </div>
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Recruitment at this placement</h4>
            <RecruitPlot points={recruit.key === posKey(setup) ? recruit.points : []} />
          </div>
          {mode === "guided" && (
            <details open className="text-sm text-slate-700">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-500">Protocol steps</summary>
              <ol className="mt-1 list-decimal space-y-1 pl-5">{PROTOCOL.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </details>
          )}
        </section>
      </div>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <NcsTrace rows={rows} gain={machine.gain} sweepMsPerDiv={machine.sweep} markMode={markMode} onMark={(id, m, ms) => setMarks((x) => ({ ...x, [m]: ms }))} />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setMarkMode(markMode === "onset" ? null : "onset")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${markMode === "onset" ? "bg-sky-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>Mark onset (O)</button>
          <button type="button" onClick={() => setMarkMode(markMode === "peak" ? null : "peak")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${markMode === "peak" ? "bg-pink-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>Mark negative peak (P)</button>
          {!assessment && <button type="button" disabled={!sweep} onClick={() => { const m = autoMark(sweep, "sensory"); setMarks({ onset: +m.onset.toFixed(2), peak: +m.peak.toFixed(2) }); }} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40">Machine auto-mark</button>}
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3 text-sm"><div className="text-xs text-slate-500">Onset / peak latency</div><strong>{marks.onset?.toFixed(2) ?? "-"} / {marks.peak?.toFixed(2) ?? "-"} ms</strong></div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm"><div className="text-xs text-slate-500">Amplitude (baseline to negative peak)</div><strong>{ampFromMarks != null ? `${ampFromMarks.toFixed(1)} µV` : "-"}</strong></div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <div className="text-xs text-slate-500">Distance you measured (cm)</div>
            <div className="flex items-center gap-2">
              <input type="number" step="0.1" value={distCm} onChange={(e) => setDistCm(e.target.value)} className="w-20 rounded border border-slate-300 px-2 py-1" aria-label="Distance in cm" />
              {tapeCm != null && <button type="button" onClick={() => setDistCm(tapeCm.toFixed(1))} className="rounded border border-violet-300 px-2 py-1 text-xs text-violet-700">Use tape ({tapeCm.toFixed(1)})</button>}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm"><div className="text-xs text-slate-500">Onset velocity (your distance)</div><strong>{cvLearner ? `${cvLearner.toFixed(0)} m/s` : "-"}</strong></div>
        </div>
        <p className="text-xs text-slate-500">
          Reference limits for this protocol (this app's table; labs set their own): peak latency ≤ {PROTOCOL.limits.peak} ms, amplitude ≥ {PROTOCOL.limits.amp} µV, at {PROTOCOL.distanceMm / 10} cm.
          {sweep && !trueDistOk && !assessment ? " Your stimulation distance differs from 14 cm, so these limits do not apply to this recording." : ""}
        </p>

        {saved.length > 0 && (
          <div className="rounded-lg border border-slate-200 p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Saved placements: tick to overlay on the current trace</h4>
            <ul className="space-y-1 text-sm">
              {saved.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-2">
                  <input type="checkbox" checked={compare.includes(s.id)} onChange={(e) => setCompare((c) => (e.target.checked ? [...c, s.id] : c.filter((x) => x !== s.id)))} aria-label={`Overlay ${s.name}`} />
                  <span className="inline-block h-2 w-6 rounded" style={{ background: s.color }} />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-slate-500">{s.sweep.intensity} mA, {s.sweep.truth.amp.toFixed(1)} µV</span>
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
              {feedback.filter((f) => mode === "guided" || !f.ok).map((f) => (
                <li key={f.id} className={`rounded-lg px-3 py-2 text-sm ${f.ok ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>{f.ok ? "✓ " : "⚠ "}{f.text}</li>
              ))}
              {mode === "practice" && feedback.every((f) => f.ok) && <li className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">No technical problems found in this stimulation.</li>}
            </ul>
          </div>
        )}

        {assessment && !submitted && (
          <button type="button" onClick={submit} disabled={!sweep} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Submit for assessment</button>
        )}
        {submitted && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Assessment breakdown</h4>
            <p className="text-sm text-slate-600">
              Technique {submitted.items.filter((i) => i.ok).length}/{submitted.items.length} · Measurement {submitted.meas.filter((i) => i.ok).length}/{submitted.meas.length}. The nerve course and target zones are now shown on the leg.
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
