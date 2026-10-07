import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EegTracing from "../EegTracing.jsx";
import { Card, Table } from "../study/ui.jsx";
import RecordingPlan from "./RecordingPlan.jsx";
import { hasRecordingPlan } from "./recordingPlanUtils.js";
import patternsData from "../../data/neurotrace_patterns_library_v2.json";

/**
 * Syndrome browser: search and classification filter, one syndrome at a time with six sub-sections.
 * Shared by the Syndromes tab. All content comes from neuroSyndromes.json; tracings from syndromeScenes.json.
 */

const GROUPS = [
  ["infant", "Neonate and infant"],
  ["child", "Childhood"],
  ["adolescent", "Adolescent and adult"],
];

const SECTIONS = [
  ["overview", "Overview"],
  ["eeg", "EEG and tracing"],
  ["activation", "How to record (best yield)"],
  ["clinical", "Clinical features"],
  ["course", "Course and differential"],
  ["pearls", "Your role and exam pearls"],
];


const patternName = (id) => patternsData.find((p) => p.id === id)?.name || id.replace(/^pattern_/, "").replace(/_/g, " ");

function scene2Labels(s) {
  if (s.sceneLabels) return s.sceneLabels;
  if (s.id === "west_syndrome") return ["Hypsarrhythmia", "A spasm"];
  if (s.id === "lennox_gastaut") return ["Slow spike-wave (awake)", "Fast activity (sleep)"];
  return ["Interictal", "Ictal"];
}

function Bullets({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((x) => <li key={x}>{x}</li>)}
    </ul>
  );
}

function Field({ label, children }) {
  if (!children) return null;
  return <p><strong>{label}:</strong> {children}</p>;
}

