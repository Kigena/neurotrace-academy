# Foundation bank de-cue: full pass (2026-10-02)

The original 1,128-question foundation bank was edited in 20 batches (plus the 50-question pilot,
docs/FOUNDATION_DECUE_PILOT.md). Each batch: AI edit under fixed rules -> automated validator
(zero audit flags, balanced answer positions and lengths, procedural wording all-or-none) ->
independent AI fact-check against the original -> fixes applied and re-validated.

## Result

| | Count |
|---|---|
| Questions edited (giveaways removed, same fact and answer meaning) | 854 in batches + 50 pilot |
| Retired as off-scope (general medicine, oncology, ophthalmology, orthopedics, etc.) | 129 |
| Retired as duplicates | 54 |
| Servable foundation questions | 945, all with zero audit flags (968 were flagged before) |

All changes are versioned on import (QuestionVersion keeps every earlier version).
Retirements are qaStatus REJECTED via server/src/data/qa/known-issues.json (history kept).

## Corrections to the original content (76 items; author concern, confirmed by fact-check)

- **tricky-004**: Original stem (7 Hz at age 6) is below the usual norm of a posterior rhythm of at least about 8 Hz by age 3, so calling it age-appropriate was inaccurate; stem changed to 8.5 Hz so the keyed answer is correct.
- **tricky-040**: Original stem (6 Hz at age 3) is below the usual norm of a posterior rhythm of at least about 8 Hz by age 3, so calling it age-appropriate was inaccurate; stem changed to an 18-month-old so the keyed answer is correct.
- **tricky-138**: Original stem (7 Hz at age 4) is below the usual norm of a posterior rhythm of at least about 8 Hz by age 3, so calling it age-appropriate was inaccurate; stem changed to 8 Hz so the keyed answer is correct.
- **tricky-198**: Original stem (7.5 Hz at age 5) is below the usual norm of a posterior rhythm of at least about 8 Hz by age 3, so calling it age-appropriate was inaccurate; stem changed to 8.5 Hz so the keyed answer is correct.
- **tricky-251**: Original 5-option item included Hepatitis E, which is also spread by contaminated water (fecal-oral), so it was a second defensible answer; removed it.
- **tricky-263**: Original explanation said multiple sclerosis is "not primarily inflammation"; MS is an inflammatory demyelinating disease, so the explanation was corrected.
- **tricky-301**: Original stem ('insufficient blood flow to the brain') also fit TIA and syncope; added posterior circulation detail.
- **tricky-316**: Original stem described Bell's palsy as 'numbing'; it is facial weakness/paralysis.
- **tricky-319**: Stem equated ketoacidosis with ketosis; ketosis is not necessarily acidosis.
- **tricky-323**: Original stem said nerves degenerate; Duchenne is a primary muscle disease.
- **tricky-364**: Original statement B ("EEG is central to diagnosis") overstated: epilepsy is a clinical diagnosis supported by EEG; a normal interictal EEG does not exclude it. Key now states the 2-unprovoked-seizure criterion and the explanation notes the ILAE single-seizure/high-risk definition.
- **tricky-397**: Original explanation implied ALS was a plausible alternative with "also normal EEG"; explanation now distinguishes ALS by time course and signs.
- **tricky-441**: Original stem said the brain and spinal cord fail to develop; anencephaly is failure of cranial neural tube closure with the spinal cord usually present (whole-axis failure is craniorachischisis). Stem and explanation corrected.
- **tricky-446**: Original stem placed the compression in the armpit; classic Saturday night palsy is radial nerve compression at the spiral groove of the upper arm (axillary compression = crutch palsy). Stem corrected.
- **tricky-449**: Original stem said "through an opening in the skull or spinal cord due to a genetic defect"; the defect is in the skull/vertebral column and neural tube defects are multifactorial. Corrected.
- **tricky-483**: Original key was ambiguous: neurilemmoma and schwannoma (listed as distractors) are also non-cancerous nerve tumors. Stem narrowed to the NF1 hallmark lesion and the duplicate synonym distractor removed.
- **tricky-486**: Original statement B said anencephaly is a defect "where brain and spinal cord fail to develop"; anencephaly is failure of cranial neural tube closure (the spinal cord is typically formed). Corrected in explanation.
- **tricky-491**: Original statement A placed the compression in the armpit; classic Saturday night palsy is radial nerve compression in the upper arm (spiral groove). Explanation corrected.
- **tricky-494**: Original statement B ("due to a genetic defect") is an oversimplification; neural tube defects are multifactorial (e.g., folate status). Not kept as a keyed fact.
- **d1-blood-supply-004**: Original listed Fp1/Fp2/Fz as ACA (medial frontal) electrodes; midline Fz/Cz better reflect ACA territory, so explanation was revised.
- **d1-blood-supply-009**: Original "Normal EEG" distractor was defensible for locked-in syndrome; stem now specifies depressed consciousness so the key is clearly best.
- **d1-batch1-027**: Original key labeled the inferior division as M3; both superior and inferior divisions are M2 segments (M1 horizontal, M2 insular divisions, M3 opercular, M4 cortical). Key reworded and explanation corrected.
- **d1-batch1-050**: Original explanation said obstruction of the fourth-ventricle outlets causes communicating hydrocephalus; outlet obstruction causes obstructive (noncommunicating) hydrocephalus. Corrected in explanation.
- **d1-batch2-002**: Original listed "Vertebral artery" as a distractor, but vertebral artery occlusion is itself a common cause of lateral medullary syndrome; replaced with AICA and noted in explanation.
- **tricky-018**: Original stem said "maximal at T5-T6", which reads as a single cross-hemisphere derivation; reworded to T5 and T6 (bilateral posterior temporal).
- **d2-batch4-003**: Original premise was wrong: a 20 µV spike at 2 µV/mm gives only a 10 mm deflection and would not clip, so the "very high sensitivity causes clipping" rationale did not hold.
- **d2-batch1-030**: Original key (0.16 Hz) was wrong; its own text computed 1.6 Hz. Key corrected to 1.6 Hz per knownIssue.
- **d2-batch2-008**: Original key said beta would be "reduced or eliminated" at HFF 35 Hz; 20-30 Hz is below the cutoff so it is only partly attenuated. Key wording softened.
- **d2-batch5-016**: Original distractor "Preserved (HFF 15 Hz is above 8-13 Hz)" was also correct; options rewritten so only one is true.
- **d2-batch6-029**: Original key implied a sharp cutoff (20 Hz preserved, 21-30 Hz filtered out); real filters roll off gradually, so the key was corrected to "partly attenuated, more toward 30 Hz".
- **d2-batch7-009**: Original distractor "Only neonatal EEG" is close to true (neonatal EEG also uses LFF about 0.5 Hz, HFF 70 Hz); replaced to avoid ambiguity.
- **d2-batch2-027**: Original key said a Cz reference is useful for localizing midline activity; Cz lies in the field of midline/vertex activity (as d2-batch7-013 states), so it is a poor reference for it. Key corrected to temporal activity distant from the vertex.
- **d2-batch3-009**: Original key cited an "edge effect" for focal activity near the edge of the array, which is not the standard average-reference pitfall; the recognized cause of false localization is a high-amplitude discharge contaminating the average. Key corrected.
- **d2-batch3-014**: Original key ("widespread activity or not maximal at a single electrode") omitted the end-of-chain case, which is a classic cause of absent phase reversal; key wording now includes it.
- **d2-batch4-018**: Original key inferred the activity was "not lateralized" from a maximum in longitudinal but not transverse chains; that inference is invalid. Stem and key rewritten to the voltage-gradient interpretation per fact-check.
- **d2-batch5-020**: Original key said average reference is particularly useful for generalized activity; widespread high-amplitude activity contaminates the average, so it is poorly suited to generalized activity (consistent with d2-batch1-020). Key corrected to focal activity.
- **d2-batch6-008**: Original key inferred the activity was "not lateralized" from a reversal seen only in longitudinal chains; that inference is invalid. Stem and key rewritten to the end-of-chain explanation per fact-check.
- **d2-batch7-005**: Original key stated the ground electrode provides electrical safety; in modern isolated EEG amplifiers the patient ground is an isolated common for common-mode rejection, not an earth path for shock protection (multiple grounds create ground loops). Key corrected to signal/noise rejection.
- **d2-batch4-001**: Original key said Fp1 to O1 spans 100% of the nasion-inion distance; Fp1 and O1 lie inside the 10% end points, so this is incorrect. Stem changed to the midline Fpz-Oz distance (80% of nasion-inion), which tests the same 10-20 spacing principle.
- **d2-batch5-002**: Original key said C3 is at 20% of the distance from Cz to the left ear; C3 is 20% of the full preauricular-to-preauricular distance from Cz (about 40% of Cz-to-ear). Wording corrected.
- **d2-batch7-001**: Known issue: original key placed P3 at 20% of the Cz-to-left-ear distance (that line is the coronal line where C3 lies). Corrected to the left parasagittal line midway between C3 and O1.
- **d2-s2-q2**: Original key was wrong: increasing sweep speed spreads waves out so they look SLOWER; compressing the time base (slower paper speed) makes activity look faster.
- **d2-batch1-011**: Original key specified "posterior regions"; HV build-up is often frontally predominant in older children/adolescents, so location was removed from the key.
- **d2-batch2-017**: Original explanation wrongly called the 20 Hz harmonic a subharmonic.
- **d2-batch3-018**: Original key specified "posterior regions"; build-up is often frontally or diffusely maximal in older children and adults.
- **d2-batch5-017**: Original key quoted a "10-100x" increase in discharges during sleep; this figure is unsupported and was dropped.
- **d2-batch7-010**: Mild lightheadedness and tingling are expected during HV and alone do not require stopping; stem now specifies marked faintness so the keyed action is correct.
- **tricky-030**: Original key labelled the finding "photosensitivity (IPS)"; IPS means intermittent photic stimulation, so the response is now named a photoparoxysmal response.
- **tricky-055**: Original key labelled the finding "photosensitivity (IPS)"; IPS is the stimulus, the response is a photoparoxysmal response.
- **d2-batch1-012**: Original explanation attributed ECG artifact to proximity to neck vessels (that is pulse artifact); corrected to the cardiac electrical field.
- **d2-batch3-029**: Original key included repositioning away from neck vessels, which applies to pulse artifact rather than ECG artifact; key limited to reference change and ECG channel.
- **d2-batch4-012**: Original key cited Fp1/Fp2; lateral eye movement is maximal at F7/F8, so the key was refined while keeping the opposite-polarity fact.
- **d2-batch5-019**: Original key linked ECG artifact to temporal/occipital arteries (that is pulse artifact); key corrected to T3/T4 and ear electrodes A1/A2.
- **tricky-020**: Original stem described blink deflections as out of phase in Fp1-Fp2; blinks are symmetric and in phase, so the stem was corrected.
- **tricky-046**: Original attributed sweat artifact to salt bridging and said it is worse in hairy areas; salt bridges cause low-amplitude identical channels, so mechanism corrected.
- **tricky-070**: Original option A stated ECG artifact appears in all channels; that is inaccurate and was moved, corrected, into the explanation.
- **tricky-108**: Original explanation cited salt bridging and hairy areas; corrected to sweat altering skin potentials.
- **tricky-130**: Original described blink deflections as out of phase; blinks are in phase at Fp1/Fp2.
- **tricky-145**: Original keyed "Both A and D", including "only appears in a single channel", which is not a defining ECG feature; key corrected to regular, QRS-locked deflections.
- **d2-batch7-006**: Original key added "other CNS depressants"; many CNS depressants (e.g., opioids) do not increase beta, so the key was narrowed to benzodiazepines and barbiturates.
- **d2-batch2-020**: Original key said "premature and term"; trace alternant emerges around 34-37 weeks, so key states "term and near-term".
- **tricky-217**: Original explanation omitted the classic OIRDA association with childhood absence epilepsy; added to explanation.
- **tricky-234**: Original option "metabolic conditions affecting temporal regions" is not a recognized TIRDA association; dropped and noted in explanation.
- **d3-batch2-018**: Original explanation attributed alpha coma only to brainstem dysfunction; anoxic and drug-induced causes (the latter often reversible) added.
- **d3-batch2-020**: Original explanation stated burst suppression is "not compatible with meaningful recovery"; this is wrong for anesthetic/drug-induced burst suppression and was corrected.
- **d3-batch2-022**: Original keyed option called age-dependent PDR change a "normal variant"; it is normal maturation, not a variant.
- **d3-batch2-023**: Original option/explanation said hyperventilation increases cerebral blood flow; it reduces it through hypocapnic vasoconstriction. Corrected.
- **d3-batch2-034**: Original key led with "diffuse polymorphic delta activity"; in epilepsy with myoclonic-atonic seizures (formerly Doose syndrome) the background is often normal or shows 4-7 Hz parasagittal theta, so the key now names the characteristic myoclonic-atonic seizures with generalized spike-and-wave instead.
- **tricky-022**: Original stem gave a duration of 50-100 ms, which overlaps the sharp-wave range; BETS are typically under 50 ms, so the stem now says under 50 ms and isolated.
- **tricky-126**: Original key/explanation stated both spindles and K-complexes are required for N2; AASM scoring requires either one. Corrected.
- **d4-batch2-026**: Fact-check: a data use agreement applies to limited data sets; truly de-identified data is not PHI, so key and explanation now refer to IRB/privacy review and any institution-required data-sharing agreement.
- **d4-batch3-021**: Original key/explanation implied patient authorization is typically required for transfer-of-care disclosures; HIPAA permits provider-to-provider disclosure for treatment without authorization, so the key now centres on the release process with identity checks.
- **d4-batch2-028**: Original key (contact precautions for exposed shingles lesions) did not cleanly match CDC guidance; stem and key rewritten per fact-check.
- **d4-batch2-008**: Original key claimed equipment must be calibrated to exact specifications with no acceptable tolerance; real calibration standards are judged against a specified tolerance, so a uniform 2% deviation is not automatically unacceptable.
- **d4-batch2-025**: Original 48 vs 50 µV deviation was arguably within normal tolerance; stem changed to 35 µV so the key is unambiguous.
- **d4-batch5-004**: Original 2% deviation is within the usual +/-5% tolerance, making the key debatable; stem changed to 15% so the key is correct.

