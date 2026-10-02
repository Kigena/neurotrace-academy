/**
 * Quiz API client.
 *
 * The server selects questions, holds the answer key, records attempts and
 * computes scores. The browser only renders questions, sends the selected
 * option index, and displays what the server returns.
 */

import apiService from "./apiService";

export const quizApi = {
  getPresets() {
    return apiService.get("/quiz/presets");
  },

  /**
   * @param {object} body
   *   { kind: 'custom', mode, questionCount, filters: {domains, sections, tags, difficulty}, shuffle }
   *   { kind: 'preset', presetId }
   *   { kind: 'domain-quickstart', domainId }
   */
  createSession(body) {
    return apiService.post("/quiz/sessions", body);
  },

  getActiveSession() {
    return apiService.get("/quiz/sessions/active");
  },

  answer(sessionId, questionId, selectedIndex, timeMs, confidence) {
    return apiService.post(`/quiz/sessions/${encodeURIComponent(sessionId)}/answers`, {
      questionId,
      selectedIndex,
      timeMs,
      ...(confidence ? { confidence } : {}),
    });
  },

  submit(sessionId) {
    return apiService.post(`/quiz/sessions/${encodeURIComponent(sessionId)}/submit`, {});
  },

  abandon(sessionId) {
    return apiService.post(`/quiz/sessions/${encodeURIComponent(sessionId)}/abandon`, {});
  },

  getReview(sessionId) {
    return apiService.get(`/quiz/sessions/${encodeURIComponent(sessionId)}/review`);
  },
};

/**
 * Seconds remaining on a timed session, using the server clock.
 * `clockOffsetMs` = serverNow - Date.now() measured when the session was loaded.
 */
export function secondsRemaining(session, clockOffsetMs = 0) {
  if (!session?.expiresAt) return null;
  const ms = new Date(session.expiresAt).getTime() - (Date.now() + clockOffsetMs);
  return Math.max(0, Math.floor(ms / 1000));
}

export default quizApi;
