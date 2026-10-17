import * as ARM from "./medianArmView.js";
import * as MEDS from "./medianSensoryView.js";
import { pointAt, project } from "../geometry.js";

/**
 * Right forearm and hand, palmar view, for the antidromic ulnar sensory
 * study (ring electrodes on the little finger). Reuses the arm outline and
 * layers and adds the ulnar digital nerves to the little finger and the
 * ulnar half of the ring finger. The median digital nerves stay in the model,
 * so rings on the wrong finger, or stimulation of the wrong nerve, behave as
 * they would on a patient. Units are millimetres.
 *
 * Teaching schematic; landmarks and nerve courses need expert review.
 */

export const { VIEWBOX, SKIN, SURFACE, MUSCLES, BONES, BONE_SHAPES, ORIENTATION } = ARM;

const ULNAR_TRUNK = ARM.NERVES.ulnar.routes.adm.slice(0, -2); // to Guyon's canal at the wrist
// The superficial (sensory) branch leaves the deep branch in Guyon's canal, about 1 cm beyond the pisiform.
const LITTLE = [...ULNAR_TRUNK, [171, 400], [176, 420], [175, 450], [178, 470], [182, 490], [183, 520], [183, 540]];
const RING_ULNAR = [...ULNAR_TRUNK, [171, 400], [176, 420], [174, 465], [168, 475], [166, 500], [166, 562]];

export const SENS_BRANCHES = [
  { id: "little", pts: LITTLE, weight: 1, nerve: "ulnar" },
  { id: "ringUlnar", pts: RING_ULNAR, weight: 0.6, nerve: "ulnar" },
  ...MEDS.SENS_BRANCHES,
];
export const NERVE = LITTLE;

export const NERVE_DRAW = [
  { name: "Ulnar nerve, superficial (sensory) branch and digital nerve to the little finger", pts: LITTLE, color: "#22c55e" },
  { name: "Deep (motor) branch of the ulnar nerve", pts: [[171, 400], [168, 410], [152, 436], [134, 448]], color: "#22c55e", thin: true },
  { name: "Ulnar artery (radial to the nerve)", pts: [[167, 320], [167, 360], [168, 395]], color: "#ef4444", thin: true },
  { name: "Ulnar digital nerve to the ulnar half of the ring finger", pts: RING_ULNAR.slice(ULNAR_TRUNK.length + 1), color: "#22c55e", thin: true },
  ...MEDS.NERVE_DRAW.slice(0, 2).map((n) => ({ ...n, thin: true })),
];

const at = (pts, from, deltaMm) => pointAt(pts, project(from, pts).s + deltaMm);
const LIT_G1 = { x: 183, y: 494 }; // middle of the proximal phalanx of the little finger

export const PLACES = {
  littleProx: { ...LIT_G1, label: "Little finger, ring over the proximal phalanx" },
  littleDist: { ...at(LITTLE, LIT_G1, 30), label: "Little finger, ring about 3 cm distal (DIP crease)" },
  ringProx: { ...MEDS.PLACES.ringProx },
  indexProx: { ...MEDS.PLACES.indexProx },
  wrist14: { ...at(LITTLE, LIT_G1, -140), label: "Wrist, just radial to the FCU tendon, 14 cm from G1 along the nerve" },
  overFcu: { x: 181, y: 360, label: "Over the FCU tendon at the wrist" },
  wristMedian: { ...MEDS.PLACES.wrist14, label: "Wrist, between FCR and palmaris longus (median nerve)" },
  palmGround: { x: 150, y: 420, label: "Palm, between stimulator and recording" },
};

export const LANDMARKS = [
  ...ARM.LANDMARKS.filter((l) => ["fcr", "pl", "fcu", "crease", "hypothenar"].includes(l.id)),
  { id: "pisiform", label: "Pisiform", x: 180, y: 389, dx: 12, dy: 8 },
  { id: "d5", label: "Little finger", x: 183, y: 536, dx: 12, dy: 0 },
  { id: "d4", label: "Ring finger", x: 162, y: 560, dx: 0, dy: 12 },
];

export const VIEWS = [
  { id: "full", label: "Forearm and hand", box: { x: 30, y: 200, w: 240, h: 390 } },
  { id: "hand", label: "Hand and fingers", box: { x: 90, y: 370, w: 160, h: 200 } },
  { id: "wrist", label: "Wrist close-up", box: { x: 110, y: 290, w: 140, h: 150 } },
];
