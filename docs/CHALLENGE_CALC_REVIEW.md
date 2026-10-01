# Core calculations set: expert review sheet

`server/src/data/challenge/abret-challenge-calc.json` (24 items, AI-drafted, all `UNREVIEWED`).
Each item tests one of the exam-realistic calculation types; distractors are classic errors
(decimal slips, missing 2π, wrong display speed, 50% instead of 70%, forgetting to double for Nyquist).

Mark each item VERIFIED, NEEDS_REVISION or REJECTED.

| ID | Level | Competency | Stem (abridged) | Keyed answer | Verdict |
|---|---|---|---|---|---|
| ch-calc-001 | L3 | technical | At a sensitivity of 7 µV/mm, a posterior rhythm measures 9 mm peak to peak. What is its amplitude? | About 63 µV | |
| ch-calc-002 | L3 | technical | A 100-µV spike is displayed first at 10 µV/mm and then at 15 µV/mm. How tall is it on the page at each sett... | 10 mm, then about 6.7 mm | |
| ch-calc-003 | L4 | troubleshooting | Mid-recording, sensitivity is changed from 7 to 5 µV/mm but the change is not annotated. A reviewer measure... | 98 µV reported; 70 µV true | |
| ch-calc-004 | L3 | technical | At a display speed of 30 mm/s, 7 complete waves of a posterior rhythm span 21 mm. What is its frequency? | 10 Hz | |
| ch-calc-005 | L4 | troubleshooting | The display is running at 15 mm/s. A rhythm shows 6 complete waves in 30 mm. What is its true frequency, an... | 3 Hz; they would report 6 Hz | |
| ch-calc-006 | L3 | technical | At 30 mm/s, a transient measures 1.8 mm at its base. What is its duration, and how is it classified by dura... | About 60 ms; a spike | |
| ch-calc-007 | L4 | technical | At 30 mm/s, transient A is 5 mm wide at its base and transient B is 1.5 mm wide. How are they classified by... | A is a sharp wave; B is a spike | |
| ch-calc-008 | L3 | technical | A recording's time constant is 0.1 s. Which low-frequency filter setting does this correspond to? | About 1.6 Hz | |
| ch-calc-009 | L4 | technical | The low-frequency filter is changed from 1 Hz to 0.3 Hz. What happens to the time constant? | It lengthens from about 0.16 s to about 0.53 s | |
| ch-calc-010 | L5 | troubleshooting | The montage label shows LFF 0.5 Hz. On the square-wave calibration, the trace decays to 37% of its initial ... | The actual LFF is about 1 Hz, not the 0.5 Hz shown | |
| ch-calc-011 | L3 | technical | A square-wave calibration step produces an initial deflection of 10 mm. The time constant is 0.3 s. About h... | About 3.7 mm | |
| ch-calc-012 | L3 | technical | The low-frequency filter is set at 1 Hz. A 1-Hz delta wave has a true amplitude of 150 µV. Approximately wh... | About 105 µV | |
| ch-calc-013 | L4 | technical | You want 0.5-Hz slow activity displayed at no less than about 70% of its true amplitude. What is the highes... | 0.5 Hz | |
| ch-calc-014 | L4 | technical | The high-frequency filter was left at 15 Hz throughout a study. A 15-Hz beta rhythm measures about 20 µV on... | About 28 µV | |
| ch-calc-015 | L3 | technical | Activity up to 100 Hz must be represented without aliasing. What is the theoretical minimum sampling rate? | Just over 200 Hz | |
| ch-calc-016 | L3 | technical | A digital EEG system samples at 256 Hz. What is the highest frequency it can represent without aliasing (it... | 128 Hz | |
| ch-calc-017 | L4 | technical | A system samples at 200 Hz. Which high-frequency (anti-aliasing) filter setting best protects against alias... | 70 Hz | |
| ch-calc-018 | L3 | technical | The nasion-to-inion distance is 34 cm. Measured along the midline, how far is Fpz from Cz? | 13.6 cm | |
| ch-calc-019 | L3 | technical | Head circumference measured through Fpz, T3 and Oz is 54 cm. Along this line, how far is T3 from Fpz? | 13.5 cm | |
| ch-calc-020 | L4 | troubleshooting | The preauricular-to-preauricular distance over the vertex is 36 cm. C3 has been marked 7.2 cm above the lef... | C3 is 3.6 cm too low; 20% was used instead of 30% | |
| ch-calc-021 | L4 | montage | At the peak of a sharp wave, referential values against a quiet reference are F8 −60 µV, T4 −100 µV and T6 ... | Down 40 µV, then up 60 µV | |
| ch-calc-022 | L5 | clinical | Generalized sharp discharges occur at 9 discharges in every 3 s and continue unchanged for 15 s. Using ACNS... | An electrographic seizure | |
| ch-calc-023 | L4 | clinical | Pages are 10 s long at 30 mm/s. An evolving rhythmic discharge begins 120 mm into page 4 and ends 60 mm int... | About 18 s, long enough for a seizure | |
| ch-calc-024 | L3 | troubleshooting | During a QA check, a 100-µV calibration signal is applied at 10 µV/mm. Every channel deflects 10 mm except ... | About 20% low | |

Existing items re-tagged `calc-beyond` (kept, down-weighted): ch-pilot-011 (alias folding),
ch-b2-004 (single-pole LFF gain), ch-b2-005 (single-pole HFF gain), ch-b2-007 (CMRR in dB).
