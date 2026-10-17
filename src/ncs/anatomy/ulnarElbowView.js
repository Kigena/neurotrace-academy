import { pointAt, polylineLength, project } from "../geometry.js";

/**
 * Right elbow, medial view, for ulnar stimulation below and above the elbow.
 * Two geometries share one nerve: FLEXED (elbow at about 90°, the position
 * used for ulnar studies) and EXTENDED (elbow straight). With the elbow
 * straight the ulnar nerve lies slack and curved in the groove behind the
 * medial epicondyle, so a tape laid on the skin is shorter than the nerve.
 * Units are millimetres.
 *
 * Teaching schematic from standard surface-anatomy descriptions; it needs
 * expert anatomical review.
 */

function finish(m) {
  // Below-elbow site about 3 cm distal to the groove along the nerve (AANEM: no more than
  // 3 cm distal to the medial epicondyle); above-elbow site 10 cm proximal to that.
  const route = m.NERVES.ulnar.route;
  const sGroove = project(m.GROOVE, route).s;
  const be = pointAt(route, sGroove + 30);
  const ae = pointAt(route, sGroove + 30 - 100);
  m.NERVE_DRAW = [
    { name: m.NERVES.ulnar.name, pts: route, color: "#22c55e" },
    { name: m.NERVES.median.name, pts: m.NERVES.median.route },
  ];
  m.PLACES = {
    be: { ...be, label: "About 3 cm distal to the medial epicondyle (no more than 3 cm), over the ulnar nerve (below elbow)" },
    ae: { ...ae, label: "About 10 cm proximal to the below-elbow site, medial arm just behind the intermuscular septum (above elbow)" },
    groove: { x: m.GROOVE.x, y: m.GROOVE.y, label: "In the groove between the medial epicondyle and the olecranon" },
    onEpicondyle: { x: m.ME.x, y: m.ME.y, label: "On the medial epicondyle" },
    medialGroove: { ...m.MEDIAN_SPOT, label: "Medial arm, in the groove between biceps and triceps (over the brachial pulse)" },
    forearmMedial: { ...pointAt(route, sGroove + 90), label: "Medial forearm, about 9 cm below the groove" },
  };
  m.ANCHORS = { ulnar: [{ local: be, key: "be" }, { local: ae, key: "ae" }] };
  m.NERVE_LEN = polylineLength(route);
  return m;
}

const common = {
  MUSCLES: [],
  ORIENTATION: { title: "Right elbow · medial view", top: "Posterior arm (triceps)", bottom: "Anterior arm (biceps)", left: "Proximal (shoulder)", right: "Distal" },
};

export const FLEXED = finish({
  ...common,
  id: "flexed",
  ORIENTATION: { ...common.ORIENTATION, title: "Right elbow, flexed about 90° · medial view", right: "Distal arm; forearm hangs downward (its posterior border on the right)" },
  VIEWBOX: { x: 0, y: 0, w: 300, h: 330 },
  SKIN: [[0, 32], [150, 30], [230, 28], [262, 34], [280, 52], [284, 80], [280, 120], [274, 180], [270, 250], [268, 325], [190, 325], [192, 250], [196, 180], [200, 140], [190, 128], [160, 124], [100, 125], [0, 128]],
  SURFACE: {
    bicipitalGroove: [[10, 96], [80, 95], [150, 96], [185, 100]],
    olecranonContour: [[250, 30], [268, 40], [278, 56]],
    fcuEdge: [[256, 140], [254, 220], [252, 320]],
  },
  BONES: [
    { name: "Humerus", line: [[0, 80], [120, 80], [215, 84]] },
    { name: "Ulna (subcutaneous posterior border)", line: [[266, 60], [266, 160], [262, 320]] },
  ],
  BONE_SHAPES: [
    { name: "Medial epicondyle", cx: 228, cy: 92, rx: 10, ry: 9 },
    { name: "Olecranon", cx: 268, cy: 48, rx: 12, ry: 14 },
  ],
  ME: { x: 228, y: 92 },
  GROOVE: { x: 240, y: 80 },
  MEDIAN_SPOT: { x: 120, y: 98 },
  NERVES: {
    ulnar: { name: "Ulnar nerve", route: [[0, 76], [80, 76], [150, 76], [200, 76], [228, 76], [240, 80], [250, 96], [253, 120], [251, 160], [248, 220], [245, 320]], depth: (y, p) => (p.x < 200 ? 10 : p.y < 100 ? 4 : p.y < 180 ? 10 : 14) },
    median: { name: "Median nerve with the brachial artery (enters the cubital fossa)", route: [[0, 98], [100, 98], [170, 100], [195, 108], [205, 118]], depth: () => 12 },
  },
  LANDMARKS: [
    { id: "me", label: "Medial epicondyle", x: 228, y: 92, dx: 0, dy: 16 },
    { id: "olec", label: "Olecranon", x: 268, y: 48, dx: 14, dy: -10 },
    { id: "groove", label: "Ulnar groove", x: 246, y: 76, dx: 12, dy: 0 },
    { id: "tunnel", label: "Cubital tunnel (FCU heads)", x: 251, y: 100, dx: 14, dy: 0 },
    { id: "biceps", label: "Biceps", x: 80, y: 115, dx: 0, dy: 0 },
    { id: "triceps", label: "Triceps", x: 80, y: 42, dx: 0, dy: 0 },
    { id: "sulcus", label: "Groove between biceps and triceps", x: 60, y: 95, dx: 0, dy: -6 },
  ],
  VIEWS: [
    { id: "elbow", label: "Elbow", box: { x: -10, y: 0, w: 310, h: 330 } },
    { id: "close", label: "Groove close-up", box: { x: 180, y: 20, w: 110, h: 130 } },
  ],
});

