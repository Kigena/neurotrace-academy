# ABRET Challenge Bank — batch 2 review sheet

Generated from `server/src/data/challenge/abret-challenge-batch2.json` (75 questions, version batch2-1).

**Status: every item is `UNREVIEWED` and AI-drafted. Do not treat any item as verified until an expert has reviewed it.** Mark each VERIFIED / NEEDS_REVISION / REJECTED.

> Tip: to test yourself first, read only the stems and options; keyed answers are marked with ✅.

| | Counts |
|---|---|
| Levels | L3: 12, L4: 29, L5: 10, L6: 24 |
| Domains | II Performing: 40, I Pre-Study: 11, III Post-Study: 16, IV Ethics/Professional: 8 |
| Competencies | technical: 13, troubleshooting: 16, montage: 9, clinical: 37 |

---

## ch-b2-001 — L3 Application/Calculation · technical

*Domain II Performing · Amplifiers & Sensitivity · calculation · 2 reasoning step(s)*

A display channel allows 30 mm of vertical excursion before traces overlap their neighbours. A 250-µV spike is expected. Of the standard settings 5, 7, 10 and 15 µV/mm, which is the most sensitive one that keeps the spike within 30 mm?

- **A.** 7 µV/mm
- **B.** 15 µV/mm
- **C.** 10 µV/mm  ✅ *keyed answer*
- **D.** 5 µV/mm

**Explanation:** Deflection = voltage ÷ sensitivity. At 7 µV/mm the spike is 250/7 ≈ 36 mm (overlaps); at 10 µV/mm it is 25 mm (fits). 15 µV/mm also fits (≈17 mm) but is less sensitive than needed; 5 µV/mm gives 50 mm.

**Objective:** Choose a sensitivity that displays large discharges without overlap.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-002 — L3 Application/Calculation · technical

*Domain II Performing · Timebase & Sampling Rate · calculation · 2 reasoning step(s)*

A 20-second page is displayed 300 mm wide. A rhythmic posterior pattern has a cycle width of 2 mm. What is its frequency?

- **A.** 15 Hz
- **B.** 3.75 Hz
- **C.** 7.5 Hz  ✅ *keyed answer*
- **D.** 10 Hz

**Explanation:** 300 mm per 20 s = 15 mm/s, so one 2-mm cycle lasts 2/15 ≈ 0.133 s, i.e. 7.5 Hz. 15 Hz assumes the standard 30 mm/s; 3.75 Hz inverts the scaling; 10 Hz is a guess at 'normal alpha'.

**Objective:** Measure frequency on non-standard page widths.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-003 — L3 Application/Calculation · technical

*Domain II Performing · Timebase & Sampling Rate · calculation · 2 reasoning step(s)*

A 10-second page is displayed 250 mm wide. A transient measures 4 mm at its base. What are its duration and its classification by duration?

- **A.** About 40 ms; a spike
- **B.** About 133 ms; a sharp wave
- **C.** About 160 ms; a sharp wave  ✅ *keyed answer*
- **D.** About 400 ms; a slow wave

**Explanation:** 250 mm per 10 s = 25 mm/s, so 4 mm = 0.16 s = 160 ms, within the 70-200 ms sharp-wave range. 133 ms comes from wrongly assuming 30 mm/s; 40 ms and 400 ms are decimal errors.

**Objective:** Convert width to duration at the actual display speed.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-004 — L3 Application/Calculation · technical

*Domain II Performing · Filters & Time Constants · calculation · 2 reasoning step(s)*

A 100-µV, 1-Hz delta wave passes through a single-pole (6 dB/octave) low-frequency filter. Approximately what amplitude is displayed with the LFF at 1 Hz, and with the LFF at 0.5 Hz?

- **A.** About 50 µV, and about 71 µV
- **B.** About 71 µV, and about 100 µV
- **C.** About 0 µV, and about 50 µV
- **D.** About 71 µV, and about 89 µV  ✅ *keyed answer*

**Explanation:** For a single-pole high-pass filter, gain = f/√(f² + fc²). At fc = 1 Hz: 1/√2 ≈ 0.71 (71 µV). At fc = 0.5 Hz: 1/√1.25 ≈ 0.89 (89 µV). Attenuation is gradual, never all-or-none, and still present below the cutoff.

**Objective:** Quantify partial attenuation by a low-frequency filter.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-005 — L3 Application/Calculation · technical

*Domain II Performing · Filters & Time Constants · calculation · 2 reasoning step(s)*

A single-pole high-frequency filter is set at 15 Hz. Approximately what fraction of a 20-Hz beta component's amplitude is displayed?

- **A.** About 75%
- **B.** About 33%
- **C.** About 60%  ✅ *keyed answer*
- **D.** About 100%

**Explanation:** For a single-pole low-pass filter, gain = 1/√(1 + (f/fc)²) = 1/√(1 + 1.78) ≈ 0.60. 75% is the ratio 15/20 used linearly; activity above the cutoff is attenuated progressively rather than blocked or passed unchanged.

**Objective:** Quantify attenuation above a high-frequency filter setting.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-006 — L3 Application/Calculation · technical

*Domain II Performing · Timebase & Sampling Rate · calculation · 2 reasoning step(s)*

A 25-ms spike is digitised at 128 samples per second. About how many samples fall within the spike, and what is the main consequence?

- **A.** About 32; there is no meaningful distortion
- **B.** About 3; it will be aliased to a lower frequency
- **C.** About 3; its peak amplitude may be underestimated  ✅ *keyed answer*
- **D.** About 5; its polarity may appear inverted

**Explanation:** 0.025 s × 128 /s ≈ 3.2 samples. So few points can miss the true peak, under-representing amplitude and sharpness. Aliasing concerns frequency content above Nyquist, not under-sampling of a transient's shape; sampling does not invert polarity.

**Objective:** Relate sampling rate to fidelity of brief transients.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-007 — L3 Application/Calculation · technical

*Domain II Performing · Amplifiers, Impedance & Grounding · calculation · 2 reasoning step(s)*

60-Hz interference reaches both inputs of a channel equally at 10 mV. The amplifier's CMRR is 100 dB (100,000:1) and electrode impedances are perfectly balanced. About how large is the residual differential signal?

- **A.** About 0.1 µV  ✅ *keyed answer*
- **B.** About 1 µV
- **C.** About 10 µV
- **D.** About 100 µV

**Explanation:** 10 mV = 10,000 µV; 10,000 ÷ 100,000 = 0.1 µV. In practice impedance imbalance, not the amplifier's CMRR, is what lets interference through.

**Objective:** Compute residual common-mode interference from CMRR.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-008 — L3 Application/Calculation · technical

*Domain II Performing · Instrumentation & Display Settings · calculation · 2 reasoning step(s)*

After a square-wave calibration step, the trace decays to 37% of its initial deflection in 0.3 s. Approximately what low-frequency filter setting does this time constant represent?

- **A.** About 0.3 Hz
- **B.** About 3.3 Hz
- **C.** About 0.53 Hz  ✅ *keyed answer*
- **D.** About 0.16 Hz

**Explanation:** The time constant is the time to decay to 37%: TC = 0.3 s. LFF = 1/(2π × 0.3) ≈ 0.53 Hz. 0.3 Hz confuses seconds with hertz; 3.3 Hz is 1/TC without 2π; 0.16 Hz corresponds to TC = 1 s.

**Objective:** Derive the LFF from the calibration decay.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-009 — L4 Troubleshooting · technical

*Domain II Performing · Instrumentation & Display Settings · instrumentation · 2 reasoning step(s)*

All channels are set to 7 µV/mm. A 50-µV calibration pulse deflects about 7.1 mm in every channel except one, which deflects 5 mm. Which conclusion is correct?

