/**
 * Geometry for the 10-20 measurement lab, working directly on a triangle
 * mesh (flat position and index arrays, centimetres) so it runs in the
 * browser and in tests without three.js.
 *
 * A tape measure stretched over the scalp lies in a plane and bridges any
 * hollows, so a tape path is the outermost edge of the head's cross-section
 * in that plane between two points. Head coordinates: x lateral (+x =
 * patient's LEFT), y up, z anterior.
 */

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => mul(a, 1 / (norm(a) || 1));
export const dist = (a, b) => norm(sub(a, b));

/** Points where the plane through `p0` with normal `n` cuts the mesh edges. */
export function planeSection(pos, idx, p0, n) {
  const d = dot(n, p0);
  const s = new Float64Array(pos.length / 3);
  for (let i = 0; i < s.length; i++) s[i] = n[0] * pos[i * 3] + n[1] * pos[i * 3 + 1] + n[2] * pos[i * 3 + 2] - d;
  const out = [];
  for (let t = 0; t < idx.length; t += 3) {
    for (let e = 0; e < 3; e++) {
      const a = idx[t + e], b = idx[t + ((e + 1) % 3)];
      const sa = s[a] || 1e-9, sb = s[b] || 1e-9; // a vertex exactly on the plane counts as just above it
      if (sa * sb < 0) {
        const k = sa / (sa - sb);
        out.push([pos[a * 3] + k * (pos[b * 3] - pos[a * 3]), pos[a * 3 + 1] + k * (pos[b * 3 + 1] - pos[a * 3 + 1]), pos[a * 3 + 2] + k * (pos[b * 3 + 2] - pos[a * 3 + 2])]);
      }
    }
  }
  return out;
}

/**
 * Tape path from A to B in the plane through A, B and `via` (a third point the
 * tape must pass near: the vertex, Cz, T3, or the user's drag). Returns the
 * outer edge of the cross-section between A and B on the side of `via`, with
 * its length.
 */
export function tapePath(mesh, A, B, via) {
  let n = cross(sub(B, A), sub(via, A));
  if (norm(n) < 1e-6) n = cross(sub(B, A), [0, 1, 0]);
  n = unit(n);
  const cut = planeSection(mesh.positions, mesh.indices, A, n);
  // 2D coordinates in the plane, centred on the head centre projected into it
  const c0 = mesh.center;
  const C = sub(c0, mul(n, dot(sub(c0, A), n)));
  const e1 = unit(sub(A, C));
  const e2 = cross(n, e1);
  const to2 = (p) => { const v = sub(p, C); return [dot(v, e1), dot(v, e2)]; };
  const to3 = ([u, v]) => add(C, add(mul(e1, u), mul(e2, v)));
  // A taut tape bridges every hollow: it follows the convex hull of the cut.
  const hull = convexHull(cut.map(to2));
  const tau = 2 * Math.PI;
  const ang = ([u, v]) => ((Math.atan2(v, u) % tau) + tau) % tau; // A is at angle 0
  const aB = ang(to2(B)), aV = ang(to2(via));
  const forward = aV <= aB; // go A -> B through increasing angle when `via` lies on that side
  const span = forward ? aB : tau - aB;
  const along = (q) => { const a = ang(q); return forward ? a : (tau - a) % tau; };
  const inner = hull.map((q) => ({ q, a: along(q) })).filter((h) => h.a > 0 && h.a < span).sort((x, y) => x.a - y.a);
  const path = [A, ...inner.map((h) => to3(h.q)), B];
  return { path, length: pathLength(path), normal: n };
}

