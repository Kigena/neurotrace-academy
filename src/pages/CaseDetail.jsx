import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import casesData from "../data/cases.json";
import syndromesData from "../data/syndromes_v2.json";
import patternsData from "../data/neurotrace_patterns_library_v2.json";
import CaseRunner from "../components/CaseRunner.jsx";
import CaseDiscussion from "../components/CaseDiscussion.jsx";
import ContextualAI from "../components/ContextualAI.jsx";
import CaseAIAssistant from "../components/CaseAIAssistant.jsx";
import StudyNotesButton from "../components/StudyNotesButton.jsx";
import SimilarCasesButton from "../components/SimilarCasesButton.jsx";
import caseService from "../services/caseService";
import apiService from "../services/apiService";
import caseProgressApi, { loadCaseProgressMap } from "../services/caseProgressApi";

// --- Components ---

const CONTEXT_LABEL = { icu: "ICU", ed: "ED", nicu: "NICU", emu: "EMU" };

const StaticCaseView = ({ eegCase, onComplete, completed }) => {
  // The EEG summary names the findings the steps ask about, so it stays
  // hidden until the case has been worked through once.
  const [finished, setFinished] = useState(false);
  const showSummary = completed || finished;
  const handleComplete = (result) => {
    setFinished(true);
    return onComplete?.(result);
  };
  const getAgeDisplay = () => {
    if (eegCase.patient.ageYears < 1) {
      const months = Math.round(eegCase.patient.ageYears * 12);
      return `${months} months`;
    }
    return `${eegCase.patient.ageYears} years`;
  };

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">{eegCase.title}</h1>
        {eegCase.difficulty && (
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${difficultyColors[eegCase.difficulty] || "bg-slate-100 text-slate-800"}`}>
            {eegCase.difficulty}
          </span>
        )}
      </div>

      {/* Patient Info */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Patient Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><span className="font-semibold">Age:</span> {getAgeDisplay()}</div>
          <div><span className="font-semibold">Context:</span> {CONTEXT_LABEL[eegCase.patient.context] || eegCase.patient.context}</div>
          <div className="sm:col-span-2"><span className="font-semibold">Chief Complaint:</span> {eegCase.chiefComplaint}</div>
        </div>
      </div>

      {/* History */}
      {eegCase.history && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">History</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Event Description:</span> {eegCase.history.eventDescription}</p>
            {eegCase.history.medications?.length > 0 && <p><span className="font-semibold">Medications:</span> {eegCase.history.medications.join(", ")}</p>}
            {eegCase.history.comorbidities?.length > 0 && <p><span className="font-semibold">Comorbidities:</span> {eegCase.history.comorbidities.join(", ")}</p>}
          </div>
        </div>
      )}

      {Array.isArray(eegCase.objectives) && eegCase.objectives.length > 0 && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-2">Learning objectives</h2>
          <ul className="space-y-1 text-sm text-slate-700">
            {eegCase.objectives.map((o) => (
              <li key={o} className="flex gap-2"><span className="text-indigo-500">✓</span>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {/* EEG Summary (revealed after the steps) */}
      {eegCase.eegSummary && !showSummary && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">EEG summary</span> unlocks when you finish the steps, so it does not give away the answers.
        </div>
      )}
      {eegCase.eegSummary && showSummary && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">EEG Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
            {eegCase.eegSummary.background && <div className="sm:col-span-2"><span className="font-semibold">Background:</span> {eegCase.eegSummary.background}</div>}
            {eegCase.eegSummary.epileptiform && <div className="sm:col-span-2"><span className="font-semibold">Epileptiform:</span> {eegCase.eegSummary.epileptiform}</div>}
          </div>
        </div>
      )}

      {/* Interactive Runner */}
      {eegCase.taskFlow && eegCase.taskFlow.length > 0 && (
        <CaseRunner caseData={eegCase} onComplete={handleComplete} />
      )}

      {/* Tags */}
      {eegCase.tags && (
        <div className="flex flex-wrap gap-1 mt-4">
          {eegCase.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{tag}</span>)}
        </div>
      )}
    </div>
  );
};

const CommunityCaseView = ({ eegCase, setEegCase, onComplete, completed }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = user && (user.id === eegCase.author?._id || user.role === 'admin');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Community Case</span>
            <span className="text-xs text-slate-500">
              Posted by {eegCase.author?.name || 'Anonymous'} on {new Date(eegCase.createdAt).toLocaleDateString()}
            </span>
          </div>
          {canEdit && (
            <button
              onClick={() => navigate(`/cases/${eegCase._id}/edit`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{eegCase.title}</h1>
          {!completed && onComplete && (
            <button
              onClick={() => onComplete({ correct: 0, total: 0 })}
              className="rounded-md border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              ✓ Mark as completed
            </button>
          )}
        </div>
      </div>

      {/* Patient Context */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span>🏥</span>
          Patient Context
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Demographics</h3>
            <p className="text-slate-900">
              {eegCase.patientInfo?.age} {eegCase.patientInfo?.ageUnit}, {eegCase.patientInfo?.gender}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Medications</h3>
            <div className="flex flex-wrap gap-1">
              {eegCase.medications?.length > 0 ? eegCase.medications.map((med, i) => (
                <span key={i} className="bg-slate-100 px-2 py-1 rounded text-sm text-slate-700">{med}</span>
              )) : <span className="text-slate-400 italic">None reported</span>}
            </div>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">History (HPI)</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{eegCase.history}</p>
          </div>
        </div>
      </div>

      {/* EEG Findings */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span>🧠</span>
          EEG Findings
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Background</h3>
            <p className="text-slate-600">{eegCase.findings?.background || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Interictal</h3>
            <p className="text-slate-600">{eegCase.findings?.interictal || 'None'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Ictal</h3>
            <p className="text-slate-600">{eegCase.findings?.ictal || 'None observed'}</p>
          </div>
        </div>
      </div>

      {/* Attachments */}
      {eegCase.attachments?.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span>📎</span>
            Attachments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eegCase.attachments.map((att, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                {att.type === 'image' ? (
                  <div className="relative group">
                    <img
                      src={att.url.startsWith('http') ? att.url : `${apiService.getBaseUrl()}${att.url}`}
                      alt={att.filename}
                      className="w-full h-auto object-contain bg-slate-50 max-h-[400px]"
                      onError={(e) => {
                        console.error('Image failed to load:', att.url);
                        console.log('Constructed URL:', e.target.src);
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-3 bg-slate-50">
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium truncate">
                      {att.filename}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {eegCase.tags && (
        <div className="flex flex-wrap gap-2">
          {eegCase.tags.map(tag => (
            <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600">#{tag}</span>
          ))}
        </div>
      )}

      {/* AI Assistant Panel */}
      <CaseAIAssistant 
        caseId={eegCase._id} 
        caseData={eegCase} 
      />

      {/* Study Notes Button */}
      <StudyNotesButton 
        pageTitle={eegCase.title}
        caseId={eegCase._id}
      />

      {/* Similar Cases */}
      <SimilarCasesButton 
        currentCaseId={eegCase._id}
        currentCaseTitle={eegCase.title}
      />

      {/* Discussion Section */}
      <CaseDiscussion
        caseId={eegCase._id}
        comments={eegCase.comments || []}
        onCommentAdded={(updatedComments) => {
          // Update with full comment list (includes AI responses)
          setEegCase(prev => ({
            ...prev,
            comments: Array.isArray(updatedComments) ? updatedComments : [...(prev.comments || []), updatedComments]
          }));
        }}
      />
    </div>
  );
}

/** Shown when the signed-in user has completed this case before. */
function CaseCompletionBanner({ progress }) {
  if (!progress) return null;
  const hasScore = progress.lastTotal > 0;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
      <span className="font-semibold">✓ Completed</span>
      <span className="text-emerald-800">
        {new Date(progress.firstCompletedAt).toLocaleDateString()}
        {hasScore && ` · last score ${progress.lastCorrect}/${progress.lastTotal}, best ${progress.bestCorrect}/${progress.lastTotal}`}
        {progress.completions > 1 && ` · ${progress.completions} times`}
      </span>
    </div>
  );
}

// --- Main Container ---

function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eegCase, setEegCase] = useState(null);
  const [caseType, setCaseType] = useState(null); // 'static' or 'community'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadCaseProgressMap().then((map) => {
      if (!cancelled) setProgress(map[id] || null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const recordCompletion = async ({ correct, total }) => {
    try {
      const saved = await caseProgressApi.complete(id, { correct, total, title: eegCase?.title || "" });
      setProgress(saved);
    } catch (err) {
      console.error("Could not save case progress:", err);
    }
  };

  useEffect(() => {
    const loadCase = async () => {
      setLoading(true);
      setError(null);

      // 1. Check Static Cases First
      const staticCase = casesData.starterCases?.find((c) => c.id === id);
      if (staticCase) {
        setEegCase(staticCase);
        setCaseType("static");
        setLoading(false);
        return;
      }

      // 2. Fetch from API
      try {
        const dynamicCase = await caseService.getCaseById(id);
        setEegCase(dynamicCase);
        setCaseType("community");
      } catch (err) {
        console.error("Error fetching case:", err);
        setError("Case not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCase();
    }
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (error || !eegCase) {
    return (
      <div>
        <p className="text-sm text-red-600 mb-4">Case not found.</p>
        <Link to="/cases" className="text-sm text-blue-600 hover:underline">
          ← Back to cases
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="space-y-4 max-w-4xl mx-auto pb-12">
        <Link to="/cases" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
          <span>←</span> Back to cases
        </Link>

        <CaseCompletionBanner progress={progress} />

        {caseType === 'static' ? (
          <StaticCaseView eegCase={eegCase} onComplete={recordCompletion} completed={!!progress} />
        ) : (
          <CommunityCaseView eegCase={eegCase} setEegCase={setEegCase} onComplete={recordCompletion} completed={!!progress} />
        )}
      </section>

      {/* Contextual AI Assistant */}
      <ContextualAI
        context={{
          page: 'case-detail',
          caseData: eegCase
        }}
      />
    </>
  );
}

export default CaseDetail;
