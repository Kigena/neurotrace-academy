/**
 * Right forearm and hand, anterior (palmar) view, for the median motor study
 * recording from the abductor pollicis brevis. Units are millimetres. In
 * anatomical position facing the viewer, the thumb (lateral, radial side) is
 * on the LEFT of the image and the little finger (medial, ulnar side) on the
 * RIGHT; proximal (elbow) is at the top.
 *
 * Teaching schematic drawn from standard surface-anatomy descriptions.
 * Landmarks, nerve courses and motor points need expert anatomical review.
 */

export const VIEWBOX = { x: 0, y: 0, w: 300, h: 600 };

export const SKIN = [
  [118, 0], [116, 50], [112, 100], [108, 118], [110, 132], [112, 160], [114, 220], [118, 290], [121, 340], [123, 370],
  [121, 384], [114, 396], [106, 410], [99, 426], [92, 442],
  [86, 458], [80, 478], [77, 496], [80, 507], [88, 509], [95, 500], [100, 484], [106, 468], [112, 462],
  [114, 476], [111, 490], [110, 550], [114, 561], [121, 563], [127, 558], [128, 492],
  [131, 488], [131, 562], [135, 573], [143, 575], [149, 568], [150, 490],
  [153, 488], [153, 556], [157, 565], [165, 565], [170, 557], [171, 488],
  [174, 484], [175, 532], [179, 542], [186, 542], [190, 534], [192, 486],
  [195, 470], [197, 445], [195, 415], [190, 394], [184, 382],
  [182, 370], [184, 340], [187, 280], [191, 210], [192, 160], [193, 134], [194, 120], [190, 104], [186, 60], [184, 0],
];

export const SURFACE = {
  distalWristCrease: [[122, 383], [150, 385], [184, 383]],
  proximalWristCrease: [[123, 372], [150, 374], [182, 372]],
  thenarCrease: [[150, 392], [138, 420], [128, 446], [118, 462]],
  distalPalmarCrease: [[150, 452], [170, 458], [192, 462]],
  fcrRidge: [[133, 300], [132, 340], [131, 370]],
  plRidge: [[149, 300], [149, 340], [150, 372]],
  fcuRidge: [[180, 300], [181, 340], [181, 370]],
  bicepsTendon: [[148, 96], [146, 112], [143, 132]],
  elbowCrease: [[112, 122], [150, 128], [190, 122]],
};

// Drawn muscle and tendon layer. Ellipses use {cx, cy, rx, ry, rot (degrees)}.
export const MUSCLES = [
  { name: "Abductor pollicis brevis (median)", cx: 115, cy: 427, rx: 10, ry: 30, rot: 25 },
  { name: "Opponens and superficial flexor pollicis brevis (median, deeper)", cx: 125, cy: 428, rx: 9, ry: 18, rot: 20 },
  { name: "Adductor pollicis and deep FPB head (ulnar, deep to the thenar muscles)", cx: 132, cy: 440, rx: 20, ry: 10, rot: 52 },
  { name: "Abductor digiti minimi (ulnar)", cx: 186, cy: 432, rx: 8, ry: 36, rot: -5 },
  { name: "Flexor carpi radialis tendon", pts: [[131, 250], [135, 250], [132, 388], [128, 388]], tendon: true },
  { name: "Palmaris longus tendon", pts: [[148, 250], [151, 250], [151, 386], [148, 386]], tendon: true },
  { name: "Flexor carpi ulnaris tendon", pts: [[178, 250], [183, 250], [183, 388], [178, 388]], tendon: true },
  { name: "Biceps tendon (dives laterally to the radial tuberosity)", pts: [[146, 80], [153, 80], [146, 140], [139, 140]], tendon: true },
  { name: "Pronator teres (medial epicondyle to mid-lateral radius)", pts: [[182, 112], [192, 128], [122, 246], [116, 228]] },
];

