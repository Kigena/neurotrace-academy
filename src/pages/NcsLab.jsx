import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import NcsWorkbench from "../components/ncs/NcsWorkbench.jsx";
import SuralWorkspace from "../components/ncs/SuralWorkspace.jsx";
import { emptyStudyState } from "../ncs/state.js";
import { accuracyChecks, flagsFor, measurements, techniqueChecks } from "../ncs/grading.js";
import { LIMB_REF_TEMP, RECOMMENDED, SITES, STIM_SITES, STUDIES, gainLabel } from "../ncs/studies.js";
import data from "../data/ncsCases.json";

/**
 * NCS Practical Lab: a free bench with a healthy subject, simulated cases
 * graded on planning, technique, measurement and interpretation, a set-up
 * guide generated from the study catalog, and a pitfalls list.
 */

const TABS = [["sural", "Sural workspace (new)"], ["bench", "Bench"], ["cases", "Cases"], ["setup", "Set-up guide"], ["pitfalls", "Technical pitfalls"]];
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

function CaseRunner({ c, onExit, onDone }) {
  const [step, setStep] = useState("plan");
  const [picked, setPicked] = useState([]);
  const [planChecked, setPlanChecked] = useState(false);
  const [env, setEnv] = useState(freshEnv(c.temp));
  const [states, setStates] = useState(() => {
    const init = {};
    for (const [id, preset] of Object.entries(c.preset || {})) init[id] = { ...emptyStudyState(id), setup: { ...emptyStudyState(id).setup, ...preset } };
    return init;
  });
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const patient = useMemo(() => ({ path: c.path }), [c]);
  const studyIds = useMemo(() => {
    const set = new Set([...c.required, ...picked]);
    return ALL.filter((id) => set.has(id));
  }, [c, picked]);
  const missing = c.required.filter((id) => !picked.includes(id));
  const extra = picked.filter((id) => !c.required.includes(id) && !(c.optional || []).includes(id));

  const result = useMemo(() => {
    if (!finished) return null;
    const tech = [], acc = [];
    for (const id of c.required) {
      const st = states[id];
      if (!st) { tech.push({ study: id, label: "Study recorded", ok: false, detail: "Not recorded." }); continue; }
      for (const k of techniqueChecks(id, st, { ...env, patient })) tech.push({ study: id, ...k });
      for (const a of accuracyChecks(id, st)) acc.push({ study: id, ...a });
    }
    const q = c.questions.map((x, i) => answers[i] === x.answer);
    const pct = (arr) => (arr.length ? Math.round((100 * arr.filter(Boolean).length) / arr.length) : 0);
    return {
      tech, acc,
      plan: pct(c.required.map((id) => picked.includes(id))),
      techPct: pct(tech.map((t) => t.ok)),
      accPct: pct(acc.map((a) => a.ok)),
      qPct: pct(q),
    };
  }, [finished, c, states, env, patient, answers, picked]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button type="button" onClick={onExit} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700">&larr; All cases</button>
        {[["plan", "1. Plan"], ["record", "2. Record"], ["review", "3. Review"]].map(([k, label]) => (
          <button key={k} type="button" disabled={k !== "plan" && !planChecked} onClick={() => setStep(k)}
            className={`rounded-full px-3 py-1.5 font-semibold ${step === k ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 disabled:opacity-40"}`}>{label}</button>
        ))}
      </div>
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
        <h2 className="text-lg font-semibold text-slate-900">{c.title}</h2>
        <p className="mt-1 font-mono text-sm text-indigo-900">{c.referral}</p>
      </div>

      {step === "plan" && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900">Which studies will you perform?</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL.map((id) => (
              <label key={id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <input type="checkbox" checked={picked.includes(id)} disabled={planChecked}
                  onChange={(e) => setPicked((p) => (e.target.checked ? [...p, id] : p.filter((x) => x !== id)))} />
                {STUDIES[id].label}
              </label>
            ))}
          </div>
          {!planChecked ? (
            <button type="button" onClick={() => setPlanChecked(true)} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Check my plan</button>
          ) : (
            <div className="space-y-2 text-sm">
              <p className={missing.length ? "text-rose-800" : "text-emerald-800"}>
                {missing.length ? `Missing: ${missing.map((id) => STUDIES[id].short).join(", ")}. They have been added for you.` : "All required studies chosen."}
                {extra.length ? ` Not needed for this question: ${extra.map((id) => STUDIES[id].short).join(", ")}.` : ""}
              </p>
              <p className="text-slate-700">{c.why}</p>
              <button type="button" onClick={() => setStep("record")} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Start recording</button>
            </div>
          )}
        </section>
      )}

      {step === "record" && (
        <div className="space-y-3">
          <NcsWorkbench studyIds={studyIds} patient={patient} env={env} setEnv={setEnv} states={states} setStates={setStates} />
          <button type="button" onClick={() => setStep("review")} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Go to review</button>
        </div>
      )}

      {step === "review" && (
        <section className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">Your results</h3>
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="py-1 pr-3">Study</th><th className="py-1 pr-3">Site</th><th className="py-1 pr-3">Latency</th><th className="py-1 pr-3">Amplitude</th><th className="py-1 pr-3">Velocity</th><th className="py-1 pr-3">Flags</th></tr>
              </thead>
              <tbody>
                {studyIds.flatMap((id) => { const rowsOf = measurements(id, states[id] || emptyStudyState(id)); return rowsOf.map((r, i) => {
                  const s = STUDIES[id];
                  const flags = flagsFor(id, r, i === 0, i > 0 ? rowsOf[i - 1].cv : null);
                  return (
                    <tr key={`${id}-${r.site}`} className="border-t border-slate-100">
                      <td className="py-1.5 pr-3 font-medium">{i === 0 ? s.short : ""}</td>
                      <td className="py-1.5 pr-3">{r.site === s.distalStim ? s.distalLabel : s.proximal.find((p) => p.site === r.site)?.label}</td>
                      <td className="py-1.5 pr-3">{s.type === "motor" ? (r.onset != null ? `${r.onset.toFixed(2)} ms` : "-") : (r.peak != null ? `${r.peak.toFixed(2)} ms (peak)` : "-")}</td>
                      <td className="py-1.5 pr-3">{r.amp == null ? "-" : s.type === "motor" ? `${(r.amp / 1000).toFixed(1)} mV` : `${r.amp.toFixed(0)} µV`}</td>
                      <td className="py-1.5 pr-3">{r.cv ? `${r.cv.toFixed(0)} m/s` : "-"}</td>
                      <td className={`py-1.5 pr-3 ${r.onset == null || r.peak == null ? "text-slate-500" : flags.length ? "text-rose-700" : "text-emerald-700"}`}>{r.onset == null || r.peak == null ? "Not marked" : flags.join(", ") || "Within limits"}</td>
                    </tr>
                  );
                }); })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-slate-500">Flags compare your marked values with this app's reference limits. Interpretation belongs to the reading physician; these questions build the pattern recognition behind it.</p>
          </div>

          {c.questions.map((x, i) => {
            const pick = answers[i];
            return (
              <div key={x.q} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">{x.q}</p>
                <div className="grid gap-2">
                  {x.options.map((o, j) => {
                    const tone = !finished ? (pick === j ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-white hover:bg-slate-50")
                      : j === x.answer ? "border-emerald-500 bg-emerald-50" : pick === j ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-white opacity-70";
                    return (
                      <button key={o} type="button" disabled={finished} onClick={() => setAnswers((a) => ({ ...a, [i]: j }))} className={`rounded-lg border px-3 py-2 text-left text-sm ${tone}`}>
                        <span className="mr-2 font-semibold">{String.fromCharCode(65 + j)}.</span>{o}
                      </button>
                    );
                  })}
                </div>
                {finished && <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{x.explanation}</p>}
              </div>
            );
          })}

          {!finished ? (
            <button type="button" disabled={Object.keys(answers).length < c.questions.length}
              onClick={() => { setFinished(true); onDone(); }}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Finish and score the case</button>
          ) : (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Case score</h3>
              <div className="grid gap-2 sm:grid-cols-4">
                {[["Plan", result.plan], ["Technique", result.techPct], ["Measurements", result.accPct], ["Interpretation", result.qPct]].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-slate-50 p-3 text-center">
                    <div className="text-xs uppercase tracking-wide text-slate-500">{k}</div>
                    <div className={`text-2xl font-bold ${v >= 80 ? "text-emerald-700" : v >= 50 ? "text-amber-700" : "text-rose-700"}`}>{v}%</div>
                  </div>
                ))}
              </div>
              <ul className="space-y-1.5">
                {result.tech.filter((t) => !t.ok).map((t) => (
                  <li key={`${t.study}-${t.label}`} className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900"><strong>{STUDIES[t.study].short}: {t.label}.</strong> {t.detail}</li>
                ))}
                {result.acc.filter((a) => !a.ok).map((a) => (
                  <li key={`${a.study}-${a.site}-${a.what}`} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    <strong>{STUDIES[a.study].short}, {a.site}: {a.what}.</strong> You marked {a.yours == null ? "nothing" : STUDIES[a.study].type === "motor" && a.what === "amplitude" ? `${(a.yours / 1000).toFixed(1)} mV` : a.yours.toFixed(2)}; the screen shows about {STUDIES[a.study].type === "motor" && a.what === "amplitude" ? `${(a.ref / 1000).toFixed(1)} mV` : a.ref.toFixed(2)}.
                  </li>
                ))}
                {result.tech.every((t) => t.ok) && result.acc.every((a) => a.ok) && <li className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Clean technique and accurate measurements.</li>}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Cases() {
  const [open, setOpen] = useState(null);
  const [done, setDone] = useState(loadDone);
  const c = data.cases.find((x) => x.id === open);
  if (c) {
    return <CaseRunner key={c.id} c={c} onExit={() => setOpen(null)} onDone={() => { const v = { ...done, [c.id]: new Date().toISOString() }; setDone(v); saveDone(v); }} />;
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
  const tab = TABS.some(([id]) => id === raw) ? raw : "sural";
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
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setParams(id === "sural" ? {} : { tab: id })}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"}`}>{label}</button>
          ))}
        </nav>
      </div>
      <div role="tabpanel">
        {tab === "sural" && <SuralWorkspace />}
        {tab === "bench" && <Bench />}
        {tab === "cases" && <Cases />}
        {tab === "setup" && <SetupGuide />}
        {tab === "pitfalls" && <Pitfalls />}
      </div>
    </div>
  );
}
