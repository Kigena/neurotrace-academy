/**
 * Study protocols keep the placement rules, distance, machine settings and
 * comparison values together, so a change of technique changes which
 * reference values apply. Reference limits come from this app's Study Hub
 * table; a lab's own values take precedence.
 */
export const PROTOCOLS = {
  "sural-anti-14": {
    study: "sural",
    label: "Sural sensory, antidromic, 14 cm",
    direction: "antidromic",
    distanceMm: 140,
    separationMm: [30, 40],
    settings: { gain: 20, sweep: 1, lff: 20, hff: 2000, averages: 1 },
    limits: { peak: 4.5, amp: 4 },
    targetTempC: 30,
    steps: [
      "Measure the foot temperature and warm the limb if it is below 30 °C.",
      "Find the groove between the lateral malleolus and the Achilles tendon. G1 goes there, over the sural nerve, about 1-1.5 cm behind the malleolus.",
      "G2 goes 3-4 cm further distal along the nerve, below the malleolus toward the lateral border of the foot.",
      "Ground on the same limb, between the stimulator and the recording electrodes.",
      "Measure 14 cm proximally from G1 along the course of the nerve with the tape. Put the cathode there, on the posterior calf just lateral to the midline, with the anode proximal.",
      "Raise the current in steps until the response stops growing, then add about 20%.",
      "Mark onset and negative peak; amplitude is baseline to negative peak.",
    ],
  },
};

PROTOCOLS["median-motor-apb"] = {
  study: "medianMotor",
  label: "Median motor, recording APB (belly-tendon), 8 cm",
  distanceMm: 80,
  settings: { gain: 5000, sweep: 3, lff: 10, hff: 10000, averages: 1 },
  limits: { lat: 4.5, amp: 4.1, cv: 49 },
  targetTempC: 32,
  target: "apb",
  hints: {
    muscle: "APB",
    g1Fix: "Move G1 onto the middle of the thenar eminence.",
    g2Ok: "G2 is on an electrically quiet site (thumb MCP), as the belly-tendon method requires.",
    g2Fix: "Put G2 on the thumb over the MCP joint.",
    siteHint: {
      distal: "at the wrist it lies between the FCR and palmaris longus tendons",
      elbow: "at the elbow it lies medial to the brachial pulse, which lies medial to the biceps tendon",
    },
  },
  steps: [
    "Measure the hand temperature and warm the hand if it is below 32 °C.",
    "G1 on the middle of the APB belly on the thenar eminence (the motor point), about halfway between the distal wrist crease and the thumb MCP joint.",
    "G2 on the thumb, over the MCP joint (an electrically quiet site): the belly-tendon method.",
    "Ground on the same limb between the stimulator and the recording electrodes, for example the back of the hand or the palm just beyond the wrist crease.",
    "Wrist: measure 8 cm proximally from G1 and put the cathode there, between the FCR and palmaris longus tendons, anode proximal.",
    "Raise the current until the CMAP stops growing, then add about 20%. Watch for a positive dip or a jump in size from spread to the ulnar nerve.",
    "Elbow: cathode in the cubital fossa, medial to the brachial pulse (which lies medial to the biceps tendon). Use the same supramaximal approach.",
    "Mark onset (first deflection from baseline) and negative peak at each site; tape the elbow-to-wrist cathode distance; velocity = distance / latency difference.",
  ],
};

PROTOCOLS["ulnar-motor-adm"] = {
  study: "ulnarMotor",
  label: "Ulnar motor, recording ADM (belly-tendon), 8 cm",
  distanceMm: 80,
  settings: { gain: 5000, sweep: 3, lff: 10, hff: 10000, averages: 1 },
  limits: { lat: 3.7, amp: 6.0, cv: 52, cvAcross: 50 },
  targetTempC: 32,
  target: "adm",
  hints: {
    muscle: "ADM",
    g1Fix: "Move G1 onto the middle of the hypothenar eminence.",
    g2Ok: "G2 is on the little finger over the proximal phalanx, an electrically quiet site.",
    g2Fix: "Put G2 on the little finger, over the proximal phalanx.",
    elbowFlexed: true,
    sitePanel: { distal: false, be: true, ae: true },
    siteNames: { distal: "wrist", be: "below-elbow", ae: "above-elbow" },
    siteHint: {
      distal: "at the wrist it lies just radial to the FCU tendon",
      be: "below the elbow it runs in line with the groove; stimulate about 3 cm distal to the medial epicondyle, no more",
      ae: "above the elbow it runs on the medial arm behind the biceps, about 10 cm proximal to the below-elbow site",
    },
  },
  steps: [
    "Measure the hand temperature and warm the hand if it is below 32 °C.",
    "G1 on the middle of the ADM belly on the hypothenar eminence (the motor point).",
    "G2 on the little finger over the proximal phalanx: the belly-tendon method.",
    "Ground on the same limb, for example the back of the hand or the palm beyond the wrist crease.",
    "Wrist: measure 8 cm proximally from G1 and put the cathode just radial to the FCU tendon, anode proximal. Raise the current to a supramaximal level.",
    "Flex the elbow to about 70-90° and keep it there for both elbow sites and the measurement.",
    "Below elbow: cathode about 3 cm distal to the medial epicondyle (no more than 3 cm, where the nerve dives under the FCU), over the nerve in line with the groove (medial elbow view).",
    "Above elbow: cathode about 10 cm proximal to the below-elbow site, on the medial arm just behind the intermuscular septum. Avoid drifting forward onto the median nerve and brachial pulse.",
    "Mark onset and negative peak at each site. Tape wrist to below-elbow, and below-elbow to above-elbow over the course of the nerve with the elbow still flexed.",
    "Compare segment velocities (forearm and across elbow) and the amplitude at each site.",
  ],
};

export const SENSORY_GAINS = [5, 10, 20, 50, 100]; // µV/div
export const MOTOR_GAINS = [500, 1000, 2000, 5000, 10000]; // µV/div, shown as mV/div
