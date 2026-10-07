import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EegTracing from "../components/EegTracing.jsx";
import { Card, Table } from "../components/study/ui.jsx";
import data from "../data/neuroSyndromes.json";
import scenes from "../data/syndromeScenes.json";
import casesData from "../data/cases.json";
import { ELECTRODES } from "../eeg/generator";
import { FEATURES, matchSyndromes } from "../eeg/syndromeMatch";

/**
 * Neuroanatomy, pathophysiology and syndromes, each tied to a NeuroLinea synthetic tracing.
 * Content lives in src/data/neuroSyndromes.json; tracings in src/data/syndromeScenes.json.
 */

const TABS = [
  ["overview", "Overview"],
  ["anatomy", "Anatomy"],
  ["physiology", "Pathophysiology"],
  ["regions", "Regions and lesions"],
  ["syndromes", "Syndromes"],
  ["genetics", "Genetics and neurocutaneous"],
  ["patterns", "Encephalopathy patterns"],
  ["finder", "Syndrome finder"],
  ["mistakes", "Common mistakes"],
  ["practice", "Practice"],
];
const TAB_IDS = new Set(TABS.map(([id]) => id));

const REGION_COLORS = {
  frontal: { fill: "#c7d2fe", stroke: "#4f46e5" },
  central: { fill: "#fde68a", stroke: "#d97706" },
  temporal: { fill: "#bbf7d0", stroke: "#16a34a" },
  parietal: { fill: "#fbcfe8", stroke: "#db2777" },
  occipital: { fill: "#bae6fd", stroke: "#0284c7" },
};

function regionOf(electrode) {
  return data.regions.find((r) => r.electrodes.includes(electrode))?.id ?? null;
}

function HeadMap({ selected, onSelect }) {
  const S = 130;
  const px = (v) => 150 + v * S;
  const py = (v) => 150 - v * S;
  return (
    <svg viewBox="0 0 300 310" className="mx-auto block h-auto w-full max-w-sm" role="img" aria-label="Head seen from above with the 10-20 electrodes coloured by lobe">
      <circle cx="150" cy="150" r={S * 1.05} fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
      <path d={`M${px(-0.12)} ${py(1.04)} L${px(0)} ${py(1.22)} L${px(0.12)} ${py(1.04)}`} fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
      <ellipse cx={px(-1.08)} cy={py(0)} rx="7" ry="22" fill="#f1f5f9" stroke="#94a3b8" />
      <ellipse cx={px(1.08)} cy={py(0)} rx="7" ry="22" fill="#f1f5f9" stroke="#94a3b8" />
      {Object.entries(ELECTRODES)
        .filter(([name]) => !["IO1", "IO2", "LOC", "ROC"].includes(name))
        .map(([name, [x, y]]) => {
          const reg = regionOf(name);
          const col = reg ? REGION_COLORS[reg] : { fill: "#e2e8f0", stroke: "#94a3b8" };
          const on = reg && reg === selected;
          return (
            <g
              key={name}
              onClick={() => reg && onSelect(reg)}
              style={{ cursor: reg ? "pointer" : "default" }}
              role={reg ? "button" : undefined}
              aria-label={reg ? `${name}, ${reg} region` : name}
            >
              <circle cx={px(x)} cy={py(y)} r={on ? 15 : 12} fill={col.fill} stroke={col.stroke} strokeWidth={on ? 3 : 1.5} />
              <text x={px(x)} y={py(y) + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#0f172a">{name}</text>
            </g>
          );
        })}
      <text x="150" y="304" textAnchor="middle" fontSize="10" fill="#64748b">Seen from above. The nose is at the top; left is on the left.</text>
    </svg>
  );
}

function RegionLegend({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {data.regions.map((r) => {
        const c = REGION_COLORS[r.id];
        const on = r.id === selected;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            aria-pressed={on}
            className="rounded-md border px-3 py-1.5 text-sm font-semibold"
            style={{ background: on ? c.stroke : c.fill, borderColor: c.stroke, color: on ? "#fff" : "#0f172a" }}
          >
            {r.name.replace(" lobe", "").replace(" (sensorimotor) cortex", "")}
          </button>
        );
      })}
    </div>
  );
}

