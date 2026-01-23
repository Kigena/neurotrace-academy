import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import patternsV2Data from "../data/neurotrace_patterns_library_v2.json";
import patternsData from "../data/patterns.json";
import workflowData from "../data/workflow-domains.json";
import { getPatternQuizTags } from "../utils/patternQuizTags";

function PatternDetail() {
  const { id } = useParams();

  // Clean up any lingering backdrop and drawer elements on mount
  useEffect(() => {
    // Remove any backdrop elements that might have persisted
    const backdrops = document.querySelectorAll('div.fixed.inset-0.bg-black');
    backdrops.forEach(backdrop => {
      backdrop.remove();
    });

    // Remove any drawer elements
    const drawers = document.querySelectorAll('div.fixed.inset-y-0.right-0');
    drawers.forEach(drawer => {
      // Only remove if it's a drawer (has bg-white and shadow-xl)
      if (drawer.classList.contains('bg-white') && drawer.classList.contains('shadow-xl')) {
        drawer.remove();
      }
    });

    // Force remove any elements with z-40 or z-50 that might be overlays
    const overlays = document.querySelectorAll('[class*="z-40"], [class*="z-50"]');
    overlays.forEach(overlay => {
      if (overlay.classList.contains('bg-black') ||
        (overlay.classList.contains('bg-white') && overlay.classList.contains('shadow-xl'))) {
        overlay.remove();
      }
    });
  }, []);

  // Try v2 first, then fall back to v1
  let pattern = patternsV2Data.find((p) => p.id === id);
  console.log("DEBUG PatternDetail:", { id, pattern, hasImage: !!pattern?.image, images: pattern?.images });

  if (!pattern) {
    const v1Pattern = patternsData.find((p) => p.id === id);
    if (!v1Pattern) {
      return (
        <section className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">Pattern not found.</p>
            <Link to="/patterns" className="text-sm text-blue-600 hover:underline">
              ← Back to patterns
            </Link>
          </div>
        </section>
      );
    }
    // Convert v1 to v2-like format
    pattern = {
      id: v1Pattern.id,
      name: v1Pattern.name,
      category: v1Pattern.category?.toUpperCase() || "NORMAL",
      topography: v1Pattern.topography || [],
      state: v1Pattern.patient_state || [],
      age_notes: v1Pattern.prevalence || "",
      morphology: v1Pattern.morphology || "",
      frequency_hz: v1Pattern.frequency || "",
      amplitude_uv: "variable",
      key_features: [],
      common_confusions: v1Pattern.commonConfusions?.map(c => ({
        pattern_id: c.patternId,
        why_confused: "",
        how_to_distinguish: c.distinguishingFeature
      })) || [],
      clinical_context: {
        seen_in: v1Pattern.patient_state || [],
        associated_with: v1Pattern.clinical_correlation || [],
        when_concerning: []
      },
      settings_sensitivity: {
        filters: v1Pattern.eegSettingsSensitivity?.filters ? [v1Pattern.eegSettingsSensitivity.filters] : [],
        montage_effects: v1Pattern.eegSettingsSensitivity?.montage ? [v1Pattern.eegSettingsSensitivity.montage] : [],
        sensitivity_notes: v1Pattern.eegSettingsSensitivity?.sensitivity || ""
      },
      abret_exam_pearls: v1Pattern.abretPearl ? [v1Pattern.abretPearl] : [],
      report_language: {
        how_to_describe: "",
        avoid_saying: []
      },
      cross_links: {
        workflow_sections: [],
        standards_sections: [],
        quiz_tags: []
      },
      micro_quiz: []
    };
  }

  const [activeTab, setActiveTab] = useState("identity");

  // Get workflow sections
  const workflowSections = pattern.cross_links?.workflow_sections?.map(sectionId => {
    for (const domain of workflowData.domains || []) {
      const section = domain.sections?.find(s => s.id === sectionId);
      if (section) return { ...section, domainTitle: domain.title };
    }
    return null;
  }).filter(Boolean) || [];

  return (
    <div className="relative z-0">
      <section className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/patterns" className="text-xs text-blue-600 hover:underline mb-2 inline-block">
              ← Back to patterns
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{pattern.name}</h1>
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full uppercase">
                {pattern.category}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {pattern.morphology} • {pattern.frequency_hz} Hz • {pattern.topography?.join(", ")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-4">
            {["identity", "confusions", "clinical", "abret", "settings", "report", "quiz"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
              >
                {tab === "identity" && "Core Identity"}
                {tab === "confusions" && "Commonly Confused With"}
                {tab === "clinical" && "Clinical Context"}
                {tab === "abret" && "ABRET Pearls"}
                {tab === "settings" && "Affected By"}
                {tab === "report" && "Report Language"}
                {tab === "quiz" && "Practice Questions"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          {/* Core Identity */}
          {activeTab === "identity" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Core Identity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">Morphology:</span>
                  <span className="ml-2 text-slate-900">{pattern.morphology || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Frequency:</span>
                  <span className="ml-2 text-slate-900">{pattern.frequency_hz || "N/A"} Hz</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Topography:</span>
                  <span className="ml-2 text-slate-900">{pattern.topography?.join(", ") || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">State:</span>
                  <span className="ml-2 text-slate-900">{pattern.state?.join(", ") || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Age Notes:</span>
                  <span className="ml-2 text-slate-900">{pattern.age_notes || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Amplitude:</span>
                  <span className="ml-2 text-slate-900">{pattern.amplitude_uv || "N/A"}</span>
                </div>
              </div>
              {pattern.key_features && pattern.key_features.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Key Features</h3>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {pattern.key_features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pattern Image(s) */}
              {(pattern.images && pattern.images.length > 0) || pattern.image ? (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    {pattern.images && pattern.images.length > 1 ? "EEG Examples" : "EEG Example"}
                  </h3>
                  <div className="space-y-4">
                    {/* Multiple images */}
                    {pattern.images && pattern.images.length > 0 ? (
                      pattern.images.map((imgSrc, idx) => (
                        <div key={idx} className="rounded-md border border-slate-300 bg-slate-50 p-4 overflow-x-auto">
                          <img
                            src={imgSrc}
                            alt={`EEG example ${idx + 1} showing ${pattern.name}`}
                            className="w-full max-w-4xl mx-auto rounded border border-slate-200 shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <p className="text-xs text-slate-600 mt-2 italic text-center">
                            {pattern.name} - Example {idx + 1}
                          </p>
                        </div>
                      ))
                    ) : (
                      /* Single image */
                      pattern.image && (
                        <div className="rounded-md border border-slate-300 bg-slate-50 p-4 overflow-x-auto">
                          <img
                            src={pattern.image}
                            alt={`EEG example showing ${pattern.name}`}
                            className="w-full max-w-4xl mx-auto rounded border border-slate-200 shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.nextElementSibling;
                              if (placeholder) placeholder.style.display = 'block';
                            }}
                          />
                          <div className="hidden text-xs text-slate-500 italic text-center py-4 border border-slate-200 rounded bg-slate-50">
                            <p>EEG image for {pattern.name}</p>
                            <p className="mt-1">Place image at: {pattern.image}</p>
                          </div>
                          <p className="text-xs text-slate-600 mt-2 italic text-center">
                            {pattern.name} - EEG Example
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Commonly Confused With */}
          {activeTab === "confusions" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">⚠️ Commonly Confused With</h2>
              {pattern.common_confusions && pattern.common_confusions.length > 0 ? (
                <div className="space-y-3">
                  {pattern.common_confusions.map((confusion, idx) => {
                    const confusedPattern = patternsV2Data.find(p => p.id === confusion.pattern_id) ||
                      patternsData.find(p => p.id === confusion.pattern_id);
                    return (
                      <div key={idx} className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {confusedPattern?.name || confusion.pattern_id}
                          </h3>
                          {confusedPattern && (
                            <Link
                              to={`/patterns/${confusedPattern.id}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View →
                            </Link>
                          )}
                        </div>
                        {confusion.why_confused && (
                          <p className="text-xs text-slate-600 mb-1">
                            <span className="font-medium">Why confused:</span> {confusion.why_confused}
                          </p>
                        )}
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">How to distinguish:</span> {confusion.how_to_distinguish}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No common confusions listed.</p>
              )}
            </div>
          )}

          {/* Clinical Context */}
          {activeTab === "clinical" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Clinical Context</h2>
              {pattern.clinical_context && (
                <div className="space-y-3 text-sm">
                  {pattern.clinical_context.seen_in && pattern.clinical_context.seen_in.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700">Seen in:</span>
                      <ul className="list-disc list-inside ml-2 text-slate-900">
                        {pattern.clinical_context.seen_in.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pattern.clinical_context.associated_with && pattern.clinical_context.associated_with.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700">Associated with:</span>
                      <ul className="list-disc list-inside ml-2 text-slate-900">
                        {pattern.clinical_context.associated_with.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pattern.clinical_context.when_concerning && pattern.clinical_context.when_concerning.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700">When concerning:</span>
                      <ul className="list-disc list-inside ml-2 text-slate-900">
                        {pattern.clinical_context.when_concerning.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ABRET Exam Pearls */}
          {activeTab === "abret" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">⚠️ ABRET Exam Pearls</h2>
              {pattern.abret_exam_pearls && pattern.abret_exam_pearls.length > 0 ? (
                <div className="space-y-3">
                  {pattern.abret_exam_pearls.map((pearl, idx) => (
                    <div key={idx} className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
                      <p className="text-sm text-blue-800 font-medium">{pearl}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No ABRET pearls listed.</p>
              )}

              {/* Pattern Image(s) in ABRET Tab */}
              {(pattern.images && pattern.images.length > 0) || pattern.image ? (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    {pattern.images && pattern.images.length > 1 ? "EEG Examples" : "EEG Example"}
                  </h3>
                  <div className="space-y-4">
                    {/* Multiple images */}
                    {pattern.images && pattern.images.length > 0 ? (
                      pattern.images.map((imgSrc, idx) => (
                        <div key={idx} className="rounded-md border border-slate-300 bg-slate-50 p-4 overflow-x-auto">
                          <img
                            src={imgSrc}
                            alt={`EEG example ${idx + 1} showing ${pattern.name}`}
                            className="w-full max-w-4xl mx-auto rounded border border-slate-200 shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <p className="text-xs text-slate-600 mt-2 italic text-center">
                            {pattern.name} - Example {idx + 1}
                          </p>
                        </div>
                      ))
                    ) : (
                      /* Single image */
                      pattern.image && (
                        <div className="rounded-md border border-slate-300 bg-slate-50 p-4 overflow-x-auto">
                          <img
                            src={pattern.image}
                            alt={`EEG example showing ${pattern.name}`}
                            className="w-full max-w-4xl mx-auto rounded border border-slate-200 shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.nextElementSibling;
                              if (placeholder) placeholder.style.display = 'block';
                            }}
                          />
                          <div className="hidden text-xs text-slate-500 italic text-center py-4 border border-slate-200 rounded bg-slate-50">
                            <p>EEG image for {pattern.name}</p>
                            <p className="mt-1">Place image at: {pattern.image}</p>
                          </div>
                          <p className="text-xs text-slate-600 mt-2 italic text-center">
                            {pattern.name} - EEG Example
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Affected By (Settings Sensitivity) */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Affected By (Filters/Montage/Sensitivity)</h2>
              {pattern.settings_sensitivity && (
                <div className="space-y-4 text-sm">
                  {pattern.settings_sensitivity.filters && pattern.settings_sensitivity.filters.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2">Filters</h3>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        {pattern.settings_sensitivity.filters.map((filter, idx) => (
                          <li key={idx}>{filter}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pattern.settings_sensitivity.montage_effects && pattern.settings_sensitivity.montage_effects.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2">Montage Effects</h3>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        {pattern.settings_sensitivity.montage_effects.map((effect, idx) => (
                          <li key={idx}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pattern.settings_sensitivity.sensitivity_notes && (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2">Sensitivity</h3>
                      <p className="text-slate-700">{pattern.settings_sensitivity.sensitivity_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Report Language */}
          {activeTab === "report" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">How to Write It in a Report</h2>
              {pattern.report_language && (
                <div className="space-y-3 text-sm">
                  {pattern.report_language.how_to_describe && (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2">How to describe:</h3>
                      <p className="text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                        {pattern.report_language.how_to_describe}
                      </p>
                    </div>
                  )}
                  {pattern.report_language.avoid_saying && pattern.report_language.avoid_saying.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2">Avoid saying:</h3>
                      <ul className="list-disc list-inside text-slate-700 space-y-1">
                        {pattern.report_language.avoid_saying.map((item, idx) => (
                          <li key={idx} className="text-red-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Practice Questions */}
          {activeTab === "quiz" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Practice Questions on This Pattern</h2>
              {pattern.micro_quiz && pattern.micro_quiz.length > 0 ? (
                <div className="space-y-4">
                  {pattern.micro_quiz.map((q, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-slate-900 mb-3">{q.stem}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-2 rounded border ${optIdx === q.answerIndex
                                ? "border-green-500 bg-green-50"
                                : "border-slate-200"
                              }`}
                          >
                            <span className="font-semibold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                          <span className="font-medium">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-600 mb-3">
                    Test your ability to differentiate this pattern from similar patterns.
                  </p>
                  <Link
                    to={`/quiz/session?tags=${getPatternQuizTags(pattern).join(",")}&questions=5&mode=practice`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Start Practice Quiz (5 questions)
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Learning */}
        {workflowSections.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Related Learning</h2>
            <div className="space-y-2">
              {workflowSections.map((section) => (
                <Link
                  key={section.id}
                  to={`/workflow?section=${section.id}`}
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {section.domainTitle} → {section.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default PatternDetail;
