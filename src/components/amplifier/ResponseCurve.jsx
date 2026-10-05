import React, { useMemo, useState } from "react";
import { HFF_CHOICES, LFF_CHOICES, bandGain } from "../../eeg/filters";

const W = 640;
const H = 280;
const PAD = { l: 52, r: 16, t: 14, b: 38 };
const F_MIN = 0.05;
const F_MAX = 150;
const TICKS = [0.1, 0.3, 1, 3, 10, 30, 100];

const xOf = (f) => PAD.l + ((Math.log10(f) - Math.log10(F_MIN)) / (Math.log10(F_MAX) - Math.log10(F_MIN))) * (W - PAD.l - PAD.r);
const yOf = (g) => PAD.t + (1 - g) * (H - PAD.t - PAD.b);

/** Gain-versus-frequency curve for the chosen LFF and HFF, drawn from the same single-pole formulas as the calculators. */
export default function ResponseCurve({ initialLff = 1, initialHff = 70 }) {
  const [lff, setLff] = useState(initialLff);
  const [hff, setHff] = useState(initialHff);

  const path = useMemo(() => {
    let d = "";
    for (let i = 0; i <= 240; i++) {
      const f = 10 ** (Math.log10(F_MIN) + (i / 240) * (Math.log10(F_MAX) - Math.log10(F_MIN)));
      d += `${i ? "L" : "M"}${xOf(f).toFixed(1)} ${yOf(bandGain(f, lff, hff)).toFixed(1)}`;
    }
    return d;
  }, [lff, hff]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
        <h4 className="font-semibold text-slate-900">Frequency response</h4>
        <label className="flex items-center gap-1.5 text-slate-600">
          LFF
          <select value={lff} onChange={(e) => setLff(Number(e.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1">
            {LFF_CHOICES.map((x) => <option key={x} value={x}>{x} Hz</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-slate-600">
          HFF
          <select value={hff} onChange={(e) => setHff(Number(e.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1">
            {HFF_CHOICES.map((x) => <option key={x} value={x}>{x} Hz</option>)}
          </select>
        </label>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Frequency response with LFF ${lff} Hz and HFF ${hff} Hz`}>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={PAD.l} x2={W - PAD.r} y1={yOf(g)} y2={yOf(g)} stroke="#e2e8f0" />
            <text x={PAD.l - 8} y={yOf(g) + 4} textAnchor="end" fontSize="11" fill="#64748b">{Math.round(g * 100)}%</text>
          </g>
        ))}
        {TICKS.map((f) => (
          <g key={f}>
            <line x1={xOf(f)} x2={xOf(f)} y1={PAD.t} y2={H - PAD.b} stroke="#f1f5f9" />
            <text x={xOf(f)} y={H - PAD.b + 16} textAnchor="middle" fontSize="11" fill="#64748b">{f}</text>
          </g>
        ))}
        <text x={(PAD.l + W - PAD.r) / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#475569">Frequency (Hz, log scale)</text>
        <line x1={PAD.l} x2={W - PAD.r} y1={yOf(0.7071)} y2={yOf(0.7071)} stroke="#f59e0b" strokeDasharray="5 4" />
        <text x={W - PAD.r - 4} y={yOf(0.7071) - 5} textAnchor="end" fontSize="11" fill="#b45309">70.7% (−3 dB): the cutoff level</text>
        {[lff, hff].map((fc) => (
          <g key={fc}>
            <line x1={xOf(fc)} x2={xOf(fc)} y1={yOf(0.7071)} y2={H - PAD.b} stroke="#f59e0b" strokeWidth="1" />
            <circle cx={xOf(fc)} cy={yOf(0.7071)} r="3.5" fill="#f59e0b" />
          </g>
        ))}
        <path d={path} fill="none" stroke="#4f46e5" strokeWidth="2.5" />
      </svg>
      <p className="mt-2 text-xs text-slate-500">
        The curve is the product of a single-pole high-pass (LFF) and low-pass (HFF). Each filter on its own passes exactly 70.7% of the amplitude at its cutoff (the dots mark that level);
        the plotted curve is the two combined, so it can sit a little below a dot when the cutoffs are close together. Activity inside the band is barely touched; activity outside it is reduced gradually, not cut off at a line.
      </p>
    </div>
  );
}