function Overview({ go }) {
  const items = [
    ["Anatomy", "lobes, electrodes, arteries", "Which cortex lies under which electrode, what each lobe does, and which artery supplies it.", "anatomy"],
    ["Pathophysiology", "generators and mechanisms", "How the scalp EEG is made, why delta means deafferentation, and what happens in a spike, a seizure and an absence.", "physiology"],
    ["Regions and lesions", "a lesion gives a pattern", "For every lobe: the deficit, the usual EEG change, the seizure semiology and a recording to study.", "regions"],
    ["Syndromes", "age plus pattern", "Eleven epilepsy syndromes in age order with seizure type, mechanism, EEG findings and tracings.", "syndromes"],
    ["Genetics and neurocutaneous", "genes and skin signs", "Tuberous sclerosis, neurofibromatosis, Sturge-Weber and the main epilepsy genes, each with its EEG and a tracing where one is honest.", "genetics"],
    ["Encephalopathy patterns", "periodic and unusual rhythms", "Periodic discharges, alpha coma and drug beta, with the situation each one points to.", "patterns"],
    ["Syndrome finder", "age + feature", "Enter the age and the main EEG feature and see which syndromes fit.", "finder"],
  ];
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-slate-600">
        This section links three things that exam questions keep joining: where the brain generates an activity, why it does so, and how that appears in a recording.
        Work from anatomy to pathophysiology to syndrome, then check yourself against a tracing.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(([title, tag, body, tab]) => (
          <button key={title} type="button" onClick={() => go(tab)} className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:shadow-sm">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="mt-1 inline-block rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">{tag}</div>
            <p className="mt-2 text-sm text-slate-600">{body}</p>
          </button>
        ))}
      </div>
      <Card title="Five hooks to hold on to" tone="indigo">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>The EEG shows synaptic potentials, not spikes of single neurons.</strong> Many aligned pyramidal cells, several square centimetres of cortex.</li>
          <li><strong>Focal delta points to focal cortical or white-matter dysfunction under the delta.</strong> A destructive or white-matter lesion cuts off the cortex, so the cortex slows.</li>
          <li><strong>Thalamus drives the rhythms.</strong> Spindles, the alpha rhythm and the 3 Hz of absence all depend on thalamocortical loops.</li>
          <li><strong>Age picks the syndrome.</strong> Infantile spasms, childhood absence, adolescent myoclonus: the same pattern at another age is another diagnosis.</li>
          <li><strong>You describe, the reader names.</strong> Frequency, amplitude, distribution, state, events and medications.</li>
        </ul>
      </Card>
      <button type="button" onClick={() => go("regions")} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
        Open the regions explorer →
      </button>
    </div>
  );
}

function Anatomy() {
  const [region, setRegion] = useState("temporal");
  const r = data.regions.find((x) => x.id === region);
  return (
    <div className="space-y-5">
      <Card title="Electrodes sit over lobes">
        <p>Each electrode name starts with the lobe it lies over: Fp (frontopolar), F (frontal), C (central), P (parietal), O (occipital), T (temporal). Odd numbers are on the left, even numbers on the right, and z marks the midline.</p>
        <p>Click an electrode or a lobe name to see that lobe described beside the map. Each lobe has its own colour.</p>
      </Card>
      <div className="grid items-start gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <HeadMap selected={region} onSelect={setRegion} />
          <RegionLegend selected={region} onSelect={setRegion} />
        </div>
        <Card title={r.name} tone="indigo">
          <p><strong>Electrodes:</strong> {r.electrodes.join(", ")}</p>
          <p><strong>Blood supply:</strong> {r.supply}</p>
          <p><strong>Functions:</strong> {r.functions}</p>
          <p><strong>Normal EEG:</strong> {r.normal}</p>
        </Card>
      </div>
      <Card title="Hemispheric dominance and the 10-20 shortcut">
        <p>Language is in the left hemisphere in most right-handed people and in many left-handed people. A left temporal or frontal lesion can therefore cause aphasia, while a right (non-dominant) parietal lesion more often causes neglect.</p>
        <p>The central electrodes C3 and C4 lie over the motor and sensory strip, with the face and hand lowest and the leg highest, near the midline.</p>
      </Card>
      <h3 className="text-base font-semibold text-slate-900">Arterial territories and the EEG</h3>
      <Table
        head={["Territory", "Cortex supplied", "Usual deficit", "Usual EEG change"]}
        rows={data.territories.map((t) => [t.name, t.area, t.deficit, t.eeg])}
        note="The EEG change depends on the size and age of the lesion. A small, deep or old infarct can leave the EEG normal or only mildly asymmetric."
      />
    </div>
  );
}

