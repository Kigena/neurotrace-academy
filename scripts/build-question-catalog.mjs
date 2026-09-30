#!/usr/bin/env node
// Generates src/data/question-catalog.json from src/data/abret-questions.json.
//
// The catalog contains ONLY classification metadata (id, domain, section,
// tags, difficulty) so the frontend can show filter counts without shipping
// question text or the answer key. The server is the authority for question
// content and scoring.
//
//   node scripts/build-question-catalog.mjs          # write
//   node scripts/build-question-catalog.mjs --check  # exit 1 if out of date

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'src/data/abret-questions.json');
const outPath = path.join(root, 'src/data/question-catalog.json');

export function buildCatalog(source) {
    return {
        generatedFrom: 'src/data/abret-questions.json',
        sourceVersion: source.version ?? null,
        note: 'Generated metadata only. No stems, options, answers or explanations. Regenerate with `npm run build:catalog`.',
        questions: source.questions.map((q) => ({
            id: q.id,
            domainId: q.domainId,
            sectionId: q.sectionId,
            topicTags: q.topicTags || [],
            difficulty: q.difficulty,
        })),
    };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
    const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    const next = JSON.stringify(buildCatalog(source)) + '\n';
    if (process.argv.includes('--check')) {
        // Line-ending insensitive (git autocrlf may rewrite LF as CRLF on Windows).
        const CR = String.fromCharCode(13);
        const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8").split(CR).join("") : "";
        if (current !== next) {
            console.error('question-catalog.json is out of date. Run: npm run build:catalog');
            process.exit(1);
        }
        console.log('question-catalog.json is up to date');
    } else {
        fs.writeFileSync(outPath, next);
        console.log(`Wrote ${outPath} (${source.questions.length} entries)`);
    }
}
