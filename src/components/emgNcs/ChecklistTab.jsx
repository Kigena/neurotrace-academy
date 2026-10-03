import React from "react";

function Bar({ value, total, tone = "bg-emerald-500" }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full ${tone} transition-all`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
    </div>
  );
}

export default function ChecklistTab({ items, weeks, done, onToggle }) {
  const weekIds = Object.keys(weeks).map(Number).sort((a, b) => a - b);
  const doneCount = items.filter((i) => done.includes(i.id)).length;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-semibold text-slate-900">Overall checklist progress</span>
          <span className="text-slate-500">
            {doneCount} / {items.length}
          </span>
        </div>
        <Bar value={doneCount} total={items.length} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {weekIds.map((w) => {
          const wk = items.filter((i) => i.week === w);
          const wkDone = wk.filter((i) => done.includes(i.id)).length;
          const [label, title] = weeks[w].split(/\s+—\s+/);
          return (
            <section key={w} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{label}</div>
              <h3 className="mb-1 font-bold text-slate-900">{title || weeks[w]}</h3>
              <div className="mb-3 text-xs text-slate-500">
                {wkDone} / {wk.length} complete
              </div>
              <Bar value={wkDone} total={wk.length} />
              <ul className="mt-3 divide-y divide-slate-100">
                {wk.map((i) => {
                  const checked = done.includes(i.id);
                  return (
                    <li key={i.id}>
                      <label className="flex cursor-pointer items-start gap-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle(i.id)}
                          className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-300 accent-emerald-600"
                        />
                        <span className={`text-sm ${checked ? "text-slate-400 line-through" : "text-slate-700"}`}>{i.text}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
