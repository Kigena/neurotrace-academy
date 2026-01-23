import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import syndromesV2Data from "../data/syndromes_v2.json";
import syndromesData from "../data/syndromes.json";
import patternsV2Data from "../data/neurotrace_patterns_library_v2.json";

function SyndromeDetail() {
  const { id } = useParams();

  // Try v2 first, then fall back to v1
  let syndrome = syndromesV2Data.find((s) => s.id === id);
  
  if (!syndrome) {
    const v1Syndrome = syndromesData.find((s) => s.id === id);
    if (!v1Syndrome) {
      return (
        <section className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">Syndrome not found.</p>
            <Link to="/syndromes" className="text-sm text-blue-600 hover:underline">
              ← Back to syndromes
            </Link>
          </div>
        </section>
      );
    }
    // Convert v1 to v2-like format
    syndrome = {
      ...v1Syndrome,
      classification: "Unknown",
      age_range: "",
      morphology: {},
      diagnostic_yield_enhancement: {},
      clinical_course: {},
      abret_pearls: [],
      differential_diagnosis: []
    };
  }

  const [activeTab, setActiveTab] = useState("overview");

  const getPattern = (patternId) => {
    return patternsV2Data.find(p => p.id === patternId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/syndromes" className="text-xs text-blue-600 hover:underline mb-2 inline-block">
          ← Back to syndromes
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{syndrome.name}</h1>
          <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {syndrome.classification}
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Age: {syndrome.age_range || syndrome.age_group?.join(", ")}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4 overflow-x-auto">
          {["overview", "morphology", "diagnostic-yield", "clinical", "course"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "morphology" && "EEG Morphology"}
              {tab === "diagnostic-yield" && "Diagnostic Yield"}
              {tab === "clinical" && "Clinical Features"}
              {tab === "course" && "Clinical Course"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Syndrome Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">Classification:</span>
                  <span className="ml-2 text-slate-900">{syndrome.classification}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Age Range:</span>
                  <span className="ml-2 text-slate-900">{syndrome.age_range || syndrome.age_group?.join(", ")}</span>
                </div>
              </div>
            </div>

            {syndrome.typical_patterns && syndrome.typical_patterns.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Typical EEG Patterns</h3>
                <div className="space-y-2">
                  {syndrome.typical_patterns.map((patternId) => {
                    const pattern = getPattern(patternId);
                    return (
                      <div key={patternId} className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-slate-50">
                        <div>
                          <Link
                            to={`/patterns/${patternId}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {pattern?.name || patternId}
                          </Link>
                          {pattern?.frequency_hz && (
                            <span className="ml-2 text-xs text-slate-600">
                              ({pattern.frequency_hz} Hz)
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/patterns/${patternId}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Pattern →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {syndrome.abret_pearls && syndrome.abret_pearls.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">⚠️ ABRET Exam Pearls</h3>
                <div className="space-y-2">
                  {syndrome.abret_pearls.map((pearl, idx) => (
                    <div key={idx} className="rounded-lg border-2 border-blue-300 bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">{pearl}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Morphology */}
        {activeTab === "morphology" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">EEG Morphology</h2>
            {syndrome.morphology && Object.keys(syndrome.morphology).length > 0 ? (
              <div className="space-y-4">
                {syndrome.morphology.interictal && (
                  <div>
                    <span className="font-semibold text-slate-700">Interictal:</span>
                    <p className="text-sm text-slate-900 mt-1">{syndrome.morphology.interictal}</p>
                  </div>
                )}
                {syndrome.morphology.ictal && (
                  <div>
                    <span className="font-semibold text-slate-700">Ictal:</span>
                    <p className="text-sm text-slate-900 mt-1">{syndrome.morphology.ictal}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {syndrome.morphology.frequency && (
                    <div>
                      <span className="font-semibold text-slate-700">Frequency:</span>
                      <span className="ml-2 text-slate-900">{syndrome.morphology.frequency}</span>
                    </div>
                  )}
                  {syndrome.morphology.amplitude && (
                    <div>
                      <span className="font-semibold text-slate-700">Amplitude:</span>
                      <span className="ml-2 text-slate-900">{syndrome.morphology.amplitude}</span>
                    </div>
                  )}
                  {syndrome.morphology.distribution && (
                    <div>
                      <span className="font-semibold text-slate-700">Distribution:</span>
                      <span className="ml-2 text-slate-900">{syndrome.morphology.distribution}</span>
                    </div>
                  )}
                  {syndrome.morphology.duration && (
                    <div>
                      <span className="font-semibold text-slate-700">Duration:</span>
                      <span className="ml-2 text-slate-900">{syndrome.morphology.duration}</span>
                    </div>
                  )}
                </div>

                {/* Morphology Images - Support multiple images like SREDA */}
                {((syndrome.morphology.images && syndrome.morphology.images.length > 0) || syndrome.morphology.image) && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      {(syndrome.morphology.images && syndrome.morphology.images.length > 1) ? "EEG Examples" : "EEG Example"}
                    </h3>
                    <div className="space-y-4">
                      {/* Multiple images */}
                      {syndrome.morphology.images && syndrome.morphology.images.length > 0 ? (
                        syndrome.morphology.images.map((imgSrc, idx) => (
                          <div key={idx} className="rounded-md border border-slate-300 bg-slate-50 p-4 overflow-x-auto">
                            <img
                              src={imgSrc}
                              alt={`EEG example ${idx + 1} showing ${syndrome.name}`}
                              className="w-full max-w-4xl mx-auto rounded border border-slate-200 shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <p className="text-xs text-slate-600 mt-2 italic text-center">
                              {syndrome.name} - Example {idx + 1}
                            </p>
                          </div>
                        ))
                      ) : (
                        /* Single image */
                        syndrome.morphology.image && (
                          <div className="rounded-md border border-slate-300 bg-slate-50 p-4 overflow-x-auto">
                            <img
                              src={syndrome.morphology.image}
                              alt={`EEG example showing ${syndrome.name}`}
                              className="w-full max-w-4xl mx-auto rounded border border-slate-200 shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <p className="text-xs text-slate-600 mt-2 italic text-center">
                              {syndrome.name} - EEG Morphology
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600">Morphological details not available.</p>
            )}
          </div>
        )}

        {/* Diagnostic Yield */}
        {activeTab === "diagnostic-yield" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Diagnostic Yield Enhancement</h2>
            {syndrome.diagnostic_yield_enhancement && Object.keys(syndrome.diagnostic_yield_enhancement).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(syndrome.diagnostic_yield_enhancement)
                  .filter(([key]) => key !== "recording_duration" && key !== "montage" && key !== "video_recording" && key !== "special_notes")
                  .map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-slate-900 capitalize">
                          {key.replace(/_/g, " ")}
                        </h3>
                        {value.effectiveness && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            {value.effectiveness}
                          </span>
                        )}
                      </div>
                      {value.protocol && (
                        <p className="text-xs text-slate-700 mb-1">
                          <span className="font-medium">Protocol:</span> {value.protocol}
                        </p>
                      )}
                      {value.notes && (
                        <p className="text-xs text-slate-600">{value.notes}</p>
                      )}
                    </div>
                  ))}
                
                {syndrome.diagnostic_yield_enhancement.recording_duration && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Recording Duration</h3>
                    <p className="text-xs text-slate-700">
                      <span className="font-medium">Recommended:</span> {syndrome.diagnostic_yield_enhancement.recording_duration.recommended}
                    </p>
                    {syndrome.diagnostic_yield_enhancement.recording_duration.notes && (
                      <p className="text-xs text-slate-600 mt-1">
                        {syndrome.diagnostic_yield_enhancement.recording_duration.notes}
                      </p>
                    )}
                  </div>
                )}

                {syndrome.diagnostic_yield_enhancement.montage && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Montage Recommendations</h3>
                    <p className="text-xs text-slate-700">
                      <span className="font-medium">Recommended:</span> {syndrome.diagnostic_yield_enhancement.montage.recommended}
                    </p>
                    {syndrome.diagnostic_yield_enhancement.montage.notes && (
                      <p className="text-xs text-slate-600 mt-1">
                        {syndrome.diagnostic_yield_enhancement.montage.notes}
                      </p>
                    )}
                  </div>
                )}

                {syndrome.diagnostic_yield_enhancement.special_notes && (
                  <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
                    <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Special Notes</h3>
                    <p className="text-xs text-yellow-800">{syndrome.diagnostic_yield_enhancement.special_notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600">Diagnostic yield enhancement information not available.</p>
            )}
          </div>
        )}

        {/* Clinical Features */}
        {activeTab === "clinical" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Clinical Features</h2>
            {syndrome.clinical_features ? (
              <div className="space-y-4">
                {syndrome.clinical_features.seizure_type && (
                  <div>
                    <span className="font-semibold text-slate-700">Seizure Type:</span>
                    <p className="text-sm text-slate-900 mt-1">
                      {Array.isArray(syndrome.clinical_features.seizure_type)
                        ? syndrome.clinical_features.seizure_type.join(", ")
                        : syndrome.clinical_features.seizure_type}
                    </p>
                  </div>
                )}
                {syndrome.clinical_features.manifestation && (
                  <div>
                    <span className="font-semibold text-slate-700">Manifestation:</span>
                    <ul className="list-disc list-inside text-sm text-slate-900 mt-1 space-y-1">
                      {syndrome.clinical_features.manifestation.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {syndrome.clinical_features.triggers && (
                  <div>
                    <span className="font-semibold text-slate-700">Triggers:</span>
                    <p className="text-sm text-slate-900 mt-1">
                      {syndrome.clinical_features.triggers.join(", ")}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">Neurological Exam:</span>
                    <span className="ml-2 text-slate-900">{syndrome.clinical_features.neurological_exam || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Imaging:</span>
                    <span className="ml-2 text-slate-900">{syndrome.clinical_features.imaging || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Development:</span>
                    <span className="ml-2 text-slate-900">{syndrome.clinical_features.development || "N/A"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Clinical features not available.</p>
            )}

            {syndrome.differential_diagnosis && syndrome.differential_diagnosis.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Differential Diagnosis</h3>
                <ul className="list-disc list-inside text-sm text-slate-900 space-y-1">
                  {syndrome.differential_diagnosis.map((dd, idx) => (
                    <li key={idx}>{dd}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Clinical Course */}
        {activeTab === "course" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Clinical Course & Prognosis</h2>
            {syndrome.clinical_course && Object.keys(syndrome.clinical_course).length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {syndrome.clinical_course.onset && (
                    <div>
                      <span className="font-semibold text-slate-700">Onset:</span>
                      <span className="ml-2 text-slate-900">{syndrome.clinical_course.onset}</span>
                    </div>
                  )}
                  {syndrome.clinical_course.progression && (
                    <div>
                      <span className="font-semibold text-slate-700">Progression:</span>
                      <span className="ml-2 text-slate-900">{syndrome.clinical_course.progression}</span>
                    </div>
                  )}
                  {syndrome.clinical_course.outcome && (
                    <div>
                      <span className="font-semibold text-slate-700">Outcome:</span>
                      <span className="ml-2 text-slate-900">{syndrome.clinical_course.outcome}</span>
                    </div>
                  )}
                  {syndrome.clinical_course.prognosis && (
                    <div>
                      <span className="font-semibold text-slate-700">Prognosis:</span>
                      <span className={`ml-2 ${
                        syndrome.clinical_course.prognosis.toLowerCase().includes("excellent") || 
                        syndrome.clinical_course.prognosis.toLowerCase().includes("good")
                          ? "text-green-700 font-medium"
                          : syndrome.clinical_course.prognosis.toLowerCase().includes("poor")
                          ? "text-red-700 font-medium"
                          : "text-slate-900"
                      }`}>
                        {syndrome.clinical_course.prognosis}
                      </span>
                    </div>
                  )}
                </div>
                {syndrome.clinical_course.treatment && (
                  <div>
                    <span className="font-semibold text-slate-700">Treatment:</span>
                    <p className="text-sm text-slate-900 mt-1">{syndrome.clinical_course.treatment}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600">Clinical course information not available.</p>
            )}

            {/* Related Syndromes */}
            {syndrome.related_syndromes && syndrome.related_syndromes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Related Syndromes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {syndrome.related_syndromes.map((relatedId) => {
                    const relatedSyndrome = syndromesV2Data.find(s => s.id === relatedId) || 
                                           syndromesData.find(s => s.id === relatedId);
                    if (!relatedSyndrome) return null;
                    return (
                      <Link
                        key={relatedId}
                        to={`/syndromes/${relatedId}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <h4 className="text-sm font-medium text-slate-900">{relatedSyndrome.name}</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {relatedSyndrome.age_range || relatedSyndrome.age_group?.join(", ")}
                        </p>
                        <span className="text-xs text-blue-600 mt-2 inline-block">View Details →</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related Learning / Cross-Links */}
            {syndrome.cross_links && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Related Learning</h3>
                <div className="space-y-3">
                  {syndrome.cross_links.workflow_sections && syndrome.cross_links.workflow_sections.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Workflow Sections</h4>
                      <div className="flex flex-wrap gap-2">
                        {syndrome.cross_links.workflow_sections.map((section, idx) => (
                          <Link
                            key={idx}
                            to="/workflow"
                            className="px-3 py-1.5 text-xs rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            {section.replace(/-/g, " ")}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {syndrome.cross_links.quiz_tags && syndrome.cross_links.quiz_tags.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2">Practice Questions</h4>
                      <Link
                        to={`/quiz/session?tags=${syndrome.cross_links.quiz_tags.join(",")}&questions=30&mode=practice`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-green-500 bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Start IGE Quiz ({syndrome.cross_links.quiz_tags.length} tags)
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SyndromeDetail;

