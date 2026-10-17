import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import NcsWorkbench from "../components/ncs/NcsWorkbench.jsx";
import NerveWorkspace from "../components/ncs/NerveWorkspace.jsx";
import NcsCaseRunner from "../components/ncs/NcsCaseRunner.jsx";
import { WORKSPACES } from "../ncs/workspaces.js";
import { LIMB_REF_TEMP, RECOMMENDED, SITES, STIM_SITES, STUDIES, gainLabel } from "../ncs/studies.js";
import data from "../data/ncsCases.json";

/**
 * NCS Practical Lab: a free bench with a healthy subject, simulated cases
 * graded on planning, technique, measurement and interpretation, a set-up
 * guide generated from the study catalog, and a pitfalls list.
 */

const TABS = [["workspace", "Interactive workspace (new)"], ["bench", "Bench"], ["cases", "Cases"], ["setup", "Set-up guide"], ["pitfalls", "Technical pitfalls"]];
const STORE = "neurolinea.ncsLab.v1";
const ALL = Object.keys(STUDIES);

function loadDone() {
  try {
    return JSON.parse(localStorage.getItem(STORE) || "{}");
  } catch {
    return {};
  }
}
function saveDone(v) {
  try {
    localStorage.setItem(STORE, JSON.stringify(v));
  } catch {
    /* storage unavailable: progress is kept for this visit only */
  }
}

const freshEnv = (temp) => ({ temp: { ...temp }, tempChecked: { arm: false, leg: false }, recordedCold: { arm: false, leg: false } });

function Bench() {
  const [env, setEnv] = useState(freshEnv({ arm: 32.5, leg: 30.5 }));
  const [states, setStates] = useState({});
  return (
    <div className="space-y-3">
      <p className="max-w-3xl text-sm text-slate-600">
        A healthy volunteer. Pick a study, place the electrodes, set the machine and stimulate. Use the temperature slider to see what a cold limb does, flip the stimulator, move G1 off the motor point or change the filters, then press Check my technique.
      </p>
      <NcsWorkbench studyIds={ALL} patient={{}} env={env} setEnv={setEnv} states={states} setStates={setStates} allowTempEdit />
    </div>
  );
}