/** Convex hull of 2D points (monotone chain), counter-clockwise. */
function convexHull(points) {
  const P = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (P.length < 3) return P;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of P) { while (lower.length >= 2 && cr(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (upper.length >= 2 && cr(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

export function pathLength(path) {
  let L = 0;
  for (let i = 1; i < path.length; i++) L += dist(path[i - 1], path[i]);
  return L;
}

/** Point a given distance along a path (clamped), and the distance of the path point nearest to q. */
export function pointAlong(path, s) {
  let acc = 0;
  for (let i = 1; i < path.length; i++) {
    const L = dist(path[i - 1], path[i]);
    if (acc + L >= s) return add(path[i - 1], mul(sub(path[i], path[i - 1]), (s - acc) / (L || 1)));
    acc += L;
  }
  return path[path.length - 1];
}

export function nearestOnPath(path, q) {
  let best = { d: Infinity, s: 0, p: path[0] }, acc = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], ab = sub(b, a), L = norm(ab) || 1e-9;
    const t = Math.max(0, Math.min(1, dot(sub(q, a), ab) / (L * L)));
    const p = add(a, mul(ab, t)), d = dist(p, q);
    if (d < best.d) best = { d, s: acc + t * L, p };
    acc += L;
  }
  return best;
}

/** Project a point outward (from the head centre) onto the outer surface, using the nearest mesh vertex in that direction. */
export function toSurface(mesh, p) {
  const dir = unit(sub(p, mesh.center));
  let best = null, bestCos = -2;
  const P = mesh.positions;
  for (let i = 0; i < P.length; i += 3) {
    const v = [P[i], P[i + 1], P[i + 2]];
    const u = sub(v, mesh.center), r = norm(u);
    const cos = dot(u, dir) / (r || 1);
    if (cos > bestCos + 1e-9 || (Math.abs(cos - bestCos) < 1e-9 && r > dist(best, mesh.center))) { bestCos = cos; best = v; }
  }
  return best;
}

// ------------------------------------------------------------ 10-20 system

/** The four landmarks and where the tape must pass (cm, model coordinates). */
export function buildMesh(positions, indices, landmarks) {
  return { positions, indices, center: landmarks.center, landmarks };
}

/**
 * Ideal 10-20 positions from the landmarks, following the standard
 * measurements: nasion-inion through the vertex (Fpz 10%, Fz 30%, Cz 50%,
 * Pz 70%, Oz 90%), preauricular to preauricular through Cz (T3 10%, C3 30%,
 * C4 70%, T4 90%), each half-circumference Fpz-T3-Oz (Fp1, F7, T3, T5, O1 at
 * 10, 30, 50, 70, 90% of the half; the right side likewise), and F3/F4/P3/P4
 * midway between their neighbours.
 */
export function idealPositions(mesh) {
  const L = mesh.landmarks;
  const at = (tp, f) => pointAlong(tp.path, tp.length * f);
  const mid = tapePath(mesh, L.nasion, L.inion, L.vertex);
  const pos = {};
  for (const [name, f] of [["Fpz", 0.1], ["Fz", 0.3], ["Cz", 0.5], ["Pz", 0.7], ["Oz", 0.9]]) pos[name] = at(mid, f);
  const cor = tapePath(mesh, L.lpa, L.rpa, pos.Cz);
  for (const [name, f] of [["T3", 0.1], ["C3", 0.3], ["C4", 0.7], ["T4", 0.9]]) pos[name] = at(cor, f);
  const left = tapePath(mesh, pos.Fpz, pos.Oz, pos.T3);
  const right = tapePath(mesh, pos.Fpz, pos.Oz, pos.T4);
  for (const [l, r, f] of [["Fp1", "Fp2", 0.1], ["F7", "F8", 0.3], ["T5", "T6", 0.7], ["O1", "O2", 0.9]]) {
    pos[l] = at(left, f);
    pos[r] = at(right, f);
  }
  const midway = (a, b) => { const tp = tapePath(mesh, pos[a], pos[b], add(mul(add(pos[a], pos[b]), 0.5), [0, 30, 0])); return at(tp, 0.5); };
  for (const [name, a, b, c, d] of [["F3", "Fp1", "C3", "F7", "Fz"], ["F4", "Fp2", "C4", "F8", "Fz"], ["P3", "C3", "O1", "T5", "Pz"], ["P4", "C4", "O2", "T6", "Pz"]]) {
    pos[name] = toSurface(mesh, mul(add(midway(a, b), midway(c, d)), 0.5));
  }
  return { positions: pos, arcs: { midline: mid.length, coronal: cor.length, leftHalf: left.length, rightHalf: right.length } };
}

export const ELECTRODE_ORDER = ["Fpz", "Fz", "Cz", "Pz", "Oz", "T3", "C3", "C4", "T4", "Fp1", "F7", "T5", "O1", "Fp2", "F8", "T6", "O2", "F3", "F4", "P3", "P4"];
