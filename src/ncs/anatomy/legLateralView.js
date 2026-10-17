import { dist, pointAt, project } from "../geometry.js";

/**
 * Right lower leg and foot, lateral view, for the fibular (peroneal) motor
 * study recording from extensor digitorum brevis (EDB). Units are millimetres.
 * Proximal (knee) is at the top; ANTERIOR (shin, toes) is on the RIGHT and
 * POSTERIOR (calf, heel) on the LEFT; the foot points to the right.
 *
 * Teaching schematic from standard surface-anatomy descriptions. Landmarks,
 * nerve courses and motor points need expert anatomical review.
 */

export const VIEWBOX = { x: 0, y: 0, w: 380, h: 540 };

export const SKIN = [
  [125, 0], [122, 40], [120, 80], [118, 120], [112, 170], [116, 220], [124, 270], [132, 320], [140, 370], [146, 410],
  [146, 440], [140, 470], [144, 495], [157, 512], [190, 518], [240, 520], [290, 522], [330, 520], [355, 515], [368, 506],
  [366, 494], [350, 488], [320, 478], [290, 468], [262, 456], [244, 442], [238, 428], [234, 400], [232, 350], [232, 280],
  [234, 200], [236, 130], [244, 90], [250, 60], [246, 40], [250, 0],
];

export const SURFACE = {
  tibialCrest: [[238, 100], [232, 200], [228, 300], [225, 380]],
  calfBulge: [[124, 130], [118, 180], [124, 240]],
  ankleCrease: [[222, 424], [234, 432], [246, 442]],
  heel: [[142, 480], [150, 500], [168, 512]],
  soleEdge: [[190, 512], [260, 515], [330, 512]],
  jointLine: [[122, 70], [180, 72], [246, 70]],
};

export const MUSCLES = [
  { name: "Lateral head of gastrocnemius (from the lateral femoral condyle)", pts: [[124, 40], [148, 45], [150, 230], [124, 250], [114, 170]] },
  { name: "Fibularis (peroneus) longus and brevis (tendons pass behind the lateral malleolus)", pts: [[166, 100], [194, 110], [196, 250], [186, 350], [174, 415], [166, 440], [158, 425], [164, 300], [164, 200]] },
  { name: "Fibularis brevis tendon to the 5th metatarsal tuberosity", pts: [[164, 442], [182, 460], [222, 486], [262, 501], [260, 506], [218, 491], [178, 466], [160, 447]], tendon: true },
  { name: "Tibialis anterior", pts: [[206, 110], [234, 110], [228, 300], [226, 380], [214, 380], [212, 300]] },
  { name: "Tibialis anterior tendon", pts: [[222, 370], [230, 370], [238, 430], [230, 434]], tendon: true },
  { name: "Biceps femoris tendon", pts: [[146, 0], [154, 0], [168, 86], [161, 88]], tendon: true },
  { name: "Extensor digitorum brevis (fibular)", cx: 222, cy: 462, rx: 18, ry: 9, rot: 20 },
  { name: "Abductor digiti minimi pedis (tibial; calcaneus to the 5th toe)", cx: 245, cy: 509, rx: 70, ry: 7, rot: 2 },
];

export const BONES = [
  { name: "Fibula", line: [[170, 100], [174, 200], [178, 320], [180, 430]] },
  { name: "Tibia, anterior border (deep)", line: [[240, 90], [234, 200], [229, 320], [226, 420]], dashed: true },
  { name: "Fifth metatarsal", line: [[264, 503], [330, 506]] },
];
export const BONE_SHAPES = [
  { name: "Fibular head", cx: 170, cy: 92, rx: 9, ry: 9 },
  { name: "Patella", cx: 240, cy: 40, rx: 8, ry: 22 },
  { name: "Lateral malleolus", cx: 180, cy: 442, rx: 11, ry: 14 },
  { name: "Calcaneus", cx: 168, cy: 494, rx: 24, ry: 16 },
  { name: "Base of the 5th metatarsal (tuberosity)", cx: 262, cy: 503, rx: 7, ry: 5 },
];

// Common fibular nerve along the medial border of the biceps femoris tendon, around the
// fibular neck, then the deep fibular nerve in the anterior compartment to the EDB.
const FIBULAR_TRUNK = [[142, 0], [146, 30], [150, 60], [156, 84], [160, 100], [170, 110], [184, 116], [198, 128]];
// Deep fibular nerve on the interosseous membrane, superficial again at the ankle lateral to tibialis anterior.
const DEEP_FIBULAR = [[205, 150], [205, 200], [206, 260], [208, 320], [214, 360], [221, 390], [224, 412], [226, 432], [224, 450], [222, 462]];
// Tibial nerve deep to soleus on tibialis posterior, behind the medial malleolus, then to the sole.
const TIBIAL = [[132, 0], [134, 60], [145, 120], [158, 220], [162, 320], [166, 400], [168, 445], [200, 500], [250, 508], [270, 510]];