export const EXTENDED = finish({
  ...common,
  id: "extended",
  ORIENTATION: { ...common.ORIENTATION, title: "Right elbow, straight · medial view", right: "Distal (forearm)" },
  VIEWBOX: { x: 0, y: 0, w: 400, h: 170 },
  SKIN: [[0, 32], [150, 30], [226, 30], [246, 25], [262, 30], [400, 36], [400, 120], [260, 126], [232, 132], [200, 130], [0, 128]],
  SURFACE: {
    bicipitalGroove: [[10, 96], [80, 95], [150, 96], [200, 100]],
    fcuEdge: [[270, 60], [330, 64], [395, 68]],
  },
  BONES: [
    { name: "Humerus", line: [[0, 80], [120, 80], [222, 86]] },
    { name: "Ulna", line: [[244, 46], [320, 60], [400, 66]] },
  ],
  BONE_SHAPES: [
    { name: "Medial epicondyle", cx: 234, cy: 72, rx: 10, ry: 9 },
    { name: "Olecranon", cx: 248, cy: 36, rx: 13, ry: 9 },
  ],
  ME: { x: 234, y: 72 },
  GROOVE: { x: 236, y: 56 },
  MEDIAN_SPOT: { x: 120, y: 98 },
  NERVES: {
    ulnar: { name: "Ulnar nerve (slack and curved in the groove with the elbow straight)", route: [[0, 76], [80, 76], [150, 76], [200, 76], [214, 70], [224, 60], [232, 55], [240, 56], [248, 64], [256, 76], [264, 80], [280, 78], [310, 76], [400, 76]], depth: (y, p) => (p.x < 210 ? 10 : p.x < 262 ? 4 : p.x < 330 ? 10 : 14) },
    median: { name: "Median nerve with the brachial artery", route: [[0, 98], [100, 98], [170, 100], [205, 108], [230, 116]], depth: () => 12 },
  },
  LANDMARKS: [
    { id: "me", label: "Medial epicondyle", x: 234, y: 72, dx: 0, dy: 18 },
    { id: "olec", label: "Olecranon", x: 248, y: 36, dx: 16, dy: -6 },
    { id: "groove", label: "Ulnar groove", x: 236, y: 56, dx: -4, dy: -10 },
    { id: "biceps", label: "Biceps", x: 80, y: 115, dx: 0, dy: 0 },
    { id: "triceps", label: "Triceps", x: 80, y: 42, dx: 0, dy: 0 },
  ],
  VIEWS: [
    { id: "elbow", label: "Elbow", box: { x: -10, y: -40, w: 420, h: 240 } },
    { id: "close", label: "Groove close-up", box: { x: 180, y: 10, w: 130, h: 130 } },
  ],
});
