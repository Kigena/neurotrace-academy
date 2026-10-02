/**
 * Display helpers for study analytics.
 */
import workflowData from "../data/workflow-domains.json";

const sectionTitles = {};
const domainTitles = {};
(workflowData.domains || []).forEach((d) => {
  domainTitles[d.id] = d.title;
  (d.sections || []).forEach((s) => {
    sectionTitles[s.id] = s.title;
  });
});

export const DOMAIN_ORDER = ["domain-1", "domain-2", "domain-3", "domain-4"];
export const DOMAIN_SHORT = {
  "domain-1": "D1 Pre-Study Procedures",
  "domain-2": "D2 Performing the EEG Study",
  "domain-3": "D3 Post-Study Procedures",
  "domain-4": "D4 Ethics & Professional Issues",
};

export const LEVEL_NAMES = {
  1: "Recall",
  2: "Understanding",
  3: "Application / Calculation",
  4: "Troubleshooting",
  5: "Montage / Localization",
  6: "Clinical Integration",
};

export const COMPETENCY_NAMES = {
  technical: "Technical reasoning",
  montage: "Montage / localization",
  troubleshooting: "Troubleshooting",
  clinical: "Clinical integration",
};

export function levelLabel(level) {
  return level ? `L${level} · ${LEVEL_NAMES[level] || ""}` : null;
}

export function sectionTitle(id) {
  return sectionTitles[id] || id;
}

export function domainTitle(id) {
  return domainTitles[id] || id;
}

const TAG_TITLES = {
  "calc-core": "core exam calculations",
  "calc-beyond": "beyond-exam calculations",
};

export function tagTitle(tag) {
  return TAG_TITLES[tag] || String(tag).replace(/-/g, " ");
}

/** Tailwind classes for a mastery/readiness score (null = no data). */
export function scoreTone(score, sufficient = true) {
  if (score === null || score === undefined || !sufficient) return { bar: "bg-slate-300", text: "text-slate-500", chip: "bg-slate-100 text-slate-600" };
  if (score >= 85) return { bar: "bg-emerald-500", text: "text-emerald-700", chip: "bg-emerald-100 text-emerald-800" };
  if (score >= 70) return { bar: "bg-blue-500", text: "text-blue-700", chip: "bg-blue-100 text-blue-800" };
  if (score >= 50) return { bar: "bg-amber-500", text: "text-amber-700", chip: "bg-amber-100 text-amber-800" };
  return { bar: "bg-red-500", text: "text-red-700", chip: "bg-red-100 text-red-800" };
}

/** Human description of a Today's Study item. */
export function planItemLabel(item) {
  switch (item.kind) {
    case "section":
      return `${item.count} questions: ${sectionTitle(item.sectionId)}`;
    case "domain":
      return `${item.count} questions: ${domainTitle(item.domainId)}`;
    case "review":
      return `Review ${item.count} incorrect question${item.count === 1 ? "" : "s"}`;
    case "mixed":
      return `${item.count}-question mixed ABRET quiz`;
    case "reviews":
      return `Spaced review: ${Math.min(item.count, item.due ?? item.count)} due question${(item.due ?? item.count) === 1 ? "" : "s"}`;
    case "misconception":
      return `Fix a repeated mistake: ${item.title || item.code}`;
    case "challenge":
      return item.competency
        ? `${item.count} Challenge questions: ${COMPETENCY_NAMES[item.competency] || item.competency}`
        : `${item.count} mixed Challenge questions (L3-L6)`;
    default:
      return `${item.count} questions`;
  }
}