## Retired as off-scope

- tricky-241: Ophthalmology diagnosis (retinitis pigmentosa); no EEG or technologist relevance.
- tricky-242: Ophthalmology diagnosis (macular degeneration); no EEG or technologist relevance.
- tricky-243: Ophthalmology emergency (retinal artery occlusion); outside EEG technologist scope.
- tricky-244: Ophthalmology terminology (blepharitis); no EEG or technologist relevance.
- tricky-249: Hepatology disease facts (hepatitis vs cirrhosis); no EEG relevance.
- tricky-250: General clinical sign of liver disease (jaundice); no EEG relevance.
- tricky-260: Pulmonary disease facts (asthma vs COPD); no EEG relevance.
- tricky-261: Cardiopulmonary disease (pulmonary hypertension); no EEG relevance.
- tricky-266: Orthopedic spine pathology (spondylolisthesis); outside EEG technologist scope.
- tricky-267: Spine surgery procedures (laminectomy vs fusion); outside EEG technologist scope.
- tricky-268: Orthopedic spinal deformity (scoliosis); outside EEG technologist scope.
- tricky-269: Orthopedic spinal deformity (kyphosis vs lordosis); outside EEG technologist scope.
- tricky-271: Ophthalmology disease comparison; no EEG or technologist relevance.
- tricky-278: Virology detail (hepatitis D co-infection); no EEG or infection-control relevance.
- tricky-279: Oncology (hepatoma, liver cancer); outside EEG technologist scope.
- tricky-289: Inner ear/ENT disease (Meniere) with no EEG technologist relevance
- tricky-291: General throat anatomy/infection (pharyngitis) unrelated to EEG
- tricky-292: Pediatric airway disease (croup) unrelated to EEG
- tricky-294: Hematology/bone marrow disorder (myelofibrosis) unrelated to EEG
- tricky-296: Oncology (myeloma) unrelated to EEG
- tricky-297: Orthopedic spine disorder (spondylolysis) unrelated to EEG
- tricky-299: Orthopedic/rheumatologic spine inflammation (spondylitis) unrelated to EEG
- tricky-302: Orthopedic disk disease terminology unrelated to EEG
- tricky-305: General medical device term (catheter) with no EEG relevance
- tricky-306: Renal lab chemistry (creatinine) unrelated to EEG
- tricky-307: Oncology terminology (in situ)
- tricky-308: General histology (adipose tissue) unrelated to EEG
- tricky-310: Wound care procedure (debridement), another profession's task
- tricky-311: Oncology terminology (carcinogen)
- tricky-317: Virology/oncology trivia (EBV, Burkitt lymphoma)
- tricky-321: Connective tissue genetic disorder (Marfan) unrelated to EEG
- tricky-324: General immunology definition with no EEG relevance
- tricky-325: Eating disorder (anorexia nervosa) unrelated to EEG
- tricky-326: Ophthalmic refraction test (retinoscopy), another profession's task
- tricky-328: Eye anatomy trivia (iris) with no EEG relevance
- tricky-340: Ophthalmology disease facts (retinitis pigmentosa) with no EEG/technologist relevance.
- tricky-341: Ophthalmology disease facts (macular degeneration) with no EEG/technologist relevance.
- tricky-343: Ophthalmology (blepharitis vs conjunctivitis) with no EEG/technologist relevance.
- tricky-344: Hepatology (hepatitis vs cirrhosis) disease facts outside the R.EEG T. scope.
- tricky-346: General medical terminology (jaundice/skin color) with no EEG relevance.
- tricky-347: Pulmonology (asthma vs COPD reversibility) outside the R.EEG T. scope.
- tricky-349: Cardiopulmonary disease (pulmonary hypertension/cor pulmonale) outside EEG scope.
- tricky-353: Orthopedic terminology (vertebra vs spine) with no EEG relevance.
- tricky-354: Orthopedic spine disorder (spondylolisthesis) outside EEG scope.
- tricky-355: Spine surgery procedures (laminectomy vs fusion) outside EEG scope.
- tricky-356: Orthopedic spinal curvature terminology (scoliosis) outside EEG scope.
- tricky-359: Orthopedic spine disorder (spondylolysis) outside EEG scope.
- tricky-360: Orthopedic/radicular pain terminology (sciatica) outside EEG scope.
- tricky-361: General anatomical terminology trivia (canal) with no EEG relevance.
- tricky-363: Ophthalmology (conjunctiva/pinkeye) with no EEG/technologist relevance.
- tricky-367: Virology/oncology (EBV, Burkitt lymphoma) outside EEG scope.
- tricky-368: General cardiovascular pathology terminology (arteriosclerosis) outside EEG scope.
- tricky-369: General endocrine disease fact (diabetic ketoacidosis) with no EEG-specific content.
- tricky-371: Genetic connective tissue disorder (Marfan) with no EEG relevance.
- tricky-374: Psychiatric eating disorder facts (anorexia nervosa) with no EEG relevance.
- tricky-375: Optometry procedure (retinoscopy) - another profession's task.
- tricky-379: Oncology (hepatoma/hepatocellular carcinoma) outside EEG scope.
- tricky-380: Virology (hepatitis D replication) with no technologist relevance.
- tricky-381: Pediatric respiratory disease (croup) outside EEG scope.
- tricky-383: ENT anatomy/pharyngitis symptoms with no EEG relevance.
- tricky-385: Hematology (myelofibrosis) outside EEG scope.
- tricky-386: Oncology/hematology (multiple myeloma) outside EEG scope.
- tricky-388: Orthopedic/rheumatologic terminology (spondylitis) outside EEG scope.
- tricky-389: Orthopedic spinal anatomy (lumbar vertebra count) outside EEG scope.
- tricky-390: Spinal curvature (lordosis) is orthopedic anatomy with no EEG/technologist relevance.
- tricky-398: Ophthalmology (retinitis pigmentosa) is outside the R.EEG T. content outline.
- tricky-399: Ophthalmology (macular degeneration) is outside the R.EEG T. content outline.
- tricky-400: Ophthalmology (retinal artery occlusion) is outside the R.EEG T. content outline.
- tricky-401: Hepatology (hepatitis to cirrhosis progression) has no EEG/technologist relevance.
- tricky-403: Pulmonology (asthma vs COPD spirometry) has no EEG/technologist relevance.
- tricky-405: Myositis diagnosis by labs/biopsy is general medicine, not EEG technology.
- tricky-407: Orthopedic spine pathology (spondylolysis/spondylolisthesis) is off-scope.
- tricky-408: Orthopedic spine deformity (scoliosis) is off-scope.
- tricky-417: Renal laboratory chemistry (creatinine) is general medicine with no EEG focus.
- tricky-418: Oncology staging term (in situ) is off-scope.
- tricky-419: General histology trivia (adipose tissue) is off-scope.
- tricky-421: Oncology terminology (tumor vs cancer vs neoplasm) is off-scope.
- tricky-422: Oncology terminology (benign tumor) is off-scope.
- tricky-423: Oncology (metastasis) is off-scope.
- tricky-424: Oncology (leukemia) is off-scope.
- tricky-425: Oncology (lymphoma) is off-scope.
- tricky-426: Oncology (sarcoma) is off-scope.
- tricky-427: Oncology (carcinoma) is off-scope.
- tricky-430: Pediatric oncology (neuroblastoma of adrenal/sympathetic chain) is off-scope.
- tricky-431: Ophthalmic oncology (retinoblastoma) is off-scope.
- tricky-432: Dermatologic oncology (melanoma) is off-scope.
- tricky-433: Dermatologic oncology (basal cell carcinoma) is off-scope.
- tricky-434: Thoracic oncology (mesothelioma) is off-scope.
- tricky-435: Hematologic oncology (Burkitt lymphoma) is off-scope.
- tricky-436: Endocrine tumor classification (pituitary adenoma) is off-scope.
- tricky-438: Oncology terminology (pre-cancerous) is off-scope.
- tricky-450: Spinal surgical procedure terminology (microdiscectomy); no EEG/technologist relevance.
- tricky-454: General vascular disease fact (Raynaud's); no EEG/technologist relevance.
- tricky-461: Oncology: tumor classification by cell of origin.
- tricky-463: Oncology: benign vs malignant tumor behavior.
- tricky-464: Oncology: Burkitt's lymphoma associations.
- tricky-465: Oncology/occupational: mesothelioma and asbestos.
- tricky-466: Oncology: retinoblastoma.
- tricky-468: General vascular disease fact (Raynaud's); no EEG/technologist relevance.
- tricky-481: Oncology: definition of cancer and metastatic spread.
- tricky-482: Oncology terminology (neoplasm vs cancer/carcinoma).
- tricky-495: Spinal surgical procedure terminology (microdiscectomy); no EEG/technologist relevance.
- tricky-496: Oncology: metastasis.
- tricky-497: Oncology terminology (pre-cancerous conditions) is off-scope.
- tricky-498: Hematologic oncology (leukemia) is off-scope.
- tricky-499: Hematologic oncology (lymphoma) is off-scope.
- tricky-500: Oncology tissue classification (sarcoma) is off-scope.
- tricky-501: Oncology tissue classification (carcinoma) is off-scope.
- tricky-504: Pediatric oncology (neuroblastoma of adrenal/sympathetic chain) is off-scope.
- tricky-505: Dermatologic oncology (malignant melanoma) is off-scope.
- tricky-506: Dermatologic oncology (basal cell carcinoma) is off-scope.
- tricky-507: Endocrine tumor classification (pituitary adenoma) is off-scope.
- d1-batch1-023: Neuro-oncology/otology (cranial nerve involvement by acoustic neuroma) with no EEG/technologist relevance.
- d1-batch1-024: Otology/neuro-oncology (acoustic neuroma hearing loss) outside the R.EEG T. scope.
- d1-batch1-025: Neuro-oncology differential of cerebellopontine angle tumors is off-scope.
- d1-batch1-026: Tumor genetics (NF2 and bilateral vestibular schwannomas) with no EEG relevance.
- d1-batch1-032: Ophthalmology (visual acuity in papilledema) outside the R.EEG T. scope.
- d1-batch1-033: Ophthalmology (papilledema vs optic disc drusen) outside the R.EEG T. scope.
- d1-batch1-034: Physician procedure decision (imaging before lumbar puncture) - another profession's task.
- d1-batch1-035: Neuroradiology (MS plaques on MRI) with no EEG/technologist relevance.
- d1-batch1-036: CSF laboratory findings in MS are general neurology, not EEG technology.
- d1-batch1-037: General disease fact (MS clinical course) with no EEG relevance.
- d1-batch1-038: Differential diagnosis of MS (NMO, ADEM, vasculitis) is physician-level neurology outside scope.
- d1-batch1-046: Neurosurgical grading (Spetzler-Martin) is off-scope for the R.EEG T.
- d1-batch1-047: Neurosurgical/radiosurgical treatment of AVMs is off-scope.
- d1-batch1-048: Angiographic/pathologic distinction of AVM vs cavernoma is neuroradiology, off-scope.
- d3-batch1-031: tests a non-standard acronym (SDS)
- d3-batch1-038: Renal pathology (TSC renal angiomyolipoma bleeding risk) with no EEG/technologist relevance.
- d3-batch1-045: Pharmacokinetics trivia (phenytoin zero-order vs carbamazepine linear kinetics) with no EEG/technologist relevance.