function Physiology() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {data.generators.map((g) => (
          <Card key={g.title} title={g.title}>
            <p>{g.text}</p>
          </Card>
        ))}
      </div>
      <Table
        head={["Observation", "What it usually means"]}
        rows={[
          ["Focal polymorphic delta", "A focal lesion of white matter or deep cortex that has deafferented the overlying cortex"],
          ["Focal attenuation of faster activity", "Destruction of cortex, or a fluid or tissue layer between the cortex and the scalp"],
          ["Generalized slowing", "Diffuse cortical or white-matter dysfunction, or a thalamic or brainstem disturbance of arousal"],
          ["Focal spikes", "A hyperexcitable patch of cortex, with the spike field visible on the scalp"],
          ["Generalized spike-and-wave", "An abnormal thalamocortical oscillation or a diffusely hyperexcitable cortex"],
          ["Periodic complexes", "A severe, often rapidly progressive brain illness with repeated synchronized discharges (lateralized if focal, generalized if diffuse)"],
          ["Burst suppression", "A severely depressed cortex that cannot keep up a continuous rhythm"],
        ]}
      />
    </div>
  );
}

function Regions() {
  const [region, setRegion] = useState("frontal");
  const r = data.regions.find((x) => x.id === region);
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">Pick a lobe. Each tracing below places a focal delta over that lobe, so you can see what a lesion at that spot does to the recording. Switch montages to see the localization.</p>
      <div className="grid items-start gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <HeadMap selected={region} onSelect={setRegion} />
          <RegionLegend selected={region} onSelect={setRegion} />
        </div>
        <div className="space-y-3">
          <Card title={`${r.name}: deficit and EEG`} tone="indigo">
            <p><strong>If it is damaged:</strong> {r.lesion}</p>
            <p><strong>When it seizes:</strong> {r.seizure}</p>
            <p><strong>Localizing on the EEG:</strong> {r.eegNote}</p>
          </Card>
        </div>
      </div>
      <EegTracing
        scene={scenes[r.scene]}
        caption={
          r.id === "temporal"
            ? "Temporal lobe: a focal delta over the anterior temporal region. It is largest in Fp1-F7, F7-T3 and the neighbouring left channels. An ear-referenced montage is not offered here, because the ear electrode picks up temporal activity and would blur the localization."
            : `${r.name}: a focal delta over the region. Open the Ipsi ear tab to compare, and use the amplitude ruler on the largest channels.`
        }
      />
    </div>
  );
}

function SyndromeCard({ s }) {
  const [show2, setShow2] = useState(false);
  return (
    <div className="space-y-4">
      <Card title={s.name} tone="indigo">
        <p><strong>Age:</strong> {s.ageText}</p>
        <p><strong>Seizures:</strong> {s.seizure}</p>
        <p><strong>Mechanism:</strong> {s.pathophys}</p>
        <p><strong>EEG:</strong> {s.eeg}</p>
        <p><strong>Your role:</strong> {s.technologist}</p>
        {s.detail && (
          <p>
            <Link to={`/syndromes/${s.detail}`} className="font-semibold text-indigo-700 hover:underline">More detail on this syndrome →</Link>
          </p>
        )}
      </Card>
      {s.scene ? (
        <>
          {s.scene2 && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setShow2(false)} className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${!show2 ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}>
                {s.id === "west" ? "Hypsarrhythmia" : s.id === "lgs" ? "Slow spike-wave (awake)" : "Interictal"}
              </button>
              <button type="button" onClick={() => setShow2(true)} className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${show2 ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}>
                {s.id === "west" ? "A spasm" : s.id === "lgs" ? "Fast activity (sleep)" : "Ictal"}
              </button>
            </div>
          )}
          <EegTracing scene={scenes[show2 && s.scene2 ? s.scene2 : s.scene]} caption="NeuroLinea synthetic tracing of the typical pattern." />
        </>
      ) : (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">There is no tracing for this syndrome because its first EEG can be normal and the later changes are nonspecific.</p>
      )}
    </div>
  );
}

