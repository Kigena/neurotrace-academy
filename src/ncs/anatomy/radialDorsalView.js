import * as ARM from "./medianArmView.js";
import { pointAt, project } from "../geometry.js";

/**
 * Right forearm and hand, DORSAL view (back of the hand toward the viewer,
 * fingers pointing down), for the antidromic superficial radial sensory
 * study. Seen from behind, the right thumb (lateral, radial side) is on the
 * viewer's RIGHT, so the palmar outline is mirrored. Units are millimetres.
 * The forearm is drawn straight; the crossing of radius and ulna in
 * pronation is not shown (schematic).
 *
 * The superficial radial nerve emerges from under the brachioradialis on the
 * lateral border of the forearm about 8-9 cm above the radial styloid,
 * divides a few centimetres above the wrist, and its branches cross the
 * thumb extensor tendons at the anatomical snuffbox toward the thumb and the
 * first web space.
 *
 * Coordinates below are written in the palmar frame (thumb on the left) and
 * mirrored on export. Teaching schematic; needs expert review.
 */

const W = 302;
const mx = (x) => W - x;
const mp = ([x, y]) => [mx(x), y];
const mpts = (pts) => pts.map(mp);

// ---- palmar-frame source data ----
const SURFACE_SRC = {
  dorsalWristLine: [[122, 380], [150, 384], [184, 380]],
  knuckles: [[120, 476], [142, 480], [163, 478], [183, 476]],
  eplRidge: [[144, 340], [141, 374], [124, 400], [108, 432], [96, 462]],
  epbRidge: [[124, 372], [114, 400], [104, 430]],
  brachioradialisEdge: [[116, 200], [119, 250], [121, 288]],
};

const MUSCLES_SRC = [
  { name: "Brachioradialis (the superficial radial nerve emerges from under its tendon)", pts: [[114, 150], [123, 150], [122, 288], [124, 360], [127, 372], [124, 372], [121, 300]] },
  { name: "Extensor pollicis longus tendon (ulnar border of the snuffbox, around Lister's tubercle)", pts: [[142, 330], [146, 330], [145, 362], [141, 374], [127, 402], [99, 464], [94, 462], [121, 400], [136, 372], [140, 362]], tendon: true },
  { name: "Extensor pollicis brevis and abductor pollicis longus tendons (radial border of the snuffbox)", pts: [[122, 372], [126, 372], [116, 402], [106, 432], [101, 430], [111, 400]], tendon: true },
  { name: "Extensor digitorum tendons", pts: [[150, 300], [170, 300], [176, 382], [184, 476], [178, 478], [163, 478], [142, 480], [130, 476], [146, 382]], tendon: true },
  { name: "First dorsal interosseous (first web space)", cx: 118, cy: 452, rx: 10, ry: 22, rot: 30 },
];

const BONES_SRC = [
  { name: "Radius (lateral border subcutaneous distally)", line: [[116, 140], [119, 260], [123, 372]] },
  { name: "Ulna", line: [[184, 130], [182, 260], [178, 368]] },
  { name: "First metacarpal", line: [[114, 410], [98, 458]] },
  { name: "Metacarpal 2", line: [[128, 405], [121, 468]] },
  { name: "Metacarpal 3", line: [[146, 405], [142, 470]] },
  { name: "Metacarpal 4", line: [[164, 405], [163, 468]] },
  { name: "Metacarpal 5", line: [[180, 402], [183, 465]] },
];
const BONE_SHAPES_SRC = [
  { name: "Radial styloid", cx: 127, cy: 377, rx: 4, ry: 6 },
  { name: "Lister's (dorsal radial) tubercle", cx: 138, cy: 366, rx: 4, ry: 5 },
  { name: "Ulnar head", cx: 176, cy: 370, rx: 6, ry: 7 },
  { name: "Scaphoid (floor of the snuffbox)", cx: 120, cy: 396, rx: 6, ry: 5, dashed: true },
];

const TRUNK_SRC = [[120, 200], [120, 250], [122, 288], [125, 320], [127, 330]];
const THUMB_SRC = [...TRUNK_SRC, [127, 345], [126, 365], [122, 385], [117, 400], [110, 420], [101, 444], [93, 470], [87, 496]];
const WEB_SRC = [...TRUNK_SRC, [126, 365], [125, 395], [122, 425], [119, 455]];

