import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import apiService from "../services/apiService";
import studyApi from "../services/studyApi";
import ProgressBar from "../components/Gamification/ProgressBar";
import { MasteryRow, ReadinessBreakdown, PercentChip } from "../components/StudyWidgets.jsx";
import { DOMAIN_ORDER, DOMAIN_SHORT, domainTitle, sectionTitle, tagTitle, scoreTone } from "../utils/studyLabels";

/**
 * Progress Page - ABRET study analytics for the signed-in user
 * (server-computed mastery, readiness, recent trend and mock history),
 * plus the gamification overview.
 */

function Progress() {
  const [study, setStudy] = useState(null);
  const [studyError, setStudyError] = useState(null);
  const [gamificationProgress, setGamificationProgress] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    studyApi
      .getDashboard()
      .then((d) => {
        if (!cancelled) {
          setStudy(d);
          setStudyError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setStudyError(err.message || "Could not load study data.");
      });

    // Gamification data (non-critical)
    Promise.all([apiService.get("/gamification/progress"), apiService.get("/gamification/achievements")])
      .then(([progressData, achievementsData]) => {
        if (cancelled) return;
        setGamificationProgress(progressData);
        setAchievements(achievementsData);
      })
      .catch((gamError) => console.error("Error loading gamification data:", gamError));

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Refresh when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRefreshKey((prev) => prev + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const sectionRows = useMemo(() => {
    if (!study) return [];
    return Object.entries(study.mastery.bySection)
      .map(([id, m]) => ({ id, domainId: study.sectionDomains[id], ...m }))
      .sort((a, b) => {
        if (a.sufficient !== b.sufficient) return a.sufficient ? -1 : 1;
        return (a.score ?? 0) - (b.score ?? 0);
      });
  }, [study]);

  const perf = study?.performance;
  const readiness = study?.readiness;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">My Progress</h1>
        <p className="text-sm text-slate-700 max-w-3xl">
          ABRET R.EEG T. preparation analytics. Mastery uses your most recent 30 answers per topic (recent answers weigh more)
          and needs at least 5 answers before a label is shown.
        </p>
      </div>

      {/* Gamification Overview */}
      {gamificationProgress && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">🎯 Your Learning Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level & XP */}
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-3">Level & XP</p>
              <ProgressBar
                level={gamificationProgress.level}
                xp={gamificationProgress.xp}
                xpToNextLevel={gamificationProgress.xpToNextLevel}
                showDetails={true}
              />
            </div>

            {/* Achievements */}
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-3">Achievements</p>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold">
                  {achievements.filter(a => a.unlocked).length}
                </div>
                <div className="text-indigo-200">/</div>
                <div className="text-2xl font-semibold text-indigo-200">
                  {achievements.length}
                </div>
              </div>
              <Link
                to="/achievements"
                className="inline-flex items-center gap-1 text-xs font-medium text-white hover:text-indigo-100 mt-2"
              >
                View all achievements
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Streak */}
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-3">Current Streak</p>
              <div className="flex items-center gap-3">
                <span className="text-5xl">🔥</span>
                <div>
                  <div className="text-4xl font-bold">
                    {gamificationProgress.streak?.current || 0}
                  </div>
                  <p className="text-indigo-200 text-sm">days</p>
                </div>
              </div>
              {gamificationProgress.streak?.longest > 0 && (
                <p className="text-xs text-indigo-200 mt-2">
                  Best: {gamificationProgress.streak.longest} days
                </p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-6 pt-6 border-t border-indigo-400/30 flex flex-wrap gap-3">
            <Link
              to="/leaderboard"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors backdrop-blur-sm"
            >
              🏆 Leaderboard
            </Link>
            <Link
              to="/achievements"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors backdrop-blur-sm"
            >
              🏅 Achievements
            </Link>
          </div>
        </div>
      )}

      {studyError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{studyError}</div>
      )}
      {!study && !studyError && <p className="text-sm text-slate-600">Loading progress…</p>}

      {study && (
        <>
          {/* Headline numbers */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Study readiness</div>
              <div className={`text-2xl font-bold ${scoreTone(readiness.score, readiness.score !== null).text}`}>
                {readiness.score === null ? "—" : `${readiness.score}%`}
              </div>
              <div className="text-xs text-slate-500">{readiness.label}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Overall accuracy</div>
              <div className="text-2xl font-bold text-slate-900">{perf.overallAccuracy === null ? "—" : `${perf.overallAccuracy}%`}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Last 20 answers</div>
              <div className="text-2xl font-bold text-slate-900">{perf.last20Accuracy === null ? "—" : `${perf.last20Accuracy}%`}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Recent trend</div>
              <div className={`text-2xl font-bold ${perf.trend > 0 ? "text-emerald-700" : perf.trend < 0 ? "text-red-700" : "text-slate-900"}`}>
                {perf.trend === null ? "—" : `${perf.trend > 0 ? "▲ +" : perf.trend < 0 ? "▼ " : ""}${perf.trend}`}
              </div>
              <div className="text-xs text-slate-500">last 20 vs previous 20</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Total attempts</div>
              <div className="text-2xl font-bold text-slate-900">{perf.totalAttempts}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domain mastery */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Mastery by domain</h2>
              {DOMAIN_ORDER.map((id) => (
                <MasteryRow key={id} label={DOMAIN_SHORT[id]} mastery={study.mastery.byDomain[id]} />
              ))}
            </div>

            {/* Readiness breakdown */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Study readiness breakdown</h2>
              <ReadinessBreakdown readiness={readiness} />
            </div>

            {/* Weakest topics */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Weakest topics</h2>
              {study.weakestSections.length === 0 && study.weakestTags.length === 0 ? (
                <p className="text-sm text-slate-500">Answer at least 5 questions in a topic to see it ranked.</p>
              ) : (
                <>
                  {study.weakestSections.map((s) => (
                    <MasteryRow key={`s-${s.key}`} label={sectionTitle(s.key)} mastery={s} />
                  ))}
                  {study.weakestTags.map((t) => (
                    <MasteryRow key={`t-${t.key}`} label={`#${tagTitle(t.key)}`} mastery={t} />
                  ))}
                </>
              )}
              <Link to="/study" className="text-xs text-blue-600 hover:underline">Study my weak areas →</Link>
            </div>

            {/* Mock history */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Mock exam history</h2>
              {study.mockHistory.length === 0 ? (
                <p className="text-sm text-slate-500">No mock exams submitted yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {study.mockHistory.map((m, i) => (
                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <div className="text-slate-800">{m.title}</div>
                        <div className="text-xs text-slate-500">{new Date(m.endTime).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{m.correct}/{m.total}</span>
                        <PercentChip value={m.percent} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Section mastery */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Mastery by section</h2>
            {sectionRows.length === 0 ? (
              <p className="text-sm text-slate-500">No answers yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {sectionRows.map((row) => (
                  <MasteryRow
                    key={row.id}
                    label={sectionTitle(row.id)}
                    mastery={row}
                    sub={`${domainTitle(row.domainId)} · ${row.attempts} recent answer${row.attempts === 1 ? "" : "s"}, ${row.accuracy}% correct`}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Quick Actions
          </h3>
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700"
          >
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/study"
            className="px-4 py-2.5 rounded-md border-2 border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow"
          >
            Study Dashboard
          </Link>
          <Link
            to="/review"
            className="px-4 py-2.5 rounded-md border-2 border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow"
          >
            Review Incorrect
          </Link>
          <Link
            to="/quiz"
            className="px-4 py-2.5 rounded-md border-2 border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow"
          >
            Take Quiz
          </Link>
          <Link
            to="/workflow"
            className="px-4 py-2.5 rounded-md border-2 border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow"
          >
            Review Workflow
          </Link>
          <Link
            to="/patterns"
            className="px-4 py-2.5 rounded-md border-2 border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow"
          >
            Study Patterns
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Progress;
