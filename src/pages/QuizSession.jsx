import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import questionCatalog from "../data/question-catalog.json";
import workflowData from "../data/workflow-domains.json";
import ContextualAI from "../components/ContextualAI.jsx";
import useGamification from "../hooks/useGamification";
import quizApi, { secondsRemaining } from "../services/quizApi";
import { levelLabel } from "../utils/studyLabels";

/**
 * QuizSession Page - ABRET Domain Practice Quiz
 *
 * The server owns question selection, the answer key, timing and scoring.
 * This page renders answer-free questions, sends selected option indexes,
 * and resumes the active session after a reload.
 */

const FLAGS_KEY = (sessionId) => `quiz_flags_${sessionId}`;

function loadFlags(sessionId) {
  try {
    const raw = localStorage.getItem(FLAGS_KEY(sessionId));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveFlags(sessionId, flags) {
  try {
    localStorage.setItem(FLAGS_KEY(sessionId), JSON.stringify([...flags]));
  } catch {
    // Flags are a convenience; ignore storage failures.
  }
}

function clearFlags(sessionId) {
  try {
    localStorage.removeItem(FLAGS_KEY(sessionId));
  } catch {
    // ignore
  }
}

function QuizSession() {
  const navigate = useNavigate();
  const { checkProgress } = useGamification();
  const [searchParams] = useSearchParams();
  const presetParam = searchParams.get("preset");

  // Configuration state
  const [config, setConfig] = useState({
    mode: "practice", // "practice" | "timed" | "mock"
    domains: [],
    sections: [],
    tags: [],
    difficulty: [],
    shuffle: true,
    questionCount: 10,
  });
  const [presets, setPresets] = useState([]);

  // Session state (server-authoritative)
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // questionId -> { selectedIndex, isCorrect?, correctIndex?, explanation? }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flagged, setFlagged] = useState(new Set());
  const [result, setResult] = useState(null);
  const [review, setReview] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Timer (server clock)
  const [timeLeft, setTimeLeft] = useState(null);
  const clockOffsetRef = useRef(0);
  const timerRef = useRef(null);
  const submittingRef = useRef(false);
  const questionStartTimeRef = useRef(Date.now());

  const allDomains = useMemo(() => workflowData.domains || [], []);
  const allSections = useMemo(() => {
    const sections = [];
    allDomains.forEach((domain) => {
      domain.sections?.forEach((section) => {
        sections.push({ ...section, domainId: domain.id, domainTitle: domain.title });
      });
    });
    return sections;
  }, [allDomains]);

  const catalog = useMemo(() => questionCatalog.questions || [], []);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    catalog.forEach((q) => q.topicTags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [catalog]);

  // Counts only; the server re-applies the same filters when selecting.
  const availableQuestions = useMemo(() => {
    return catalog.filter((q) => {
      if (config.domains.length > 0 && !config.domains.includes(q.domainId)) return false;
      if (config.sections.length > 0 && !config.sections.includes(q.sectionId)) return false;
      if (config.difficulty.length > 0 && !config.difficulty.includes(q.difficulty)) return false;
      if (config.tags.length > 0 && !config.tags.some((tag) => q.topicTags?.includes(tag))) return false;
      return true;
    });
  }, [catalog, config]);

  // ------------------------------------------------------------ loading ---

  const applyActivePayload = useCallback((payload) => {
    const s = payload.session;
    clockOffsetRef.current = (s.serverNow || Date.now()) - Date.now();
    setSession(s);
    setQuestions(payload.questions || []);
    setAnswers(payload.answers || {});
    setFlagged(loadFlags(s.sessionId));
    setResult(null);
    setReview([]);
    setShowResults(false);
    setReviewMode(false);
    setTimeLeft(secondsRemaining(s, clockOffsetRef.current));
    const firstUnanswered = (payload.questions || []).findIndex((q) => !payload.answers?.[q.questionId]);
    setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
    questionStartTimeRef.current = Date.now();
    submittingRef.current = false;
  }, []);

  const applySubmission = useCallback((res) => {
    setSession(res.session);
    setResult(res.result);
    setReview(res.review || []);
    setShowResults(true);
    setReviewMode(false);
    setTimeLeft(null);
    if (timerRef.current) clearInterval(timerRef.current);
    clearFlags(res.session.sessionId);
  }, []);

  const submitSession = useCallback(async (sessionId) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await quizApi.submit(sessionId);
      applySubmission(res);
      try {
        await checkProgress();
      } catch {
        // Gamification refresh is non-critical.
      }
    } catch (err) {
      submittingRef.current = false;
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [applySubmission, checkProgress]);

  // Stable handle so effects below run once and never re-trigger when the
  // gamification/notification context re-renders.
  const submitRef = useRef(submitSession);
  useEffect(() => {
    submitRef.current = submitSession;
  }, [submitSession]);

  // Resume an active session (survives page reloads) and load presets.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [active, presetData] = await Promise.all([
          quizApi.getActiveSession(),
          quizApi.getPresets().catch(() => ({ presets: [] })),
        ]);
        if (cancelled) return;
        setPresets(presetData.presets || []);
        if (active?.session) {
          applyActivePayload(active);
          if (active.session.expired) submitRef.current(active.session.sessionId);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to reach the quiz service.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyActivePayload]);

  // Initialize config from URL params
  useEffect(() => {
    const sectionParam = searchParams.get("section");
    const tagsParam = searchParams.get("tags");
    const questionsParam = searchParams.get("questions");
    const modeParam = searchParams.get("mode");

    setConfig((prev) => {
      const next = { ...prev };
      if (sectionParam) next.sections = [sectionParam];
      if (tagsParam) {
        const tags = tagsParam.split(",").filter((tag) => tag.trim() !== "");
        if (tags.length > 0) next.tags = tags;
      }
      if (questionsParam) {
        const count = parseInt(questionsParam, 10);
        if (!isNaN(count) && count > 0) next.questionCount = count;
      }
      if (modeParam && ["practice", "timed", "mock"].includes(modeParam)) next.mode = modeParam;
      return next;
    });
  }, [searchParams]);

  // Timer: always derived from the server's expiresAt, so a reload cannot reset it.
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!session || showResults || !session.expiresAt || session.status !== "active") return undefined;

    const tick = () => {
      const remaining = secondsRemaining(session, clockOffsetRef.current);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        submitRef.current(session.sessionId);
      }
    };
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [session, showResults]);

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentIndex]);

  // ------------------------------------------------------------ actions ---

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const startSession = async (body) => {
    setBusy(true);
    setError(null);
    try {
      const payload = await quizApi.createSession(body);
      applyActivePayload(payload);
    } catch (err) {
      setError(err.message || "Failed to start quiz.");
    } finally {
      setBusy(false);
    }
  };

  const handleMockExam = (presetId) => startSession({ kind: "preset", presetId });

  const handleDomainQuiz = (domainId) => startSession({ kind: "domain-quickstart", domainId });

  const handleStartQuiz = () => {
    if (availableQuestions.length === 0) {
      setError("No questions match the selected filters. Please adjust your selection.");
      return;
    }
    startSession({
      kind: "custom",
      mode: config.mode,
      questionCount: Math.min(config.questionCount, availableQuestions.length),
      shuffle: config.shuffle,
      filters: {
        domains: config.domains,
        sections: config.sections,
        tags: config.tags,
        difficulty: config.difficulty,
      },
    });
  };

  const handleAnswerSelect = async (questionId, selectedIndex) => {
    if (!session || showResults || isSubmitting) return;
    const isPractice = session.mode === "practice";
    const previous = answers[questionId];
    if (isPractice && previous) return; // practice answers are final

    const timeMs = Date.now() - questionStartTimeRef.current;
    questionStartTimeRef.current = Date.now();

    setAnswers((prev) => ({ ...prev, [questionId]: { selectedIndex } }));
    try {
      const res = await quizApi.answer(session.sessionId, questionId, selectedIndex, timeMs);
      if (isPractice) {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: {
            selectedIndex: res.selectedIndex,
            isCorrect: res.isCorrect,
            correctIndex: res.correctIndex,
            explanation: res.explanation,
          },
        }));
      }
    } catch (err) {
      setAnswers((prev) => {
        const next = { ...prev };
        if (previous) next[questionId] = previous;
        else delete next[questionId];
        return next;
      });
      if (/expired/i.test(err.message || "")) {
        submitSession(session.sessionId);
      } else {
        setError(err.message || "Failed to save answer.");
      }
    }
  };

  const handleToggleFlag = (questionId) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      if (session) saveFlags(session.sessionId, next);
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleFinishQuiz = () => {
    if (session) submitSession(session.sessionId);
  };

  const resetLocalState = () => {
    setSession(null);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setFlagged(new Set());
    setResult(null);
    setReview([]);
    setShowResults(false);
    setReviewMode(false);
    setTimeLeft(null);
    setError(null);
    submittingRef.current = false;
  };

  const handleAbandon = async () => {
    if (!session) return;
    if (!window.confirm("Discard this quiz? Unsubmitted answers will not be scored.")) return;
    try {
      await quizApi.abandon(session.sessionId);
    } catch {
      // Already inactive on the server; clear locally either way.
    }
    clearFlags(session.sessionId);
    resetLocalState();
  };

  const handleReset = () => resetLocalState();

  const currentQuestion = questions[currentIndex];
  const unansweredCount = questions.filter((q) => !answers[q.questionId]).length;

  const presetById = (id) => presets.find((p) => p.id === id);
  const requestedPreset = presetParam ? presetById(presetParam) : null;

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading quiz…</div>;
  }

  const errorBanner = error && (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start justify-between gap-4">
      <span>{error}</span>
      <button onClick={() => setError(null)} className="text-xs underline">Dismiss</button>
    </div>
  );

  // Configuration Screen
  if (!session) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">ABRET Domain Practice Quiz</h1>
          <p className="text-sm text-slate-700 max-w-3xl">
            Configure your quiz session. Select domains, sections, difficulty levels, and tags to customize your practice.
          </p>
        </div>

        {errorBanner}

        {/* Requested preset (e.g. from /certification-exam) */}
        {requestedPreset && (
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{requestedPreset.title}</h2>
              <p className="text-xs text-slate-600">
                {requestedPreset.questionCount} questions · {requestedPreset.timeLimitMinutes} minutes · domain allocation{" "}
                {requestedPreset.domainAllocation.map((a) => a.count).join(" / ")} (ABRET R. EEG T. 2026 blueprint)
              </p>
            </div>
            <button
              onClick={() => handleMockExam(requestedPreset.id)}
              disabled={busy}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              Start Exam
            </button>
          </div>
        )}

        {/* Quick Start: Domain Quizzes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Quick Start: Domain Quizzes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {allDomains.map((domain) => {
              const domainQuestionCount = catalog.filter((q) => q.domainId === domain.id).length;
              return (
                <button
                  key={domain.id}
                  onClick={() => handleDomainQuiz(domain.id)}
                  disabled={domainQuestionCount === 0 || busy}
                  className="px-4 py-3 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  <div className="font-semibold">{domain.title}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {domainQuestionCount > 0 ? `${domainQuestionCount} questions` : "No questions"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ABRET Mock Exams */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">ABRET Mock Exams</h2>

          {/* Full Mock Exam */}
          <div className="mb-4">
            <button
              onClick={() => handleMockExam("mock-full-130")}
              disabled={busy}
              className="w-full px-4 py-3 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              Full ABRET Mock Exam (130 Questions, 2 hours)
            </button>
            <p className="text-xs text-slate-600 mt-1 text-center">
              Domains weighted 15% / 46% / 19% / 20% per the 2026 ABRET R. EEG T. blueprint
              {presetById("mock-full-130") &&
                ` (${presetById("mock-full-130").domainAllocation.map((a) => a.count).join(" / ")} questions)`}
            </p>
          </div>

          {/* Mock Exam Sets (30 questions each) */}
          <div className="mb-4">
            <h3 className="text-xs font-medium text-slate-700 mb-2">Mock Exam Sets (30 Questions Each)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {presets
                .filter((p) => p.id.startsWith("mock-set-"))
                .map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleMockExam(preset.id)}
                    disabled={busy}
                    className="px-3 py-2 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
                  >
                    {preset.title}
                  </button>
                ))}
            </div>
          </div>

          {/* Domain-Specific Mocks */}
          <div>
            <h3 className="text-xs font-medium text-slate-700 mb-2">Domain-Specific Mock Exams</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {presets
                .filter((p) => p.id.startsWith("mock-domain-"))
                .map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleMockExam(preset.id)}
                    disabled={busy}
                    className="px-3 py-2 rounded-md bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
                  >
                    {preset.title}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Quiz Configuration</h2>

              {/* Mode Selection */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-2">Mode</label>
                <div className="flex gap-2">
                  {["practice", "timed", "mock"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleConfigChange("mode", mode)}
                      className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${config.mode === mode
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                      {mode === "practice" ? "Practice" : mode === "timed" ? "Timed" : "Mock Exam"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {config.mode === "practice"
                    ? "Immediate feedback and explanations after each answer."
                    : "Answers are scored when you submit; no feedback until then."}
                </p>
              </div>

              {/* Question Count */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Number of Questions: {Math.min(config.questionCount, availableQuestions.length)}
                </label>
                <input
                  type="range"
                  min="1"
                  max={Math.max(1, Math.min(50, availableQuestions.length))}
                  value={Math.min(config.questionCount, availableQuestions.length)}
                  onChange={(e) => handleConfigChange("questionCount", parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-slate-500 mt-1">
                  {availableQuestions.length} questions available
                </div>
              </div>

              {/* Domain Selection */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-2">Domains</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {allDomains.map((domain) => (
                    <label key={domain.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={config.domains.includes(domain.id)}
                        onChange={(e) => {
                          const newDomains = e.target.checked
                            ? [...config.domains, domain.id]
                            : config.domains.filter((d) => d !== domain.id);
                          handleConfigChange("domains", newDomains);
                        }}
                        className="rounded"
                      />
                      <span>{domain.title} ({domain.examWeightPercent}%)</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section Selection */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-2">Sections</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {allSections.map((section) => (
                    <label key={section.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={config.sections.includes(section.id)}
                        onChange={(e) => {
                          const newSections = e.target.checked
                            ? [...config.sections, section.id]
                            : config.sections.filter((s) => s !== section.id);
                          handleConfigChange("sections", newSections);
                        }}
                        className="rounded"
                      />
                      <span className="text-slate-600">{section.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {["easy", "medium", "hard"].map((diff) => (
                    <label key={diff} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={config.difficulty.includes(diff)}
                        onChange={(e) => {
                          const newDiff = e.target.checked
                            ? [...config.difficulty, diff]
                            : config.difficulty.filter((d) => d !== diff);
                          handleConfigChange("difficulty", newDiff);
                        }}
                        className="rounded"
                      />
                      <span className="capitalize">{diff}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags Selection */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-2">Topic Tags</label>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {allTags.slice(0, 20).map((tag) => (
                    <label key={tag} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={config.tags.includes(tag)}
                        onChange={(e) => {
                          const newTags = e.target.checked
                            ? [...config.tags, tag]
                            : config.tags.filter((t) => t !== tag);
                          handleConfigChange("tags", newTags);
                        }}
                        className="rounded"
                      />
                      <span className="text-slate-600">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Shuffle */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={config.shuffle}
                    onChange={(e) => handleConfigChange("shuffle", e.target.checked)}
                    className="rounded"
                  />
                  <span>Shuffle question and answer order</span>
                </label>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartQuiz}
                disabled={availableQuestions.length === 0 || busy}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {busy ? "Starting..." : `Start Quiz (${Math.min(config.questionCount, availableQuestions.length)} questions)`}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Preview</h2>
            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <span className="font-medium">Mode:</span> {config.mode}
              </div>
              <div>
                <span className="font-medium">Questions Available:</span> {availableQuestions.length}
              </div>
              <div>
                <span className="font-medium">Selected:</span> {Math.min(config.questionCount, availableQuestions.length)}
              </div>
              {config.domains.length > 0 && (
                <div>
                  <span className="font-medium">Domains:</span> {config.domains.length}
                </div>
              )}
              {config.sections.length > 0 && (
                <div>
                  <span className="font-medium">Sections:</span> {config.sections.length}
                </div>
              )}
              {config.difficulty.length > 0 && (
                <div>
                  <span className="font-medium">Difficulty:</span> {config.difficulty.join(", ")}
                </div>
              )}
              {config.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span> {config.tags.slice(0, 5).join(", ")}
                  {config.tags.length > 5 && ` +${config.tags.length - 5} more`}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Results Screen
  if (showResults && result) {
    const breakdownRows = (map) =>
      Object.entries(map || {}).map(([key, stats]) => ({
        key,
        ...stats,
        percent: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      }));

    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Quiz Results</h1>
          <p className="text-sm text-slate-700">
            {session.mode === "practice" ? "Practice" : session.mode === "timed" ? "Timed" : "Mock Exam"} completed
          </p>
        </div>

        {errorBanner}

        {/* Score Summary */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Your Score</h2>
            <button
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50"
            >
              Start New Quiz
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-5xl font-bold text-blue-700 bg-blue-50 px-6 py-4 rounded-lg border border-blue-200">
              {result.percent}%
            </div>
            <div className="text-sm text-slate-700">
              <div className="font-medium text-slate-900 mb-1">
                {result.correct} / {result.total} correct
              </div>
              <div className="text-xs text-slate-500">
                {result.total - result.attempted} unanswered · {result.percentOfAttempted}% of answered questions correct
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown by Domain */}
        {breakdownRows(result.breakdown.byDomain).length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Performance by Domain</h3>
            <div className="space-y-2">
              {breakdownRows(result.breakdown.byDomain).map((row) => {
                const domain = allDomains.find((d) => d.id === row.key);
                return (
                  <div key={row.key} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">{domain?.title || row.key}</span>
                    <span className="font-medium text-slate-900">
                      {row.correct}/{row.total} ({row.percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Breakdown by Difficulty */}
        {breakdownRows(result.breakdown.byDifficulty).length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Performance by Difficulty</h3>
            <div className="space-y-2">
              {breakdownRows(result.breakdown.byDifficulty).map((row) => (
                <div key={row.key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 capitalize">{row.key}</span>
                  <span className="font-medium text-slate-900">
                    {row.correct}/{row.total} ({row.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Mode Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setReviewMode(!reviewMode)}
            className="px-4 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
          >
            {reviewMode ? "Hide Review" : "Review Questions"}
          </button>
          <button
            onClick={() => navigate("/progress")}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            View Progress →
          </button>
        </div>

        {/* Review Questions (answer key provided by the server after submission) */}
        {reviewMode && (
          <div className="space-y-4">
            {review.map((q, idx) => (
              <div key={q.questionId} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500">Question {idx + 1}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${q.isCorrect ? "bg-green-100 text-green-800" : q.selectedIndex === null ? "bg-slate-100 text-slate-700" : "bg-red-100 text-red-800"
                      }`}
                  >
                    {q.isCorrect ? "Correct" : q.selectedIndex === null ? "Unanswered" : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900 mb-3">{q.stem}</p>
                <div className="space-y-2">
                  {q.options.map((option, optIdx) => {
                    const isSelected = q.selectedIndex === optIdx;
                    const isAnswer = optIdx === q.correctIndex;
                    let optionClass = "w-full text-left rounded-md border px-3 py-2 text-sm";
                    if (isAnswer) {
                      optionClass += " border-green-500 bg-green-50";
                    } else if (isSelected) {
                      optionClass += " border-red-500 bg-red-50";
                    } else {
                      optionClass += " border-slate-200 bg-white";
                    }
                    return (
                      <div key={optIdx} className={optionClass}>
                        <span className="font-semibold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                        {option}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <div className="mt-3 text-sm text-slate-700 bg-slate-50 p-3 rounded">
                    <span className="font-semibold">Explanation:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  // Quiz in Progress
  const isPractice = session.mode === "practice";

  return (
    <>
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {session.kind === "challenge"
              ? "ABRET Challenge"
              : isPractice ? "ABRET Practice Quiz" : session.mode === "timed" ? "ABRET Timed Quiz" : "ABRET Mock Exam"}
          </h1>
          <p className="text-xs text-slate-500">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {timeLeft !== null && (
            <div className={`text-sm font-medium ${timeLeft < 600 ? "text-red-600" : "text-slate-700"}`}>
              Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          )}
          <button
            onClick={handleAbandon}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          >
            Exit
          </button>
          <button
            onClick={handleFinishQuiz}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-70 disabled:cursor-wait"
          >
            {isSubmitting ? "Submitting..." : "Finish Quiz"}
          </button>
        </div>
      </div>

      {errorBanner}

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%` }}
        />
      </div>

      {/* Question Navigation Grid */}
      <div className="flex flex-wrap gap-1">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.questionId];
          const isFlagged = flagged.has(q.questionId);
          const isCurrent = idx === currentIndex;
          let buttonClass = "w-8 h-8 rounded text-xs font-medium transition-colors";
          if (isCurrent) {
            buttonClass += " bg-blue-600 text-white";
          } else if (isFlagged) {
            buttonClass += " bg-yellow-100 text-yellow-800 border-2 border-yellow-400";
          } else if (isAnswered) {
            buttonClass += " bg-green-100 text-green-800";
          } else {
            buttonClass += " bg-slate-100 text-slate-600 hover:bg-slate-200";
          }
          return (
            <button
              key={q.questionId}
              onClick={() => setCurrentIndex(idx)}
              className={buttonClass}
              title={q.stem.substring(0, 50)}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Current Question */}
      {currentQuestion && (() => {
        const answer = answers[currentQuestion.questionId];
        const selectedAnswer = answer?.selectedIndex;
        const hasFeedback = isPractice && answer && answer.correctIndex !== undefined;

        return (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {currentQuestion.cognitiveLevel ? (
                  <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                    {levelLabel(currentQuestion.cognitiveLevel)}
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                    {currentQuestion.difficulty}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  {currentQuestion.topicTags?.slice(0, 2).join(", ")}
                </span>
              </div>
              <button
                onClick={() => handleToggleFlag(currentQuestion.questionId)}
                className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
              >
                {flagged.has(currentQuestion.questionId) ? "★ Flagged" : "☆ Flag"}
              </button>
            </div>

            <p className="text-sm font-medium text-slate-900 mb-4">{currentQuestion.stem}</p>

            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                let optionClass = "w-full text-left rounded-md border px-4 py-3 text-sm transition";

                if (hasFeedback && idx === answer.correctIndex) {
                  optionClass += " border-green-500 bg-green-50 text-green-900 font-medium";
                } else if (hasFeedback && isSelected) {
                  optionClass += " border-red-500 bg-red-50 text-red-900 font-medium";
                } else if (isSelected) {
                  optionClass += " border-blue-400 bg-blue-50 text-blue-900 font-medium";
                } else {
                  optionClass += " border-slate-200 hover:bg-slate-50";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isPractice && !!answer}
                    onClick={() => handleAnswerSelect(currentQuestion.questionId, idx)}
                    className={optionClass}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>

            {hasFeedback && (
              <div className={`mt-4 text-sm p-3 rounded ${answer.isCorrect ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
                <div className="font-semibold mb-1">{answer.isCorrect ? "Correct" : "Incorrect"}</div>
                {answer.explanation && <div className="text-slate-700">{answer.explanation}</div>}
              </div>
            )}
          </div>
        );
      })()}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="text-xs text-slate-500">
          {unansweredCount} unanswered
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="px-4 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </section>

    {/* Contextual AI Assistant */}
    <ContextualAI
      context={{
        page: 'quiz'
      }}
    />
    </>
  );
}

export default QuizSession;
