import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import casesData from "../data/cases.json";
import workflowData from "../data/workflow-domains.json";
import SearchBar from "../components/SearchBar.jsx";
import CaseCard from "../components/CaseCard.jsx";
import ContextualAI from "../components/ContextualAI.jsx";
import caseService from "../services/caseService";

function Cases() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("community"); // 'community' or 'practice'
  const [communityCases, setCommunityCases] = useState([]);
  const [loading, setLoading] = useState(false);

  // existing filter state for practice cases
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");

  // Get section from URL params and find matching tags
  const sectionParam = searchParams.get("section");
  const sectionTags = useMemo(() => {
    if (!sectionParam) return [];
    for (const domain of workflowData.domains || []) {
      const section = domain.sections?.find((s) => s.id === sectionParam);
      if (section?.tags) {
        return section.tags;
      }
    }
    return [];
  }, [sectionParam]);

  // Fetch Community Cases
  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const data = await caseService.getCases();
        setCommunityCases(data);
      } catch (error) {
        console.error("Failed to fetch community cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Filter Practice Cases (Legacy)
  const practiceCases = casesData.starterCases || [];
  const filteredPracticeCases = useMemo(() => {
    return practiceCases.filter((c) => {
      const matchesSearch =
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.chiefComplaint?.toLowerCase().includes(search.toLowerCase()) ||
        c.history?.eventDescription?.toLowerCase().includes(search.toLowerCase()) ||
        c.eegSummary?.epileptiform?.toLowerCase().includes(search.toLowerCase()) ||
        c.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesDifficulty =
        difficultyFilter === "all" || c.difficulty === difficultyFilter;

      const matchesDomain =
        domainFilter === "all" ||
        (c.domainFocus && c.domainFocus.includes(domainFilter));

      const matchesSection =
        sectionTags.length === 0 ||
        (c.tags && c.tags.some((tag) => sectionTags.includes(tag)));

      return matchesSearch && matchesDifficulty && matchesDomain && matchesSection;
    });
  }, [search, difficultyFilter, domainFilter, sectionTags, practiceCases]);

  // Filter Community Cases (Simple Client-side search for now)
  const filteredCommunityCases = useMemo(() => {
    return communityCases.filter((c) => {
      if (!search) return true;
      return (
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.history?.toLowerCase().includes(search.toLowerCase()) ||
        c.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [search, communityCases]);

  // Update domain filter if section is provided (Legacy behavior)
  useEffect(() => {
    if (sectionParam) {
      setActiveTab("practice"); // Switch to practice tab if coming from workflow
      for (const domain of workflowData.domains || []) {
        const section = domain.sections?.find((s) => s.id === sectionParam);
        if (section) {
          setDomainFilter(domain.id);
          break;
        }
      }
    }
  }, [sectionParam]);

  return (
    <>
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">EEG Community Cases</h1>
          <p className="text-sm text-slate-600 max-w-2xl mt-1">
            Explore unique clinical cases shared by the community or practice with our structured curriculum.
          </p>
          {sectionParam && sectionTags.length > 0 && (
            <p className="text-xs text-blue-700 mt-1">
              Showing cases related to this section
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/share-case"
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover shadow-sm flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Share Case
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("community")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === "community"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}
            `}
          >
            Community Feed
            <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">New</span>
          </button>
          <button
            onClick={() => setActiveTab("practice")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === "practice"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}
            `}
          >
            Practice Library
            <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{practiceCases.length}</span>
          </button>
        </nav>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={activeTab === 'community' ? "Search community cases by title, history, tags..." : "Search practice cases..."}
        />

        {activeTab === "practice" && (
          <div className="flex flex-wrap gap-3 items-center animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Difficulty
              </label>
              <select
                className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:border-primary focus:outline-none"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Domain
              </label>
              <select
                className="text-sm border border-slate-300 rounded-md px-2 py-1 focus:border-primary focus:outline-none"
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
              >
                <option value="all">All Domains</option>
                <option value="domain-1">Domain I: Pre-Study</option>
                <option value="domain-2">Domain II: Performing EEG</option>
                <option value="domain-3">Domain III: Post-Study</option>
                <option value="domain-4">Domain IV: Ethics & Professional</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="min-h-[200px]">
        {activeTab === "community" ? (
          // Community Tab
          loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCommunityCases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
              {filteredCommunityCases.map((c) => (
                <CaseCard key={c._id} eegCase={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-500">No community cases found yet.</p>
              <Link to="/share-case" className="text-primary font-medium hover:underline mt-2 inline-block">
                Be the first to share a case!
              </Link>
            </div>
          )
        ) : (
          // Practice Tab
          filteredPracticeCases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
              {filteredPracticeCases.map((c) => (
                <CaseCard key={c.id} eegCase={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-500">No practice cases match your filters.</p>
            </div>
          )
        )}
      </div>
    </section>

    {/* Contextual AI Assistant */}
    <ContextualAI
      context={{
        page: 'cases'
      }}
    />
    </>
  );
}

export default Cases;
