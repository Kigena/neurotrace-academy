# ABRET Challenge Bank — pilot review sheet

Generated from `server/src/data/challenge/abret-challenge-pilot.json` (50 questions, version pilot-1).

**Status: every item is `UNREVIEWED` and AI-drafted. Do not treat any item as verified until an expert has reviewed it.** Mark each VERIFIED / NEEDS_REVISION / REJECTED.

> Tip: to test yourself first, read only the stems and options; keyed answers are marked with ✅.

| | Counts |
|---|---|
| Levels | L3: 10, L4: 19, L5: 10, L6: 11 |
| Domains | I Pre-Study: 8, II Performing: 26, III Post-Study: 10, IV Ethics/Professional: 6 |
| Competencies | technical: 11, clinical: 18, montage: 10, troubleshooting: 11 |

---

## ch-pilot-001 — L3 Application/Calculation · technical

*Domain I Pre-Study · EEG Electrode Placement: The International 10–20 System · calculation · 2 reasoning step(s)*

The nasion-to-inion measurement is 36 cm. Using the 10-20 system, how far above the nasion should Fz be marked along the midline?

- **A.** 10.8 cm  ✅ *keyed answer*
- **B.** 7.2 cm
- **C.** 14.4 cm
- **D.** 18.0 cm

**Explanation:** Fpz is placed at 10% of the nasion-inion distance (3.6 cm); each further midline position adds 20%, so Fz is at 30% = 10.8 cm. 7.2 cm (20%) is only the Fpz-to-Fz interval, 18.0 cm (50%) is Cz, and 14.4 cm (40%) is not a standard position.

**Objective:** Calculate midline 10-20 positions from the nasion-inion distance.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-002 — L3 Application/Calculation · technical

*Domain I Pre-Study · Basic EEG Physics & Instrumentation · calculation · 1 reasoning step(s)*

A low-frequency filter is set to 0.5 Hz. Using TC = 1/(2πf), what time constant does this correspond to?

- **A.** About 0.16 s
- **B.** About 0.32 s  ✅ *keyed answer*
- **C.** About 0.53 s
- **D.** About 1.0 s

**Explanation:** TC = 1/(2π × 0.5) ≈ 0.32 s. 0.16 s corresponds to a 1-Hz LFF, 0.53 s to a 0.3-Hz LFF, and 1.0 s to about 0.16 Hz.

**Objective:** Convert between low-frequency filter cutoff and time constant.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-003 — L6 Clinical Integration · clinical

*Domain I Pre-Study · Age-Related EEG Development · age-dependent · 3 reasoning step(s)*

An 8-year-old is referred for school difficulties. With eyes closed the posterior rhythm is 6 Hz and reactive to eye opening. The child has been yawning, and slow roving eye movements are intermittently present. What should the technologist do before this rhythm is described as slow for age?

- **A.** Alert the child and re-record eyes-closed rhythm during clear wakefulness  ✅ *keyed answer*
- **B.** Raise the low-frequency filter so slow posterior components are reduced
- **C.** Change to an average reference montage to measure the occipital frequency
- **D.** Start hyperventilation early to reveal the child's true background frequency

**Explanation:** By about age 3 the waking posterior dominant rhythm should reach roughly 8 Hz, so 6 Hz at age 8 would be slow - but yawning and slow roving eye movements indicate drowsiness, which slows the posterior rhythm. The rhythm must be sampled in clear wakefulness first. Filters and montage do not change frequency, and hyperventilation normally produces slowing in children.

**Objective:** Verify state before judging posterior dominant rhythm frequency against age norms.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-004 — L6 Clinical Integration · clinical

*Domain I Pre-Study · Age-Related EEG Development · age-dependent · 2 reasoning step(s)*

A neonate born at 38 weeks gestation is recorded at 2 days of age. In quiet sleep, 3-8 s bursts of mixed high-amplitude activity alternate with 4-6 s segments of lower-amplitude but clearly continuous activity, symmetric and synchronous. How should this be regarded?

- **A.** Burst-suppression, indicating a significant encephalopathy
- **B.** Tracé alternant, an expected quiet-sleep pattern at this age  ✅ *keyed answer*
- **C.** Tracé discontinu, expected only in a very premature infant
- **D.** Interhemispheric asynchrony from immature commissural function

**Explanation:** Near term, quiet sleep shows tracé alternant: bursts alternating with lower-amplitude but not suppressed interburst activity, symmetric and synchronous. Burst-suppression has invariant, markedly suppressed interbursts without normal state cycling; tracé discontinu has truly low-voltage interbursts in premature infants; the description is synchronous, not asynchronous.

**Objective:** Recognise normal neonatal quiet-sleep patterns at term.

**References (verify):** ACNS Standardized EEG Terminology and Categorization for the Description of Continuous EEG Monitoring in Neonates (Tsuchida et al., J Clin Neurophysiol 2013)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-005 — L4 Troubleshooting · clinical

*Domain I Pre-Study · History Taking & Documentation Basics · activation · 3 reasoning step(s)*

Before a routine EEG, a 62-year-old reports an episode of right-arm weakness and slurred speech 5 days ago that resolved within an hour. No imaging has been done yet. The order includes hyperventilation. What is the best course?

- **A.** Do 1 minute of HV, record the TIA history, and inform the physician
- **B.** Do HV as ordered, record the TIA history, and inform the physician
- **C.** Do HV only after a normal baseline, and record the TIA history
- **D.** Omit HV, record the TIA history, and inform the reading physician  ✅ *keyed answer*

**Explanation:** A recent TIA or stroke is a contraindication to hyperventilation because hypocapnia causes cerebral vasoconstriction. A shorter period still produces hypocapnia, symptom resolution does not remove the risk, and a normal resting EEG does not exclude cerebrovascular disease. The technologist withholds HV, documents the reason and communicates with the physician.

