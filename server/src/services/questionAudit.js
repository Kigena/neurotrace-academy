// Heuristic QA audit for question-bank items.
//
// The audit only RAISES FLAGS for human review. It never rewrites content and
// never changes qaStatus; status changes come only from the explicit,
// reviewed list in data/qa/known-issues.json.

export const FLAG_CODES = {
    OBVIOUS_DISTRACTOR: 'Distractor likely eliminable without subject knowledge',
    BOTH_AB_PATTERN: '"Both A and B" style option',
    ALL_NONE_OF_ABOVE: '"All/None of the above" option',
    DUPLICATE_STEM: 'Stem duplicates another question',
    LONGEST_ANSWER_BIAS: 'Correct option is clearly the longest',
    CONTRADICTORY_EXPLANATION: 'Explanation appears to contradict the keyed answer',
    SENSITIVITY_TERMINOLOGY: 'Sensitivity (µV/mm) direction may be stated incorrectly',
    FILTER_ROLLOFF_REVIEW: 'Filter effect stated categorically; behaviour depends on roll-off',
    UNSUPPORTED_ABSOLUTE: 'Keyed answer makes an absolute claim',
    KEYED_RATIONALE_IN_OPTION: 'Keyed option carries its own explanation or formula',
    PROCEDURAL_CUE: 'Only the keyed option uses safe/procedural wording',
};

// Wording that signals "the responsible, by-the-book answer". If only the keyed
// option uses it, test-wise candidates can pick it without subject knowledge.
const PROCEDURAL = /\b(document\w*|notify|inform|report\w*|verify|verified|safety|safely|per (policy|protocol)|physician|protocol)\b/i;

