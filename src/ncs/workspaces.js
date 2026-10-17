import * as SURAL from "./anatomy/suralView.js";
import * as MEDIAN from "./anatomy/medianArmView.js";
import { describeSetup, explainSetup, simulateField } from "./fieldSim.js";
import { describeMotor, explainMotor, simulateMotor } from "./motorField.js";
import { pointAt, project } from "./geometry.js";
import { EXTENDED, FLEXED } from "./anatomy/ulnarElbowView.js";
import { MOTOR_GAINS, PROTOCOLS, SENSORY_GAINS } from "./protocols.js";

/**
 * Study configurations for the interactive NCS workspace. Each bundles the
 * anatomy model, protocol (placement rules, distances, settings, limits),
 * physics, feedback and the guided-mode target zones.
 */

const suralS1 = project(SURAL.PLACES.behindLatMall, SURAL.NERVE).s;

/** The medial elbow geometry follows the elbow position chosen by the learner. */
export const elbowModel = (setup) => (setup?.elbowFlexed ? FLEXED : EXTENDED);
const ULNAR_CTX = {
  panelOf: (setup) => (setup.stim?.panel === "elbow" ? elbowModel(setup) : null),
  anchors: MEDIAN.ULNAR_ANCHORS,
};

export const WORKSPACES = {
  sural: {
    id: "sural",
    label: "Sural sensory",
    kind: "sensory",
    model: SURAL,
    protocol: PROTOCOLS["sural-anti-14"],
    limb: "foot",
    gains: SENSORY_GAINS,
    sites: [{ id: "distal", label: "Calf", distLabel: "Distance, cathode to G1 (cm)" }],
    simulate: (args) => simulateField(args),
    describe: (model, setup) => describeSetup(model, setup),
    explain: (args) => explainSetup(args),
    targets: () => [
      { ...SURAL.PLACES.behindLatMall, r: 6, label: "G1" },
      { ...pointAt(SURAL.NERVE, suralS1 + 35), r: 6, label: "G2" },
      { ...pointAt(SURAL.NERVE, suralS1 - 140), r: 8, label: "Cathode" },
      { ...pointAt(SURAL.NERVE, suralS1 - 60), r: 16, label: "Ground zone" },
    ],
  },
  medianMotor: {
    id: "medianMotor",
    label: "Median motor (APB)",
    kind: "motor",
    model: MEDIAN,
    protocol: PROTOCOLS["median-motor-apb"],
    limb: "hand",
    gains: MOTOR_GAINS,
    sites: [
      { id: "distal", label: "Wrist", distLabel: "Distance, G1 to cathode (cm)" },
      { id: "elbow", label: "Elbow", distLabel: "Segment, elbow to wrist cathode (cm)" },
    ],
    simulate: (args) => simulateMotor({ ...args, targetId: "apb" }),
    describe: (model, setup) => describeMotor(model, setup, { targetId: "apb" }),
    explain: (args) => explainMotor(args),
    targets: () => [
      { ...MEDIAN.PLACES.apbMotorPoint, r: 6, label: "G1" },
      { ...MEDIAN.PLACES.thumbMcp, r: 6, label: "G2" },
      { ...MEDIAN.PLACES.wristMedian8, r: 7, label: "Wrist cathode" },
      { ...MEDIAN.PLACES.elbowMedian, r: 8, label: "Elbow cathode" },
      { ...MEDIAN.PLACES.palmGround, r: 12, label: "Ground zone" },
    ],
  },
  ulnarMotor: {
    id: "ulnarMotor",
    label: "Ulnar motor (ADM)",
    kind: "motor",
    model: MEDIAN,
    protocol: PROTOCOLS["ulnar-motor-adm"],
    limb: "hand",
    gains: MOTOR_GAINS,
    elbowToggle: true,
    panels: [
      { id: "main", label: "Forearm and hand (anterior)" },
      { id: "elbow", label: "Medial elbow", model: (setup) => elbowModel(setup), nerve: "ulnar" },
    ],
    sites: [
      { id: "distal", label: "Wrist", panel: "main", distLabel: "Distance, G1 to cathode (cm)" },
      { id: "be", label: "Below elbow", panel: "elbow", distLabel: "Segment, below-elbow to wrist cathode (cm)" },
      { id: "ae", label: "Above elbow", panel: "elbow", across: true, distLabel: "Segment across the elbow, above- to below-elbow (cm)" },
    ],
    ctx: ULNAR_CTX,
    simulate: (args) => simulateMotor({ ...args, targetId: "adm", ctx: ULNAR_CTX }),
    describe: (model, setup) => describeMotor(model, setup, { targetId: "adm", ctx: ULNAR_CTX }),
    explain: (args) => explainMotor(args),
    targets: (setup = {}) => [
      { ...MEDIAN.PLACES.hypothenar, r: 6, label: "G1", panel: "main" },
      { ...MEDIAN.PLACES.littleFinger, r: 6, label: "G2", panel: "main" },
      { ...MEDIAN.PLACES.wristUlnar, r: 7, label: "Wrist cathode", panel: "main" },
      { ...MEDIAN.PLACES.palmGround, r: 12, label: "Ground zone", panel: "main" },
      { ...elbowModel(setup).PLACES.be, r: 7, label: "Below-elbow cathode", panel: "elbow" },
      { ...elbowModel(setup).PLACES.ae, r: 8, label: "Above-elbow cathode", panel: "elbow" },
    ],
  },
};
