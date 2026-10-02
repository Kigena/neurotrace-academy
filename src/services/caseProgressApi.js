/**
 * Clinical case completion (per user): which cases are done, with scores.
 */
import apiService from "./apiService";

export const caseProgressApi = {
  list() {
    return apiService.get("/case-progress");
  },
  complete(caseId, { correct, total, title }) {
    return apiService.post(`/case-progress/${encodeURIComponent(caseId)}`, { correct, total, title });
  },
};

/** Map caseId -> progress record, or {} if loading fails. */
export async function loadCaseProgressMap() {
  try {
    const res = await caseProgressApi.list();
    return Object.fromEntries((res.items || []).map((p) => [p.caseId, p]));
  } catch {
    return {};
  }
}

export default caseProgressApi;
