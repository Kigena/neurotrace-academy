import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EegTracing from "../components/EegTracing.jsx";
import { Card, Table } from "../components/study/ui.jsx";
import grades from "../data/diffuseGrades.json";
import casesData from "../data/cases.json";
import {
  BACKGROUND_OPTIONS, EXCESS_OPTIONS, GCS_EYE, GCS_MOTOR, GCS_VERBAL, GRADES, gcsSeverity, gradeDiffuse,
} from "../eeg/diffuseGrade";

/**
 * Diffuse EEG Abnormalities: levels of consciousness, the three basic slowing patterns and a grade I to VI teaching scale.
 * Every tracing is a NeuroLinea synthetic recording (src/eeg/generator.js).
 */

const TABS = [
  ["overview", "Overview"],
  ["grades", "Grade explorer"],
  ["finder", "Grade finder"],
  ["role", "Your role"],
  ["mistakes", "Common mistakes"],
  ["practice", "Practice"],
];
const TAB_IDS = new Set(TABS.map(([id]) => id));

const ORDER = ["IA", "IB", "IIA", "IIB", "IIIA", "IIIB", "IVA", "IVB", "VA", "VB", "VIA", "VIB"];

const WHAT_TO_SEE = {
  IA: "The posterior rhythm is slowed to about 7 to 8 Hz and the rest of the page is not busier with theta or delta. Count the cycles of the posterior rhythm in one second.",
  IB: "The posterior rhythm is clearly slower, about 4 to 6 Hz, but there is still no excess of other slow waves.",
  IIA: "A near-normal posterior rhythm is still present. Theta is the dominant slow activity, with some delta mixed in.",
  IIB: "The posterior rhythm has slowed (about 4 to 6 Hz) and theta is dominant with some delta: both the background and the slow-wave content are abnormal.",
  IIIA: "Delta waves dominate the page, yet a fair amount of near-normal alpha can still be seen, mostly at the back.",
  IIIB: "Delta dominates and the background is slow, mostly theta. There is no organized alpha.",
  IVA: "Large irregular delta waves, taller than 50 µV, with almost no theta or alpha. Use the amplitude ruler on the tallest waves.",
  IVB: "Irregular delta waves smaller than 50 µV with almost no theta or alpha. The page looks flatter, but the delta is still the main activity.",
  VA: "Bursts of mixed activity alternate with flat stretches. Each suppression period here lasts under 5 seconds. Time one with the caliper.",
  VB: "Bursts alternate with flat stretches, and the suppression periods last longer than 5 seconds. Time one with the caliper.",
  VIA: "Very little cerebral activity is left: a slow wave of only a few µV, seen at 2 µV/mm. The EKG channel shows the heartbeat for comparison.",
  VIB: "No cerebral activity can be seen above the noise at 2 µV/mm. What is left is artifact such as the heartbeat.",
};

const LEVELS = [
  ["Confusion", "Mild impairment: the person reacts normally to ordinary stimulation but has a short attention span and is unsure of the time, the place or who people are."],
  ["Delirium", "An acute, fluctuating confusional state with disorientation and poor attention. It can be restless and overactive, with hallucinations, delusions and incoherent speech, or quiet and withdrawn."],
  ["Lethargy (hypersomnia)", "Marked drowsiness. The person wakes with ordinary stimulation but falls back asleep as soon as it stops."],
  ["Stupor (semicoma)", "A partial loss of response. Vigorous stimulation arouses the person for a while, but they lapse back into unresponsiveness."],
  ["Coma", "Complete or almost complete loss of consciousness. Even powerful stimuli do not arouse the person."],
];

function GcsCalculator() {
  const [eye, setEye] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motor, setMotor] = useState(6);
  const r = gcsSeverity(eye, verbal, motor);
  const sel = (label, value, set, opts) => (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <select value={value} onChange={(e) => set(Number(e.target.value))} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5">
        {opts.map(([n, t]) => <option key={n} value={n}>{n}: {t}</option>)}
      </select>
    </label>
  );
  const tone = r.band === "severe" ? "border-red-200 bg-red-50 text-red-900" : r.band === "moderate" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="font-semibold text-slate-900">Glasgow Coma Scale calculator</h4>
      <p className="mb-3 text-xs text-slate-500">Three scores add up: eye opening (1 to 4), verbal response (1 to 5) and motor response (1 to 6). The total runs from 3 to 15.</p>
      <div className="grid gap-3 md:grid-cols-3">
        {sel("Eye opening (E)", eye, setEye, GCS_EYE)}
        {sel("Verbal response (V)", verbal, setVerbal, GCS_VERBAL)}
        {sel("Motor response (M)", motor, setMotor, GCS_MOTOR)}
      </div>
      <div className={`mt-3 rounded-lg border px-3 py-2 text-sm font-semibold ${tone}`}>
        E{r.eye} V{r.verbal} M{r.motor} = {r.total} · {r.total === 15 ? "full score" : `${r.band} impairment`} (severe 3 to 8, moderate 9 to 12, mild 13 to 15)
      </div>
      <p className="mt-2 text-xs text-slate-500">If the patient is intubated, the verbal response cannot be tested; record it the way the chart does.</p>
    </div>
  );
}

