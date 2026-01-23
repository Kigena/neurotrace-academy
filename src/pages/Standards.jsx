import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * NeuroTrace Academy — Standards Page (Pro Quiz Mode)
 * Includes:
 * - Standards content with "Learn more" drawers
 * - Study Mode (self-check)
 * - Quiz Mode (Mock Test)
 */

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

const BEST_SCORE_KEY = "neurotrace_best_score_standards_v1";

function Standards() {
  const [openDrawers, setOpenDrawers] = useState({});

  const toggleDrawer = (drawerId) => {
    setOpenDrawers((prev) => ({
      ...prev,
      [drawerId]: !prev[drawerId],
    }));
  };

  // Question Bank (same as before)
  const questionBank = useMemo(
    () => [
      {
        id: "q1",
        topic: "standards_orgs",
        stem:
          "Which organization primarily publishes widely used technical guidelines for EEG performance and special protocols (e.g., ICU EEG, electrocerebral inactivity)?",
        options: ["ABRET", "ACNS", "ASET", "AHA"],
        answerIndex: 1,
        explanation:
          "ACNS publishes technical guidelines for EEG performance and specialized studies (ICU/cEEG, neonatal EEG, electrocerebral inactivity protocols).",
      },
      {
        id: "q2",
        topic: "documentation",
        stem:
          "A technologist performs a routine EEG but does not document that hyperventilation was omitted due to limited cooperation. What is the primary issue?",
        options: [
          "The EEG is automatically invalid and must be repeated",
          "A documentation deficiency reduces interpretive value and quality compliance",
          "Hyperventilation is never required in routine EEG",
          "Photic stimulation must replace hyperventilation in all cases",
        ],
        answerIndex: 1,
        explanation:
          "If HV is omitted, the reason must be documented. Missing documentation is a quality/technical deficiency and reduces interpretive value.",
      },
      {
        id: "q3",
        topic: "standards_orgs",
        stem: "Which statement best reflects ABRET's role in EEG practice?",
        options: [
          "Defines physician interpretation criteria for epileptiform discharges",
          "Certifies technologists and defines core competencies, scope of practice, and ethics",
          "Sets national electrical safety regulations for hospitals",
          "Publishes the international 10–20 electrode placement system",
        ],
        answerIndex: 1,
        explanation:
          "ABRET certifies technologists and emphasizes competencies (patient care, documentation, recording technique) and professional ethics.",
      },
      {
        id: "q4",
        topic: "filters_settings",
        stem: "Which approach is most appropriate regarding notch filter use?",
        options: [
          "Always keep notch on to eliminate all noise",
          "Use notch only when needed, as it can distort EEG features if overused",
          "Use notch only during photic stimulation",
          "Notch is required to visualize spikes",
        ],
        answerIndex: 1,
        explanation:
          "Notch filters can help with line noise but may distort EEG. Use only when necessary and address artifact sources whenever possible.",
      },
      {
        id: "q5",
        topic: "duration_quality",
        stem:
          "A routine EEG is recorded for 8 minutes with frequent artifacts, and no meaningful clean segments are obtained. The most accurate statement is:",
        options: [
          "This meets standard recording duration requirements",
          "This is technically insufficient; longer artifact-free recording is needed",
          "Only sleep EEGs require 20–30 minutes",
          "Duration does not matter if PDR is seen briefly",
        ],
        answerIndex: 1,
        explanation:
          "Routine EEG generally requires ~20–30 minutes of artifact-free recording. An 8-minute artifact-limited study is technically insufficient.",
      },
      {
        id: "q6",
        topic: "montages",
        stem:
          "Which is the best reason to use multiple montages (referential + bipolar) in a routine EEG?",
        options: [
          "To shorten the study time",
          "Different montages help detect and localize abnormalities more reliably",
          "Bipolar montages eliminate the need for activation procedures",
          "Referential montages are used only for normal EEGs",
        ],
        answerIndex: 1,
        explanation:
          "Multiple montages improve detection and localization; some abnormalities become clearer in certain montage types.",
      },
      {
        id: "q7",
        topic: "electrodes_1020",
        stem:
          "Which of the following is MOST aligned with professional standards for electrode placement?",
        options: [
          "Estimating positions by visual symmetry is acceptable if the patient is cooperative",
          "Using the International 10–20 System with accurate measurement and documenting deviations",
          "Placing electrodes based only on the patient's reported symptom side",
          "Skipping measurement if impedances are good",
        ],
        answerIndex: 1,
        explanation:
          "Standards emphasize accurate measurement using the International 10–20 System and documenting deviations for the interpreter.",
      },
      {
        id: "q8",
        topic: "interpretation_basics",
        stem:
          "A normal interictal EEG rules out epilepsy in a patient with recurrent seizures.",
        options: ["True", "False"],
        answerIndex: 1,
        explanation:
          "False. A normal EEG does not exclude epilepsy; interictal abnormalities may be absent in a single routine study.",
      },
      {
        id: "q9",
        topic: "activation",
        stem:
          "Which activation procedure is most likely to increase yield for typical absence epilepsy?",
        options: ["Photic stimulation", "Hyperventilation", "Eye opening", "Auditory stimulation"],
        answerIndex: 1,
        explanation:
          "Hyperventilation commonly provokes generalized 3 Hz spike-and-wave in typical absence epilepsy.",
      },
      {
        id: "q10",
        topic: "safety_ethics",
        stem:
          "During EEG, the patient requests to stop the test due to discomfort. The MOST appropriate response is:",
        options: [
          "Continue because the referral requires completion",
          "Pause and explain briefly, but proceed even if the patient refuses",
          "Stop the procedure and notify the supervising clinician/provider per policy",
          "Ignore the request unless a seizure occurs",
        ],
        answerIndex: 2,
        explanation:
          "Patients have the right to refuse testing. Stop and follow institutional policy—notify the provider/supervisor and document.",
      },
      {
        id: "q11",
        topic: "filters_settings",
        stem:
          "Which setting change is MOST likely to distort slow-wave activity and make diffuse slowing harder to appreciate?",
        options: [
          "Raising the low-frequency filter too high",
          "Lowering the high-frequency filter slightly",
          "Reducing sensitivity (higher µV/mm)",
          "Turning off photic stimulation",
        ],
        answerIndex: 0,
        explanation:
          "Raising the LFF (high-pass) too much attenuates slow waves and can mask diffuse slowing—an important interpretive pitfall.",
      },
      {
        id: "q12",
        topic: "documentation",
        stem:
          "Which item is MOST essential to annotate during a clinical event suspected to be a seizure?",
        options: [
          "Only the time of day",
          "Only the montage being used",
          "Observed behaviors, responsiveness, and timing of event phases",
          "The patient's favorite activity",
        ],
        answerIndex: 2,
        explanation:
          "During events, document behaviors, responsiveness, onset/offset, motor features, and any triggers/artefacts to support interpretation.",
      },
    ],
    []
  );

  const topicLabels = useMemo(
    () => ({
      standards_orgs: "Standards & Organizations",
      documentation: "Documentation & Annotation",
      filters_settings: "Filters & Settings",
      duration_quality: "Duration & Quality",
      montages: "Montages",
      electrodes_1020: "Electrodes & 10–20",
      activation: "Activation Procedures",
      safety_ethics: "Safety & Ethics",
      interpretation_basics: "Interpretation Basics",
    }),
    []
  );

  const allTopics = useMemo(() => {
    const set = new Set(questionBank.map((q) => q.topic));
    return Array.from(set).sort();
  }, [questionBank]);

  // Page Mode
  const [mode, setMode] = useState("study"); // "study" | "quiz"

  // Study Mode State
  const [studySelected, setStudySelected] = useState({});
  const [studySubmitted, setStudySubmitted] = useState({});

  const studyChoose = (qid, idx) => setStudySelected((p) => ({ ...p, [qid]: idx }));
  const studyCheck = (qid) => setStudySubmitted((p) => ({ ...p, [qid]: true }));

  const resetStudy = () => {
    setStudySelected({});
    setStudySubmitted({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Quiz Mode Config + State
  const [quizCount, setQuizCount] = useState(10);
  const [quizMinutes, setQuizMinutes] = useState(12);
  const [selectedTopics, setSelectedTopics] = useState(() => new Set());
  const [quizRunning, setQuizRunning] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFlags, setQuizFlags] = useState(() => new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  const [weakTopics, setWeakTopics] = useState({});

  const [bestScore, setBestScore] = useState(() => {
    try {
      const raw = localStorage.getItem(BEST_SCORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const filteredBank = useMemo(() => {
    if (!selectedTopics || selectedTopics.size === 0) return questionBank;
    return questionBank.filter((q) => selectedTopics.has(q.topic));
  }, [questionBank, selectedTopics]);

  const startQuiz = () => {
    const bank = filteredBank.length > 0 ? filteredBank : questionBank;
    const count = Math.max(5, Math.min(quizCount, bank.length));
    const selectedSet = shuffleArray(bank).slice(0, count);

    const totals = {};
    for (const q of selectedSet) {
      if (!totals[q.topic]) totals[q.topic] = { wrong: 0, total: 0 };
      totals[q.topic].total += 1;
    }

    setQuizQuestions(selectedSet);
    setQuizAnswers({});
    setQuizFlags(new Set());
    setWeakTopics(totals);
    setCurrentIndex(0);
    setReviewMode(false);
    setQuizRunning(true);
    setQuizFinished(false);

    const totalSeconds = Math.max(60, Math.floor(quizMinutes * 60));
    setSecondsLeft(totalSeconds);
  };

  const finishQuiz = () => {
    setQuizRunning(false);
    setQuizFinished(true);
    setReviewMode(false);
  };

  const resetQuiz = () => {
    setQuizRunning(false);
    setQuizFinished(false);
    setReviewMode(false);
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizFlags(new Set());
    setWeakTopics({});
    setSecondsLeft(0);
    setCurrentIndex(0);
  };

  const chooseQuizAnswer = (qid, idx) => {
    if (!quizRunning) return;
    setQuizAnswers((p) => ({ ...p, [qid]: idx }));
  };

  const toggleFlag = (qid) => {
    setQuizFlags((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  };

  const unansweredIds = useMemo(() => {
    const set = new Set();
    for (const q of quizQuestions) {
      if (quizAnswers[q.id] === undefined) set.add(q.id);
    }
    return set;
  }, [quizAnswers, quizQuestions]);

  const submitQuiz = () => {
    const updated = { ...weakTopics };
    for (const q of quizQuestions) {
      const chosen = quizAnswers[q.id];
      const isCorrect = chosen === q.answerIndex;
      if (!isCorrect) {
        if (!updated[q.topic]) updated[q.topic] = { wrong: 0, total: 0 };
        updated[q.topic].wrong += 1;
      }
    }
    setWeakTopics(updated);
    finishQuiz();
  };

  // Timer
  useEffect(() => {
    if (!quizRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          // Call submitQuiz when timer expires
          setTimeout(() => {
            const updated = { ...weakTopics };
            for (const q of quizQuestions) {
              const chosen = quizAnswers[q.id];
              const isCorrect = chosen === q.answerIndex;
              if (!isCorrect) {
                if (!updated[q.topic]) updated[q.topic] = { wrong: 0, total: 0 };
                updated[q.topic].wrong += 1;
              }
            }
            setWeakTopics(updated);
            finishQuiz();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [quizRunning, quizQuestions, quizAnswers, weakTopics]);

  // Score
  const quizScore = useMemo(() => {
    if (!quizFinished) return null;
    let correct = 0;
    for (const q of quizQuestions) {
      const chosen = quizAnswers[q.id];
      if (chosen === q.answerIndex) correct += 1;
    }
    const total = quizQuestions.length;
    const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
    return { correct, total, percent };
  }, [quizFinished, quizAnswers, quizQuestions]);

  // Save best score when quiz finishes
  useEffect(() => {
    if (!quizFinished || !quizScore) return;

    const now = new Date().toISOString();
    const record = {
      percent: quizScore.percent,
      correct: quizScore.correct,
      total: quizScore.total,
      date: now,
    };

    // Read current best from localStorage to avoid state dependency
    let currentBest = bestScore;
    try {
      const stored = localStorage.getItem(BEST_SCORE_KEY);
      if (stored) {
        currentBest = JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }

    if (!currentBest || record.percent > currentBest.percent) {
      try {
        localStorage.setItem(BEST_SCORE_KEY, JSON.stringify(record));
        // Use setTimeout to defer state update and avoid cascading renders
        setTimeout(() => {
          setBestScore(record);
        }, 0);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [quizFinished, quizScore, bestScore]);

  const weakTopicsSorted = useMemo(() => {
    const entries = Object.entries(weakTopics).map(([topic, stats]) => {
      const wrong = stats.wrong || 0;
      const total = stats.total || 0;
      const pctWrong = total === 0 ? 0 : Math.round((wrong / total) * 100);
      return {
        topic,
        label: topicLabels[topic] || topic,
        wrong,
        total,
        pctWrong,
      };
    });
    entries.sort((a, b) => b.pctWrong - a.pctWrong);
    return entries;
  }, [weakTopics, topicLabels]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Render: Study Mode Question
  const renderStudyQuestion = (q) => {
    const chosenIdx = studySelected[q.id];
    const isSubmitted = studySubmitted[q.id] === true;
    const isCorrect = isSubmitted && chosenIdx === q.answerIndex;

    return (
      <div key={q.id} className="rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900">{q.stem}</div>
          <span className="text-[11px] rounded-full bg-slate-100 text-slate-600 px-2 py-1">
            Topic: {topicLabels[q.topic] || q.topic}
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {q.options.map((opt, idx) => {
            const checked = chosenIdx === idx;
            let optionClass =
              "w-full text-left rounded-md border px-3 py-2 text-sm transition";
            if (!isSubmitted) {
              optionClass += checked
                ? " border-blue-400 bg-blue-50 text-blue-900 font-medium"
                : " border-slate-200 hover:bg-slate-50";
            } else {
              if (idx === q.answerIndex) optionClass += " border-green-500 bg-green-50";
              else if (checked && idx !== q.answerIndex) optionClass += " border-red-500 bg-red-50";
              else optionClass += " border-slate-200 bg-white";
            }

            return (
              <button
                key={opt}
                type="button"
                className={optionClass}
                onClick={() => studyChoose(q.id, idx)}
                disabled={isSubmitted}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <button
            type="button"
            className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700 disabled:bg-slate-300"
            onClick={() => studyCheck(q.id)}
            disabled={chosenIdx === undefined || isSubmitted}
          >
            Check Answer
          </button>
          {isSubmitted && (
            <span className={["text-sm font-semibold", isCorrect ? "text-green-700" : "text-red-700"].join(" ")}>
              {isCorrect ? "Correct" : "Incorrect"}
            </span>
          )}
        </div>
        {isSubmitted && (
          <div className="mt-3 text-sm text-slate-700">
            <span className="font-semibold">Explanation:</span> {q.explanation}
          </div>
        )}
      </div>
    );
  };

  // Render: Quiz Question (one-at-a-time)
  const renderQuizOne = (q, idx) => {
    const chosenIdx = quizAnswers[q.id];
    const locked = quizFinished;

    return (
      <div className="rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="text-xs text-slate-500">
              Question {idx + 1} of {quizQuestions.length}
            </div>
            <div className="text-sm font-semibold text-slate-900">{q.stem}</div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] rounded-full bg-slate-100 text-slate-600 px-2 py-1">
              {topicLabels[q.topic] || q.topic}
            </span>
            <button
              type="button"
              onClick={() => toggleFlag(q.id)}
              disabled={!quizRunning && !quizFinished}
              className={[
                "text-xs rounded-full border px-3 py-1",
                quizFlags.has(q.id)
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-slate-300 bg-white hover:bg-slate-50",
              ].join(" ")}
              title="Flag this question for review"
            >
              {quizFlags.has(q.id) ? "★ Flagged" : "☆ Flag"}
            </button>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {q.options.map((opt, oidx) => {
            const checked = chosenIdx === oidx;
            let optionClass =
              "w-full text-left rounded-md border px-3 py-2 text-sm transition";
            if (!locked) {
              optionClass += checked
                ? " border-blue-400 bg-blue-50 text-blue-900 font-medium"
                : " border-slate-200 hover:bg-slate-50";
            } else {
              if (oidx === q.answerIndex) optionClass += " border-green-500 bg-green-50";
              else if (checked && oidx !== q.answerIndex) optionClass += " border-red-500 bg-red-50";
              else optionClass += " border-slate-200 bg-white";
            }

            return (
              <button
                key={opt}
                type="button"
                className={optionClass}
                onClick={() => chooseQuizAnswer(q.id, oidx)}
                disabled={!quizRunning || locked}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + oidx)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
        {quizFinished && (
          <div className="mt-3 text-sm text-slate-700">
            <span className="font-semibold">Explanation:</span> {q.explanation}
          </div>
        )}
      </div>
    );
  };

  const jumpTo = (index) => {
    const safe = Math.max(0, Math.min(index, quizQuestions.length - 1));
    setCurrentIndex(safe);
    setReviewMode(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          Professional EEG Standards & Guidelines
        </h1>
        <p className="text-sm text-slate-700 max-w-3xl">
          (ACNS · ABRET · ASET · National Standards) — Learn what "perform EEG according to standards"
          means in practical, ABRET-relevant terms.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            to="/workflow"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50"
          >
            ↗ Workflow & Patient Care
          </Link>
          <Link
            to="/patterns"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50"
          >
            ↗ EEG Pattern Library
          </Link>
        </div>
        {/* Mode Switch */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => setMode("study")}
            className={[
              "px-3 py-2 rounded-md text-sm border",
              mode === "study"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-slate-300 hover:bg-slate-50",
            ].join(" ")}
          >
            Study Mode
          </button>
          <button
            type="button"
            onClick={() => setMode("quiz")}
            className={[
              "px-3 py-2 rounded-md text-sm border",
              mode === "quiz"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white border-slate-300 hover:bg-slate-50",
            ].join(" ")}
          >
            Quiz Mode (Mock Test)
          </button>
        </div>
      </div>

      {/* Standards Content with Drawers */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          <p className="text-sm text-slate-700">
            Electroencephalography (EEG) must be performed according to established professional standards
            to ensure <span className="font-semibold">diagnostic accuracy</span>,{" "}
            <span className="font-semibold">patient safety</span>, and{" "}
            <span className="font-semibold">ethical clinical practice</span>.
            These standards are defined by recognized professional organizations such as the{" "}
            <span className="font-semibold">American Clinical Neurophysiology Society (ACNS)</span>,{" "}
            <span className="font-semibold">ABRET</span>, <span className="font-semibold">ASET</span>,
            or equivalent national neurophysiology guidelines.
          </p>
          <p className="text-sm text-slate-700">
            Adherence to these standards is a fundamental responsibility of the EEG technologist and a core requirement for{" "}
            <span className="font-semibold">ABRET certification</span>.
          </p>
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Governing Organizations and Their Roles</h2>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">American Clinical Neurophysiology Society (ACNS)</h3>
            <p className="text-sm text-slate-700">
              ACNS establishes <span className="font-semibold">technical and procedural standards</span> for EEG acquisition
              and interpretation from a physician and laboratory perspective. ACNS guidelines define minimum technical requirements,
              electrode placement standards, recording duration, filter/sensitivity settings, montage selection, and protocols for
              special studies (e.g., electrocerebral inactivity, neonatal EEG, ICU EEG).
            </p>
            <button
              onClick={() => toggleDrawer("acns-detail")}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              {openDrawers["acns-detail"] ? "Hide" : "Learn more"} →
            </button>
            {openDrawers["acns-detail"] && (
              <div className="mt-2 p-3 bg-slate-50 rounded-md text-xs text-slate-700">
                <p className="mb-2">
                  <span className="font-semibold">Key ACNS Guidelines:</span> ACNS Guideline 1 covers routine EEG minimums,
                  Guideline 6 covers electrocerebral inactivity protocols, and various guidelines address neonatal, ICU,
                  and continuous EEG monitoring standards.
                </p>
                <p>
                  ACNS standards are considered the "gold standard" for technical EEG performance and are frequently
                  referenced in ABRET exam questions.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">ABRET</h3>
            <p className="text-sm text-slate-700">
              ABRET defines the <span className="font-semibold">scope of practice</span>, <span className="font-semibold">competency requirements</span>,
              and <span className="font-semibold">ethical standards</span> for EEG technologists. It emphasizes patient care and safety,
              history taking, documentation, proper recording techniques, professionalism, and effective clinical communication.
            </p>
            <button
              onClick={() => toggleDrawer("abret-detail")}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              {openDrawers["abret-detail"] ? "Hide" : "Learn more"} →
            </button>
            {openDrawers["abret-detail"] && (
              <div className="mt-2 p-3 bg-slate-50 rounded-md text-xs text-slate-700">
                <p className="mb-2">
                  <span className="font-semibold">ABRET Certification:</span> The R. EEG T. (Registered EEG Technologist)
                  exam tests competencies across four domains: Pre-Study (15%), Performing EEG (46%), Post-Study (19%),
                  and Ethics (20%).
                </p>
                <p>
                  ABRET emphasizes practical skills, safety, documentation, and professional ethics. The exam blueprint
                  is available on abret.org.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">ASET</h3>
            <p className="text-sm text-slate-700">
              ASET provides <span className="font-semibold">best-practice recommendations</span> and professional guidance for daily EEG laboratory
              operations, continuing education, lab procedures, and quality improvement in electroneurodiagnostics.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">National and International Standards</h3>
            <p className="text-sm text-slate-700">
              Outside the U.S., EEG practice follows national society guidelines, ministry regulations, and institutional protocols.
              Most national standards mirror ACNS technical principles, making ACNS-style knowledge widely applicable.
            </p>
          </div>
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Core Technical Standards for EEG Performance</h2>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Electrode Placement</h3>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>Apply electrodes using the <span className="font-semibold">International 10–20 System</span>.</li>
              <li>Measure accurately (avoid estimation).</li>
              <li>Maintain acceptable impedances per lab policy.</li>
              <li>Document any deviations or modified placements clearly for the interpreter.</li>
              <li>Use additional electrodes when clinically indicated (e.g., extra temporal coverage).</li>
            </ul>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">ABRET key point:</span> Incorrect electrode placement can make an EEG technically inadequate.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Minimum Number of Electrodes</h3>
            <p className="text-sm text-slate-700">
              A standard EEG typically requires a minimum of <span className="font-semibold">21 electrodes</span> (including scalp, reference, and ground).
              Additional channels (ECG/EKG, EMG, respiration, video) may be added when appropriate.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Recording Duration</h3>
            <p className="text-sm text-slate-700">
              Routine EEG should include a minimum of <span className="font-semibold">20–30 minutes of artifact-free recording</span>.
              Longer recordings may be required for sleep/sleep-deprived studies, pediatrics, ICU/cEEG, or when seizure capture is needed.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Montage Selection</h3>
            <p className="text-sm text-slate-700">
              Use multiple montage types (referential and bipolar—longitudinal and transverse). Different montages improve detection and localization,
              and some abnormalities are clearer in specific montage configurations.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Filter and Sensitivity Settings</h3>
            <p className="text-sm text-slate-700">
              Typical starting settings include sensitivity around <span className="font-semibold">~7 µV/mm</span> (or digital equivalent),
              low-frequency filter <span className="font-semibold">~0.1–0.3 Hz</span>, high-frequency filter <span className="font-semibold">~35–70 Hz</span>.
              Notch filter (50/60 Hz) should be used only when needed because filters can distort diagnostically important EEG features.
            </p>
            <button
              onClick={() => toggleDrawer("filters-detail")}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              {openDrawers["filters-detail"] ? "Hide" : "Learn more about filters"} →
            </button>
            {openDrawers["filters-detail"] && (
              <div className="mt-2 p-3 bg-slate-50 rounded-md text-xs text-slate-700 space-y-2">
                <p>
                  <span className="font-semibold">Low-Frequency Filter (LFF):</span> Also called high-pass filter.
                  Too high (e.g., &gt;1 Hz) can attenuate slow waves and mask diffuse slowing. Typical: 0.1-0.3 Hz.
                </p>
                <p>
                  <span className="font-semibold">High-Frequency Filter (HFF):</span> Also called low-pass filter.
                  Too low can attenuate fast activity and spikes. Typical: 35-70 Hz.
                </p>
                <p>
                  <span className="font-semibold">Notch Filter:</span> Removes 50/60 Hz line noise but can distort
                  waveforms. Use only when necessary; address artifact source when possible.
                </p>
              </div>
            )}
          </div>
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Activation Procedures</h2>
          <p className="text-sm text-slate-700">
            Activation procedures should be performed unless contraindicated and must be documented. Standard activation includes:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            <li>Eye opening and eye closure</li>
            <li>Hyperventilation (typically 3 minutes)</li>
            <li>Photic stimulation</li>
            <li>Sleep or sleep deprivation (when ordered)</li>
          </ul>
          <p className="text-sm text-slate-700">
            If an activation procedure is omitted, the reason (e.g., contraindication, limited cooperation) should be clearly documented.
          </p>
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Annotation and Documentation Standards</h2>
          <p className="text-sm text-slate-700">
            Accurate documentation is essential for reliable interpretation. The technologist should document:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            <li>Instrument settings (if not automatically recorded)</li>
            <li>Patient state and level of consciousness</li>
            <li>Observed behaviors and clinical events</li>
            <li>Artifacts and their sources</li>
            <li>Seizures and patient responses during events</li>
            <li>Deviations from protocols and reasons for omission of activations</li>
            <li>Technologist observations relevant to interpretation</li>
          </ul>
          <p className="text-sm text-slate-700">
            Incomplete annotation reduces diagnostic value and may be considered a technical deficiency.
          </p>
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Calibration</h2>
          <p className="text-sm text-slate-700">
            Digital systems still require calibration checks to verify instrument integrity and biological calibration.
            Calibration ensures baseline accuracy, helps troubleshoot issues, and verifies impedance/sensitivity settings.
          </p>
          <button
            onClick={() => toggleDrawer("calibration-detail")}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            {openDrawers["calibration-detail"] ? "Hide" : "Learn more about calibration"} →
          </button>
          {openDrawers["calibration-detail"] && (
            <div className="mt-2 p-3 bg-slate-50 rounded-md text-xs text-slate-700 space-y-2">
              <p>
                <span className="font-semibold">Instrument Calibration:</span> Verifies amplifier function, filter settings,
                and channel integrity. Should be performed per lab policy (typically daily or per patient).
              </p>
              <p>
                <span className="font-semibold">Biological Calibration:</span> Uses known voltage source (e.g., 50 µV square wave)
                to verify sensitivity settings and ensure accurate amplitude measurement.
              </p>
              <p>
                <span className="font-semibold">When It Matters:</span> Baseline integrity verification, troubleshooting
                artifacts, confirming impedance/sensitivity accuracy, and ensuring diagnostic quality.
              </p>
            </div>
          )}
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Infection Prevention & Electrode Disinfection</h2>
          <p className="text-sm text-slate-700">
            Follow ASET infection prevention guidelines and lab policies for electrode disinfection and equipment hygiene.
          </p>
          <button
            onClick={() => toggleDrawer("infection-detail")}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            {openDrawers["infection-detail"] ? "Hide" : "Learn more about infection control"} →
          </button>
          {openDrawers["infection-detail"] && (
            <div className="mt-2 p-3 bg-slate-50 rounded-md text-xs text-slate-700 space-y-2">
              <p>
                <span className="font-semibold">ASET Guidelines:</span> Provide specific recommendations for electrode
                disinfection, equipment cleaning, and infection prevention in EEG labs.
              </p>
              <p>
                <span className="font-semibold">Key Practices:</span> Disinfect electrodes between patients per lab policy,
                follow WHO/CDC guidelines, handle contaminated materials safely, maintain equipment hygiene, and observe
                body fluid precautions.
              </p>
              <p>
                <span className="font-semibold">ABRET Focus:</span> Infection control is part of Domain IV (Ethics & Professional Issues)
                and is frequently tested indirectly through safety questions.
              </p>
            </div>
          )}
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Patient Safety and Ethical Practice</h2>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            <li>Verify patient identity</li>
            <li>Obtain informed consent</li>
            <li>Maintain confidentiality and privacy</li>
            <li>Follow infection control protocols</li>
            <li>Observe electrical safety precautions</li>
            <li>Recognize and respond to emergencies within scope (BLS/CPR as trained)</li>
            <li>Respect the patient's right to refuse testing</li>
          </ul>
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Special EEG Protocols</h2>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            <li>Electrocerebral inactivity (brain death EEG)</li>
            <li>Neonatal EEG</li>
            <li>Pediatric EEG</li>
            <li>ICU and continuous EEG monitoring</li>
            <li>EEG in coma and severe encephalopathy</li>
          </ul>
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">ABRET Examination Pearls</h2>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            <li>A normal EEG does not exclude epilepsy.</li>
            <li>A technically normal recording can still be clinically abnormal.</li>
            <li>Omitting activation procedures without documenting why is a technical deficiency.</li>
            <li>Poor electrode placement and poor annotation can invalidate the diagnostic usefulness of a study.</li>
            <li>Safety and ethics are frequently tested indirectly.</li>
          </ul>
        </div>

        <hr className="border-slate-200" />

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Conclusion</h2>
          <p className="text-sm text-slate-700">
            Performing EEG according to recognized professional standards ensures reliable results, protects patient safety,
            and upholds the integrity of clinical neurophysiology practice. Mastery of ACNS/ABRET/ASET-style principles is essential
            for clinical excellence and ABRET certification success.
          </p>
        </div>
      </div>

      {/* Study Mode */}
      {mode === "study" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Self-Check (Study Mode)</h2>
              <p className="text-xs text-slate-600">
                Choose an answer then click "Check Answer" to reveal explanation.
              </p>
            </div>
            <button
              onClick={resetStudy}
              className="text-sm rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-50"
              type="button"
            >
              Reset Study Answers
            </button>
          </div>
          <div className="space-y-4">{questionBank.map((q) => renderStudyQuestion(q))}</div>
        </div>
      )}

      {/* Quiz Mode */}
      {mode === "quiz" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          {/* Quiz Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Quiz Mode (ABRET Mock Test)</h2>
              <p className="text-xs text-slate-600">
                One question at a time + flagging + timed test + weak topics + best score saved.
              </p>
              {bestScore && (
                <p className="text-xs text-slate-600 mt-1">
                  Best score: <span className="font-semibold">{bestScore.percent}%</span>{" "}
                  ({bestScore.correct}/{bestScore.total})
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {!quizRunning && !quizFinished && (
                <button
                  type="button"
                  onClick={startQuiz}
                  className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
                >
                  Start Quiz
                </button>
              )}
              {quizRunning && (
                <>
                  <button
                    type="button"
                    onClick={() => setReviewMode(true)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Review Panel
                  </button>
                  <button
                    type="button"
                    onClick={submitQuiz}
                    className="rounded-md bg-green-600 text-white px-3 py-2 text-sm hover:bg-green-700"
                  >
                    Submit Quiz
                  </button>
                </>
              )}
              {(quizFinished || quizRunning) && (
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Quiz Setup */}
          {!quizRunning && !quizFinished && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={filteredBank.length || questionBank.length}
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Available in selected topics: {filteredBank.length}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Time (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={quizMinutes}
                    onChange={(e) => setQuizMinutes(Number(e.target.value))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Topic Selection (optional)
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="text-xs rounded-full border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50"
                    onClick={() => setSelectedTopics(new Set())}
                  >
                    Use ALL topics
                  </button>
                  <button
                    type="button"
                    className="text-xs rounded-full border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50"
                    onClick={() => setSelectedTopics(new Set(allTopics))}
                  >
                    Select ALL
                  </button>
                  <button
                    type="button"
                    className="text-xs rounded-full border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50"
                    onClick={() => setSelectedTopics(new Set())}
                  >
                    Clear Selection
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allTopics.map((t) => {
                    const isOn = selectedTopics.size === 0 ? true : selectedTopics.has(t);
                    const explicitlySelected = selectedTopics.has(t);
                    return (
                      <label key={t} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedTopics.size === 0 ? true : explicitlySelected}
                          onChange={(e) => {
                            setSelectedTopics((prev) => {
                              const next = new Set(prev);
                              if (prev.size === 0) {
                                allTopics.forEach((x) => next.add(x));
                              }
                              if (e.target.checked) next.add(t);
                              else next.delete(t);
                              return next;
                            });
                          }}
                        />
                        <span className="text-xs rounded-full bg-white border border-slate-200 px-2 py-1">
                          {topicLabels[t] || t}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isOn ? "" : "(off)"}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Tip: Use topic selection to drill weak areas (filters, montages, safety, documentation).
                </p>
              </div>
            </div>
          )}

          {/* Timer + Progress */}
          {(quizRunning || quizFinished) && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-sm text-slate-800">
                <span className="font-semibold">Time:</span>{" "}
                <span className={secondsLeft <= 30 ? "text-red-700 font-semibold" : ""}>
                  {formatTime(secondsLeft)}
                </span>
              </div>
              <div className="text-sm text-slate-800">
                <span className="font-semibold">Answered:</span>{" "}
                {Object.keys(quizAnswers).length} / {quizQuestions.length}
              </div>
              <div className="text-sm text-slate-800">
                <span className="font-semibold">Flagged:</span>{" "}
                {quizFlags.size}
              </div>
            </div>
          )}

          {/* Review Panel */}
          {quizRunning && reviewMode && (
            <div className="rounded-lg border border-slate-200 p-4 bg-white space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">Review Panel</div>
                <button
                  type="button"
                  className="text-sm rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-50"
                  onClick={() => setReviewMode(false)}
                >
                  Close
                </button>
              </div>
              <div className="text-xs text-slate-600">
                Jump to flagged or unanswered questions before submitting.
              </div>
              <div className="flex flex-wrap gap-2">
                {quizQuestions.map((q, i) => {
                  const isFlagged = quizFlags.has(q.id);
                  const isUnanswered = unansweredIds.has(q.id);
                  const chipClass = [
                    "text-xs rounded-md border px-3 py-2",
                    isFlagged ? "border-amber-400 bg-amber-50 text-amber-900" : "border-slate-200 bg-white",
                    isUnanswered ? "ring-1 ring-red-300" : "",
                  ].join(" ");

                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={chipClass}
                      onClick={() => jumpTo(i)}
                      title={[
                        isFlagged ? "Flagged" : "",
                        isUnanswered ? "Unanswered" : "Answered",
                      ].filter(Boolean).join(" · ")}
                    >
                      Q{i + 1}{" "}
                      {isFlagged ? "★" : ""}
                      {isUnanswered ? " •" : ""}
                    </button>
                  );
                })}
              </div>
              <div className="text-[11px] text-slate-500">
                Legend: ★ = flagged, red dot = unanswered (shown as " • ")
              </div>
            </div>
          )}

          {/* One question at a time */}
          {(quizRunning || quizFinished) && quizQuestions.length > 0 && (
            <div className="space-y-3">
              {renderQuizOne(quizQuestions[currentIndex], currentIndex)}
              <div className="flex flex-wrap gap-2 justify-between">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                >
                  ← Previous
                </button>
                <div className="flex flex-wrap gap-2">
                  {quizRunning && (
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => setReviewMode(true)}
                    >
                      Review Panel
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
                    onClick={() => setCurrentIndex((i) => Math.min(quizQuestions.length - 1, i + 1))}
                    disabled={currentIndex === quizQuestions.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {quizFinished && quizScore && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-lg font-semibold text-slate-900">
                  Score: {quizScore.correct}/{quizScore.total} ({quizScore.percent}%)
                </div>
                <div className="text-xs text-slate-600">
                  Explanations are shown under each question.
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Weak Topics (highest % wrong)</h3>
                <div className="mt-2 space-y-2">
                  {weakTopicsSorted.map((t) => (
                    <div
                      key={t.topic}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-md border border-slate-200 p-3"
                    >
                      <div className="text-sm text-slate-800">
                        <span className="font-semibold">{t.label}</span>
                        <span className="text-slate-500"> · Wrong: {t.wrong}/{t.total}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {t.pctWrong}% wrong
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-600">
                  Next study actions:
                  {" "}
                  <Link className="text-blue-600" to="/workflow">Workflow</Link>
                  {" "}
                  for patient-care + documentation, and
                  {" "}
                  <Link className="text-blue-600" to="/patterns">Patterns</Link>
                  {" "}
                  to link technique → patterns → syndromes.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Standards;
