import React, { useState } from "react";
import { Link } from "react-router-dom";
import workflowData from "../data/workflow-domains.json";
import CrossLinks from "../components/CrossLinks.jsx";
import SectionDetail from "../components/SectionDetail.jsx";

/**
 * ABRET Domain-Based Workflow Page
 * Uses official ABRET exam blueprint structure
 * Domain I: Pre-Study Procedures (15%)
 * Domain II: Performing the EEG Study (46%)
 * Domain III: Post-Study Procedures (19%)
 * Domain IV: Ethics & Professional Issues (20%)
 */

function Workflow() {
  const [openDomain, setOpenDomain] = useState("domain-1"); // Default to Domain I
  const [openSection, setOpenSection] = useState({});

  const toggleDomain = (domainId) => {
    setOpenDomain(openDomain === domainId ? null : domainId);
  };

  const toggleSection = (sectionId) => {
    setOpenSection((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const domains = workflowData.domains;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sticky TOC */}
        <div className="lg:col-span-3">
          <div className="sticky top-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                ABRET Domains
              </h2>
              <nav className="space-y-1">
                {domains.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => toggleDomain(domain.id)}
                    className={[
                      "w-full text-left px-2 py-1.5 rounded text-xs transition-colors",
                      openDomain === domain.id
                        ? "bg-blue-50 text-blue-800 font-semibold border border-blue-200"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                    ].join(" ")}
                  >
                    {domain.title} ({domain.examWeightPercent}%)
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Middle: Content */}
        <div className="lg:col-span-6">
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              ABRET Workflow & Domains
            </h1>
            <p className="text-sm text-slate-700">
              Complete ABRET R. EEG T. exam preparation organized by the four
              major domains. Each domain contains subsections with detailed
              knowledge areas.
            </p>
          </div>

          <div className="space-y-4">
            {domains.map((domain) => {
              const domainColors = {
                "domain-1": "bg-blue-500",
                "domain-2": "bg-green-500",
                "domain-3": "bg-orange-500",
                "domain-4": "bg-purple-500",
              };

              return (
                <div
                  key={domain.id}
                  className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                >
                  <button
                    onClick={() => toggleDomain(domain.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full ${domainColors[domain.id] || "bg-slate-500"}`}
                      />
                      <div className="text-left">
                        <h2 className="text-sm font-semibold text-slate-900">
                          {domain.title}
                        </h2>
                        <p className="text-xs text-slate-500">
                          Exam Weight: {domain.examWeightPercent}% • {domain.summary}
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transform transition-transform ${
                        openDomain === domain.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openDomain === domain.id && (
                    <div className="border-t border-slate-200 p-4 space-y-3">
                      {domain.sections && domain.sections.length > 0 ? (
                        domain.sections.map((section) => {
                          const isOpen = openSection[section.id];

                          return (
                            <div
                              key={section.id}
                              className="border border-slate-200 rounded-md"
                            >
                              <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50"
                              >
                                <span className="text-xs font-medium text-slate-900">
                                  {section.title}
                                </span>
                                <svg
                                  className={`w-4 h-4 text-slate-400 transform transition-transform ${
                                    isOpen ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                              {isOpen && (
                                <div className="border-t border-slate-200 p-3 bg-slate-50 space-y-3">
                                  {/* Section Detail Content */}
                                  <SectionDetail sectionId={section.id} section={section} />
                                  
                                  {section.sectionType !== "detailed" && (
                                    <>
                                      <p className="text-xs text-slate-600">
                                        Content for this section will be expanded with detailed information, 
                                        procedures, and knowledge areas.
                                      </p>
                                      {section.tags && section.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {section.tags.map((tag) => (
                                            <span
                                              key={tag}
                                              className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  )}
                                  
                                  {/* Cross-Links */}
                                  <div className="pt-2 border-t border-slate-200">
                                    <CrossLinks
                                      type="workflow"
                                      sectionId={section.id}
                                      tags={section.tags}
                                      domainId={domain.id}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          No sections defined for this domain yet.
                        </p>
                      )}
                      {domain.tags && domain.tags.length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex flex-wrap gap-1">
                            {domain.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Related Links */}
        <div className="lg:col-span-3">
          <div className="sticky top-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Related Resources
              </h3>
              <div className="space-y-2">
                <Link
                  to="/patterns"
                  className="block text-xs text-blue-600 hover:underline"
                >
                  → Pattern Library
                </Link>
                <Link
                  to="/standards"
                  className="block text-xs text-blue-600 hover:underline"
                >
                  → Standards (ACNS/ABRET/ASET)
                </Link>
                <Link
                  to="/quiz"
                  className="block text-xs text-blue-600 hover:underline"
                >
                  → Practice Quiz
                </Link>
                <Link
                  to="/progress"
                  className="block text-xs text-blue-600 hover:underline"
                >
                  → My Progress
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workflow;