const OBVIOUS_PATTERNS = [
    /\b(settings?|filters?|montages?|impedances?)\b[^.]{0,40}\bnever matters?\b/i,
    /\bnever matters?\b/i,
    /\bdoes(n't| not) matter\b/i,
    /\bstop the (study|recording) immediately\b/i,
    /\bassume (it is|it's|a) seizure\b/i,
    /\bwithout (notifying|telling|informing) (anyone|anybody)\b/i,
    /\bignore (it|the)\b/i,
    /\b(always|never)\b/i,
];

const BOTH_AB = /\bboth\s+[A-E]\s+and\s+[A-E]\b/i;
const ALL_NONE = /\b(all|none) of (the )?above\b/i;
const ABSOLUTE = /\b(always|never|completely|entirely|guarantees?|in all cases|without exception)\b/i;
const FILTER_TOPIC = /\b(LFF|HFF|low[- ]frequency filter|high[- ]frequency filter|notch|time constant|filter)\b/i;
const FILTER_CATEGORICAL = /\b(eliminat\w*|remov\w*|completely|entirely|no longer|cannot be seen|disappear\w*|abolish\w*|filters? out)\b/i;
const UV_PER_MM = /(\d+(?:\.\d+)?)\s*[µμu]V\s*\/\s*mm/gi;

const norm = (s) => String(s || '').trim().toLowerCase();

/**
 * Sensitivity direction check: if the stem moves from a smaller to a larger
 * µV/mm value (lower display sensitivity), the keyed answer should not claim
 * the waveforms get larger - and vice versa.
 */
function sensitivityProblem(q) {
    const values = [...String(q.stem).matchAll(UV_PER_MM)].map((m) => Number(m[1]));
    if (values.length < 2) return null;
    const [from, to] = values;
    const keyed = `${q.options[q.answerIndex]} ${q.explanation || ''}`.toLowerCase();
    const saysLarger = /\b(larger|bigger|taller|increase[sd]? (in )?(amplitude|size)|amplif)/.test(norm(q.options[q.answerIndex]));
    const saysSmaller = /\b(smaller|shorter|decrease[sd]? (in )?(amplitude|size)|compress)/.test(norm(q.options[q.answerIndex]));
    if (to > from && saysLarger) return `µV/mm increases ${from}→${to} (lower sensitivity) but keyed answer says larger`;
    if (to < from && saysSmaller) return `µV/mm decreases ${from}→${to} (higher sensitivity) but keyed answer says smaller`;
    // Stem wording "increases sensitivity" while the number goes up is itself contradictory.
    if (to > from && /\bincreas\w* (the )?sensitivity\b/i.test(q.stem)) {
        return `stem says sensitivity increases while µV/mm rises ${from}→${to}`;
    }
    if (/higher µv\/mm.*larger|larger.*higher µv\/mm/.test(keyed)) return 'explanation pairs higher µV/mm with larger display';
    return null;
}

/**
 * Explanation contradiction heuristic: the explanation repeats a distractor
 * verbatim (as if it were the answer) but never echoes the keyed option.
 */
function contradictionProblem(q) {
    // Only numeric contradictions are detected automatically; textual
    // contradictions need human review (quoting a distractor to explain why it
    // is wrong is normal and caused false positives).
    const keyed = norm(q.options[q.answerIndex]);
    // The keyed option's leading value disagrees with a result computed
    // ("≈ X") in the keyed option or the explanation.
    const leading = /^\D*?(\d+(?:\.\d+)?)/.exec(keyed);
    // Only the keyed option itself: explanations legitimately show intermediate steps.
    const computed = /≈\s*(\d+(?:\.\d+)?)/.exec(q.options[q.answerIndex] || '');
    if (leading && computed && Number(leading[1]) !== Number(computed[1])) {
        return `keyed value ${leading[1]} but computed value ${computed[1]}`;
    }
    return null;
}

/**
 * Audit one question. `context.stemCounts` maps normalised stems to counts.
 * Returns an array of { code, detail }.
 */
export function auditQuestion(q, context = {}) {
    const flags = [];
    const add = (code, detail = null) => flags.push({ code, detail });
    const options = q.options || [];
    const distractors = options.filter((_, i) => i !== q.answerIndex);

    const obvious = distractors.filter((o) => OBVIOUS_PATTERNS.some((re) => re.test(o)));
    if (obvious.length) add('OBVIOUS_DISTRACTOR', obvious.map((o) => o.slice(0, 80)).join(' | '));

    if (options.some((o) => BOTH_AB.test(o))) add('BOTH_AB_PATTERN');
    if (options.some((o) => ALL_NONE.test(o))) add('ALL_NONE_OF_ABOVE');

    if (context.stemCounts && (context.stemCounts.get(norm(q.stem)) || 0) > 1) add('DUPLICATE_STEM');

    const lengths = options.map((o) => String(o).length);
    const keyedLen = lengths[q.answerIndex];
    const others = lengths.filter((_, i) => i !== q.answerIndex);
    if (others.length && keyedLen > Math.max(...others) * 1.3 && keyedLen - Math.max(...others) >= 15) {
        add('LONGEST_ANSWER_BIAS', `keyed ${keyedLen} chars vs next ${Math.max(...others)}`);
    }

    const contradiction = contradictionProblem(q);
    if (contradiction) add('CONTRADICTORY_EXPLANATION', contradiction);

    const sens = sensitivityProblem(q);
    if (sens) add('SENSITIVITY_TERMINOLOGY', sens);

    const keyedText = `${options[q.answerIndex] || ''} ${q.explanation || ''}`;
    if (FILTER_TOPIC.test(`${q.stem} ${options[q.answerIndex] || ''}`) && FILTER_CATEGORICAL.test(keyedText)) {
        add('FILTER_ROLLOFF_REVIEW', 'filter effect described as all-or-none');
    }

    if (ABSOLUTE.test(options[q.answerIndex] || '')) add('UNSUPPORTED_ABSOLUTE');

    // "(high LFF removes slow components)", "(TC = 1/(2π × LFF) ...)"
    const keyedOpt = options[q.answerIndex] || '';
    const paren = /\(([^)]{12,})\)/.exec(keyedOpt);
    const distractorParens = distractors.some((o) => /\([^)]{12,}\)/.test(o));
    if ((paren && !distractorParens) || /[=≈]/.test(keyedOpt) && !distractors.some((o) => /[=≈]/.test(o))) {
        add('KEYED_RATIONALE_IN_OPTION', paren ? paren[1].slice(0, 60) : 'formula in keyed option');
    }

    if (PROCEDURAL.test(keyedOpt) && !distractors.some((o) => PROCEDURAL.test(o))) {
        add('PROCEDURAL_CUE', keyedOpt.slice(0, 60));
    }

    return flags;
}

export function buildStemCounts(questions) {
    const counts = new Map();
    for (const q of questions) counts.set(norm(q.stem), (counts.get(norm(q.stem)) || 0) + 1);
    return counts;
}

/**
 * Audit a whole bank; returns per-question flags and a summary. Duplicate
 * stems are counted within `stemPool` (default: the audited questions), so
 * retired copies can be excluded and do not flag the copy kept in service.
 */
export function auditBank(questions, { stemPool = questions } = {}) {
    const stemCounts = buildStemCounts(stemPool);
    const results = questions.map((q) => ({ id: q.id ?? q.questionId, flags: auditQuestion(q, { stemCounts }) }));
    const byCode = {};
    for (const r of results) for (const f of r.flags) byCode[f.code] = (byCode[f.code] || 0) + 1;
    return {
        total: questions.length,
        flagged: results.filter((r) => r.flags.length).length,
        byCode,
        results,
    };
}
