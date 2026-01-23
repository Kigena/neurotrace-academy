import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import patternsV2Data from "../data/neurotrace_patterns_library_v2.json";
import patternsData from "../data/patterns.json";

function PatternCompare() {
  const [searchParams] = useSearchParams();
  const patternAId = searchParams.get("A");
  const patternBId = searchParams.get("B");

  // Helper to get pattern (v2 or v1)
  const getPattern = (id) => {
    let pattern = patternsV2Data.find((p) => p.id === id);
    if (!pattern) {
      const v1Pattern = patternsData.find((p) => p.id === id);
      if (v1Pattern) {
        // Convert v1 to v2-like
        pattern = {
          id: v1Pattern.id,
          name: v1Pattern.name,
          category: v1Pattern.category?.toUpperCase() || "NORMAL",
          morphology: v1Pattern.morphology || "",
          frequency_hz: v1Pattern.frequency || "",
          topography: v1Pattern.topography || [],
          state: v1Pattern.patient_state || [],
          age_notes: v1Pattern.prevalence || "",
          abret_exam_pearls: v1Pattern.abretPearl ? [v1Pattern.abretPearl] : [],
          key_features: []
        };
      }
    }
    return pattern;
  };

  const patternA = getPattern(patternAId);
  const patternB = getPattern(patternBId);

  if (!patternA || !patternB) {
    return (
      <section className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {!patternA && !patternB
              ? "Both patterns not found."
              : !patternA
              ? "Pattern A not found."
              : "Pattern B not found."}
          </p>
          <Link to="/patterns" className="text-sm text-blue-600 hover:underline">
            ← Back to patterns
          </Link>
        </div>
      </section>
    );
  }

  // Find common confusions
  const commonConfusions = [];
  if (patternA.common_confusions && patternB.common_confusions) {
    patternA.common_confusions.forEach((confA) => {
      patternB.common_confusions.forEach((confB) => {
        if (confA.pattern_id === confB.pattern_id) {
          commonConfusions.push({
            pattern_id: confA.pattern_id,
            patternA_distinction: confA.how_to_distinguish,
            patternB_distinction: confB.how_to_distinguish
          });
        }
      });
    });
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/patterns" className="text-xs text-blue-600 hover:underline mb-2 inline-block">
            ← Back to patterns
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Pattern Comparison</h1>
        </div>
        <Link
          to={`/patterns/compare?A=${patternBId}&B=${patternAId}`}
          className="text-xs text-blue-600 hover:underline"
        >
          Swap patterns
        </Link>
      </div>

      {/* Comparison Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-3 gap-4 p-6">
          {/* Header */}
          <div className="font-semibold text-slate-900">Feature</div>
          <div className="font-semibold text-slate-900">
            <Link to={`/patterns/${patternA.id}`} className="text-blue-600 hover:underline">
              {patternA.name}
            </Link>
          </div>
          <div className="font-semibold text-slate-900">
            <Link to={`/patterns/${patternB.id}`} className="text-blue-600 hover:underline">
              {patternB.name}
            </Link>
          </div>

          {/* Category */}
          <div className="text-sm text-slate-700 font-medium">Category</div>
          <div className="text-sm text-slate-900">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full uppercase">
              {patternA.category}
            </span>
          </div>
          <div className="text-sm text-slate-900">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full uppercase">
              {patternB.category}
            </span>
          </div>

          {/* Morphology */}
          <div className="text-sm text-slate-700 font-medium">Morphology</div>
          <div className="text-sm text-slate-900">{patternA.morphology || "N/A"}</div>
          <div className="text-sm text-slate-900">{patternB.morphology || "N/A"}</div>

          {/* Frequency */}
          <div className="text-sm text-slate-700 font-medium">Frequency</div>
          <div className="text-sm text-slate-900">{patternA.frequency_hz || "N/A"} Hz</div>
          <div className="text-sm text-slate-900">{patternB.frequency_hz || "N/A"} Hz</div>

          {/* Topography */}
          <div className="text-sm text-slate-700 font-medium">Topography</div>
          <div className="text-sm text-slate-900">{patternA.topography?.join(", ") || "N/A"}</div>
          <div className="text-sm text-slate-900">{patternB.topography?.join(", ") || "N/A"}</div>

          {/* State/Age Notes */}
          <div className="text-sm text-slate-700 font-medium">State / Age Notes</div>
          <div className="text-sm text-slate-900">
            {patternA.state?.join(", ") || "N/A"}
            {patternA.age_notes && <div className="text-xs text-slate-500 mt-1">{patternA.age_notes}</div>}
          </div>
          <div className="text-sm text-slate-900">
            {patternB.state?.join(", ") || "N/A"}
            {patternB.age_notes && <div className="text-xs text-slate-500 mt-1">{patternB.age_notes}</div>}
          </div>

          {/* Key Distinguishing Feature */}
          <div className="text-sm text-slate-700 font-medium">Key Distinguishing Feature</div>
          <div className="text-sm text-slate-900">
            {patternA.abret_exam_pearls?.[0] || patternA.key_features?.[0] || "N/A"}
          </div>
          <div className="text-sm text-slate-900">
            {patternB.abret_exam_pearls?.[0] || patternB.key_features?.[0] || "N/A"}
          </div>

          {/* ABRET Pearl */}
          <div className="text-sm text-slate-700 font-medium">ABRET Pearl</div>
          <div className="text-sm text-slate-900">
            {patternA.abret_exam_pearls?.[0] ? (
              <div className="rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800">
                {patternA.abret_exam_pearls[0]}
              </div>
            ) : (
              "N/A"
            )}
          </div>
          <div className="text-sm text-slate-900">
            {patternB.abret_exam_pearls?.[0] ? (
              <div className="rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-800">
                {patternB.abret_exam_pearls[0]}
              </div>
            ) : (
              "N/A"
            )}
          </div>
        </div>
      </div>

      {/* Common Confusions Overlap */}
      {commonConfusions.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Common Confusions Overlap
          </h2>
          <div className="space-y-3">
            {commonConfusions.map((conf, idx) => {
              const confusedPattern = patternsV2Data.find(p => p.id === conf.pattern_id) ||
                                     patternsData.find(p => p.id === conf.pattern_id);
              return (
                <div key={idx} className="border border-yellow-200 bg-yellow-50 p-4 rounded">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    Both patterns are confused with: {confusedPattern?.name || conf.pattern_id}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-slate-700">{patternA.name} distinction:</span>
                      <p className="text-slate-600 mt-1">{conf.patternA_distinction}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">{patternB.name} distinction:</span>
                      <p className="text-slate-600 mt-1">{conf.patternB_distinction}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to={`/patterns/${patternA.id}`}
          className="px-4 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
        >
          View {patternA.name} Details →
        </Link>
        <Link
          to={`/patterns/${patternB.id}`}
          className="px-4 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
        >
          View {patternB.name} Details →
        </Link>
      </div>
    </section>
  );
}

export default PatternCompare;







