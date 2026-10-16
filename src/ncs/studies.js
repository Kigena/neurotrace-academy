/**
 * NeuroLinea NCS study catalog: electrode sites on the two limb diagrams,
 * the standard set-up for each study, the simulated healthy-subject values
 * and the reference limits shown to the learner.
 *
 * Reference limits come from the Quick reference table of this app's
 * NCS/EMG Study Hub (src/data/emgNcs/hub.json); labs set their own.
 * Latency limits are upper limits; amplitude and conduction velocity limits
 * are lower limits.
 */

// Sites are drawn on an 800 x 240 diagram. Arm: right arm, palm up, hand to
// the right, thumb (radial side) at the top. Leg: knee to the left, foot to
// the right, medial side at the top and lateral side at the bottom.
export const SITES = {
  arm: {
    apb: { x: 590, y: 108, label: "APB belly, middle of the thenar eminence (motor point)" },
    thenarProx: { x: 556, y: 117, label: "Proximal thenar edge, near the wrist crease" },
    palmCenter: { x: 612, y: 140, label: "Centre of the palm" },
    d1: { x: 636, y: 57, label: "Thumb, over the MCP joint / proximal phalanx" },
    thumbBase: { x: 606, y: 79, label: "Dorsum of the thumb, 3-4 cm distal to the snuffbox" },
    snuffbox: { x: 554, y: 93, label: "Over the EPL tendon at the anatomical snuffbox" },
    adm: { x: 604, y: 170, label: "ADM belly, middle of the hypothenar eminence" },
    d2prox: { x: 692, y: 108, label: "Index finger, ring over the proximal phalanx" },
    d2dist: { x: 728, y: 108, label: "Index finger, ring 3-4 cm further distal" },
    d3prox: { x: 702, y: 128, label: "Middle finger, ring over the proximal phalanx" },
    d3dist: { x: 740, y: 128, label: "Middle finger, ring 3-4 cm further distal" },
    d5prox: { x: 688, y: 168, label: "Little finger, ring over the proximal phalanx" },
    d5dist: { x: 722, y: 168, label: "Little finger, ring 3-4 cm further distal" },
    dorsumHand: { x: 640, y: 150, label: "Back of the hand", ground: true },
    wristDorsum: { x: 520, y: 150, label: "Back of the wrist", ground: true },
    forearmMid: { x: 400, y: 112, label: "Middle of the forearm", ground: true },
  },
  leg: {
    edb: { x: 600, y: 170, label: "EDB belly, dorsolateral foot in front of the lateral malleolus" },
    mtp5: { x: 722, y: 186, label: "Little toe, over the MTP joint" },
    dorsumFoot: { x: 650, y: 136, label: "Middle of the dorsum of the foot" },
    ahb: { x: 586, y: 92, label: "AHB: 1 cm below and 1 cm behind the navicular tubercle" },
    mtp1: { x: 716, y: 86, label: "Big toe, over the MTP joint" },
    archCenter: { x: 640, y: 104, label: "Middle of the medial arch" },
    latMall: { x: 530, y: 190, label: "Behind and below the lateral malleolus" },
    latFoot: { x: 572, y: 202, label: "Lateral border of the foot, 3-4 cm further distal" },
    ankleFront: { x: 500, y: 140, label: "Front of the ankle", ground: true },
    shin: { x: 380, y: 132, label: "Middle of the shin", ground: true },
    footDorsumGround: { x: 668, y: 150, label: "Dorsum of the foot", ground: true },
  },
};