export const BONES = [
  { name: "Humerus (distal)", line: [[150, 0], [150, 100]] },
  { name: "Radius", line: [[112, 134], [116, 220], [118, 300], [121, 372]] },
  { name: "Ulna", line: [[188, 124], [186, 220], [184, 300], [182, 372]] },
  { name: "First metacarpal", line: [[113, 412], [98, 458]] },
  { name: "Thumb phalanges", line: [[96, 464], [88, 488], [85, 502]] },
  { name: "Metacarpal 2", line: [[128, 405], [121, 468]] },
  { name: "Metacarpal 3", line: [[146, 405], [142, 470]] },
  { name: "Metacarpal 4", line: [[164, 405], [163, 468]] },
  { name: "Metacarpal 5", line: [[180, 402], [183, 465]] },
];
export const BONE_SHAPES = [
  { name: "Lateral epicondyle", cx: 112, cy: 118, rx: 6, ry: 7 },
  { name: "Medial epicondyle", cx: 190, cy: 118, rx: 7, ry: 8 },
  { name: "Radial styloid", cx: 122, cy: 375, rx: 5, ry: 6 },
  { name: "Ulnar styloid (behind)", cx: 182, cy: 364, rx: 5, ry: 5, dashed: true },
  { name: "Carpal bones", cx: 152, cy: 396, rx: 30, ry: 12 },
  { name: "Pisiform", cx: 180, cy: 389, rx: 5, ry: 5 },
  { name: "Scaphoid tubercle", cx: 128, cy: 389, rx: 5, ry: 5 },
];

// Nerve routes, each from proximal to the muscle it supplies (arc length is used for latency).
export const MEDIAN_TRUNK = [[166, 0], [166, 60], [167, 105], [166, 128], [161, 160], [154, 210], [148, 270], [145, 330], [143, 372], [143, 392], [142, 408]];
const ULNAR_TRUNK = [[184, 0], [186, 60], [188, 100], [190, 122], [188, 145], [189, 200], [183, 270], [177, 330], [173, 372], [172, 392]];

export const NERVES = {
  median: {
    label: "Median nerve",
    // Recurrent motor branch arises at the distal edge of the transverse carpal ligament.
    routes: { apb: [...MEDIAN_TRUNK, [143, 414], [136, 416], [126, 418], [117, 421]] },
    term: 1.4, cv: 57, distalCv: 40, distalFromY: 360,
    depth: (y) => (y < 100 ? 10 : y < 150 ? 12 : y < 260 ? 18 : y < 350 ? 18 - (12 * (y - 260)) / 90 : y < 420 ? 6 : 8),
  },
  ulnar: {
    label: "Ulnar nerve",
    routes: {
      adm: [...ULNAR_TRUNK, [178, 405], [186, 428]],
      deep: [...ULNAR_TRUNK, [168, 410], [152, 436], [134, 448]],
    },
    term: 1.1, cv: 60, distalCv: 45, distalFromY: 360,
    // Depth from the ANTERIOR skin. In the retrocondylar groove the nerve is only a few
    // millimetres under the posterior skin, but from the front it is about 30 mm deep.
    depth: (y) => (y < 90 ? 10 : y < 170 ? 30 : y < 260 ? 16 : y < 350 ? 14 - (8 * (y - 260)) / 90 : y < 420 ? 6 : 10),
  },
};

// Muscles whose CMAP the recording electrodes can see. amp = monopolar size at the motor point (µV).
export const SOURCES = [
  { id: "apb", label: "median thenar muscles (APB, opponens, superficial FPB)", nerve: "median", route: "apb", cx: 121, cy: 425, rx: 16, ry: 28, rot: 25, ep: { x: 117, y: 421 }, amp: 9500 },
  { id: "ulnarThenar", label: "ulnar thenar muscles (adductor pollicis, deep FPB)", nerve: "ulnar", route: "deep", cx: 132, cy: 440, rx: 20, ry: 10, rot: 52, ep: { x: 134, y: 446 }, amp: 7000 },
  { id: "adm", label: "abductor digiti minimi", nerve: "ulnar", route: "adm", cx: 186, cy: 432, rx: 9, ry: 36, rot: -5, ep: { x: 186, y: 428 }, amp: 10000 },
];

export const NERVE_DRAW = [
  { name: "Median nerve", pts: NERVES.median.routes.apb },
  { name: "Median digital branches", pts: [[143, 408], [140, 440], [136, 480]], thin: true },
  { name: "Ulnar nerve (behind the medial epicondyle at the elbow)", pts: ULNAR_TRUNK, color: "#22c55e" },
  { name: "Ulnar branch to the hypothenar muscles", pts: [[172, 392], [178, 405], [186, 428]], color: "#22c55e", thin: true },
  { name: "Deep ulnar branch to the thenar muscles", pts: [[172, 392], [168, 410], [152, 436], [134, 448]], color: "#22c55e", thin: true },
];

