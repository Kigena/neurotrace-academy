import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import patternsData from "../data/patterns.json";
import patternsV2Data from "../data/neurotrace_patterns_library_v2.json";
import casesData from "../data/cases.json";
import syndromesData from "../data/syndromes.json";
import SearchBar from "../components/SearchBar.jsx";
import PatternCard from "../components/PatternCard.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import { getPatternQuizTags } from "../utils/patternQuizTags";
import CrossLinks from "../components/CrossLinks.jsx";

function Patterns() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePattern1, setComparePattern1] = useState(null);
  const [comparePattern2, setComparePattern2] = useState(null);

  // Close drawer when route changes or when not on exact /patterns route
  useEffect(() => {
    // Only show drawer on exact /patterns route, not on /patterns/:id or /patterns/compare
    const isExactPatternsRoute = location.pathname === "/patterns" || location.pathname === "/patterns/";
    if (!isExactPatternsRoute) {
      setShowDrawer(false);
      setSelectedPattern(null);
    }
  }, [location.pathname]);

  // Ensure drawer is closed on mount if not on exact route
  useEffect(() => {
    const isExactPatternsRoute = location.pathname === "/patterns" || location.pathname === "/patterns/";
    if (!isExactPatternsRoute) {
      setShowDrawer(false);
      setSelectedPattern(null);
    }
  }, [location.pathname]);

  // Merge v2 patterns with v1 patterns (v2 takes precedence)
  const allPatterns = useMemo(() => {
    const v2Map = new Map(patternsV2Data.map(p => [p.id, p]));
    const merged = patternsData.map(p => {
      let v2 = v2Map.get(p.id);
      if (!v2) {
        // Try looking up with pattern_ prefix (common V2 convention)
        v2 = v2Map.get(`pattern_${p.id}`);
      }
      if (v2) return v2;
      // Convert v1 to v2-like format for backward compatibility
      return {
        id: p.id,
        name: p.name,
        category: p.category?.toUpperCase() || "NORMAL",
        topography: p.topography || [],
        state: p.patient_state || [],
        age_notes: p.prevalence || "",
        morphology: p.morphology || "",
        frequency_hz: p.frequency || "",
        amplitude_uv: "variable",
        key_features: [],
        common_confusions: p.commonConfusions?.map(c => ({
          pattern_id: c.patternId,
          why_confused: "",
          how_to_distinguish: c.distinguishingFeature
        })) || [],
        clinical_context: {
          seen_in: p.patient_state || [],
          associated_with: p.clinical_correlation || [],
          when_concerning: []
        },
        settings_sensitivity: {
          filters: p.eegSettingsSensitivity?.filters ? [p.eegSettingsSensitivity.filters] : [],
          montage_effects: p.eegSettingsSensitivity?.montage ? [p.eegSettingsSensitivity.montage] : [],
          sensitivity_notes: p.eegSettingsSensitivity?.sensitivity || ""
        },
        abret_exam_pearls: p.abretPearl ? [p.abretPearl] : [],
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
    });
    // Add v2-only patterns
    patternsV2Data.forEach(p => {
      if (!merged.find(m => m.id === p.id)) {
        merged.push(p);
      }
    });
    return merged;
  }, []);

  const filteredPatterns = useMemo(() => {
    return allPatterns.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.morphology?.toLowerCase().includes(search.toLowerCase()) ||
        (p.clinical_context?.associated_with?.join(" ") || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" ? true : p.category?.toLowerCase() === category.toLowerCase();

      const matchesLocation =
        locationFilter === "all"
          ? true
          : p.topography?.some((t) =>
            t.toLowerCase().includes(locationFilter.toLowerCase())
          );

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [search, category, locationFilter, allPatterns]);

  const handlePatternClick = (pattern) => {
    // Always close drawer first
    setShowDrawer(false);
    setSelectedPattern(null);

    // Small delay to ensure state updates before navigation
    setTimeout(() => {
      // Navigate to detail page for v2 patterns, use drawer for v1
      if (patternsV2Data.find(p => p.id === pattern.id)) {
        navigate(`/patterns/${pattern.id}`);
      } else {
        setSelectedPattern(pattern);
        setShowDrawer(true);
      }
    }, 0);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setSelectedPattern(null);
  };

  // Get related cases for selected pattern
  const relatedCases = useMemo(() => {
    if (!selectedPattern) return [];
    const cases = casesData.starterCases || [];
    return cases.filter((c) => c.pattern_ids?.includes(selectedPattern.id));
  }, [selectedPattern]);

  // Get related syndromes for selected pattern
  const relatedSyndromes = useMemo(() => {
    if (!selectedPattern) return [];
    return syndromesData.filter((s) =>
      s.typical_patterns?.includes(selectedPattern.id)
    );
  }, [selectedPattern]);

  // Don't render drawer content if not on exact /patterns route
  const isExactPatternsRoute = location.pathname === "/patterns" || location.pathname === "/patterns/";

  // Early return: Don't render Patterns component at all if on a detail/compare route
  // This prevents any drawer/backdrop from being rendered
  if (!isExactPatternsRoute) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            EEG Pattern Library
          </h1>
          <p className="text-xs text-slate-600">
            Search and filter patterns by morphology, topography, and clinical
            correlation. Click any pattern to view detailed information.
          </p>
          <p className="text-xs text-slate-600">
            Technique matters. Review{" "}
            <Link className="text-blue-600" to="/standards">
              Standards
            </Link>{" "}
            to understand how filters, montages, and activation procedures affect pattern detection.
          </p>
          <div className="text-xs text-slate-600 space-y-1">
            <p>
              Learn to distinguish artifacts from true patterns.{" "}
              <Link className="text-blue-600" to="/workflow#d3-artifacts-recognition">
                Artifacts: Recognition & Differentiation →
              </Link>
            </p>
            <p>
              Master epileptiform discharge recognition.{" "}
              <Link className="text-blue-600" to="/workflow#d3-epileptiform-discharges">
                Epileptiform Discharges →
              </Link>{" "}
              Understand sleep patterns.{" "}
              <Link className="text-blue-600" to="/workflow#d3-sleep-graphoelements">
                Sleep & Graphoelements →
              </Link>{" "}
              Classify focal vs generalized.{" "}
              <Link className="text-blue-600" to="/workflow#d3-focal-generalized-patterns">
                Focal vs Generalized Patterns →
              </Link>{" "}
              Recognize diffuse slowing.{" "}
              <Link className="text-blue-600" to="/workflow#d3-diffuse-slowing">
                Diffuse Slowing →
              </Link>{" "}
              Identify normal variants.{" "}
              <Link className="text-blue-600" to="/workflow#d3-normal-variants">
                Normal EEG Variants →
              </Link>
            </p>
          </div>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, morphology, syndrome..."
        />
      </div>

      <FilterPanel
        category={category}
        onCategoryChange={setCategory}
        location={locationFilter}
        onLocationChange={setLocationFilter}
      />

      {/* Compare Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="compareMode"
            checked={compareMode}
            onChange={(e) => {
              setCompareMode(e.target.checked);
              if (!e.target.checked) {
                setComparePattern1(null);
                setComparePattern2(null);
              }
            }}
            className="rounded"
          />
          <label htmlFor="compareMode" className="text-sm font-medium text-slate-700">
            Compare Patterns
          </label>
        </div>
        {compareMode && (
          <div className="text-xs text-slate-500">
            Select 2 patterns to compare side-by-side
          </div>
        )}
      </div>

      {/* Compare Mode View */}
      {compareMode && comparePattern1 && comparePattern2 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Pattern Comparison
            </h2>
            <button
              onClick={() => {
                navigate(`/patterns/compare?A=${comparePattern1.id}&B=${comparePattern2.id}`);
              }}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              View Full Comparison →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pattern 1 */}
            <div className="border-r border-slate-200 pr-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                {comparePattern1.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Category:</span>{" "}
                  <span className="text-slate-900">{comparePattern1.category || "N/A"}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Morphology:</span>{" "}
                  <span className="text-slate-900">{comparePattern1.morphology || "N/A"}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Frequency:</span>{" "}
                  <span className="text-slate-900">{comparePattern1.frequency_hz || comparePattern1.frequency || "N/A"}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Topography:</span>{" "}
                  <span className="text-slate-900">
                    {comparePattern1.topography?.join(", ") || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Key Distinguishing Feature:</span>{" "}
                  <span className="text-slate-900">
                    {comparePattern1.abret_exam_pearls?.[0] || comparePattern1.abretPearl || comparePattern1.notes || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Pattern 2 */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                {comparePattern2.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Category:</span>{" "}
                  <span className="text-slate-900">{comparePattern2.category || "N/A"}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Morphology:</span>{" "}
                  <span className="text-slate-900">{comparePattern2.morphology || "N/A"}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Frequency:</span>{" "}
                  <span className="text-slate-900">{comparePattern2.frequency_hz || comparePattern2.frequency || "N/A"}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Topography:</span>{" "}
                  <span className="text-slate-900">
                    {comparePattern2.topography?.join(", ") || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Key Distinguishing Feature:</span>{" "}
                  <span className="text-slate-900">
                    {comparePattern2.abret_exam_pearls?.[0] || comparePattern2.abretPearl || comparePattern2.notes || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setComparePattern1(null);
                setComparePattern2(null);
              }}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Clear Comparison
            </button>
          </div>
        </div>
      )}

      {/* Pattern Cards with Compare Mode Selection */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPatterns.map((pattern) => {
          const isSelectedForCompare =
            comparePattern1?.id === pattern.id || comparePattern2?.id === pattern.id;
          return (
            <div
              key={pattern.id}
              onClick={() => {
                if (compareMode) {
                  // Handle compare mode selection
                  if (!comparePattern1) {
                    setComparePattern1(pattern);
                  } else if (!comparePattern2 && comparePattern1.id !== pattern.id) {
                    setComparePattern2(pattern);
                  } else if (comparePattern1.id === pattern.id) {
                    setComparePattern1(null);
                  } else if (comparePattern2?.id === pattern.id) {
                    setComparePattern2(null);
                  }
                } else {
                  // Normal mode - navigate to detail or open drawer
                  handlePatternClick(pattern);
                }
              }}
              className={`cursor-pointer ${isSelectedForCompare ? "ring-2 ring-blue-500" : ""
                }`}
            >
              <PatternCard pattern={pattern} />
              {compareMode && isSelectedForCompare && (
                <div className="text-xs text-blue-600 font-medium mt-1 text-center">
                  Selected for comparison
                </div>
              )}
            </div>
          );
        })}
        {filteredPatterns.length === 0 && (
          <p className="text-xs text-slate-500">
            No patterns match the current filters.
          </p>
        )}
      </div>

      {/* Slide-over Drawer - Only show on exact /patterns route, not detail pages */}
      {isExactPatternsRoute && showDrawer && selectedPattern && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeDrawer}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedPattern.name}
              </h2>
              <button
                onClick={closeDrawer}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Category Badge */}
              <div>
                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {selectedPattern.category}
                </span>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-slate-700">Morphology:</span>
                  <span className="ml-2 text-slate-900">
                    {selectedPattern.morphology || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Frequency:</span>
                  <span className="ml-2 text-slate-900">
                    {selectedPattern.frequency || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Topography:</span>
                  <span className="ml-2 text-slate-900">
                    {selectedPattern.topography?.join(", ") || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Polarity:</span>
                  <span className="ml-2 text-slate-900">
                    {selectedPattern.polarity || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Duration:</span>
                  <span className="ml-2 text-slate-900">
                    {selectedPattern.duration || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Patient States:</span>
                  <span className="ml-2 text-slate-900">
                    {selectedPattern.patient_state?.join(", ") || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Reactivity:</span>
                  <span className="ml-2 text-slate-900">
                    {selectedPattern.reactivity?.join(", ") || "None/Not typical"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Prevalence:</span>
                  <span className="ml-2 text-slate-900">
                    {selectedPattern.prevalence || "N/A"}
                  </span>
                </div>
              </div>

              {/* Clinical Correlation */}
              {selectedPattern.clinical_correlation && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    Clinical Correlation
                  </h3>
                  <p className="text-sm text-slate-700">
                    {selectedPattern.clinical_correlation.join("; ")}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedPattern.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    Notes
                  </h3>
                  <p className="text-sm text-slate-700">{selectedPattern.notes}</p>
                </div>
              )}

              {/* Common Confusions (NEW - HIGH VALUE) */}
              {selectedPattern.commonConfusions && selectedPattern.commonConfusions.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    ⚠️ Commonly Confused With
                  </h3>
                  <div className="space-y-3">
                    {selectedPattern.commonConfusions.map((confusion, idx) => (
                      <div
                        key={idx}
                        className="rounded-md border border-yellow-200 bg-yellow-50 p-3"
                      >
                        <div className="text-sm font-semibold text-slate-900 mb-1">
                          {confusion.patternName}
                        </div>
                        <div className="text-xs text-slate-700">
                          <span className="font-medium">Distinguishing feature:</span>{" "}
                          {confusion.distinguishingFeature}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Context (NEW) */}
              {selectedPattern.clinicalContext && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    Clinical Context
                  </h3>
                  <div className="text-sm text-slate-700 space-y-1">
                    {selectedPattern.clinicalContext.ageGroup && (
                      <div>
                        <span className="font-medium">Age group:</span>{" "}
                        {selectedPattern.clinicalContext.ageGroup.join(", ")}
                      </div>
                    )}
                    {selectedPattern.clinicalContext.state && (
                      <div>
                        <span className="font-medium">State:</span>{" "}
                        {selectedPattern.clinicalContext.state.join(", ")}
                      </div>
                    )}
                    {selectedPattern.clinicalContext.syndromicRelevance && (
                      <div>
                        <span className="font-medium">Syndromic relevance:</span>{" "}
                        {selectedPattern.clinicalContext.syndromicRelevance}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ABRET Exam Pearl (MANDATORY) */}
              {selectedPattern.abretPearl && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">
                      ⚠️ ABRET Exam Pearl
                    </h3>
                    <p className="text-sm text-blue-800 font-medium">
                      {selectedPattern.abretPearl}
                    </p>
                  </div>
                </div>
              )}

              {/* EEG Settings Sensitivity (ADVANCED BUT CRITICAL) */}
              {selectedPattern.eegSettingsSensitivity && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    EEG Settings Sensitivity
                  </h3>
                  <div className="text-sm text-slate-700 space-y-2">
                    {selectedPattern.eegSettingsSensitivity.filters && (
                      <div>
                        <span className="font-medium">Filters:</span>{" "}
                        {selectedPattern.eegSettingsSensitivity.filters}
                      </div>
                    )}
                    {selectedPattern.eegSettingsSensitivity.montage && (
                      <div>
                        <span className="font-medium">Montage:</span>{" "}
                        {selectedPattern.eegSettingsSensitivity.montage}
                      </div>
                    )}
                    {selectedPattern.eegSettingsSensitivity.sensitivity && (
                      <div>
                        <span className="font-medium">Sensitivity:</span>{" "}
                        {selectedPattern.eegSettingsSensitivity.sensitivity}
                      </div>
                    )}
                    {selectedPattern.eegSettingsSensitivity.state && (
                      <div>
                        <span className="font-medium">State:</span>{" "}
                        {selectedPattern.eegSettingsSensitivity.state}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pitfalls Section (Legacy - keep for backward compatibility) */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Pitfalls & Technical Considerations
                </h3>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>
                    • Filter effects: High LFF may attenuate slow components; notch
                    filter can distort spikes
                  </li>
                  <li>
                    • Montage effects: Some patterns clearer in referential vs
                    bipolar montages
                  </li>
                  <li>
                    • Sweep speed: Faster speeds (30 mm/s) help identify spikes;
                    slower speeds (10 mm/s) show slow waves
                  </li>
                  <li>
                    • Activation: Hyperventilation and photic may enhance or
                    suppress certain patterns
                  </li>
                </ul>
              </div>

              {/* Related Syndromes */}
              {relatedSyndromes.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Associated Syndromes
                  </h3>
                  <div className="space-y-2">
                    {relatedSyndromes.map((syndrome) => (
                      <div
                        key={syndrome.id}
                        className="rounded-md border border-slate-200 p-3"
                      >
                        <h4 className="text-sm font-semibold text-slate-900 mb-1">
                          {syndrome.name}
                        </h4>
                        <p className="text-xs text-slate-600 mb-2">
                          {syndrome.notes}
                        </p>
                        <div className="text-xs text-slate-700">
                          <span className="font-medium">Clinical features:</span>{" "}
                          {syndrome.clinical_features?.join("; ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Cases */}
              {relatedCases.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Example Cases ({relatedCases.length})
                  </h3>
                  <div className="space-y-2">
                    {relatedCases.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        className="rounded-md border border-slate-200 p-3"
                      >
                        <h4 className="text-sm font-semibold text-slate-900 mb-1">
                          Case {caseItem.id}
                        </h4>
                        <p className="text-xs text-slate-700 mb-2">
                          {caseItem.clinical_summary}
                        </p>
                        <p className="text-xs text-slate-600">
                          <span className="font-medium">Impression:</span>{" "}
                          {caseItem.impression}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Bridge (NEW) */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Practice Questions on This Pattern
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  Test your ability to differentiate this pattern from similar patterns.
                </p>
                <Link
                  to={`/quiz/session?tags=${getPatternQuizTags(selectedPattern).join(",")}&questions=5&mode=practice`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Start Practice Quiz (5 questions)
                </Link>
              </div>

              {/* Cross-Links */}
              <div className="border-t border-slate-200 pt-4">
                <CrossLinks
                  type="pattern"
                  id={selectedPattern.id}
                  tags={[
                    selectedPattern.category,
                    ...(selectedPattern.topography || []),
                  ]}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Patterns;
