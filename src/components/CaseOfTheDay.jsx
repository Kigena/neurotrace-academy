import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { caseOfTheDay, caseObjectives } from "../utils/caseSchedule";

const DIFFICULTY_TONE = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-red-100 text-red-800",
};

const CONTEXT_LABEL = { icu: "ICU", ed: "ED", nicu: "NICU", emu: "EMU" };

function patientLine(p) {
  if (!p) return null;
  const age = p.ageYears < 1 ? `${Math.round(p.ageYears * 12)} months` : `${p.ageYears} years`;
  const context = CONTEXT_LABEL[p.context] || p.context;
  return [age, context].filter(Boolean).join(", ");
}

function scoreText(progress) {
  if (!progress) return null;
  return progress.lastTotal > 0 ? `${progress.lastCorrect}/${progress.lastTotal}` : "";
}

function DayTile({ day, progress }) {
  const done = !!progress;
  const base = "flex min-w-[8.5rem] flex-1 flex-col rounded-xl border p-3 text-left transition-colors";

  if (day.isFuture) {
    return (
      <div className={`${base} border-dashed border-slate-200 bg-slate-50/60`} aria-label={`${day.label}: opens on ${day.key}`}>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>
            {day.label} {day.dayOfMonth}
          </span>
          <span aria-hidden="true">🔒</span>
        </div>
        <div className="mt-2 text-xs text-slate-400">Opens {day.label}</div>
        <div className="mt-auto pt-2">
          <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-semibold capitalize opacity-60 ${DIFFICULTY_TONE[day.case.difficulty] || ""}`}>
            {day.case.difficulty}
          </span>
        </div>
      </div>
    );
  }

  const tone = day.isToday
    ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200"
    : done
      ? "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50"
      : "border-amber-200 bg-white hover:bg-amber-50/60";

  return (
    <Link to={`/cases/${day.case.id}`} className={`${base} ${tone}`}>
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className={day.isToday ? "text-indigo-700" : "text-slate-600"}>{day.isToday ? "Today" : `${day.label} ${day.dayOfMonth}`}</span>
        {done ? (
          <span className="rounded-full bg-emerald-500 px-1.5 text-[0.65rem] font-bold text-white">✓ {scoreText(progress)}</span>
        ) : day.isPast ? (
          <span className="text-[0.65rem] font-bold uppercase text-amber-600">Catch up</span>
        ) : null}
      </div>
      <div className="mt-2 line-clamp-3 text-xs font-medium leading-snug text-slate-800">{day.case.title}</div>
      {day.case.tracings && <div className="mt-auto pt-1.5 text-[0.65rem] font-semibold text-sky-700">📈 Tracings</div>}
    </Link>
  );
}

/**
 * Home-page Case of the Day: today's case plus the Monday-Sunday lineup with
 * completion marks. `progressMap` maps caseId -> completion record.
 */
export default function CaseOfTheDay({ cases, progressMap = {}, now }) {
  const { today, week } = useMemo(() => caseOfTheDay(cases, now || new Date()), [cases, now]);
  if (!today) return null;

  const progress = progressMap[today.id];
  const objectives = caseObjectives(today);
  const steps = today.taskFlow?.length || 0;
  const available = week.filter((d) => !d.isFuture);
  const doneThisWeek = available.filter((d) => progressMap[d.case.id]).length;
  const dateLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York" }).format(now || new Date());

  return (
    <section className="rounded-2xl border-2 border-indigo-200 bg-white p-6 shadow-lg md:p-8">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white">⭐ CASE OF THE DAY</div>
        <div className="text-xs font-medium text-slate-500">{dateLabel} · new case every day</div>
        {today.tracings && Object.keys(today.tracings).length > 0 && (
          <div className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">📈 EEG tracings</div>
        )}
        {progress && (
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            ✓ Completed{scoreText(progress) && ` · ${scoreText(progress)}`}
          </div>
        )}
      </div>

      <h2 className="mb-4 text-2xl font-bold text-slate-900 md:text-3xl">{today.title}</h2>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          {today.patient && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">👤</div>
              <div>
                <div className="text-xs text-slate-500">Patient</div>
                <div className="font-semibold text-slate-900">{patientLine(today.patient)}</div>
              </div>
            </div>
          )}
          {today.chiefComplaint && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">🔍</div>
              <div>
                <div className="text-xs text-slate-500">Chief complaint</div>
                <div className="line-clamp-2 font-semibold text-slate-900">{today.chiefComplaint}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">📊</div>
            <div>
              <div className="text-xs text-slate-500">Difficulty</div>
              <div className="font-semibold capitalize text-slate-900">
                {today.difficulty}
                {steps > 0 && <span className="font-normal normal-case text-slate-500"> · {steps} decision steps</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 text-xs font-semibold text-indigo-600">LEARNING OBJECTIVES</div>
          <ul className="space-y-1.5 text-sm text-slate-700">
            {objectives.map((o) => (
              <li key={o} className="flex items-start gap-2">
                <span className="mt-0.5 text-indigo-500">✓</span>
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        to={`/cases/${today.id}`}
        className="inline-flex transform items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
      >
        <span className="text-white">{progress ? "Review This Case" : "Study This Case"}</span>
        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>

      <div className="mt-8 border-t border-slate-200 pt-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">This week&apos;s cases</h3>
          <span className="text-xs text-slate-500">
            {doneThisWeek} of {available.length} available done · a new case unlocks each day
          </span>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {week.map((d) => (
            <DayTile key={d.key} day={d} progress={progressMap[d.case.id]} />
          ))}
        </div>
      </div>
    </section>
  );
}
