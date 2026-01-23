import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  loadAttemptEvents,
  calculateWeakTopics,
  loadScoreHistory,
  getBestScore,
  getProgressBySubsection,
} from "../utils/progressTracking.js";
import workflowData from "../data/workflow-domains.json";

/**
 * Progress Page - Track weak topics and score history
 * Uses new AttemptEvent system for comprehensive progress tracking
 */

function Progress() {
  const [bestScore, setBestScore] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [weakTopics, setWeakTopics] = useState({});
  const [subsectionProgress, setSubsectionProgress] = useState([]);
  const [attemptStats, setAttemptStats] = useState({
    totalAttempts: 0,
    totalCorrect: 0,
    totalTime: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const loadProgressData = async () => {
    try {
      // Load best score (sync - local only)
      const best = getBestScore();
      if (best) setBestScore(best);

      // Load score history
      const history = await loadScoreHistory();
      setScoreHistory(history);

      // Calculate weak topics from attempt events
      const weak = await calculateWeakTopics(30, 5); // Last 30 attempts, min 5 per topic
      setWeakTopics(weak);

      // Calculate subsection progress
      const subsection = await getProgressBySubsection();
      setSubsectionProgress(subsection);

      // Calculate overall stats from attempt events
      const events = await loadAttemptEvents();
      const stats = events.reduce(
        (acc, event) => {
          acc.totalAttempts++;
          if (event.isCorrect) acc.totalCorrect++;
          acc.totalTime += event.timeMs || 0;
          return acc;
        },
        { totalAttempts: 0, totalCorrect: 0, totalTime: 0 }
      );
      setAttemptStats(stats);
    } catch (e) {
      console.error("Error loading progress data:", e);
    }
  };

  useEffect(() => {
    loadProgressData();
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

  const weakTopicsSorted = useMemo(() => {
    const entries = Object.entries(weakTopics).map(([topic, stats]) => {
      const wrong = stats.wrong || 0;
      const total = stats.total || 0;
      const pctWrong = stats.pctWrong || 0;
      return { topic, wrong, total, pctWrong };
    });
    entries.sort((a, b) => b.pctWrong - a.pctWrong);
    return entries;
  }, [weakTopics]);

  // Get all sections map
  const getAllSections = useMemo(() => {
    const sectionsMap = {};
    workflowData.domains.forEach((domain) => {
      domain.sections?.forEach((section) => {
        sectionsMap[section.id] = { ...section, domainId: domain.id, domainTitle: domain.title };
      });
    });
    return sectionsMap;
  }, []);

  // Calculate strong subsections (>= 80% accuracy)
  const strongSubsections = useMemo(() => {
    return subsectionProgress
      .filter((s) => s.accuracy >= 80 && s.attempts >= 5)
      .sort((a, b) => b.accuracy - a.accuracy);
  }, [subsectionProgress]);

  // Suggested next quiz (weakest subsection)
  const suggestedNextQuiz = useMemo(() => {
    const weak = subsectionProgress
      .filter((s) => s.isWeak && s.attempts >= 10)
      .sort((a, b) => a.accuracy - b.accuracy);
    return weak.length > 0 ? weak[0] : null;
  }, [subsectionProgress]);

  const topicLabels = {
    standards_orgs: "Standards & Organizations",
    documentation: "Documentation & Annotation",
    filters_settings: "Filters & Settings",
    duration_quality: "Duration & Quality",
    montages: "Montages",
    electrodes_1020: "Electrodes & 10–20",
    activation: "Activation Procedures",
    safety_ethics: "Safety & Ethics",
    interpretation_basics: "Interpretation Basics",
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">My Progress</h1>
        <p className="text-sm text-slate-700 max-w-3xl">
          Track your quiz performance, identify weak topics, and monitor your
          improvement over time.
        </p>
      </div>

      {/* Overall Stats */}
      {attemptStats.totalAttempts > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Overall Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {attemptStats.totalAttempts}
              </div>
              <div className="text-xs text-slate-600">Total Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">
                {attemptStats.totalAttempts > 0
                  ? Math.round((attemptStats.totalCorrect / attemptStats.totalAttempts) * 100)
                  : 0}%
              </div>
              <div className="text-xs text-slate-600">Overall Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {Math.round(attemptStats.totalTime / 1000 / 60)}m
              </div>
              <div className="text-xs text-slate-600">Time Spent</div>
            </div>
          </div>
        </div>
      )}

      {/* Best Score */}
      {bestScore && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Best Score
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-5xl font-bold text-blue-700 bg-blue-50 px-6 py-4 rounded-lg border border-blue-200">
              {bestScore.percent}%
            </div>
            <div className="text-sm text-slate-700">
              <div className="font-medium text-slate-900 mb-1">
                {bestScore.correct} / {bestScore.total} correct
              </div>
              <div className="text-xs text-slate-500">
                {bestScore.mode && (
                  <span className="capitalize">{bestScore.mode} mode</span>
                )}
                {bestScore.timestamp && (
                  <span className="ml-2">
                    {new Date(bestScore.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weak Topics */}
      {weakTopicsSorted.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Weak Topics (Need More Practice)
          </h2>
          <div className="space-y-3">
            {weakTopicsSorted.map((t) => {
              const label = topicLabels[t.topic] || t.topic;
              const colorClass =
                t.pctWrong >= 50
                  ? "bg-red-100 text-red-800"
                  : t.pctWrong >= 30
                    ? "bg-orange-100 text-orange-800"
                    : "bg-yellow-100 text-yellow-800";

              return (
                <div
                  key={t.topic}
                  className="flex items-center justify-between p-3 rounded-md border border-slate-200"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {label}
                    </div>
                    <div className="text-xs text-slate-500">
                      Wrong: {t.wrong} / {t.total} questions
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
                    {t.pctWrong}% wrong
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline"
            >
              Practice weak topics
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Subsection Progress */}
      {subsectionProgress.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Subsection Performance
          </h2>

          {/* Weak Subsections (<70%) */}
          {subsectionProgress.filter((s) => s.isWeak).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-red-900 mb-3">
                Weak Subsections (&lt; 70% accuracy)
              </h3>
              <div className="space-y-2">
                {subsectionProgress
                  .filter((s) => s.isWeak)
                  .map((subsection) => {
                    const section = getAllSections[subsection.sectionId];
                    const sectionTitle = section?.title || subsection.sectionId;

                    return (
                      <div
                        key={subsection.sectionId}
                        className="flex items-center justify-between p-3 rounded-md border border-red-200 bg-red-50"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {sectionTitle}
                          </div>
                          <div className="text-xs text-slate-500">
                            {subsection.attempts} attempts
                          </div>
                        </div>
                        <div className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                          {subsection.accuracy}%
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Strong Subsections (>= 80%) */}
          {strongSubsections.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-green-900 mb-3">
                Strong Subsections (≥ 80% accuracy)
              </h3>
              <div className="space-y-2">
                {strongSubsections.map((subsection) => {
                  const section = getAllSections[subsection.sectionId];
                  const sectionTitle = section?.title || subsection.sectionId;

                  return (
                    <div
                      key={subsection.sectionId}
                      className="flex items-center justify-between p-3 rounded-md border border-green-200 bg-green-50"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {sectionTitle}
                        </div>
                        <div className="text-xs text-slate-500">
                          {subsection.attempts} attempts
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {subsection.accuracy}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested Next Quiz */}
          {suggestedNextQuiz && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Suggested Next Quiz
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {getAllSections[suggestedNextQuiz.sectionId]?.title || suggestedNextQuiz.sectionId}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Current accuracy: {suggestedNextQuiz.accuracy}% ({suggestedNextQuiz.attempts} attempts)
                  </div>
                </div>
                <Link
                  to={`/quiz/session?section=${suggestedNextQuiz.sectionId}&questions=10&mode=practice`}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Practice →
                </Link>
              </div>
            </div>
          )}

          {/* All Subsections (Ranked List) */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              All Subsections (Ranked by Accuracy)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {subsectionProgress.map((subsection) => {
                const section = getAllSections[subsection.sectionId];
                const sectionTitle = section?.title || subsection.sectionId;
                const colorClass =
                  subsection.accuracy >= 80
                    ? "bg-green-100 text-green-800"
                    : subsection.accuracy >= 70
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800";

                return (
                  <div
                    key={subsection.sectionId}
                    className="flex items-center justify-between p-2 rounded border border-slate-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-900 truncate">
                        {sectionTitle}
                      </div>
                      <div className="text-xs text-slate-500">
                        {subsection.attempts} attempts
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${colorClass} ml-2`}>
                      {subsection.accuracy}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Score History */}
      {scoreHistory.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Quiz Scores
          </h2>
          <div className="space-y-2">
            {scoreHistory.slice(0, 10).map((score, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded border border-slate-200"
              >
                <div className="text-sm text-slate-700">
                  {score.correct} / {score.total} ({score.percent}%)
                </div>
                <div className="text-xs text-slate-500">
                  {score.date
                    ? new Date(score.date).toLocaleDateString()
                    : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {attemptStats.totalAttempts === 0 && !bestScore && weakTopicsSorted.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-sm text-slate-600 mb-6">
              No quiz data yet. Start practicing to track your progress!
            </p>
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-50 hover:border-blue-700 hover:text-blue-800 active:bg-blue-100 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Start Quiz
            </Link>
          </div>
        </div>
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

