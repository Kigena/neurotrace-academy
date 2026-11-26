import React, { useEffect, useMemo, useState } from "react";
import EegTracing from "../EegTracing.jsx";
import MedicalText from "../MedicalText.jsx";
import { Card } from "./ui.jsx";

/**
 * Tracing-based practice set for a study page: one question at a time, each on a
 * synthetic EEG page, with the explanation and a rule to remember once answered.
 * Answers are kept in this browser only (a convenience, not progress tracking).
 */

function loadPicks(storageKey) {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "{}") || {};
  } catch {
    return {};
  }
}

function savePicks(storageKey, picks) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(picks));
  } catch {
    // private window or blocked storage: answers simply are not remembered
  }
}

export default function TracingPractice({ title, intro, questions, topics, storageKey }) {
  const [picks, setPicks] = useState(() => loadPicks(storageKey));
  const [topic, setTopic] = useState("all");
  const [missedOnly, setMissedOnly] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => savePicks(storageKey, picks), [storageKey, picks]);

  const isMissed = (q) => picks[q.id] !== undefined && picks[q.id] !== q.answer;
  const list = useMemo(
    () => questions.filter((q) => (topic === "all" || q.topic === topic) && (!missedOnly || isMissed(q))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, topic, missedOnly],
  );
  const q = list[Math.min(index, list.length - 1)];
  const pick = q ? picks[q.id] : undefined;
  const done = pick !== undefined;

  const stats = (pool) => {
    const answered = pool.filter((x) => picks[x.id] !== undefined);
    return { total: pool.length, answered: answered.length, correct: answered.filter((x) => picks[x.id] === x.answer).length };
  };
  const all = stats(questions);
  const missedCount = questions.filter(isMissed).length;

  const choose = (i) => !done && setPicks((p) => ({ ...p, [q.id]: i }));
  const go = (next) => setIndex(Math.max(0, Math.min(list.length - 1, next)));
  const filter = (key) => {
    setTopic(key);
    setIndex(0);
  };

  const chips = [{ key: "all", label: "All" }, ...topics];

  return (
    <Card title={title} tone="indigo">
      {intro && <p><MedicalText>{intro}</MedicalText></p>}

      <div className="flex flex-wrap items-center gap-2 pt-1" role="group" aria-label="Choose a topic">
        {chips.map((c) => {
          const s = stats(c.key === "all" ? questions : questions.filter((x) => x.topic === c.key));
          const active = topic === c.key;
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={active}
              onClick={() => filter(c.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${active ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              {c.label} <span className="opacity-70">{s.correct}/{s.answered} of {s.total}</span>
            </button>
          );
        })}
        <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={missedOnly}
            disabled={!missedOnly && missedCount === 0}
            onChange={(e) => {
              setMissedOnly(e.target.checked);
              setIndex(0);
            }}
          />
          Missed only ({missedCount})
        </label>
      </div>

      {!q ? (
        <p className="pt-2 text-sm text-slate-600">
          {missedOnly ? "No missed questions in this topic. Untick 'Missed only' to see them all." : "No questions in this topic yet."}
        </p>
      ) : (
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Question {Math.min(index, list.length - 1) + 1} of {list.length}
              {" · "}
              {topics.find((t) => t.key === q.topic)?.label}
            </span>
            <span>
              Score: {all.correct} correct of {all.answered} answered
            </span>
          </div>

          <EegTracing key={q.id} scene={q.scene} caption={q.caption || "NeuroLinea synthetic tracing. Use the caliper to measure rates and durations."} />

          <p className="text-sm font-medium text-slate-900">
            <MedicalText enabled={done}>{q.q}</MedicalText>
          </p>
          <div className="grid gap-2">
            {q.options.map((o, i) => {
              const tone = !done
                ? "border-slate-300 bg-white hover:bg-slate-50"
                : i === q.answer
                  ? "border-emerald-500 bg-emerald-50"
                  : i === pick
                    ? "border-rose-400 bg-rose-50"
                    : "border-slate-200 bg-white opacity-70";
              return (
                <button key={o} type="button" disabled={done} onClick={() => choose(i)} className={`rounded-lg border px-3 py-2 text-left text-sm ${tone}`}>
                  <span className="mr-2 font-semibold">{String.fromCharCode(65 + i)}.</span>
                  <MedicalText interactive={false} enabled={done}>{o}</MedicalText>
                </button>
              );
            })}
          </div>

          {done && (
            <div className={`space-y-2 rounded-lg px-3 py-2 text-sm ${pick === q.answer ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>
              <p>
                <strong>{pick === q.answer ? "Correct. " : `Not quite: the answer is ${String.fromCharCode(65 + q.answer)}. `}</strong>
                <MedicalText>{q.why}</MedicalText>
              </p>
              {q.rule && (
                <p>
                  <strong>Remember: </strong>
                  <MedicalText>{q.rule}</MedicalText>
                </p>
              )}
              <button
                type="button"
                onClick={() =>
                  setPicks((p) => {
                    const next = { ...p };
                    delete next[q.id];
                    return next;
                  })
                }
                className="font-semibold underline"
              >
                Try this one again
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index <= 0}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={index >= list.length - 1}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Next question
            </button>
            {all.answered > 0 && (
              <button
                type="button"
                onClick={() => {
                  setPicks({});
                  setMissedOnly(false);
                  setIndex(0);
                }}
                className="ml-auto text-xs font-semibold text-slate-500 underline hover:text-slate-700"
              >
                Clear my answers
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
