/**
 * Right lower leg, posterolateral view, for the sural sensory study.
 * Units are millimetres (1 unit = 1 mm). The view looks at the back of the
 * calf with the lateral side to the right; the foot is turned so its lateral
 * border runs to the right below the lateral malleolus.
 *
 * This is a teaching schematic drawn from standard descriptions of surface
 * anatomy. Landmark positions, the nerve course and the recording regions
 * need expert anatomical review before the view is treated as validated.
 */

export const VIEWBOX = { x: 0, y: 0, w: 380, h: 540 };

// Skin outline, clockwise from the medial side of the popliteal crease.
export const SKIN = [
  [105, 10], [103, 60], [102, 110], [104, 160], [108, 210], [122, 260], [133, 310], [138, 350], [140, 382],
  [137, 400], [141, 424], [146, 450], [153, 472], [166, 486], [186, 491], [208, 489], [232, 487],
  [266, 489], [302, 491], [334, 493], [352, 489], [357, 478], [350, 467], [322, 459], [292, 451],
  [264, 441], [242, 429], [229, 416], [226, 403], [223, 388], [221, 365], [222, 330], [226, 290],
  [234, 240], [241, 190], [242, 140], [241, 90], [240, 50], [238, 10],
];

// Faint surface contours that stay visible on the skin (palpable / visible landmarks).
export const SURFACE = {
  achillesMedialEdge: [[165, 262], [166, 320], [168, 380], [169, 410], [164, 452]],
  achillesLateralEdge: [[186, 262], [186, 320], [184, 380], [183, 410], [190, 452]],
  calfBulgeMedial: [[110, 90], [116, 150], [132, 205], [152, 235]],
  calfBulgeLateral: [[235, 90], [230, 150], [214, 200], [196, 228]],
  heel: [[150, 455], [162, 478], [186, 486], [204, 478]],
  footCrease: [[230, 470], [262, 476], [300, 480]],
};

export const MUSCLES = [
  { name: "Soleus (deep to gastrocnemius)", pts: [[110, 190], [238, 190], [228, 268], [198, 300], [156, 300], [124, 268]] },
  { name: "Gastrocnemius, medial head", pts: [[112, 22], [165, 26], [170, 120], [160, 236], [140, 230], [112, 170], [102, 110]] },
  { name: "Gastrocnemius, lateral head", pts: [[178, 26], [234, 22], [242, 100], [232, 168], [206, 214], [186, 220], [180, 120]] },
  { name: "Achilles (calcaneal) tendon", pts: [[164, 252], [188, 252], [184, 380], [183, 410], [190, 452], [164, 452], [169, 410], [168, 380]] },
  { name: "Fibularis (peroneus) brevis tendon, in the groove behind the lateral malleolus", pts: [[214, 300], [220, 300], [208, 380], [210, 410], [236, 440], [284, 470], [278, 474], [230, 446], [202, 414], [202, 380]], tendon: true },
];

export const BONES = [
  { name: "Fibula", line: [[232, 38], [231, 60], [226, 160], [220, 300], [216, 385]] },
  { name: "Tibia (deep, medial)", line: [[128, 30], [134, 160], [140, 300], [143, 378]], dashed: true },
];
export const BONE_SHAPES = [
  { name: "Fibular head", cx: 233, cy: 38, rx: 10, ry: 9 },
  { name: "Lateral malleolus", cx: 214, cy: 398, rx: 11, ry: 15 },
  { name: "Medial malleolus (far side)", cx: 145, cy: 392, rx: 8, ry: 11, dashed: true },
  { name: "Calcaneus", cx: 180, cy: 463, rx: 26, ry: 20 },
  { name: "Base of the 5th metatarsal", cx: 283, cy: 474, rx: 9, ry: 6 },
];

