import * as ARM from "./medianArmView.js";
import { pointAt, polylineLength, project } from "../geometry.js";

/**
 * Right forearm and hand, palmar view, for the antidromic median sensory
 * study (ring electrodes on the index or middle finger). Reuses the arm
 * outline and layers from medianArmView.js and adds the median digital
 * nerves to digits 2 and 3. Units are millimetres.
 *
 * Teaching schematic; landmarks and nerve courses need expert review.
 */

export const { VIEWBOX, SKIN, SURFACE, MUSCLES, BONES, BONE_SHAPES, ORIENTATION } = ARM;

// Each branch is a full route from the arm to the finger tip, sharing the median trunk.
const INDEX = [...ARM.MEDIAN_TRUNK, [140, 425], [132, 455], [124, 482], [120, 500], [119, 530], [119, 556]];
const MIDDLE = [...ARM.MEDIAN_TRUNK, [143, 430], [141, 460], [140, 488], [140, 520], [140, 566]];

export const SENS_BRANCHES = [
  { id: "index", pts: INDEX, weight: 1 },
  { id: "middle", pts: MIDDLE, weight: 1 },
];
export const NERVE = INDEX; // default branch for drawing order and fallbacks

export const NERVE_DRAW = [
  { name: "Median nerve and digital nerves to the index and middle fingers", pts: INDEX },
  { name: "Digital nerves to the middle finger", pts: MIDDLE.slice(ARM.MEDIAN_TRUNK.length - 1) },
  { name: "Ulnar nerve (supplies the little finger and half of the ring finger)", pts: ARM.NERVES.ulnar.routes.adm, color: "#22c55e", thin: true },
];

const at = (pts, from, deltaMm) => pointAt(pts, project(from, pts).s + deltaMm);
const IDX_G1 = { x: 119, y: 506 };
const MID_G1 = { x: 140, y: 508 };

export const PLACES = {
  indexProx: { ...IDX_G1, label: "Index finger, ring over the proximal phalanx" },
  indexDist: { ...at(INDEX, IDX_G1, 35), label: "Index finger, ring about 3.5 cm further distal" },
  middleProx: { ...MID_G1, label: "Middle finger, ring over the proximal phalanx" },
  middleDist: { ...at(MIDDLE, MID_G1, 35), label: "Middle finger, ring about 3.5 cm further distal" },
  ringProx: { x: 161, y: 506, label: "Ring finger, ring over the proximal phalanx" },
  littleProx: { x: 183, y: 502, label: "Little finger, ring over the proximal phalanx (ulnar)" },
  wrist14: { ...at(INDEX, IDX_G1, -140), label: "Wrist, between FCR and palmaris longus, 14 cm from G1 along the nerve" },
  palm7: { ...at(INDEX, IDX_G1, -70), label: "Palm, over the median nerve, 7 cm from G1" },
  wristUlnar: { ...ARM.PLACES.wristUlnar, label: "Wrist, just radial to the FCU tendon (ulnar nerve)" },
  forearm: { x: 148, y: 300, label: "Distal forearm, proximal to the wrist site" },
  palmGround: { x: 165, y: 420, label: "Palm, between stimulator and recording" },
};

export const LANDMARKS = [
  ...ARM.LANDMARKS.filter((l) => ["fcr", "pl", "fcu", "crease", "hypothenar"].includes(l.id)),
  { id: "d2", label: "Index finger", x: 119, y: 556, dx: -12, dy: 0 },
  { id: "d3", label: "Middle finger", x: 140, y: 568, dx: 0, dy: 12 },
];

export const VIEWS = [
  { id: "full", label: "Forearm and hand", box: { x: 30, y: 200, w: 240, h: 390 } },
  { id: "hand", label: "Hand and fingers", box: { x: 60, y: 370, w: 160, h: 210 } },
  { id: "wrist", label: "Wrist close-up", box: { x: 85, y: 290, w: 140, h: 150 } },
];

export const BRANCH_LEN = { index: polylineLength(INDEX), middle: polylineLength(MIDDLE) };
