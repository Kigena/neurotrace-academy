import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ABBREVIATION_GROUPS,
  ABBREVIATIONS,
  ambiguousAbbreviations,
  searchAbbreviations,
} from "../data/abbreviations.js";

const AMBIGUOUS = ambiguousAbbreviations();

function EntryList({ entries, showGroup }) {
  return (
    <dl className="divide-y divide-slate-200">
      {entries.map((e) => (
        <div key={`${e.groupId}-${e.abbr}`} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
          <dt className="font-mono text-sm font-bold text-indigo-700 break-words">{e.abbr}</dt>
          <dd className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">{e.meaning}</div>
            <div className="text-sm text-slate-600">{e.why}</div>
            {showGroup && <div className="mt-1 text-xs text-slate-500">{e.groupTitle}</div>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function Abbreviations() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const group = params.get("group") || "all";
  const chipRow = useRef(null);

  // Keep the selected setting chip visible in the horizontally scrolling row.
  useEffect(() => {
    const row = chipRow.current;
    const chip = row?.querySelector('[aria-pressed="true"]');
    if (row && chip) row.scrollLeft = chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2;
  }, [group]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const pool = useMemo(
    () => (group === "all" ? ABBREVIATIONS : ABBREVIATIONS.filter((e) => e.groupId === group)),
    [group],
  );
  const results = useMemo(() => searchAbbreviations(query, pool), [query, pool]);
  const searching = query.trim().length > 0;
  const visibleGroups = ABBREVIATION_GROUPS.filter((g) => group === "all" || g.id === group);

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          <span className="font-medium text-slate-900">Abbreviations</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Abbreviations</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          {ABBREVIATIONS.length} abbreviations an EEG technologist meets on orders, charts, reports and in the lab,
          each with what it stands for and why it matters to you. Local usage varies: when an abbreviation on an
          order is unclear, ask.
        </p>
      </header>

      <div className="sticky top-[57px] z-20 -mx-4 space-y-3 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur-sm">
        <label className="block">
          <span className="sr-only">Search abbreviations</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setParam("q", e.target.value.trim());
            }}
            placeholder="Search, e.g. DCI, EVD, SOREMP, or a phrase like 'sleep apnea'"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        <div ref={chipRow} className="relative flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by setting">
          {[["all", "All", ABBREVIATIONS.length], ...ABBREVIATION_GROUPS.map((g) => [g.id, g.title, g.rows.length])].map(
            ([id, label, count]) => (
              <button
                key={id}
                type="button"
                aria-pressed={group === id}
                onClick={() => setParam("group", id)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                  group === id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label} <span className="opacity-60">{count}</span>
              </button>
            ),
          )}
        </div>
      </div>

      {searching ? (
        <section className="rounded-xl border border-slate-200 bg-white px-4">
          <h2 className="pt-4 text-sm font-semibold text-slate-500">
            {results.length} {results.length === 1 ? "match" : "matches"} for “{query.trim()}”
          </h2>
          {results.length ? (
            <EntryList entries={results} showGroup />
          ) : (
            <p className="py-4 text-sm text-slate-600">
              No match. Try part of the abbreviation or a word from its meaning, or clear the setting filter.
            </p>
          )}
        </section>
      ) : (
        <>
          {group === "all" && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-base font-semibold text-amber-900">Same letters, different meanings</h2>
              <p className="mt-1 text-sm text-amber-900">
                These abbreviations mean different things in different settings. Read them in context, and ask when
                an order could go either way.
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {AMBIGUOUS.map(({ token, entries }) => (
                  <li key={token} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm">
                    <span className="font-mono font-bold text-amber-900">{token}</span>
                    <ul className="mt-1 space-y-0.5 text-slate-700">
                      {entries.map((e) => (
                        <li key={`${e.groupId}-${e.abbr}`}>
                          {e.meaning} <span className="text-xs text-slate-500">({e.groupTitle})</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {visibleGroups.map((g) => (
            <section key={g.id} id={g.id} className="rounded-xl border border-slate-200 bg-white px-4 pt-4">
              <h2 className="text-lg font-semibold text-slate-900">{g.title}</h2>
              <p className="text-sm text-slate-600">
                {g.blurb}{" "}
                {g.source && (
                  <Link to={g.source.to} className="font-medium text-indigo-700 hover:underline">
                    Open {g.source.label}
                  </Link>
                )}
              </p>
              <EntryList entries={g.rows.map(([abbr, meaning, why]) => ({ abbr, meaning, why, groupId: g.id }))} />
            </section>
          ))}
        </>
      )}
    </div>
  );
}