- **A.** Its gain is about 40% high; reduce its sensitivity to compensate
- **B.** Its gain is about 30% low; it needs correction before recording  ✅ *keyed answer*
- **C.** It reflects a higher electrode impedance at that head position
- **D.** It is within tolerance, because the deviation is under 2 mm

**Explanation:** Expected deflection = 50/7 ≈ 7.1 mm; 5 mm is about 70% of that, so the channel's gain is roughly 30% low. Calibration is injected at the amplifier, so electrode impedance cannot explain it, and a 30% gain error is not acceptable.

**Objective:** Interpret calibration amplitude errors.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-010 — L4 Troubleshooting · technical

*Domain II Performing · Instrumentation & Display Settings · instrumentation · 2 reasoning step(s)*

During biological calibration (every channel Fp1-O2), all channels show eye blinks of the same polarity and similar size except channel 6, whose blink is the same size but inverted. What is the most likely cause?

- **A.** Fp1 has high impedance only in channel 6's connection
- **B.** Channel 6 has a different high-frequency filter setting
- **C.** Channel 6's amplifier is saturating during each blink
- **D.** The two inputs of channel 6 are reversed in the montage  ✅ *keyed answer*

**Explanation:** Identical input pairs should give identical output; an equal-amplitude but inverted waveform means input 1 and input 2 are swapped for that channel. Impedance or filter differences change size or shape, and saturation clips rather than inverts.

**Objective:** Use biological calibration to find input reversals.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-011 — L4 Troubleshooting · technical

*Domain II Performing · Instrumentation & Display Settings · instrumentation · 2 reasoning step(s)*

In a multi-day ICU recording, the 60-Hz notch filter is switched on from the start. What is its main technical drawback?

- **A.** It attenuates 15-25 Hz beta enough to change sedation assessment
- **B.** It shifts delta-band phase enough to create false phase reversals
- **C.** It lowers the gain of every channel by a fixed 3 dB at all frequencies
- **D.** It can hide rising impedance that 60-Hz pickup would otherwise reveal  ✅ *keyed answer*

**Explanation:** A notch attenuates a narrow band around 60 Hz. Its main cost is concealment: 60-Hz pickup is an early sign that an electrode is drying out or loosening. It has negligible effect on beta, delta phase or overall gain.

**Objective:** Weigh the trade-off of routine notch filtering.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-012 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Electrodes & Impedance · instrumentation · 2 reasoning step(s)*

Before a routine outpatient EEG, impedances are 3-4 kΩ at every electrode except O2, which reads 14 kΩ. What is the best course?

- **A.** Accept it, since a single high electrode only reduces amplitude
- **B.** Re-prepare O2 until it is below 5 kΩ and similar to the others  ✅ *keyed answer*
- **C.** Accept it, and raise the HFF to suppress any noise from O2
- **D.** Accept it, and use O2 only in referential derivations

**Explanation:** High and unbalanced impedance degrades common-mode rejection and invites 60-Hz and noise in every channel using O2. Standard practice is impedances below about 5 kΩ and balanced; workarounds do not fix the source.

**Objective:** Apply impedance standards before recording.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-013 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 3 reasoning step(s)*

At the peak of a sharp wave, referential values (against a quiet reference) are Fp1 −10 µV, F7 −40 µV, T3 −90 µV, T5 −60 µV, O1 −15 µV. In the chain Fp1-F7, F7-T3, T3-T5, T5-O1 (negative up), which pattern results?

- **A.** Up, up, down, down; negative phase reversal at T3
- **B.** Down, down, up, up; negative phase reversal at T5
- **C.** Down, up, down, up; two independent maxima present
- **D.** Down, down, up, up; negative phase reversal at T3  ✅ *keyed answer*

**Explanation:** Each channel = input 1 − input 2: Fp1-F7 = +30 (down), F7-T3 = +50 (down), T3-T5 = −30 (up), T5-O1 = −45 (up). The polarity change between F7-T3 and T3-T5 places the negative maximum at their shared electrode, T3.

**Objective:** Derive bipolar deflections from referential voltages.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-014 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 2 reasoning step(s)*

At one instant the referential values are F7 −80 µV and T3 −60 µV. What does channel F7-T3 display (negative up)?

- **A.** A 20-µV downward deflection
- **B.** A 140-µV upward deflection
- **C.** A 20-µV upward deflection  ✅ *keyed answer*
- **D.** A 140-µV downward deflection

**Explanation:** F7 − T3 = −80 − (−60) = −20 µV. Input 1 more negative than input 2 deflects upward. 140 µV comes from adding instead of subtracting.

**Objective:** Apply the differential amplifier rule to referential data.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-015 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 2 reasoning step(s)*

A generalized 3-Hz spike-and-wave burst measures about 250 µV in an ear-referenced montage but only 30-40 µV in a transverse bipolar chain of adjacent electrodes. What best explains the difference?

- **A.** Bipolar channels are displayed at a lower gain than referential ones
- **B.** The ear reference adds volume-conducted ECG to the generalized burst
- **C.** Neighbouring electrodes have nearly equal potentials, which cancel  ✅ *keyed answer*
- **D.** Short interelectrode distances shorten the effective time constant

**Explanation:** A widespread field gives similar voltages at neighbouring electrodes, so bipolar subtraction cancels most of it (in-phase cancellation). The referential channel compares each site with a distant, relatively quiet ear. Gain and time constant are unchanged by montage.

**Objective:** Explain amplitude differences between montages for broad fields.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-016 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 2 reasoning step(s)*

A negative sharp wave produces deflections pointing toward each other in F3-C3 / C3-P3 (longitudinal) and in T3-C3 / C3-Cz (transverse). Where is the maximum?

- **A.** Between C3 and P3, left centroparietal
- **B.** At Cz, the vertex
- **C.** At C3, the left central region  ✅ *keyed answer*
- **D.** At T3, the left mid-temporal region

**Explanation:** Both chains show a negative phase reversal at the same shared electrode, C3. A centroparietal maximum would reverse between C3-P3 and P3-O1; Cz or T3 maxima would reverse at those electrodes in the transverse chain.

**Objective:** Localise by intersecting phase reversals in two directions.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-017 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 2 reasoning step(s)*

A left-hemisphere discharge involves about half of all electrodes. In an average-reference montage, right-hemisphere channels show small deflections of opposite polarity at the same moment. How should these be interpreted?

- **A.** As independent right-sided positive discharges occurring simultaneously
- **B.** As volume conduction of the discharge across the midline to the right
- **C.** As the discharge entering the average, not as right-sided activity  ✅ *keyed answer*
- **D.** As high impedance across the right-hemisphere electrodes at that moment

**Explanation:** When a large share of electrodes is involved, the average itself carries the discharge. Uninvolved channels (input − average) then show an inverted copy. Volume conduction would give same-polarity, decaying deflections.

**Objective:** Recognise average-reference contamination by widespread activity.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-018 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 3 reasoning step(s)*

During stage N2 sleep, a Cz-referenced montage shows sharply contoured transients of opposite polarity in nearly every channel, largest at the frontal poles and occipital electrodes. What is the best explanation and remedy?

- **A.** Generalized positive sharp transients; annotate them as abnormal
- **B.** Occipital POSTS spreading forward; review the same montage at 10 µV/mm
- **C.** Vertex waves contaminating the Cz reference; use ear or bipolar montages  ✅ *keyed answer*
- **D.** Frontal eye-movement artifact; add infraorbital electrodes to confirm

**Explanation:** Vertex waves are maximal at Cz. With Cz as the reference, every channel (X − Cz) shows the reference's negativity inverted, most visibly where X is far from the vertex and quiet. A non-vertex reference shows their true distribution.

**Objective:** Recognise reference contamination by vertex sleep transients.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-019 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 2 reasoning step(s)*

A sharp wave is maximal at F7 in the standard 10-20 array. After T1 is added, T1 shows a larger negativity than F7. What is the most likely generator?

