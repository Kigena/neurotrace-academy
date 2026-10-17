import * as SURAL from "./anatomy/suralView.js";
import * as MEDIAN from "./anatomy/medianArmView.js";
import * as LEG from "./anatomy/legLateralView.js";
import * as LEGM from "./anatomy/legMedialView.js";
import * as KNEE from "./anatomy/kneePosteriorView.js";
import * as MEDS from "./anatomy/medianSensoryView.js";
import * as ULNS from "./anatomy/ulnarSensoryView.js";
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
const TIBIAL_CTX = {
  panelOf: (setup) => (setup.stim?.panel === "knee" ? KNEE : null),
  anchors: LEGM.KNEE_ANCHORS,
};
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
  medianSensory: {
    id: "medianSensory",
    label: "Median sensory",
    kind: "sensory",
    model: MEDS,
    protocol: PROTOCOLS["median-sens-anti"],
    limb: "hand",
    gains: SENSORY_GAINS,
    patient: { cv: 57, amp: 35, imaxBase: 14 },
    sites: [
      { id: "distal", label: "Wrist (14 cm)", distLabel: "Distance, cathode to G1 (cm)" },
      { id: "palm", label: "Palm (7 cm)", distLabel: "Distance, palm cathode to G1 (cm)" },
    ],
    simulate: (args) => simulateField({ ...args, patient: { cv: 57, amp: 35, imaxBase: 14, ...args.patient } }),
    describe: (model, setup) => describeSetup(model, setup, { imaxBase: 14 }),
    explain: (args) => explainSetup(args),
    targets: () => [
      { ...MEDS.PLACES.indexProx, r: 6, label: "G1" },
      { ...MEDS.PLACES.indexDist, r: 6, label: "G2" },
      { ...MEDS.PLACES.palmGround, r: 10, label: "Ground zone" },
      { ...MEDS.PLACES.wrist14, r: 7, label: "Wrist cathode" },
      { ...MEDS.PLACES.palm7, r: 9, label: "Palm cathode" },
    ],
  },
  ulnarSensory: {
    id: "ulnarSensory",
    label: "Ulnar sensory",
    kind: "sensory",
    model: ULNS,
    protocol: PROTOCOLS["ulnar-sens-anti"],
    limb: "hand",
    gains: SENSORY_GAINS,
    patient: { cv: 57, amp: 28, imaxBase: 13 },
    sites: [{ id: "distal", label: "Wrist (14 cm)", distLabel: "Distance, cathode to G1 (cm)" }],
    simulate: (args) => simulateField({ ...args, patient: { cv: 57, amp: 28, imaxBase: 13, ...args.patient } }),
    describe: (model, setup) => describeSetup(model, setup, { imaxBase: 13 }),
    explain: (args) => explainSetup(args),
    targets: () => [
      { ...ULNS.PLACES.littleProx, r: 6, label: "G1" },
      { ...ULNS.PLACES.littleDist, r: 6, label: "G2" },
      { ...ULNS.PLACES.palmGround, r: 10, label: "Ground zone" },
      { ...ULNS.PLACES.wrist14, r: 7, label: "Wrist cathode" },
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
  fibularMotor: {
    id: "fibularMotor",
    label: "Fibular motor (EDB)",
    kind: "motor",
    model: LEG,
    protocol: PROTOCOLS["fibular-motor-edb"],
    limb: "foot",
    gains: MOTOR_GAINS,
    sites: [
      { id: "distal", label: "Ankle", distLabel: "Distance, G1 to cathode (cm)" },
      { id: "bfh", label: "Below fibular head", distLabel: "Segment, below fibular head to ankle cathode (cm)" },
      { id: "pop", label: "Popliteal fossa", across: true, distLabel: "Segment across the fibular head, popliteal to below-head (cm)" },
    ],
    simulate: (args) => simulateMotor({ ...args, targetId: "edb" }),
    describe: (model, setup) => describeMotor(model, setup, { targetId: "edb" }),
    explain: (args) => explainMotor(args),
    targets: () => [
      { ...LEG.PLACES.edbMotorPoint, r: 6, label: "G1" },
      { ...LEG.PLACES.mtp5, r: 6, label: "G2" },
      { ...LEG.PLACES.groundAnkle, r: 12, label: "Ground zone" },
      { ...LEG.PLACES.ankle8, r: 7, label: "Ankle cathode" },
      { ...LEG.PLACES.bfh, r: 7, label: "Below-fibular-head cathode" },
      { ...LEG.PLACES.pop, r: 8, label: "Popliteal cathode" },
    ],
  },
  tibialMotor: {
    id: "tibialMotor",
    label: "Tibial motor (AH)",
    kind: "motor",
    model: LEGM,
    protocol: PROTOCOLS["tibial-motor-ah"],
    limb: "foot",
    gains: MOTOR_GAINS,
    panels: [
      { id: "main", label: "Leg and foot (medial)" },
      { id: "knee", label: "Back of the knee", model: () => KNEE, nerve: "tibial" },
    ],
    sites: [
      { id: "distal", label: "Ankle", panel: "main", distLabel: "Distance, G1 to cathode (cm)" },
      { id: "knee", label: "Popliteal fossa", panel: "knee", distLabel: "Segment, popliteal to ankle cathode (cm)" },
    ],
    ctx: TIBIAL_CTX,
    simulate: (args) => simulateMotor({ ...args, targetId: "ahb", ctx: TIBIAL_CTX }),
    describe: (model, setup) => describeMotor(model, setup, { targetId: "ahb", ctx: TIBIAL_CTX }),
    explain: (args) => explainMotor(args),
    targets: () => [
      { ...LEGM.PLACES.ahMotorPoint, r: 6, label: "G1", panel: "main" },
      { ...LEGM.PLACES.mtp1, r: 6, label: "G2", panel: "main" },
      { ...LEGM.PLACES.groundDorsum, r: 12, label: "Ground zone", panel: "main" },
      { ...LEGM.PLACES.ankle8, r: 7, label: "Ankle cathode", panel: "main" },
      { ...KNEE.PLACES.popMid, r: 9, label: "Popliteal cathode", panel: "knee" },
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
