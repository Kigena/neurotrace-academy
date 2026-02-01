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
          The collaborative EEG learning community. Share unique cases, access clinical resources,
          and earn CME credits through interactive modules and peer discussions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/cases"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
          </div>
          <div className="text-3xl mb-3">🏥</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Community Cases
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Explore and share detailed clinical cases. Review patient history, MRI/CT correlation,
            and EEG findings contributed by the community.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              New Feature
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Contribution
            </span>
          </div>
        </Link>

        <Link
          to="/patterns"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">🧠</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Pattern Library
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Searchable reference of EEG patterns: normal variants, epileptiform discharges,
            and artifacts. Visual learning for clinical competence.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              Visual Reference
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              Atlas
            </span>
          </div>
        </Link>

        <Link
          to="/standards"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📐</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Guidelines & Standards
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            ACNS technical requirements, electrode placement guides, and professional
            practice standards.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
              ACNS Guidelines
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
              Reference
            </span>
          </div>
        </Link>

        <Link
          to="/workflow"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Clinical Workflow
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Best practices for Pre-study setup, Recording, and Post-study processing.
            Ethics and professional conduct modules.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-800">
              Procedures
            </span>
          </div>
        </Link>

        <Link
          to="/quiz"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">✏️</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            CME Knowledge Checks
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Test your understanding with topic-based quizzes. Earn recognition for
            mastering different neurodiagnostic domains.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
              Self-Assessment
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
              CME
            </span>
          </div>
        </Link>

        <Link
          to="/progress"
          className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📊</div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Learning Portfolio
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Track your continuous professional development. Monitor completed modules
            and case contributions.
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
              Portfolio
            </span>
          </div>
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Join the Conversation
        </h2>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">1. Explore Cases:</span> Review unique clinical scenarios in the Community Cases library.
          </p>
          <p>
            <span className="font-semibold">2. Share Knowledge:</span> Contribute your own anonymized case studies to help peers learn.
          </p>
          <p>
            <span className="font-semibold">3. Verify Skills:</span> Complete CME modules to validate your expertise.
          </p>
          <p>
            <span className="font-semibold">4. Stay Updated:</span> Access the latest ACNS guidelines and technical standards.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Home;
