import React, { useRef } from "react";
import { gainLabel } from "../../ncs/studies.js";

/**
 * NCS machine screen: stacked sweeps (one per stimulation site), negative up,
 * 10 horizontal divisions, gain per division. Clicking a row in mark mode
 * places that row's onset or peak cursor.
 */

const LABEL_W = 92;
const DIV = 54;
const ROW_DIVS = 4;
const TOP = 26;

export default function NcsTrace({ rows, gain, sweepMsPerDiv, markMode, onMark }) {
  const svgRef = useRef(null);
  const traceW = DIV * 10;
  const rowH = DIV * ROW_DIVS;
  const height = TOP + Math.max(1, rows.length) * rowH + 22;
  const width = LABEL_W + traceW + 12;
  const pxPerMs = DIV / sweepMsPerDiv;
  const pxPerUv = DIV / gain;

  const click = (e) => {
    if (!markMode || !onMark) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const r = Math.floor((p.y - TOP) / rowH);
    if (r < 0 || r >= rows.length || p.x < LABEL_W || p.x > LABEL_W + traceW) return;
    onMark(rows[r].id, markMode, +((p.x - LABEL_W) / pxPerMs).toFixed(2));
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={`block h-auto w-full select-none rounded-lg bg-slate-950 ${markMode ? "cursor-crosshair" : ""}`}
      onClick={click}
      role="img"
      aria-label="Nerve conduction responses"
    >
      <text x={LABEL_W} y={16} fill="#94a3b8" fontSize="11" fontFamily="ui-monospace, monospace">
        {gainLabel(gain)} · {sweepMsPerDiv} ms/div · negative up
      </text>
      {rows.length === 0 && (
        <text x={LABEL_W + traceW / 2} y={TOP + rowH / 2} fill="#64748b" fontSize="13" textAnchor="middle">
          Place the electrodes, choose a site and press Stimulate.
        </text>
      )}
      {rows.map((row, r) => {
        const y0 = TOP + r * rowH;
        const base = y0 + DIV * 2.3;
        const sw = row.sweep;
        const n = sw ? Math.min(sw.data.length, Math.round(sweepMsPerDiv * 10 * sw.fs) + 1) : 0;
        // Like a real screen, a trace may run into the neighbouring rows; only the screen edge clips it.
        let d = "";
        let offRow = false;
        for (let i = 0; i < n; i++) {
          const x = LABEL_W + (i / sw.fs) * pxPerMs;
          const raw = base + sw.data[i] * pxPerUv;
          if (i / sw.fs > 0.6 && (raw < y0 || raw > y0 + rowH)) offRow = true; // ignore the stimulus artifact
          const y = Math.max(TOP, Math.min(height - 22, raw));
          d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
        }
        const pathOf = (swp) => {
          let dd = "";
          const nn = Math.min(swp.data.length, Math.round(sweepMsPerDiv * 10 * swp.fs) + 1);
          for (let i = 0; i < nn; i++) {
            const y = Math.max(TOP, Math.min(height - 22, base + swp.data[i] * pxPerUv));
            dd += (i ? "L" : "M") + (LABEL_W + (i / swp.fs) * pxPerMs).toFixed(1) + " " + y.toFixed(1);
          }
          return dd;
        };
        const mark = (ms, label, color) => {
          if (ms == null) return null;
          const x = LABEL_W + ms * pxPerMs;
          return (
            <g key={label}>
              <line x1={x} x2={x} y1={y0 + 6} y2={y0 + rowH - 6} stroke={color} strokeDasharray="3 3" />
              <text x={x + 3} y={y0 + 16} fill={color} fontSize="11" fontWeight="600">{label} {ms.toFixed(2)}</text>
            </g>
          );
        };
        return (
          <g key={row.id}>
            {Array.from({ length: 11 }, (_, k) => (
              <line key={`v${k}`} x1={LABEL_W + k * DIV} x2={LABEL_W + k * DIV} y1={y0} y2={y0 + rowH} stroke="#1e293b" />
            ))}
            {Array.from({ length: ROW_DIVS + 1 }, (_, k) => (
              <line key={`h${k}`} x1={LABEL_W} x2={LABEL_W + traceW} y1={y0 + k * DIV} y2={y0 + k * DIV} stroke={k === 0 ? "#334155" : "#1e293b"} />
            ))}
            <text x={8} y={y0 + 22} fill="#e2e8f0" fontSize="12" fontWeight="600">{row.label}</text>
            {row.sub && <text x={8} y={y0 + 38} fill="#94a3b8" fontSize="10">{row.sub}</text>}
            {(row.overlays || []).map((o) => <path key={o.id} d={pathOf(o.sweep)} fill="none" stroke={o.color} strokeWidth="1.2" opacity="0.85" />)}
            {sw && <path d={d} fill="none" stroke="#fbbf24" strokeWidth="1.4" />}
            {offRow && <text x={8} y={y0 + rowH - 10} fill="#fca5a5" fontSize="10">Too tall: reduce the gain</text>}
            {mark(row.marks?.onset, "O", "#38bdf8")}
            {mark(row.marks?.peak, "P", "#f472b6")}
          </g>
        );
      })}
      <text x={LABEL_W + traceW} y={height - 6} fill="#64748b" fontSize="10" textAnchor="end">NeuroLinea synthetic NCS · for education</text>
    </svg>
  );
}
