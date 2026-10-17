import * as LAT from "./legLateralView.js";
import { dist, pointAt, project } from "../geometry.js";

/**
 * Right lower leg and foot, MEDIAL view, for the tibial motor study recording
 * from abductor hallucis (AH). Units are millimetres. Proximal (knee) is at
 * the top; ANTERIOR (shin, toes) is on the LEFT and POSTERIOR (calf, heel) on
 * the RIGHT; the foot points left. The outline mirrors the lateral view.
 * Structures on the far (lateral) side carry a depth so they do not appear
 * close to medial electrodes.
 *
 * Teaching schematic from standard surface-anatomy descriptions. Landmarks,
 * nerve courses and motor points need expert anatomical review.
 */

const W = 380;
const mirror = ([x, y]) => [W - x, y];

export const VIEWBOX = { x: 0, y: 0, w: W, h: 540 };
export const SKIN = LAT.SKIN.map(mirror);

export const SURFACE = {
  tibiaMedialSurface: [[148, 100], [152, 200], [156, 300], [166, 400]],
  calfBulge: [[256, 130], [262, 180], [256, 240]],
  achillesEdge: [[228, 300], [226, 360], [226, 420], [228, 470]],
  heel: [[238, 480], [230, 500], [212, 512]],
  medialArch: [[220, 505], [180, 498], [130, 500], [90, 505]],
  jointLine: [[134, 70], [200, 72], [258, 70]],
};

export const MUSCLES = [
  { name: "Medial head of gastrocnemius", pts: [[234, 40], [258, 48], [264, 200], [246, 256], [228, 150]] },
  { name: "Soleus", pts: [[214, 150], [250, 170], [244, 300], [226, 360], [212, 300]] },
  { name: "Achilles (calcaneal) tendon", pts: [[220, 300], [232, 300], [232, 470], [222, 470]], tendon: true },
  { name: "Tibialis posterior and FDL tendons (front of the tarsal tunnel)", pts: [[196, 330], [204, 330], [204, 440], [178, 466], [172, 462], [196, 436]], tendon: true },
  { name: "Flexor hallucis longus tendon (back of the tarsal tunnel)", pts: [[216, 380], [222, 380], [222, 450], [210, 462], [206, 458], [216, 446]], tendon: true },
  { name: "Abductor hallucis (tibial, medial plantar; calcaneus to the base of the big toe)", cx: 160, cy: 479, rx: 76, ry: 15, rot: -2 },
];

export const BONES = [
  { name: "Tibia, medial border (the medial surface lies in front of it, under the skin)", line: [[160, 100], [170, 200], [178, 320], [186, 415]] },
  { name: "Fibula (far side)", line: [[210, 100], [206, 200], [202, 320], [200, 430]], dashed: true },
  { name: "First metatarsal", line: [[148, 474], [84, 492]] },
];
export const BONE_SHAPES = [
  { name: "Patella", cx: 140, cy: 40, rx: 8, ry: 22 },
  { name: "Medial malleolus", cx: 190, cy: 430, rx: 12, ry: 13 },
  { name: "Navicular tubercle", cx: 166, cy: 458, rx: 6, ry: 5 },
  { name: "Calcaneus", cx: 214, cy: 494, rx: 24, ry: 16 },
];

// Tibial nerve: deep in the popliteal fossa and posterior compartment, behind the medial
// malleolus between it and the Achilles tendon, then the medial plantar nerve to AH.
const TIBIAL = [[240, 0], [238, 60], [232, 120], [226, 200], [222, 280], [218, 350], [214, 400], [212, 425], [208, 445], [200, 460], [188, 466], [178, 468]];
const FIBULAR_FAR = LAT.NERVES.fibular.routes.edb.map(mirror);

export const NERVES = {
  tibial: {
    label: "Tibial nerve",
    routes: { ahb: TIBIAL },
    term: 2.1, cv: 46, distalCv: 35, distalFromY: 380,
    // Depth from the MEDIAL skin: midline in the fossa, deep in the calf, superficial behind the malleolus.
    depth: (y) => (y < 80 ? 45 : y < 330 ? 35 : y < 410 ? 35 - (29 * (y - 330)) / 80 : y < 460 ? 6 : 10),
  },
  fibular: {
    label: "Fibular (peroneal) nerve",
    routes: { edb: FIBULAR_FAR },
    term: 2.0, cv: 50, distalCv: 35, distalFromY: 380,
    depth: () => 70, // on the far (lateral) side of the limb in this view
  },
};