// Stimulation sites. `distal` sites take a distance from the active electrode
// chosen by the learner; proximal sites are fixed anatomical points.
export const STIM_SITES = {
  medWrist: { limb: "arm", nerve: "median", distal: true, y: 130, label: "Median at the wrist, between the FCR and palmaris longus tendons" },
  ulnWrist: { limb: "arm", nerve: "ulnar", distal: true, y: 162, label: "Ulnar at the wrist, just radial to the FCU tendon" },
  radForearm: { limb: "arm", nerve: "radial", distal: true, y: 96, label: "Superficial radial over the lateral radius, distal forearm" },
  medElbow: { limb: "arm", nerve: "median", x: 250, y: 132, label: "Median at the antecubital fossa, medial to the brachial pulse" },
  ulnBE: { limb: "arm", nerve: "ulnar", x: 292, y: 174, label: "Ulnar 3-4 cm below the medial epicondyle" },
  ulnAE: { limb: "arm", nerve: "ulnar", x: 168, y: 174, label: "Ulnar on the medial arm, about 10 cm above the below-elbow site" },
  fibAnkle: { limb: "leg", nerve: "fibular", distal: true, y: 158, label: "Deep fibular at the anterior ankle, lateral to the tibialis anterior tendon" },
  fibBFH: { limb: "leg", nerve: "fibular", x: 236, y: 184, label: "Fibular just below the fibular head" },
  fibPop: { limb: "leg", nerve: "fibular", x: 150, y: 180, label: "Fibular at the lateral popliteal fossa" },
  tibAnkle: { limb: "leg", nerve: "tibial", distal: true, y: 100, label: "Tibial behind the medial malleolus" },
  tibPop: { limb: "leg", nerve: "tibial", x: 150, y: 128, label: "Tibial at the middle of the popliteal fossa" },
  suralCalf: { limb: "leg", nerve: "sural", distal: true, y: 176, label: "Sural on the posterior calf, just lateral to the midline" },
};

export const LIMB_REF_TEMP = { arm: 32, leg: 30 };

/**
 * Each study: g1 (active) and g2 (reference) sites, accepted alternatives,
 * the distal stimulation site with its standard distance, proximal sites
 * with true segment lengths (cm along the nerve), the simulated healthy
 * values and the reference limits.
 */
