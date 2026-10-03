import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useHubProgress from "../components/emgNcs/useHubProgress";
import QuestionsTab from "../components/emgNcs/QuestionsTab.jsx";
import FlashcardsTab from "../components/emgNcs/FlashcardsTab.jsx";
import AtlasTab from "../components/emgNcs/AtlasTab.jsx";
import ReferenceTab from "../components/emgNcs/ReferenceTab.jsx";
import ChecklistTab from "../components/emgNcs/ChecklistTab.jsx";
import "../components/emgNcs/emgProse.css";

/**
 * EMG/NCS Clinical Refresher: a native page (formerly an iframe of
 * public/emg-ncs-study-hub.html). Content lives in src/data/emgNcs/hub.json
 * and is loaded on demand; images are files under public/emg-ncs/atlas/.
 */

const TABS = [
  ["overview", "Overview"],
  ["clinical", "Clinical approach"],
  ["procedures", "Common procedures"],
  ["atlas", "Image atlas"],
  ["questions", "Practice questions"],
  ["flashcards", "Flashcards"],
  ["reference", "Quick reference"],
  ["checklist", "Checklist"],
];
const TAB_IDS = new Set(TABS.map(([id]) => id));

function Html({ html }) {
  return <div className="emg-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

function ProgressRow({ label, value, total, tone }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium text-slate-500">
          {value} / {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone} transition-all`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function Overview({ hub, progress, onReset, goTo }) {
  const answered = Object.values(progress.answered);
  const graded = answered.filter((r) => r.correct !== null);
  const correct = graded.filter((r) => r.correct).length;
  const doneTotal = answered.length + progress.viewed.length + progress.checklist.length;
  const allTotal = hub.questions.length + hub.flashcards.length + hub.checklist.length;
  const pct = allTotal ? Math.round((doneTotal / allTotal) * 100) : 0;

  const byTopic = useMemo(() => {
    const qTopic = new Map(hub.questions.map((q) => [String(q.id), q.topic]));
    const stats = {};
    for (const [qid, r] of Object.entries(progress.answered)) {
      if (r.correct === null) continue;
      const t = qTopic.get(String(qid));
      if (!t) continue;
      stats[t] = stats[t] || { correct: 0, total: 0 };
      stats[t].total += 1;
      if (r.correct) stats[t].correct += 1;
    }
    return Object.entries(stats).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total);
  }, [hub.questions, progress.answered]);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Refresher progress</h2>
              <div className="mt-1 text-3xl font-bold text-slate-900">{pct}%</div>
            </div>
            {doneTotal > 0 && (
              <button
                type="button"
                onClick={() => window.confirm("Clear your EMG/NCS progress on this device?") && onReset()}
                className="text-xs font-medium text-slate-400 hover:text-red-600"
              >
                Reset progress
              </button>
            )}
          </div>
          <div className="space-y-4">
            <ProgressRow label="Practice questions answered" value={answered.length} total={hub.questions.length} tone="bg-indigo-500" />
            <ProgressRow label="Flashcards reviewed" value={progress.viewed.length} total={hub.flashcards.length} tone="bg-sky-500" />
            <ProgressRow label="Checklist items done" value={progress.checklist.length} total={hub.checklist.length} tone="bg-emerald-500" />
          </div>
          <p className="mt-4 text-xs text-slate-400">Saved in this browser.</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Accuracy by topic</h2>
          {graded.length === 0 ? (
            <div className="mt-3 text-sm text-slate-500">
              Answer a few practice questions to see where you are strong and where to review.
              <button type="button" onClick={() => goTo("questions")} className="mt-3 block font-semibold text-indigo-600 hover:text-indigo-800">
                Start practice questions →
              </button>
            </div>
          ) : (
            <>
              <div className="mt-1 text-3xl font-bold text-slate-900">
                {Math.round((correct / graded.length) * 100)}%
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {correct} of {graded.length} correct
                </span>
              </div>
              <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 text-sm">
                {byTopic.map(([t, s]) => {
                  const p = Math.round((s.correct / s.total) * 100);
                  return (
                    <li key={t} className="flex items-center justify-between gap-3">
                      <span className="truncate text-slate-700">{t}</span>
                      <span className={`flex-shrink-0 font-medium ${p < 60 ? "text-red-600" : p < 80 ? "text-amber-600" : "text-emerald-600"}`}>
                        {s.correct}/{s.total} · {p}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      </div>

      <button
        type="button"
        onClick={() => goTo("atlas")}
        className="flex w-full items-center justify-between gap-4 rounded-xl border border-sky-200 bg-sky-50 px-5 py-4 text-left hover:bg-sky-100"
      >
        <div>
          <div className="font-semibold text-sky-900">Image atlas · electrode placement photos</div>
          <div className="text-sm text-sky-800/80">Anatomy landmarks, stimulation sites and real lab setups for the core motor and sensory studies.</div>
        </div>
        <span className="text-xl text-sky-700">→</span>
      </button>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="font-bold text-slate-900">Common procedures</h2>
          <span className="rounded bg-red-100 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-red-700">HIGH YIELD</span>
        </div>
        <p className="mb-4 text-sm text-slate-600">The {hub.topics.length} core topics for hands-on NCS/EMG practice. Select one to jump straight to it.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {hub.topics.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => goTo("procedures", `proc-${t.id}`)}
              className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{t.id}</span>
              {t.full}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmgNcsStudy() {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const tab = TAB_IDS.has(tabParam) ? tabParam : "overview";
  const [hub, setHub] = useState(null);
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(null);
  const tabsRef = useRef(null);
  const { progress, answer, markViewed, toggleChecklist, reset } = useHubProgress();

  useEffect(() => {
    let cancelled = false;
    import("../data/emgNcs/hub.json")
      .then((m) => !cancelled && setHub(m.default))
      .catch(() => !cancelled && setError("Could not load the study hub. Please refresh the page."));
    return () => {
      cancelled = true;
    };
  }, []);

  const goTo = (id, anchor = null) => {
    setParams(id === "overview" ? {} : { tab: id });
    setTarget(anchor);
    if (!anchor && tabsRef.current) {
      const top = tabsRef.current.getBoundingClientRect().top + window.scrollY - 64;
      if (window.scrollY > top) window.scrollTo({ top });
    }
  };

  // Scroll to (and briefly highlight) a procedure card after switching tabs.
  useEffect(() => {
    if (!target || !hub) return;
    const el = document.getElementById(target);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("is-target");
    const t = setTimeout(() => el.classList.remove("is-target"), 1800);
    return () => clearTimeout(t);
  }, [target, tab, hub]);

  const stats = hub
    ? [
        [hub.questions.length, "Practice questions"],
        [hub.flashcards.length, "Flashcards"],
        [hub.atlas.sections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.figures.length, 0), 0), "Clinical images"],
        [hub.topics.length, "Core procedures"],
      ]
    : [];

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-700">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-900">EMG/NCS</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">EMG/NCS Clinical Refresher</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Nerve conduction studies and needle EMG for hands-on practice: electrode placement, normal values, waveform recognition
          and clinical technique.
        </p>
      </header>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(([n, label]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-2xl font-bold text-indigo-600">{n}</div>
              <div className="text-xs font-medium text-slate-600">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div ref={tabsRef} className="sticky top-[57px] z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur-sm">
        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="EMG/NCS sections">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => goTo(id)}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {!hub && !error && (
        <div className="flex items-center gap-3 py-16 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          Loading study hub…
        </div>
      )}

      {hub && (
        <div role="tabpanel">
          {tab === "overview" && <Overview hub={hub} progress={progress} onReset={reset} goTo={goTo} />}
          {tab === "clinical" && (
            <>
              <p className="mb-5 max-w-3xl text-slate-600" dangerouslySetInnerHTML={{ __html: hub.content.clinical.lead }} />
              <Html html={hub.content.clinical.html} />
            </>
          )}
          {tab === "procedures" && (
            <>
              <p className="mb-5 max-w-3xl text-slate-600" dangerouslySetInnerHTML={{ __html: hub.content.procedures.lead }} />
              <Html html={hub.content.procedures.html} />
            </>
          )}
          {tab === "atlas" && <AtlasTab atlas={hub.atlas} />}
          {tab === "questions" && <QuestionsTab questions={hub.questions} topics={hub.topics} progress={progress} onAnswer={answer} />}
          {tab === "flashcards" && <FlashcardsTab flashcards={hub.flashcards} progress={progress} onViewed={markViewed} />}
          {tab === "reference" && (
            <>
              <p className="mb-5 max-w-3xl text-slate-600" dangerouslySetInnerHTML={{ __html: hub.content.reference.lead }} />
              <ReferenceTab muscles={hub.muscles} html={hub.content.reference.html} />
            </>
          )}
          {tab === "checklist" && (
            <ChecklistTab items={hub.checklist} weeks={hub.checklistWeeks} done={progress.checklist} onToggle={toggleChecklist} />
          )}
        </div>
      )}
    </div>
  );
}

export default EmgNcsStudy;