export const NERVES = {
  fibular: {
    label: "Fibular (peroneal) nerve",
    routes: { edb: [...FIBULAR_TRUNK, ...DEEP_FIBULAR] },
    term: 2.0, cv: 50, distalCv: 35, distalFromY: 380,
    // Superficial at the fibular neck; deep in the anterior compartment; superficial again at the ankle.
    depth: (y) => (y < 90 ? 8 : y < 125 ? 4 : y < 200 ? 4 + (18 * (y - 125)) / 75 : y < 340 ? 22 : y < 390 ? 22 - (14 * (y - 340)) / 50 : 6),
  },
  tibial: {
    label: "Tibial nerve",
    routes: { plantar: TIBIAL },
    term: 2.1, cv: 46, distalCv: 35, distalFromY: 380,
    // In a lateral view the tibial nerve lies medial, i.e. deep to the lateral skin.
    depth: (y) => (y < 100 ? 35 : y < 470 ? 50 : 15),
  },
};

export const SOURCES = [
  { id: "edb", label: "extensor digitorum brevis", nerve: "fibular", route: "edb", cx: 222, cy: 462, rx: 18, ry: 9, rot: 20, ep: { x: 222, y: 462 }, amp: 6000 },
  { id: "plantarLat", label: "lateral plantar muscles (abductor digiti minimi pedis)", nerve: "tibial", route: "plantar", cx: 245, cy: 509, rx: 70, ry: 7, rot: 2, ep: { x: 250, y: 509 }, amp: 5000 },
];

export const NERVE_DRAW = [
  { name: "Common and deep fibular nerve", pts: [...FIBULAR_TRUNK, ...DEEP_FIBULAR] },
  { name: "Superficial fibular nerve (sensory, lateral compartment)", pts: [[198, 128], [196, 200], [196, 300], [206, 370], [220, 410], [250, 440]], thin: true },
  { name: "Tibial nerve (deep, posterior)", pts: TIBIAL, color: "#22c55e" },
];

export const LANDMARKS = [
  { id: "fibHead", label: "Fibular head", x: 170, y: 92, dx: -14, dy: 0 },
  { id: "biceps", label: "Biceps femoris tendon", x: 152, y: 14, dx: 12, dy: 0 },
  { id: "patella", label: "Patella", x: 240, y: 40, dx: 12, dy: 0 },
  { id: "crest", label: "Tibial crest (shin)", x: 230, y: 250, dx: 12, dy: 0 },
  { id: "taTendon", label: "Tibialis anterior tendon", x: 233, y: 405, dx: 12, dy: 0 },
  { id: "latMall", label: "Lateral malleolus", x: 180, y: 442, dx: -14, dy: 0 },
  { id: "edb", label: "EDB", x: 222, y: 462, dx: 0, dy: -14 },
  { id: "mtp5", label: "5th MTP", x: 330, y: 500, dx: 0, dy: 14 },
  { id: "heel", label: "Heel", x: 160, y: 505, dx: -12, dy: 0 },
];

const route = NERVES.fibular.routes.edb;
const edbMp = SOURCES[0].ep;
// Ankle site: the point on the nerve about 8 cm (straight line) from the EDB motor point.
let sAnkle = project({ x: 216, y: 380 }, route).s;
for (let i = 0; i < 40 && Math.abs(dist(pointAt(route, sAnkle), edbMp) - 80) > 0.5; i++) sAnkle += dist(pointAt(route, sAnkle), edbMp) > 80 ? 1 : -1;
const sBfh = project({ x: 186, y: 117 }, route).s;
const sPop = sBfh - 100;

export const PLACES = {
  edbMotorPoint: { ...edbMp, label: "Middle of the EDB belly (dorsolateral foot, in front of the lateral malleolus)" },
  dorsumMid: { x: 296, y: 482, label: "Middle of the dorsum of the foot" },
  mtp5: { x: 330, y: 500, label: "Over the 5th MTP joint (lateral border of the foot)" },
  lateralMalleolus: { x: 180, y: 442, label: "On the lateral malleolus" },
  groundAnkle: { x: 200, y: 424, label: "Ankle above the lateral malleolus, between stimulator and recording" },
  ankle8: { ...pointAt(route, sAnkle), label: "Anterior ankle, just lateral to the tibialis anterior tendon, about 8 cm from G1" },
  taTendon: { x: 230, y: 392, label: "Over the tibialis anterior tendon" },
  midShin: { x: 222, y: 250, label: "Middle of the front of the leg" },
  fibHead: { x: 170, y: 92, label: "On the fibular head" },
  bfh: { ...pointAt(route, sBfh), label: "Just below (distal to) the fibular head, over the lateral fibular neck" },
  pop: { ...pointAt(route, sPop), label: "Lateral popliteal fossa, along the medial border of the biceps femoris tendon (about 10 cm above)" },
};

export const VIEWS = [
  { id: "full", label: "Knee to foot", box: { x: 60, y: -20, w: 330, h: 560 } },
  { id: "knee", label: "Knee and fibular head", box: { x: 95, y: -10, w: 150, h: 160 } },
  { id: "foot", label: "Ankle and foot", box: { x: 150, y: 360, w: 230, h: 170 } },
];

export const ORIENTATION = { title: "Right leg · lateral view", top: "Proximal (knee)", bottom: "Distal (sole)", left: "Posterior (calf, heel)", right: "Anterior (shin, toes)" };