const AH_MP = { x: 178, y: 468 }; // about 1 cm below and 1 cm behind the navicular tubercle
export const SOURCES = [
  { id: "ahb", label: "abductor hallucis", nerve: "tibial", route: "ahb", cx: 160, cy: 479, rx: 76, ry: 15, rot: -2, ep: AH_MP, amp: 11000 },
  { id: "edb", label: "extensor digitorum brevis (lateral foot)", nerve: "fibular", route: "edb", cx: 158, cy: 462, rx: 18, ry: 9, rot: -20, ep: { x: 158, y: 462 }, amp: 6000, depth: 45 },
];

export const NERVE_DRAW = [
  { name: "Tibial nerve and medial plantar branch", pts: TIBIAL, color: "#22c55e" },
  { name: "Fibular nerve (far, lateral side)", pts: FIBULAR_FAR, thin: true },
  { name: "Posterior tibial artery (in the tarsal tunnel, just in front of the nerve)", pts: [[204, 380], [207, 420], [204, 446], [196, 458]], color: "#ef4444", thin: true },
];

export const LANDMARKS = [
  { id: "patella", label: "Patella", x: 140, y: 40, dx: -12, dy: 0 },
  { id: "tibia", label: "Medial border of the tibia", x: 174, y: 250, dx: -12, dy: 0 },
  { id: "gastroc", label: "Medial gastrocnemius", x: 250, y: 140, dx: 12, dy: 0 },
  { id: "achilles", label: "Achilles tendon", x: 228, y: 380, dx: 12, dy: 0 },
  { id: "mm", label: "Medial malleolus", x: 190, y: 430, dx: -14, dy: 0 },
  { id: "navicular", label: "Navicular tubercle", x: 166, y: 458, dx: -12, dy: -4 },
  { id: "mtp1", label: "1st MTP", x: 76, y: 496, dx: 0, dy: 14 },
  { id: "heel", label: "Heel", x: 222, y: 505, dx: 12, dy: 0 },
];

const route = TIBIAL;
// Ankle site: on the nerve about 8 cm (straight line) from the AH motor point.
let sAnkle = project({ x: 214, y: 400 }, route).s;
for (let i = 0; i < 40 && Math.abs(dist(pointAt(route, sAnkle), AH_MP) - 80) > 0.5; i++) sAnkle += dist(pointAt(route, sAnkle), AH_MP) > 80 ? 1 : -1;

export const PLACES = {
  ahMotorPoint: { ...AH_MP, label: "Abductor hallucis, about 1 cm below and 1 cm behind the navicular tubercle (motor point)" },
  archMid: { x: 120, y: 488, label: "Middle of the medial arch" },
  medialHeel: { x: 218, y: 504, label: "Medial heel" },
  mtp1: { x: 76, y: 496, label: "Over the 1st MTP joint (medial side of the big toe)" },
  groundDorsum: { x: 152, y: 446, label: "Front of the ankle, between stimulator and recording" },
  ankle8: { ...pointAt(route, sAnkle), label: "Behind the medial malleolus, between it and the Achilles tendon, about 8 cm from G1" },
  onMalleolus: { x: 190, y: 430, label: "On the medial malleolus" },
  frontOfMalleolus: { x: 170, y: 418, label: "In front of the medial malleolus" },
  onAchilles: { x: 228, y: 410, label: "On the Achilles tendon" },
  calfMedial: { x: 200, y: 260, label: "Medial calf" },
};

// Main-route points that match the back-of-knee panel (src/ncs/anatomy/kneePosteriorView.js).
const sCrease = project({ x: 238, y: 60 }, route).s;
export const KNEE_ANCHORS = {
  tibCrease: pointAt(route, sCrease),
  tibCalf: pointAt(route, sCrease + 130),
  fibNeck: { x: W - 184, y: 116 },
};

export const VIEWS = [
  { id: "full", label: "Knee to foot", box: { x: -10, y: -20, w: 330, h: 560 } },
  { id: "calf", label: "Knee and calf", box: { x: 100, y: -10, w: 200, h: 280 } },
  { id: "foot", label: "Ankle and foot", box: { x: 40, y: 370, w: 230, h: 160 } },
];

export const ORIENTATION = { title: "Right leg · medial view", top: "Proximal (knee)", bottom: "Distal (sole)", left: "Anterior (shin, toes)", right: "Posterior (calf, heel)" };