**Objective:** Use the pre-study history to identify hyperventilation contraindications.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-006 — L5 Montage/Localization · montage

*Domain I Pre-Study · Neuroanatomy for EEG Localization · montage-localization · 2 reasoning step(s)*

In a longitudinal bipolar montage, sharp waves deflect toward each other in channels T3-T5 and T5-O1 (negative up). Which region is the most likely generator?

- **A.** Left mid-temporal region
- **B.** Left occipital region
- **C.** Left parietal parasagittal region
- **D.** Left posterior temporal region  ✅ *keyed answer*

**Explanation:** Deflections pointing toward each other in two adjacent channels mark a negative phase reversal at their shared electrode, T5 (left posterior temporal). A mid-temporal maximum would reverse around T3 (F7-T3/T3-T5); O1 is the end of the chain; a parietal maximum would reverse at P3 in the parasagittal chain.

**Objective:** Localise a negative phase reversal to the shared electrode and its region.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-007 — L6 Clinical Integration · clinical

*Domain I Pre-Study · History Taking & Documentation Basics · clinical-integration · 2 reasoning step(s)*

A 4-year-old is sedated with chloral hydrate. The recording shows prominent diffuse 18-22 Hz activity, maximal anteriorly, superimposed on normal sleep architecture. How should the technologist document this?

- **A.** As possible frontal epileptiform activity needing an urgent call
- **B.** As muscle artifact, lowering the high-frequency filter to remove it
- **C.** Likely sedative-related beta; record the drug, dose, and time given  ✅ *keyed answer*
- **D.** As a breach rhythm, and ask the family about prior skull surgery

**Explanation:** Sedatives such as chloral hydrate, benzodiazepines and barbiturates commonly increase diffuse, frontally predominant beta. Documenting the agent, dose and timing lets the reader attribute it correctly. It is not epileptiform; muscle artifact is irregular and higher in frequency; a breach rhythm is focal over a skull defect.

**Objective:** Relate medication history to expected EEG changes and document it.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-008 — L3 Application/Calculation · clinical

*Domain I Pre-Study · Normal EEG Rhythms · normal-variant · 2 reasoning step(s)*

In an awake adult with eyes open, arciform 9-10 Hz activity is present over C3 and C4. It persists with the eyes open and attenuates over C3 when the patient clenches the right fist. What is the best interpretation?

- **A.** Mu rhythm, a normal rhythm blocked by contralateral movement  ✅ *keyed answer*
- **B.** Alpha rhythm spreading forward from the occipital regions
- **C.** Wicket rhythm of drowsiness arising over both temporal regions
- **D.** Rhythmic central discharges suggestive of an epileptic focus

**Explanation:** Mu is an arch-shaped 7-11 Hz central rhythm that is not blocked by eye opening but attenuates with movement (or intention to move) of the contralateral limb - here the right hand blocks left-central (C3) mu. Alpha blocks with eye opening, wicket rhythm is temporal and seen in drowsiness, and epileptiform activity would not show this selective motor reactivity.

**Objective:** Use reactivity to distinguish mu rhythm from alpha and abnormal rhythms.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-009 — L3 Application/Calculation · technical

*Domain II Performing · Amplifiers & Sensitivity · calculation · 2 reasoning step(s)*

A posterior rhythm deflects 10 mm at a sensitivity of 7 µV/mm. Sensitivity is then changed to 10 µV/mm. What is the rhythm's amplitude, and how large is the new deflection?

- **A.** 70 µV; 14.3 mm
- **B.** 100 µV; 10 mm
- **C.** 49 µV; 4.9 mm
- **D.** 70 µV; 7 mm  ✅ *keyed answer*

**Explanation:** Voltage = deflection × sensitivity = 10 mm × 7 µV/mm = 70 µV. Changing the display does not change the voltage: 70 µV ÷ 10 µV/mm = 7 mm. A larger µV/mm value means lower sensitivity and a smaller deflection.

**Objective:** Calculate amplitude from deflection and predict the effect of a sensitivity change.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-010 — L3 Application/Calculation · technical

*Domain II Performing · Timebase & Sampling Rate · calculation · 2 reasoning step(s)*

At a display speed of 30 mm/s, a transient measures 2.5 mm at its base. What is its approximate duration, and how is it classified by duration?

- **A.** About 42 ms; a spike
- **B.** About 120 ms; a sharp wave
- **C.** About 83 ms; a sharp wave  ✅ *keyed answer*
- **D.** About 250 ms; a slow transient

**Explanation:** 2.5 mm ÷ 30 mm/s = 0.083 s ≈ 83 ms. Spikes last about 20 to under 70 ms and sharp waves about 70-200 ms, so this is a sharp wave by duration.

**Objective:** Convert display distance to duration and classify transients.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-011 — L3 Application/Calculation · technical

*Domain II Performing · Timebase & Sampling Rate · calculation · 2 reasoning step(s)*

A system samples at 128 Hz without effective anti-aliasing filtering. A 100-Hz muscle component is present. At what frequency could it falsely appear in the display?

- **A.** 36 Hz
- **B.** 64 Hz
- **C.** 100 Hz
- **D.** 28 Hz  ✅ *keyed answer*

**Explanation:** The Nyquist frequency is 128/2 = 64 Hz. A component above it folds back to |fs − f| = 128 − 100 = 28 Hz. 36 Hz (100 − 64) is a common miscalculation; 64 Hz is the Nyquist limit itself.

**Objective:** Predict aliased frequencies from sampling rate and signal frequency.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-012 — L3 Application/Calculation · technical

*Domain II Performing · Instrumentation & Display Settings · calculation · 2 reasoning step(s)*

The high-frequency filter is set to 35 Hz. A 35-Hz component with a true amplitude of 20 µV is present. Approximately what amplitude will be displayed?

- **A.** About 10 µV
- **B.** Close to 0 µV
- **C.** About 20 µV
- **D.** About 14 µV  ✅ *keyed answer*