function Workspace() {
  const [study, setStudy] = useState("sural");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Study:</span>
        {Object.values(WORKSPACES).map((w) => (
          <button key={w.id} type="button" onClick={() => setStudy(w.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${study === w.id ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700"}`}>{w.label}</button>
        ))}
        <span className="text-xs text-slate-500">Other studies are on the Bench tab until they move to this workspace.</span>
      </div>
      <NerveWorkspace key={study} config={WORKSPACES[study]} />
    </div>
  );
}

function Cases() {
  const [open, setOpen] = useState(null);
  const [done, setDone] = useState(loadDone);
  const c = data.cases.find((x) => x.id === open);
  if (c) {
    return <NcsCaseRunner key={c.id} c={c} onExit={() => setOpen(null)} onDone={() => { const v = { ...done, [c.id]: new Date().toISOString() }; setDone(v); saveDone(v); }} />;
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.cases.map((x) => (
        <button key={x.id} type="button" onClick={() => setOpen(x.id)} className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-indigo-300 hover:bg-indigo-50/40">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{x.title}</h3>
            {done[x.id] && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Done</span>}
          </div>
          <p className="mt-1 font-mono text-xs text-slate-600">{x.referral}</p>
        </button>
      ))}
    </div>
  );
}

function SetupGuide() {
  return (
    <div className="space-y-3">
      <p className="max-w-3xl text-sm text-slate-600">Standard set-ups used in this lab. Distances and limits follow this app's reference table; your lab's protocol and normal values take precedence.</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="p-2">Study</th><th className="p-2">G1 (active)</th><th className="p-2">G2 (reference)</th><th className="p-2">Stimulation</th><th className="p-2">Settings</th><th className="p-2">Limits</th></tr>
          </thead>
          <tbody>
            {ALL.map((id) => {
              const s = STUDIES[id];
              const sites = SITES[s.limb];
              const rec = RECOMMENDED[s.type];
              return (
                <tr key={id} className="border-t border-slate-100 align-top">
                  <td className="p-2 font-medium text-slate-900">{s.label}</td>
                  <td className="p-2">{s.g1.map((g) => sites[g].label).join(" or ")}</td>
                  <td className="p-2">{s.g2.map((g) => sites[g].label).join(" or ")}{s.type === "sensory" ? " (same digit as G1)" : ""}</td>
                  <td className="p-2">
                    {STIM_SITES[s.distalStim].label}, {s.stdDist} cm from G1 (cathode toward G1)
                    {s.proximal.map((p) => <div key={p.site}>{STIM_SITES[p.site].label}{p.acrossElbow ? " (elbow flexed)" : ""}</div>)}
                  </td>
                  <td className="p-2">{gainLabel(rec.gain)}, low filter {rec.lff.join("-")} Hz, high filter {rec.hff.map((h) => h / 1000).join("-")} kHz, ground on the same limb</td>
                  <td className="p-2">{s.type === "motor" ? `Latency ≤ ${s.limits.lat} ms, amplitude ≥ ${s.limits.amp / 1000} mV, velocity ≥ ${s.limits.cv} m/s` : `Peak latency ≤ ${s.limits.peak} ms, amplitude ≥ ${s.limits.amp} µV`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-600">Temperature targets in this lab: hand at least {LIMB_REF_TEMP.arm} °C, foot at least {LIMB_REF_TEMP.leg} °C.</p>
    </div>
  );
}

const PITFALLS = [
  ["Initial positive dip on a CMAP", "G1 off the motor point, or a volume-conducted response from another muscle (for example co-stimulation of a neighbouring nerve, or an anomalous innervation).", "Move G1 to the middle of the muscle belly; reduce excessive current; consider an anomaly if it appears at one site only."],
  ["Upside-down response", "G1 and G2 swapped (or the input leads reversed).", "Put G1 on the muscle belly or proximal ring and G2 distally."],
  ["Amplitude keeps rising with more current", "Submaximal stimulation.", "Increase until the response stops growing, then add about 20%."],
  ["Latency a little long at one site, more current needed", "Stimulator polarity reversed (anode distal).", "Cathode toward the recording electrodes."],
  ["All latencies long, velocities slow, amplitudes high", "Cold limb.", "Measure and warm to the lab target; recheck before recording."],
  ["Across-elbow ulnar velocity falsely slow", "Elbow straight while stimulating and measuring.", "Flex the elbow about 70-90 degrees for both stimulation and measurement."],
  ["Distal latency looks normal but is not comparable", "Non-standard distance between cathode and G1.", "Use the distance the reference values assume (here 8 cm motor, 14 cm median and ulnar sensory)."],
  ["Small, late, rounded SNAP peak", "High filter set too low.", "Use about 2 kHz for sensory studies."],
  ["Small SNAP with a shrunken negative peak", "Low filter set too high.", "Use about 10-20 Hz for sensory studies."],
  ["Large stimulus artifact and 60 Hz hum", "No ground or ground on another limb; poor skin preparation.", "Ground on the same limb between stimulator and recording electrodes; clean and prepare the skin."],
  ["Noisy tiny SNAP", "Random noise comparable to the response.", "Average several sweeps; check impedance and placement."],
  ["Odd waveform after very high current at the wrist", "Current spreading to the neighbouring nerve (median and ulnar at the wrist).", "Reduce the current to just supramaximal and re-position the stimulator."],
];

function Pitfalls() {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr><th className="p-2">What you see</th><th className="p-2">Likely cause</th><th className="p-2">Fix</th></tr>
        </thead>
        <tbody>
          {PITFALLS.map(([a, b, c]) => (
            <tr key={a} className="border-t border-slate-100 align-top"><td className="p-2 font-medium text-slate-900">{a}</td><td className="p-2">{b}</td><td className="p-2">{c}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function NcsLab() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab = TABS.some(([id]) => id === raw) ? raw : "workspace";
  return (
    <div className="space-y-6">
      <header>
        <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-700">Home</Link><span>/</span>
          <Link to="/emg-ncs" className="hover:text-slate-700">NCS/EMG</Link><span>/</span>
          <span className="font-medium text-slate-900">NCS Practical Lab</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">NCS Practical Lab</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">Place electrodes, set the machine, stimulate and measure on synthetic nerve conduction responses that react to your technique. Then work through referral cases scored on planning, technique, measurement and interpretation.</p>
      </header>
      <div className="sticky top-[57px] z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur-sm">
        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="NCS lab sections">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setParams(id === "workspace" ? {} : { tab: id })}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"}`}>{label}</button>
          ))}
        </nav>
      </div>
      <div role="tabpanel">
        {tab === "workspace" && <Workspace />}
        {tab === "bench" && <Bench />}
        {tab === "cases" && <Cases />}
        {tab === "setup" && <SetupGuide />}
        {tab === "pitfalls" && <Pitfalls />}
      </div>
    </div>
  );
}