export const STUDIES = {
  medianMotor: {
    distalLabel: "Wrist",
    label: "Median motor (APB)", short: "Median motor", type: "motor", limb: "arm", nerve: "median",
    g1: ["apb"], g2: ["d1"], offPoint: ["thenarProx", "palmCenter"],
    distalStim: "medWrist", stdDist: 8,
    proximal: [{ site: "medElbow", segCm: 22, label: "Elbow" }],
    healthy: { amp: 9000, term: 1.4, cvDistal: 40, cvSeg: { medElbow: 57 }, imax: 22 },
    limits: { lat: 4.5, amp: 4100, cv: 49 },
    spread: { site: "ulnWrist", muscle: "adm", other: "ulnarMotor", nerve: "ulnar" },
  },
  ulnarMotor: {
    distalLabel: "Wrist",
    label: "Ulnar motor (ADM)", short: "Ulnar motor", type: "motor", limb: "arm", nerve: "ulnar",
    g1: ["adm"], g2: ["d5prox"], offPoint: ["palmCenter"],
    distalStim: "ulnWrist", stdDist: 8,
    proximal: [
      { site: "ulnBE", segCm: 20, label: "Below elbow" },
      { site: "ulnAE", segCm: 10, label: "Above elbow", acrossElbow: true },
    ],
    healthy: { amp: 10000, term: 1.1, cvDistal: 45, cvSeg: { ulnBE: 60, ulnAE: 58 }, imax: 20 },
    limits: { lat: 3.7, amp: 6000, cv: 52, cvAcross: 50 }, // across elbow: AANEM 2008 (<50 m/s or >10 m/s slower than forearm); matches the hub table
    spread: { site: "medWrist", muscle: "apb", other: "medianMotor", nerve: "median" },
  },
  fibularMotor: {
    distalLabel: "Ankle",
    label: "Fibular (peroneal) motor (EDB)", short: "Fibular motor", type: "motor", limb: "leg", nerve: "fibular",
    g1: ["edb"], g2: ["mtp5"], offPoint: ["dorsumFoot"],
    distalStim: "fibAnkle", stdDist: 8,
    proximal: [
      { site: "fibBFH", segCm: 30, label: "Below fibular head" },
      { site: "fibPop", segCm: 10, label: "Popliteal fossa", acrossKnee: true },
    ],
    healthy: { amp: 5000, term: 2.0, cvDistal: 35, cvSeg: { fibBFH: 47, fibPop: 50 }, imax: 35 },
    limits: { lat: 6.5, amp: 1300, cv: 38, cvAcross: 42 },
  },
  tibialMotor: {
    distalLabel: "Ankle",
    label: "Tibial motor (AHB)", short: "Tibial motor", type: "motor", limb: "leg", nerve: "tibial",
    g1: ["ahb"], g2: ["mtp1"], offPoint: ["archCenter"],
    distalStim: "tibAnkle", stdDist: 8,
    proximal: [{ site: "tibPop", segCm: 40, label: "Popliteal fossa" }],
    healthy: { amp: 12000, term: 2.1, cvDistal: 35, cvSeg: { tibPop: 46 }, imax: 40 },
    limits: { lat: 6.1, amp: 4400, cv: 39 },
  },
  medianSensory: {
    distalLabel: "Wrist",
    label: "Median sensory, antidromic (digit 2 or 3)", short: "Median sensory", type: "sensory", limb: "arm", nerve: "median",
    g1: ["d2prox", "d3prox"], g2: ["d2dist", "d3dist"], pairs: { d2prox: "d2dist", d3prox: "d3dist" },
    distalStim: "medWrist", stdDist: 14, proximal: [],
    healthy: { amp: 35, cv: 57, imax: 16 },
    limits: { peak: 4.0, amp: 10 },
  },
  ulnarSensory: {
    distalLabel: "Wrist",
    label: "Ulnar sensory, antidromic (digit 5)", short: "Ulnar sensory", type: "sensory", limb: "arm", nerve: "ulnar",
    g1: ["d5prox"], g2: ["d5dist"], distalStim: "ulnWrist", stdDist: 14, proximal: [],
    healthy: { amp: 25, cv: 57, imax: 15 },
    limits: { peak: 4.0, amp: 6 },
  },
  radialSensory: {
    distalLabel: "Forearm",
    label: "Superficial radial sensory, antidromic", short: "Radial sensory", type: "sensory", limb: "arm", nerve: "radial",
    g1: ["snuffbox"], g2: ["thumbBase"], distalStim: "radForearm", stdDist: 10, proximal: [],
    healthy: { amp: 30, cv: 57, imax: 12 },
    limits: { peak: 2.8, amp: 7 },
  },
  sural: {
    distalLabel: "Calf",
    label: "Sural sensory, antidromic", short: "Sural", type: "sensory", limb: "leg", nerve: "sural",
    g1: ["latMall"], g2: ["latFoot"], distalStim: "suralCalf", stdDist: 14, proximal: [],
    healthy: { amp: 18, cv: 48, imax: 20 },
    limits: { peak: 4.5, amp: 4 },
  },
};

// Machine settings this app recommends (Study Hub, Machine settings).
export const RECOMMENDED = {
  motor: { gain: 5000, sweep: [2, 5], lff: [2, 10], hff: [5000, 10000], gainOk: [2000, 5000] },
  sensory: { gain: 20, sweep: [1, 2], lff: [10, 20], hff: [2000, 3000], gainOk: [10, 20] },
};

export const GAINS = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000]; // uV per division
export const SWEEPS = [1, 2, 3, 5, 10]; // ms per division
export const LFFS = [2, 5, 10, 20, 50, 100, 200]; // Hz
export const HFFS = [500, 1000, 2000, 3000, 5000, 10000]; // Hz
export const AVERAGES = [1, 2, 4, 8, 16];

export function stimSitesFor(study) {
  return [study.distalStim, ...study.proximal.map((p) => p.site)];
}

export function gainLabel(uv) {
  return uv >= 1000 ? `${uv / 1000} mV/div` : `${uv} µV/div`;
}
