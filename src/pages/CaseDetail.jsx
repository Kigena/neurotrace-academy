import React from "react";
import { useParams, Link } from "react-router-dom";
import casesData from "../data/cases.json";
import syndromesData from "../data/syndromes_v2.json";
import patternsData from "../data/neurotrace_patterns_library_v2.json";
import CaseRunner from "../components/CaseRunner.jsx";

function CaseDetail() {
  const { id } = useParams();
  const eegCase = casesData.starterCases?.find((c) => c.id === id);

  if (!eegCase) {
    return (
      <div>
        <p className="text-sm text-red-600">Case not found.</p>
        <Link to="/cases" className="text-sm text-blue-600">
          Back to cases
        </Link>
      </div>
    );
  }

  const getAgeDisplay = () => {
    if (eegCase.patient.ageYears < 1) {
      const months = Math.round(eegCase.patient.ageYears * 12);
      return `${months} months`;
    }
    return `${eegCase.patient.ageYears} years`;
  };

  const handleTaskAnswer = (stepId, answerIndex) => {
    setSelectedTaskAnswers((prev) => ({ ...prev, [stepId]: answerIndex }));
  };

  const handleTaskSubmit = (stepId) => {
    setSubmittedTasks((prev) => ({ ...prev, [stepId]: true }));
  };

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  return (
    <section className="space-y-4">
      <Link to="/cases" className="text-xs text-blue-600">
        ← Back to cases
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">{eegCase.title}</h1>
        {eegCase.difficulty && (
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              difficultyColors[eegCase.difficulty] || "bg-slate-100 text-slate-800"
            }`}
          >
            {eegCase.difficulty}
          </span>
        )}
      </div>

      {/* Patient Info */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Patient Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-semibold">Age:</span> {getAgeDisplay()}
          </div>
          <div>
            <span className="font-semibold">Context:</span> {eegCase.patient.context}
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold">Chief Complaint:</span>{" "}
            {eegCase.chiefComplaint}
          </div>
        </div>
      </div>

      {/* History */}
      {eegCase.history && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">History</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Event Description:</span>{" "}
              {eegCase.history.eventDescription}
            </p>
            {eegCase.history.lastEventTiming && (
              <p>
                <span className="font-semibold">Last Event:</span>{" "}
                {eegCase.history.lastEventTiming}
              </p>
            )}
            {eegCase.history.medications && eegCase.history.medications.length > 0 && (
              <p>
                <span className="font-semibold">Medications:</span>{" "}
                {eegCase.history.medications.join(", ")}
              </p>
            )}
            {eegCase.history.comorbidities && eegCase.history.comorbidities.length > 0 && (
              <p>
                <span className="font-semibold">Comorbidities:</span>{" "}
                {eegCase.history.comorbidities.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* EEG Summary */}
      {eegCase.eegSummary && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">EEG Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
            {eegCase.eegSummary.state && (
              <div>
                <span className="font-semibold">States:</span>{" "}
                {eegCase.eegSummary.state.join(", ")}
              </div>
            )}
            {eegCase.eegSummary.pdrHz && (
              <div>
                <span className="font-semibold">PDR:</span> {eegCase.eegSummary.pdrHz}
              </div>
            )}
            {eegCase.eegSummary.background && (
              <div className="sm:col-span-2">
                <span className="font-semibold">Background:</span>{" "}
                {eegCase.eegSummary.background}
              </div>
            )}
            {eegCase.eegSummary.epileptiform && (
              <div className="sm:col-span-2">
                <span className="font-semibold">Epileptiform:</span>{" "}
                {eegCase.eegSummary.epileptiform}
              </div>
            )}
            {eegCase.eegSummary.focalFindings && (
              <div className="sm:col-span-2">
                <span className="font-semibold">Focal Findings:</span>{" "}
                {eegCase.eegSummary.focalFindings}
              </div>
            )}
            {eegCase.eegSummary.activations && (
              <div className="sm:col-span-2 space-y-1">
                <span className="font-semibold">Activations:</span>
                <ul className="list-disc list-inside ml-2">
                  <li>Hyperventilation: {eegCase.eegSummary.activations.hv}</li>
                  {eegCase.eegSummary.activations.photic && (
                    <li>Photic: {eegCase.eegSummary.activations.photic}</li>
                  )}
                  {eegCase.eegSummary.activations.sleep && (
                    <li>Sleep: {eegCase.eegSummary.activations.sleep}</li>
                  )}
                </ul>
              </div>
            )}
            {eegCase.eegSummary.artifacts && (
              <div className="sm:col-span-2">
                <span className="font-semibold">Artifacts:</span>{" "}
                {eegCase.eegSummary.artifacts}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Runner - Interactive Task Flow */}
      {eegCase.taskFlow && eegCase.taskFlow.length > 0 && (
        <CaseRunner caseData={eegCase} />
      )}

      {/* Resources Panel */}
      {eegCase.resources && eegCase.resources.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Resources
          </h2>
          <div className="space-y-2">
            {eegCase.resources.map((resource, idx) => {
              if (resource.type === "pdf") {
                return (
                  <a
                    key={idx}
                    href={resource.pathOrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    {resource.label || "Wave analysis PDF"}
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Syndromes & Patterns */}
      {(eegCase.syndromeIds?.length > 0 || eegCase.patternIds?.length > 0) && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Related Syndromes & Patterns
          </h2>
          <div className="space-y-3">
            {eegCase.syndromeIds && eegCase.syndromeIds.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-700 mb-2">Syndromes:</h3>
                <div className="flex flex-wrap gap-2">
                  {eegCase.syndromeIds.map((syndromeId) => {
                    const syndrome = syndromesData.find((s) => s.id === syndromeId);
                    if (!syndrome) return null;
                    return (
                      <Link
                        key={syndromeId}
                        to={`/syndromes/${syndromeId}`}
                        className="text-xs px-3 py-1.5 rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                      >
                        {syndrome.name} →
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {eegCase.patternIds && eegCase.patternIds.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-700 mb-2">Patterns:</h3>
                <div className="flex flex-wrap gap-2">
                  {eegCase.patternIds.map((patternId) => {
                    const pattern = patternsData.find((p) => p.id === patternId);
                    if (!pattern) return null;
                    return (
                      <Link
                        key={patternId}
                        to={`/patterns/${patternId}`}
                        className="text-xs px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        {pattern.name} →
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Learning Links */}
      {eegCase.learningLinks && eegCase.learningLinks.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Related Learning Resources
          </h2>
          <div className="flex flex-wrap gap-2">
            {eegCase.learningLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.to}
                className="text-xs px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {eegCase.tags && eegCase.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {eegCase.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export default CaseDetail;
