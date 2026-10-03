/**
 * Case steps exist in two shapes: { stepId, type, prompt, answerIndex } and
 * the newer { step, title, description, question, correctAnswer }. Map both
 * to one shape so neither crashes the runner.
 */
export function normalizeStep(step, idx, caseId) {
  const s = step || {};
  return {
    stepId: s.stepId || `${caseId || "case"}-step${s.step ?? idx + 1}`,
    type: typeof s.type === "string" ? s.type : null,
    title: typeof s.title === "string" ? s.title : null,
    description: typeof s.description === "string" ? s.description : null,
    prompt: s.prompt || s.question || "",
    options: Array.isArray(s.options) ? s.options : [],
    answerIndex: Number.isInteger(s.answerIndex) ? s.answerIndex : Number.isInteger(s.correctAnswer) ? s.correctAnswer : null,
    explanation: s.explanation || "",
    tracing: typeof s.tracing === "string" ? s.tracing : null,
  };
}

export function stepHeading(step, idx) {
  if (step.title) return step.title;
  if (step.type) return step.type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return `Step ${idx + 1}`;
}
