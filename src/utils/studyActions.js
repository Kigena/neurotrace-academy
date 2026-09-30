/**
 * Turn a "Today's Study" item (or a dashboard button) into a server quiz
 * session, then open the quiz page (which resumes the active session).
 */
import quizApi from "../services/quizApi";

export async function startPlanItem(item, navigate) {
  if (item.kind === "review") {
    navigate("/review");
    return;
  }
  const count = item.count || 10;
  let body;
  if (item.kind === "section") {
    body = { kind: "custom", mode: "practice", questionCount: count, filters: { sections: [item.sectionId] } };
  } else if (item.kind === "domain") {
    body = { kind: "custom", mode: "practice", questionCount: count, filters: { domains: [item.domainId] } };
  } else if (item.kind === "weak") {
    body = { kind: "weak-areas", questionCount: count };
  } else {
    body = { kind: "custom", mode: "practice", questionCount: count };
  }
  await quizApi.createSession(body);
  navigate("/quiz/session");
}
