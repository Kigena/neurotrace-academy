import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

/**
 * CaseRunner Component
 * Renders interactive case simulation with stepper UI for taskFlow
 */
function CaseRunner({ caseData }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedSteps, setSubmittedSteps] = useState({});
  const [stepStartTimes, setStepStartTimes] = useState({});

  const taskFlow = caseData.taskFlow || [];
  const currentStep = taskFlow[currentStepIndex];

  // Initialize step start time
  React.useEffect(() => {
    if (currentStep && !stepStartTimes[currentStep.stepId]) {
      setStepStartTimes((prev) => ({
        ...prev,
        [currentStep.stepId]: Date.now(),
      }));
    }
  }, [currentStep, stepStartTimes]);

  const handleAnswer = (stepId, answerIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [stepId]: answerIndex }));
  };

  const handleSubmit = (stepId) => {
    setSubmittedSteps((prev) => ({ ...prev, [stepId]: true }));
  };

  const handleNext = () => {
    if (currentStepIndex < taskFlow.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleJumpToStep = (index) => {
    setCurrentStepIndex(index);
  };

  // Calculate case score
  const caseScore = useMemo(() => {
    let correct = 0;
    let total = 0;

    taskFlow.forEach((step) => {
      if (submittedSteps[step.stepId]) {
        total++;
        const selected = selectedAnswers[step.stepId];
        if (selected === step.answerIndex) {
          correct++;
        }
      }
    });

    const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

    return { correct, total, percent };
  }, [taskFlow, submittedSteps, selectedAnswers]);

  const isComplete = currentStepIndex === taskFlow.length - 1 && submittedSteps[currentStep?.stepId];

  if (!caseData) {
    return (
      <div className="text-center p-8">
        <p className="text-sm text-red-600">Case not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{caseData.title}</h1>
          {caseData.difficulty && (
            <span
              className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${
                caseData.difficulty === "easy"
                  ? "bg-green-100 text-green-800"
                  : caseData.difficulty === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {caseData.difficulty}
            </span>
          )}
        </div>
        {isComplete && (
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-700">
              {caseScore.percent}%
            </div>
            <div className="text-xs text-slate-600">
              {caseScore.correct} / {caseScore.total} correct
            </div>
          </div>
        )}
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between">
        {taskFlow.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isSubmitted = submittedSteps[step.stepId];
          const isCorrect = isSubmitted && selectedAnswers[step.stepId] === step.answerIndex;

          return (
            <button
              key={step.stepId}
              onClick={() => handleJumpToStep(idx)}
              className={`flex-1 mx-1 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isSubmitted
                  ? isCorrect
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Current Step */}
      {currentStep && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4">
            <div className="text-xs text-slate-500 mb-1">
              Step {currentStepIndex + 1} of {taskFlow.length}
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              {currentStep.type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </h3>
            <p className="text-sm text-slate-700">{currentStep.prompt}</p>
          </div>

          <div className="space-y-2 mb-4">
            {currentStep.options.map((option, idx) => {
              const selected = selectedAnswers[currentStep.stepId] === idx;
              const isSubmitted = submittedSteps[currentStep.stepId];
              const isCorrect = idx === currentStep.answerIndex;

              let optionClass =
                "w-full text-left rounded-md border px-4 py-3 text-sm transition";
              
              if (!isSubmitted) {
                optionClass += selected
                  ? " border-blue-400 bg-blue-50 text-blue-900 font-medium"
                  : " border-slate-200 hover:bg-slate-50";
              } else {
                if (isCorrect) {
                  optionClass += " border-green-500 bg-green-50";
                } else if (selected && !isCorrect) {
                  optionClass += " border-red-500 bg-red-50";
                } else {
                  optionClass += " border-slate-200 bg-white";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={optionClass}
                  onClick={() => handleAnswer(currentStep.stepId, idx)}
                  disabled={isSubmitted}
                >
                  <span className="font-semibold mr-2">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:bg-slate-300"
              onClick={() => handleSubmit(currentStep.stepId)}
              disabled={
                selectedAnswers[currentStep.stepId] === undefined ||
                submittedSteps[currentStep.stepId]
              }
            >
              Check Answer
            </button>

            {submittedSteps[currentStep.stepId] && (
              <div className="flex-1">
                <div
                  className={`text-sm font-semibold ${
                    selectedAnswers[currentStep.stepId] === currentStep.answerIndex
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {selectedAnswers[currentStep.stepId] === currentStep.answerIndex
                    ? "Correct"
                    : "Incorrect"}
                </div>
                {currentStep.explanation && (
                  <div className="mt-2 text-sm text-slate-700 bg-slate-50 p-3 rounded">
                    <span className="font-semibold">Explanation:</span>{" "}
                    {currentStep.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="px-4 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="text-xs text-slate-500">
          {currentStepIndex + 1} / {taskFlow.length}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentStepIndex === taskFlow.length - 1}
          className="px-4 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Case Complete */}
      {isComplete && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Case Complete!
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            You scored {caseScore.correct} out of {caseScore.total} questions ({caseScore.percent}%).
          </p>

          {caseData.learningLinks && caseData.learningLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Related Learning Resources
              </h4>
              <div className="flex flex-wrap gap-2">
                {caseData.learningLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.to}
                    className="text-xs px-3 py-1.5 rounded-md border border-blue-200 bg-white text-blue-700 hover:bg-blue-100"
                  >
                    {link.label} →
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CaseRunner;







