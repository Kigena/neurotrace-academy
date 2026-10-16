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

export const SENSORY_GAINS = [5, 10, 20, 50, 100]; // µV/div
export const MOTOR_GAINS = [500, 1000, 2000, 5000, 10000]; // µV/div, shown as mV/div
