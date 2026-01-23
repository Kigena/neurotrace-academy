import React from "react";

function PatternCard({ pattern }) {
  // Support both v1 and v2 schemas
  const category = pattern.category || "NORMAL";
  const morphology = pattern.morphology || "N/A";
  const frequency = pattern.frequency_hz || pattern.frequency || "N/A";
  const topography = pattern.topography?.join(", ") || "N/A";
  const clinicalCorrelation = pattern.clinical_context?.associated_with?.join("; ") ||
                             pattern.clinical_correlation?.join("; ") ||
                             "No clinical correlation listed";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          {pattern.name}
        </h3>
        <span className="text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 bg-slate-100 text-slate-600">
          {category}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-600">
        Morphology: {morphology}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        Frequency: {frequency}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        Topography: {topography}
      </p>
      <p className="mt-2 text-xs text-slate-500 line-clamp-2">
        {clinicalCorrelation}
      </p>
    </div>
  );
}

export default PatternCard;
