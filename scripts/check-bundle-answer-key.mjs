#!/usr/bin/env node
// Post-build guard: fails if ABRET question-bank explanations (i.e. the
// answer key) appear anywhere in the built frontend assets.
//
//   node scripts/check-bundle-answer-key.mjs [distDir]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.resolve(process.argv[2] || path.join(root, 'dist'));

if (!fs.existsSync(distDir)) {
  console.error(`dist directory not found: ${distDir} (run the build first)`);
  process.exit(2);
}

const bank = JSON.parse(fs.readFileSync(path.join(root, 'src/data/abret-questions.json'), 'utf8'));
// Long, distinctive explanation strings only (short ones could collide with other copy).
const candidates = bank.questions.map((q) => q.explanation).filter((e) => typeof e === 'string' && e.length >= 60);

// Explanations that are ALSO part of deliberately public study content
// (e.g. a teaching case in cases.json reusing the same text) are expected in
// the bundle and are excluded, but reported.
const publicContent = fs.readdirSync(path.join(root, 'src/data'))
  .filter((f) => f.endsWith('.json') && f !== 'abret-questions.json')
  .map((f) => fs.readFileSync(path.join(root, 'src/data', f), 'utf8'))
  .join('\n');
const shared = candidates.filter((e) => publicContent.includes(JSON.stringify(e).slice(1, -1)));
const needles = candidates.filter((e) => !shared.includes(e));
if (shared.length) {
  console.log(`Note: ${shared.length} bank explanation(s) also appear verbatim in public study content (src/data) and are excluded from this check.`);
}

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|mjs|html|json)$/.test(e.name)) files.push(p);
  }
})(distDir);

const hits = [];
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  for (const n of needles) {
    // JSON-escaped form is what a bundled import would contain.
    if (text.includes(n) || text.includes(JSON.stringify(n).slice(1, -1))) {
      hits.push({ file: path.relative(root, f), sample: n.slice(0, 60) });
      break;
    }
  }
}

if (hits.length) {
  console.error('Answer-key content found in the frontend bundle:');
  hits.forEach((h) => console.error(`  ${h.file}: "${h.sample}..."`));
  process.exit(1);
}
console.log(`OK: none of ${needles.length} question-bank explanations found in ${files.length} built files`);
