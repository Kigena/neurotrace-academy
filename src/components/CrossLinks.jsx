import React from "react";
import { Link } from "react-router-dom";
import {
  getWorkflowSectionLinks,
  getPatternLinks,
  getCaseLinks,
} from "../utils/crossLinking.js";

/**
 * CrossLinks Component
 * Displays related content links based on tags/sections
 */
function CrossLinks({ type, id, tags, domainId, sectionId }) {
  let links = null;

  if (type === "workflow" && sectionId) {
    links = getWorkflowSectionLinks(sectionId);
  } else if (type === "pattern" && id) {
    links = getPatternLinks(id);
  } else if (type === "case" && id) {
    links = getCaseLinks(id);
  }

  if (!links) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">Related Content</h3>

      {/* Related Patterns */}
      {links.relatedPatterns && links.relatedPatterns.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-700 mb-2">
            Related Patterns
          </h4>
          <div className="flex flex-wrap gap-1">
            {links.relatedPatterns.slice(0, 5).map((pattern) => (
              <Link
                key={pattern.id}
                to={`/patterns#${pattern.id}`}
                className="text-xs px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {pattern.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Workflow Sections */}
      {links.relatedWorkflowSections && links.relatedWorkflowSections.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-700 mb-2">
            Related Workflow Steps
          </h4>
          <div className="space-y-1">
            {links.relatedWorkflowSections.slice(0, 3).map((ws, idx) => (
              <Link
                key={idx}
                to={`/workflow#${ws.section.id}`}
                className="block text-xs text-blue-600 hover:underline"
              >
                {ws.domain.title}: {ws.section.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Cases */}
      {links.relatedCases && links.relatedCases.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-700 mb-2">
            Related Cases
          </h4>
          <div className="space-y-1">
            {links.relatedCases.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="block text-xs text-blue-600 hover:underline"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quiz CTA */}
      {links.quizLink && (
        <div className="pt-2 border-t border-slate-200">
          <Link
            to={links.quizLink.to}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline"
          >
            {links.quizLink.label}
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      )}

      {/* Related Questions Count */}
      {links.relatedQuestions && links.relatedQuestions.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-600">
            {links.relatedQuestions.length} practice questions available
          </p>
        </div>
      )}
    </div>
  );
}

export default CrossLinks;







