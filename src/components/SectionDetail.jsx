import React from "react";
import { Link } from "react-router-dom";

/**
 * SectionDetail Component
 * Displays detailed content for specific workflow sections
 */

/**
 * Micro-Actions Row Component
 * Thin action row with Practice Questions, View Case Example, and Study Guide PDF
 */
function MicroActions({ sectionId, section }) {
  // Build quiz link with section and tags
  const tags = section?.tags || [];
  const tagsParam = tags.slice(0, 5).join(","); // Limit to 5 tags for URL
  const quizUrl = `/quiz/session?section=${sectionId}&tags=${tagsParam}&questions=10&mode=practice`;

  // Build case link (will filter cases by section tags)
  const caseUrl = `/cases?section=${sectionId}`;

  return (
    <div className="border-t border-slate-200 pt-3 mt-3">
      <div className="flex items-center gap-3 text-xs">
        <Link
          to={quizUrl}
          className="px-3 py-1.5 rounded border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium"
        >
          Practice Questions
        </Link>
        <Link
          to={caseUrl}
          className="px-3 py-1.5 rounded border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors font-medium"
        >
          View Case Example
        </Link>
        {section?.pdfGuide && (
          <a
            href={section.pdfGuide}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded border-2 border-orange-500 bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium shadow-md"
          >
            Study Guide PDF
          </a>
        )}
      </div>
    </div>
  );
}

