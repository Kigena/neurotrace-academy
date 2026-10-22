// Study-page question sets: each study page's Practice tab can run a quiz made
// only of the Challenge questions written for that page's topics. A set is a
// list of question-id prefixes (one per Challenge file, e.g. "ch-nx" matches
// ch-nx-001); sets may overlap where a file serves two pages.

export const STUDY_SETS = {
    'neurology-essentials': { title: 'Neurology Essentials', prefixes: ['ch-cn', 'ch-nd', 'ch-nx', 'ch-ny', 'ch-ven'] },
    'neuro-syndromes': { title: 'Neuroanatomy, Pathophysiology and Syndromes', prefixes: ['ch-nan', 'ch-syn', 'ch-gen'] },
    'lab-safety': { title: 'Lab Safety, OSHA and SDS', prefixes: ['ch-saf'] },
    'professional-practice': { title: 'Ethics, HIPAA and Professional Practice', prefixes: ['ch-eth', 'ch-hip', 'ch-b10'] },
    'patterns-review': { title: 'Patterns, Sleep, Drugs and Activation', prefixes: ['ch-pv', 'ch-vx', 'ch-sn', 'ch-da'] },
    acns: { title: 'ACNS Guidelines and Terminology', prefixes: ['ch-acg', 'ch-act'] },
    'icu-eeg': { title: 'ICU and Continuous EEG', prefixes: ['ch-icu', 'ch-icx', 'ch-b8'] },
    'neonatal-pediatric': { title: 'Neonatal and Pediatric EEG', prefixes: ['ch-neo', 'ch-ped', 'ch-sn', 'ch-b5'] },
    'amplifier-controls': { title: 'Amplifier Controls and Filters', prefixes: ['ch-amp', 'ch-dif2', 'ch-calc', 'ch-rsb', 'ch-tga', 'ch-b6'] },
    'montages-references': { title: 'Montages and References', prefixes: ['ch-mon', 'ch-rsa', 'ch-tgb', 'ch-b4'] },
    'diffuse-abnormalities': { title: 'Diffuse Abnormalities', prefixes: ['ch-dif'] },
};

/** Allowed quiz lengths; "all" serves every question in the set (up to the cap). */
export const STUDY_SET_SIZES = [10, 20, 'all'];
export const STUDY_SET_MAX = 250; // above the largest set (amplifier controls, 225)

export function isStudySet(key) {
    return typeof key === 'string' && Object.prototype.hasOwnProperty.call(STUDY_SETS, key);
}

/** True when a question id belongs to the set ("ch-dif" matches ch-dif-001 but not ch-dif2-001). */
export function inStudySet(key, questionId) {
    return STUDY_SETS[key].prefixes.some((p) => questionId.startsWith(`${p}-`));
}

export function parseStudySetSize(value) {
    if (value === 'all') return 'all';
    const n = Number.parseInt(value, 10);
    return STUDY_SET_SIZES.includes(n) ? n : null;
}

/** A random selection of the set's questions (all of them, capped, for "all"). */
export function selectStudySet(pool, key, size, rng = Math.random) {
    const matching = pool.filter((q) => inStudySet(key, q.questionId));
    for (let i = matching.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [matching[i], matching[j]] = [matching[j], matching[i]];
    }
    return matching.slice(0, size === 'all' ? STUDY_SET_MAX : size);
}

/** Number of servable questions in every set, for the Practice tabs. */
export function countStudySets(questionIds) {
    return Object.fromEntries(Object.keys(STUDY_SETS).map((key) => [key, questionIds.filter((id) => inStudySet(key, id)).length]));
}
