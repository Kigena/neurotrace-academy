import React from "react";
import { Link } from "react-router-dom";
import syndromesData from "../data/syndromes_v2.json";

function CaseCard({ eegCase }) {
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  const getAgeDisplay = () => {
    // Legacy Format
    if (eegCase.patient?.ageYears !== undefined) {
      if (eegCase.patient.ageYears < 1) {
        const months = Math.round(eegCase.patient.ageYears * 12);
        return `${months} months`;
      }
      return `${eegCase.patient.ageYears} years`;
    }

    // New Community Format
    if (eegCase.patientInfo?.age !== undefined) {
      return `${eegCase.patientInfo.age} ${eegCase.patientInfo.ageUnit || 'years'}`;
    }

    return "Age Unknown";
  };

  return (
    <Link
      to={eegCase._id ? `/cases/${eegCase._id}` : `/cases/${eegCase.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-1" title={eegCase.title}>
          {eegCase.title}
        </h3>
        {eegCase.difficulty && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${difficultyColors[eegCase.difficulty] || "bg-slate-100 text-slate-800"
              }`}
          >
            {eegCase.difficulty}
          </span>
        )}
      </div>
      <div className="text-[11px] text-slate-500 mb-2">
        {getAgeDisplay()} • {eegCase.patient?.context || eegCase.patientInfo?.gender || "Case Study"}
      </div>
      <p className="mt-1 text-xs text-slate-700 line-clamp-2 mb-auto">
        {eegCase.chiefComplaint || eegCase.history?.substring(0, 100) + "..."}
      </p>
      {eegCase.syndromeIds && eegCase.syndromeIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {eegCase.syndromeIds.slice(0, 2).map((syndromeId) => {
            const syndrome = syndromesData.find((s) => s.id === syndromeId);
            if (!syndrome) return null;
            return (
              <span
                key={syndromeId}
                className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium"
              >
                {syndrome.name.split("(")[0].trim()}
              </span>
            );
          })}
        </div>
      )}
      {eegCase.tags && eegCase.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {eegCase.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700"
            >
              {tag}
            </span>
          ))}
          {eegCase.tags.length > 3 && (
            <span className="text-[10px] text-slate-400">+{eegCase.tags.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  );
}

export default CaseCard;