- **A.** The anterior basal temporal region  ✅ *keyed answer*
- **B.** The inferior frontal gyrus
- **C.** The left frontal pole
- **D.** The left mid-temporal neocortex

**Explanation:** F7 often records anterior temporal activity. T1 lies lower and closer to the anterior/basal temporal lobe, so a larger negativity at T1 than at F7 favours an anterior basal temporal source over a frontal one; a mid-temporal source would be maximal at T3.

**Objective:** Use supplementary electrodes to refine temporal localisation.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-020 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 2 reasoning step(s)*

A negative spike shows a phase reversal at T4 in the right temporal chain, but in the transverse chain the T4-C4 channel is nearly flat while C4-Cz deflects upward (negative up). Where is the field maximum?

- **A.** At T4 alone, with C4 uninvolved
- **B.** At Cz, the vertex
- **C.** Spanning T4 and C4 about equally  ✅ *keyed answer*
- **D.** At C4 alone, with T4 uninvolved

**Explanation:** T4-C4 near zero means T4 and C4 are about equally negative. C4-Cz upward means C4 (input 1) is more negative than Cz, so the field falls off toward the vertex. Together with the longitudinal phase reversal at T4, the maximum spans T4 and C4 rather than either electrode alone.

**Objective:** Combine longitudinal and transverse chains to define a broad field.