function Overview({ go }) {
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-slate-600">
        Any condition that clouds consciousness usually slows the EEG across the whole scalp. The deeper the impairment, the more the background slows,
        the more theta and delta appear, and finally the brain activity loses its organization or fades away. The EEG shows how severe the dysfunction is but is usually not specific for the cause.
      </p>
      <div>
        <h3 className="mb-3 text-base font-semibold text-slate-900">Levels of impaired consciousness</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map(([t, body], i) => (
            <div key={t} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">{i + 1}</span>
                <span className="text-sm font-semibold text-slate-900">{t}</span>
              </div>
              <p className="text-sm text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
      <GcsCalculator />
      <Card title="Three basic patterns of diffuse slowing" tone="indigo">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Slow background only</strong> (no extra theta or delta): the posterior rhythm has slowed. This suggests dysfunction of the cortex.</li>
          <li><strong>Theta and delta activity with a normal background</strong>: extra slow waves are scattered over a preserved posterior rhythm. This suggests white-matter dysfunction.</li>
          <li><strong>Slow background plus theta and delta</strong>: together these suggest dysfunction of both cortex and white matter.</li>
        </ul>
        <p>Diffuse slowing can follow metabolic, toxic or inflammatory illness, and demyelinating or degenerative disease. This is a teaching model, not a rule: a slow posterior rhythm also occurs in drowsiness and with drugs. The pattern narrows the options only when it is combined with the clinical picture.</p>
      </Card>
      <Card title="Four memory hooks">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Cortex slows the background; white matter adds theta and delta.</strong></li>
          <li><strong>Higher grade, deeper impairment:</strong> grade I is the mildest and grade VI the most severe.</li>
          <li><strong>The letter A is the less severe half of each grade:</strong> a faster background (I), a normal background (II and III), taller delta (IV), shorter suppression (V), some activity left (VI). B is the more severe half.</li>
          <li><strong>Grade V is about the time between bursts:</strong> suppression under 5 seconds is A, over 5 seconds is B.</li>
        </ul>
      </Card>
      <button type="button" onClick={() => go("grades")} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
        Open the grade explorer →
      </button>
    </div>
  );
}

function Grades() {
  const [pick, setPick] = useState("IA");
  const g = GRADES[pick];
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">
        This is one published teaching scale for diffuse abnormalities. It is a way to organize what you see, not a name for the cause. Your lab may use a different scale, and grading is the reader&apos;s job; the technologist records what the page shows.
      </p>
      <Table
        head={["Grade", "Activity", "Typical pattern"]}
        rows={ORDER.map((k) => [GRADES[k].label, GRADES[k].short, GRADES[k].pattern])}
        note="Grade V uses this scale's definition of burst suppression. Other systems, such as the ACNS 2021 critical-care terminology, define it differently (for example, suppression below 10 µV for at least half of the record), so follow the definition your lab uses."
      />
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose a grade">
        {ORDER.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setPick(k)}
            aria-pressed={pick === k}
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${pick === k ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
          >
            {k}
          </button>
        ))}
      </div>
      <Card title={`${g.label}: ${g.short}`} tone="indigo">
        <p>{WHAT_TO_SEE[pick]}</p>
      </Card>
      <EegTracing scene={grades[`grade${pick}`]} caption={`${g.label}. NeuroLinea synthetic tracing. Check the sensitivity before comparing heights between grades. Use the Caliper for timing and the Amplitude ruler for height.`} />
    </div>
  );
}

