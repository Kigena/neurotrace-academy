/**
 * Cross-linking utilities
 * Generates related links between Standards, Workflow, Patterns, Cases, and Quiz
 */

import workflowData from "../data/workflow-domains.json";
import questionsData from "../data/abret-questions.json";
import patternsDataArray from "../data/patterns.json";
import casesData from "../data/cases.json";

// Patterns data is an array
const patternsData = Array.isArray(patternsDataArray) 
  ? patternsDataArray 
  : [];

/**
 * Get related patterns by tags
 */
export function getRelatedPatterns(tags) {
  if (!tags || tags.length === 0) return [];
  
  return patternsData.filter((pattern) => {
    // Check if pattern has any matching tags
    const patternTags = [
      ...(pattern.tags || []),
      pattern.category,
      ...pattern.topography,
    ].map((t) => t.toLowerCase());
    
    return tags.some((tag) =>
      patternTags.some((pt) => pt.includes(tag.toLowerCase()))
    );
  });
}

/**
 * Get related questions by section/tags
 */
export function getRelatedQuestions(sectionId, tags, limit = 10) {
  if (!questionsData.questions) return [];
  
  let filtered = questionsData.questions;
  
  if (sectionId) {
    filtered = filtered.filter((q) => q.sectionId === sectionId);
  }
  
  if (tags && tags.length > 0) {
    filtered = filtered.filter((q) =>
      tags.some((tag) => q.topicTags.includes(tag))
    );
  }
  
  return filtered.slice(0, limit);
}

/**
 * Get related cases by tags/domain
 */
export function getRelatedCases(tags, domainId, limit = 5) {
  const cases = casesData.starterCases || [];
  if (cases.length === 0) return [];
  
  let filtered = cases;
  
  if (domainId) {
    filtered = filtered.filter((c) => c.domainFocus?.includes(domainId));
  }
  
  if (tags && tags.length > 0) {
    filtered = filtered.filter((c) =>
      tags.some((tag) => {
        const caseTags = c.tags || [];
        return caseTags.some((ct) => 
          ct.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(ct.toLowerCase())
        );
      })
    );
  }
  
  return filtered.slice(0, limit);
}

/**
 * Get workflow section by ID
 */
export function getWorkflowSection(sectionId) {
  if (!workflowData.domains) return null;
  
  for (const domain of workflowData.domains) {
    const section = domain.sections?.find((s) => s.id === sectionId);
    if (section) {
      return { domain, section };
    }
  }
  
  return null;
}

/**
 * Get related workflow sections by tags
 */
export function getRelatedWorkflowSections(tags, limit = 5) {
  if (!workflowData.domains || !tags || tags.length === 0) return [];
  
  const results = [];
  
  for (const domain of workflowData.domains) {
    for (const section of domain.sections || []) {
      if (section.tags?.some((tag) => tags.includes(tag))) {
        results.push({ domain, section });
      }
    }
  }
  
  return results.slice(0, limit);
}

/**
 * Generate cross-links for a workflow section
 */
export function getWorkflowSectionLinks(sectionId) {
  const sectionInfo = getWorkflowSection(sectionId);
  if (!sectionInfo) return null;
  
  const { section, domain } = sectionInfo;
  const tags = section.tags || [];
  
  return {
    section,
    domain,
    relatedPatterns: getRelatedPatterns(tags),
    relatedQuestions: getRelatedQuestions(sectionId, tags, 10),
    relatedCases: getRelatedCases(tags, domain.id, 5),
    quizLink: {
      label: `Practice ${getRelatedQuestions(sectionId, tags, 10).length} questions from this section`,
      to: `/quiz?section=${sectionId}`,
    },
  };
}

/**
 * Generate cross-links for a pattern
 */
export function getPatternLinks(patternId) {
  const pattern = patternsData.find((p) => p.id === patternId);
  if (!pattern) return null;
  
  const tags = [
    pattern.category,
    ...pattern.topography,
    ...(pattern.tags || []),
  ];
  
  return {
    pattern,
    relatedWorkflowSections: getRelatedWorkflowSections(tags, 5),
    relatedQuestions: getRelatedQuestions(null, tags, 10),
    relatedCases: getRelatedCases(tags, null, 5),
    quizLink: {
      label: `Practice: ${pattern.category} & related topics`,
      to: `/quiz?tags=${tags.join(",")}`,
    },
  };
}

/**
 * Generate cross-links for a case
 */
export function getCaseLinks(caseId) {
  const eegCase = casesData.starterCases?.find((c) => c.id === caseId);
  if (!eegCase) return null;
  
  const tags = eegCase.tags || [];
  const domainIds = eegCase.domainFocus || [];
  
  return {
    case: eegCase,
    relatedPatterns: getRelatedPatterns(tags),
    relatedWorkflowSections: domainIds.flatMap((domainId) =>
      getRelatedWorkflowSections(tags, 3).filter(
        (ws) => ws.domain.id === domainId
      )
    ),
    relatedQuestions: getRelatedQuestions(
      null,
      tags,
      10
    ),
  };
}

