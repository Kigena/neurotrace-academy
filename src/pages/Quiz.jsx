import React, { useState } from "react";
import { Link } from "react-router-dom";
import abretQuestionsData from "../data/abret-questions.json";

/**
 * Quiz Page - Centralized quiz hub
 * Provides access to Standards quiz and ABRET domain-based practice questions
 */

function Quiz() {
  const questionCount = abretQuestionsData.questions?.length || 0;
  const domains = {
    "domain-1": "Domain I: Pre-Study Procedures",
    "domain-2": "Domain II: Performing the EEG Study",
    "domain-3": "Domain III: Post-Study Procedures",
    "domain-4": "Domain IV: Ethics & Professional Issues",
  };

  // Count questions by domain
  const domainCounts = {};
  if (abretQuestionsData.questions) {
    abretQuestionsData.questions.forEach((q) => {
      domainCounts[q.domainId] = (domainCounts[q.domainId] || 0) + 1;
    });
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Quiz & Practice Mode</h1>
        <p className="text-sm text-slate-700 max-w-3xl">
          Practice ABRET-style questions organized by domain and section. Use timed mock tests
          to simulate exam conditions and track your progress.
        </p>
        {questionCount > 0 && (
          <p className="text-xs text-slate-600">
            {questionCount} questions available across {Object.keys(domainCounts).length} domains
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standards Quiz */}
        <Link
          to="/standards"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Standards & Guidelines Quiz
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Practice questions on ACNS, ABRET, and ASET standards, technical
            requirements, documentation, and professional ethics.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Standards
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Ethics
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Documentation
            </span>
          </div>
        </Link>

        {/* ABRET Domain-Based Practice */}
        <Link
          to="/quiz/session"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            ABRET Domain Practice
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Practice questions organized by ABRET exam domains. Filter by domain,
            section, difficulty, or topic tags. Choose practice, timed, or mock exam mode.
          </p>
          <div className="space-y-2 text-xs">
            {Object.entries(domains).map(([id, title]) => (
              <div key={id} className="flex items-center justify-between">
                <span className="text-slate-700">{title}</span>
                <span className="text-slate-500">
                  {domainCounts[id] || 0} questions
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              {questionCount} Total
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              All Domains
            </span>
          </div>
        </Link>

        {/* Pattern Quiz (Coming Soon) */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Pattern Recognition Quiz
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Test your ability to identify EEG patterns, normal variants, and
            epileptiform discharges. (Coming soon)
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-600">
              Patterns
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-600">
              Recognition
            </span>
          </div>
        </div>

        {/* Full Mock Exam (Coming Soon) */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Full ABRET Mock Exam
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Complete timed mock exam covering all four ABRET domains with
            realistic exam conditions. (Coming soon)
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-600">
              Mock Exam
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-600">
              120 min
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">
          Quick Links
        </h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link to="/workflow" className="text-blue-600 hover:underline">
            Review Workflow Domains →
          </Link>
          <Link to="/patterns" className="text-blue-600 hover:underline">
            Study Patterns →
          </Link>
          <Link to="/progress" className="text-blue-600 hover:underline">
            View Progress →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Quiz;



