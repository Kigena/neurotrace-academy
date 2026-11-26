import React from "react";
import { SITES, STIM_SITES, STUDIES } from "../../ncs/studies.js";
import LimbSurface from "./LimbSurface.jsx";

/**
 * Schematic right arm (palm up) or right leg (seen from above, medial side at
 * the top) with clickable electrode sites and the current stimulator position.
 */

const PX_PER_CM = { arm: 12, leg: 8 };

// The Bench drawings are calibrated to the 800 × 240 site coordinates in studies.js.
const ARM_OUTLINE = `M19 105 C70 89 141 91 190 101 C221 107 238 105 252 104
  C281 91 315 86 350 89 C408 92 462 101 515 105 C531 107 542 100 554 91
  C568 80 587 76 601 66 C613 57 633 40 649 34 C661 29 670 37 665 45
  C654 61 635 72 623 85 C617 91 624 98 638 98
  C668 94 707 95 751 98 C769 99 769 114 753 117 L670 118 Q663 119 666 122
  C696 120 736 118 768 119 C784 120 785 135 769 138 L672 139 Q666 141 670 143
  C697 140 729 140 757 141 C773 142 774 156 758 159 L671 159 Q663 160 666 163
  C689 160 710 160 732 160 C749 161 752 174 736 177 L662 178
  C635 181 613 187 587 184 C563 181 542 169 516 168
  C459 171 411 182 360 185 C318 187 281 181 266 184 Q257 188 248 181
  C189 177 139 195 86 194 C59 195 32 189 19 180 Z`;

const LEG_OUTLINE = `M18 102 C63 93 111 96 154 109 C174 115 191 111 206 107
  C248 92 284 90 329 99 C391 111 449 120 484 116 Q503 116 512 105
  Q522 96 535 101 C555 101 573 88 595 83 Q620 76 646 77
  C668 78 685 76 701 74 L747 71 C771 69 778 79 773 90 C768 101 743 100 730 99
  Q719 99 721 103 L747 103 C764 102 769 112 761 120 Q755 124 730 123
  Q725 124 727 128 L747 127 C764 127 763 141 750 145 L724 145
  Q720 146 722 150 L739 151 C756 151 755 165 742 170 L719 172
  Q715 174 719 178 L733 177 C750 179 749 193 736 198
  C710 208 681 207 651 206 C619 205 592 213 563 209
  C540 208 509 203 495 191 C478 177 465 167 445 172
  C382 183 312 200 246 199 Q225 201 210 193
  C165 188 133 200 93 201 Q49 202 18 188 Z`;

function Arm() {
  return (
    <g>
      <LimbSurface outline={ARM_OUTLINE} horizontal
        relief={[
          [126, 132, 135, 48, 1, "light", .92],
          [253, 141, 26, 52, 5, "shade", .64],
          [348, 121, 120, 34, 5, "light", .98],
          [421, 169, 130, 27, -4, "shade", .53],
          [580, 108, 52, 27, -28, "light", .96],
          [615, 142, 43, 28, -12, "shade", .56],
          [601, 169, 50, 16, 2, "light", .79],
        ]}
        contours={[
          "M248 108 Q264 131 248 172 M254 113 Q266 134 256 155",
          "M352 142 Q445 127 521 130 M392 159 Q455 151 520 153",
          "M537 106 Q548 135 539 169 M545 111 Q554 136 547 170",
          "M557 143 C578 151 614 131 628 117 M576 159 Q616 153 633 130 M630 163 Q637 144 638 127",
          "M625 58 Q630 61 631 67 M694 100 Q691 109 695 115 M727 99 Q723 107 726 115",
          "M703 122 Q698 130 703 137 M737 122 Q732 129 736 137",
          "M695 143 Q690 150 695 158 M730 143 Q724 150 729 157",
          "M689 162 Q685 168 688 176 M719 162 Q714 169 718 175",
        ]} />
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
      <LimbSurface outline={LEG_OUTLINE} horizontal
        relief={[
          [111, 135, 117, 43, 0, "light", .89],
          [197, 150, 34, 48, -7, "shade", .64],
          [269, 130, 90, 37, 2, "light", .97],
          [371, 172, 117, 32, -8, "shade", .56],
          [516, 110, 23, 16, 0, "light", .98],
          [526, 181, 27, 19, 4, "light", .91],
          [616, 133, 104, 44, -9, "light", .96],
          [620, 184, 102, 27, 1, "shade", .57],
        ]}
        contours={[
          "M195 116 Q182 151 197 186 M226 188 Q236 175 248 187",
          "M280 123 Q374 127 489 143 M411 155 Q458 156 494 148",
          "M509 123 Q521 130 532 116 M513 181 Q524 169 540 177 Q553 188 543 196",
          "M551 136 Q623 104 708 89 M563 151 Q636 130 722 113 M576 164 Q651 151 717 138",
          "M590 177 Q655 172 706 161 M608 191 Q665 193 712 183",
          "M737 74 Q735 85 740 96 M737 106 Q733 113 738 121 M733 130 Q730 136 735 143",
        ]}
        nails={[[757, 84, 14, 16, 5], [751, 113, 9, 10, 5], [748, 136, 9, 9, 2], [741, 159, 8, 9, 1], [735, 186, 8, 9, -7]]} />
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
