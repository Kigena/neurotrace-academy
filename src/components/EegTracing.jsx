import React, { useEffect, useMemo, useRef, useState } from "react";
import { renderScene } from "../eeg/generator";

/**
 * Renders a NeuroLinea synthetic EEG page (see src/eeg/generator.js).
 * Display follows clinical convention: negative up, 10 s per page, 1-s grid.
 * Tools: montage switch (when the scene allows), sensitivity, time caliper,
 * enlarge.
 */

const LABEL_W = 74;
const TRACE_W = 1000; // 10 s -> 100 px/s; "paper" 30 mm/s -> 300 mm
const PX_PER_MM = TRACE_W / 300;
const ROW = 27;
const HEADER = 40;
const FOOTER = 30;
const GROUPS = { longitudinal: [4, 4, 4, 4, 2], transverse: [3, 4, 4, 4, 3], referential: [8, 8], eyeCheck: [2, 2, 2, 2, 2, 2, 2] };
const SENSITIVITIES = [3, 5, 7, 10, 15, 20, 30, 50];
const STATE_LABEL = { awake: "awake", drowsy: "drowsy", n2: "stage N2 sleep", stupor: "stuporous", semicomatose: "semicomatose", sleep: "asleep" };

function ageText(age) {
  if (age == null) return null;
  if (age < 1) return `${Math.round(age * 12)} months`;
  return `${age} years`;
}

