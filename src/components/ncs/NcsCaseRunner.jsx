import React, { useMemo, useState } from "react";
import NerveWorkspace from "./NerveWorkspace.jsx";
import { WORKSPACES } from "../../ncs/workspaces.js";
import { assessStudy, fmtAmpFor, resultRows } from "../../ncs/assess.js";

/**
 * A graded NCS case on the interactive workspace: plan the studies, record
 * them on a patient whose nerves carry the case's pathology, then review the
 * results, answer the questions and get a score for planning, technique,
 * measurement and interpretation.
 */

const ALL = Object.keys(WORKSPACES);

export default function NcsCaseRunner({ c, onExit, onDone }) {
  const [step, setStep] = useState("plan");
  const [picked, setPicked] = useState([]);
  const [planChecked, setPlanChecked] = useState(false);
  const [active, setActive] = useState(c.required[0]);
  const [states, setStates] = useState({});
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const studyIds = useMemo(() => ALL.filter((id) => c.required.includes(id) || picked.includes(id)), [c, picked]);
  const missing = c.required.filter((id) => !picked.includes(id));
  const extra = picked.filter((id) => !c.required.includes(id) && !(c.optional || []).includes(id));
  const handlers = useMemo(() => Object.fromEntries(ALL.map((id) => [id, (st) => setStates((s) => ({ ...s, [id]: st }))])), []);

  const result = useMemo(() => {
    if (!finished) return null;
    const tech = [], meas = [];
    for (const id of c.required) {
      const st = states[id];
      if (!st || !Object.keys(st.records).length) {
        tech.push({ study: id, ok: false, text: "Not recorded." });
        continue;
      }
      const a = assessStudy(WORKSPACES[id], st);
      for (const i of a.items) tech.push({ study: id, ...i });
      for (const m of a.meas) meas.push({ study: id, ...m });
    }
    const pct = (arr) => (arr.length ? Math.round((100 * arr.filter(Boolean).length) / arr.length) : 0);
    return {
      tech, meas,
      plan: pct(c.required.map((id) => picked.includes(id))),
      techPct: pct(tech.map((t) => t.ok)),
      measPct: pct(meas.map((m) => m.ok)),
      qPct: pct(c.questions.map((x, i) => answers[i] === x.answer)),
    };
  }, [finished, c, states, answers, picked]);

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
                {WORKSPACES[id].protocol.label}
              </label>
            ))}
          </div>
          {!planChecked ? (
            <button type="button" onClick={() => setPlanChecked(true)} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Check my plan</button>
          ) : (
            <div className="space-y-2 text-sm">
              <p className={missing.length ? "text-rose-800" : "text-emerald-800"}>
                {missing.length ? `Missing: ${missing.map((id) => WORKSPACES[id].label).join(", ")}. They have been added for you.` : "All required studies chosen."}
                {extra.length ? ` Not needed for this question: ${extra.map((id) => WORKSPACES[id].label).join(", ")}.` : ""}
              </p>
              <p className="text-slate-700">{c.why}</p>
              <button type="button" onClick={() => setStep("record")} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Start recording</button>
            </div>
          )}
        </section>
      )}

      <div className={step === "record" ? "space-y-3" : "hidden"}>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Studies in this case">
          {studyIds.map((id) => (
            <button key={id} type="button" role="tab" aria-selected={active === id} onClick={() => setActive(id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${active === id ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}>
              {WORKSPACES[id].label}{Object.keys(states[id]?.records || {}).length ? " ✓" : ""}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-600">This patient has a real abnormality somewhere. Record each study carefully; the limb starts at the temperature it arrived with.</p>
        {planChecked && studyIds.map((id) => {
          const cfg = WORKSPACES[id];
          return (
            <div key={id} className={active === id ? "" : "hidden"}>
              <NerveWorkspace config={cfg} patient={c.ws} initialTemp={cfg.limb === "hand" ? c.temp.arm : c.temp.leg} preset={c.preset?.[id]} onState={handlers[id]} caseMode />
            </div>
          );
        })}
        <button type="button" onClick={() => setStep("review")} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Go to review</button>
      </div>

      {step === "review" && (
        <section className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-semibold text-slate-900">Your results</h3>
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="py-1 pr-3">Study</th><th className="py-1 pr-3">Site</th><th className="py-1 pr-3">Latency</th><th className="py-1 pr-3">Amplitude</th><th className="py-1 pr-3">Velocity</th><th className="py-1 pr-3">Flags</th></tr>
              </thead>
              <tbody>
                {studyIds.flatMap((id) => {
                  const cfg = WORKSPACES[id];
                  const st = states[id];
                  if (!st) return [];
                  const fmtAmp = fmtAmpFor(cfg.kind);
                  return resultRows(cfg, st).filter((r) => r.recorded).map((r, i) => (
                    <tr key={`${id}-${r.site}`} className="border-t border-slate-100">
                      <td className="py-1.5 pr-3 font-medium">{i === 0 ? cfg.label : ""}</td>
                      <td className="py-1.5 pr-3">{r.label}</td>
                      <td className="py-1.5 pr-3">{cfg.kind === "motor" ? (r.onset != null ? `${r.onset.toFixed(2)} ms` : "-") : (r.peak != null ? `${r.peak.toFixed(2)} ms (peak)` : "-")}</td>
                      <td className="py-1.5 pr-3">{fmtAmp(r.amp)}</td>
                      <td className="py-1.5 pr-3">{r.cv ? `${r.cv.toFixed(0)} m/s` : "-"}</td>
                      <td className={`py-1.5 pr-3 ${!r.marked ? "text-slate-500" : r.flags.length ? "text-rose-700" : "text-emerald-700"}`}>{!r.marked ? "Not marked" : r.flags.join(", ") || "Within limits"}</td>
                    </tr>
                  ));
                })}
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
                {[["Plan", result.plan], ["Technique", result.techPct], ["Measurements", result.measPct], ["Interpretation", result.qPct]].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-slate-50 p-3 text-center">
                    <div className="text-xs uppercase tracking-wide text-slate-500">{k}</div>
                    <div className={`text-2xl font-bold ${v >= 80 ? "text-emerald-700" : v >= 50 ? "text-amber-700" : "text-rose-700"}`}>{v}%</div>
                  </div>
                ))}
              </div>
              <ul className="space-y-1.5">
                {[...result.tech, ...result.meas].filter((t) => !t.ok).map((t, i) => (
                  <li key={i} className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900"><strong>{WORKSPACES[t.study].label}:</strong> {t.text}</li>
                ))}
                {[...result.tech, ...result.meas].every((t) => t.ok) && <li className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Clean technique and accurate measurements.</li>}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
