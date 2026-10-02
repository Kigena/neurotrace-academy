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
  } else if (item.kind === "reviews") {
    body = { kind: "review-due", questionCount: count >= 20 ? 20 : 10 };
  } else if (item.kind === "misconception") {
    body = { kind: "misconception", code: item.code, questionCount: count >= 10 ? 10 : 5 };
  } else if (item.kind === "challenge") {
    body = { kind: "challenge", questionCount: count };
    if (item.competency) body.competencies = [item.competency];
    if (item.focus) body.focus = item.focus;
  } else {
    body = { kind: "custom", mode: "practice", questionCount: count };
  }
  await quizApi.createSession(body);
  navigate("/quiz/session");
}
