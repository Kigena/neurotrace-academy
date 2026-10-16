import React, { useEffect, useRef, useState } from "react";
import { polylineLength, smoothPath } from "../../ncs/geometry.js";
import { stimPoles } from "../../ncs/fieldSim.js";

/**
 * Interactive anatomy workspace. Everything is drawn in model coordinates
 * (millimetres); zoom and pan only change the SVG viewBox, so electrodes stay
 * attached to the same anatomical spot at any size. Labels are scaled by the
 * current zoom so they keep the same size on screen.
 */

const LAYER_STYLE = {
  skin: { fill: "#f3dfcf", stroke: "#a98a74" },
  surface: "#c9a68e",
  muscle: { fill: "rgba(190, 80, 70, 0.22)", stroke: "rgba(150, 50, 45, 0.7)" },
  tendon: { fill: "rgba(235, 225, 200, 0.75)", stroke: "rgba(140, 120, 90, 0.8)" },
  bone: { fill: "rgba(250, 246, 230, 0.85)", stroke: "#8a7f63" },
  nerve: "#eab308",
};

// Screen point to model coordinates (millimetres), independent of zoom and pan.
function toModelPoint(svg, e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: +p.x.toFixed(1), y: +p.y.toFixed(1) };
}

export default function AnatomyCanvas({ model, view, setView, layers, setup, onPlace, tool, onToolDone, tape, setTape, targets, height = 560 }) {
  const svgRef = useRef(null);
  const drag = useRef(null);
  const [px, setPx] = useState({ w: 800, h: height });

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setPx({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    const onWheel = (e) => {
      e.preventDefault();
      const p = toModelPoint(el, e);
      const f = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      setView((v) => {
        const w = Math.max(40, Math.min(700, v.w * f));
        const h = (v.h * w) / v.w;
        return { x: p.x - ((p.x - v.x) * w) / v.w, y: p.y - ((p.y - v.y) * h) / v.h, w, h };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
    };
  }, [setView]);

  // model units per screen pixel (viewBox is fitted with "meet")
  const k = Math.max(view.w / Math.max(1, px.w), view.h / Math.max(1, px.h));
  const fs = 12 * k;

  const toModel = (e) => toModelPoint(svgRef.current, e);

  const onDown = (e) => {
    const p = toModel(e);
    const handle = e.target.closest?.("[data-handle]")?.getAttribute("data-handle");
    if (tool === "tape") {
      setTape([...(tape || []), [p.x, p.y]]);
      return;
    }
    if (["g1", "g2", "ground"].includes(tool)) {
      onPlace(tool, p);
      onToolDone();
      return;
    }
    if (tool === "stim") {
      onPlace("stim", { x: p.x, y: p.y, angle: setup.stim?.angle ?? Math.PI / 2 });
      onToolDone();
      return;
    }
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (handle === "rotate") drag.current = { kind: "rotate" };
    else if (handle) drag.current = { kind: "move", key: handle, dx: (setup[handle]?.x ?? p.x) - p.x, dy: (setup[handle]?.y ?? p.y) - p.y };
    else drag.current = { kind: "pan", sx: e.clientX, sy: e.clientY, v: view };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    if (d.kind === "pan") {
      setView({ ...d.v, x: d.v.x - (e.clientX - d.sx) * k, y: d.v.y - (e.clientY - d.sy) * k });
      return;
    }
    const p = toModel(e);
    if (d.kind === "rotate") {
      const c = setup.stim;
      onPlace("stim", { ...c, angle: Math.atan2(p.y - c.y, p.x - c.x) });
    } else if (d.key === "stim") onPlace("stim", { ...setup.stim, x: p.x + d.dx, y: p.y + d.dy });
    else onPlace(d.key, { x: p.x + d.dx, y: p.y + d.dy });
  };
  const onUp = () => { drag.current = null; };

  const label = (x, y, text, color, anchor = "start") => (
    <text x={x} y={y} fontSize={fs} fontWeight="700" fill={color} textAnchor={anchor} stroke="#fff" strokeWidth={3 * k} paintOrder="stroke" pointerEvents="none">{text}</text>
  );

  const electrode = (key, color, text, r) => {
    const p = setup[key];
    if (!p) return null;
    return (
      <g data-handle={key} style={{ cursor: "grab" }}>
        <circle cx={p.x} cy={p.y} r={r} fill={color} fillOpacity="0.85" stroke="#fff" strokeWidth={1.5 * k} />
        <circle cx={p.x} cy={p.y} r={Math.max(r, 10 * k)} fill="transparent" />
        {label(p.x + r + 3 * k, p.y - r - 2 * k, text, color)}
      </g>
    );
  };

  let stimEl = null;
  if (setup.stim) {
    const { cathode, anode } = stimPoles(setup.stim);
    const c = setup.stim;
    const ux = Math.cos(c.angle), uy = Math.sin(c.angle);
    const hx = c.x + ux * 30, hy = c.y + uy * 30;
    stimEl = (
      <g>
        <g data-handle="stim" style={{ cursor: "grab" }}>
          <line x1={anode.x} y1={anode.y} x2={cathode.x} y2={cathode.y} stroke="#1f2937" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
          <circle cx={cathode.x} cy={cathode.y} r="4.5" fill="#111827" stroke="#fff" strokeWidth={1.2 * k} />
          <circle cx={anode.x} cy={anode.y} r="4.5" fill="#dc2626" stroke="#fff" strokeWidth={1.2 * k} />
        </g>
        {label(cathode.x + 7 * k, cathode.y + 4 * k, "− cathode", "#111827")}
        {label(anode.x + 7 * k, anode.y + 4 * k, "+ anode", "#b91c1c")}
        <line x1={cathode.x} y1={cathode.y} x2={hx} y2={hy} stroke="#6366f1" strokeWidth={1.2 * k} strokeDasharray={`${3 * k} ${3 * k}`} />
        <g data-handle="rotate" style={{ cursor: "alias" }}>
          <circle cx={hx} cy={hy} r={Math.max(4, 8 * k)} fill="#6366f1" stroke="#fff" strokeWidth={1.5 * k} />
          {label(hx + 10 * k, hy + 4 * k, "rotate", "#4f46e5")}
        </g>
      </g>
    );
  }

  const tapeLen = tape && tape.length > 1 ? polylineLength(tape) : 0;

  return (
    <svg
      ref={svgRef}
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="block w-full touch-none select-none bg-sky-50"
      style={{ height, cursor: tool === "move" ? "grab" : "crosshair" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      role="img"
      aria-label={model.ORIENTATION.title}
    >
      <path d={smoothPath(model.SKIN)} fill={LAYER_STYLE.skin.fill} stroke={LAYER_STYLE.skin.stroke} strokeWidth="1.5" />
      {Object.values(model.SURFACE).map((pts, i) => (
        <path key={i} d={smoothPath(pts, false)} fill="none" stroke={LAYER_STYLE.surface} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
      ))}
      {layers.muscle && model.MUSCLES.map((m) => {
        const fill = m.tendon ? LAYER_STYLE.tendon.fill : LAYER_STYLE.muscle.fill;
        const stroke = m.tendon ? LAYER_STYLE.tendon.stroke : LAYER_STYLE.muscle.stroke;
        return m.pts
          ? <path key={m.name} d={smoothPath(m.pts)} fill={fill} stroke={stroke} strokeWidth="1"><title>{m.name}</title></path>
          : <ellipse key={m.name} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} transform={`rotate(${m.rot || 0} ${m.cx} ${m.cy})`} fill={fill} stroke={stroke} strokeWidth="1"><title>{m.name}</title></ellipse>;
      })}
      {layers.bone && (
        <g>
          {model.BONES.map((b) => (
            <path key={b.name} d={smoothPath(b.line, false)} fill="none" stroke={LAYER_STYLE.bone.stroke} strokeWidth="5" strokeLinecap="round" strokeDasharray={b.dashed ? "6 5" : undefined} opacity="0.6"><title>{b.name}</title></path>
          ))}
          {model.BONE_SHAPES.map((b) => (
            <ellipse key={b.name} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={LAYER_STYLE.bone.fill} stroke={LAYER_STYLE.bone.stroke} strokeDasharray={b.dashed ? "3 2" : undefined}><title>{b.name}</title></ellipse>
          ))}
        </g>
      )}
      {layers.nerve && (
        <g>
          {(model.NERVE_DRAW || [...(model.NERVE_BRANCHES || []).map((b) => ({ ...b, thin: true })), { name: "Sural nerve", pts: model.NERVE }]).map((nv) => (
            <path key={nv.name} d={smoothPath(nv.pts, false)} fill="none" stroke={nv.color || LAYER_STYLE.nerve} strokeWidth={nv.thin ? 2 : 3} opacity={nv.thin ? 0.8 : 1}><title>{nv.name}</title></path>
          ))}
        </g>
      )}
      {layers.landmarks && model.LANDMARKS.map((l) => (
        <g key={l.id} pointerEvents="none">
          <circle cx={l.x} cy={l.y} r={2.2 * k} fill="#475569" />
          {label(l.x + l.dx * k, l.y + l.dy * k + 4 * k, l.label, "#334155", l.dx < 0 ? "end" : l.dx > 0 ? "start" : "middle")}
        </g>
      ))}
      {targets && targets.map((t) => (
        <g key={t.label} pointerEvents="none">
          <circle cx={t.x} cy={t.y} r={t.r} fill="rgba(34,197,94,0.12)" stroke="#16a34a" strokeDasharray={`${4 * k} ${3 * k}`} strokeWidth={1.2 * k} />
          {label(t.x - t.r - 4 * k, t.y + 4 * k, t.label, "#15803d", "end")}
        </g>
      ))}
      {tape && tape.length > 0 && (
        <g pointerEvents="none">
          <polyline points={tape.map((p) => p.join(",")).join(" ")} fill="none" stroke="#7c3aed" strokeWidth={2.5 * k} strokeDasharray={`${6 * k} ${3 * k}`} />
          {tape.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3 * k} fill="#7c3aed" />)}
          {tapeLen > 0 && label(tape[tape.length - 1][0] + 8 * k, tape[tape.length - 1][1] - 6 * k, `${(tapeLen / 10).toFixed(1)} cm`, "#6d28d9")}
        </g>
      )}
      {electrode("ground", "#16a34a", "Ground", 7)}
      {stimEl}
      {electrode("g2", "#1e293b", "G2", 5)}
      {electrode("g1", "#dc2626", "G1", 5)}
    </svg>
  );
}