**References (verify):** ACNS Guideline 6: A Proposal for Standard Montages to Be Used in Clinical EEG (Acharya et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-021 — L5 Montage/Localization · montage

*Domain II Performing · Montages & Referencing · montage-localization · 2 reasoning step(s)*

With each eye blink, channel Fp1-F3 deflects downward (negative up). What does this indicate about the potential at Fp1?

- **A.** Fp1 becomes positive relative to F3 as the cornea turns upward  ✅ *keyed answer*
- **B.** Fp1 becomes negative relative to F3 as the retina turns upward
- **C.** F3 becomes positive relative to Fp1 from frontalis contraction
- **D.** Fp1 impedance rises briefly as the eyelid closes over it

**Explanation:** The cornea is positive relative to the retina. During a blink the eyes roll up (Bell's phenomenon), bringing the cornea toward Fp1, which becomes positive; Fp1 − F3 is then positive, deflecting downward.

**Objective:** Derive eye-artifact polarity from the corneoretinal dipole.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-022 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

60-Hz interference appears in every channel referenced to A2, but in none of the bipolar channels. What is the most likely cause?

- **A.** A disconnected patient ground electrode
- **B.** High or unbalanced impedance at A2 itself  ✅ *keyed answer*
- **C.** A nearby device radiating 60-Hz fields
- **D.** An incorrectly configured notch filter

**Explanation:** Only derivations that include A2 are affected, which localises the fault to A2. A ground fault or environmental source would also affect bipolar channels; the notch filter acts on all channels.

**Objective:** Localise interference using the montages that show it.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-023 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 3 reasoning step(s)*

Intermittent 60-Hz interference appears in every channel containing T5, worse when the patient turns the head, although T5's measured impedance is 3 kΩ. What is the most likely cause?

- **A.** A damaged T5 lead wire or connector  ✅ *keyed answer*
- **B.** High impedance at the patient ground
- **C.** Unbalanced impedance between T5 and O1
- **D.** A failing 60-Hz notch filter circuit

**Explanation:** Affected channels share T5, and the impedance at rest is good, so the electrode-skin junction is not the problem. Movement-dependent interference points to an intermittent break or poor shielding in that lead or its connector. A ground fault would affect all channels.

**Objective:** Distinguish electrode from lead-wire faults.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-024 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

In a supine adult, 0.25-Hz slow waves appear in posterior channels whose electrodes rest on the pillow, in phase with a respiratory belt showing 15 breaths per minute. What is the most likely source?

- **A.** Sweat artifact from posterior scalp electrodes
- **B.** Posterior slow waves of youth
- **C.** Occipital intermittent rhythmic delta activity
- **D.** Respiration-related head and electrode movement  ✅ *keyed answer*

**Explanation:** 15 breaths/min is 0.25 Hz, and the waves are phase-locked to respiration and confined to electrodes pressed on the pillow. Sweat artifact is slow but not locked to breathing; the cerebral patterns have different frequencies and contexts.

**Objective:** Use timing correlation to identify respiratory artifact.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-025 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

Irregular 30-70 Hz activity is maximal over both temporal regions, increases when the jaw is clenched and decreases when the patient lets the mouth hang slightly open. What is it?

- **A.** Temporalis and masseter muscle artifact  ✅ *keyed answer*
- **B.** Medication-induced beta activity
- **C.** A breach rhythm over both temporal regions
- **D.** 60-Hz interference from the room

**Explanation:** Very fast, irregular activity over the temporal muscles that changes with jaw tension is myogenic. Drug-related beta is rhythmic, frontally predominant and 18-25 Hz; a breach rhythm needs a skull defect; mains interference is a fixed 60 Hz.

**Objective:** Separate muscle artifact from cerebral fast activity.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-026 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

Rhythmic 3-4 Hz activity at Fp1 and Fp2 appears only while the eyes are closed and the eyelids are visibly fluttering. Which step best determines whether it is ocular?

- **A.** Review the segment again with the HFF set at 70 Hz
- **B.** Begin hyperventilation to see whether the activity builds up
- **C.** Add infraorbital electrodes and look for reversed polarity  ✅ *keyed answer*
- **D.** Switch to a Cz-referenced montage for the frontal channels

**Explanation:** Ocular potentials reverse polarity across the eye, so electrodes below the eye show the opposite polarity to Fp1/Fp2; cerebral frontal delta does not. Filter changes, HV or a reference change do not establish the source.

**Objective:** Use supplementary electrodes to confirm ocular artifact.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-027 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

Channel Fp1-F3 is nearly flat. In a referential montage, Fp1 and F3 each show normal-amplitude activity with identical waveforms. What is the most likely explanation?

- **A.** A failed amplifier in the Fp1-F3 channel
- **B.** High impedance at the Fp1 electrode
- **C.** Focal cortical suppression beneath F3
- **D.** An electrolyte bridge between Fp1 and F3  ✅ *keyed answer*

**Explanation:** Identical waveforms at two electrodes mean they are short-circuited together, so their bipolar difference is near zero. An amplifier fault would not make the referential traces identical; cortical suppression would lower F3's referential amplitude.

**Objective:** Confirm an electrolyte bridge with referential data.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-028 — L5 Montage/Localization · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

At the peak of a transient, average-reference values are T4 −220 µV, F8 −6 µV, T6 −4 µV, C4 −3 µV. What is the best interpretation?

- **A.** A right mid-temporal spike with an unusually steep field
- **B.** Electrode artifact at T4, because there is no field to neighbours  ✅ *keyed answer*
- **C.** A right temporal sharp wave that has contaminated the average
- **D.** A lateral rectus spike recorded at the T4 electrode

**Explanation:** Cerebral discharges have a field that falls off gradually across neighbouring electrodes. A 220-µV deflection with almost nothing 2-3 cm away is not physiological and indicates an electrode event at T4. Lateral rectus spikes appear at F7/F8 with eye movements.

**Objective:** Use field distribution to separate artifact from cerebral transients.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-029 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

During photic stimulation, sharp transients appear at Fp1 and Fp2 with zero latency to each flash, persist with the eyes covered, and disappear when the electrodes are shielded from the lamp. What are they?

- **A.** A photomyogenic response of frontal muscles
- **B.** A photoparoxysmal response
- **C.** Photic driving of a frontal rhythm
- **D.** Photoelectric artifact at Fp1 and Fp2  ✅ *keyed answer*

**Explanation:** Light striking the electrode produces a photoelectric potential with no latency, independent of the eyes, and abolished by shielding. Photomyogenic responses have a short latency and need visible muscle activity; cerebral responses do not depend on electrode shielding.

**Objective:** Identify photoelectric artifact during photic stimulation.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-030 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Event Monitoring & Emergency Response · artifact · 2 reasoning step(s)*

In an ICU recording, sharp transients recur every 1.5 s in a single channel. When the infusion pump rate is changed, their rate changes accordingly. What are they?

- **A.** Infusion-related artifact  ✅ *keyed answer*
- **B.** Lateralized periodic discharges
- **C.** Electrode pops from a drying electrode
- **D.** ECG artifact

**Explanation:** A rhythm that follows the pump setting is external. LPDs have a field across several electrodes and do not track equipment; pops are irregular; ECG artifact follows the heart rate.

**Objective:** Correlate ICU artifacts with equipment.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-031 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

Small sharp transients appear in several left-sided referential channels at regular 0.8-s intervals, each coinciding exactly with the QRS complex. What are they?

- **A.** Cardiac ECG artifact  ✅ *keyed answer*
- **B.** Pulse artifact
- **C.** Lateralized periodic discharges
- **D.** Ballistocardiographic movement

**Explanation:** Exact coincidence with the QRS identifies the cardiac electrical field. Pulse and ballistocardiographic artifacts are mechanical and follow the QRS by roughly 200-300 ms with slower waveforms; LPDs are not locked to the heartbeat.

**Objective:** Use QRS timing to identify ECG artifact.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-032 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Artifacts & Troubleshooting · artifact · 2 reasoning step(s)*

While the patient reads, brief spiky potentials appear at F7 and F8 at the onset of each horizontal saccade. What are they?

- **A.** Bifrontal epileptiform spikes
- **B.** Lateral rectus muscle spikes  ✅ *keyed answer*
- **C.** Lambda waves
- **D.** Electrode pops at F7 and F8

**Explanation:** Lateral rectus contraction at the start of horizontal saccades produces brief spikes at F7/F8. Lambda waves also follow saccades during reading but are occipital, positive and slower; pops are not locked to eye movements.

**Objective:** Recognise myogenic eye-movement spikes.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-033 — L4 Troubleshooting · troubleshooting

*Domain II Performing · Event Monitoring & Emergency Response · artifact · 2 reasoning step(s)*

During LTM, bitemporal bursts of very fast activity with rhythmic slow components recur at 1-2 Hz for 20 s while video shows the patient eating. There is no change in frequency over time, and the background is unchanged afterwards. What is this?

- **A.** A bitemporal electrographic seizure
- **B.** Rhythmic midtemporal theta of drowsiness
- **C.** Glossokinetic artifact
- **D.** Chewing-related muscle artifact  ✅ *keyed answer*

**Explanation:** Rhythmic bursts of muscle activity at the chewing rate, synchronous with jaw movement on video and without evolution or postictal change, are chewing artifact. Glossokinetic artifact is slow without muscle bursts; a seizure evolves; RMTD is a drowsy theta pattern.

**Objective:** Use video and evolution to exclude seizures.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-034 — L4 Troubleshooting · clinical

*Domain II Performing · Activation Procedures · activation · 2 reasoning step(s)*

A 35-year-old performs vigorous hyperventilation for 3 minutes and reports perioral tingling; no slowing appears. What is the best course?

- **A.** Repeat HV for a further 5 minutes to try to provoke buildup
- **B.** Annotate the HV portion as technically inadequate and repeat it
- **C.** Ask the patient to breath-hold afterwards to raise the CO2
- **D.** Accept it and annotate the effort; absent buildup is common in adults  ✅ *keyed answer*

**Explanation:** Tingling indicates effective hypocapnia. Many healthy adults show little or no buildup, so the response is acceptable once effort is documented. Extending or repeating HV adds little, and breath-holding is not an activation procedure.

**Objective:** Judge adequacy of hyperventilation in adults.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-035 — L6 Clinical Integration · clinical

*Domain II Performing · Activation Procedures · activation · 2 reasoning step(s)*

A 9-year-old who skipped breakfast shows unusually marked HV buildup that persists for over a minute after HV ends. Which factor most likely exaggerated it?

- **A.** Caffeine taken earlier that morning
- **B.** Mild sleep deprivation the night before
- **C.** Low blood glucose after an overnight fast  ✅ *keyed answer*
- **D.** A carbohydrate-rich snack before testing

**Explanation:** Hypoglycaemia enhances and prolongs the slowing response to hyperventilation; this is why patients are advised to eat before an EEG. A recent meal reduces, rather than increases, the effect.

**Objective:** Identify factors that alter the HV response.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-036 — L4 Troubleshooting · clinical

*Domain II Performing · Activation Procedures · activation · 2 reasoning step(s)*

During 18-Hz photic stimulation, a rhythmic 9-Hz occipital response appears, time-locked to the flashes, and stops when the train ends. What is it?

- **A.** A photoparoxysmal response at half the flash rate
- **B.** A photomyogenic response of the frontal muscles
- **C.** Photic driving at a subharmonic, a normal response  ✅ *keyed answer*
- **D.** Photoelectric artifact from the photic lamp

**Explanation:** Occipital responses locked to the flash train at the flash rate or a harmonic/subharmonic (here half) are photic driving. A photoparoxysmal response is epileptiform; photomyogenic and photoelectric responses are frontal and not rhythmic occipital waves.

**Objective:** Recognise harmonic and subharmonic photic driving.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-037 — L4 Troubleshooting · clinical

*Domain II Performing · Special Protocols (Neonatal/ICU/ECI) · age-dependent · 2 reasoning step(s)*

For a routine EEG on a term neonate in the NICU, which recording duration best captures the information needed for interpretation?

- **A.** At least 60 minutes, covering a full sleep-wake cycle  ✅ *keyed answer*
- **B.** 20 minutes, matching a routine adult outpatient study
- **C.** 30 minutes, stopping as soon as quiet sleep is seen
- **D.** 10 minutes after settling, to minimise movement artifact

**Explanation:** Neonatal interpretation depends on seeing the expected states (wake, active and quiet sleep) and their cycling, which typically requires about an hour. Shorter recordings risk missing quiet sleep or state change.

**Objective:** Plan neonatal recording duration.

**References (verify):** ACNS Guideline on Continuous EEG Monitoring in Neonates (Shellhaas et al., J Clin Neurophysiol 2011)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-038 — L6 Clinical Integration · clinical

*Domain II Performing · Special Protocols (Neonatal/ICU/ECI) · clinical-integration · 2 reasoning step(s)*

Which of the following prevents an EEG from being used to support a determination of electrocerebral inactivity?

- **A.** A sensitivity of 2 µV/mm for part of the recording
- **B.** A recording duration of 35 minutes
- **C.** Interelectrode distances of 10 cm or more
- **D.** A core temperature of 30 °C at the time of recording  ✅ *keyed answer*

**Explanation:** Marked hypothermia (like sedative drug effects) is a confounder that can suppress EEG activity, so inactivity under those conditions cannot be attributed to brain death. The other three are required or recommended technical conditions.

**Objective:** Recognise physiological confounders of ECI.

**References (verify):** ACNS Guideline 3: Minimum Technical Standards for EEG Recording in Suspected Cerebral Death (Stecker et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-039 — L6 Clinical Integration · clinical

*Domain II Performing · Event Monitoring & Emergency Response · clinical-integration · 2 reasoning step(s)*

A patient on a high-dose propofol infusion shows 1-2 s bursts of mixed activity separated by 5-s periods below 10 µV. How should this pattern be classified?

- **A.** Electrocerebral inactivity with intermittent artifact
- **B.** Burst-suppression, likely medication-related  ✅ *keyed answer*
- **C.** Generalized periodic discharges
- **D.** A normal discontinuous sleep pattern

**Explanation:** Alternating bursts and suppression (<10 µV) during anaesthetic infusion is burst-suppression, typically dose-related. ECI requires no cerebral activity; GPDs are discharges with regular intervals over a continuous background; this is not a normal adult sleep pattern.

**Objective:** Classify medication-related burst-suppression.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-040 — L6 Clinical Integration · clinical

*Domain II Performing · Event Monitoring & Emergency Response · clinical-integration · 2 reasoning step(s)*

A comatose patient after cardiac arrest shows diffuse 9-Hz activity, most prominent frontally, unreactive to noxious stimulation. What is this pattern?

- **A.** A normal, widely distributed posterior alpha rhythm
- **B.** Mu rhythm spreading over the frontal regions
- **C.** Medication-induced beta activity of sedation
- **D.** Alpha coma, an unreactive alpha-frequency pattern  ✅ *keyed answer*

**Explanation:** Diffuse, often frontally predominant alpha-frequency activity that does not react to stimulation in a comatose patient is alpha coma. Normal alpha is posterior and reactive to eye opening; mu is central; drug beta is faster.

**Objective:** Recognise alpha coma by distribution and reactivity.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-041 — L3 Application/Calculation · technical

*Domain I Pre-Study · EEG Electrode Placement: The International 10–20 System · calculation · 2 reasoning step(s)*

The preauricular-to-preauricular distance measured over the vertex is 38 cm. How far above the left preauricular point should C3 be marked along this line?

- **A.** 7.6 cm
- **B.** 11.4 cm  ✅ *keyed answer*
- **C.** 3.8 cm
- **D.** 19.0 cm

**Explanation:** T3 is at 10% (3.8 cm) above the preauricular point and C3 a further 20%, i.e. 30% = 11.4 cm. 19.0 cm (50%) is Cz; 7.6 cm (20%) is not a standard position.

**Objective:** Calculate coronal 10-20 positions.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-042 — L3 Application/Calculation · technical

*Domain I Pre-Study · EEG Electrode Placement: The International 10–20 System · calculation · 2 reasoning step(s)*

Head circumference measured through Fpz, T3 and Oz is 56 cm. Measured along this line, how far from Fpz is F7?

- **A.** 5.6 cm
- **B.** 11.2 cm
- **C.** 2.8 cm
- **D.** 8.4 cm  ✅ *keyed answer*

**Explanation:** Fp1 lies 5% of the circumference (2.8 cm) from Fpz and F7 a further 10% (5.6 cm), i.e. 15% = 8.4 cm. 2.8 cm is Fp1; 11.2 cm (20%) is not a standard position.

**Objective:** Calculate circumferential 10-20 positions.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-043 — L6 Clinical Integration · clinical

*Domain I Pre-Study · Neuroanatomy for EEG Localization · clinical-integration · 3 reasoning step(s)*

A patient has clonic jerking of the right face and hand with preserved awareness. If a scalp ictal correlate is present, where is it most likely to be maximal?

- **A.** The left central (C3) region  ✅ *keyed answer*
- **B.** The right central (C4) region
- **C.** The left occipital (O1) region
- **D.** The left anterior temporal (F7/T1) region

**Explanation:** Clonic activity of the right face and hand arises from the contralateral (left) primary motor cortex, which lies under the left central electrodes. Temporal or occipital onsets produce other semiology.

**Objective:** Predict electrode localisation from seizure semiology.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-044 — L4 Troubleshooting · clinical

*Domain I Pre-Study · History Taking & Documentation Basics · activation · 2 reasoning step(s)*

An EEG is ordered with photic stimulation. Which item in the pre-study history most changes how photic stimulation should be performed?

- **A.** Migraine with a visual aura triggered by bright light
- **B.** Seizures triggered by flashing lights or screens  ✅ *keyed answer*
- **C.** Cataract surgery on both eyes last year
- **D.** Red-green colour blindness since childhood

**Explanation:** A history of photically triggered seizures means a photoparoxysmal or clinical response is likely, so the technologist prepares to stop stimulation immediately and observes closely. The other items do not change the procedure in the same way.

**Objective:** Use history to plan activation procedures.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-045 — L4 Troubleshooting · clinical

*Domain I Pre-Study · Age-Related EEG Development · age-dependent · 2 reasoning step(s)*

A 40-week PMA infant shows continuous mixed-frequency activity, irregular respiration, rapid eye movements and occasional facial twitches. Which state is this?

- **A.** Active sleep  ✅ *keyed answer*
- **B.** Quiet sleep
- **C.** Indeterminate sleep
- **D.** Wakefulness with eyes closed

**Explanation:** Active (REM-like) sleep at term has continuous activity, irregular breathing, rapid eye movements and small movements. Quiet sleep at term shows tracé alternant or continuous slow activity with regular breathing and no REMs.

**Objective:** Identify neonatal sleep states from combined signs.

**References (verify):** ACNS Guideline on Continuous EEG Monitoring in Neonates (Shellhaas et al., J Clin Neurophysiol 2011)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-046 — L6 Clinical Integration · clinical

*Domain I Pre-Study · Age-Related EEG Development · age-dependent · 2 reasoning step(s)*

An infant at 46 weeks PMA shows frequent delta brushes during sleep. How should this be regarded?

- **A.** Normal, because delta brushes are most abundant near term
- **B.** Dysmature, since delta brushes should largely have gone  ✅ *keyed answer*
- **C.** Ictal, because delta brushes represent brief seizures
- **D.** Artifactual, because neonatal montages exaggerate them

**Explanation:** Delta brushes are most abundant in premature infants (around 32-35 weeks PMA), decline toward term and have largely disappeared by about 44 weeks PMA. Their persistence suggests dysmaturity. They are a developmental pattern, not ictal or artifactual.

**Objective:** Use maturational timetables to judge neonatal patterns.

**References (verify):** ACNS Guideline on Continuous EEG Monitoring in Neonates (Shellhaas et al., J Clin Neurophysiol 2011)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-047 — L6 Clinical Integration · clinical

*Domain I Pre-Study · Age-Related EEG Development · age-dependent · 2 reasoning step(s)*

A 78-year-old has a 9-Hz posterior rhythm and sporadic left mid-temporal theta seen only during drowsiness, without sharp features. How should this be regarded?

- **A.** It indicates a left temporal lesion that requires urgent imaging
- **B.** It can be within normal limits for age when sporadic and drowsy-only  ✅ *keyed answer*
- **C.** It represents wicket spikes requiring epileptiform classification
- **D.** It indicates a diffuse encephalopathy of moderate severity

**Explanation:** Occasional temporal (often left) theta in drowsiness is common in older adults with a normal background and is not by itself evidence of a lesion. Wicket waves are arciform 6-11 Hz trains; a normal 9-Hz posterior rhythm argues against diffuse encephalopathy.

**Objective:** Avoid over-reading age-related temporal slowing.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-048 — L6 Clinical Integration · clinical

*Domain I Pre-Study · Normal EEG Rhythms · normal-variant · 2 reasoning step(s)*

A relaxed adult has a notched 4.5-Hz posterior rhythm that blocks with eye opening and alternates with a normal 9-Hz alpha rhythm. What is it?

- **A.** Slow alpha variant, a normal subharmonic of alpha  ✅ *keyed answer*
- **B.** Posterior slowing indicating encephalopathy
- **C.** Occipital intermittent rhythmic delta activity
- **D.** Posterior slow waves of youth

**Explanation:** A notched rhythm at half the alpha frequency that reacts like alpha and alternates with it is the slow alpha variant. Encephalopathic slowing replaces rather than alternates with normal alpha; OIRDA is rhythmic delta in children; PSWY are delta waves fused with alpha in youths.

**Objective:** Recognise alpha variants by frequency relationship and reactivity.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-049 — L6 Clinical Integration · clinical

*Domain I Pre-Study · Age-Related EEG Development · normal-variant · 2 reasoning step(s)*

A 14-year-old shows posterior delta waves fused with alpha, blocking with eye opening and smaller than about 120% of the alpha amplitude. How should these be described?

- **A.** Focal occipital slowing
- **B.** Posterior slow waves of youth, a normal finding  ✅ *keyed answer*
- **C.** Occipital intermittent rhythmic delta activity
- **D.** Lambda waves

**Explanation:** In children and adolescents, delta waves fused with the alpha rhythm, reacting like it and not excessively large, are posterior slow waves of youth. Focal slowing does not block with eye opening; OIRDA is rhythmic delta trains; lambda waves occur with visual scanning.

**Objective:** Distinguish PSWY from abnormal posterior slowing.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-050 — L6 Clinical Integration · clinical

*Domain I Pre-Study · Age-Related EEG Development · normal-variant · 2 reasoning step(s)*

A drowsy 4-year-old shows bursts of high-amplitude generalized 3-5 Hz rhythmic waves without spikes that resolve as sleep deepens. What is this?

- **A.** Generalized spike-and-wave of absence epilepsy
- **B.** Generalized rhythmic delta of encephalopathy
- **C.** Posterior slow waves of youth
- **D.** Hypnagogic hypersynchrony, a normal drowsy pattern  ✅ *keyed answer*

**Explanation:** Paroxysmal high-amplitude rhythmic theta/delta at drowsiness onset in young children, without spikes and confined to drowsiness, is hypnagogic hypersynchrony. Absence discharges contain spikes; encephalopathic GRDA is not state-limited in this way; PSWY are posterior and awake.

**Objective:** Recognise normal paediatric drowsy patterns.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-051 — L6 Clinical Integration · clinical

*Domain I Pre-Study · Normal EEG Rhythms · normal-abnormal · 2 reasoning step(s)*

Six months after a right frontal craniotomy, higher-amplitude, sharply contoured 6-11 Hz activity is present over the right frontocentral region. What is the most likely interpretation?

- **A.** Right frontal epileptiform activity
- **B.** Mu rhythm of the right hemisphere
- **C.** A breach rhythm over the skull defect  ✅ *keyed answer*
- **D.** Wicket waves of the right temporal region

**Explanation:** A skull defect lets higher-frequency activity reach the scalp with less attenuation, producing a higher-amplitude, sharply contoured rhythm over the defect. It should not be over-read as epileptiform. Mu is central and reactive to movement; wicket waves are temporal.

**Objective:** Account for skull defects when interpreting sharp activity.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-052 — L3 Application/Calculation · clinical

*Domain III Post-Study · Sleep & Graphoelements · calculation · 2 reasoning step(s)*

In a 30-s epoch with sleep spindles present, 1-Hz waves above 75 µV occupy 4.8 s. How should the epoch be staged?

- **A.** N2, because slow waves occupy under 20% of it  ✅ *keyed answer*
- **B.** N3, because the slow waves exceed 75 µV
- **C.** N3, because slow waves occupy over 15%
- **D.** N1, because spindles alone do not define N2

**Explanation:** 4.8/30 = 16%. N3 requires slow-wave activity (0.5-2 Hz, >75 µV) in at least 20% of the epoch. Amplitude alone is not enough, and spindles in this context support N2.

**Objective:** Apply the 20% slow-wave rule to staging.

**References (verify):** AASM Manual for the Scoring of Sleep and Associated Events (current version)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-053 — L4 Troubleshooting · clinical

*Domain III Post-Study · Sleep & Graphoelements · normal-abnormal · 2 reasoning step(s)*

An adult shows low-voltage mixed-frequency activity, sawtooth waves, rapid eye movements and the lowest chin EMG of the night. Which state is this?

- **A.** Wakefulness with eyes open
- **B.** REM sleep, stage R  ✅ *keyed answer*
- **C.** Stage N1 sleep
- **D.** Arousal from N2 sleep

**Explanation:** Sawtooth waves, rapid eye movements and minimal chin EMG together define REM. Wakefulness and arousals have higher EMG; N1 has slow rolling eye movements and vertex waves.

**Objective:** Combine EEG, EOG and EMG features to identify REM.

**References (verify):** AASM Manual for the Scoring of Sleep and Associated Events (current version)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-054 — L6 Clinical Integration · clinical

*Domain III Post-Study · EEG Syndromes Classification & Diagnostic Yield · clinical-integration · 3 reasoning step(s)*

A child with several seizure types has a slow background, awake 1.5-2 Hz generalized spike-and-wave, and bursts of generalized 10-20 Hz fast activity in sleep. Which syndrome best fits?

- **A.** Childhood absence epilepsy
- **B.** Lennox-Gastaut syndrome  ✅ *keyed answer*
- **C.** Juvenile myoclonic epilepsy
- **D.** Epileptic encephalopathy with spike-wave activation in sleep

**Explanation:** Slow (<2.5 Hz) spike-and-wave, generalized paroxysmal fast activity in sleep and a slow background with multiple seizure types characterise Lennox-Gastaut syndrome. CAE has 3-Hz discharges and a normal background; JME has fast polyspike-wave; EE-SWAS is defined by near-continuous sleep activation.

**Objective:** Match EEG features to epilepsy syndromes.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-055 — L6 Clinical Integration · clinical

*Domain III Post-Study · EEG Syndromes Classification & Diagnostic Yield · clinical-integration · 2 reasoning step(s)*

An adolescent with early-morning jerks has a normal background, irregular 4-6 Hz generalized polyspike-and-wave, and a photoparoxysmal response. Which syndrome best fits?

- **A.** Juvenile myoclonic epilepsy  ✅ *keyed answer*
- **B.** Childhood absence epilepsy
- **C.** Lennox-Gastaut syndrome
- **D.** Self-limited epilepsy with centrotemporal spikes

**Explanation:** Morning myoclonus, fast irregular polyspike-and-wave and photosensitivity with a normal background are typical of JME. CAE has regular 3-Hz spike-wave in younger children; LGS has slow spike-wave and a slow background; SeLECTS has centrotemporal spikes.

**Objective:** Recognise JME from clinical and EEG features.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-056 — L6 Clinical Integration · clinical

*Domain III Post-Study · EEG Syndromes Classification & Diagnostic Yield · clinical-integration · 3 reasoning step(s)*

A 7-year-old has sleep-activated sharp waves that are negative at C4/T4 and simultaneously positive at Fp2/F4, with a normal background. What does this pattern most suggest?

- **A.** A right frontal epileptogenic focus
- **B.** Self-limited epilepsy with centrotemporal spikes  ✅ *keyed answer*
- **C.** Eye-movement artifact during sleep
- **D.** A generalized epilepsy with frontal predominance

**Explanation:** Centrotemporal negativity with simultaneous frontal positivity forms a horizontal (tangential) dipole, typical of the sleep-activated discharges of SeLECTS. A frontal focus would be negative frontally; eye artifact is confined to frontopolar/orbital sites; generalized discharges are bilateral.

**Objective:** Use dipole orientation to characterise centrotemporal discharges.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-057 — L6 Clinical Integration · clinical

*Domain III Post-Study · EEG Syndromes Classification & Diagnostic Yield · clinical-integration · 3 reasoning step(s)*

A 6-year-old with language regression has spike-and-wave activity in 27 of 30 sampled 10-s segments of NREM sleep, and much less in wakefulness. What does this pattern indicate?

- **A.** Benign sleep-activated centrotemporal spikes
- **B.** ESES/CSWS pattern of sleep activation  ✅ *keyed answer*
- **C.** Hypsarrhythmia with sleep activation
- **D.** Lennox-Gastaut syndrome with sleep activation

**Explanation:** Spike-wave in about 90% of NREM sleep with marked sleep activation and cognitive or language regression is the ESES/CSWS picture (epileptic encephalopathy with spike-wave activation in sleep). Benign centrotemporal spikes are far less continuous; hypsarrhythmia occurs in infants; LGS has a different pattern.

**Objective:** Quantify sleep activation and relate it to regression.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-058 — L6 Clinical Integration · clinical

*Domain III Post-Study · EEG Syndromes Classification & Diagnostic Yield · clinical-integration · 2 reasoning step(s)*

An 8-month-old with clusters of flexor spasms shows chaotic high-amplitude slowing with multifocal spikes. Each spasm coincides with a sudden diffuse voltage attenuation. How should this be described?

- **A.** Burst-suppression of an early infantile epilepsy
- **B.** Generalized polyspike-wave of a myoclonic epilepsy
- **C.** Hypsarrhythmia with electrodecremental responses  ✅ *keyed answer*
- **D.** Electrocerebral inactivity interrupted by artifact

**Explanation:** Chaotic high-voltage slowing with multifocal spikes is hypsarrhythmia, and the diffuse attenuation accompanying each spasm is an electrodecremental response. Burst-suppression has true suppressions between bursts; myoclonic polyspike-wave occurs on a normal background.

**Objective:** Describe infantile spasms EEG correctly.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-059 — L3 Application/Calculation · clinical

*Domain III Post-Study · Focal vs Generalized EEG Patterns · calculation · 2 reasoning step(s)*

Twelve lateralized sharp discharges occur at regular intervals within a 10-s epoch. How should they be described in ACNS terms?

- **A.** LPDs at about 1.2 Hz  ✅ *keyed answer*
- **B.** LPDs at about 0.8 Hz
- **C.** LRDA at about 1.2 Hz
- **D.** LPDs at about 12 Hz

**Explanation:** 12 discharges per 10 s = 1.2 per second. Discrete discharges recurring at regular intervals are periodic discharges (LPDs), not rhythmic delta. 0.8 Hz inverts the ratio; 12 Hz ignores the 10-s epoch.

**Objective:** Calculate and name periodic pattern frequency.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-060 — L6 Clinical Integration · clinical

*Domain III Post-Study · Ictal EEG Patterns & Seizure Evolution · clinical-integration · 2 reasoning step(s)*

In a critically ill patient, LPDs accelerate to 3 Hz and remain above 2.5 Hz for 12 s, without clinical signs. How should this be classified?

- **A.** LPDs with plus features only
- **B.** A brief potentially ictal rhythmic discharge
- **C.** An ictal-interictal continuum pattern only
- **D.** A definite electrographic seizure  ✅ *keyed answer*

**Explanation:** ACNS 2021: epileptiform discharges averaging more than 2.5 Hz for at least 10 s define an electrographic seizure, regardless of clinical signs. BIRDs last under 10 s; plus features and the ictal-interictal continuum describe patterns that do not meet seizure criteria.

**Objective:** Apply ACNS electrographic seizure criteria.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-061 — L6 Clinical Integration · clinical

*Domain III Post-Study · Ictal EEG Patterns & Seizure Evolution · clinical-integration · 2 reasoning step(s)*

Over the last 60 minutes, electrographic seizures add up to 14 minutes; the longest lasts 4 minutes. How should this be classified?

- **A.** Electrographic status epilepticus  ✅ *keyed answer*
- **B.** Recurrent seizures not meeting status criteria
- **C.** Ictal-interictal continuum pattern
- **D.** Brief potentially ictal rhythmic discharges

**Explanation:** ACNS 2021: electrographic status epilepticus is seizure activity for 10 or more continuous minutes, or for a total of at least 20% of any 60-minute period. 14 of 60 minutes is about 23%, so it qualifies even though no single seizure lasts 10 minutes.

**Objective:** Apply the burden criterion for electrographic status epilepticus.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-062 — L6 Clinical Integration · clinical

*Domain III Post-Study · Ictal EEG Patterns & Seizure Evolution · clinical-integration · 2 reasoning step(s)*

A critically ill patient has focal runs of sharply contoured 5-Hz rhythmic activity lasting 4-6 s each, without evolution. What is the best ACNS term?

- **A.** Brief potentially ictal rhythmic discharges  ✅ *keyed answer*
- **B.** An electrographic seizure of brief duration
- **C.** Lateralized periodic discharges, focal
- **D.** Lateralized rhythmic delta activity

**Explanation:** Focal rhythmic activity faster than 4 Hz lasting under 10 s is a BIRD. It does not meet the 10-s seizure criterion; LPDs are discrete periodic discharges; LRDA is in the delta range.

**Objective:** Name brief rhythmic ICU patterns correctly.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-063 — L6 Clinical Integration · clinical

*Domain III Post-Study · Encephalopathy Differentials & EEG Patterns · documentation · 2 reasoning step(s)*

Rhythmic discharges repeatedly appear within seconds of suctioning or examination in an ICU patient. Which annotation is essential for correct classification of this pattern?

- **A.** The exact time and type of each stimulus  ✅ *keyed answer*
- **B.** The infusion rate of each sedative every hour
- **C.** Electrode impedance values every hour
- **D.** The patient's temperature at each discharge

**Explanation:** Classifying a pattern as stimulus-induced (SI-, formerly SIRPIDs) requires showing it reliably follows stimulation, which is only possible if each stimulus is time-stamped. The other annotations are useful but cannot establish the relationship.

**Objective:** Annotate stimulation to support stimulus-induced pattern classification.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-064 — L6 Clinical Integration · clinical

*Domain III Post-Study · Encephalopathy Differentials & EEG Patterns · clinical-integration · 2 reasoning step(s)*

An encephalopathic patient has intermittent, bilaterally synchronous 2-Hz rhythmic delta, maximal frontally. What is the ACNS 2021 term?

- **A.** Frontally predominant lateralized rhythmic delta
- **B.** Frontally predominant generalized rhythmic delta  ✅ *keyed answer*
- **C.** Frontally predominant generalized periodic discharges
- **D.** Bilateral independent periodic discharges

**Explanation:** Bilaterally synchronous rhythmic delta is GRDA; a frontal maximum is a modifier ('frontally predominant'; historically FIRDA). LRDA is one-sided; GPDs and BIPDs are periodic discharges, not rhythmic delta.

**Objective:** Use ACNS terminology for rhythmic delta.

**References (verify):** ACNS Standardized Critical Care EEG Terminology: 2021 Version (Hirsch et al., J Clin Neurophysiol 2021)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-065 — L6 Clinical Integration · clinical

*Domain III Post-Study · Ictal EEG Patterns & Seizure Evolution · clinical-integration · 3 reasoning step(s)*

During LTM, a patient has a brief hypermotor event arising from sleep. The EEG is obscured by muscle and shows no clear ictal change. How should this be regarded?

- **A.** It excludes an epileptic seizure, as no EEG change is seen
- **B.** It does not exclude a frontal seizure; correlate with video  ✅ *keyed answer*
- **C.** It was a sleep arousal, because it arose from sleep
- **D.** It should be re-reviewed with the LFF raised to 5 Hz

**Explanation:** Frontal lobe seizures, especially mesial or orbital onsets, often show little or obscured scalp change, and hypermotor semiology from sleep is typical of them. Video semiology and stereotypy are essential; filtering does not reveal deep activity.

**Objective:** Recognise limits of scalp EEG for frontal seizures.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-066 — L6 Clinical Integration · clinical

*Domain III Post-Study · Focal vs Generalized EEG Patterns · clinical-integration · 2 reasoning step(s)*

After a focal seizure with unclear onset, the post-ictal EEG shows left temporal delta for 2 minutes while the right side is normal. What does this most likely indicate?

- **A.** It supports right-sided onset by contralateral suppression
- **B.** It has no lateralizing value after focal seizures
- **C.** It supports seizure onset in the left hemisphere  ✅ *keyed answer*
- **D.** It indicates a structural lesion of the left temporal lobe

**Explanation:** Focal post-ictal slowing usually occurs on the side of seizure onset and is a useful lateralizing sign. It is transient and does not by itself indicate a structural lesion.

**Objective:** Use post-ictal slowing for lateralization.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-067 — L4 Troubleshooting · troubleshooting

*Domain III Post-Study · Infection Control & Equipment Cleaning · safety · 2 reasoning step(s)*

After recording a patient on contact precautions for Clostridioides difficile, which hand hygiene and cleaning approach is most appropriate?

- **A.** Soap-and-water hand washing; sporicidal cleaning of equipment  ✅ *keyed answer*
- **B.** Alcohol hand rub; equipment cleaned with a quaternary wipe
- **C.** Alcohol hand rub only, since gloves were worn throughout
- **D.** Soap-and-water hand washing; equipment cleaned at day's end

**Explanation:** C. difficile spores resist alcohol, so hand washing with soap and water is needed, and equipment requires a sporicidal disinfectant (per institutional policy) before reuse. Delaying cleaning risks transmission.

**Objective:** Apply spore-specific infection control.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-068 — L4 Troubleshooting · troubleshooting

*Domain IV Ethics/Professional · Patient Safety & Professional Standards · safety · 2 reasoning step(s)*

Midway through a recording, you feel a tingle when touching the EEG machine's metal casing. What is the most appropriate action?

- **A.** Finish the study, then tag it and report it to biomedical engineering
- **B.** Move it to another outlet, continue, and report it afterwards
- **C.** Disconnect the patient ground, continue, and report it afterwards
- **D.** Stop, disconnect the patient, and report it to biomedical engineering  ✅ *keyed answer*

**Explanation:** A perceptible tingle indicates leakage current or a ground fault, a direct shock hazard to patient and staff. Recording stops, the patient is disconnected and the unit is removed from service until checked. Continuing in any form keeps the patient exposed.

**Objective:** Respond to suspected electrical leakage.

**References (verify):** ACNS Guideline 1: Minimum Technical Requirements for Performing Clinical Electroencephalography (Sinha et al., J Clin Neurophysiol 2016)

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-069 — L4 Troubleshooting · clinical

*Domain IV Ethics/Professional · EEG Documentation & Reporting Standards · documentation · 2 reasoning step(s)*

You realise that an event time written in the paper technologist log is wrong. How should it be corrected?

- **A.** Cover it with correction fluid and write the correct time neatly
- **B.** Rewrite the whole log page so the record stays easy to read
- **C.** Leave the entry and explain the error verbally at handover
- **D.** Strike through once, write the correction, then initial and date it  ✅ *keyed answer*

**Explanation:** Medical record corrections must keep the original entry legible and show who changed it and when. Obscuring or rewriting entries destroys the audit trail; verbal notes leave the record wrong.

**Objective:** Correct records without destroying the audit trail.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-070 — L4 Troubleshooting · clinical

*Domain IV Ethics/Professional · Ethics, Confidentiality & Professional Conduct · professional · 2 reasoning step(s)*

A colleague is admitted to the epilepsy monitoring unit. You are not part of their care team but your login can open their recordings. What should you do?

- **A.** Open the recording to reassure them about their results
- **B.** Not open their record or recordings unless assigned to their care  ✅ *keyed answer*
- **C.** Open it only after the reading physician has issued a report
- **D.** Open it if the colleague gives you verbal permission

**Explanation:** Access to health information is limited to what your role requires (minimum necessary). Technical access, a finished report or an informal verbal request does not create a work-related need.

**Objective:** Apply role-based access to patient information.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-071 — L4 Troubleshooting · clinical

*Domain IV Ethics/Professional · Ethics, Confidentiality & Professional Conduct · professional · 2 reasoning step(s)*

You want to share an unusual EEG image for teaching on social media, with names, dates and record numbers removed. What is the appropriate approach?

- **A.** Freely, because the names, dates and record numbers are removed
- **B.** Only in a closed technologists' group, without needing approval
- **C.** Freely, since privacy duties end once the patient has died
- **D.** Only with institutional approval, after checking for identifiers  ✅ *keyed answer*

**Explanation:** Rare findings, timestamps, facility details or context can still identify a patient, and privacy obligations continue after death. Institutional policy and approval apply even to closed groups.

**Objective:** Handle educational use of patient data appropriately.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-072 — L4 Troubleshooting · troubleshooting

*Domain IV Ethics/Professional · Patient Safety & Professional Standards · safety · 2 reasoning step(s)*

You need to apply collodion electrodes in an ICU room where the patient is receiving supplemental oxygen. What is the safest approach?

- **A.** Turn the patient's oxygen off while applying and drying the collodion
- **B.** Use paste only, because collodion is prohibited wherever oxygen is used
- **C.** Dry each electrode with an electric heat gun to shorten exposure
- **D.** Ventilate well and keep collodion and acetone away from oxygen and heat  ✅ *keyed answer*

**Explanation:** Collodion and acetone are flammable and their vapours need ventilation; the risk is managed by keeping them away from oxygen sources and heat. Stopping prescribed oxygen harms the patient, collodion is not universally prohibited, and heat guns add an ignition source.

**Objective:** Use flammable materials safely in oxygen-rich settings.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-073 — L4 Troubleshooting · clinical

*Domain IV Ethics/Professional · Patient Safety & Professional Standards · safety · 2 reasoning step(s)*

Antiseizure medication is about to be tapered in the epilepsy monitoring unit. Which preparation is most important?

- **A.** The patient was sleep-deprived the night before admission
- **B.** Seizure and fall precautions plus a rescue-medication order  ✅ *keyed answer*
- **C.** Video recording is paused overnight to protect privacy
- **D.** Electrode impedances are scheduled to be checked once daily

**Explanation:** Tapering increases the risk of seizures, including clusters and convulsions, so safety measures and a rescue plan must be ready. Pausing video loses the events being sought; impedance checks matter but are not the priority.

**Objective:** Prepare EMU safety before medication withdrawal.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-074 — L6 Clinical Integration · clinical

*Domain IV Ethics/Professional · Patient Safety & Professional Standards · clinical-integration · 3 reasoning step(s)*

During a routine outpatient EEG, you see 40 s of evolving rhythmic right temporal activity while the patient keeps talking normally. What should you do?

- **A.** Document it and leave it for the routine physician report
- **B.** Document it and tell the patient that a seizure was recorded
- **C.** Test and document responsiveness; notify the reading physician now  ✅ *keyed answer*
- **D.** Document it and notify the ordering office by the end of the day

**Explanation:** An unrecognised electrographic seizure in an outpatient is an urgent finding: responsiveness is tested and documented during the event, and the reading physician is notified promptly per policy. Telling the patient a diagnosis is outside scope; routine reporting delays action.

**Objective:** Handle incidental electrographic seizures as urgent findings.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

## ch-b2-075 — L4 Troubleshooting · clinical

*Domain IV Ethics/Professional · Ethics, Confidentiality & Professional Conduct · professional · 2 reasoning step(s)*

During an EMU admission, a patient asks you to let them skip a dose of antiseizure medication 'to help get a seizure'. What is the most appropriate response?

- **A.** Explain that doses change only on physician order; inform the team  ✅ *keyed answer*
- **B.** Agree, since medication withdrawal is the purpose of this admission
- **C.** Agree, but document the patient's request in the technologist log
- **D.** Suggest taking half the dose instead, and then inform the care team

**Explanation:** Medication changes, including tapering for EMU studies, are made only under physician orders. The technologist does not authorise or adjust doses but passes the request to the care team.

**Objective:** Stay within scope regarding medication.

**Review:** ☐ VERIFIED ☐ NEEDS_REVISION ☐ REJECTED — notes: 

---

