import * as ARM from "./medianArmView.js";
import { pointAt, project } from "../geometry.js";

/**
 * Right forearm and hand, DORSAL view (back of the hand, forearm pronated),
 * for the antidromic superficial radial sensory study. With the forearm
 * pronated and seen from above, the thumb (lateral, radial side) is still on
 * the LEFT, so the outline of the palmar model is reused. Units are mm.
 *
 * The superficial radial nerve emerges from under the brachioradialis tendon
 * on the lateral border of the distal forearm, runs over the radial styloid
 * region, crosses the extensor pollicis longus (EPL) tendon at the anatomical
 * snuffbox and divides into dorsal digital branches to the thumb and the
 * first web space.
 *
 * Teaching schematic; landmarks and nerve courses need expert review.
 */

export const { VIEWBOX, SKIN } = ARM;

export const SURFACE = {
  dorsalWristCrease: [[122, 380], [150, 384], [184, 380]],
  knuckles: [[120, 476], [142, 480], [163, 478], [183, 476]],
  eplRidge: [[138, 368], [124, 398], [108, 432], [96, 462]],
  epbRidge: [[121, 372], [110, 400], [100, 430]],
  brachioradialisEdge: [[114, 200], [117, 250], [119, 290]],
};

export const MUSCLES = [
  { name: "Brachioradialis (tendon on the lateral border of the distal forearm)", pts: [[112, 150], [122, 150], [124, 300], [121, 360], [116, 360], [116, 300]] },
  { name: "Extensor pollicis longus tendon (ulnar border of the snuffbox)", pts: [[136, 366], [141, 368], [126, 402], [99, 464], [94, 462], [121, 400]], tendon: true },
  { name: "Extensor pollicis brevis and abductor pollicis longus tendons (radial border of the snuffbox)", pts: [[119, 368], [124, 370], [113, 402], [103, 432], [98, 430], [107, 400]], tendon: true },
  { name: "Extensor digitorum tendons", pts: [[146, 300], [170, 300], [176, 382], [184, 476], [178, 478], [163, 478], [142, 480], [126, 476], [140, 382]], tendon: true },
  { name: "First dorsal interosseous (ulnar)", cx: 118, cy: 452, rx: 10, ry: 22, rot: 30 },
];

export const BONES = [
  { name: "Radius (lateral border subcutaneous distally)", line: [[114, 140], [118, 260], [121, 372]] },
  { name: "Ulna", line: [[186, 130], [184, 260], [182, 368]] },
  { name: "First metacarpal", line: [[114, 410], [98, 458]] },
  { name: "Metacarpal 2", line: [[128, 405], [121, 468]] },
  { name: "Metacarpal 3", line: [[146, 405], [142, 470]] },
  { name: "Metacarpal 4", line: [[164, 405], [163, 468]] },
  { name: "Metacarpal 5", line: [[180, 402], [183, 465]] },
];
export const BONE_SHAPES = [
  { name: "Radial styloid", cx: 125, cy: 377, rx: 5, ry: 6 },
  { name: "Lister's (dorsal radial) tubercle", cx: 138, cy: 366, rx: 4, ry: 5 },
  { name: "Ulnar head", cx: 182, cy: 368, rx: 8, ry: 8 },
  { name: "Scaphoid (floor of the snuffbox)", cx: 116, cy: 394, rx: 6, ry: 5, dashed: true },
];

const TRUNK = [[120, 200], [121, 250], [123, 300], [125, 340], [126, 365], [122, 385], [117, 400]];
const THUMB = [...TRUNK, [110, 420], [101, 444], [93, 470], [87, 496]];
const WEB = [...TRUNK, [119, 420], [122, 445], [122, 480]];

export const SENS_BRANCHES = [
  { id: "thumb", pts: THUMB, weight: 1 },
  { id: "web", pts: WEB, weight: 0.6 },
];
export const NERVE = THUMB;

export const NERVE_DRAW = [
  { name: "Superficial radial nerve and dorsal digital branch to the thumb", pts: THUMB },
  { name: "Dorsal digital branch to the first web space and index finger", pts: WEB.slice(TRUNK.length - 1), thin: true },
];

export const LANDMARKS = [
  { id: "styloid", label: "Radial styloid", x: 125, y: 377, dx: -12, dy: 0 },
  { id: "lister", label: "Lister's tubercle", x: 138, y: 366, dx: 10, dy: -4 },
  { id: "ulnarHead", label: "Ulnar head", x: 182, y: 368, dx: 12, dy: 0 },
  { id: "snuffbox", label: "Anatomical snuffbox", x: 115, y: 398, dx: -14, dy: 6 },
  { id: "epl", label: "EPL tendon", x: 110, y: 430, dx: 12, dy: 0 },
  { id: "br", label: "Brachioradialis", x: 118, y: 220, dx: -12, dy: 0 },
  { id: "knuckles", label: "Knuckles (MCP joints)", x: 183, y: 476, dx: 12, dy: 0 },
];

const at = (pts, from, deltaMm) => pointAt(pts, project(from, pts).s + deltaMm);
const G1 = { x: 117, y: 400 }; // over the nerve where it crosses EPL at the snuffbox

export const PLACES = {
  snuffbox: { ...G1, label: "Over the EPL tendon at the snuffbox (superficial radial nerve)" },
  thumbDorsum: { ...at(THUMB, G1, 35), label: "Dorsum of the thumb, about 3.5 cm distal along the nerve" },
  webSpace: { x: 122, y: 445, label: "First web space, back of the hand" },
  onStyloid: { x: 125, y: 377, label: "On the radial styloid" },
  lister: { x: 138, y: 366, label: "Over Lister's tubercle" },
  forearm10: { ...at(THUMB, G1, -100), label: "Lateral edge of the radius, distal forearm, 10 cm from G1 along the nerve" },
  forearmMid: { x: 150, y: 300, label: "Middle of the back of the forearm" },
  handGround: { x: 160, y: 430, label: "Back of the hand" },
};

export const VIEWS = [
  { id: "full", label: "Forearm and hand", box: { x: 30, y: 180, w: 240, h: 360 } },
  { id: "snuffbox", label: "Snuffbox close-up", box: { x: 70, y: 340, w: 110, h: 130 } },
  { id: "hand", label: "Back of the hand", box: { x: 60, y: 350, w: 170, h: 200 } },
];

export const ORIENTATION = { title: "Right forearm and hand · dorsal view (back of the hand)", top: "Proximal (elbow)", bottom: "Distal (fingers)", left: "Lateral (radial, thumb side)", right: "Medial (ulnar side)" };