**Explanation:** At the cutoff frequency a filter passes about 70% of the amplitude (−3 dB), so 20 µV displays as about 14 µV. Filters roll off gradually rather than cutting activity off at the setting; 10 µV would be −6 dB (50%), and activity at the cutoff is not passed unchanged.

**Objective:** Apply the −3 dB definition of filter cutoff.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-013 — L3 Application/Calculation · technical

*Domain II Performing · Filters & Time Constants · instrumentation · 2 reasoning step(s)*

Activity up to 70 Hz must be displayed without aliasing. What is the theoretical minimum sampling rate, and why do clinical systems sample faster?

- **A.** 70 Hz; the sampling rate only has to match the highest frequency
- **B.** 140 Hz; higher rates are used mainly to increase displayed amplitude
- **C.** 280 Hz; Nyquist requires four samples per cycle at the top frequency
- **D.** 140 Hz; anti-alias filters roll off gradually, so a margin is needed  ✅ *keyed answer*

**Explanation:** Nyquist requires sampling at more than twice the highest frequency (2 × 70 = 140 Hz). Because real anti-aliasing filters attenuate gradually, systems sample well above this to leave a margin. Sampling rate does not change displayed amplitude, and Nyquist requires two, not four, samples per cycle.

**Objective:** Apply the Nyquist criterion and its practical margin.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-014 — L3 Application/Calculation · technical

*Domain II Performing · Special Protocols (Neonatal/ICU/ECI) · calculation · 2 reasoning step(s)*

During a recording for suspected electrocerebral inactivity, sensitivity is 2 µV/mm. A low-level waveform deflects 1.5 mm. What voltage is this, and what does it mean for the study?

- **A.** 0.75 µV; it is below the threshold and can be disregarded
- **B.** 3 µV; it must be identified before inactivity is stated  ✅ *keyed answer*
- **C.** 3 µV; sensitivity should be reduced to 7 µV/mm to remove it
- **D.** 15 µV; it should be re-measured at 10 µV/mm instead

**Explanation:** Voltage = 1.5 mm × 2 µV/mm = 3 µV. Electrocerebral inactivity requires no cerebral activity above 2 µV, so activity of this size must be identified as artifact (e.g., ECG, ventilator) or as cerebral before the record can be called inactive. Lowering sensitivity would only hide it.

**Objective:** Calculate low-level voltages at ECI sensitivity and judge their significance.