function SectionDetail({ sectionId, section }) {
  // Neuroanatomy for EEG Localization section
  if (sectionId === "d1-neuroanatomy-eeg-localization") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Understanding basic cortical anatomy allows EEG technologists to accurately localize abnormalities and communicate findings effectively.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests the ability to relate EEG electrode locations to underlying cortical regions and functional implications.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Identify major cortical lobes</li>
            <li>Relate EEG electrodes to brain regions</li>
            <li>Apply anatomy to EEG localization</li>
            <li>Avoid overinterpretation beyond EEG resolution</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                EEG localizes cortical surface activity, not deep brain structures
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d1-eeg-10-20-system"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: EEG 10-20 System →
            </Link>
            <Link
              to="/workflow#d3-focal-generalized-patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Focal vs Generalized →
            </Link>
            <Link
              to="/workflow#d3-epileptiform-discharges"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/quiz/session?tags=neuroanatomy,localization,cortex,lobes"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Neuroanatomy Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Neurophysiology & Seizure Mechanisms section (Domain I)
  if (sectionId === "d1-neurophysiology-seizure-mechanisms") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG reflects synchronized cortical neuronal activity. Understanding basic neurophysiology explains why seizures and abnormal rhythms appear on EEG.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests understanding of EEG signal generation, synchronization, and the physiologic basis of epileptiform activity.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Understand how EEG signals are generated</li>
            <li>Explain neuronal synchronization</li>
            <li>Describe basic seizure mechanisms</li>
            <li>Link physiology to EEG patterns</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                EEG records synchronized cortical activity, not individual neuron firing
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d1-neuroanatomy-eeg-localization"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Neuroanatomy for EEG Localization →
            </Link>
            <Link
              to="/workflow#d3-epileptiform-discharges"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/workflow#d3-focal-generalized-patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Focal vs Generalized →
            </Link>
            <Link
              to="/quiz/session?tags=eeg-generation,synchronization,seizure-mechanisms"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Neurophysiology Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normal EEG Rhythms section (Domain I)
  if (sectionId === "d1-normal-eeg-rhythms") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Normal EEG rhythms reflect organized cortical activity that varies by age, state, and region.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests recognition of normal rhythms to ensure accurate background assessment and avoidance of false-positive abnormalities.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Identify alpha, beta, theta, and delta rhythms</li>
            <li>Recognize age-appropriate norms</li>
            <li>Apply state-dependent interpretation</li>
            <li>Avoid overcalling normal activity</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Normal rhythms vary with age and state — context is essential
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Background Activity →
            </Link>
            <Link
              to="/workflow#d1-age-related-eeg-development"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Age-Related EEG Development →
            </Link>
            <Link
              to="/workflow#d3-diffuse-slowing"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Diffuse Slowing →
            </Link>
            <Link
              to="/workflow#d3-sleep-graphoelements"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Sleep & Graphoelements →
            </Link>
            <Link
              to="/quiz/session?tags=alpha,beta,theta,delta,background"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Normal Rhythm Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EEG 10-20 System section (Domain I)
  if (sectionId === "d1-eeg-10-20-system") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            The International 10–20 System standardizes EEG electrode placement, enabling consistent localization and interpretation across recordings.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests electrode naming, placement logic, and the ability to localize EEG findings based on electrode positions.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Understand the principles of the 10–20 system</li>
            <li>Identify electrode names and locations</li>
            <li>Apply left/right and anterior/posterior logic</li>
            <li>Use electrode positions for localization</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Odd-numbered electrodes are left-sided; even-numbered electrodes are right-sided
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d1-neuroanatomy-eeg-localization"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Neuroanatomy for EEG Localization →
            </Link>
            <Link
              to="/workflow#d2-electrode-types-application"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Electrode Types & Application →
            </Link>
            <Link
              to="/workflow#d2-recording-procedures-patient-preparation"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Recording Procedures & Patient Preparation →
            </Link>
            <Link
              to="/workflow#d2-montages-referencing"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Montages & Referencing →
            </Link>
            <Link
              to="/workflow#d3-epileptiform-discharges"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/quiz/session?tags=electrode-placement,10-20,localization,hemispheres"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice 10-20 System Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Basic EEG Physics & Instrumentation section (Domain I)
  if (sectionId === "d1-basic-eeg-physics-instrumentation") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG records very small voltage differences generated by cortical neurons using specialized instrumentation designed to amplify brain signals while rejecting noise.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests foundational understanding of EEG signal measurement, voltage, amplification, and noise rejection.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Understand what EEG measures</li>
            <li>Explain voltage and signal polarity</li>
            <li>Identify core EEG hardware components</li>
            <li>Apply physics concepts to EEG interpretation</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                EEG measures voltage differences, not electrical current
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d2-amplifiers-impedance-grounding"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Amplifiers, Impedance & Grounding →
            </Link>
            <Link
              to="/workflow#d2-filters-sensitivity-time-constants"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Filters, Sensitivity & Time Constants →
            </Link>
            <Link
              to="/workflow#d3-artifacts-recognition"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Artifacts →
            </Link>
            <Link
              to="/quiz/session?tags=voltage,current,instrumentation,polarity"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice EEG Physics Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Age-Related EEG Development section (Domain I)
  if (sectionId === "d1-age-related-eeg-development") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG patterns change predictably with brain maturation. Accurate interpretation requires age-appropriate expectations.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests recognition of normal EEG findings across different age groups, especially in pediatric recordings.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Describe EEG maturation from neonate to adult</li>
            <li>Identify age-appropriate background rhythms</li>
            <li>Avoid false-positive abnormalities in children</li>
            <li>Apply developmental context to EEG interpretation</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Theta and delta activity are normal in children but abnormal in awake adults
              </p>
            </div>
          </div>
        </div>

        {/* Visual Example: Trace Alternant Pattern */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Visual Example: Trace Alternant Pattern (Neonatal Quiet Sleep)
          </h3>
          <div className="space-y-3">
            <div className="rounded-md border border-slate-300 bg-slate-50 p-3 overflow-x-auto">
              <img
                src="/images/trace-alternant-psg.png"
                alt="Polysomnography recording showing trace alternant pattern in neonatal quiet sleep"
                className="w-full max-w-4xl mx-auto rounded border border-slate-200 shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-xs text-slate-500 italic text-center py-4 border border-slate-200 rounded bg-slate-50">
                Image: Trace Alternant PSG Pattern (Place image at /public/images/trace-alternant-psg.png)
              </div>
            </div>
            <div className="text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-slate-900">Key Features Shown:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Attenuation periods (purple boxes):</strong> Periods of reduced amplitude and less variability - this is the "quiet" phase of trace alternant</li>
                <li><strong>Activity periods (orange boxes):</strong> Periods of increased amplitude with prominent oscillations - this is the "active" phase</li>
                <li><strong>Discontinuous pattern:</strong> Alternating between active and quiet phases is normal in neonates up to ~44 weeks post-conceptual age</li>
                <li><strong>Multiple channels:</strong> Pattern is visible across EEG channels (Fp1-T3, T3-O1, etc.)</li>
                <li><strong>EMG channel:</strong> Shows no muscle activity (flat), consistent with quiet sleep</li>
                <li><strong>Respiratory channels:</strong> Show regular breathing pattern, confirming quiet sleep state</li>
              </ul>
              <p className="mt-2 text-slate-600 italic">
                <strong>ABRET Focus:</strong> This discontinuous pattern is NORMAL in neonates. Recognizing trace alternant prevents false-positive interpretation of "burst suppression" or encephalopathy in healthy neonates.
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d1-normal-eeg-rhythms"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Normal EEG Rhythms →
            </Link>
            <Link
              to="/workflow#d3-sleep-graphoelements"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Sleep & Graphoelements →
            </Link>
            <Link
              to="/quiz/session?tags=pediatric-eeg,development,age-related,maturation"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Developmental EEG Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Focal vs Generalized EEG Patterns section
  if (sectionId === "d3-focal-generalized-patterns") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG abnormalities may be focal or generalized. Correct classification is essential for localization, diagnosis, and clinical correlation.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests pattern distribution, lateralization, and implications for focal versus generalized epilepsy.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Differentiate focal and generalized EEG abnormalities</li>
            <li>Interpret distribution and symmetry</li>
            <li>Apply localization logic correctly</li>
            <li>Avoid overgeneralization errors</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Asymmetric generalized patterns may still indicate focal pathology
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d1-neuroanatomy-eeg-localization"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Neuroanatomy for EEG Localization →
            </Link>
            <Link
              to="/workflow#d3-epileptiform-discharges"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Diffuse Slowing →
            </Link>
            <Link
              to="/quiz/session?tags=focal,generalized,asymmetry,localization"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Classification Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Diffuse Slowing section
  if (sectionId === "d3-diffuse-slowing") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Diffuse slowing reflects generalized cerebral dysfunction. Accurate recognition requires proper technical settings and clinical correlation.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests recognition of diffuse slowing and differentiation from technical attenuation or artifact.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Identify diffuse slowing patterns</li>
            <li>Differentiate diffuse vs focal slowing</li>
            <li>Exclude technical causes before interpretation</li>
            <li>Apply appropriate clinical correlation</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Improper filter settings can falsely mask or exaggerate diffuse slowing
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d2-filters-sensitivity-time-constants"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Filters, Sensitivity & Time Constants →
            </Link>
            <Link
              to="/workflow#d2-filters-time-constants"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Filters & Time Constants →
            </Link>
            <Link
              to="/workflow#d2-timebase-sampling"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Timebase & Sampling Rate →
            </Link>
            <Link
              to="/workflow#d1-neurophysiology-seizure-mechanisms"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Foundations: Neurophysiology & Seizure Mechanisms →
            </Link>
            <Link
              to="/workflow#d3-focal-generalized-patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Focal vs Generalized →
            </Link>
            <Link
              to="/quiz/session?tags=diffuse-slowing,encephalopathy,background,pdr"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Diffuse Slowing Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sleep & Graphoelements section
  if (sectionId === "d3-sleep-graphoelements") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Sleep produces characteristic EEG patterns known as graphoelements. Correct recognition is essential to avoid overcalling pathology and to identify sleep-activated abnormalities.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests sleep-stage identification, graphoelement recognition, and differentiation from epileptiform discharges.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Identify normal sleep stages</li>
            <li>Recognize sleep graphoelements</li>
            <li>Differentiate sleep features from pathology</li>
            <li>Understand sleep as an activation method</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Sleep spindles and vertex waves can mimic epileptiform activity
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d3-epileptiform-discharges"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/workflow#d1-normal-eeg-rhythms"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Foundations: Normal EEG Rhythms →
            </Link>
            <Link
              to="/workflow#d2-s4"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Activation Procedures →
            </Link>
            <Link
              to="/workflow#d3-normal-variants"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Normal Variants →
            </Link>
            <Link
              to="/quiz/session?tags=sleep,spindle,k-complex,vertex-wave,activation"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Sleep Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Epileptiform Discharges section
  if (sectionId === "d3-epileptiform-discharges") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Epileptiform discharges are abnormal EEG waveforms associated with increased seizure risk. Accurate identification is essential for correct diagnosis and reporting.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests recognition of spikes, sharp waves, spike-and-wave complexes, and their clinical implications.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Identify spikes, sharp waves, and complexes</li>
            <li>Differentiate epileptiform discharges from artifacts and variants</li>
            <li>Interpret distribution and lateralization</li>
            <li>Apply clinical correlation appropriately</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Epileptiform discharges are defined by morphology, not amplitude alone
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d1-neurophysiology-seizure-mechanisms"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Foundations: Neurophysiology & Seizure Mechanisms →
            </Link>
            <Link
              to="/workflow#d3-normal-variants"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Normal Variants →
            </Link>
            <Link
              to="/workflow#d3-ictal-eeg-seizure-patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Ictal EEG Patterns & Seizure Evolution →
            </Link>
            <Link
              to="/workflow#d3-artifacts-recognition"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Artifacts →
            </Link>
            <Link
              to="/workflow#d2-montages-referencing"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Montages & Referencing →
            </Link>
            <Link
              to="/quiz/session?tags=spike,sharp-wave,spike-and-wave,focal,generalized"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Epileptiform Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EEG Recording Procedures & Patient Preparation section (Domain II)
  if (sectionId === "d2-recording-procedures-patient-preparation") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Proper patient preparation and recording procedures ensure high-quality EEG data, patient safety, and reliable interpretation.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests correct preparation steps, patient instructions, and recognition of procedural errors that affect EEG quality.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Perform pre-study equipment and patient checks</li>
            <li>Prepare patients appropriately for EEG</li>
            <li>Apply standardized recording workflow</li>
            <li>Prevent common procedural artifacts</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Poor patient preparation is a leading cause of EEG artifact
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d4-patient-safety-standards"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Patient Safety →
            </Link>
            <Link
              to="/workflow#d1-eeg-10-20-system"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Electrode Placement (10-20) →
            </Link>
            <Link
              to="/workflow#d3-artifacts-recognition"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Artifacts →
            </Link>
            <Link
              to="/quiz/session?tags=patient-preparation,recording-procedures,artifacts"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Recording Procedure Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filters, Sensitivity & Time Constants section (Domain II - Combined)
  if (sectionId === "d2-filters-sensitivity-time-constants") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG filters and sensitivity settings shape how brain signals are displayed. Incorrect settings can mimic pathology or obscure important findings.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests the effect of filter and sensitivity changes on EEG appearance and interpretation.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Understand low- and high-frequency filters</li>
            <li>Predict EEG changes when settings are altered</li>
            <li>Identify filter-related artifacts</li>
            <li>Apply correct settings for clinical scenarios</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Raising the low-frequency filter can mask slow waves
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d3-diffuse-slowing"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Diffuse Slowing →
            </Link>
            <Link
              to="/workflow#d3-epileptiform-discharges"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/workflow#d2-timebase-sampling"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Timebase & Sampling →
            </Link>
            <Link
              to="/workflow#d1-basic-eeg-physics-instrumentation"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Foundations: Basic EEG Physics & Instrumentation →
            </Link>
            <Link
              to="/workflow#d2-amplifiers-impedance-grounding"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Amplifiers, Impedance & Grounding →
            </Link>
            <Link
              to="/workflow#d3-artifacts-recognition"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Artifacts →
            </Link>
            <Link
              to="/quiz/session?tags=lff,hff,sensitivity,time-constant,distortion"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Filter & Sensitivity Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Amplifiers, Impedance & Grounding section (Domain II)
  if (sectionId === "d2-amplifiers-impedance-grounding") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG amplifiers magnify cerebral signals while rejecting noise. Proper impedance and grounding are essential for accurate recordings.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests amplifier principles, impedance limits, common-mode rejection, and troubleshooting noisy EEGs.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Understand EEG amplifier function</li>
            <li>Apply impedance standards correctly</li>
            <li>Explain grounding and noise rejection</li>
            <li>Troubleshoot impedance-related artifacts</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                High impedance differences increase noise and artifact
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d2-filters-sensitivity-time-constants"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Filters, Sensitivity & Time Constants →
            </Link>
            <Link
              to="/workflow#d3-artifacts-recognition"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Artifacts →
            </Link>
            <Link
              to="/workflow#d4-patient-safety-standards"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Patient Safety →
            </Link>
            <Link
              to="/quiz/session?tags=amplifier,impedance,grounding,cmrr,noise"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Amplifier & Impedance Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EEG Electrode Types & Application section (Domain II)
  if (sectionId === "d2-electrode-types-application") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG electrodes detect scalp voltage differences. Proper electrode selection and application are essential for accurate, low-noise recordings.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests electrode materials, application techniques, and appropriate use of special electrodes.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Identify common EEG electrode types</li>
            <li>Select appropriate electrodes for clinical scenarios</li>
            <li>Apply electrodes correctly to minimize impedance</li>
            <li>Recognize electrode-related artifacts</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Poor electrode application is a major cause of EEG artifact
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d1-eeg-10-20-system"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: EEG 10-20 System →
            </Link>
            <Link
              to="/workflow#d2-electrode-types-application"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Electrode Types & Application →
            </Link>
            <Link
              to="/workflow#d2-amplifiers-impedance-grounding"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Amplifiers, Impedance & Grounding →
            </Link>
            <Link
              to="/workflow#d3-artifacts-recognition"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Artifacts →
            </Link>
            <Link
              to="/quiz/session?tags=electrodes,application,impedance,electrode-types"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Electrode Application Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EEG Artifacts: Recognition & Differentiation section
  if (sectionId === "d3-artifacts-recognition") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG artifacts are non-cerebral signals that can mimic pathology. Accurate recognition prevents misdiagnosis and false reporting.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests artifact identification, source differentiation, and corrective actions.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Identify common physiologic and non-physiologic artifacts</li>
            <li>Differentiate artifact from epileptiform activity</li>
            <li>Link artifact appearance to technical or physiologic causes</li>
            <li>Apply corrective troubleshooting steps</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Artifacts often change with montage, sensitivity, or patient behavior
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d1-basic-eeg-physics-instrumentation"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Foundations: Basic EEG Physics & Instrumentation →
            </Link>
            <Link
              to="/workflow#d2-amplifiers-impedance-grounding"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Amplifiers, Impedance & Grounding →
            </Link>
            <Link
              to="/workflow#d2-electrodes-impedance"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Electrodes & Impedance →
            </Link>
            <Link
              to="/workflow#d2-amplifiers-sensitivity"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Amplifiers & Sensitivity →
            </Link>
            <Link
              to="/workflow#d3-ictal-eeg-seizure-patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Ictal EEG Patterns & Seizure Evolution →
            </Link>
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/quiz/session?tags=artifact,emg,eog,ecg,60hz"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Artifact Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Montages & Referencing section
  if (sectionId === "d2-montages-referencing") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG montages determine how electrode signals are compared. Proper montage selection is critical for localization, polarity interpretation, and artifact identification.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests montage behavior, phase reversal, and reference contamination.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Understand common EEG montages</li>
            <li>Identify phase reversal and polarity</li>
            <li>Localize abnormalities using montage comparison</li>
            <li>Recognize reference-related artifacts</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Phase reversal localizes the site of maximum voltage difference
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d1-eeg-10-20-system"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Foundations: 10-20 System →
            </Link>
            <Link
              to="/workflow#d2-s1"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Electrode Placement →
            </Link>
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Polarity & Phase →
            </Link>
            <Link
              to="/quiz/session?tags=montage,referencing,phase-reversal,polarity"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Montage Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Timebase & Sampling Rate section
  if (sectionId === "d2-timebase-sampling") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Timebase controls horizontal scaling of EEG, while sampling rate determines how accurately digital EEG captures brain activity over time.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests the ability to recognize temporal distortion, aliasing, and incorrect frequency representation due to improper timebase or sampling rate.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Explain EEG timebase (mm/sec)</li>
            <li>Predict waveform changes with timebase adjustments</li>
            <li>Understand sampling rate and aliasing</li>
            <li>Identify sampling-related artifacts</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Inadequate sampling rate can create false low-frequency activity (aliasing)
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d2-s2"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Digital EEG Settings →
            </Link>
            <Link
              to="/workflow#d3-diffuse-slowing"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Diffuse Slowing →
            </Link>
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Frequency Analysis →
            </Link>
            <Link
              to="/workflow#d2-filters-sensitivity-time-constants"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Filters, Sensitivity & Time Constants →
            </Link>
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Muscle Artifact →
            </Link>
            <Link
              to="/quiz/session?tags=timebase,sampling-rate,aliasing,nyquist"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Timebase Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normal EEG Variants section
  if (sectionId === "d3-normal-variants") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Normal EEG variants are benign patterns that may resemble epileptiform activity. Correct identification prevents false-positive EEG interpretations.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests differentiation between epileptiform discharges and normal variants, especially in pediatric and drowsy EEGs.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Identify common normal EEG variants</li>
            <li>Differentiate variants from epileptiform discharges</li>
            <li>Apply age and state context correctly</li>
            <li>Avoid overinterpretation</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Normal variants may look sharp but lack epileptiform significance
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d3-epileptiform-discharges"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/workflow#d3-sleep-graphoelements"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Sleep & Graphoelements →
            </Link>
            <Link
              to="/workflow#d2-montages-referencing"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Montages & Referencing →
            </Link>
            <Link
              to="/quiz/session?tags=normal-variant,wicket,mu,lambda,benign-sharp"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Normal Variant Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EEG Activation Procedures section
  if (sectionId === "d3-activation-procedures") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Activation procedures are techniques used during EEG to enhance diagnostic yield by provoking or modifying cerebral activity.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests physiologic responses to hyperventilation and photic stimulation and their differentiation from epileptiform activity.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Understand the purpose of each activation procedure</li>
            <li>Identify normal vs abnormal activation responses</li>
            <li>Recognize activation-specific epileptiform patterns</li>
            <li>Apply safety and interpretation principles</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Not all activation-induced changes are epileptiform
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d3-epileptiform-discharges"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/workflow#d3-diffuse-slowing"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Diffuse Slowing →
            </Link>
            <Link
              to="/workflow#d3-sleep-graphoelements"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Sleep & Graphoelements →
            </Link>
            <Link
              to="/workflow#d2-filters-sensitivity-time-constants"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Filters, Sensitivity & Time Constants →
            </Link>
            <Link
              to="/workflow#d2-amplifiers-impedance-grounding"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Amplifiers, Impedance & Grounding →
            </Link>
            <Link
              to="/workflow#d2-s4"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Recording Procedures →
            </Link>
            <Link
              to="/workflow#d4-patient-safety-standards"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Patient Safety →
            </Link>
            <Link
              to="/quiz/session?tags=hyperventilation,photic,sleep,activation,photosensitivity"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Activation Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ictal EEG Patterns & Seizure Evolution section (Domain III)
  if (sectionId === "d3-ictal-eeg-seizure-patterns") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Ictal EEG patterns represent electrical activity during a seizure. Recognizing ictal onset and evolution is critical for accurate EEG interpretation and reporting.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests understanding of ictal vs interictal activity, seizure evolution, and correct terminology for seizure-related EEG changes.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Define ictal EEG activity</li>
            <li>Recognize seizure onset and evolution</li>
            <li>Differentiate ictal EEG from artifact</li>
            <li>Apply correct descriptive terminology</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Ictal patterns show evolution in frequency, amplitude, or spatial distribution
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d3-epileptiform-discharges"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/workflow#d3-artifacts-recognition"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Artifacts →
            </Link>
            <Link
              to="/workflow#d3-activation-procedures"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Activation Procedures →
            </Link>
            <Link
              to="/workflow#d3-focal-generalized-patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Focal vs Generalized →
            </Link>
            <Link
              to="/quiz/session?tags=ictal,seizure,evolution,postictal"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Ictal EEG Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Patient Safety & Professional Standards section (Domain IV)
  if (sectionId === "d4-patient-safety-standards") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG technologists are responsible for patient safety, infection control, and adherence to professional standards during all procedures.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests electrical safety, contraindications, emergency response, and professional responsibility.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Apply electrical and patient safety principles</li>
            <li>Identify unsafe EEG practices</li>
            <li>Follow infection control standards</li>
            <li>Respond appropriately to emergencies</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Patient safety always takes precedence over EEG data collection
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d2-recording-procedures-patient-preparation"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Recording Procedures & Patient Preparation →
            </Link>
            <Link
              to="/workflow#d2-electrodes-impedance"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Electrodes & Impedance →
            </Link>
            <Link
              to="/workflow#d3-activation-procedures"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Activation Procedures →
            </Link>
            <Link
              to="/workflow#d4-quality-assurance-equipment-maintenance"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Quality Assurance →
            </Link>
            <Link
              to="/workflow#d4-ethics-confidentiality-professionalism"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Ethics & Confidentiality →
            </Link>
            <Link
              to="/quiz/session?tags=patient-safety,electrical-safety,infection-control,ethics"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Safety Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EEG Documentation & Reporting Standards section (Domain IV)
  if (sectionId === "d4-documentation-reporting") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Accurate EEG documentation ensures clinical usefulness, legal protection, and professional integrity.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests required report elements, proper terminology, and scope-of-practice boundaries.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Identify required EEG report components</li>
            <li>Use standardized, objective language</li>
            <li>Document technical and clinical events accurately</li>
            <li>Avoid diagnostic or interpretive overreach</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                EEG technologists describe findings — they do not diagnose
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d2-s4"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Recording Procedures →
            </Link>
            <Link
              to="/workflow#d3-epileptiform-discharges"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Discharges →
            </Link>
            <Link
              to="/workflow#d4-patient-safety-standards"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Patient Safety →
            </Link>
            <Link
              to="/workflow#d4-ethics-confidentiality-professionalism"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Ethics & Confidentiality →
            </Link>
            <Link
              to="/quiz/session?tags=reporting,documentation,scope-of-practice,ethics"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Documentation Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ethics, Confidentiality & Professional Conduct section (Domain IV)
  if (sectionId === "d4-ethics-confidentiality-professionalism") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Ethical practice ensures patient trust, legal compliance, and professional integrity in EEG services.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests confidentiality rules, ethical boundaries, and appropriate professional behavior.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Apply ethical principles in EEG practice</li>
            <li>Protect patient confidentiality and privacy</li>
            <li>Maintain professional boundaries</li>
            <li>Recognize and respond to ethical dilemmas</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Patient information must only be shared on a need-to-know basis
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d4-documentation-reporting"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Documentation & Reporting →
            </Link>
            <Link
              to="/workflow#d4-patient-safety-standards"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Patient Safety →
            </Link>
            <Link
              to="/workflow#d1-s1"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Consent Procedures →
            </Link>
            <Link
              to="/quiz/session?tags=ethics,confidentiality,professionalism,consent,privacy"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Ethics Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Quality Assurance & Equipment Maintenance section (Domain IV)
  if (sectionId === "d4-quality-assurance-equipment-maintenance") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Quality assurance ensures EEG recordings are accurate, safe, and reproducible through routine equipment checks, maintenance, and documentation.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET tests knowledge of QA procedures, equipment checks, and appropriate responses to technical failures.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Understand EEG quality assurance principles</li>
            <li>Perform routine equipment checks</li>
            <li>Identify equipment malfunction indicators</li>
            <li>Document QA activities correctly</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Failure to perform routine equipment checks compromises patient safety and data quality
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d2-s2"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Instrumentation Overview →
            </Link>
            <Link
              to="/workflow#d4-patient-safety-standards"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Patient Safety →
            </Link>
            <Link
              to="/workflow#d2-electrodes-impedance"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Electrodes & Impedance →
            </Link>
            <Link
              to="/quiz/session?tags=qa,equipment-maintenance,calibration,troubleshooting"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice QA Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Amplifiers & Sensitivity section
  if (sectionId === "d2-amplifiers-sensitivity") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG amplifiers increase cerebral signals to a measurable range. Sensitivity settings determine how large or small waveforms appear on the EEG display.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests whether candidates can distinguish true amplitude changes from display-related sensitivity adjustments.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Understand EEG amplifier function</li>
            <li>Explain sensitivity (µV/mm)</li>
            <li>Predict waveform appearance with sensitivity changes</li>
            <li>Avoid amplitude misinterpretation</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Changing sensitivity alters waveform size, not cerebral activity
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d2-s2"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Instrumentation Overview →
            </Link>
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Low-Voltage EEG →
            </Link>
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: High-Amplitude Activity →
            </Link>
            <Link
              to="/quiz/session?tags=amplifier,sensitivity,gain,amplitude"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Sensitivity Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Electrodes & Impedance section
  if (sectionId === "d2-electrodes-impedance") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG electrodes and impedance determine signal fidelity. Improper application leads to artifacts, noise, and misinterpretation.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests electrode selection, impedance limits, and artifact identification related to poor electrode contact.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Identify EEG electrode types and materials</li>
            <li>Explain impedance and its effect on signal quality</li>
            <li>Recognize impedance-related artifacts</li>
            <li>Apply safe and acceptable impedance limits</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Unequal impedance between electrodes increases artifact and noise
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d2-s1"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Electrode Placement →
            </Link>
            <Link
              to="/workflow#d4-patient-safety-standards"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Patient Safety →
            </Link>
            <Link
              to="/standards"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Standards: Technical Quality →
            </Link>
            <Link
              to="/workflow#d2-amplifiers-impedance-grounding"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Amplifiers, Impedance & Grounding →
            </Link>
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Artifacts →
            </Link>
            <Link
              to="/quiz/session?tags=impedance,electrodes,artifact,noise"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Impedance Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ABRET Exam Strategy & Mock Exams section (Domain IV - Capstone)
  if (sectionId === "d4-abret-exam-strategy-mocks") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            This section prepares candidates for the ABRET R.EEG T exam by simulating real exam conditions and tracking readiness across all domains.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            Knowledge alone is insufficient — success depends on time management, question interpretation, and avoiding predictable exam traps.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Apply ABRET exam strategy</li>
            <li>Manage time effectively</li>
            <li>Identify weak domains and subsections</li>
            <li>Build confidence through mock exams</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                ABRET questions often test judgment, not memorization
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Mock Exam Options
          </h3>
          
          {/* Full Mock Exam Button */}
          <Link
            to="/quiz/session?mode=mock&questions=130&timed=true&domains=I,II,III,IV"
            className="block w-full px-4 py-3 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Start Full Mock Exam (130 Questions)
          </Link>

          {/* Domain-Based Mock Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/quiz/session?mode=mock&domain=I&questions=30&timed=true"
              className="px-4 py-2.5 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors text-center"
            >
              Domain I Mock
            </Link>
            <Link
              to="/quiz/session?mode=mock&domain=II&questions=40&timed=true"
              className="px-4 py-2.5 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors text-center"
            >
              Domain II Mock
            </Link>
            <Link
              to="/quiz/session?mode=mock&domain=III&questions=35&timed=true"
              className="px-4 py-2.5 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors text-center"
            >
              Domain III Mock
            </Link>
            <Link
              to="/quiz/session?mode=mock&domain=IV&questions=25&timed=true"
              className="px-4 py-2.5 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors text-center"
            >
              Domain IV Mock
            </Link>
          </div>

          {/* Weak Area Drill Button */}
          <Link
            to="/quiz/session?mode=weak-areas&auto=true"
            className="block w-full px-4 py-2.5 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition-colors text-center"
          >
            Weak-Area Drill (Auto-Generated)
          </Link>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Review Exam Strategy PDF
            </a>
          </div>
        )}

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/progress"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Progress Dashboard →
            </Link>
            <Link
              to="/quiz"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              All Domain Quizzes →
            </Link>
            <Link
              to="/workflow#domain-1"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Domain I Review →
            </Link>
            <Link
              to="/workflow#domain-2"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Domain II Review →
            </Link>
            <Link
              to="/workflow#domain-3"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Domain III Review →
            </Link>
            <Link
              to="/workflow#domain-4"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Domain IV Review →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filters & Time Constants section
  if (sectionId === "d2-filters-time-constants") {
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            EEG filters determine which frequencies are displayed or attenuated. Improper filter settings can distort waveforms, mask pathology, or create false abnormalities.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET frequently tests filter-related waveform distortion and expects technologists to predict EEG appearance based on filter changes.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Understand the purpose of LFF and HFF</li>
            <li>Predict waveform distortion caused by filter changes</li>
            <li>Identify filter-related artifacts</li>
            <li>Differentiate technical distortion from true cerebral pathology</li>
          </ul>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Raising the low-frequency filter (LFF) can mask diffuse slowing
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        {section.pdfGuide && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <a
              href={section.pdfGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg border-2 border-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Download Detailed Study Guide (PDF)
            </a>
            <p className="text-xs text-slate-500 mt-2 italic">
              Use this guide to consolidate concepts AFTER quizzes and cases
            </p>
          </div>
        )}

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/workflow#d3-diffuse-slowing"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Diffuse Slowing →
            </Link>
            <Link
              to="/patterns"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Patterns: Epileptiform Activity →
            </Link>
            <Link
              to="/quiz/session?tags=lff,hff,time-constant"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Filter Questions →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Medical Terminology Reference section (Domain I)
  if (sectionId === "d1-medical-terminology") {
    const subsections = section?.subsections || [];
    
    return (
      <div className="space-y-4">
        {/* What this section covers */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            What this section covers
          </h3>
          <p className="text-xs text-slate-700">
            Comprehensive medical terminology reference guides covering general medical terms, neurological disorders, tumors, ophthalmology, liver, respiratory, spinal cord, spine, cranial nerves, and emergency syndromes. These guides support understanding of medical terminology used throughout ABRET exam questions.
          </p>
        </div>

        {/* Why this matters for ABRET */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Why this matters for ABRET
          </h3>
          <p className="text-xs text-blue-800">
            ABRET exam questions frequently test medical terminology, especially discrimination between similar terms. Understanding these terms is essential for accurate interpretation and communication.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Learning Outcomes
          </h3>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
            <li>Master critical term pairs and their distinctions</li>
            <li>Understand tumor classification by cell of origin</li>
            <li>Recognize neurological disorder patterns and progression</li>
            <li>Apply medical terminology accurately in clinical contexts</li>
          </ul>
        </div>

        {/* Study Guides Grid */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Available Study Guides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subsections.map((subsection) => (
              <a
                key={subsection.id}
                href={subsection.pdfGuide}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-orange-300 transition-colors group"
              >
                <span className="text-xs font-medium text-slate-900 group-hover:text-orange-700">
                  {subsection.title}
                </span>
                <svg
                  className="w-4 h-4 text-slate-400 group-hover:text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* High-Yield Exam Warning */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                High-Yield Exam Warning
              </h3>
              <p className="text-xs text-red-800 font-medium">
                Medical terminology questions frequently test discrimination between similar terms. Focus on understanding key distinctions, not just memorization.
              </p>
            </div>
          </div>
        </div>

        {/* Micro-Actions Row */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MicroActions sectionId={sectionId} section={section} />
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Related Content
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              to="/quiz/session?tags=medical-terminology,general-medical,neurological-disorders,tumors"
              className="px-3 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            >
              Practice Medical Terminology Questions →
            </Link>
            <Link
              to="/workflow#d1-age-related-eeg-development"
              className="px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Workflow: Age-Related EEG Development →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default: no detailed content
  return null;
}

export default SectionDetail;

