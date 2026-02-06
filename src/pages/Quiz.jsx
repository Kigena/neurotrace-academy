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

        {/* Pattern Recognition Quiz */}
        <Link
          to="/quiz/pattern-recognition"
          className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 hover:shadow-lg transition-all relative overflow-hidden group"
        >
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-md">
              NEW
            </span>
          </div>
          <h2 className="text-lg font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Pattern Recognition Quiz
          </h2>
          <p className="text-sm text-purple-800 mb-4">
            Test your ability to identify EEG patterns, normal variants, and epileptiform discharges from real EEG images. Visual pattern identification with instant feedback.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-purple-200 text-purple-900 font-medium">
              Visual Recognition
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-pink-200 text-pink-900 font-medium">
              EEG Images
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-200 text-purple-900 font-medium">
              20 Questions
            </span>
          </div>
          <div className="mt-3 text-xs text-purple-700 font-medium group-hover:text-purple-900 transition-colors">
            Start Quiz →
          </div>
        </Link>

        {/* NeuroTrace Certification Exam */}
        <Link
          to="/certification-exam"
          className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 hover:shadow-lg transition-all hover:border-purple-300"
        >
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-900">
              NeuroTrace Certification Exam
            </h2>
            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
              NEW
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Comprehensive 120-minute timed assessment covering all EEG domains. 
            Test your knowledge with realistic exam conditions and get detailed performance analysis.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
              100 Questions
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
              120 Minutes
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
              All Domains
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-purple-700 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Realistic exam simulation</span>
          </div>
        </Link>
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