function SyndromeDetail({ s, scenes, syndromes, onSelect, hasSection }) {
  const [section, setSection] = useState("overview");
  const [two, setTwo] = useState(false);
  const available = SECTIONS.filter(([id]) => hasSection(s, id));
  const key = two && s.scene2 ? s.scene2 : s.scene;
  const labels = scene2Labels(s);
  const related = (s.related || []).filter((r) => syndromes.some((x) => x.id === r));
  const relatedGenetic = (s.related || []).filter((r) => ["angelman", "rett", "lissencephaly"].includes(r));
  const geneId = { angelman: "ube3a", rett: "mecp2", lissencephaly: "lis1dcx" };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-900">{s.name}</h2>
        {s.classification && <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{s.classification}</span>}
      </div>
      <div role="tablist" aria-label="Syndrome sections" className="flex flex-wrap gap-1 border-b border-slate-200">
        {available.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            onClick={() => setSection(id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold ${section === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {section === "overview" && (
        <Card title="Overview" tone="indigo">
          <Field label="Age at onset">{s.ageText}</Field>
          <Field label="Seizures">{s.seizure}</Field>
          <Field label="Mechanism">{s.pathophys}</Field>
          <Field label="EEG in one line">{s.eegShort}</Field>
          {(s.patterns || []).length > 0 && (
            <p>
              <strong>Related pattern pages:</strong>{" "}
              {s.patterns.map((p, i) => (
                <span key={p}>
                  {i > 0 && ", "}
                  <Link to={`/patterns/${p}`} className="font-semibold text-indigo-700 hover:underline">{patternName(p)}</Link>
                </span>
              ))}
            </p>
          )}
        </Card>
      )}

      {section === "eeg" && (
        <div className="space-y-4">
          <Card title="EEG findings" tone="indigo">
            <p>{s.eeg}</p>
          </Card>
          {s.scene ? (
            <>
              {s.scene2 && (
                <div className="flex gap-2">
                  {[false, true].map((v) => (
                    <button key={String(v)} type="button" onClick={() => setTwo(v)} className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${two === v ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}>
                      {labels[v ? 1 : 0]}
                    </button>
                  ))}
                </div>
              )}
              <EegTracing key={key} scene={scenes[key]} caption={`NeuroLinea synthetic tracing. ${s.sceneNote || ""}`.trim()} />
            </>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">There is no tracing for this syndrome because its first EEG can be normal and the later changes are nonspecific.</p>
          )}
        </div>
      )}

      {section === "activation" && <RecordingPlan s={s} />}

      {section === "clinical" && s.clinical && (
        <Card title="Clinical features" tone="indigo">
          {s.clinical.manifestations && <div><strong>Seizure features</strong><Bullets items={s.clinical.manifestations} /></div>}
          {s.clinical.triggers && s.clinical.triggers.length > 0 && <div><strong>Triggers</strong><Bullets items={s.clinical.triggers} /></div>}
          <Field label="Neurological exam">{s.clinical.exam}</Field>
          <Field label="Imaging">{s.clinical.imaging}</Field>
          <Field label="Development">{s.clinical.development}</Field>
        </Card>
      )}

      {section === "course" && (
        <div className="space-y-4">
          {s.course && (
            <Card title="Course and outlook" tone="indigo">
              <Field label="Onset">{s.course.onset}</Field>
              <Field label="Progression">{s.course.progression}</Field>
              <Field label="Outcome">{s.course.outcome}</Field>
            </Card>
          )}
          {s.differential && s.differential.length > 0 && (
            <Card title="Differential diagnosis (what the reader weighs it against)">
              <Bullets items={s.differential} />
            </Card>
          )}
          {(related.length > 0 || relatedGenetic.length > 0) && (
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Related syndromes</div>
              <div className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <button key={r} type="button" onClick={() => onSelect(r)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    {syndromes.find((x) => x.id === r).label}
                  </button>
                ))}
                {relatedGenetic.map((r) => (
                  <Link key={r} to={`/neuro-syndromes?tab=genetics&id=${geneId[r]}`} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    {r === "angelman" ? "Angelman" : r === "rett" ? "Rett" : "Lissencephaly"}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {section === "pearls" && (
        <div className="space-y-4">
          <Card title="What you do" tone="indigo">
            <p>{s.technologist}</p>
          </Card>
          {s.pearls && s.pearls.length > 0 && (
            <Card title="Exam pearls">
              <Bullets items={s.pearls} />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function SyndromeBrowser({ syndromes, scenes, selectedId, onSelect }) {
  const [search, setSearch] = useState("");
  const [cls, setCls] = useState("all");
  const classes = useMemo(() => [...new Set(syndromes.map((s) => s.classification).filter(Boolean))], [syndromes]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return syndromes.filter((s) => {
      if (cls !== "all" && s.classification !== cls) return false;
      if (!q) return true;
      const text = [s.name, s.label, s.classification, s.ageText, s.seizure, s.eegShort, s.eeg, ...(s.clinical?.manifestations || []), ...(s.clinical?.triggers || [])].filter(Boolean).join(" ").toLowerCase();
      return text.includes(q);
    });
  }, [syndromes, search, cls]);
  const selected = syndromes.find((s) => s.id === selectedId) || syndromes[0];
  const hasSection = (s, id) => {
    if (id === "overview" || id === "eeg" || id === "pearls") return true;
    if (id === "activation") return hasRecordingPlan(s);
    if (id === "clinical") return Boolean(s.clinical);
    if (id === "course") return Boolean(s.course || (s.differential && s.differential.length) || (s.related && s.related.length));
    return false;
  };

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">Syndromes are grouped by age of onset. Search, filter by family, then choose one to see its mechanism, EEG, how to record it for the best yield, clinical picture and a tracing. Compare the pattern with the age, because the same discharge means different things at different ages.</p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search syndromes, features, triggers..."
          aria-label="Search syndromes"
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {["all", ...classes].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCls(c)}
              aria-pressed={cls === c}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls === c ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
            >
              {c === "all" ? `All (${syndromes.length})` : `${c} (${syndromes.filter((s) => s.classification === c).length})`}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {GROUPS.map(([gid, label]) => {
          const items = filtered.filter((x) => x.group === gid);
          if (items.length === 0) return null;
          return (
            <div key={gid}>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
              <div className="flex flex-wrap gap-2">
                {items.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => onSelect(x.id)}
                    aria-pressed={x.id === selected.id}
                    className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${x.id === selected.id ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
                  >
                    {x.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-slate-500">No syndrome matches that search.</p>}
      </div>
      <SyndromeDetail key={selected.id} s={selected} scenes={scenes} syndromes={syndromes} onSelect={onSelect} hasSection={hasSection} />
      <Table head={["Syndrome", "Age", "Defining EEG"]} rows={syndromes.map((x) => [x.label, x.ageText, x.eegShort])} />
    </div>
  );
}