function Syndromes() {
  const [id, setId] = useState("west");
  const s = data.syndromes.find((x) => x.id === id);
  const groups = [
    ["Neonate and infant", (x) => x.group === "infant"],
    ["Childhood", (x) => x.group === "child"],
    ["Adolescent and adult", (x) => x.group === "adolescent"],
  ];
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">Syndromes are grouped by age of onset. Choose one to see its mechanism, EEG and a tracing. Compare the pattern with the age, because the same discharge means different things at different ages.</p>
      <div className="space-y-3">
        {groups.map(([label, test]) => (
          <div key={label}>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
            <div className="flex flex-wrap gap-2">
              {data.syndromes.filter(test).map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setId(x.id)}
                  aria-pressed={x.id === id}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${x.id === id ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SyndromeCard key={s.id} s={s} />
      <Table
        head={["Syndrome", "Age", "Defining EEG"]}
        rows={data.syndromes.map((x) => [x.label, x.ageText, x.eegShort])}
      />
    </div>
  );
}

function GeneCard({ s }) {
  const [two, setTwo] = useState(false);
  const labels = s.sceneLabels || ["Pattern", "Later"];
  const key = two && s.scene2 ? s.scene2 : s.scene;
  return (
    <div className="space-y-4">
      <Card title={s.name} tone="indigo">
        <p><strong>Gene:</strong> {s.gene}</p>
        <p><strong>Typical onset:</strong> {s.age}</p>
        <p><strong>Clinical picture:</strong> {s.clinical}</p>
        <p><strong>Mechanism:</strong> {s.mechanism}</p>
        <p><strong>EEG:</strong> {s.eeg}</p>
        <p><strong>Your role:</strong> {s.technologist}</p>
        {s.detail && (
          <p><Link to={`/syndromes/${s.detail}`} className="font-semibold text-indigo-700 hover:underline">More detail on this syndrome →</Link></p>
        )}
      </Card>
      {key ? (
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
          <EegTracing scene={scenes[key]} caption={`NeuroLinea synthetic tracing. ${s.sceneNote || ""}`} />
        </>
      ) : (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">There is no tracing because the EEG is often normal or nonspecific, and a recording would not teach a reliable pattern.</p>
      )}
    </div>
  );
}

function Genetics() {
  const gen = data.genetics;
  const [id, setId] = useState("tsc");
  const s = gen.items.find((x) => x.id === id);
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">{gen.intro}</p>
      <ul className="max-w-3xl list-disc space-y-1 pl-5 text-sm text-slate-700">
        {gen.principles.map((p) => <li key={p}>{p}</li>)}
      </ul>
      <div className="space-y-3">
        {gen.groups.map(([gid, label]) => (
          <div key={gid}>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
            <div className="flex flex-wrap gap-2">
              {gen.items.filter((x) => x.group === gid).map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setId(x.id)}
                  aria-pressed={x.id === id}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${x.id === id ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <GeneCard key={s.id} s={s} />
      <h3 className="pt-2 text-lg font-bold text-slate-900">From the EEG pattern to the genes the reader may consider</h3>
      <Table head={["EEG pattern", "Conditions and genes to think of", "Remember"]} rows={gen.patternTable} />
    </div>
  );
}

function Patterns() {
  const [id, setId] = useState("hsv");
  const p = data.patterns.find((x) => x.id === id);
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">These patterns are not epilepsy syndromes. They are EEG signatures of an acute or progressive brain illness, a coma or a drug. Learn how they look, what they usually go with and what you should record.</p>
      <div className="flex flex-wrap gap-2">
        {data.patterns.map((x) => (
          <button key={x.id} type="button" onClick={() => setId(x.id)} aria-pressed={x.id === id} className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${x.id === id ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}>
            {x.name.split(" in ")[0].split(" (")[0].replace("Periodic lateralized discharges", "Lateralized periodic").replace("Generalized periodic complexes", "CJD-type periodic").replace("Periodic complexes", "SSPE complexes")}
          </button>
        ))}
      </div>
      <Card title={p.name} tone="indigo">
        <p><strong>Setting:</strong> {p.context}</p>
        <p><strong>EEG:</strong> {p.eeg}</p>
        <p><strong>Mechanism:</strong> {p.pathophys}</p>
        <p><strong>Your role:</strong> {p.technologist}</p>
      </Card>
      <EegTracing key={p.id} scene={scenes[p.scene]} caption="NeuroLinea synthetic tracing." />
      <Card title="Related pages">
        <p>
          Triphasic waves and the slowed background of metabolic encephalopathy are covered in <Link to="/cases/case-0081" className="font-semibold text-indigo-700 hover:underline">case-0081</Link> and{" "}
          <Link to="/cases/case-0082" className="font-semibold text-indigo-700 hover:underline">case-0082</Link>. Grades of diffuse slowing, burst suppression and electrocerebral inactivity are on the{" "}
          <Link to="/diffuse-abnormalities" className="font-semibold text-indigo-700 hover:underline">Diffuse Abnormalities</Link> page.
        </p>
      </Card>
    </div>
  );
}

function Finder() {
  const [age, setAge] = useState("8");
  const [feature, setFeature] = useState("any");
  const [open, setOpen] = useState(null);
  const results = useMemo(() => matchSyndromes(data.syndromes, { age, feature }), [age, feature]);
  const selectCls = "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm";
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">Enter the typical age at onset (leave it blank to ignore age) and choose the main EEG feature. The finder lists syndromes in this section that fit both. It is a study aid. The reader diagnoses.</p>
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Typical age at onset in years (months as a decimal, for example 0.5)</span>
          <input value={age} onChange={(e) => setAge(e.target.value)} inputMode="decimal" className={selectCls} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Main EEG feature</span>
          <select value={feature} onChange={(e) => setFeature(e.target.value)} className={selectCls}>
            {FEATURES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </label>
      </div>
      {results.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          No syndrome in this section fits that age and feature. Check the age, try &quot;Any feature&quot;, or consider that the pattern can be nonspecific.
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.ageText}</div>
                </div>
                {s.scene && (
                  <button type="button" onClick={() => setOpen(open === s.id ? null : s.id)} className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    {open === s.id ? "Hide tracing" : "Show tracing"}
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-700"><strong>EEG:</strong> {s.eeg}</p>
              {open === s.id && s.scene && <div className="mt-3"><EegTracing key={s.scene} scene={scenes[s.scene]} /></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Mistakes() {
  return (
    <div className="space-y-3">
      <p className="max-w-3xl text-slate-600">Each of these is a trap that exam questions use. Read the wrong idea, then the correct one.</p>
      {data.mistakes.map(([wrong, right]) => (
        <div key={wrong} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900"><span className="mr-1 font-semibold">Wrong idea:</span>{wrong}</div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900"><span className="mr-1 font-semibold">Correct:</span>{right}</div>
        </div>
      ))}
    </div>
  );
}

function Practice() {
  const cases = (casesData.starterCases || []).filter((c) => (c.tags || []).includes("neuro-syndromes"));
  return (
    <div className="space-y-5">
      <Card title="Practice with tracings" tone="indigo">
        <p>These cases ask you to tie anatomy and mechanism to the recording in front of you.</p>
        {cases.length === 0 ? (
          <p className="text-slate-500">Cases on this topic are coming soon.</p>
        ) : (
          <ul className="mt-2 grid gap-2 md:grid-cols-2">
            {cases.map((c) => (
              <li key={c.id}>
                <Link to={`/cases/${c.id}`} className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:border-indigo-300 hover:bg-indigo-50/40">
                  {c.title}
                  <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold capitalize text-slate-600">{c.difficulty}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Practice questions">
        <p>Questions on neuroanatomy, pathophysiology and syndromes are included in this app&apos;s practice questions. Start a quiz and choose the neuroanatomy and syndrome topics, or use Review Incorrect to revisit misses.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link to="/quiz" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Open quizzes</Link>
          <Link to="/syndromes" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">All syndromes</Link>
        </div>
      </Card>
    </div>
  );
}

export default function NeuroSyndromes() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab = TAB_IDS.has(raw) ? raw : "overview";
  const go = (id) => {
    setParams(id === "overview" ? {} : { tab: id }, { replace: false });
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          <span className="font-medium text-slate-900">Neuroanatomy and Syndromes</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Neuroanatomy, Pathophysiology and Syndromes</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Lobes, arteries and generators, how lesions and syndromes appear on the EEG, with a tracing for each.
        </p>
      </header>

      <div className="sticky top-[57px] z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur-sm">
        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="Neuroanatomy and syndromes sections">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => go(id)}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div role="tabpanel">
        {tab === "overview" && <Overview go={go} />}
        {tab === "anatomy" && <Anatomy />}
        {tab === "physiology" && <Physiology />}
        {tab === "regions" && <Regions />}
        {tab === "syndromes" && <Syndromes />}
        {tab === "genetics" && <Genetics />}
        {tab === "patterns" && <Patterns />}
        {tab === "finder" && <Finder />}
        {tab === "mistakes" && <Mistakes />}
        {tab === "practice" && <Practice />}
      </div>
    </div>
  );
}
