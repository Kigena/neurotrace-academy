import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/apiService";
import casesData from "../data/cases.json";
import patternsData from "../data/neurotrace_patterns_library_v2.json";
import syndromesData from "../data/syndromes_v2.json";

function Home() {
  const { user } = useAuth();
  const [caseOfTheWeek, setCaseOfTheWeek] = useState(null);
  const [loadingCase, setLoadingCase] = useState(true);
  const [communityCasesCount, setCommunityCasesCount] = useState(0);

  // Get featured community case of the week
  useEffect(() => {
    const fetchFeaturedCase = async () => {
      try {
        const response = await apiService.get('/cases/featured');
        setCaseOfTheWeek(response);
      } catch (error) {
        console.error('Failed to fetch featured case:', error);
        // Fallback to static cases if community case fetch fails
        if (casesData.starterCases && casesData.starterCases.length > 0) {
          const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
          const caseIndex = weekNumber % casesData.starterCases.length;
          setCaseOfTheWeek({ ...casesData.starterCases[caseIndex], isStatic: true });
        }
      } finally {
        setLoadingCase(false);
      }
    };

    fetchFeaturedCase();
  }, []);

  // Fetch community cases count
  useEffect(() => {
    const fetchCasesCount = async () => {
      try {
        const cases = await apiService.get('/cases');
        setCommunityCasesCount(cases.length);
      } catch (error) {
        console.error('Failed to fetch community cases count:', error);
      }
    };

    fetchCasesCount();
  }, []);

  // Platform stats
  const stats = useMemo(() => {
    const staticCases = casesData.starterCases?.length || 0;
    const totalCases = staticCases + communityCasesCount;
    return {
      patterns: patternsData.length,
      syndromes: syndromesData.length,
      cases: totalCases,
      quizzes: 450 // Placeholder
    };
  }, [communityCasesCount]);

  // Featured patterns
  const featuredPatterns = useMemo(() => {
    return patternsData.slice(0, 3);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 md:p-12 text-white shadow-lg">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: 'url(/eeg-hero-background.png)' }}
        ></div>

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/50 to-indigo-700/50 z-10"></div>

        {/* Decorative blur element */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl z-20"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
            🎓 Welcome to NeuroLinea
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight">
            Become an Expert{" "}
            <span className="text-indigo-200">EEG Technologist</span>
          </h1>
          <p className="text-lg text-indigo-100 font-medium mb-4">Tracing insight. Advancing practice.</p>
          <p className="text-lg text-white/90 mb-6 max-w-2xl">
            {user ? `Welcome back, ${user.name}! ` : ''}
            Master EEG recording techniques, pattern recognition, and technical skills. Prepare for ABRET R. EEG T. certification with comprehensive training modules.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/cases"
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all shadow-md"
            >
              Explore Cases →
            </Link>
            <Link
              to="/quiz"
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-400 transition-all border border-white/30"
            >
              Start Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-lg transition-all">
          <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">{stats.patterns}</div>
          <div className="text-slate-700 text-sm font-medium">EEG Patterns</div>
          <div className="mt-2 text-xs text-slate-500">Recognize & Document</div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-lg transition-all">
          <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">{stats.syndromes}</div>
          <div className="text-slate-700 text-sm font-medium">Syndromes</div>
          <div className="mt-2 text-xs text-slate-500">Know the Patterns</div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-lg transition-all">
          <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">{stats.cases}</div>
          <div className="text-slate-700 text-sm font-medium">Training Cases</div>
          <div className="mt-2 text-xs text-slate-500">Technical Practice</div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-lg transition-all">
          <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">{stats.quizzes}+</div>
          <div className="text-slate-700 text-sm font-medium">Quiz Questions</div>
          <div className="mt-2 text-xs text-slate-500">R. EEG T. Prep</div>
        </div>
      </div>

      {/* Case of the Week */}
      {!loadingCase && caseOfTheWeek && (
        <div className="bg-white rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-bold">
              ⭐ CASE OF THE WEEK
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {caseOfTheWeek.isStatic ? 'Updated Weekly' : 'From Our Community'}
            </div>
            {caseOfTheWeek.author && (
              <div className="text-xs text-slate-500">
                by <span className="font-semibold">{caseOfTheWeek.author.name}</span>
              </div>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            {caseOfTheWeek.title}
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              {/* Patient Info - handle both community and static cases */}
              {(caseOfTheWeek.patientInfo || caseOfTheWeek.patient) && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Patient</div>
                    <div className="font-semibold text-slate-900">
                      {caseOfTheWeek.isStatic ? (
                        <>
                          {caseOfTheWeek.patient.ageYears < 1
                            ? `${Math.round(caseOfTheWeek.patient.ageYears * 12)} months`
                            : `${caseOfTheWeek.patient.ageYears} years`}, {caseOfTheWeek.patient.context}
                        </>
                      ) : (
                        <>
                          {caseOfTheWeek.patientInfo?.age && (
                            <>{caseOfTheWeek.patientInfo.age} {caseOfTheWeek.patientInfo.ageUnit}</>
                          )}
                          {caseOfTheWeek.patientInfo?.gender && `, ${caseOfTheWeek.patientInfo.gender}`}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* History/Chief Complaint */}
              {(caseOfTheWeek.history || caseOfTheWeek.chiefComplaint) && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    🔍
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      {caseOfTheWeek.isStatic ? 'Chief Complaint' : 'Clinical History'}
                    </div>
                    <div className="font-semibold text-slate-900 line-clamp-2">
                      {caseOfTheWeek.isStatic ? caseOfTheWeek.chiefComplaint : caseOfTheWeek.history}
                    </div>
                  </div>
                </div>
              )}

              {/* Views or Difficulty */}
              {caseOfTheWeek.isStatic && caseOfTheWeek.difficulty && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Difficulty</div>
                    <div className="font-semibold capitalize text-slate-900">{caseOfTheWeek.difficulty}</div>
                  </div>
                </div>
              )}

              {!caseOfTheWeek.isStatic && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    👁️
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Engagement</div>
                    <div className="font-semibold text-slate-900">
                      {caseOfTheWeek.views || 0} views • {caseOfTheWeek.likes?.length || 0} likes
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-xs font-semibold text-indigo-600 mb-2">
                {caseOfTheWeek.isStatic ? 'LEARNING OBJECTIVES' : 'WHAT YOU\'LL LEARN'}
              </div>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✓</span>
                  <span>Identify EEG patterns accurately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✓</span>
                  <span>Recognize technical artifacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✓</span>
                  <span>Apply proper documentation</span>
                </li>
              </ul>
              {!caseOfTheWeek.isStatic && caseOfTheWeek.tags && caseOfTheWeek.tags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex flex-wrap gap-1.5">
                    {caseOfTheWeek.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Link
            to={`/cases/${caseOfTheWeek.isStatic ? caseOfTheWeek.id : caseOfTheWeek._id}`}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-white">Study This Case</span>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="group bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl mb-4">
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
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
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
            className="group bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl mb-4">
              🏥
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Clinical Cases</h3>
            <p className="text-sm text-slate-600 mb-4">
              Real-world EEG recordings with technical challenges and learning points
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              Explore Cases
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link
            to="/patterns"
            className="group bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl mb-4">
              🧠
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Pattern Library</h3>
            <p className="text-sm text-slate-600 mb-4">
              Learn to recognize and identify EEG patterns as a skilled technologist
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              Browse Patterns
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link
            to="/syndromes"
            className="group bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl mb-4">
              🔬
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Syndromes</h3>
            <p className="text-sm text-slate-600 mb-4">
              Understand epilepsy syndromes and their characteristic EEG patterns
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              Study Syndromes
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link
            to="/quiz"
            className="group bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl mb-4">
              ✏️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Practice Quizzes</h3>
            <p className="text-sm text-slate-600 mb-4">
              Test your technical knowledge with ABRET R. EEG T. exam-style questions
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              Start Quiz
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link
            to="/workflow"
            className="group bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl mb-4">
              📋
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Technical Workflow</h3>
            <p className="text-sm text-slate-600 mb-4">
              Master recording techniques, electrode application, and quality control
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              Learn Workflow
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>

          <Link
            to="/progress"
            className="group bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">Track Progress</h3>
            <p className="text-sm text-slate-600 mb-4">
              Monitor your learning journey and achievements
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              View Progress
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Community Highlight */}
      <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white">
        <div className="max-w-3xl">
          <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-4">
            💬 Community Powered
          </div>
          <h2 className="text-3xl font-bold mb-4">Join the EEG Tech Community</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-1">Share Technical Cases</div>
                <div className="text-slate-300">Contribute challenging recordings to help fellow techs learn</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-1">Learn from Peers</div>
                <div className="text-slate-300">Discuss technical challenges and best practices</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-1">Track Your Skills</div>
                <div className="text-slate-300">Monitor your technical competency and certification prep</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div>
                <div className="font-semibold mb-1">AI Study Assistant</div>
                <div className="text-slate-300">Get instant help with pattern recognition and technical questions</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/share-case"
              className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Share a Case
            </Link>
            <Link
              to="/cases"
              className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
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