function pathFor(data, x0, y0, pxPerSample, pxPerUv) {
  let d = "";
  for (let i = 0; i < data.length; i++) {
    const x = x0 + i * pxPerSample;
    const y = y0 + data[i] * pxPerUv; // positive (input 1 more positive) plots DOWN
    d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d;
}

function TracingSvg({ scene, montage, sens, caliper, onCaliper, caliperMode }) {
  const svgRef = useRef(null);
  const drag = useRef(null);
  const page = useMemo(() => renderScene(scene, montage), [scene, montage]);
  const seconds = page.seconds;
  const pxPerSec = TRACE_W / seconds;
  const pxPerSample = pxPerSec / page.fs;
  const pxPerUv = PX_PER_MM / sens;
  const groups = GROUPS[montage] || [page.channels.length];

  // y position of each channel baseline, with small gaps between chains
  const rows = [];
  let y = HEADER + ROW * 0.7;
  let gi = 0;
  let inGroup = 0;
  for (let c = 0; c < page.channels.length; c++) {
    rows.push(y);
    y += ROW;
    inGroup += 1;
    if (inGroup === groups[gi]) {
      gi += 1;
      inGroup = 0;
      y += 7;
    }
  }
  const ekgY = page.ekg ? y + 4 : null;
  const height = (ekgY ?? y) + ROW * 0.6 + FOOTER;
  const width = LABEL_W + TRACE_W + 64;
  const ekgSens = scene.ekgSens ?? 100;
  const calUv = sens <= 10 ? 50 : sens <= 20 ? 100 : 200;

  const toX = (evt) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return Math.max(LABEL_W, Math.min(LABEL_W + TRACE_W, p.x));
  };
  const onDown = (e) => {
    if (!caliperMode) return;
    e.preventDefault();
    const x = toX(e);
    drag.current = x;
    onCaliper({ x1: x, x2: x });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!caliperMode || drag.current == null) return;
    onCaliper({ x1: drag.current, x2: toX(e) });
  };
  const onUp = () => {
    drag.current = null;
  };

  const cal = caliper && Math.abs(caliper.x2 - caliper.x1) > 1 ? caliper : null;
  const calMs = cal ? (Math.abs(cal.x2 - cal.x1) / pxPerSec) * 1000 : 0;
  const stateText = [ageText(scene.ageYears), STATE_LABEL[scene.state] || scene.state].filter(Boolean).join(", ");

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto w-full select-none bg-white"
      style={{ touchAction: caliperMode ? "none" : "auto", cursor: caliperMode ? "col-resize" : "default" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      role="img"
      aria-label={`EEG tracing, ${page.montageLabel}, ${stateText}`}
    >
      {/* header */}
      <text x={6} y={15} fontSize="11" fill="#475569" fontFamily="ui-monospace, monospace">NeuroLinea · {page.montageLabel}</text>
      <text x={LABEL_W + TRACE_W / 2} y={15} fontSize="12" fill="#0f172a" fontWeight="600" textAnchor="middle">{stateText}</text>
      <text x={width - 6} y={15} fontSize="11" fill="#475569" textAnchor="end" fontFamily="ui-monospace, monospace">
        LFF {scene.lff ?? 1} Hz · HFF {scene.hff ?? 70} Hz{scene.notch ? " · notch" : ""} · {sens} µV/mm
      </text>

      {/* time grid */}
      {Array.from({ length: seconds + 1 }, (_, s) => (
        <g key={s}>
          <line x1={LABEL_W + s * pxPerSec} x2={LABEL_W + s * pxPerSec} y1={HEADER - 6} y2={height - FOOTER + 2} stroke="#cbd5e1" strokeDasharray={s % 5 === 0 ? "0" : "3 4"} strokeWidth={s % 5 === 0 ? 0.8 : 0.6} />
          {Array.from({ length: s < seconds ? 4 : 0 }, (_, k) => (
            <line key={k} x1={LABEL_W + (s + (k + 1) / 5) * pxPerSec} x2={LABEL_W + (s + (k + 1) / 5) * pxPerSec} y1={HEADER - 6} y2={HEADER - 2} stroke="#94a3b8" strokeWidth={0.6} />
          ))}
        </g>
      ))}
      <line x1={LABEL_W} x2={LABEL_W + TRACE_W} y1={HEADER - 6} y2={HEADER - 6} stroke="#94a3b8" strokeWidth={0.8} />

      <defs>
        <clipPath id="trace-area">
          <rect x={LABEL_W} y={HEADER - 6} width={TRACE_W} height={height - HEADER - FOOTER + 8} />
        </clipPath>
      </defs>

      {/* channels */}
      {page.channels.map((ch, c) => (
        <g key={ch.label}>
          <text x={6} y={rows[c] + 4} fontSize="11" fill="#1e293b" fontFamily="ui-monospace, monospace">{ch.label}</text>
          <path d={pathFor(ch.data, LABEL_W, rows[c], pxPerSample, pxPerUv)} fill="none" stroke="#0f172a" strokeWidth={0.75} clipPath="url(#trace-area)" />
        </g>
      ))}
      {page.ekg && (
        <g>
          <text x={6} y={ekgY + 4} fontSize="11" fill="#1e293b" fontFamily="ui-monospace, monospace">EKG</text>
          <path d={pathFor(page.ekg, LABEL_W, ekgY, pxPerSample, PX_PER_MM / ekgSens)} fill="none" stroke="#334155" strokeWidth={0.75} clipPath="url(#trace-area)" />
        </g>
      )}

      {/* calibration bar */}
      <g>
        <line x1={LABEL_W + TRACE_W + 14} x2={LABEL_W + TRACE_W + 14} y1={HEADER + 6} y2={HEADER + 6 + calUv * pxPerUv} stroke="#0f172a" strokeWidth={1.4} />
        <line x1={LABEL_W + TRACE_W + 10} x2={LABEL_W + TRACE_W + 18} y1={HEADER + 6} y2={HEADER + 6} stroke="#0f172a" />
        <line x1={LABEL_W + TRACE_W + 10} x2={LABEL_W + TRACE_W + 18} y1={HEADER + 6 + calUv * pxPerUv} y2={HEADER + 6 + calUv * pxPerUv} stroke="#0f172a" />
        <text x={LABEL_W + TRACE_W + 22} y={HEADER + 10 + (calUv * pxPerUv) / 2} fontSize="10" fill="#334155">{calUv} µV</text>
        <text x={LABEL_W + TRACE_W + 8} y={height - FOOTER + 16} fontSize="10" fill="#64748b">1 s</text>
      </g>

      {/* markers */}
      {page.markers.filter((m) => m.label).map((m) => (
        <g key={`${m.at}-${m.label}`}>
          <line x1={LABEL_W + m.at * pxPerSec} x2={LABEL_W + m.at * pxPerSec} y1={height - FOOTER + 2} y2={height - FOOTER + 9} stroke="#4f46e5" strokeWidth={1.2} />
          <text x={LABEL_W + m.at * pxPerSec + 3} y={height - FOOTER + 20} fontSize="11" fill="#4338ca" fontWeight="600">{m.label}</text>
        </g>
      ))}
      <text x={LABEL_W} y={height - 4} fontSize="9" fill="#94a3b8">NeuroLinea synthetic tracing · for education</text>

      {/* caliper */}
      {cal && (
        <g pointerEvents="none">
          <rect x={Math.min(cal.x1, cal.x2)} y={HEADER - 6} width={Math.abs(cal.x2 - cal.x1)} height={height - HEADER - FOOTER + 8} fill="#6366f1" opacity={0.1} />
          <line x1={cal.x1} x2={cal.x1} y1={HEADER - 6} y2={height - FOOTER + 2} stroke="#4f46e5" strokeWidth={1} />
          <line x1={cal.x2} x2={cal.x2} y1={HEADER - 6} y2={height - FOOTER + 2} stroke="#4f46e5" strokeWidth={1} />
          <rect x={Math.max(cal.x1, cal.x2) + 4} y={HEADER - 4} width={112} height={18} rx={3} fill="#4f46e5" />
          <text x={Math.max(cal.x1, cal.x2) + 10} y={HEADER + 9} fontSize="11" fill="#fff" fontWeight="600">
            {Math.round(calMs)} ms{calMs > 20 ? ` · ${(1000 / calMs).toFixed(1)} Hz` : ""}
          </text>
        </g>
      )}
    </svg>
  );
}

