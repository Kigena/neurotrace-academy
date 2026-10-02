// Misconception vocabulary and the distractor -> error-code map.
//
// data/qa/misconceptions.json is the controlled vocabulary. Each Challenge
// distractor may carry one code in data/qa/distractor-errors.json, keyed by
// question id and the option's exact text (so a later content change to an
// option simply drops its tag instead of mislabelling it). The map lives
// outside the question documents, so tagging never creates new versions.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/qa');

function readJson(file, fallback) {
    const p = path.join(dataDir, file);
    if (!fs.existsSync(p)) return fallback;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
}

const vocabulary = readJson('misconceptions.json', { codes: {} }).codes;
const distractorErrors = readJson('distractor-errors.json', { items: {} }).items || {};

// code -> [questionId]
const questionsByCode = new Map();
// questionId -> Set(code)
const codesByQuestion = new Map();
for (const [questionId, byOption] of Object.entries(distractorErrors)) {
    const codes = new Set(Object.values(byOption).filter((c) => vocabulary[c]));
    codesByQuestion.set(questionId, codes);
    for (const code of codes) {
        if (!questionsByCode.has(code)) questionsByCode.set(code, []);
        questionsByCode.get(code).push(questionId);
    }
}

export function isMisconceptionCode(code) {
    return typeof code === 'string' && Object.prototype.hasOwnProperty.call(vocabulary, code);
}

/** Error code for choosing `optionText` on `questionId`, or null. */
export function errorCodeFor(questionId, optionText) {
    const code = distractorErrors[questionId]?.[optionText];
    return isMisconceptionCode(code) ? code : null;
}

export function codesForQuestion(questionId) {
    return codesByQuestion.get(questionId) || new Set();
}

export function questionIdsForCode(code) {
    return questionsByCode.get(code) || [];
}

export function describeMisconception(code) {
    const v = vocabulary[code];
    return v ? { code, title: v.title, tip: v.tip, group: v.group } : null;
}

export function misconceptionVocabulary() {
    return vocabulary;
}

export function distractorErrorMap() {
    return distractorErrors;
}
