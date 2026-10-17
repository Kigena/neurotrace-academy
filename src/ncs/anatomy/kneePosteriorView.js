/**
 * Right knee, posterior view, showing the popliteal fossa for proximal tibial
 * (and fibular) stimulation. Units are millimetres. Proximal (thigh) at the
 * top; viewed from behind, MEDIAL is on the LEFT and LATERAL on the RIGHT.
 * The tibial nerve runs down the middle of the fossa and is the most
 * superficial of the neurovascular structures; the popliteal artery, deepest,
 * enters medially and passes deep to the nerve. The common fibular nerve
 * leaves laterally along the medial border of the biceps femoris tendon and
 * winds below the fibular head.
 *
 * Teaching schematic from standard surface-anatomy descriptions; it needs
 * expert anatomical review.
 */

export const id = "knee";
export const VIEWBOX = { x: 0, y: 0, w: 300, h: 300 };
export const SKIN = [[92, 0], [208, 0], [215, 80], [212, 150], [208, 220], [203, 300], [98, 300], [92, 220], [88, 150], [85, 80]];

export const SURFACE = {
  crease: [[99, 150], [150, 154], [202, 150]],
  bicepsEdge: [[199, 20], [192, 90], [186, 150]],
  hamstringEdge: [[103, 20], [111, 90], [118, 150]],
  gastrocMedial: [[118, 155], [129, 220], [144, 290]],
  gastrocLateral: [[185, 155], [173, 220], [159, 290]],
};

export const MUSCLES = [
  { name: "Biceps femoris (lateral border of the fossa)", pts: [[192, 0], [211, 0], [206, 120], [197, 180], [188, 150]] },
  { name: "Semitendinosus and semimembranosus (medial border)", pts: [[92, 0], [114, 0], [120, 150], [108, 170], [94, 120]] },
  { name: "Medial head of gastrocnemius", pts: [[115, 150], [147, 160], [147, 300], [118, 300], [103, 220]] },
  { name: "Lateral head of gastrocnemius", pts: [[154, 160], [188, 150], [199, 220], [189, 300], [155, 300]] },
];

export const BONES = [];
export const BONE_SHAPES = [
  { name: "Fibular head", cx: 199, cy: 190, rx: 7, ry: 8 },
  { name: "Medial femoral condyle (deep)", cx: 124, cy: 140, rx: 17, ry: 18, dashed: true },
  { name: "Lateral femoral condyle (deep)", cx: 177, cy: 140, rx: 16, ry: 18, dashed: true },
];

export const NERVES = {
  // Depths from the posterior skin.
  tibial: { name: "Tibial nerve", route: [[157, 0], [154, 60], [151, 120], [150, 150], [150, 200], [149, 300]], depth: (y) => (y < 100 ? 22 : y < 200 ? 18 : 30) },
  fibular: { name: "Common fibular nerve", route: [[157, 30], [170, 80], [183, 130], [192, 165], [197, 185], [201, 200], [199, 212]], depth: () => 8 },
};

export const NERVE_DRAW = [
  { name: "Sciatic nerve dividing above the fossa", pts: [[158, -10], [157, 30]] },
  { name: "Tibial nerve (midline, most superficial)", pts: NERVES.tibial.route, color: "#22c55e" },
  { name: "Common fibular nerve (along the biceps tendon, below the fibular head)", pts: NERVES.fibular.route },
  { name: "Popliteal artery (deepest; enters medially and passes deep to the nerve)", pts: [[136, 0], [142, 80], [150, 150], [154, 230], [154, 300]], color: "#ef4444", thin: true },
];

export const LANDMARKS = [
  { id: "crease", label: "Popliteal crease", x: 202, y: 150, dx: 12, dy: 0 },
  { id: "biceps", label: "Biceps femoris tendon", x: 199, y: 60, dx: 12, dy: 0 },
  { id: "hamstrings", label: "Semitendinosus / semimembranosus", x: 106, y: 60, dx: -12, dy: 0 },
  { id: "fibHead", label: "Fibular head", x: 199, y: 190, dx: 12, dy: 0 },
  { id: "pulse", label: "Popliteal pulse", x: 146, y: 120, dx: -12, dy: 0 },
];

export const PLACES = {
  popMid: { x: 151, y: 146, label: "Middle of the popliteal fossa at or just above the crease, over or just lateral to the popliteal pulse (tibial nerve)" },
  popLateral: { x: 184, y: 132, label: "Lateral fossa, along the biceps tendon (common fibular nerve)" },
  popMedial: { x: 115, y: 110, label: "Medial fossa, over the hamstring tendons" },
  popHigh: { x: 153, y: 60, label: "Upper fossa, well above the crease" },
};

export const ANCHORS = {
  tibial: [{ local: { x: 150, y: 150 }, key: "tibCrease" }, { local: { x: 149, y: 280 }, key: "tibCalf" }],
  fibular: [{ local: { x: 199, y: 210 }, key: "fibNeck" }],
};

export const VIEWS = [
  { id: "knee", label: "Popliteal fossa", box: { x: 40, y: -10, w: 220, h: 320 } },
  { id: "close", label: "Close-up", box: { x: 100, y: 80, w: 120, h: 140 } },
];

export const ORIENTATION = { title: "Right knee · posterior view", top: "Proximal (thigh)", bottom: "Distal (calf)", left: "Medial", right: "Lateral" };
