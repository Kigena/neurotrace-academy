# Foundation bank de-cue pilot (2026-10-02)

50 Domain II questions from the original bank had their giveaways removed while testing the same fact
with the same correct answer: options balanced in length, rationale moved out of the keyed option,
"Both A and B" replaced by a single best answer, obvious distractors replaced by plausible misconceptions.
All 50 pass the automated audit with zero flags and were fact-checked against their originals
(2 explanation/stem corrections applied: tricky-001, d2-s8-q3). One original answer key was wrong and is
corrected: d2-batch1-005 (7 → 14 µV/mm makes waveforms SMALLER); its NEEDS_REVISION hold is lifted.

54 duplicate questions were retired (qaStatus REJECTED, history kept), keeping the copy with the
fewest quality flags in each of 48 duplicate groups. See server/src/data/qa/known-issues.json.

| ID | Flags before | Change | Correct answer now |
|---|---|---|---|
| d2-s1-q3 | LONGEST_ANSWER_BIAS | Trimmed key (removed "per lab policy"), replaced joke distractors with plausible timing/notch misconceptions, length-balanced. | Bring all sites to acceptable values and recheck after movement |
| d2-s2-q1 | FILTER_ROLLOFF_REVIEW | Distractors made same-family (filter/display settings); explanation uses "attenuates" instead of "removes". | Raising the low-frequency filter too high |
| d2-s3-q1 | LONGEST_ANSWER_BIAS | Shortened key; replaced obviously wrong distractors with plausible technical misconceptions. | They help clarify localization and confirm suspected discharges |
| d2-s4-q1 | PROCEDURAL_CUE | Removed procedural cue ("Document" only in key) by rewording all options; replaced unsafe/absurd distractors. | Note in the record that HV was omitted and why |
| d2-s5-q3 | OBVIOUS_DISTRACTOR, LONGEST_ANSWER_BIAS | Removed "Always" distractor; replaced with plausible filter misconceptions; balanced lengths. | Correct the source first; use the notch only if still needed |
| d2-s6-q3 | OBVIOUS_DISTRACTOR, LONGEST_ANSWER_BIAS | Shortened key (moved "no epileptiform field" to explanation); removed "Always"/"only" distractors. | Arciform waves in brief trains without background disruption |
| d2-s7-q1 | LONGEST_ANSWER_BIAS | Replaced "Only ..." distractors with same-format annotation choices; trimmed key. | Behaviors, responsiveness, and the onset and offset times |
| d2-s8-q1 | LONGEST_ANSWER_BIAS | Trimmed key; made distractors plausible and parallel in length. | Adapt the montage and strategy to neonatal age and context |
| tricky-001 | LONGEST_ANSWER_BIAS | Removed procedural words that appeared only in distractors ("Report", "Document"); trimmed key; balanced lengths. | Recognize a filter effect and review at standard settings |
| tricky-005 | LONGEST_ANSWER_BIAS | Moved rationale out of key; balanced option lengths. | Re-prep Fp1 so its impedance matches the other electrodes |
| tricky-007 | OBVIOUS_DISTRACTOR | Removed "always" distractor; replaced with plausible gain misconceptions; tightened lengths. | Only the display scale changed; brain voltage is unchanged |
| tricky-013 | LONGEST_ANSWER_BIAS, KEYED_RATIONALE_IN_OPTION | Moved Nyquist formula out of key into explanation; clarified stem to "theoretically ... without aliasing". | 100 Hz |
| tricky-017 | OBVIOUS_DISTRACTOR, LONGEST_ANSWER_BIAS | Trimmed key; removed "always"/"eliminate all" distractors; added plausible impedance misconceptions. | They carry infection risk, so prepared cups are preferable |
| tricky-023 | OBVIOUS_DISTRACTOR, LONGEST_ANSWER_BIAS | Removed rationale from key; replaced "always superior" distractor; balanced lengths. | The display changed with the montage; the discharge did not |
| tricky-032 | LONGEST_ANSWER_BIAS | Procedural word "document" now in all options; trimmed key; replaced "assume not important" distractor. | Document 'seizure medication, name unknown' and seek the list |
| d2-batch1-004 | OBVIOUS_DISTRACTOR, LONGEST_ANSWER_BIAS, KEYED_RATIONALE_IN_OPTION | Moved "(ideally <2 kΩ)" out of key (dropped as not standard); removed "doesn't matter" distractor; parallel kΩ-format distractors. | Below 5 kΩ at each site, and balanced across electrodes |
| d2-batch1-005 | LONGEST_ANSWER_BIAS, SENSITIVITY_TERMINOLOGY, KEYED_RATIONALE_IN_OPTION | CORRECTED key: 7 to 14 µV/mm makes waves smaller (original keyed "larger"); stem no longer says "increases sensitivity". | Make the waveforms appear smaller on the display |
| d2-s1-q4 | LONGEST_ANSWER_BIAS | Replaced "No effect"/"Only ECG" distractors with plausible misconceptions; trimmed key. | Artifact in all referential channels, possibly false asymmetry |
| d2-s2-q3 | OBVIOUS_DISTRACTOR, LONGEST_ANSWER_BIAS | Removed "Always" distractor; distractors now parallel "when/use" statements; balanced lengths. | When line noise persists after the source has been addressed |
| d2-s3-q3 | LONGEST_ANSWER_BIAS | Replaced "Stop the study"/"call it immediately" distractors with plausible actions; balanced lengths. | Review other montages for a field and look for artifact sources |
| d2-s4-q3 | LONGEST_ANSWER_BIAS, PROCEDURAL_CUE | Added concrete detail to stem (near-faint) so stopping is clearly best; removed procedural cue by rewording all options; replaced absurd distractors. | Stop HV, attend to the patient, and note symptoms and duration |
| d2-s5-q4 | LONGEST_ANSWER_BIAS | Replaced weak distractors with other named artifact descriptions of similar length. | Slow baseline drift that eases with cooling and drying |
| d2-s6-q4 | OBVIOUS_DISTRACTOR, LONGEST_ANSWER_BIAS | Trimmed key; replaced "always means epilepsy"/"cannot be seen" distractors with parallel two-part statements. | Focal slowing is regional and persists across montages; generalized is diffuse |
| d2-s7-q2 | LONGEST_ANSWER_BIAS, KEYED_RATIONALE_IN_OPTION, PROCEDURAL_CUE | Removed parenthetical and procedural words from key; replaced "announce seizure type"/"change reference" with plausible tech-instinct distractors. | Protect the patient from injury and summon help right away |
| d2-s8-q2 | LONGEST_ANSWER_BIAS | Removed "documenting"/"ignore" cues; distractors now plausible shortcuts; balanced lengths. | Fix electrodes and grounding, annotate artifact, keep filters standard |
| d2-batch1-001 | LONGEST_ANSWER_BIAS, FILTER_ROLLOFF_REVIEW, KEYED_RATIONALE_IN_OPTION | Removed parenthetical (delta, theta) from key into plain wording; explanation says attenuates; distractors same-family. | Attenuate delta and theta and may alter spike morphology |
| tricky-027 | LONGEST_ANSWER_BIAS | Moved rationale out of key; balanced lengths of distractors. | Re-prep or replace the ground electrode before anything else |
| tricky-025 | LONGEST_ANSWER_BIAS | Removed "completely eliminated"/"all recordings" cues; key trimmed; distractors balanced. | Low HFF can attenuate spikes and sharp waves, masking findings |
| tricky-048 | LONGEST_ANSWER_BIAS | Moved the long 30/10 mm/s rationale from key into explanation; added plausible direction-reversal distractor. | Only the horizontal display changed; waves look compressed |
| tricky-050 | LONGEST_ANSWER_BIAS | Trimmed key; replaced "don't matter"/"optional" distractors with plausible shortcuts. | Accurate measurement supports localization and serial comparison |
| tricky-039 | LONGEST_ANSWER_BIAS, KEYED_RATIONALE_IN_OPTION | Removed parenthetical rationale from key; replaced "cannot be determined" with a parallel electrode option. | At the Fz electrode |
| tricky-092 | OBVIOUS_DISTRACTOR, BOTH_AB_PATTERN | Replaced "Both A and B" item with a single best statement testing the benzodiazepine-beta fact; stem reworded accordingly. | Benzodiazepines |
| d2-batch1-015 | LONGEST_ANSWER_BIAS | Replaced "No problems"/"Only affect" distractors with plausible misconceptions; balanced lengths. | Reduced common-mode rejection, with more noise and artifact |
| d2-batch1-016 | OBVIOUS_DISTRACTOR, LONGEST_ANSWER_BIAS, KEYED_RATIONALE_IN_OPTION | Moved parenthetical out of key; replaced "doesn't matter" with parallel µV/mm choices. | A sensitivity near 7 μV/mm, so the spike is clear without clipping |
| d2-s1-q5 | LONGEST_ANSWER_BIAS | Replaced "hide it"/"no mention" distractors with plausible but inadequate methods; trimmed key. | An annotation on the recording and a note of the new position |
| d2-s2-q4 | LONGEST_ANSWER_BIAS | Trimmed key; distractors made same-family display effects; balanced lengths. | Low-amplitude activity to look smaller and be under-recognized |
| d2-s3-q4 | LONGEST_ANSWER_BIAS, KEYED_RATIONALE_IN_OPTION | Removed "(e.g., bipolar longitudinal)" parenthetical by naming the montage in the key; replaced "Only ECG/photic channel" with real montage choices. | A bipolar longitudinal montage that pairs homologous chains |
| d2-s4-q4 | LONGEST_ANSWER_BIAS, PROCEDURAL_CUE | Removed procedural cue ("Document" only in key) by making all options note text; replaced "Sleep normal" with plausible over-calls. | Sleep attempted but not achieved, with the reason stated |
| tricky-011 | LONGEST_ANSWER_BIAS | Moved confirmation step from key into explanation; options now parallel artifact names. | ECG (cardiac) artifact |
| d2-batch2-009 | LONGEST_ANSWER_BIAS | Replaced "absent"/"only during sleep" with parallel frequency/reactivity variants. | Be 8-13 Hz, symmetric, and attenuate with eye opening |
| d2-s7-q3 | LONGEST_ANSWER_BIAS | Trimmed two-part key to the core fact; distractors made same "X from Y" format with similar length. | Seizures from non-seizure behavioral events |
| d2-s8-q3 | OBVIOUS_DISTRACTOR, LONGEST_ANSWER_BIAS, PROCEDURAL_CUE | Replaced protocol/document-only key with concrete standards; removed "always" distractor; balanced lengths. | Defined technical standards apply, e.g., 2 μV/mm and 30+ minutes |
| d2-batch1-008 | LONGEST_ANSWER_BIAS, FILTER_ROLLOFF_REVIEW, KEYED_RATIONALE_IN_OPTION | Removed parenthetical from key; explanation says attenuates; same-family distractors. | Attenuate beta and muscle activity and may blunt spikes |
| tricky-043 | LONGEST_ANSWER_BIAS | Moved "(13 kΩ)" rationale out of key; replaced "eliminate noise" wording; balanced lengths. | Re-prep Fp1 to bring it in line with the other electrodes |
| tricky-037 | LONGEST_ANSWER_BIAS, KEYED_RATIONALE_IN_OPTION | Moved TC formula out of key into explanation; distractors made same-family technical settings. | The low-frequency filter setting |
| tricky-077 | BOTH_AB_PATTERN | Replaced "Both A and B" with single best pairing (30 mm/s for spikes); the 10 mm/s fact moved to explanation and reversed-direction distractors added. | 30 mm/s, to spread waveforms out for spike review |
| tricky-079 | BOTH_AB_PATTERN | Replaced "Both A and B" with single best statement (scalp prep); the paste fact turned into a salt-bridge distractor. | Cleaning and gently abrading the scalp at each site |
| tricky-059 | OBVIOUS_DISTRACTOR, LONGEST_ANSWER_BIAS | Trimmed key; replaced "always superior" distractor with plausible reference misconception. | Its visibility depends on the reference and field, not a change |
| tricky-152 | BOTH_AB_PATTERN | Replaced "Both A and B" with single best statement (AEDs suppress discharges); benzodiazepine fact covered by tricky-092 and explanation. | They may reduce how often epileptiform discharges appear |
| d2-batch1-026 | LONGEST_ANSWER_BIAS | Trimmed key; replaced "doesn't require preparation" distractor with plausible errors (water, salt bridge). | Clean and lightly abrade the skin, then apply conductive paste |