**References (verify):** ACNS Guideline 3: Minimum Technical Standards for EEG Recording in Suspected Cerebral Death (Stecker et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-015 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Electrodes & Impedance · instrumentation · 3 reasoning step(s)*

60-Hz activity appears only in channels F4-C4 and C4-P4 of a longitudinal bipolar montage; every other channel is clean and the notch filter is off. What is the most likely cause and best action?

- **A.** High or unbalanced impedance at C4; re-prepare the C4 electrode  ✅ *keyed answer*
- **B.** A poor ground connection; re-apply the patient ground electrode
- **C.** A faulty F4 lead; replace the F4 electrode and its wire
- **D.** Interference from a nearby device; switch on the notch filter

**Explanation:** The two affected channels share C4, so the problem is at C4: impedance mismatch lets common-mode 60-Hz interference become a differential signal. A ground problem or a nearby device would affect many channels; an F4 fault would also involve Fp2-F4; the notch filter hides the problem instead of fixing it.

**Objective:** Localise a technical fault to the electrode shared by affected channels.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-016 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Amplifiers, Impedance & Grounding · instrumentation · 2 reasoning step(s)*

After a patient is repositioned, 60-Hz interference appears in nearly every channel, although individual electrode impedances remain low and balanced. What should be checked first?

- **A.** The high-frequency filter setting for all channels
- **B.** The reference electrode chosen for the current montage
- **C.** The patient ground electrode and its connection  ✅ *keyed answer*
- **D.** The impedance of the vertex electrode at Cz

**Explanation:** Interference across almost all channels with good electrode impedances points to a shared component - most often a dislodged or poorly connected patient ground after movement. Filter settings do not create new 60-Hz interference, and a single reference or electrode problem would not explain a montage-wide change when impedances are good.

**Objective:** Distinguish global from electrode-specific interference.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-017 — L4 Troubleshooting · technical

*Domain II Performing · Amplifiers, Impedance & Grounding · instrumentation · 2 reasoning step(s)*

The two electrodes feeding one channel measure 2 kΩ and 18 kΩ, and the amplifier has a high CMRR. Why might this channel still show prominent 60-Hz interference?

- **A.** A high CMRR amplifies common-mode signals when impedances differ
- **B.** Impedance imbalance converts common-mode noise to differential  ✅ *keyed answer*
- **C.** The 18-kΩ electrode generates 60-Hz activity of its own
- **D.** The higher impedance shifts the interference to a new frequency

**Explanation:** CMRR rejects signals that are identical at both inputs. Unequal electrode impedances make the common-mode interference arrive with different amplitudes at the two inputs, creating a differential signal the amplifier then amplifies. Electrodes do not generate 60 Hz, and impedance does not change the interference frequency.

**Objective:** Explain how impedance imbalance defeats common-mode rejection.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-018 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 3 reasoning step(s)*

A very steep, high-amplitude transient appears in Fp2-F8 and F8-T4 with opposite polarity and in no other channel. It recurs with identical shape at irregular intervals and has no after-going slow wave. What is the most likely explanation and response?

- **A.** Right anterior temporal spike; mark it and notify the reader
- **B.** Right lateral rectus spike; ask the patient to fixate ahead
- **C.** Electrode pop at F8; check and re-prepare the F8 electrode  ✅ *keyed answer*
- **D.** Electrolyte bridge between F8 and T4; dry the scalp there

**Explanation:** A discharge confined to the two channels sharing one electrode, with no field to neighbouring electrodes and an identical, very steep morphology each time, indicates an electrode pop. A phase reversal alone does not prove cerebral origin. Lateral rectus spikes accompany lateral eye movements and are smaller; a bridge flattens the channel between bridged electrodes.

**Objective:** Separate single-electrode artifact from focal cerebral discharges.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-019 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

Channel C3-P3 shows almost no activity while neighbouring channels look normal. Generous electrode paste was used and the patient is perspiring. Calibration of that channel is normal. What is the most likely cause?

- **A.** An electrolyte bridge between C3 and P3  ✅ *keyed answer*
- **B.** An amplifier fault in the C3-P3 channel
- **C.** High impedance at both C3 and P3
- **D.** Excessive notch filtering in that channel

**Explanation:** When paste or sweat connects two electrodes they record nearly the same potential, so their difference is close to zero and the channel looks flat. A normal calibration argues against an amplifier fault; high impedance typically adds noise and 60 Hz rather than flattening; a notch filter does not flatten broadband activity.

**Objective:** Recognise and explain a salt-bridge artifact.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-020 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

A warm, anxious patient produces very slow (about 0.3 Hz) undulating baseline shifts in frontal and temporal channels. Which response addresses the cause rather than only masking it?

- **A.** Raise the low-frequency filter to 1 Hz for the rest of the study
- **B.** Cool the room, dry the skin, and re-prepare affected electrodes  ✅ *keyed answer*
- **C.** Switch to a referential montage using the ear electrodes
- **D.** Decrease sensitivity to 15 µV/mm for the remaining recording

**Explanation:** Sweat alters the electrode-skin interface and produces very slow potentials. Cooling, drying and re-preparing treat the source. Raising the LFF or lowering sensitivity only change the display, and a montage change does not remove the artifact.

**Objective:** Choose corrective rather than cosmetic responses to sweat artifact.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-021 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

Intermittent bifrontal delta appears while an awake patient is talking with the technologist. Which manoeuvre best tests whether it is glossokinetic artifact?

- **A.** Have the patient close the eyes tightly for several seconds
- **B.** Begin hyperventilation and watch for any slow-wave buildup
- **C.** Have the patient say 'la-la-la' and watch for time-locked delta  ✅ *keyed answer*
- **D.** Change to a transverse bipolar montage across the frontal region

**Explanation:** The tongue is a dipole (tip negative relative to root); tongue movement produces slow potentials greatest anteriorly. Reproducing it with lingual sounds such as 'la-la-la' confirms the source. Eye closure tests eye-movement artifact, hyperventilation itself causes slowing, and a montage change does not establish the source.

**Objective:** Use a provocation manoeuvre to confirm glossokinetic artifact.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-022 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 3 reasoning step(s)*

A smooth, rhythmic slow wave appears only at T4. Each wave begins about 250 ms after the QRS complex in the ECG channel. What is the most likely source and remedy?

- **A.** Pulse artifact from an electrode over an artery; move T4 slightly  ✅ *keyed answer*
- **B.** ECG artifact from the heart's field; change to a linked-ear reference
- **C.** Ballistocardiographic head movement; immobilise the head
- **D.** Right temporal periodic discharges; notify the reading physician

**Explanation:** Pulse artifact is a slow wave confined to one electrode over a pulsating artery, appearing about 200-300 ms after the QRS. Moving the electrode off the vessel resolves it. ECG artifact coincides with the QRS and is sharper and more widespread; whole-head movement would affect many channels; cerebral periodic discharges are not time-locked to the heartbeat.

**Objective:** Differentiate pulse from ECG artifact using timing and field.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-023 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Event Monitoring & Emergency Response · artifact · 2 reasoning step(s)*

In a ventilated ICU patient, a slow rhythmic waveform at about 14 cycles per minute appears in several left-sided channels. Which observation best confirms a ventilator or respiratory artifact?

- **A.** It attenuates reproducibly with painful stimulation of the patient
- **B.** It is maximal at T3 with a phase reversal in the left temporal chain
- **C.** It is locked to the ventilator cycle and changes with tubing moves  ✅ *keyed answer*
- **D.** It disappears once the high-frequency filter is lowered to 15 Hz

**Explanation:** Respiratory/ventilator artifact is locked to the breathing cycle and changes when tubing or electrode leads are moved. Reactivity to stimulation suggests a cerebral or arousal phenomenon, a phase reversal does not exclude artifact, and lowering the HFF affects fast rather than slow activity.

**Objective:** Confirm ICU artifact by correlation with external sources.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-024 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 2 reasoning step(s)*

In channels C3-P3 and P3-O1 of a longitudinal bipolar montage (negative up), a transient deflects upward in C3-P3 and downward in P3-O1, so the deflections point away from each other. Assuming a single focal generator, what does this indicate?

- **A.** A negative maximum at P3
- **B.** A maximum at O1 at the end of the chain
- **C.** A positive maximum at P3  ✅ *keyed answer*
- **D.** Equal potential at C3 and O1 with no maximum

**Explanation:** With negative up, a channel deflects upward when input 1 is negative relative to input 2. C3-P3 upward means P3 is more positive than C3; P3-O1 downward means P3 is more positive than O1. P3 is therefore the most positive point - a positive phase reversal, with deflections pointing away from each other. A negative maximum at P3 would make them point toward each other; an O1 maximum gives no reversal (end of chain).

**Objective:** Interpret positive phase reversals in a bipolar chain.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-025 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 3 reasoning step(s)*

In the left temporal chain (Fp1-F7, F7-T3, T3-T5, T5-O1), a sharp wave is largest in Fp1-F7 and progressively smaller in later channels, with no phase reversal. Where is the maximum most likely, and how should it be confirmed?

- **A.** At F7; the absence of a phase reversal already confirms it
- **B.** At T3; review the same epoch at a lower sensitivity to confirm
- **C.** At or anterior to Fp1; confirm with referential or transverse  ✅ *keyed answer*
- **D.** At O1; the wave propagates forward through the temporal chain

**Explanation:** With no phase reversal and the largest deflection in the first channel, the maximum lies at the end of the chain (Fp1) or beyond the electrodes in it - the 'end-of-chain' situation. A referential or transverse montage is needed to show the true maximum. F7 or T3 maxima would produce phase reversals; amplitude grading toward O1 argues against an occipital source.

**Objective:** Recognise and resolve end-of-chain localisation problems.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-026 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 2 reasoning step(s)*

In the left temporal chain (negative up), a negative sharp wave deflects downward in Fp1-F7, produces almost no deflection in F7-T3, and deflects upward in T3-T5. What is the best interpretation?

- **A.** A maximum at Fp1 that spreads toward T5
- **B.** A maximum at T5 with reference artifact at F7
- **C.** Two independent generators at Fp1 and T5
- **D.** A maximum shared about equally by F7 and T3  ✅ *keyed answer*

**Explanation:** Fp1-F7 downward means F7 is more negative than Fp1; T3-T5 upward means T3 is more negative than T5; F7-T3 near zero means F7 and T3 are about equally negative. The maximum therefore spans F7 and T3 (an 'isopotential' channel between them).

**Objective:** Interpret a flat channel between two phase-reversing channels.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-027 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 3 reasoning step(s)*

In a referential montage to the left ear (A1), left temporal sharp waves are small in F7-A1 and T3-A1 but appear as clear opposite-polarity deflections in left parasagittal channels (Fp1-A1, C3-A1, O1-A1). What best explains this?

- **A.** The discharge is actually maximal over the left parasagittal region
- **B.** The left parasagittal electrodes have high or unbalanced impedance
- **C.** The discharge is a positive-polarity benign variant of drowsiness
- **D.** A1 lies in the discharge field and has become an active reference  ✅ *keyed answer*

**Explanation:** When the ear lies within a temporal field, channels near the field nearly cancel (both inputs negative), while distant channels such as Fp1-A1 show the reference's negativity as an inverted deflection. Changing to the contralateral ear, an average or a bipolar montage resolves this. A true parasagittal maximum would not be small at F7/T3 with inverted polarity.

**Objective:** Recognise reference contamination in ear-referenced montages.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-028 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 2 reasoning step(s)*

In an average-reference montage, each eye blink produces large potentials at Fp1 and Fp2 and small blink-shaped deflections of opposite polarity in the occipital channels. What explains the occipital deflections?

- **A.** Volume conduction of the blink potential to the occipital scalp
- **B.** The frontal potential has contaminated the average reference  ✅ *keyed answer*
- **C.** Occipital lambda waves triggered by each blink
- **D.** A transient rise in occipital impedance during blinking

**Explanation:** The average reference includes Fp1 and Fp2, so a large blink potential shifts the average. Every channel (input − average) then shows a small inverted copy, most visible where there is little other activity. Volume conduction would give same-polarity, decaying deflections; lambda waves follow saccades during visual scanning.

**Objective:** Explain artefactual inverted deflections in average-reference montages.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-029 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 3 reasoning step(s)*

During a gaze to the patient's left, which deflections are expected in channels F7-T3 and F8-T4 of a longitudinal bipolar montage (negative up)?

- **A.** Downward in F7-T3 and upward in F8-T4  ✅ *keyed answer*
- **B.** Upward in F7-T3 and downward in F8-T4
- **C.** Downward in both F7-T3 and F8-T4
- **D.** Upward in both F7-T3 and F8-T4

**Explanation:** The cornea is positive relative to the retina. On left gaze the left cornea approaches F7 (F7 becomes positive) and the right cornea moves away from F8 (F8 relatively negative). F7-T3 = positive − T3 → downward; F8-T4 = negative − T4 → upward.

**Objective:** Predict polarity of lateral eye-movement artifact.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-030 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Strategy During Recording · montage-localization · 2 reasoning step(s)*

Vertex sharp waves are maximal at Cz. In a longitudinal bipolar montage without midline channels they appear small and symmetric. Which montage best displays their maximum and polarity?

- **A.** An ipsilateral ear referential montage (C3-A1, C4-A2)
- **B.** A circumferential bipolar montage around the head
- **C.** A transverse bipolar chain including C3-Cz and Cz-C4  ✅ *keyed answer*
- **D.** The same longitudinal montage at a larger µV/mm setting

**Explanation:** A transverse chain through Cz places the maximum at a shared electrode and shows a phase reversal at Cz. Ear-referenced channels do not include Cz, a circumferential montage avoids the midline, and changing sensitivity does not localise a midline maximum.

**Objective:** Select a montage that samples the midline.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-031 — L4 Troubleshooting · clinical

*Domain II Performing · Activation Procedures · activation · 3 reasoning step(s)*

During 15-Hz photic stimulation, generalized spike-and-wave discharges begin and continue for a second after the flash train stops. What is the most appropriate technologist response?

- **A.** Complete the frequency sequence, documenting each response
- **B.** Repeat 15 Hz with eyes open and document reproducibility
- **C.** Stop the train at once and document the clinical response  ✅ *keyed answer*
- **D.** Pause briefly, resume at 15 Hz, and document the response

**Explanation:** Generalized epileptiform discharges that outlast the stimulus are a photoparoxysmal response. Stimulation is stopped promptly to avoid provoking a seizure; the patient's clinical state is observed and documented. Continuing or repeating the provoking frequency adds risk without benefit.

**Objective:** Respond safely to a photoparoxysmal response.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-032 — L4 Troubleshooting · clinical

*Domain II Performing · Activation Procedures · activation · 2 reasoning step(s)*

During photic stimulation, frontal high-frequency spiky potentials appear time-locked to each flash, stop immediately when the flashes stop, and the eyelids flutter. What is this?

- **A.** A photoparoxysmal response
- **B.** A photomyogenic response  ✅ *keyed answer*
- **C.** Photic driving of the posterior rhythm
- **D.** Frontal intermittent rhythmic delta activity

**Explanation:** Muscle potentials over the frontal region that are time-locked to the flashes, accompanied by eyelid flutter and ending with the stimulus, are a photomyogenic response - not cerebral. A photoparoxysmal response is generalized epileptiform activity, often outlasting the train; photic driving is posterior and at the flash rate; FIRDA is rhythmic delta.

**Objective:** Distinguish photomyogenic from photoparoxysmal responses.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-033 — L6 Clinical Integration · clinical

*Domain II Performing · Activation Procedures · activation · 3 reasoning step(s)*

At 90 seconds of hyperventilation, a 7-year-old develops 3-Hz generalized spike-and-wave for 8 seconds while staring. What technologist action provides the most useful clinical information?

- **A.** Keep the child hyperventilating so the full 3 minutes is recorded
- **B.** Test responsiveness during it; annotate onset, offset, recall  ✅ *keyed answer*
- **C.** Switch at once to a referential montage to localise the onset
- **D.** Lower the high-frequency filter to 15 Hz to clarify the spikes

**Explanation:** The key question is whether the discharge is accompanied by impaired awareness. Giving a word or task during the discharge and checking recall afterwards, with precise onset/offset annotation, documents a clinical absence. Montage or filter changes do not provide that information, and continuing HV mechanically ignores the clinical event.

**Objective:** Document clinical correlation of HV-induced discharges.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-034 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Special Protocols (Neonatal/ICU/ECI) · clinical-integration · 2 reasoning step(s)*

An EEG is requested for suspected brain death in a ventilated patient whose bedside equipment produces artifact. Which plan is consistent with ACNS minimum technical standards?

- **A.** 2 µV/mm in part, double distance, ≥30 min, reactivity tested  ✅ *keyed answer*
- **B.** 7 µV/mm throughout, standard spacing, 10 minutes, no stimulation
- **C.** 2 µV/mm, notch on and HFF set to 15 Hz to suppress the artifact
- **D.** 1 µV/mm, closely spaced electrodes, 60 minutes with paralysis

**Explanation:** ACNS standards for suspected cerebral death call for recording at 2 µV/mm for at least part of the study, interelectrode distances of about 10 cm or more (double distance), at least 30 minutes of recording, and testing reactivity to stimulation. Filtering the HFF below 30 Hz is not acceptable; artifacts are identified with additional monitors rather than heavy filtering.

**Objective:** Apply technical standards for ECI recordings.

**References (verify):** ACNS Guideline 3: Minimum Technical Standards for EEG Recording in Suspected Cerebral Death (Stecker et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-035 — L3 Application/Calculation · technical

*Domain III Post-Study · Technical Description & Reporting · calculation · 2 reasoning step(s)*

For a technical description, a rhythmic posterior pattern shows 5 complete waves in 0.5 s with a peak-to-peak deflection of 12 mm at 7 µV/mm. Which description is accurate?

- **A.** 5 Hz, about 84 µV
- **B.** 10 Hz, about 84 µV  ✅ *keyed answer*
- **C.** 10 Hz, about 12 µV
- **D.** 20 Hz, about 58 µV

**Explanation:** 5 waves in 0.5 s = 10 waves per second = 10 Hz. Amplitude = 12 mm × 7 µV/mm = 84 µV. 5 Hz ignores the half-second window; 12 µV confuses millimetres with microvolts.

**Objective:** Measure frequency and amplitude for technical descriptions.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-036 — L6 Clinical Integration · clinical

*Domain III Post-Study · Normal EEG Variants · normal-variant · 3 reasoning step(s)*

A drowsy 72-year-old shows intermittent trains of 7-10 Hz arciform, monophasic, sharply contoured waves over the left mid-temporal region, without after-going slow waves or background disruption, fading with deeper sleep. How should they be described?

- **A.** Left temporal sharp waves suggesting an epileptic focus
- **B.** Rhythmic midtemporal theta of drowsiness
- **C.** Lateralized periodic discharges over the left hemisphere
- **D.** Wicket waves, a benign variant of older adults  ✅ *keyed answer*

**Explanation:** Wicket waves are arciform, monophasic 6-11 Hz waves in trains over the temporal regions in drowsiness, mostly in older adults, without after-going slow waves or background disruption. Epileptiform sharp waves are typically isolated with an after-going slow wave; RMTD is notched theta in younger adults; LPDs recur periodically and are not state-limited trains.

**Objective:** Distinguish wicket waves from epileptiform temporal discharges.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-037 — L5 Montage/Localization · montage

*Domain III Post-Study · Normal EEG Variants · normal-variant · 2 reasoning step(s)*

During drowsiness in a 14-year-old, brief bursts of positive, arch-shaped spikes at about 14 Hz and 6 Hz appear over the posterior temporal regions. Which montage typically displays them best, and why?

- **A.** A transverse bipolar montage, as they phase-reverse at the vertex
- **B.** An average reference, as it removes competing negative activity
- **C.** Contralateral ear reference, whose long distances favour them  ✅ *keyed answer*
- **D.** A longitudinal bipolar montage at a smaller µV/mm, as they are focal

**Explanation:** 14- and 6-Hz positive bursts are widespread posterior temporal positive transients of adolescence; referential montages with long interelectrode distances (classically to the contralateral ear) show them best, whereas short bipolar derivations can cancel them. They are not vertex phenomena.

**Objective:** Choose a montage suited to widespread positive transients.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-038 — L5 Montage/Localization · montage

*Domain III Post-Study · Normal EEG Variants · normal-variant · 2 reasoning step(s)*

In a drowsy adult, low-amplitude (under 50 µV), very brief spikes appear with a broad field and opposite polarity over the two hemispheres in transverse channels, without an after-going slow wave or background change. What is the best interpretation?

- **A.** Benign epileptiform transients of sleep (BETS)  ✅ *keyed answer*
- **B.** Independent bitemporal interictal epileptiform spikes
- **C.** Generalized polyspike discharges of a generalized epilepsy
- **D.** Vertex sharp waves of stage N1 sleep

**Explanation:** BETS (small sharp spikes) are low-amplitude, very brief spikes in drowsiness and light sleep in adults, with a broad field and an oblique dipole that often reverses polarity across the hemispheres, and no after-going slow wave or background disruption. Interictal spikes are usually higher amplitude with after-going slow waves; vertex waves are maximal at Cz.

**Objective:** Recognise BETS from their amplitude, duration and field.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-039 — L6 Clinical Integration · clinical

*Domain III Post-Study · Normal EEG Variants · normal-variant · 3 reasoning step(s)*

A drowsy 25-year-old shows 10 s of 5-6 Hz rhythmic, notched theta over the right mid-temporal region. It does not evolve in frequency, field, or morphology, and the patient answers normally when questioned. What is the most appropriate classification?

- **A.** Rhythmic midtemporal theta of drowsiness  ✅ *keyed answer*
- **B.** A focal electrographic seizure of the right temporal lobe
- **C.** Lateralized rhythmic delta activity
- **D.** Wicket rhythm of older adults

**Explanation:** RMTD is notched 5-7 Hz theta in drowsiness in adolescents and young adults, without evolution or clinical change. A seizure typically evolves in frequency, field or morphology; LRDA is in the delta range; wicket rhythm is faster and seen mainly in older adults.

**Objective:** Use evolution and responsiveness to separate RMTD from seizures.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-040 — L6 Clinical Integration · clinical

*Domain III Post-Study · Normal EEG Variants · normal-variant · 3 reasoning step(s)*

A fully awake 64-year-old shows an abrupt 40-s run of rhythmic, sharply contoured 5-Hz activity over both parietal and posterior temporal regions that ends abruptly without postictal slowing. What does this most likely represent, and what is the key technologist action?

- **A.** SREDA; test and document responsiveness during the run  ✅ *keyed answer*
- **B.** An electrographic seizure; activate the seizure protocol at once
- **C.** Alpha squeak; repeat eye closure to reproduce the pattern
- **D.** Photic driving; check the stimulator for a malfunction

**Explanation:** Subclinical rhythmic electrographic discharge of adults occurs mainly after age 50, appears abruptly over parietal/posterior temporal regions, lasts seconds to minutes and ends without postictal slowing. Testing and documenting preserved responsiveness during the run is the key evidence distinguishing it from a seizure. Alpha squeak follows eye closure; photic driving requires stimulation.

**Objective:** Gather the clinical evidence needed to classify SREDA.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-041 — L6 Clinical Integration · clinical

*Domain III Post-Study · Epileptiform Discharges · normal-abnormal · 2 reasoning step(s)*

A 32-year-old man shows 1-s bursts of 6-Hz spike-and-wave during wakefulness, of high amplitude and maximal anteriorly. Compared with the low-amplitude occipital form seen in drowsy women, how should this be regarded?

- **A.** Equally benign regardless of location and state (FOLD features)
- **B.** More often associated with epilepsy (WHAM features)  ✅ *keyed answer*
- **C.** A form of photic driving at a subharmonic frequency
- **D.** Mu rhythm with superimposed harmonic activity

**Explanation:** 6-Hz spike-and-wave with Wake, High amplitude, Anterior predominance and Male sex (WHAM) is more often associated with epilepsy, whereas Female, Occipital, Low amplitude, Drowsy (FOLD) bursts are more often benign. The features in the stem are WHAM.

**Objective:** Apply WHAM/FOLD features to 6-Hz spike-and-wave.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-042 — L6 Clinical Integration · clinical

*Domain III Post-Study · Encephalopathy Differentials & EEG Patterns · clinical-integration · 3 reasoning step(s)*

An encephalopathic patient with liver failure shows generalized periodic discharges of triphasic morphology with an anterior-posterior lag that attenuate with alerting. Which technologist actions best support interpretation?

- **A.** Lower the HFF to 15 Hz so the discharges look smoother for the reader
- **B.** Change to a reduced-electrode montage to simplify the reader's review
- **C.** Test and annotate reactivity; record consciousness level and drugs  ✅ *keyed answer*
- **D.** Shorten the recording because the pattern is already clearly established

**Explanation:** Interpretation of GPDs with triphasic morphology depends on state, reactivity, metabolic context and medications (e.g., sedatives). Systematic, annotated reactivity testing and documentation of consciousness and drugs give the reader that context. Heavy filtering distorts morphology, fewer electrodes reduce information, and an abbreviated study loses state and reactivity data.

**Objective:** Support interpretation of periodic patterns with clinical context.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-043 — L6 Clinical Integration · clinical

*Domain III Post-Study · Focal vs Generalized EEG Patterns · clinical-integration · 2 reasoning step(s)*

After an acute left MCA stroke, sharp waves recur every 1-1.5 s over the left hemisphere, maximal at T3, throughout the recording. In ACNS critical care terminology, how is this pattern named?

- **A.** Generalized periodic discharges (GPDs)
- **B.** Lateralized rhythmic delta activity (LRDA)
- **C.** Bilateral independent periodic discharges (BIPDs)
- **D.** Lateralized periodic discharges (LPDs)  ✅ *keyed answer*

**Explanation:** Discharges recurring at regular intervals over one hemisphere are LPDs (formerly PLEDs). GPDs are bilateral and synchronous; LRDA is rhythmic delta without interdischarge intervals; BIPDs require independent periodic discharges over both hemispheres.

**Objective:** Apply ACNS critical care terminology to periodic patterns.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-044 — L4 Troubleshooting · clinical

*Domain III Post-Study · Technical Description & Reporting · documentation · 2 reasoning step(s)*

Which entry is most appropriate in a technologist's technical description of a clinical event?

- **A.** Left temporal lobe seizure with impaired awareness at 10:42, consistent with epilepsy
- **B.** 10:42:15 stare, unresponsive 20 s, no recall; left temporal rhythmic theta from 10:42:10  ✅ *keyed answer*
- **C.** Typical seizure according to the family; EEG change judged insignificant by the technologist
- **D.** Probably a psychogenic event because the EEG change during the episode was subtle

**Explanation:** A technical description records objective, time-stamped observations - behaviour, responsiveness testing and EEG changes - without diagnostic conclusions. Diagnoses (epilepsy, psychogenic events) and judgements of significance belong to the interpreting physician.

**Objective:** Write objective technical descriptions of events.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-045 — L4 Troubleshooting · troubleshooting

*Domain IV Ethics/Professional · Patient Safety & Professional Standards · safety · 2 reasoning step(s)*

An ICU patient is connected to the EEG and to a bedside monitor, each with its own patient ground electrode. What is the main safety concern and the appropriate action?

- **A.** Leakage current via a ground loop; use a single patient ground  ✅ *keyed answer*
- **B.** Two grounds only increase artifact, so no safety action is needed
- **C.** The EEG ground should be connected to the monitor's chassis instead
- **D.** Both ground electrodes should be placed on the same limb

**Explanation:** Separate grounds on two devices create a potential path (ground loop) for leakage current through the patient. Using a single patient ground (and isolated amplifiers) removes that path. Connecting to another chassis or moving electrodes does not eliminate the loop.

**Objective:** Recognise and prevent ground-loop hazards.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-046 — L4 Troubleshooting · troubleshooting

*Domain IV Ethics/Professional · Patient Safety & Professional Standards · safety · 2 reasoning step(s)*

An EEG is ordered for a patient with suspected Creutzfeldt-Jakob disease. Which infection-control approach is most appropriate?

- **A.** Reusable electrodes, low-level disinfection per protocol
- **B.** Disposable electrodes, discarded under the prion protocol  ✅ *keyed answer*
- **C.** Reusable electrodes, standard autoclave cycle per protocol
- **D.** Subdermal needles, discarded as sharps per protocol

**Explanation:** Prions resist routine disinfection and standard sterilisation cycles, so single-use electrodes disposed of according to the institution's prion policy are used. Needle electrodes add sharps and tissue-contact risk rather than reducing it.

**Objective:** Apply prion precautions to EEG equipment.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-047 — L4 Troubleshooting · clinical

*Domain IV Ethics/Professional · Ethics, Confidentiality & Professional Conduct · professional · 2 reasoning step(s)*

After an outpatient EEG, the patient's spouse asks whether the recording 'showed seizures', noting that you watched it the whole time. What is the most appropriate response?

- **A.** Share a general impression, then say the physician will report
- **B.** Explain that the interpreting physician will report the results  ✅ *keyed answer*
- **C.** Say it looked reassuring but that the physician will report it
- **D.** With the patient's consent, report your impression to them now

**Explanation:** Interpretation and communication of results are the physician's role. The technologist can explain the process and how results will be delivered. Informal impressions, reassurance or consent-based summaries still amount to interpretation outside the technologist's scope.

**Objective:** Maintain scope of practice when asked for results.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-048 — L4 Troubleshooting · technical

*Domain IV Ethics/Professional · Quality Assurance & Equipment Maintenance · instrumentation · 2 reasoning step(s)*

During pre-study calibration, one channel shows a calibration pulse of half the expected amplitude with a different decay from all other channels, although settings are identical. What is the most appropriate action?

- **A.** Document it, raise that channel's gain to match, then record
- **B.** Document it and rely on biological calibration to correct it
- **C.** Document it and apply a notch filter to that channel only
- **D.** Document it and repair or remove that channel before recording  ✅ *keyed answer*

**Explanation:** A calibration pulse with abnormal amplitude and decay shows a fault in that channel's amplifier or filters. It must be documented and the channel repaired or taken out of use; compensating with settings hides a hardware problem, and a notch filter does not address it.

**Objective:** Act on abnormal calibration findings.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-049 — L6 Clinical Integration · clinical

*Domain IV Ethics/Professional · Patient Safety & Professional Standards · clinical-integration · 3 reasoning step(s)*

During a routine outpatient EEG, a 50-year-old suddenly stops responding with right-hand automatisms, and the EEG shows evolving rhythmic left temporal activity. The technologist is alone. What is the best sequence?

- **A.** Ensure safety, call for help, test responsiveness, annotate, then notify  ✅ *keyed answer*
- **B.** Stop the recording, position the patient safely, and wait for it to end
- **C.** Leave to notify the physician, then return to annotate the clinical signs
- **D.** Hold the moving hand to limit artifact, then annotate the seizure onset

**Explanation:** Patient safety comes first, with help summoned without leaving the patient. Recording continues, responsiveness is tested, and events are annotated in real time, followed by notifying the physician per protocol. Stopping the recording loses ictal data, leaving the patient is unsafe, and restraining movements risks injury.

**Objective:** Prioritise safety and documentation during a seizure.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-pilot-050 — L4 Troubleshooting · clinical

*Domain IV Ethics/Professional · EEG Documentation & Reporting Standards · professional · 2 reasoning step(s)*

While reviewing a stored study, a technologist notices that the patient name and date of birth in the file header do not match the requisition, although the medical record number does. What should be done?

- **A.** Correct the header to the requisition and document the change
- **B.** Release it, documenting that the record number matched the order
- **C.** Report the discrepancy and repeat the recording under the order
- **D.** Report the discrepancy per policy and verify identity before release  ✅ *keyed answer*

**Explanation:** Conflicting identifiers mean the study may belong to another patient. It must not be edited, released or deleted until identity is verified through the institution's process; unilateral changes risk misattributing results and destroying data.

**Objective:** Handle patient-identification discrepancies in stored data.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

