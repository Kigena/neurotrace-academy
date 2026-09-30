import React from "react";
import { scoreTone } from "../utils/studyLabels.js";

/** Horizontal mastery bar. Low-evidence scores are greyed out and labelled. */
export function MasteryRow({ label, mastery, sub }) {
  const sufficient = !!mastery?.sufficient;
  const score = mastery?.score ?? null;
  const tone = scoreTone(score, sufficient);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-slate-800 truncate">{label}</span>
        <span className={`font-semibold whitespace-nowrap ${tone.text}`}>
          {sufficient ? `${score}%` : "—"}
          <span className="ml-2 text-xs font-normal text-slate-500">
            {sufficient ? mastery.label : mastery?.attempts ? `${mastery.attempts}/5 answers` : "no data"}
          </span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-2 rounded-full ${tone.bar}`} style={{ width: `${sufficient ? score : 0}%` }} />
      </div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

/** Study readiness with its explainable component breakdown. */
export function ReadinessBreakdown({ readiness }) {
  if (!readiness) return null;
  return (
    <div className="space-y-2">
      {readiness.components.map((c) => {
        const tone = scoreTone(c.score, c.available);
        return (
          <div key={c.key} className="flex items-start justify-between gap-3 text-xs">
            <div>
              <div className="text-slate-800">
                {c.label} <span className="text-slate-400">({Math.round(c.weight * 100)}%)</span>
              </div>
              <div className="text-slate-500">{c.detail}</div>
            </div>
            <div className={`font-semibold ${tone.text}`}>{c.available ? `${c.score}%` : "n/a"}</div>
          </div>
        );
      })}
      {readiness.measuredWeightPercent < 100 && readiness.score !== null && (
        <p className="text-xs text-slate-500">
          Based on {readiness.measuredWeightPercent}% of the full formula; unavailable parts are excluded, not guessed.
        </p>
      )}
      <p className="text-xs text-slate-400">{readiness.disclaimer}</p>
    </div>
  );
}

export function PercentChip({ value, suffix = "%" }) {
  const tone = scoreTone(value, value !== null && value !== undefined);
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${tone.chip}`}>
      {value === null || value === undefined ? "—" : `${value}${suffix}`}
    </span>
  );
}
