import * as SURAL from "./anatomy/suralView.js";
import * as MEDIAN from "./anatomy/medianArmView.js";
import { describeSetup, explainSetup, simulateField } from "./fieldSim.js";
import { describeMotor, explainMotor, simulateMotor } from "./motorField.js";
import { pointAt, project } from "./geometry.js";
import { MOTOR_GAINS, PROTOCOLS, SENSORY_GAINS } from "./protocols.js";

/**
 * Study configurations for the interactive NCS workspace. Each bundles the
 * anatomy model, protocol (placement rules, distances, settings, limits),
 * physics, feedback and the guided-mode target zones.
 */

const suralS1 = project(SURAL.PLACES.behindLatMall, SURAL.NERVE).s;

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
    simulate: (args) => simulateMotor(args),
    describe: (model, setup) => describeMotor(model, setup),
    explain: (args) => explainMotor(args),
    targets: () => [
      { ...MEDIAN.PLACES.apbMotorPoint, r: 6, label: "G1" },
      { ...MEDIAN.PLACES.thumbMcp, r: 6, label: "G2" },
      { ...MEDIAN.PLACES.wristMedian8, r: 7, label: "Wrist cathode" },
      { ...MEDIAN.PLACES.elbowMedian, r: 8, label: "Elbow cathode" },
      { ...MEDIAN.PLACES.palmGround, r: 12, label: "Ground zone" },
    ],
  },
};