function Finder() {
  const [eci, setEci] = useState("none");
  const [burst, setBurst] = useState(false);
  const [supp, setSupp] = useState("3");
  const [background, setBackground] = useState("mild");
  const [excess, setExcess] = useState("none");
  const [deltaUv, setDeltaUv] = useState("80");
  const result = useMemo(
    () => gradeDiffuse({ eci, burst: burst ? { suppressionSeconds: supp.trim() === "" ? NaN : Number(supp) } : false, background, excess, deltaUv }),
    [eci, burst, supp, background, excess, deltaUv],
  );
  const scene = result.grade ? grades[`grade${result.grade}`] : null;
  const selectCls = "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm";
  const quiet = eci !== "none" || burst;

  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">Describe what the page shows, step by step, and the finder names the grade the scale would give. Then compare with a tracing of that grade. The scale names 7 to just under 8 Hz and 4 to 6 Hz; a background between 6 and 7 Hz falls between them. Exactly 50 µV or exactly 5 seconds is also a borderline call. Describe it and let the reader decide.</p>
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Cerebral activity</span>
          <select value={eci} onChange={(e) => setEci(e.target.value)} className={selectCls}>
            <option value="none">Present</option>
            <option value="near">Almost none (near electrocerebral inactivity)</option>
            <option value="complete">None (electrocerebral inactivity)</option>
          </select>
        </label>
        <label className={`block text-sm ${eci !== "none" ? "opacity-50" : ""}`}>
          <span className="mb-1 block font-medium text-slate-700">Burst suppression?</span>
          <select value={burst ? "yes" : "no"} disabled={eci !== "none"} onChange={(e) => setBurst(e.target.value === "yes")} className={selectCls}>
            <option value="no">No</option>
            <option value="yes">Yes: bursts alternate with flat stretches</option>
          </select>
        </label>
        {burst && eci === "none" && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Length of a suppression period (seconds)</span>
            <input value={supp} onChange={(e) => setSupp(e.target.value)} inputMode="decimal" className={selectCls} />
          </label>
        )}
        <label className={`block text-sm ${quiet ? "opacity-50" : ""}`}>
          <span className="mb-1 block font-medium text-slate-700">Background (posterior) activity</span>
          <select value={background} disabled={quiet} onChange={(e) => setBackground(e.target.value)} className={selectCls}>
            {BACKGROUND_OPTIONS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </label>
        <label className={`block text-sm ${quiet ? "opacity-50" : ""}`}>
          <span className="mb-1 block font-medium text-slate-700">Extra slow waves</span>
          <select value={excess} disabled={quiet} onChange={(e) => setExcess(e.target.value)} className={selectCls}>
            {EXCESS_OPTIONS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </label>
        {!quiet && background === "minimal" && excess === "delta" && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Delta amplitude, peak to peak (µV)</span>
            <input value={deltaUv} onChange={(e) => setDeltaUv(e.target.value)} inputMode="decimal" className={selectCls} />
            <span className="mt-1 block text-xs text-slate-500">Measure from the trough to the peak of the tallest waves and multiply the millimetres by the sensitivity.</span>
          </label>
        )}
      </div>
      <div className={`rounded-lg border px-4 py-3 text-sm ${result.grade ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
        {result.grade ? (
          <>
            <div className="text-base font-bold">{GRADES[result.grade].label}</div>
            <div className="font-medium">{GRADES[result.grade].short}</div>
          </>
        ) : (
          <div className="font-semibold">No grade</div>
        )}
        <p className="mt-1">{result.note}</p>
      </div>
      {scene && <EegTracing scene={scene} caption={`A ${GRADES[result.grade].label} recording to compare with.`} />}
    </div>
  );
}

function Role() {
  return (
    <div className="space-y-5">
      <Card title="What the technologist records">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>The patient&apos;s level of alertness and what you did to test it, with the Glasgow Coma Scale score if the chart gives one.</li>
          <li>The medications, sedatives and recent events on the requisition, since they change the EEG.</li>
          <li>Reactivity: what happened to the background when you opened or closed the eyes, called the patient, touched or applied other stimuli according to your lab&apos;s protocol. A background that does not react matters to the reader.</li>
          <li>The posterior rhythm frequency, the amplitude of the main activity and any bursts or flat stretches, described in the words and numbers your lab uses.</li>
          <li>Every change to sensitivity, filters or montage, and the time it happened.</li>
          <li>Artifacts: in a quiet record, the EKG, pulse, respirator, patient movement and electrical interference are what is left, so name them.</li>
        </ul>
      </Card>
      <Card title="Very low-voltage and flat recordings" tone="amber">
        <p>When almost nothing is seen, the question is whether a recording this flat can be trusted. Check the technical side first: electrode contact and impedance, the montage, the sensitivity (labs increase it, for example to 2 µV/mm, for these studies) and the EKG channel, so that artifacts can be told from cerebral activity.</p>
        <p>Sedating drugs, hypothermia and other conditions can flatten an EEG, so report them. Electrocerebral inactivity on an EEG is a finding for the reader, not a diagnosis of death by itself.</p>
        <p>Studies for suspected electrocerebral inactivity follow a strict guideline and your lab&apos;s protocol (extra electrodes, long recording time, special settings, reactivity testing). Follow the protocol exactly and do not shorten it. Calling an EEG flat is a medical decision for the reader, never the technologist.</p>
      </Card>
      <Card title="What you do not do" tone="amber">
        <ul className="list-disc space-y-1 pl-5">
          <li>You do not name a cause. Slowing points to a severity, not a diagnosis.</li>
          <li>You do not give the grade as a final answer. Describe what you see; the reader grades it.</li>
          <li>You do not stop or shorten a recording to match what you expect to find.</li>
        </ul>
        <p>You do tell the reader promptly about anything that changes during the study, and follow your lab&apos;s policy for urgent findings.</p>
      </Card>
    </div>
  );
}

const MISTAKES = [
  ["Diffuse slowing tells you the cause.", "It tells you how severe the dysfunction is. Metabolic, toxic, inflammatory and degenerative causes can all look alike."],
  ["Theta and delta waves mean the cortex is damaged.", "In this teaching model, extra theta and delta over a preserved background suggest white-matter involvement, and a slowed background alone suggests the cortex. Both are patterns, not diagnoses."],
  ["A slow background is the same as extra delta.", "The background is the posterior rhythm. Extra theta and delta are separate and can occur with or without a slow background."],
  ["The letter B is the milder grade.", "A is the less severe half of the grade (faster background, taller delta, shorter suppression). B is the more severe half."],
  ["Grade IV is graded by how fast the delta is.", "It is graded by amplitude: above 50 µV is IVA, below 50 µV is IVB."],
  ["Burst suppression needs no stimulation testing.", "Reactivity is part of the record. Note whether the bursts change with stimulation, following your lab's protocol."],
  ["A flat page at 7 µV/mm is electrocerebral inactivity.", "Check the sensitivity, the impedances and the EKG channel first. Labs increase the sensitivity (lower µV/mm) for these studies, and the reader makes the call."],
  ["A low-voltage page is automatically a worse grade.", "Check the settings. A page recorded at a less sensitive setting looks smaller. Amplitude has to be read against the sensitivity."],
  ["Mild slowing at 7 to 8 Hz is normal in anyone over 60.", "A posterior rhythm under 8 Hz is slower than the usual adult rhythm. Report the frequency and the age; the reader decides whether it is significant."],
  ["The technologist assigns the grade.", "The technologist describes and documents. The reader grades and interprets."],
];

function Mistakes() {
  return (
    <div className="space-y-3">
      <p className="max-w-3xl text-slate-600">Each of these is a trap that exam questions use. Read the wrong idea, then the correct one.</p>
      {MISTAKES.map(([wrong, right]) => (
        <div key={wrong} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900"><span className="mr-1 font-semibold">Wrong idea:</span>{wrong}</div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900"><span className="mr-1 font-semibold">Correct:</span>{right}</div>
        </div>
      ))}
    </div>
  );
}

function Practice() {
  const cases = (casesData.starterCases || []).filter((c) => (c.tags || []).includes("diffuse-grades"));
  return (
    <div className="space-y-5">
      <Card title="Practice with tracings" tone="indigo">
        <p>These cases put the grades to work on recordings you can measure.</p>
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
        <p>Questions on diffuse slowing, background activity and the grades are included in this app&apos;s practice questions. Start a quiz and choose the diffuse-slowing topics, or use Review Incorrect to revisit misses.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link to="/quiz" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Open quizzes</Link>
          <Link to="/study" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">ABRET Study</Link>
        </div>
      </Card>
    </div>
  );
}

export default function DiffuseAbnormalities() {
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
          <span className="font-medium text-slate-900">Diffuse Abnormalities</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Diffuse EEG Abnormalities</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Levels of consciousness, the three patterns of diffuse slowing and a grade I to VI scale, with recordings for every grade.
        </p>
      </header>

      <div className="sticky top-[57px] z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur-sm">
        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="Diffuse abnormalities sections">
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
        {tab === "grades" && <Grades />}
        {tab === "finder" && <Finder />}
        {tab === "role" && <Role />}
        {tab === "mistakes" && <Mistakes />}
        {tab === "practice" && <Practice />}
      </div>
    </div>
  );
}
