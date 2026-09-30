/**
 * Single source of truth for the target examination (single-user setup).
 * Edit here to change the countdown; there is intentionally no settings UI yet.
 */
export const EXAM_CONFIG = Object.freeze({
  exam: "ABRET R.EEG T.",
  date: "2026-12-14", // YYYY-MM-DD, local to the exam location
  time: "12:30", // 24h, local to the exam location
  timeZone: "America/New_York",
  location: "Asheville, North Carolina",
  displayDate: "December 14, 2026",
  displayTime: "12:30 PM",
});

/** Calendar date (YYYY-MM-DD) of `now` in the exam's time zone. */
function localDate(now, timeZone) {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/**
 * Whole calendar days from today (in the exam's time zone) to exam day.
 * 0 on exam day; negative after it.
 */
export function daysUntilExam(now = new Date(), config = EXAM_CONFIG) {
  const [ty, tm, td] = localDate(now, config.timeZone).split("-").map(Number);
  const [ey, em, ed] = config.date.split("-").map(Number);
  return Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(ty, tm - 1, td)) / 86400000);
}

export function countdownText(now = new Date(), config = EXAM_CONFIG) {
  const days = daysUntilExam(now, config);
  if (days > 1) return `${days} DAYS UNTIL R.EEG T. EXAM`;
  if (days === 1) return "1 DAY UNTIL R.EEG T. EXAM";
  if (days === 0) return "R.EEG T. EXAM IS TODAY";
  return "R.EEG T. EXAM DATE HAS PASSED";
}