export const LANDMARKS = [
  { id: "medEpi", label: "Medial epicondyle", x: 190, y: 118, dx: 10, dy: 0 },
  { id: "latEpi", label: "Lateral epicondyle", x: 112, y: 118, dx: -10, dy: 0 },
  { id: "biceps", label: "Biceps tendon", x: 148, y: 98, dx: -14, dy: 0 },
  { id: "pulse", label: "Brachial pulse", x: 159, y: 126, dx: 0, dy: -8 },
  { id: "fossa", label: "Cubital fossa", x: 150, y: 140, dx: 0, dy: 14 },
  { id: "fcr", label: "FCR tendon", x: 132, y: 330, dx: -12, dy: 0 },
  { id: "pl", label: "Palmaris longus", x: 149, y: 320, dx: 0, dy: -8 },
  { id: "fcu", label: "FCU tendon", x: 181, y: 330, dx: 12, dy: 0 },
  { id: "crease", label: "Distal wrist crease", x: 184, y: 383, dx: 12, dy: 0 },
  { id: "thenar", label: "Thenar eminence", x: 112, y: 440, dx: -14, dy: 0 },
  { id: "hypothenar", label: "Hypothenar eminence", x: 192, y: 440, dx: 12, dy: 0 },
  { id: "thumbMcp", label: "Thumb MCP", x: 95, y: 466, dx: -12, dy: 0 },
];

export const PLACES = {
  apbMotorPoint: { x: 117, y: 421, label: "Middle of the APB belly (thenar motor point)" },
  thenarProximal: { x: 124, y: 397, label: "Proximal thenar, just beyond the distal wrist crease" },
  thenarUlnar: { x: 134, y: 448, label: "Ulnar side of the thenar eminence, near the first web" },
  thumbMcp: { x: 94, y: 468, label: "Thumb, over the MCP joint" },
  palmCenter: { x: 155, y: 432, label: "Centre of the palm" },
  hypothenar: { x: 186, y: 428, label: "Middle of the hypothenar eminence (ADM)" },
  palmGround: { x: 160, y: 402, label: "Palm just beyond the wrist crease, between stimulator and recording" },
  forearmDistal: { x: 155, y: 300, label: "Distal forearm, proximal to the wrist stimulation site" },
  wristMedian8: { x: 141, y: 345, label: "Wrist, between FCR and palmaris longus, about 8 cm from G1" },
  wristFcr: { x: 129, y: 345, label: "Over the FCR tendon at the wrist" },
  wristUlnar: { x: 175, y: 349, label: "Wrist, just radial to the FCU tendon (ulnar nerve), about 8 cm from the ADM" },
  littleFinger: { x: 183, y: 502, label: "Little finger, over the proximal phalanx" },
  midForearm: { x: 150, y: 240, label: "Middle of the forearm" },
  elbowMedian: { x: 166, y: 128, label: "Cubital fossa, medial to the brachial pulse" },
  elbowLateral: { x: 134, y: 128, label: "Cubital fossa, lateral to the biceps tendon" },
};

export const VIEWS = [
  { id: "full", label: "Forearm and hand", box: { x: 30, y: -20, w: 240, h: 610 } },
  { id: "hand", label: "Hand close-up", box: { x: 60, y: 370, w: 160, h: 200 } },
  { id: "wrist", label: "Wrist close-up", box: { x: 85, y: 290, w: 140, h: 150 } },
  { id: "elbow", label: "Elbow close-up", box: { x: 80, y: 60, w: 150, h: 150 } },
];

export const ORIENTATION = { title: "Right forearm and hand · anterior (palmar) view", top: "Proximal (elbow)", bottom: "Distal (fingers)", left: "Lateral (radial, thumb side)", right: "Medial (ulnar side)" };

// Ulnar nerve points on the main route that match the below-elbow and
// above-elbow sites of the medial elbow view (src/ncs/anatomy/ulnarElbowView.js).
export const ULNAR_ANCHORS = { be: { x: 189, y: 148 }, ae: { x: 186, y: 48 } };
