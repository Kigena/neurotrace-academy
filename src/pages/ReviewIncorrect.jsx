import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import studyApi from "../services/studyApi";
import { domainTitle, sectionTitle, tagTitle } from "../utils/studyLabels";

/**
 * Review Incorrect: questions whose most recent attempt was wrong.
 * Retrying records a NEW attempt; the original incorrect attempt is kept.
 */

function OptionList({ options, selectedIndex, correctIndex, onPick, disabled }) {
  return (
    <div className="space-y-2">
      {options.map((opt, idx) => {
        let cls = "w-full text-left rounded-md border px-3 py-2 text-sm";
        if (correctIndex !== undefined && idx === correctIndex) cls += " border-green-500 bg-green-50 text-green-900";
        else if (selectedIndex === idx && correctIndex !== undefined) cls += " border-red-500 bg-red-50 text-red-900";
        else if (selectedIndex === idx) cls += " border-blue-400 bg-blue-50";
        else cls += " border-slate-200 bg-white" + (onPick && !disabled ? " hover:bg-slate-50" : "");
        const content = (
          <>
            <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
            {opt}
            {correctIndex !== undefined && idx === correctIndex && <span className="ml-2 text-xs font-semibold">✓ correct</span>}
            {correctIndex !== undefined && selectedIndex === idx && idx !== correctIndex && (
              <span className="ml-2 text-xs font-semibold">✗ your answer</span>
            )}
          </>
        );
        return onPick ? (
          <button key={idx} type="button" className={cls} disabled={disabled} onClick={() => onPick(idx)}>
            {content}
          </button>
        ) : (
          <div key={idx} className={cls}>{content}</div>
        );
      })}
    </div>
  );
}

function IncorrectCard({ item }) {
  const [mode, setMode] = useState("review"); // review | retry | result
  const [retry, setRetry] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const startedAt = useRef(0);

  const startRetry = async () => {
    setError(null);
    try {
      const res = await studyApi.getRetryQuestion(item.questionId);
      setRetry(res.question);
      setResult(null);
      startedAt.current = Date.now();
      setMode("retry");
    } catch (err) {
      setError(err.message || "Could not load the question.");
    }
  };

  const answer = async (idx) => {
    setError(null);
    try {
      const res = await studyApi.submitRetry(item.questionId, idx, Date.now() - startedAt.current);
      setResult(res);
      setMode("result");
    } catch (err) {
      setError(err.message || "Could not record the retry.");
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800">{domainTitle(item.domainId)}</span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">{sectionTitle(item.sectionId)}</span>
        {item.topicTags.slice(0, 4).map((t) => (
          <span key={t} className="rounded bg-slate-50 px-2 py-0.5 text-slate-500">#{tagTitle(t)}</span>
        ))}
        <span className="ml-auto text-slate-400">
          missed {item.timesIncorrect}× · {new Date(item.lastAttemptAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm font-medium text-slate-900">{(retry || item).stem}</p>

      {mode === "review" && (
        <>
          <OptionList options={item.options} selectedIndex={item.selectedIndex} correctIndex={item.correctIndex} />
          {item.selectedIndex === null && (
            <p className="text-xs text-slate-500">Your earlier selection was not recorded for this attempt.</p>
          )}
          {item.explanation && (
            <div className="rounded bg-slate-50 p-3 text-sm text-slate-700">
              <span className="font-semibold">Explanation:</span> {item.explanation}
            </div>
          )}
        </>
      )}

      {mode === "retry" && retry && (
        <>
          <p className="text-xs text-slate-500">Retry: choose an answer. Your earlier attempt stays in your history.</p>
          <OptionList options={retry.options} onPick={answer} />
        </>
      )}

      {mode === "result" && result && (
        <>
          <OptionList options={retry.options} selectedIndex={result.selectedIndex} correctIndex={result.correctIndex} />
          <div className={`rounded p-3 text-sm ${result.isCorrect ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
            <div className="font-semibold">{result.isCorrect ? "Correct — recorded as a new study attempt." : "Still incorrect — recorded."}</div>
            {result.explanation && <div className="text-slate-700 mt-1">{result.explanation}</div>}
            {result.misconception && (
              <div className="mt-2 rounded border border-amber-300 bg-amber-50 p-2 text-amber-900">
                <div className="text-xs font-semibold uppercase tracking-wide">Common mistake: {result.misconception.title}</div>
                <div className="mt-1">{result.misconception.tip}</div>
              </div>
            )}
          </div>
        </>
      )}

      {error && <p className="text-xs text-red-700">{error}</p>}

      <div className="flex gap-2">
        {mode !== "retry" && (
          <button onClick={startRetry} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
            {mode === "result" ? "RETRY AGAIN" : "RETRY"}
          </button>
        )}
        {mode !== "review" && (
          <button onClick={() => setMode("review")} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">
            Back to review
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewIncorrect() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    studyApi
      .getIncorrect(50)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load incorrect questions.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review Incorrect</h1>
          <p className="text-sm text-slate-600">
            Questions you most recently answered incorrectly. A correct retry removes a question from this list; the original
            wrong answer is kept in your history.
          </p>
        </div>
        <Link to="/study" className="text-sm text-blue-600 hover:underline">← Study dashboard</Link>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {!data && !error && <p className="text-sm text-slate-600">Loading…</p>}
      {data && data.items.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Nothing to review — no questions are currently marked incorrect.
        </div>
      )}
      {data && data.items.length > 0 && (
        <>
          <p className="text-xs text-slate-500">
            Showing {data.items.length} of {data.total} (most recent first).
          </p>
          {data.items.map((item) => (
            <IncorrectCard key={item.questionId} item={item} />
          ))}
        </>
      )}
    </section>
  );
}

export default ReviewIncorrect;
