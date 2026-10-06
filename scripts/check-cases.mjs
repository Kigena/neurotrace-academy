#!/usr/bin/env node
/**
 * Quality gate for clinical cases.
 *   node scripts/check-cases.mjs                 -> checks src/data/cases.json
 *   node scripts/check-cases.mjs <file.json>     -> checks a batch file ({ "cases": [...] })
 *                                                   against cases.json for id/title clashes
 *   ... <file.json> --replace                    -> the batch replaces cases with the same ids
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateScene } from "../src/eeg/generator.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(resolve(root, p), "utf8"));

const bank = read("src/data/cases.json").starterCases;
const domains = read("src/data/workflow-domains.json");
const domainList = Array.isArray(domains) ? domains : domains.domains || Object.values(domains);
const patterns = read("src/data/neurotrace_patterns_library_v2.json");
const syndromes = [...read("src/data/syndromes_v2.json"), ...read("src/data/syndromes.json")];

const validLinks = new Set(["/standards", "/workflow"]);
for (const t of ["", "?tab=sensitivity", "?tab=timebase", "?tab=filters", "?tab=lab", "?tab=mistakes"]) validLinks.add(`/amplifier-controls${t}`);
for (const t of ["", "?tab=referential", "?tab=contamination", "?tab=choosing", "?tab=bipolar", "?tab=lab", "?tab=mistakes"]) validLinks.add(`/montages-references${t}`);
for (const t of ["", "?tab=grades", "?tab=finder", "?tab=role", "?tab=mistakes"]) validLinks.add(`/diffuse-abnormalities${t}`);
for (const d of domainList) for (const s of d.sections || []) validLinks.add(`/workflow/${d.id}/${s.id}`);
for (const p of patterns) validLinks.add(`/patterns/${p.id}`);
for (const s of syndromes) validLinks.add(`/syndromes/${s.id}`);
const patternIds = new Set(patterns.map((p) => p.id));
const syndromeIds = new Set(syndromes.map((s) => s.id));

const file = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;
const replace = process.argv.includes("--replace");
const batch = file ? read(file).cases : bank;
const batchIds = new Set(batch.map((c) => c.id));
const others = file ? bank.filter((c) => !(replace && batchIds.has(c.id))) : [];
const errors = [];
const warn = [];
const err = (id, m) => errors.push(`${id}: ${m}`);

const STEP_TYPES = new Set(["history-questions", "recording-strategy", "settings-choice", "pattern-recognition", "report-writing", "safety-response", "calculation", "troubleshooting"]);
const ids = new Set(others.map((c) => c.id));
const titles = new Set(others.map((c) => c.title.toLowerCase()));
const answerPos = [0, 0, 0, 0];

for (const c of batch) {
  const id = c.id || "(no id)";
  if (!/^case-\d{4}$/.test(c.id || "")) err(id, "id must look like case-0000");
  if (ids.has(c.id)) err(id, "duplicate id");
  ids.add(c.id);
  if (!c.title || c.title.length < 12) err(id, "title missing/short");
  else if (titles.has(c.title.toLowerCase())) err(id, "duplicate title");
  titles.add((c.title || "").toLowerCase());
  if (!["easy", "medium", "hard"].includes(c.difficulty)) err(id, "difficulty");
  if (!Array.isArray(c.domainFocus) || !c.domainFocus.length || c.domainFocus.some((d) => !/^domain-[1-4]$/.test(d))) err(id, "domainFocus");
  if (!Array.isArray(c.tags) || c.tags.length < 2) err(id, "tags");
  for (const p of c.patternIds || []) if (!patternIds.has(p)) err(id, `unknown patternId ${p}`);
  for (const s of c.syndromeIds || []) if (!syndromeIds.has(s)) err(id, `unknown syndromeId ${s}`);
  const pt = c.patient || {};
  if (typeof pt.ageYears !== "number" || pt.ageYears < 0 || pt.ageYears > 110) err(id, "patient.ageYears");
  if (!["male", "female", "unspecified"].includes(pt.sex)) err(id, "patient.sex");
  if (!["outpatient", "inpatient", "icu", "ed", "nicu", "emu"].includes(pt.context)) err(id, "patient.context");
  if (!c.chiefComplaint) err(id, "chiefComplaint");
  if (!c.history?.eventDescription) err(id, "history.eventDescription");
  if (!c.eegSummary?.background) err(id, "eegSummary.background");
  if (file) {
    if (!Array.isArray(c.objectives) || c.objectives.length !== 3 || c.objectives.some((o) => typeof o !== "string" || o.length < 10 || o.length > 90))
      err(id, "objectives: exactly 3 strings of 10-90 chars");
  }
  const steps = c.taskFlow || [];
  if (file ? steps.length !== 4 : steps.length < 1) err(id, `taskFlow has ${steps.length} steps${file ? " (need 4)" : ""}`);
  steps.forEach((s, i) => {
    const sid = `${id} step ${i + 1}`;
    const answer = Number.isInteger(s.correctAnswer) ? s.correctAnswer : s.answerIndex;
    const opts = s.options || [];
    if (opts.length !== 4) err(sid, "needs 4 options");
    if (new Set(opts.map((o) => String(o).trim().toLowerCase())).size !== opts.length) err(sid, "duplicate options");
    if (!Number.isInteger(answer) || answer < 0 || answer >= opts.length) err(sid, "answer index");
    else answerPos[answer] += 1;
    if (!(s.question || s.prompt)) err(sid, "question");
    if (!s.explanation || s.explanation.length < 60) err(sid, "explanation missing/short");
    if (file) {
      if (s.step !== i + 1) err(sid, "step number");
      if (!s.title || !s.description) err(sid, "title/description");
      if (!STEP_TYPES.has(s.type)) err(sid, `type must be one of ${[...STEP_TYPES].join(", ")}`);
      const lens = opts.map((o) => String(o).length);
      if (Number.isInteger(answer) && lens[answer] === Math.max(...lens) && lens[answer] > 1.4 * (lens.reduce((a, b) => a + b, 0) - lens[answer]) / (lens.length - 1))
        warn.push(`${sid}: keyed option is much longer than the others (length cue)`);
    }
  });
  for (const [key, scene] of Object.entries(c.tracings || {})) {
    try {
      validateScene(scene);
    } catch (e) {
      err(id, `tracing ${key}: ${e.message}`);
    }
  }
  steps.forEach((s, i) => {
    if (s.tracing && !c.tracings?.[s.tracing]) err(`${id} step ${i + 1}`, `unknown tracing ${s.tracing}`);
  });
  if (!Array.isArray(c.learningLinks) || !c.learningLinks.length) err(id, "learningLinks");
  for (const l of c.learningLinks || []) if (!validLinks.has(l.to) && !String(l.to).startsWith("/study-guides/")) err(id, `bad learning link ${l.to}`);
}

if (file) {
  const total = answerPos.reduce((a, b) => a + b, 0);
  const max = Math.max(...answerPos);
  if (total >= 8 && max / total > 0.4) err("batch", `answer positions unbalanced ${answerPos.join("/")}`);
}

console.log(`${batch.length} cases checked · answer positions A/B/C/D = ${answerPos.join("/")}`);
for (const w of warn) console.log("WARN", w);
if (errors.length) {
  for (const e of errors) console.log("FAIL", e);
  process.exit(1);
}
console.log("PASS");
