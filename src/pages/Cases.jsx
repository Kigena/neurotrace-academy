import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import casesData from "../data/cases.json";
import workflowData from "../data/workflow-domains.json";
import SearchBar from "../components/SearchBar.jsx";
import CaseCard from "../components/CaseCard.jsx";

function Cases() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  
  // Get section from URL params and find matching tags
  const sectionParam = searchParams.get("section");
  const sectionTags = useMemo(() => {
    if (!sectionParam) return [];
    // Find section in workflow data
    for (const domain of workflowData.domains || []) {
      const section = domain.sections?.find((s) => s.id === sectionParam);
      if (section?.tags) {
        return section.tags;
      }
    }
    return [];
  }, [sectionParam]);

  const cases = casesData.starterCases || [];

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
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

      // Filter by section tags if section param is present
      const matchesSection =
        sectionTags.length === 0 ||
        (c.tags && c.tags.some((tag) => sectionTags.includes(tag)));

      return matchesSearch && matchesDifficulty && matchesDomain && matchesSection;
    });
  }, [search, difficultyFilter, domainFilter, sectionTags, cases]);

  // Update domain filter if section is provided
  useEffect(() => {
    if (sectionParam) {
      // Try to determine domain from section
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
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">EEG Case Library</h1>
          <p className="text-xs text-slate-600">
            De-identified cases linking clinical history, EEG findings and
            interpretation. Practice with interactive case-based learning.
          </p>
          {sectionParam && sectionTags.length > 0 && (
            <p className="text-xs text-blue-700 mt-1">
              Showing cases related to this section
            </p>
          )}
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search cases by title, complaint, findings..."
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Difficulty
          </label>
          <select
            className="text-sm border border-slate-300 rounded-md px-2 py-1"
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
            className="text-sm border border-slate-300 rounded-md px-2 py-1"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCases.map((c) => (
          <CaseCard key={c.id} eegCase={c} />
        ))}
        {filteredCases.length === 0 && (
          <p className="text-xs text-slate-500">
            No cases match the current filters.
          </p>
        )}
      </div>
    </section>
  );
}

export default Cases;
