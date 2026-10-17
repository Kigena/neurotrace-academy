import * as ARM from "./medianArmView.js";
import { pointAt, polylineLength, project } from "../geometry.js";

/**
 * Right forearm and hand, palmar view, for the antidromic median sensory
 * study (ring electrodes on the index or middle finger). Reuses the arm
 * outline and layers from medianArmView.js and adds the median digital
 * nerves to digits 2 and 3. Units are millimetres. Each finger has paired
 * proper digital nerves along its two palmar-lateral sides; the model draws
 * one route per finger (index along its centre, middle along its radial
 * digital nerve), which a ring electrode encircling the finger sees equally.
 *
 * Teaching schematic; landmarks and nerve courses need expert review.
 */

export const { VIEWBOX, SKIN, SURFACE, MUSCLES, BONES, BONE_SHAPES, ORIENTATION } = ARM;

// Each branch is a full route from the arm to the finger tip, sharing the median trunk.
// The trunk divides at the distal edge of the transverse carpal ligament (about 3 cm distal to the crease).
const INDEX = [...ARM.MEDIAN_TRUNK, [143, 413], [140, 425], [132, 455], [124, 482], [120, 500], [119, 530], [119, 556]];
const MIDDLE = [...ARM.MEDIAN_TRUNK, [143, 413], [138, 430], [133, 460], [131, 486], [134, 500], [134, 566]];
// Common digital nerve of the 3rd web space to the radial half of the ring finger.
const RING_RADIAL = [...ARM.MEDIAN_TRUNK, [143, 413], [150, 440], [156, 470], [158, 500], [158, 560]];
// Ulnar digital nerves (drawn for orientation only): little finger and the ulnar half of the ring finger.
const ULNAR_DIGITAL = [[172, 392], [176, 420], [176, 450], [174, 486], [180, 540]];

export const SENS_BRANCHES = [
  { id: "index", pts: INDEX, weight: 1, nerve: "median" },
  { id: "middle", pts: MIDDLE, weight: 1, nerve: "median" },
  { id: "ringRadial", pts: RING_RADIAL, weight: 0.6, nerve: "median" },
];
export const NERVE = INDEX; // default branch for drawing order and fallbacks

export const NERVE_DRAW = [
  { name: "Median nerve and digital nerve to the index finger", pts: INDEX },
  { name: "Median digital nerve to the middle finger (radial side)", pts: MIDDLE.slice(ARM.MEDIAN_TRUNK.length - 1) },
  { name: "Median digital nerve to the radial half of the ring finger", pts: RING_RADIAL.slice(ARM.MEDIAN_TRUNK.length - 1), thin: true },
  { name: "Ulnar nerve (hypothenar branch)", pts: ARM.NERVES.ulnar.routes.adm, color: "#22c55e", thin: true },
  { name: "Ulnar digital nerves (little finger and ulnar half of the ring finger)", pts: ULNAR_DIGITAL, color: "#22c55e", thin: true },
  { name: "Ulnar digital twig to the ring finger", pts: [[176, 450], [168, 470], [166, 500]], color: "#22c55e", thin: true },
];

const at = (pts, from, deltaMm) => pointAt(pts, project(from, pts).s + deltaMm);
// Rings just distal to the digital crease, over the middle of the proximal phalanx.
const IDX_G1 = { x: 119, y: 498 };
const MID_G1 = { x: 134, y: 500 };

export const PLACES = {
  indexProx: { ...IDX_G1, label: "Index finger, ring over the proximal phalanx" },
  indexDist: { ...at(INDEX, IDX_G1, 35), label: "Index finger, ring about 3.5 cm further distal" },
  middleProx: { ...MID_G1, label: "Middle finger, ring over the proximal phalanx" },
  middleDist: { ...at(MIDDLE, MID_G1, 35), label: "Middle finger, ring about 3.5 cm further distal" },
  ringProx: { x: 161, y: 500, label: "Ring finger, ring over the proximal phalanx (median radial half, ulnar ulnar half)" },
  littleProx: { x: 183, y: 502, label: "Little finger, ring over the proximal phalanx (ulnar)" },
  wrist14: { ...at(INDEX, IDX_G1, -140), label: "Wrist, between FCR and palmaris longus, 14 cm from G1 along the nerve" },
  palm7: { ...at(INDEX, IDX_G1, -70), label: "Palm, over the median nerve, 7 cm from an index-finger G1" },
  palm7Middle: { ...at(MIDDLE, MID_G1, -70), label: "Palm, over the median nerve, 7 cm from a middle-finger G1" },
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
