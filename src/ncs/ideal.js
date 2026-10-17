import { project } from "./geometry.js";
import { sensoryBranches } from "./fieldSim.js";

/**
 * The textbook set-up for a study and site, built from the workspace's own
 * place names: G1, G2 and ground at their targets, the cathode on the site's
 * stimulation spot with the anode proximal along the nerve, prepared skin,
 * and the elbow flexed. Used to calibrate case pathology and in tests.
 */
const IDEAL = {
  sural: { g1: "behindLatMall", g2: "latFoot35", ground: "lowerCalfMid", sites: { distal: ["main", "calfMidline14"] } },
  medianSensory: { g1: "indexProx", g2: "indexDist", ground: "palmGround", sites: { distal: ["main", "wrist14"], palm: ["main", "palm7"] } },
  ulnarSensory: { g1: "littleProx", g2: "littleDist", ground: "palmGround", sites: { distal: ["main", "wrist14"] } },
  radialSensory: { g1: "snuffbox", g2: "thumbDorsum", ground: "handGround", sites: { distal: ["main", "forearm10"] } },
  medianMotor: { g1: "apbMotorPoint", g2: "thumbMcp", ground: "palmGround", sites: { distal: ["main", "wristMedian8"], elbow: ["main", "elbowMedian"] } },
  ulnarMotor: { g1: "hypothenar", g2: "littleFinger", ground: "palmGround", sites: { distal: ["main", "wristUlnar"], be: ["elbow", "be"], ae: ["elbow", "ae"] } },
  fibularMotor: { g1: "edbMotorPoint", g2: "mtp5", ground: "groundAnkle", sites: { distal: ["main", "ankle8"], bfh: ["main", "bfh"], pop: ["main", "pop"] } },
  tibialMotor: { g1: "ahMotorPoint", g2: "mtp1", ground: "groundDorsum", sites: { distal: ["main", "ankle8"], knee: ["knee", "popMid"] } },
};

const STIM_HALF = 15;

export function idealSetup(config, siteId, { elbowFlexed = true } = {}) {
  const spec = IDEAL[config.id];
  const M = config.model;
  const P = M.PLACES;
  const pt = (k) => ({ x: P[k].x, y: P[k].y });
  const setup = { g1: pt(spec.g1), g2: pt(spec.g2), ground: pt(spec.ground), contact: { g1: "good", g2: "good", ground: "good", stim: "good" }, elbowFlexed };
  const [panelId, placeName] = spec.sites[siteId];
  const panel = panelId === "main" ? null : config.panels.find((p) => p.id === panelId);
  const pm = panel ? panel.model(setup) : M;
  const c = pm.PLACES[placeName];
  let route;
  if (config.kind === "sensory") {
    const branches = sensoryBranches(M);
    route = branches.reduce((a, b) => (project(setup.g1, b.pts).d < project(setup.g1, a.pts).d ? b : a)).pts;
  } else {
    const target = M.SOURCES.find((s) => s.id === config.protocol.target) || M.SOURCES[0];
    route = panel ? pm.NERVES[target.nerve].route : M.NERVES[target.nerve].routes[target.route];
  }
  const pr = project(c, route);
  const a = Math.atan2(pr.ty, pr.tx); // cathode distal, toward the recording electrodes
  setup.stim = { x: c.x - Math.cos(a) * STIM_HALF, y: c.y - Math.sin(a) * STIM_HALF, angle: a, panel: panelId };
  return setup;
}

/** Simulate a site with the ideal set-up at a supramaximal current. */
export function idealRecord(config, siteId, patient = {}, opts = {}) {
  const setup = idealSetup(config, siteId, opts);
  const machine = { ...config.protocol.settings };
  const probe = config.simulate({ model: config.model, setup, machine, patient: { ...(config.patient || {}), tempC: 34, refTempC: config.protocol.targetTempC, ...patient }, intensity: 1, seed: 1 });
  const imax = probe.truth.imax ?? 30;
  const intensity = Math.min(100, Math.round(1.3 * imax));
  return config.simulate({ model: config.model, setup, machine, patient: { ...(config.patient || {}), tempC: 34, refTempC: config.protocol.targetTempC, ...patient }, intensity, seed: 2 });
}
