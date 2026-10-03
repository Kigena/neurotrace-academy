import React, { useMemo, useState } from "react";

const COLUMNS = [
  ["name", "Muscle"],
  ["nerve", "Nerve"],
  ["root", "Root"],
  ["cord", "Trunk / cord / division"],
  ["test", "Clinical test"],
];
const REGIONS = ["All", "Upper Extremity", "Lower Extremity"];

function MuscleTable({ muscles }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [sort, setSort] = useState({ field: "name", asc: true });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return muscles
      .filter((m) => region === "All" || m.region === region)
      .filter((m) => !q || COLUMNS.some(([k]) => String(m[k]).toLowerCase().includes(q)))
      .sort((a, b) => {
        const r = String(a[sort.field]).localeCompare(String(b[sort.field]));
        return sort.asc ? r : -r;
      });
  }, [muscles, query, region, sort]);

  const sortBy = (field) => setSort((s) => (s.field === field ? { field, asc: !s.asc } : { field, asc: true }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 font-bold text-slate-900">1. Muscle innervation table</h3>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search muscle, nerve, root or test…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          aria-label="Search muscles"
        />
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                region === r ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r === "All" ? "All regions" : r}
            </button>
          ))}
        </div>
      </div>
      <div className="emg-prose">
        <div className="table-scroll">
          <table className="ref-table">
            <thead>
              <tr>
                {COLUMNS.map(([k, label]) => (
                  <th key={k} aria-sort={sort.field === k ? (sort.asc ? "ascending" : "descending") : "none"}>
                    <button type="button" onClick={() => sortBy(k)} className="inline-flex items-center gap-1 uppercase">
                      {label}
                      <span className="text-slate-400">{sort.field === k ? (sort.asc ? "▲" : "▼") : ""}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center">
                    No muscles match your search.
                  </td>
                </tr>
              ) : (
                rows.map((m) => (
                  <tr key={m.name}>
                    {COLUMNS.map(([k]) => (
                      <td key={k}>{m[k]}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="ref-note">
          {rows.length} of {muscles.length} muscles · select a column heading to sort
        </p>
      </div>
    </div>
  );
}

export default function ReferenceTab({ muscles, html }) {
  return (
    <div className="space-y-5">
      <MuscleTable muscles={muscles} />
      <div className="emg-prose" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
