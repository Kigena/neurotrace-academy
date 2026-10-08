import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, Table } from "./ui.jsx";

/**
 * Generic tabbed study guide rendered from a JSON content file
 * (tabs with text, list, table, cards and steps sections, plus pearls, common mistakes and memory aids).
 */

function Section({ s }) {
  if (s.kind === "table") {
    return (
      <div className="space-y-2">
        {s.title && <h3 className="text-base font-semibold text-slate-900">{s.title}</h3>}
        <Table head={s.head} rows={s.rows} note={s.note} />
      </div>
    );
  }
  if (s.kind === "cards") {
    return (
      <div className="space-y-2">
        {s.title && <h3 className="text-base font-semibold text-slate-900">{s.title}</h3>}
        <div className="grid gap-3 md:grid-cols-2">
          {s.cards.map((c) => (
            <Card key={c.title} title={c.title}>
              {c.body && <p>{c.body}</p>}
              {c.points && c.points.length > 0 && (
                <ul className="list-disc space-y-1 pl-5">{c.points.map((p) => <li key={p}>{p}</li>)}</ul>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }
  if (s.kind === "list" || s.kind === "steps") {
    const ListTag = s.kind === "steps" ? "ol" : "ul";
    return (
      <Card title={s.title}>
        <ListTag className={`${s.kind === "steps" ? "list-decimal" : "list-disc"} space-y-1 pl-5`}>
          {s.items.map((x) => <li key={x}>{x}</li>)}
        </ListTag>
      </Card>
    );
  }
  return (
    <Card title={s.title}>
      <p>{s.text}</p>
    </Card>
  );
}

function GuideTab({ t }) {
  return (
    <div className="space-y-5">
      {t.intro && <p className="max-w-3xl text-slate-600">{t.intro}</p>}
      {t.sections.map((s, i) => <Section key={`${s.title}-${i}`} s={s} />)}
      {t.eegLink && (
        <p className="rounded-lg border border-indigo-200 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-900"><strong>At the EEG machine:</strong> {t.eegLink}</p>
      )}
      {t.pearls && t.pearls.length > 0 && (
        <Card title="Exam pearls" tone="emerald">
          <ul className="list-disc space-y-1 pl-5">{t.pearls.map((p) => <li key={p}>{p}</li>)}</ul>
        </Card>
      )}
    </div>
  );
}

function Mistakes({ mistakes, memory }) {
  return (
    <div className="space-y-5">
      <p className="max-w-3xl text-slate-600">Each of these is a trap that exam questions use. Read the wrong idea, then the correct one.</p>
      <div className="space-y-3">
        {mistakes.map(([wrong, right]) => (
          <div key={wrong} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900"><span className="mr-1 font-semibold">Wrong idea:</span>{wrong}</div>
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900"><span className="mr-1 font-semibold">Correct:</span>{right}</div>
          </div>
        ))}
      </div>
      {memory && memory.length > 0 && <Table head={["Memory aid", "What it helps you remember"]} rows={memory} />}
    </div>
  );
}

function Practice({ practice }) {
  return (
    <div className="space-y-5">
      <Card title="Practice questions" tone="indigo">
        <p>{practice.text}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link to="/quiz" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Start a quiz</Link>
          <Link to="/review" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Review incorrect</Link>
        </div>
      </Card>
      {practice.links && practice.links.length > 0 && (
        <Card title="Related study pages">
          <ul className="list-disc space-y-1 pl-5">
            {practice.links.map(([label, to]) => (
              <li key={to}><Link to={to} className="font-semibold text-indigo-700 hover:underline">{label}</Link></li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default function StudyGuidePage({ data, crumb, practice }) {
  const [params, setParams] = useSearchParams();
  const tabs = [
    ...data.tabs.map((t) => [t.id, t.title]),
    ...(data.mistakes && data.mistakes.length ? [["mistakes", "Common mistakes"]] : []),
    ...(practice ? [["practice", "Practice"]] : []),
  ];
  const ids = new Set(tabs.map(([id]) => id));
  const raw = params.get("tab");
  const tab = ids.has(raw) ? raw : tabs[0][0];
  const go = (id) => {
    setParams(id === tabs[0][0] ? {} : { tab: id }, { replace: false });
    window.scrollTo({ top: 0 });
  };
  const current = data.tabs.find((t) => t.id === tab);

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          <span className="font-medium text-slate-900">{crumb}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{data.title}</h1>
        {data.subtitle && <p className="mt-1 max-w-3xl text-sm text-slate-600">{data.subtitle}</p>}
      </header>

      <div className="sticky top-[57px] z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur-sm">
        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label={`${crumb} sections`}>
          {tabs.map(([id, label]) => (
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
        {current && <GuideTab key={current.id} t={current} />}
        {tab === "mistakes" && <Mistakes mistakes={data.mistakes} memory={data.memory} />}
        {tab === "practice" && <Practice practice={practice} />}
      </div>
    </div>
  );
}
