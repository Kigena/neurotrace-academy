import React, { useMemo, useState } from "react";
import { analysePhase as analyse } from "../../eeg/phase";

/**
 * Phase-reversal calculator: enter the potential (µV, negative = more negative) at four electrodes in a chain.
 * Each channel is input 1 minus input 2; a negative result deflects UP, a positive result deflects DOWN.
 * Adjacent channels that point toward each other mark a negative phase reversal at their shared electrode;
 * channels that point away mark a positive reversal.
 */

const PRESETS = [
  ["Negative focus at electrode 2", [-30, -90, -50, -20]],
  ["Positive focus at electrode 2", [30, 90, 50, 20]],
  ["Equal at electrodes 2 and 3", [-30, -90, -90, -30]],
  ["Two peaks (double reversal)", [-90, -50, -90, -20]],
  ["Maximum at the end of the chain", [-90, -70, -50, -30]],
];

function Wave({ dir, size }) {
  const w = 120;
  const h = 34;
  const amp = Math.min(h, 4 + Math.abs(size) * 0.45);
  const mid = h;
  const apex = dir === "up" ? mid - amp : dir === "down" ? mid + amp : mid;
  return (
    <svg viewBox={`0 0 ${w} ${h * 2}`} className="h-14 w-32" aria-hidden="true">
      <line x1="0" x2={w} y1={mid} y2={mid} stroke="#e2e8f0" />
      <path d={`M10 ${mid} L${w / 2} ${apex} L${w - 10} ${mid}`} fill="none" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function PhaseCalc() {
  // keep the raw text so a leading "-" or a trailing "." can be typed
  const [raw, setRaw] = useState(PRESETS[0][1].map(String));
  const v = useMemo(() => raw.map((r) => (Number.isFinite(Number(r)) && r.trim() !== "" ? Number(r) : 0)), [raw]);
  const { ch, dir, notes } = useMemo(() => analyse(v), [v]);
  const setOne = (i, val) => setRaw((old) => old.map((x, j) => (j === i ? val : x)));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="font-semibold text-slate-900">Phase-reversal calculator</h4>
      <p className="mb-3 text-xs text-slate-500">Potential at each electrode in µV (a more negative number means more negative potential). Channel = input 1 − input 2; negative deflects up.</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map(([label, vals]) => (
          <button key={label} type="button" onClick={() => setRaw(vals.map(String))} className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100">
            {label}
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-4">
        {raw.map((x, i) => (
          <label key={i} className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Electrode {i + 1}</span>
            <input
              type="text"
              inputMode="decimal"
              value={x}
              onChange={(e) => setOne(i, e.target.value)}
              className="w-24 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>
        ))}
      </div>
      <div className="space-y-1">
        {ch.map((x, i) => (
          <div key={i} className="flex items-center gap-3 border-t border-slate-100 py-1 text-sm">
            <div className="w-44 font-mono text-xs text-slate-600">
              {i + 1}-{i + 2}: {v[i]} − ({v[i + 1]}) = {x > 0 ? "+" : ""}{x}
            </div>
            <Wave dir={dir[i]} size={x} />
            <div className="text-xs font-semibold text-slate-700">{dir[i] === "up" ? "up" : dir[i] === "down" ? "down" : "flat"}</div>
          </div>
        ))}
      </div>
      <ul className="mt-3 space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
