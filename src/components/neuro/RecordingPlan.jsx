import React from "react";
import { Card } from "../study/ui.jsx";
import { ACTIVATION_LABELS } from "./recordingPlanUtils.js";

/**
 * How to record and which activations to include for one syndrome (maximum diagnostic yield).
 * Used by the syndrome browser and the genetics cards.
 */


const USE_STYLES = {
  Best: "bg-emerald-100 text-emerald-800",
  Helpful: "bg-sky-100 text-sky-800",
  "Per protocol": "bg-slate-100 text-slate-700",
  Limited: "bg-amber-100 text-amber-800",
  "Not useful": "bg-rose-100 text-rose-800",
};

export function UseBadge({ use }) {
  if (!use) return null;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${USE_STYLES[use] || "bg-slate-100 text-slate-700"}`}>{use}</span>;
}


export default function RecordingPlan({ s }) {
  const act = Object.entries(s.activation || {});
  const rec = s.recording || {};
  return (
    <div className="space-y-4">
      {s.yieldPlan && s.yieldPlan.length > 0 && (
        <Card title="Best-yield recording plan" tone="indigo">
          <ol className="list-decimal space-y-1.5 pl-5">
            {s.yieldPlan.map((x) => <li key={x}>{x}</li>)}
          </ol>
        </Card>
      )}
      {act.length > 0 && (
        <Card title="Which procedures to include, and how">
          <ul className="space-y-3">
            {act.map(([k, v]) => {
              const o = typeof v === "string" ? { how: v } : v;
              return (
                <li key={k} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{ACTIVATION_LABELS[k] || k}</span>
                    <UseBadge use={o.use} />
                  </div>
                  {o.how && <p><strong>How:</strong> {o.how}</p>}
                  {o.why && <p><strong>Why:</strong> {o.why}</p>}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
      {(rec.duration || rec.montage || rec.video || rec.ictal || (rec.special && rec.special.length > 0)) && (
        <Card title="Recording set-up and events">
          {rec.duration && <p><strong>Duration:</strong> {rec.duration}</p>}
          {rec.montage && <p><strong>Montage:</strong> {rec.montage}</p>}
          {rec.video && <p><strong>Video and extra channels:</strong> {rec.video}</p>}
          {rec.ictal && <p><strong>Capturing an event:</strong> {rec.ictal}</p>}
          {rec.special && rec.special.length > 0 && (
            <div>
              <strong>Special cautions</strong>
              <ul className="list-disc space-y-1 pl-5">{rec.special.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