const LANDMARKS_SRC = [
  { id: "styloid", label: "Radial styloid", x: 127, y: 377, dx: -12, dy: 0 },
  { id: "lister", label: "Lister's tubercle", x: 138, y: 366, dx: 10, dy: -4 },
  { id: "ulnarHead", label: "Ulnar head", x: 176, y: 370, dx: 12, dy: 0 },
  { id: "snuffbox", label: "Anatomical snuffbox", x: 117, y: 398, dx: -14, dy: 6 },
  { id: "epl", label: "EPL tendon", x: 110, y: 430, dx: 12, dy: 0 },
  { id: "br", label: "Brachioradialis", x: 120, y: 220, dx: -12, dy: 0 },
  { id: "knuckles", label: "Knuckles (MCP joints)", x: 183, y: 476, dx: 12, dy: 0 },
];

// ---- mirrored exports (dorsal view of a right hand) ----
export const VIEWBOX = { x: 0, y: 0, w: W, h: 600 };
export const SKIN = mpts(ARM.SKIN);
export const SURFACE = Object.fromEntries(Object.entries(SURFACE_SRC).map(([k, v]) => [k, mpts(v)]));
export const MUSCLES = MUSCLES_SRC.map((m) => (m.pts ? { ...m, pts: mpts(m.pts) } : { ...m, cx: mx(m.cx), rot: -(m.rot || 0) }));
export const BONES = BONES_SRC.map((b) => ({ ...b, line: mpts(b.line) }));
export const BONE_SHAPES = BONE_SHAPES_SRC.map((b) => ({ ...b, cx: mx(b.cx) }));

const THUMB = mpts(THUMB_SRC);
const WEB = mpts(WEB_SRC);
export const SENS_BRANCHES = [
  { id: "thumb", pts: THUMB, weight: 1 },
  { id: "web", pts: WEB, weight: 0.6 },
];
export const NERVE = THUMB;

export const NERVE_DRAW = [
  { name: "Superficial radial nerve and dorsal digital branch to the thumb", pts: THUMB },
  { name: "Branch to the first web space and index finger (crosses EPL)", pts: WEB.slice(TRUNK_SRC.length - 1), thin: true },
];

export const LANDMARKS = LANDMARKS_SRC.map((l) => ({ ...l, x: mx(l.x), dx: -l.dx }));

const at = (pts, from, deltaMm) => pointAt(pts, project(from, pts).s + deltaMm);
const G1 = { x: mx(117), y: 400 }; // over the nerve in the snuffbox

export const PLACES = {
  snuffbox: { ...G1, label: "Over the nerve in the snuffbox, as it crosses the thumb extensor tendons" },
  thumbDorsum: { ...at(THUMB, G1, 35), label: "Dorsum of the thumb, about 3.5 cm distal along the nerve" },
  webSpace: { x: mx(122), y: 445, label: "First web space, back of the hand" },
  onStyloid: { x: mx(127), y: 377, label: "On the radial styloid" },
  lister: { x: mx(138), y: 366, label: "Over Lister's tubercle" },
  forearm10: { ...at(THUMB, G1, -100), label: "Lateral edge of the radius, distal forearm, 10 cm from G1 along the nerve" },
  forearmMid: { x: mx(150), y: 300, label: "Middle of the back of the forearm" },
  handGround: { x: mx(160), y: 430, label: "Back of the hand" },
};

const box = (b) => ({ ...b, x: W - (b.x + b.w) });
export const VIEWS = [
  { id: "full", label: "Forearm and hand", box: box({ x: 30, y: 180, w: 240, h: 360 }) },
  { id: "snuffbox", label: "Snuffbox close-up", box: box({ x: 70, y: 330, w: 110, h: 140 }) },
  { id: "hand", label: "Back of the hand", box: box({ x: 60, y: 350, w: 170, h: 200 }) },
];

export const ORIENTATION = { title: "Right forearm and hand · dorsal view (back of the hand)", top: "Proximal (elbow)", bottom: "Distal (fingers)", left: "Medial (ulnar side)", right: "Lateral (radial, thumb side)" };
