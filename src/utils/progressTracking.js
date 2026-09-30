/**
 * Progress tracking (read-only on the client).
 *
 * AttemptEvents and quiz results are written exclusively by the server's quiz
 * engine. Every request below is scoped by the server to the signed-in user
 * (identity comes from the JWT, not from any client-supplied user id).
 */

import apiService from "../services/apiService";

/**
 * Load the signed-in user's attempt events (newest first).
 */
export async function loadAttemptEvents() {
  try {
    return await apiService.get("/progress");
  } catch (err) {
    console.warn("Failed to load progress from API", err);
    return [];
  }
}

/**
 * Weak topics for the signed-in user, computed on the server.
 * Rule: last `k` attempts per tag, at least `minAttempts`, accuracy < 70%.
 */
export async function calculateWeakTopics(k = 30, minAttempts = 10) {
  try {
    const res = await apiService.get("/progress/weak-topics", { k, minAttempts });
    return res.weakTopics || {};
  } catch (err) {
    console.warn("Failed to load weak topics", err);
    return {};
  }
}

function groupStats(events, keyFn) {
  const stats = {};
  events.forEach((event) => {
    const key = keyFn(event);
    if (key === undefined || key === null) return;
    if (!stats[key]) stats[key] = { correct: 0, total: 0 };
    stats[key].total++;
    if (event.isCorrect) stats[key].correct++;
  });
  return stats;
}

export async function getProgressByDomain() {
  return groupStats(await loadAttemptEvents(), (e) => e.domainId);
}

export async function getProgressBySection() {
  return groupStats(await loadAttemptEvents(), (e) => e.sectionId);
}

export async function getProgressByDifficulty() {
  return groupStats(await loadAttemptEvents(), (e) => e.difficulty);
}

/**
 * Accuracy per subsection (sectionId), weakest first.
 */
export async function getProgressBySubsection() {
  const stats = groupStats(await loadAttemptEvents(), (e) => e.sectionId);
  const result = Object.entries(stats).map(([sectionId, s]) => {
    const accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    return { sectionId, accuracy, attempts: s.total, isWeak: accuracy < 70 };
  });
  result.sort((a, b) => a.accuracy - b.accuracy);
  return result;
}

/**
 * Completed-session history for the signed-in user.
 * Uses the server-computed result where available (engine v2); legacy
 * sessions fall back to counting their stored answers.
 */
export async function loadScoreHistory() {
  try {
    const sessions = await apiService.get("/sessions");
    return sessions
      .filter((s) => s.endTime)
      .map((s) => {
        let correct;
        let total;
        let attempted;
        if (s.result) {
          ({ correct, total, attempted } = s.result);
        } else {
          const answers = Object.values(s.answers || {});
          correct = answers.filter((a) => a.isCorrect).length;
          total = s.questionIds?.length || 0;
          attempted = answers.length;
        }
        return {
          percent: total > 0 ? Math.round((correct / total) * 100) : 0,
          correct,
          total,
          attempted,
          mode: s.mode,
          date: s.endTime,
          timestamp: s.endTime,
        };
      });
  } catch (err) {
    console.warn("Failed to load score history", err);
    return [];
  }
}

export function bestScoreFromHistory(history) {
  if (!history || history.length === 0) return null;
  return history.reduce((best, h) => (!best || h.percent > best.percent ? h : best), null);
}
