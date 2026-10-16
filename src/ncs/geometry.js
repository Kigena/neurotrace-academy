/**
 * Small 2D geometry helpers for the NCS anatomy models. Model units are
 * millimetres; positions are stored in model coordinates so they do not
 * depend on the screen size, zoom or pan.
 */

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Total length of a polyline [[x, y], ...] in model units. */
export function polylineLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}

/**
 * Project a point onto a polyline. Returns the arc length from the first
 * vertex to the nearest point (s), the perpendicular distance (d), the
 * nearest point itself and the unit tangent there.
 */
export function project(pt, pts) {
  let best = { d: Infinity, s: 0, x: pts[0][0], y: pts[0][1], tx: 0, ty: 1 };
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1e-9;
    let t = ((pt.x - x0) * dx + (pt.y - y0) * dy) / (len * len);
    t = Math.max(0, Math.min(1, t));
    const qx = x0 + t * dx, qy = y0 + t * dy;
    const d = Math.hypot(pt.x - qx, pt.y - qy);
    if (d < best.d) best = { d, s: acc + t * len, x: qx, y: qy, tx: dx / len, ty: dy / len };
    acc += len;
  }
  return best;
}

/** Point at arc length s along a polyline. */
export function pointAt(pts, s) {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (acc + len >= s) {
      const t = (s - acc) / (len || 1e-9);
      return { x: x0 + t * (x1 - x0), y: y0 + t * (y1 - y0) };
    }
    acc += len;
  }
  const [x, y] = pts[pts.length - 1];
  return { x, y };
}

/** Even-odd point-in-polygon test. */
export function inPolygon(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Smooth closed or open SVG path through points (Catmull-Rom converted to cubic Beziers). */
export function smoothPath(pts, closed = true) {
  const n = pts.length;
  if (n < 2) return "";
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return closed ? `${d} Z` : d;
}
