import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import syndromesV2Data from "../data/syndromes_v2.json";
import syndromesData from "../data/syndromes.json";
import patternsV2Data from "../data/neurotrace_patterns_library_v2.json";
import SearchBar from "../components/SearchBar.jsx";

function Syndromes() {
  const [search, setSearch] = useState("");
  const [selectedClassification, setSelectedClassification] = useState("all");

  // Merge v2 with v1 (v2 takes precedence)
  const allSyndromes = useMemo(() => {
    const v2Map = new Map(syndromesV2Data.map(s => [s.id, s]));
    const merged = syndromesData.map(s => {
      const v2 = v2Map.get(s.id);
      if (v2) return v2;
      // Convert v1 to v2-like format
      return {
        ...s,
        classification: "Unknown",
        age_range: "",
        morphology: {},
        diagnostic_yield_enhancement: {},
        clinical_course: {},
        abret_pearls: [],
        differential_diagnosis: []
      };
    });
    // Add v2-only syndromes
    syndromesV2Data.forEach(s => {
      if (!merged.find(m => m.id === s.id)) {
        merged.push(s);
      }
    });
    return merged;
  }, []);

  const classifications = useMemo(() => {
    const unique = [...new Set(allSyndromes.map(s => s.classification))];
    return unique.filter(c => c);
  }, [allSyndromes]);

  const filtered = useMemo(() => {
    let result = allSyndromes;
    
    // Filter by classification
    if (selectedClassification !== "all") {
      result = result.filter(s => s.classification === selectedClassification);
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((s) => {
        const text = [
          s.name,
          s.classification,
          s.age_range,
          ...(s.clinical_features?.manifestation || s.clinical_features || []),
          ...(s.typical_patterns || []),
          ...(s.abret_pearls || [])
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(searchLower);
      });
    }
    
    return result;
  }, [allSyndromes, search, selectedClassification]);

  const getPatternName = (patternId) => {
    const pattern = patternsV2Data.find(p => p.id === patternId);
    return pattern?.name || patternId;
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            EEG Syndromes Classification
          </h1>
          <p className="text-xs text-slate-600">
            Comprehensive guide to epilepsy syndromes with diagnostic yield enhancement, morphological patterns, and clinical correlations.
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search syndromes, patterns, features..."
        />
      </div>

      {/* Classification Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedClassification("all")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            selectedClassification === "all"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          All ({allSyndromes.length})
        </button>
        {classifications.map((classification) => {
          const count = allSyndromes.filter(s => s.classification === classification).length;
          return (
            <button
              key={classification}
              onClick={() => setSelectedClassification(classification)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedClassification === classification
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {classification} ({count})
            </button>
          );
        })}
      </div>

      {/* Syndrome Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((syndrome) => {
          const bestActivation = syndrome.diagnostic_yield_enhancement
            ? Object.entries(syndrome.diagnostic_yield_enhancement)
                .filter(([key]) => key !== "recording_duration" && key !== "montage" && key !== "video_recording" && key !== "special_notes")
                .sort((a, b) => {
                  const aYield = parseFloat(a[1]?.effectiveness?.match(/\d+/)?.[0] || "0");
                  const bYield = parseFloat(b[1]?.effectiveness?.match(/\d+/)?.[0] || "0");
                  return bYield - aYield;
                })[0]
            : null;

          return (
            <Link
              key={syndrome.id}
              to={`/syndromes/${syndrome.id}`}
              className="rounded-lg border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {syndrome.name}
                  </h2>
                  <p className="text-xs text-blue-600 mt-1">
                    {syndrome.classification}
                  </p>
                </div>
                {(syndrome.morphology?.images && syndrome.morphology.images.length > 0) || syndrome.morphology?.image ? (
                  <img
                    src={syndrome.morphology?.images?.[0] || syndrome.morphology?.image}
                    alt={syndrome.name}
                    className="w-16 h-16 object-contain rounded border border-slate-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Age:</span>{" "}
                  <span className="text-slate-900">{syndrome.age_range || syndrome.age_group?.join(", ")}</span>
                </div>

                {syndrome.typical_patterns && syndrome.typical_patterns.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700">EEG Pattern:</span>{" "}
                    <span className="text-slate-900">
                      {syndrome.typical_patterns.map(p => getPatternName(p)).join(", ")}
                    </span>
                  </div>
                )}

                {bestActivation && (
                  <div className="rounded-md bg-green-50 border border-green-200 p-2">
                    <span className="font-semibold text-green-800">Best Activation:</span>{" "}
                    <span className="text-green-700">
                      {bestActivation[0].replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} - {bestActivation[1].effectiveness}
                    </span>
                  </div>
                )}

                {syndrome.clinical_features?.manifestation && (
                  <div>
                    <span className="font-semibold text-slate-700">Key Features:</span>{" "}
                    <span className="text-slate-900">
                      {syndrome.clinical_features.manifestation.slice(0, 2).join(", ")}
                      {syndrome.clinical_features.manifestation.length > 2 && "..."}
                    </span>
                  </div>
                )}

                {syndrome.clinical_course?.prognosis && (
                  <div>
                    <span className="font-semibold text-slate-700">Prognosis:</span>{" "}
                    <span className={`${
                      syndrome.clinical_course.prognosis.toLowerCase().includes("excellent") || 
                      syndrome.clinical_course.prognosis.toLowerCase().includes("good")
                        ? "text-green-700"
                        : syndrome.clinical_course.prognosis.toLowerCase().includes("poor")
                        ? "text-red-700"
                        : "text-slate-900"
                    }`}>
                      {syndrome.clinical_course.prognosis}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200">
                <span className="text-xs text-blue-600 font-medium">
                  View Details →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No syndromes found matching your criteria.</p>
        </div>
      )}
    </section>
  );
}

export default Syndromes;
