import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import casesData from "../data/cases.json";
import patternsData from "../data/neurotrace_patterns_library_v2.json";
import syndromesData from "../data/syndromes_v2.json";

function Home() {
  const { user } = useAuth();
  const [caseOfTheWeek, setCaseOfTheWeek] = useState(null);

  // Get case of the week (changes weekly)
  useEffect(() => {
    if (casesData.starterCases && casesData.starterCases.length > 0) {
      // Use week number to select a consistent case for the week
      const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
      const caseIndex = weekNumber % casesData.starterCases.length;
      setCaseOfTheWeek(casesData.starterCases[caseIndex]);
    }
  }, []);

  // Platform stats
  const stats = useMemo(() => ({
    patterns: patternsData.length,
    syndromes: syndromesData.length,
    cases: casesData.starterCases?.length || 0,
    quizzes: 450 // Placeholder
  }), []);

  // Featured patterns
  const featuredPatterns = useMemo(() => {
    return patternsData.slice(0, 3);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
            🎓 Welcome to NeuroTrace Academy
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Become an Expert{" "}
            <span className="text-yellow-300">EEG Technologist</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
            {user ? `Welcome back, ${user.name}! ` : ''}
            Master EEG recording techniques, pattern recognition, and technical skills. Prepare for ABRET R. EEG T. certification with comprehensive training modules.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/cases"
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Cases 🏥
            </Link>
            <Link
              to="/quiz"
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/30"
            >
              Start Quiz ✏️
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="text-3xl md:text-4xl font-bold mb-2">{stats.patterns}</div>
          <div className="text-blue-100 text-sm font-medium">EEG Patterns</div>
          <div className="mt-3 text-xs text-blue-200">Recognize & Document</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="text-3xl md:text-4xl font-bold mb-2">{stats.syndromes}</div>
          <div className="text-purple-100 text-sm font-medium">Syndromes</div>
          <div className="mt-3 text-xs text-purple-200">Know the Patterns</div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="text-3xl md:text-4xl font-bold mb-2">{stats.cases}</div>
          <div className="text-pink-100 text-sm font-medium">Training Cases</div>
          <div className="mt-3 text-xs text-pink-200">Technical Practice</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="text-3xl md:text-4xl font-bold mb-2">{stats.quizzes}+</div>
          <div className="text-amber-100 text-sm font-medium">Quiz Questions</div>
          <div className="mt-3 text-xs text-amber-200">R. EEG T. Prep</div>
        </div>
      </div>

      {/* Case of the Week */}
      {caseOfTheWeek && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border-2 border-emerald-200 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-bold shadow-md">
              ⭐ CASE OF THE WEEK
            </div>
            <div className="text-xs text-emerald-700 font-medium">Updated Weekly</div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            {caseOfTheWeek.title}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  👤
                </div>
                <div>
                  <div className="text-xs text-slate-500">Patient</div>
                  <div className="font-semibold text-slate-900">
                    {caseOfTheWeek.patient.ageYears < 1 
                      ? `${Math.round(caseOfTheWeek.patient.ageYears * 12)} months` 
                      : `${caseOfTheWeek.patient.ageYears} years`}, {caseOfTheWeek.patient.context}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  🔍
                </div>
                <div>
                  <div className="text-xs text-slate-500">Chief Complaint</div>
                  <div className="font-semibold text-slate-900">{caseOfTheWeek.chiefComplaint}</div>
                </div>
              </div>

              {caseOfTheWeek.difficulty && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Difficulty</div>
                    <div className="font-semibold capitalize text-slate-900">{caseOfTheWeek.difficulty}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <div className="text-xs font-semibold text-emerald-600 mb-2">LEARNING OBJECTIVES</div>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>Identify EEG patterns accurately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>Recognize technical artifacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>Apply proper documentation</span>
                </li>
              </ul>
            </div>
          </div>
          
          <Link
            to={`/cases/${caseOfTheWeek.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Study This Case
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      )}

      {/* Featured Patterns */}
      <div>
        <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Featured EEG Patterns</h2>
          <p className="text-sm text-slate-600 mt-1">Learn to recognize these essential patterns as an EEG tech</p>
        </div>
          <Link to="/patterns" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {featuredPatterns.map((pattern) => (
            <Link
              key={pattern.id}
              to={`/patterns/${pattern.id}`}
              className="group bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform">
                🧠
              </div>
              <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {pattern.name}
              </h3>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {pattern.description || 'Master recognition of this essential EEG pattern for technologists'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pattern.category && (
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                    {pattern.category}
                  </span>
                )}
                {pattern.frequency_band && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                    {pattern.frequency_band}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Learning Paths Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Explore Learning Paths</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/cases"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="text-xl font-bold mb-2">Clinical Cases</h3>
              <p className="text-sm text-blue-100 mb-4">
                Real-world EEG recordings with technical challenges and learning points
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                Explore Cases
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/patterns"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="text-xl font-bold mb-2">Pattern Library</h3>
              <p className="text-sm text-purple-100 mb-4">
                Learn to recognize and identify EEG patterns as a skilled technologist
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                Browse Patterns
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/syndromes"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-3">🔬</div>
              <h3 className="text-xl font-bold mb-2">Syndromes</h3>
              <p className="text-sm text-pink-100 mb-4">
                Understand epilepsy syndromes and their characteristic EEG patterns
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                Study Syndromes
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/quiz"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-3">✏️</div>
              <h3 className="text-xl font-bold mb-2">Practice Quizzes</h3>
              <p className="text-sm text-amber-100 mb-4">
                Test your technical knowledge with ABRET R. EEG T. exam-style questions
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                Start Quiz
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/workflow"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold mb-2">Technical Workflow</h3>
              <p className="text-sm text-emerald-100 mb-4">
                Master recording techniques, electrode application, and quality control
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                Learn Workflow
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/progress"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Monitor your learning journey and achievements
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                View Progress
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Community Highlight */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
            💬 Community Powered
          </div>
          <h2 className="text-3xl font-bold mb-4">Join the EEG Tech Community</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-1">Share Technical Cases</div>
                <div className="text-slate-300">Contribute challenging recordings to help fellow techs learn</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-1">Learn from Peers</div>
                <div className="text-slate-300">Discuss technical challenges and best practices</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-1">Track Your Skills</div>
                <div className="text-slate-300">Monitor your technical competency and certification prep</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-1">AI Study Assistant</div>
                <div className="text-slate-300">Get instant help with pattern recognition and technical questions</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/share-case"
              className="px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              Share a Case
            </Link>
            <Link
              to="/chat"
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/30"
            >
              Join Discussion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
