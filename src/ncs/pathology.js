/**
 * Patient pathology for the field-based NCS models, expressed per nerve the
 * way it exists in a patient, so one lesion shows up in every study that
 * crosses it.
 *
 * patient.nerves[nerveId] = {
 *   cvFactor,     // diffuse slowing (demyelination, axonal loss of fast fibres)
 *   termAdd,      // extra terminal delay in ms (distal motor slowing)
 *   motorAmp, sensoryAmp,         // axonal loss: fraction of normal amplitude
 *   motorAbsent, sensoryAbsent,   // no response
 *   imaxFactor,   // raised stimulation threshold (e.g. demyelinated nerve)
 * }
 * patient.lesions = [{ nerve, yFrom, yTo, cvFactor, block, disp, sensoryCvFactor, motorCvFactor, sensoryBlock, motorBlock }]
 *   A focal zone along the nerve between two levels (model y coordinates, which
 *   are shared by the views of one limb). cvFactor slows conduction inside the
 *   zone; block is the fraction of fibres that still conduct through it; disp
 *   widens the response (temporal dispersion). Block and dispersion apply only
 *   to impulses that travel through the zone, i.e. stimulation proximal to it.
 *   Optional sensory- and motor-specific fields override cvFactor and block for one fibre type
 *   (in carpal tunnel syndrome sensory fibres are affected earlier and more).
 */

export const nerveOf = (patient, id) => patient?.nerves?.[id] || {};
export const zonesOf = (patient, id) => (patient?.lesions || []).filter((z) => z.nerve === id);

/** Slowing factor of the zones covering level y, for "sensory" or "motor" fibres. */
export function zoneCvAt(zones, y, kind) {
  let f = 1;
  for (const z of zones) if (y >= z.yFrom && y <= z.yTo) f *= z[`${kind}CvFactor`] ?? z.cvFactor ?? 1;
  return f;
}

/** Travel time (ms) along a route between arc lengths sA and sB, with cv (mm/ms) given per level. */
export function pathTime(route, sA, sB, cvAtY) {
  const lo = Math.min(sA, sB), hi = Math.max(sA, sB);
  let acc = 0, t = 0;
  for (let i = 1; i < route.length; i++) {
    const [x0, y0] = route[i - 1];
    const [x1, y1] = route[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const a = Math.max(acc, lo), b = Math.min(acc + len, hi);
    if (b > a) t += (b - a) / cvAtY((y0 + y1) / 2);
    acc += len;
    if (acc >= hi) break;
  }
  return t;
}

/** Block and dispersion picked up by an impulse travelling between sA and sB through any zone. */
export function crossed(route, sA, sB, zones, kind) {
  const lo = Math.min(sA, sB), hi = Math.max(sA, sB);
  let conduct = 1, disp = 1;
  for (const z of zones) {
    let acc = 0, hit = false;
    for (let i = 1; i < route.length && !hit; i++) {
      const [x0, y0] = route[i - 1];
      const [x1, y1] = route[i];
      const len = Math.hypot(x1 - x0, y1 - y0);
      const a = Math.max(acc, lo), b = Math.min(acc + len, hi);
      if (b > a) {
        const ya = y0 + ((a - acc) / len) * (y1 - y0), yb = y0 + ((b - acc) / len) * (y1 - y0);
        if (Math.max(ya, yb) >= z.yFrom && Math.min(ya, yb) <= z.yTo) hit = true;
      }
      acc += len;
    }
    if (hit) {
      conduct *= z[`${kind}Block`] ?? z.block ?? 1;
      disp *= z.disp ?? 1;
    }
  }
  return { conduct, disp };
}
