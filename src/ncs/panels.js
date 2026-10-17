import { pointAt, project } from "./geometry.js";

/**
 * A secondary anatomy panel (for example the medial elbow) draws part of a
 * nerve that also exists in the main model. Matching anchor points on both
 * routes map the panel's arc length onto the main route's arc length, so a
 * stimulator in the panel produces the same latency as the same anatomical
 * spot in the main model. Between anchors the mapping is linear; outside them
 * it continues 1 mm for 1 mm.
 */

function anchorPairs(panel, main, nerveId, mainAnchors) {
  const local = panel.NERVES[nerveId].route;
  const mainRoute = Object.values(main.NERVES[nerveId].routes)[0];
  return (panel.ANCHORS?.[nerveId] || [])
    .map((a) => ({ l: project(a.local, local).s, g: project(mainAnchors[a.key], mainRoute).s }))
    .sort((a, b) => a.l - b.l);
}

export function localToGlobal(panel, main, nerveId, mainAnchors, sLocal) {
  const pairs = anchorPairs(panel, main, nerveId, mainAnchors);
  if (!pairs.length) return null;
  if (pairs.length === 1 || sLocal <= pairs[0].l) return pairs[0].g + (sLocal - pairs[0].l);
  const last = pairs[pairs.length - 1];
  if (sLocal >= last.l) return last.g + (sLocal - last.l);
  for (let i = 1; i < pairs.length; i++) {
    const a = pairs[i - 1], b = pairs[i];
    if (sLocal <= b.l) return a.g + ((sLocal - a.l) * (b.g - a.g)) / (b.l - a.l);
  }
  return last.g;
}

export function globalToLocal(panel, main, nerveId, mainAnchors, sGlobal) {
  const pairs = anchorPairs(panel, main, nerveId, mainAnchors);
  if (!pairs.length) return null;
  if (pairs.length === 1 || sGlobal <= pairs[0].g) return pairs[0].l + (sGlobal - pairs[0].g);
  const last = pairs[pairs.length - 1];
  if (sGlobal >= last.g) return last.l + (sGlobal - last.g);
  for (let i = 1; i < pairs.length; i++) {
    const a = pairs[i - 1], b = pairs[i];
    if (sGlobal <= b.g) return a.l + ((sGlobal - a.g) * (b.l - a.l)) / (b.g - a.g);
  }
  return last.l;
}

/**
 * Carry a stimulator from one geometry of a panel to another (for example
 * when the elbow is flexed or straightened): keep its position along the
 * nerve, its signed distance from the nerve and its orientation relative to
 * the nerve.
 */
export function carryStimulator(stim, fromPanel, toPanel, main, nerveId, mainAnchors) {
  const fromRoute = fromPanel.NERVES[nerveId].route;
  const toRoute = toPanel.NERVES[nerveId].route;
  const p = project(stim, fromRoute);
  const side = Math.sign((stim.x - p.x) * -p.ty + (stim.y - p.y) * p.tx) || 1;
  const rel = stim.angle - Math.atan2(p.ty, p.tx);
  const g = localToGlobal(fromPanel, main, nerveId, mainAnchors, p.s);
  const sTo = globalToLocal(toPanel, main, nerveId, mainAnchors, g);
  const q = project(pointAt(toRoute, sTo), toRoute);
  const nx = -q.ty, ny = q.tx;
  return { x: q.x + side * p.d * nx, y: q.y + side * p.d * ny, angle: rel + Math.atan2(q.ty, q.tx), panel: stim.panel };
}
