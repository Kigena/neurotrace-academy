// Quality gate for one Challenge Bank file (used while authoring new batches).
// Usage: node scripts/check-challenge-file.mjs server/src/data/challenge/<file>.json
// Mirrors server/tests/challenge.test.js plus section-id and cross-file checks.
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const { auditBank } = await import(pathToFileURL(path.join(root, 'server/src/services/questionAudit.js')).href);

const file = path.resolve(process.argv[2]);
const data = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
const qs = data.questions;
const errors = [];
const err = (m) => errors.push(m);

const workflow = JSON.parse(fs.readFileSync(path.join(root, 'src/data/workflow-domains.json'), 'utf8'));
const sectionDomain = {};
for (const d of workflow.domains) for (const s of d.sections || []) sectionDomain[s.id] = d.id;

// ---- shape
if (data.bank !== 'challenge') err('bank must be "challenge"');
if (data.totalQuestions !== qs.length) err('totalQuestions mismatch');
const LEVELS = [3, 4, 5, 6];
const COMPS = ['technical', 'montage', 'troubleshooting', 'clinical'];
for (const q of qs) {
    const id = q.id;
    if (!/^ch-[a-z0-9]+-\d{3}$/.test(id)) err(`${id}: bad id`);
    if (!LEVELS.includes(q.cognitiveLevel)) err(`${id}: level`);
    if (!COMPS.includes(q.competency)) err(`${id}: competency`);
    if (sectionDomain[q.sectionId] !== q.domainId) err(`${id}: sectionId ${q.sectionId} not in ${q.domainId}`);
    if (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options).size !== 4) err(`${id}: options`);
    if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex > 3) err(`${id}: answerIndex`);
    if (!(q.explanation?.length > 80)) err(`${id}: explanation too short`);
    if (!q.learningObjective) err(`${id}: learningObjective`);
    if (q.qaStatus !== 'UNREVIEWED') err(`${id}: qaStatus`);
    if (!Number.isInteger(q.reasoningSteps)) err(`${id}: reasoningSteps`);
    if (!Array.isArray(q.topicTags) || !q.topicTags.length) err(`${id}: topicTags`);
    const calcTags = ['calc-core', 'calc-beyond'].filter((t) => q.topicTags?.includes(t)).length;
    if (q.topicTags?.includes('calculation') && calcTags !== 1) err(`${id}: calculation item needs exactly one of calc-core/calc-beyond`);
    if (!q.topicTags?.includes('calculation') && calcTags) err(`${id}: calc-* tag without "calculation"`);
}
// Broad batches cover every domain and competency; focused sets (data.focus)
// cover one domain or skill and only need 20+ items.
const domainFocus = /^domain-[1-4]$/.test(data.focus || '') ? data.focus : null;
if (qs.length < (data.focus ? 20 : 40)) err(`only ${qs.length} questions (need >= ${data.focus ? 20 : 40})`);
if (domainFocus) {
    for (const q of qs) if (q.domainId !== domainFocus) err(`${q.id}: not in focus ${domainFocus}`);
} else if (!data.focus) {
    for (const d of ['domain-1', 'domain-2', 'domain-3', 'domain-4']) if (!qs.some((q) => q.domainId === d)) err(`no ${d}`);
    for (const c of COMPS) if (!qs.some((q) => q.competency === c)) err(`no ${c}`);
}
if (!data.focus || domainFocus) for (const l of LEVELS) if (!qs.some((q) => q.cognitiveLevel === l)) err(`no L${l}`);
const higher = qs.filter((q) => q.cognitiveLevel >= 4);
if (higher.filter((q) => q.reasoningSteps >= 2).length / higher.length < 0.5) err('fewer than half of L4-L6 have reasoningSteps >= 2');

// ---- audit + banned templates
const audit = auditBank(qs);
for (const r of audit.results) if (r.flags.length) err(`${r.id}: audit ${r.flags.map((f) => `${f.code}${f.detail ? ` (${f.detail})` : ''}`).join('; ')}`);
const banned = /\b(always|never)\b|both [a-e] and [a-e]|all of the above|none of the above/i;
for (const q of qs) if (q.options.some((o) => banned.test(o))) err(`${q.id}: banned option template`);

// ---- position / length cues
const pos = [0, 0, 0, 0];
let longest = 0;
let shortest = 0;
for (const q of qs) {
    pos[q.answerIndex] += 1;
    const L = q.options.map((o) => o.length);
    const others = L.filter((_, i) => i !== q.answerIndex);
    if (L[q.answerIndex] > Math.max(...others) * 1.1) longest += 1;
    if (L[q.answerIndex] < Math.min(...others) * 0.9) shortest += 1;
}
for (const p of pos) if (p / qs.length <= 0.15 || p / qs.length >= 0.35) err(`answer positions unbalanced: ${pos}`);
if (longest / qs.length >= 0.2) err(`keyed option notably longest in ${longest}/${qs.length} (must be < 20%)`);
if (shortest / qs.length >= 0.2) err(`keyed option notably shortest in ${shortest}/${qs.length} (must be < 20%)`);

// ---- uniqueness against every other challenge file and the foundation bank
const challengeDir = path.join(root, 'server/src/data/challenge');
const otherIds = new Set();
const otherStems = new Set();
for (const f of fs.readdirSync(challengeDir).filter((f) => f.endsWith('.json'))) {
    if (path.resolve(challengeDir, f) === file) continue;
    try {
        for (const q of JSON.parse(fs.readFileSync(path.join(challengeDir, f), 'utf8')).questions) {
            otherIds.add(q.id);
            otherStems.add(q.stem.toLowerCase());
        }
    } catch { /* another batch mid-write */ }
}
const foundationPath = path.join(root, 'src/data/abret-questions.json');
if (fs.existsSync(foundationPath)) {
    for (const q of JSON.parse(fs.readFileSync(foundationPath, 'utf8')).questions || []) otherStems.add(String(q.stem).toLowerCase());
}
const seenIds = new Set();
const seenStems = new Set();
for (const q of qs) {
    if (otherIds.has(q.id) || seenIds.has(q.id)) err(`${q.id}: duplicate id`);
    const s = q.stem.toLowerCase();
    if (otherStems.has(s) || seenStems.has(s)) err(`${q.id}: duplicate stem`);
    seenIds.add(q.id);
    seenStems.add(s);
}

// ---- report
const count = (k) => qs.reduce((m, q) => ((m[q[k]] = (m[q[k]] || 0) + 1), m), {});
console.log(`${path.basename(file)}: ${qs.length} questions`);
console.log('  domains', JSON.stringify(count('domainId')));
console.log('  levels', JSON.stringify(count('cognitiveLevel')), 'competencies', JSON.stringify(count('competency')));
console.log(`  positions ${pos}  notably longest ${longest}  shortest ${shortest}`);
if (errors.length) {
    console.log(`FAIL (${errors.length})`);
    for (const e of errors) console.log('  - ' + e);
    process.exit(1);
}
console.log('PASS');
