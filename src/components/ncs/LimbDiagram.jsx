import React from "react";
import { SITES, STIM_SITES, STUDIES } from "../../ncs/studies.js";

/**
 * Schematic right arm (palm up) or right leg (seen from above, medial side at
 * the top) with clickable electrode sites and the current stimulator position.
 */

const SKIN = "#f1e4d8";
const EDGE = "#b59a86";
const PX_PER_CM = { arm: 12, leg: 8 };

function Arm() {
  return (
    <g>
      <rect x="18" y="95" width="240" height="80" rx="34" fill={SKIN} stroke={EDGE} />
      <path d="M248 98 L542 104 L542 166 L248 174 Z" fill={SKIN} stroke={EDGE} />
      <rect x="538" y="92" width="130" height="90" rx="22" fill={SKIN} stroke={EDGE} />
      {[[109, 754], [129, 770], [148, 760], [167, 738]].map(([y, x2]) => (
        <line key={y} x1="660" y1={y} x2={x2} y2={y} stroke={EDGE} strokeWidth="20" strokeLinecap="round" />
      ))}
      {[[109, 754], [129, 770], [148, 760], [167, 738]].map(([y, x2]) => (
        <line key={`f${y}`} x1="660" y1={y} x2={x2} y2={y} stroke={SKIN} strokeWidth="18" strokeLinecap="round" />
      ))}
      <line x1="574" y1="100" x2="656" y2="40" stroke={EDGE} strokeWidth="22" strokeLinecap="round" />
      <line x1="574" y1="100" x2="656" y2="40" stroke={SKIN} strokeWidth="20" strokeLinecap="round" />
      <ellipse cx="588" cy="113" rx="34" ry="17" fill="#e8d2c0" stroke={EDGE} strokeDasharray="3 2" />
      <ellipse cx="606" cy="170" rx="38" ry="9" fill="#e8d2c0" stroke={EDGE} strokeDasharray="3 2" />
      <line x1="540" y1="96" x2="540" y2="178" stroke={EDGE} strokeDasharray="4 3" />
      <circle cx="258" cy="180" r="6" fill="#e8d2c0" stroke={EDGE} />
      <text x="540" y="226" fontSize="11" fill="#64748b" textAnchor="middle">wrist crease</text>
      <text x="258" y="226" fontSize="11" fill="#64748b" textAnchor="middle">elbow (medial epicondyle)</text>
      <text x="610" y="20" fontSize="11" fill="#64748b">thumb (radial side)</text>
      <text x="22" y="20" fontSize="12" fill="#475569" fontWeight="600">Right arm, palm up</text>
    </g>
  );
}

function Leg() {
  return (
    <g>
      <rect x="8" y="98" width="200" height="86" rx="36" fill={SKIN} stroke={EDGE} />
      <path d="M196 102 L522 116 L522 170 L196 184 Z" fill={SKIN} stroke={EDGE} />
      <path d="M512 112 L700 74 L706 200 L512 198 Z" fill={SKIN} stroke={EDGE} strokeLinejoin="round" />
      {[[86, 762, 20], [108, 748, 13], [128, 744, 12], [148, 740, 12], [168, 736, 12], [186, 734, 12]].map(([y, x2, w]) => (
        <line key={y} x1="700" y1={y} x2={x2} y2={y} stroke={EDGE} strokeWidth={w + 2} strokeLinecap="round" />
      ))}
      {[[86, 762, 20], [108, 748, 13], [128, 744, 12], [148, 740, 12], [168, 736, 12], [186, 734, 12]].map(([y, x2, w]) => (
        <line key={`t${y}`} x1="700" y1={y} x2={x2} y2={y} stroke={SKIN} strokeWidth={w} strokeLinecap="round" />
      ))}
      <circle cx="518" cy="110" r="9" fill="#e8d2c0" stroke={EDGE} />
      <circle cx="520" cy="176" r="9" fill="#e8d2c0" stroke={EDGE} />
      <circle cx="236" cy="192" r="7" fill="#e8d2c0" stroke={EDGE} />
      <text x="518" y="64" fontSize="11" fill="#64748b" textAnchor="middle">medial malleolus</text>
      <text x="470" y="226" fontSize="11" fill="#64748b" textAnchor="middle">lateral malleolus</text>
      <text x="236" y="226" fontSize="11" fill="#64748b" textAnchor="middle">fibular head</text>
      <text x="120" y="226" fontSize="11" fill="#64748b" textAnchor="middle">popliteal fossa</text>
      <text x="22" y="20" fontSize="12" fill="#475569" fontWeight="600">Right leg from above · medial side top, lateral side bottom</text>
    </g>
  );
}

function Electrode({ x, y, label, color }) {
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r="9" fill={color} stroke="#fff" strokeWidth="2" />
      <text x={x} y={y + 3.5} fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle">{label}</text>
    </g>
  );
}

function stimPosition(studyId, stimSiteId, distalCm) {
  const study = STUDIES[studyId];
  const s = STIM_SITES[stimSiteId];
  if (!s) return null;
  if (!s.distal) return { x: s.x, y: s.y };
  const g1 = SITES[study.limb][study.g1[0]];
  return { x: g1.x - distalCm * PX_PER_CM[study.limb], y: s.y };
}

export default function LimbDiagram({ studyId, setup, stimSiteId, tool, onPick }) {
  const study = STUDIES[studyId];
  const limb = study.limb;
  const sites = SITES[limb];
  const assigned = { [setup.g1]: "g1", [setup.g2]: "g2", [setup.ground]: "ground" };
  const stim = stimSiteId ? stimPosition(studyId, stimSiteId, setup.distalCm) : null;
  const dir = setup.cathodeDistal === false ? -1 : 1;

  return (
    <svg viewBox="0 0 800 240" className="block h-auto w-full select-none rounded-lg border border-slate-200 bg-white" role="img" aria-label={`${limb} diagram with electrode sites`}>
      {limb === "arm" ? <Arm /> : <Leg />}
      {Object.entries(sites).map(([id, s]) => (
        <g key={id} onClick={() => tool && onPick(id)} className={tool ? "cursor-pointer" : ""}>
          <title>{s.label}</title>
          <circle cx={s.x} cy={s.y} r={tool ? 8 : 5} fill={s.ground ? "#bbf7d0" : "#e2e8f0"} stroke="#64748b" strokeWidth="1" opacity={assigned[id] ? 0 : 0.9} />
        </g>
      ))}
      {stim && (
        <g pointerEvents="none">
          <rect x={stim.x - 26} y={stim.y - 9} width="52" height="18" rx="9" fill="#0f172a" opacity="0.85" />
          <circle cx={stim.x + 13 * dir} cy={stim.y} r="6" fill="#111827" stroke="#fff" />
          <text x={stim.x + 13 * dir} y={stim.y + 3} fontSize="9" fill="#fff" textAnchor="middle">-</text>
          <circle cx={stim.x - 13 * dir} cy={stim.y} r="6" fill="#dc2626" stroke="#fff" />
          <text x={stim.x - 13 * dir} y={stim.y + 3} fontSize="9" fill="#fff" textAnchor="middle">+</text>
        </g>
      )}
      {setup.g1 && sites[setup.g1] && <Electrode {...sites[setup.g1]} label="G1" color="#dc2626" />}
      {setup.g2 && sites[setup.g2] && <Electrode {...sites[setup.g2]} label="G2" color="#1e293b" />}
      {setup.ground && sites[setup.ground] && <Electrode {...sites[setup.ground]} label="Gd" color="#16a34a" />}
    </svg>
  );
}