export default function EegTracing({ scene, caption }) {
  const montages = scene.montages?.length ? scene.montages : [scene.montage || "longitudinal"];
  const [montage, setMontage] = useState(scene.montage || montages[0]);
  const [sens, setSens] = useState(scene.sensitivity ?? 7);
  const [caliperMode, setCaliperMode] = useState(false);
  const [caliper, setCaliper] = useState(null);
  const [enlarged, setEnlarged] = useState(false);

  useEffect(() => {
    setMontage(scene.montage || montages[0]);
    setSens(scene.sensitivity ?? 7);
    setCaliper(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    if (!enlarged) return undefined;
    const onKey = (e) => e.key === "Escape" && setEnlarged(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [enlarged]);

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs">
      {montages.length > 1 && (
        <div className="flex rounded-md border border-slate-300 bg-white p-0.5" role="group" aria-label="Montage">
          {montages.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMontage(m)}
              className={`rounded px-2 py-1 font-semibold ${montage === m ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {m === "longitudinal" ? "Longitudinal" : m === "transverse" ? "Transverse" : m === "eyeCheck" ? "Eye check" : "Referential"}
            </button>
          ))}
        </div>
      )}
      <label className="flex items-center gap-1 text-slate-600">
        Sens
        <select value={sens} onChange={(e) => setSens(Number(e.target.value))} className="rounded border border-slate-300 bg-white px-1 py-0.5">
          {SENSITIVITIES.map((s) => (
            <option key={s} value={s}>{s} µV/mm</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => {
          setCaliperMode((v) => !v);
          setCaliper(null);
        }}
        className={`rounded-md border px-2 py-1 font-semibold ${caliperMode ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
        title="Drag across the tracing to measure duration"
      >
        📏 Caliper{caliperMode ? " on" : ""}
      </button>
      {caliperMode && <span className="text-slate-500">Drag across a waveform to measure it</span>}
      <button type="button" onClick={() => setEnlarged(true)} className="ml-auto rounded-md border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100">
        ⤢ Enlarge
      </button>
    </div>
  );

  const svg = (
    <TracingSvg scene={scene} montage={montage} sens={sens} caliper={caliper} onCaliper={setCaliper} caliperMode={caliperMode} />
  );

  return (
    <figure className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      {toolbar}
      <div className="overflow-x-auto">
        <div className="min-w-[860px]">{svg}</div>
      </div>
      {caption && <figcaption className="border-t border-slate-200 px-3 py-2 text-xs text-slate-500">{caption}</figcaption>}

      {enlarged && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/85 p-3" role="dialog" aria-modal="true" aria-label="Enlarged EEG tracing">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white">
            <div className="flex items-center">
              <div className="flex-1">{toolbar}</div>
              <button type="button" onClick={() => setEnlarged(false)} className="border-b border-l border-slate-200 bg-slate-50 px-4 py-2 text-xl leading-none text-slate-600 hover:bg-slate-100" aria-label="Close">
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="min-w-[1500px]">{svg}</div>
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}

