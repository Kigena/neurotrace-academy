import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          NeuroTrace Academy
        </h1>
        <p className="text-sm text-slate-700 max-w-3xl">
          Your comprehensive ABRET R. EEG T. exam preparation platform. Master
          all four ABRET domains through structured learning, pattern recognition,
          and practice quizzes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/workflow"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Workflow (ABRET Domains)
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Complete ABRET exam blueprint organized by four domains: Pre-Study
            (15%), Performing EEG (46%), Post-Study (19%), and Ethics (20%).
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Domain I-IV
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Study Hub
            </span>
          </div>
        </Link>

        <Link
          to="/patterns"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">🧠</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Patterns
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Searchable library of EEG patterns: normal, variants, epileptiform,
            periodic, and artifacts. Filter by type, location, and syndrome.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              Searchable
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              Filterable
            </span>
          </div>
        </Link>

        <Link
          to="/standards"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📐</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Standards
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            ACNS, ABRET, and ASET standards for EEG performance. Technical
            requirements, documentation, and professional guidelines.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
              ACNS/ABRET/ASET
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
              Quiz Mode
            </span>
          </div>
        </Link>

        <Link
          to="/quiz"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">✏️</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Quiz Mode
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Practice ABRET-style questions with timed mock tests. Flag questions,
            review weak topics, and track your progress.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
              Timed Tests
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
              Practice
            </span>
          </div>
        </Link>

        <Link
          to="/progress"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📊</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            My Progress
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Track your quiz scores, identify weak topics, and monitor improvement
            over time. Best scores saved automatically.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
              Analytics
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
              Weak Topics
            </span>
          </div>
        </Link>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
          <div className="text-3xl mb-3">🎯</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            ABRET Exam Prep
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Everything you need to prepare for the R. EEG T. exam, organized by
            the official ABRET blueprint.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-600">
              Complete Prep
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Getting Started
        </h2>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">1. Start with Workflow:</span> Review
            the four ABRET domains to understand the complete exam structure.
          </p>
          <p>
            <span className="font-semibold">2. Study Patterns:</span> Build your
            pattern recognition skills with the searchable library.
          </p>
          <p>
            <span className="font-semibold">3. Review Standards:</span> Master
            ACNS/ABRET/ASET requirements and practice with quiz mode.
          </p>
          <p>
            <span className="font-semibold">4. Take Quizzes:</span> Test your
            knowledge with timed practice tests and track your progress.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Home;
