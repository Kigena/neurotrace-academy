import React, { useMemo, useRef, useState } from "react";
import { renderScene } from "../../eeg/generator";

/**
 * One test signal drawn through several filter settings, one row per setting, on a shared amplitude scale.
 * `scene` holds the signal (a "sine" finding) and `variants` lists the settings: [{ label, lff, hff }].
 * Drag across the rows to place a time cursor and compare when each wave peaks.
 * With `showTheory`, each row also states the expected amplitude and timing shift of a single-pole filter.
 */

const LABEL_W = 118;
const TRACE_W = 860;
const ROW_H = 104;
const TOP = 30;
const BOTTOM = 40;

export default function FilterStack({ scene, variants, hz, showTheory = false, caption }) {
  const svgRef = useRef(null);
  const [cursor, setCursor] = useState(null);
  const seconds = scene.seconds ?? 5;
  const sine = (scene.findings || []).find((f) => f.type === "sine");
  const freq = hz ?? sine?.hz ?? 1;
  const amp = sine?.uv ?? 100;
  const px = 38 / amp; // pixels per microvolt: an unfiltered sine fills about +/-38 px

  const rows = useMemo(() => {
    const base = { ...scene, preRollS: scene.preRollS ?? 10, lpOrder: 1, ekg: false };
    const render = (v) => renderScene({ ...base, ...v }, scene.montage || "single").channels[0].data;
    const fs = renderScene({ ...base, lff: 0, hff: 1e9 }, scene.montage || "single").fs;
    const ref = render({ lff: 0, hff: 1e9 });
    const amp = (d) => {
      const w = d.subarray(Math.floor(d.length * 0.3), Math.floor(d.length * 0.9));
      return (Math.max(...w) - Math.min(...w)) / 2;
    };
    // upward zero crossing nearest the middle of the page, linearly interpolated (seconds)
    const crossing = (d) => {
      const mid = Math.floor(d.length / 2);
      for (let k = 0; k < d.length / 2; k++) {
        for (const i of [mid + k, mid - k]) {
          if (i > 0 && i < d.length && d[i - 1] < 0 && d[i] >= 0) return (i - 1 + -d[i - 1] / (d[i] - d[i - 1])) / fs;
        }
      }
      return null;
    };
    const refAmp = amp(ref);
    const refT = crossing(ref);
    return variants.map((v) => {
      const data = render(v);
      const t = crossing(data);
      let shift = t != null && refT != null ? (t - refT) * 1000 : 0;
      const period = 1000 / freq;
      if (shift > period / 2) shift -= period; // keep the shift within half a cycle
      if (shift < -period / 2) shift += period;
      return { ...v, data, fs, gain: amp(data) / refAmp, shift };
    });
  }, [scene, variants, freq]);

  const height = TOP + rows.length * ROW_H + BOTTOM;
  const width = LABEL_W + TRACE_W + 20;
  const pxPerSec = TRACE_W / seconds;
  const tick = scene.tickS ?? (seconds <= 1 ? 0.05 : 1);

  const pathFor = (row, y0) => {
    let d = "";
    const step = seconds <= 1 ? 1 : Math.max(1, Math.floor(row.fs / 128));
    for (let i = 0; i < row.data.length; i += step) {
      if (i / row.fs > seconds + 1e-9) break;
      d += `${i ? "L" : "M"}${(LABEL_W + (i / row.fs) * pxPerSec).toFixed(1)} ${(y0 - row.data[i] * px).toFixed(1)}`; // positive up here so peaks read as peaks
    }
    return d;
  };

  const toSec = (evt) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return Math.max(0, Math.min(seconds, (p.x - LABEL_W) / pxPerSec));
  };
  const dragging = useRef(false);

  return (
    <figure className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">{freq} Hz sine wave · same signal, different filters</span>
        <span>Drag across the rows to place a cursor and compare when each wave peaks.</span>
        {cursor != null && (
          <button type="button" onClick={() => setCursor(null)} className="ml-auto rounded border border-slate-300 bg-white px-2 py-0.5 font-semibold hover:bg-slate-100">
            Clear cursor
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="block h-auto w-full select-none bg-white"
            style={{ touchAction: "none", cursor: "col-resize" }}
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture?.(e.pointerId);
              setCursor(toSec(e));
            }}
            onPointerMove={(e) => dragging.current && setCursor(toSec(e))}
            onPointerUp={() => (dragging.current = false)}
            onPointerLeave={() => (dragging.current = false)}
            role="img"
            aria-label={`${freq} Hz sine wave shown with ${rows.map((r) => r.label).join(", ")}`}
          >
            {Array.from({ length: Math.floor(seconds / tick + 1e-9) + 1 }, (_, k) => {
              const t = k * tick;
              return (
                <g key={k}>
                  <line x1={LABEL_W + t * pxPerSec} x2={LABEL_W + t * pxPerSec} y1={TOP - 8} y2={height - BOTTOM + 6} stroke="#cbd5e1" strokeDasharray="3 4" strokeWidth={0.7} />
                  <text x={LABEL_W + t * pxPerSec} y={height - BOTTOM + 20} textAnchor="middle" fontSize="11" fill="#64748b">
                    {tick < 1 ? `${Math.round(t * 1000)} ms` : `${t} s`}
                  </text>
                </g>
              );
            })}
            {rows.map((row, i) => {
              const y0 = TOP + i * ROW_H + ROW_H / 2;
              const { gain, shift } = row;
              return (
                <g key={row.label}>
                  <line x1={LABEL_W} x2={LABEL_W + TRACE_W} y1={y0} y2={y0} stroke="#e2e8f0" />
                  <text x={6} y={y0 - 2} fontSize="12" fontWeight="600" fill="#0f172a">{row.label}</text>
                  <text x={6} y={y0 + 13} fontSize="10" fill="#64748b">
                    {row.lff ? `LFF ${row.lff < 1 ? row.lff.toFixed(2) : row.lff.toFixed(1)} Hz` : ""}
                    {row.hff && row.hff < 200 ? `HFF ${row.hff} Hz` : ""}
                  </text>
                  {showTheory && (
                    <text x={6} y={y0 + 27} fontSize="10" fill="#4338ca">
                      {(gain * 100).toFixed(0)}% · {Math.abs(shift) < 0.5 ? "no shift" : `${shift < 0 ? "earlier" : "later"} ${Math.abs(shift).toFixed(0)} ms`}
                    </text>
                  )}
                  <path d={pathFor(row, y0)} fill="none" stroke="#0f172a" strokeWidth={1.4} />
                </g>
              );
            })}
            {cursor != null && (
              <g pointerEvents="none">
                <line x1={LABEL_W + cursor * pxPerSec} x2={LABEL_W + cursor * pxPerSec} y1={TOP - 8} y2={height - BOTTOM + 6} stroke="#4f46e5" strokeWidth={1.4} />
                <rect x={LABEL_W + cursor * pxPerSec + 4} y={TOP - 8} width={104} height={18} rx={3} fill="#4f46e5" />
                <text x={LABEL_W + cursor * pxPerSec + 10} y={TOP + 5} fontSize="11" fill="#fff" fontWeight="600">
                  {(cursor * 1000).toFixed(0)} ms
                </text>
              </g>
            )}
            <text x={LABEL_W} y={height - 6} fontSize="9" fill="#94a3b8">NeuroLinea synthetic test signal · for education</text>
          </svg>
        </div>
      </div>
      {caption && <figcaption className="border-t border-slate-200 px-3 py-2 text-xs text-slate-500">{caption}</figcaption>}
    </figure>
  );
}
