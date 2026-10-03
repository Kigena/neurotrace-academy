import React, { useMemo, useState } from "react";

const PAGE_SIZE = 10;
const FILTERS = [
  ["all", "All"],
  ["unanswered", "Unanswered"],
  ["wrong", "Missed"],
];

function QuestionCard({ q, record, onAnswer }) {
  const revealed = !!record;
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-500">Question {q.id}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">{q.topic}</span>
      </div>
      <p className="mb-4 font-medium text-slate-900">{q.question}</p>
      <div className="space-y-2">
        {q.choices.map((c, i) => {
          const isCorrect = i === q.correct;
          const isPicked = record?.selected === i;
          let cls = "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40";
          if (revealed && isCorrect) cls = "border-emerald-400 bg-emerald-50 text-emerald-900";
          else if (revealed && isPicked) cls = "border-red-300 bg-red-50 text-red-900";
          else if (revealed) cls = "border-slate-200 bg-white text-slate-500";
          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => onAnswer(q.id, i, i === q.correct)}
              className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
            >
              <span
                className={`mt-px flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  revealed && isCorrect
                    ? "bg-emerald-500 text-white"
                    : revealed && isPicked
                      ? "bg-red-500 text-white"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{c}</span>
            </button>
          );
        })}
      </div>
      {!revealed && (
        <button
          type="button"
          onClick={() => onAnswer(q.id, null, null)}
          className="mt-3 text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          Show answer without guessing
        </button>
      )}
      {revealed && (
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {record.correct === true ? "Correct" : record.correct === false ? "Not quite" : "Answer"} · {String.fromCharCode(65 + q.correct)}
          </div>
          {q.explanation}
        </div>
      )}
    </article>
  );
}

export default function QuestionsTab({ questions, topics, progress, onAnswer }) {
  const [topic, setTopic] = useState("All");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      questions.filter((q) => {
        if (topic !== "All" && q.topic !== topic) return false;
        const r = progress.answered[q.id];
        if (filter === "unanswered") return !r;
        if (filter === "wrong") return r && r.correct === false;
        return true;
      }),
    [questions, topic, filter, progress.answered]
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const answeredCount = Object.keys(progress.answered).length;

  const choose = (setter) => (v) => {
    setter(v);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={topic}
            onChange={(e) => choose(setTopic)(e.target.value)}
            className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 sm:w-72"
            aria-label="Filter by topic"
          >
            <option value="All">All topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.name}>
                {t.full}
              </option>
            ))}
          </select>
          <div className="flex rounded-lg border border-slate-300 p-0.5">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => choose(setFilter)(key)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  filter === key ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-slate-500">
          {filtered.length} shown · {answeredCount} of {questions.length} answered
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {filter === "wrong" ? "No missed questions here. Nice work." : "Nothing left in this filter."}
        </div>
      ) : (
        shown.map((q) => <QuestionCard key={q.id} q={q} record={progress.answered[q.id]} onAnswer={onAnswer} />)
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-between gap-3 pt-2" aria-label="Question pages">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => {
              setPage(current - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            ‹ Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {current + 1} of {pages}
          </span>
          <button
            type="button"
            disabled={current >= pages - 1}
            onClick={() => {
              setPage(current + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Next ›
          </button>
        </nav>
      )}
    </div>
  );
}