// Sural nerve: medial sural cutaneous nerve in the midline groove of the calf,
// over the tendon or midline until it crosses the lateral border of the
// Achilles tendon about 10 cm above the heel, then behind and below the
// lateral malleolus (about 1-1.5 cm posterior to it) and along the lateral
// border of the foot.
export const NERVE = [
  [172, 12], [172, 60], [173, 120], [175, 170], [177, 215], [179, 250], [181, 290], [184, 330],
  [188, 350], [196, 375], [200, 398], [202, 413], [211, 428], [227, 440], [251, 452], [276, 462], [302, 470], [332, 476],
];
export const NERVE_BRANCHES = [
  { name: "Sural communicating branch (from the common fibular nerve), joining in the distal calf", pts: [[226, 20], [218, 90], [205, 170], [192, 250], [186, 310]] },
];

export const LANDMARKS = [
  { id: "popliteal", label: "Popliteal crease", x: 172, y: 14, dx: 0, dy: -4 },
  { id: "fibHead", label: "Fibular head", x: 233, y: 38, dx: 14, dy: 0 },
  { id: "gastroc", label: "Gastrocnemius heads", x: 172, y: 120, dx: 0, dy: 0 },
  { id: "midCalf", label: "Midline groove of the calf", x: 175, y: 200, dx: -6, dy: 0 },
  { id: "achilles", label: "Achilles tendon", x: 172, y: 300, dx: -14, dy: 0 },
  { id: "latMall", label: "Lateral malleolus", x: 214, y: 398, dx: 16, dy: 0 },
  { id: "heel", label: "Heel (calcaneus)", x: 180, y: 470, dx: 0, dy: 14 },
  { id: "mt5", label: "Base of 5th metatarsal", x: 283, y: 474, dx: 0, dy: 14 },
];

// Named spots for the accessible "place at landmark" dropdowns.
export const PLACES = {
  behindLatMall: { x: 199, y: 398, label: "Between the lateral malleolus and the Achilles tendon" },
  onLatMall: { x: 214, y: 398, label: "On the lateral malleolus" },
  onAchilles: { x: 176, y: 395, label: "On the Achilles tendon" },
  latFoot35: { x: 213, y: 429, label: "Below the lateral malleolus, about 3.5 cm distal along the nerve" },
  latFoot15: { x: 202, y: 413, label: "Just behind and below the lateral malleolus (about 1.5 cm distal)" },
  heel: { x: 182, y: 470, label: "Heel" },
  lowerCalfLat: { x: 205, y: 330, label: "Lower calf, lateral side" },
  lowerCalfMid: { x: 190, y: 340, label: "Lower calf, between the stimulator and the ankle" },
  calfMidline14: { x: 180, y: 262, label: "Posterior calf, just lateral to the midline (about 14 cm proximal)" },
  calfMidline10: { x: 183, y: 300, label: "Posterior calf, lower third (about 10 cm proximal)" },
  calfMedial14: { x: 140, y: 262, label: "Posterior calf, medial side" },
  dorsumFoot: { x: 300, y: 462, label: "Dorsolateral foot" },
};

export const VIEWS = [
  { id: "full", label: "Calf and ankle", box: { x: 40, y: -30, w: 330, h: 550 } },
  { id: "calf", label: "Calf", box: { x: 60, y: 0, w: 250, h: 320 } },
  { id: "ankle", label: "Ankle close-up", box: { x: 130, y: 330, w: 170, h: 170 } },
  { id: "foot", label: "Lateral foot", box: { x: 180, y: 390, w: 190, h: 120 } },
];

export const ORIENTATION = { title: "Right leg · posterolateral view", top: "Proximal (knee)", bottom: "Distal (foot)", left: "Medial", right: "Lateral" };

/**
 * Relative size of the potential the nerve presents to a surface electrode at
 * arc length s (mm along NERVE). Beyond the lateral malleolus the nerve
 * divides into smaller branches along the foot, so a distal electrode sees
 * less of the volley.
 */
export function nerveScale(s) {
  if (s <= 395) return 1;
  if (s >= 430) return 0.6;
  return 1 - (0.4 * (s - 395)) / 35;
}
