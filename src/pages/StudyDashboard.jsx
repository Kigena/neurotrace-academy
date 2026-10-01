import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import studyApi from "../services/studyApi";
import { EXAM_CONFIG, countdownText, daysUntilExam } from "../config/examConfig";
import { DOMAIN_ORDER, DOMAIN_SHORT, planItemLabel, sectionTitle, tagTitle, scoreTone } from "../utils/studyLabels";
import { startPlanItem } from "../utils/studyActions";
import { MasteryRow, ReadinessBreakdown, PercentChip } from "../components/StudyWidgets.jsx";

/**
 * ABRET R.EEG T. study dashboard (single-user exam preparation).
 * All numbers come from the server's per-user analytics.
 */
function StudyDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [weakSize, setWeakSize] = useState(20);
  const [challengeSize, setChallengeSize] = useState(20);
  const days = daysUntilExam();

  useEffect(() => {
    let cancelled = false;
    studyApi
      .getDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load your study data.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const run = async (item) => {
    setBusy(true);
    setError(null);
    try {
      await startPlanItem(item, navigate);
    } catch (err) {
      setError(err.message || "Could not start the session.");
      setBusy(false);
    }
  };

  const continueStudying = () => {
    if (data?.hasActiveSession) navigate("/quiz/session");
    else if (data?.todaysStudy?.length) run(data.todaysStudy[0]);
    else run({ kind: "mixed", count: 10 });
  };

  const readiness = data?.readiness;
  const readinessTone = scoreTone(readiness?.score ?? null, readiness?.score !== null && readiness !== undefined);
  const perf = data?.performance;

  return (
    <section className="space-y-6">
      {/* Exam header + countdown */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-700 text-white p-6 shadow">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-200">
              {EXAM_CONFIG.exam} — {EXAM_CONFIG.displayDate.toUpperCase()}
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-1">{countdownText()}</h1>
            <p className="text-sm text-blue-100 mt-1">
              {EXAM_CONFIG.displayDate} · {EXAM_CONFIG.displayTime} · {EXAM_CONFIG.location}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-wider text-blue-200">Days remaining</p>
            <p className="text-5xl font-black leading-none">{Math.max(days, 0)}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {/* Primary actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          onClick={continueStudying}
          disabled={busy || !data}
          className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {data?.hasActiveSession ? "CONTINUE STUDYING (resume)" : "CONTINUE STUDYING"}
        </button>
        <div className="flex rounded-lg border border-amber-300 bg-amber-50 overflow-hidden">
          <button
            onClick={() => run({ kind: "weak", count: weakSize })}
            disabled={busy || !data}
            className="flex-1 px-3 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
          >
            STUDY MY WEAK AREAS
          </button>
          <select
            aria-label="Weak-area session size"
            value={weakSize}
            onChange={(e) => setWeakSize(Number(e.target.value))}
            className="border-l border-amber-300 bg-amber-50 px-2 text-sm text-amber-900"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>
        <div className="flex rounded-lg border border-indigo-300 bg-indigo-50 overflow-hidden">
          <button
            onClick={() => run({ kind: "challenge", count: challengeSize })}
            disabled={busy || !data}
            title="Higher-order L3-L6 questions from the ABRET Challenge Bank (pilot, under expert review)"
            className="flex-1 px-3 py-3 text-sm font-semibold text-indigo-900 hover:bg-indigo-100 disabled:opacity-60"
          >
            CHALLENGE ME
          </button>
          <select
            aria-label="Challenge session size"
            value={challengeSize}
            onChange={(e) => setChallengeSize(Number(e.target.value))}
            className="border-l border-indigo-300 bg-indigo-50 px-2 text-sm text-indigo-900"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
        <Link
          to="/review"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-800 hover:bg-red-100"
        >
          REVIEW INCORRECT{data ? ` (${data.incorrectOutstanding})` : ""}
        </Link>
        <Link
          to="/quiz/session?preset=mock-full-130"
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          TAKE FULL MOCK EXAM
        </Link>
      </div>

      {!data && !error && <div className="text-sm text-slate-600">Loading your study data…</div>}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Readiness */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">STUDY READINESS</h2>
            <div className="flex items-baseline gap-3">
              <span className={`text-5xl font-black ${readinessTone.text}`}>
                {readiness.score === null ? "—" : `${readiness.score}%`}
              </span>
              <span className="text-sm font-medium text-slate-700">{readiness.label}</span>
            </div>
            <ReadinessBreakdown readiness={readiness} />
          </div>

          {/* Domain mastery */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Domain mastery</h2>
            {DOMAIN_ORDER.map((id) => (
              <MasteryRow key={id} label={DOMAIN_SHORT[id]} mastery={data.mastery.byDomain[id]} />
            ))}
            <p className="text-xs text-slate-500">
              Mastery needs 5+ answers per topic; recent answers count more. Exam weights: D1 15%, D2 46%, D3 19%, D4 20%.
            </p>
          </div>

          {/* Today's study */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">TODAY&apos;S STUDY</h2>
            <ol className="space-y-2">
              {data.todaysStudy.map((item, idx) => (
                <li key={idx} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-900">{planItemLabel(item)}</div>
                    <div className="text-xs text-slate-500">{item.reason}</div>
                  </div>
                  <button
                    onClick={() => run(item)}
                    disabled={busy}
                    className="shrink-0 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                  >
                    Start
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Weakest topics */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Weakest topics</h2>
            {data.weakestSections.length === 0 && data.weakestTags.length === 0 ? (
              <p className="text-sm text-slate-500">Answer at least 5 questions in a topic to see it here.</p>
            ) : (
              <div className="space-y-3">
                {data.weakestSections.slice(0, 4).map((s) => (
                  <MasteryRow key={`s-${s.key}`} label={sectionTitle(s.key)} mastery={s} />
                ))}
                {data.weakestTags.slice(0, 3).map((t) => (
                  <MasteryRow key={`t-${t.key}`} label={`#${tagTitle(t.key)}`} mastery={t} />
                ))}
              </div>
            )}
          </div>

          {/* Recent performance */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Recent performance</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Last 20 answers</dt>
                <dd><PercentChip value={perf.last20Accuracy} /></dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Overall accuracy</dt>
                <dd><PercentChip value={perf.overallAccuracy} /></dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Trend vs previous 20</dt>
                <dd className="font-semibold text-slate-800">
                  {perf.trend === null ? "—" : `${perf.trend > 0 ? "▲ +" : perf.trend < 0 ? "▼ " : "■ "}${perf.trend}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Total questions answered</dt>
                <dd className="text-xl font-bold text-slate-900">{perf.totalAttempts}</dd>
              </div>
            </dl>
          </div>

          {/* Last mock */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Last mock score</h2>
            {data.lastMock ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black ${scoreTone(data.lastMock.percent).text}`}>{data.lastMock.percent}%</span>
                  <span className="text-sm text-slate-600">
                    {data.lastMock.correct}/{data.lastMock.total}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {data.lastMock.title} · {new Date(data.lastMock.endTime).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No mock exam yet. The full mock is 130 questions (19/60/25/26) in 120 minutes.</p>
            )}
            <Link to="/progress" className="text-xs text-blue-600 hover:underline">Full progress →</Link>
          </div>
        </div>
      )}
    </section>
  );
}

export default StudyDashboard;
