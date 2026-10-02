/**
 * Study dashboard API client (mastery, readiness, review incorrect, retry).
 */
import apiService from "./apiService";

export const studyApi = {
  getDashboard() {
    return apiService.get("/study/dashboard");
  },
  getIncorrect(limit = 50) {
    return apiService.get("/study/incorrect", { limit });
  },
  getRetryQuestion(questionId) {
    return apiService.get(`/study/retry/${encodeURIComponent(questionId)}`);
  },
  submitRetry(questionId, selectedIndex, timeMs, confidence) {
    return apiService.post(`/study/retry/${encodeURIComponent(questionId)}`, {
      selectedIndex,
      timeMs,
      ...(confidence ? { confidence } : {}),
    });
  },
};

export default studyApi;
