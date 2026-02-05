import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import casesData from "../data/cases.json";
import syndromesData from "../data/syndromes_v2.json";
import patternsData from "../data/neurotrace_patterns_library_v2.json";
import CaseRunner from "../components/CaseRunner.jsx";
import CaseDiscussion from "../components/CaseDiscussion.jsx";
import ContextualAI from "../components/ContextualAI.jsx";
import caseService from "../services/caseService";
import apiService from "../services/apiService";

// --- Components ---

const StaticCaseView = ({ eegCase }) => {
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
          <div><span className="font-semibold">Context:</span> {eegCase.patient.context}</div>
          <div className="sm:col-span-2"><span className="font-semibold">Chief Complaint:</span> {eegCase.chiefComplaint}</div>
        </div>
      </div>

      {/* History */}
      {eegCase.history && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">History</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Event Description:</span> {eegCase.history.eventDescription}</p>
            {eegCase.history.medications && <p><span className="font-semibold">Medications:</span> {eegCase.history.medications.join(", ")}</p>}
            {eegCase.history.comorbidities && <p><span className="font-semibold">Comorbidities:</span> {eegCase.history.comorbidities.join(", ")}</p>}
          </div>
        </div>
      )}

      {/* EEG Summary */}
      {eegCase.eegSummary && (
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
        <CaseRunner caseData={eegCase} />
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

const CommunityCaseView = ({ eegCase, setEegCase }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Community Case</span>
          <span className="text-xs text-slate-500">
            Posted by {eegCase.author?.name || 'Anonymous'} on {new Date(eegCase.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{eegCase.title}</h1>
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

// --- Main Container ---

function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eegCase, setEegCase] = useState(null);
  const [caseType, setCaseType] = useState(null); // 'static' or 'community'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        {caseType === 'static' ? (
          <StaticCaseView eegCase={eegCase} />
        ) : (
          <CommunityCaseView eegCase={eegCase} setEegCase={setEegCase} />
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
