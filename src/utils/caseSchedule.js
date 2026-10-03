/**
 * Case of the Day: one starter case per calendar day (America/New_York, the
 * same study day as Today's Study), in a fixed rotation that alternates
 * domains so consecutive days cover different skills.
 */
export const CASE_TIME_ZONE = "America/New_York";
const DAY_MS = 86400000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** YYYY-MM-DD of `now` in the schedule time zone. */
export function dayKey(now = new Date(), timeZone = CASE_TIME_ZONE) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

const toUtc = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const fromUtc = (ms) => new Date(ms).toISOString().slice(0, 10);

/** Whole days since 1970-01-01 for a YYYY-MM-DD key. */
export const dayNumber = (key) => Math.round(toUtc(key) / DAY_MS);

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic rotation: group by primary domain, order each group by a
 * stable hash, then space each group evenly across the whole cycle (the k-th
 * of n cases sits at (k + 0.5) / n), so a large domain never runs in a block.
 */
export function rotationOrder(cases) {
  const groups = new Map();
  for (const c of cases) {
    const d = c.domainFocus?.[0] || "other";
    if (!groups.has(d)) groups.set(d, []);
    groups.get(d).push(c);
  }
  const slots = [];
  for (const key of [...groups.keys()].sort()) {
    const list = groups.get(key).sort((a, b) => hash(a.id) - hash(b.id) || a.id.localeCompare(b.id));
    list.forEach((c, k) => slots.push({ c, at: (k + 0.5) / list.length, key }));
  }
  slots.sort((a, b) => a.at - b.at || a.key.localeCompare(b.key));
  return slots.map((s) => s.c);
}

export function caseForDay(order, key) {
  if (!order.length) return null;
  const n = dayNumber(key);
  return order[((n % order.length) + order.length) % order.length];
}

/** Monday-to-Sunday lineup for the week containing `now`. */
export function weekLineup(cases, now = new Date()) {
  const order = rotationOrder(cases);
  const today = dayKey(now);
  const todayMs = toUtc(today);
  const weekday = (new Date(todayMs).getUTCDay() + 6) % 7; // Monday = 0
  const mondayMs = todayMs - weekday * DAY_MS;
  return WEEKDAYS.map((label, i) => {
    const key = fromUtc(mondayMs + i * DAY_MS);
    return {
      key,
      label,
      dayOfMonth: Number(key.slice(8)),
      case: caseForDay(order, key),
      isToday: key === today,
      isPast: key < today,
      isFuture: key > today,
    };
  });
}

/** Today's case plus the week around it. */
export function caseOfTheDay(cases, now = new Date()) {
  const week = weekLineup(cases, now);
  const today = week.find((d) => d.isToday);
  return { today: today?.case || null, todayKey: today?.key, week };
}

/** Three objectives: the case's own, or derived from its step titles. */
export function caseObjectives(c) {
  if (Array.isArray(c?.objectives) && c.objectives.length) return c.objectives.slice(0, 3);
  const titles = (c?.taskFlow || []).map((s) => s.title).filter(Boolean);
  if (titles.length) return titles.slice(0, 3);
  return ["Identify EEG patterns accurately", "Recognize technical artifacts", "Apply proper documentation"];
}
