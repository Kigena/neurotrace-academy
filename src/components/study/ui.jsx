import React from "react";

const TONES = {
  slate: "border-slate-200 bg-white",
  indigo: "border-indigo-200 bg-indigo-50/60",
  amber: "border-amber-200 bg-amber-50/70",
  emerald: "border-emerald-200 bg-emerald-50/60",
};

export function Card({ title, children, tone = "slate" }) {
  return (
    <section className={`rounded-xl border p-5 ${TONES[tone]}`}>
      {title && <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>}
      <div className="space-y-2 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export function Formula({ children }) {
  return <div className="rounded-lg border border-indigo-200 bg-white px-4 py-3 text-center text-lg font-semibold tracking-wide text-indigo-900">{children}</div>;
}

export function Table({ head, rows, note }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100 align-top">
              {r.map((c, j) => <td key={j} className={`px-3 py-2 ${j === 0 ? "font-semibold text-slate-900" : "text-slate-700"}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">{note}</p>}
    </div>
  );
}
