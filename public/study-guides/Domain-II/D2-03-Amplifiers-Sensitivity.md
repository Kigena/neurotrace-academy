# NeuroTrace Study Guide

**Domain:** Domain II – EEG Procedures & Instrumentation  
**Section:** Amplifiers & Sensitivity  
**Style:** Applied, point-form, ABRET-focused

---

## 1. Core Concepts (Must Know)

### Signal Characteristics
- EEG signals are **very small (microvolts)**
- Typical EEG amplitude: 10-100 µV
- Too small to display directly without amplification
- Require amplification for visualization and measurement

### Amplifier Function
- **Amplifiers increase signal amplitude** for display
- Make small signals visible on screen or paper
- Maintain signal fidelity (preserve waveform shape)
- Do not change the actual brain activity

### Sensitivity Definition
- **Sensitivity determines vertical scaling** of EEG traces
- Controls how large or small waveforms appear
- Expressed in **µV/mm** (microvolts per millimeter)
- Lower number = higher sensitivity = larger display

### Key Principle
- **Sensitivity affects appearance, not brain activity**
- Changing sensitivity changes display size, not signal
- Must distinguish display changes from true amplitude changes
- Always verify sensitivity before interpreting amplitude

### Practical Application
- Set appropriate sensitivity for patient age and state
- Document sensitivity settings in technical report
- Verify sensitivity before amplitude interpretation
- Understand that sensitivity is a display setting, not a measurement

---

## 2. EEG Amplifiers

### Function
- **Increase signal strength** (amplify microvolt signals)
- **Maintain signal fidelity** (preserve waveform characteristics)
- **Reject common-mode noise** (reduce interference)
- Allow measurement and display of small signals

### Important
- **EEG uses differential amplification**
- Compares signal between two electrodes
- Rejects signals common to both electrodes (noise)
- Amplifies difference between electrodes (cerebral activity)

### Amplifier Characteristics
- High input impedance (minimizes signal loading)
- High common-mode rejection ratio (CMRR)
- Low noise characteristics
- Wide frequency response (covers EEG frequency range)

### Clinical Relevance
- Good amplifiers essential for quality EEG
- Poor amplifiers introduce noise and distortion
- Digital systems have built-in amplifiers
- Amplifier quality affects diagnostic yield

---

## 3. Understanding Sensitivity (µV/mm)

### Definition
- **Sensitivity = microvolts per millimeter**
- Defines how many microvolts equal one millimeter of vertical display
- Lower number = higher sensitivity = larger waves
- Higher number = lower sensitivity = smaller waves

### Relationship
- **Higher sensitivity = smaller µV/mm value**
  - Example: 5 µV/mm = higher sensitivity
  - Waves appear larger on display
  - More detail visible

- **Lower sensitivity = larger µV/mm value**
  - Example: 20 µV/mm = lower sensitivity
  - Waves appear smaller on display
  - Less detail visible

### Sensitivity Table

| Sensitivity | Effect on Display | Use Case |
|-------------|------------------|----------|
| **5 µV/mm** | Larger waves | Low-amplitude activity, pediatric EEG |
| **7 µV/mm** | Standard | Adult routine EEG (typical default) |
| **10 µV/mm** | Smaller waves | High-amplitude activity, artifact reduction |
| **15-20 µV/mm** | Very small waves | Very high amplitude, screening view |

### Typical Settings
- **Adults:** 7-10 µV/mm (standard)
- **Pediatrics:** 5-7 µV/mm (lower due to smaller amplitudes)
- **Neonates:** 5 µV/mm or lower (very small amplitudes)
- **High-amplitude patterns:** 10-15 µV/mm (to fit on screen)

---

## 4. Effects of Changing Sensitivity

### Increasing Sensitivity (Lower µV/mm Value)

#### Effects
- **Waves appear larger** on display
- **Small activity more visible** (better detail)
- **Can exaggerate artifacts** (artifacts also appear larger)
- **May cause clipping** if amplitude too high

#### When to Use
- Low-amplitude EEG (low voltage)
- Pediatric EEG (smaller amplitudes)
- Detecting subtle abnormalities
- Evaluating low-amplitude patterns

#### ABRET Application
- Given low-voltage EEG → may need higher sensitivity
- Given subtle activity → increase sensitivity to see detail
- Understand that sensitivity change doesn't change signal

### Decreasing Sensitivity (Higher µV/mm Value)

#### Effects
- **Waves appear smaller** on display
- **Can obscure low-amplitude activity** (less detail)
- **Reduces artifact appearance** (artifacts also smaller)
- **Allows viewing high-amplitude patterns** (fits on screen)

#### When to Use
- High-amplitude patterns (spikes, seizures)
- Reducing artifact visibility
- Screening view of entire recording
- When activity is too large for display

#### ABRET Application
- Given high-amplitude activity → may need lower sensitivity
- Given artifact → decrease sensitivity to reduce artifact appearance
- Understand that sensitivity change doesn't change signal

### ABRET Trap
- **Mistaking sensitivity change for true amplitude change**
- EEG appears "better" but it's just sensitivity adjustment
- EEG appears "worse" but it's just sensitivity adjustment
- Always verify sensitivity before interpreting amplitude changes

---

## 5. Sensitivity vs Pathology

| Appearance | Possible Cause | Action |
|------------|----------------|--------|
| **Large waves** | High sensitivity (low µV/mm) | Check sensitivity setting |
| **Small waves** | Low sensitivity (high µV/mm) | Check sensitivity setting |
| **Apparent low voltage EEG** | Inappropriate sensitivity (too low) | Increase sensitivity and reassess |
| **Sudden amplitude change** | Sensitivity adjustment during recording | Verify sensitivity consistency |
| **True low voltage** | Pathological (with correct sensitivity) | Document as clinical finding |
| **True high amplitude** | Pathological (with correct sensitivity) | Document as clinical finding |

### Key Distinction
- **Display change:** Due to sensitivity setting
- **True change:** Due to cerebral activity
- **Must verify:** Sensitivity before interpreting amplitude
- **Document:** Sensitivity setting in technical report

### Clinical Application
- Low-voltage EEG diagnosis requires proper sensitivity
- High-amplitude patterns require appropriate sensitivity
- Sensitivity must be consistent for comparisons
- Always note sensitivity when reporting amplitude

---

## 6. Common ABRET Exam Traps

### Trap 1: Confusing Sensitivity with Gain
- **Reality:** These terms are related but not identical
- **Sensitivity:** Display scaling (µV/mm)
- **Gain:** Amplifier amplification factor
- In practice, often used interchangeably, but technically different
- ABRET may test understanding of distinction

### Trap 2: Interpreting Display Changes as Clinical Change
- **Reality:** Sensitivity change alters appearance, not signal
- EEG appears "improved" but it's just sensitivity increase
- EEG appears "worsened" but it's just sensitivity decrease
- Always verify sensitivity before clinical interpretation

### Trap 3: Ignoring Sensitivity During Comparisons
- **Reality:** Cannot compare amplitudes across different sensitivities
- Must use same sensitivity for valid comparison
- Different sensitivities make comparison invalid
- Always note sensitivity when comparing recordings

### Trap 4: Forgetting to Normalize Sensitivity Across Montages
- **Reality:** Sensitivity should be consistent across montages
- Different sensitivities in different montages cause confusion
- Standardize sensitivity for all montages
- Document sensitivity in technical report

### Trap 5: Assuming Sensitivity Doesn't Matter in Digital EEG
- **Reality:** Digital EEG still requires appropriate sensitivity
- Sensitivity affects display and interpretation
- Digital systems still need sensitivity settings
- Good technique essential regardless of system type

---

## 7. Clinical Correlation

### Low-Voltage EEG Diagnosis
- **Requires proper sensitivity** (typically 5-7 µV/mm)
- Cannot diagnose low voltage with inappropriate sensitivity
- Must verify sensitivity before making diagnosis
- Low-voltage EEG is a clinical finding, not a display artifact

### Pediatric EEG
- **Requires careful sensitivity selection** (typically 5 µV/mm)
- Pediatric amplitudes are smaller than adults
- Need higher sensitivity to see activity clearly
- Age-appropriate sensitivity essential for interpretation

### Sensitivity Adjustments During Recording
- **Often used during artifact evaluation**
- Increase sensitivity to see subtle activity
- Decrease sensitivity to reduce artifact appearance
- Document any sensitivity changes in technical report

### Best Practice
- Set appropriate sensitivity at start of recording
- Document sensitivity in technical report
- Verify sensitivity before amplitude interpretation
- Use consistent sensitivity for comparisons
- Note sensitivity changes during recording

---

## 8. Case-Based Example

### Scenario
**Clinical Setting:** Routine EEG recording  
**EEG Finding:** EEG suddenly appears low voltage  
**Previous Portion:** Normal amplitude activity  
**Clinical Concern:** Possible encephalopathy

### Hidden Issue
- **Sensitivity was decreased** during recording
- Sensitivity changed from 7 µV/mm to 15 µV/mm
- Activity still present but appears smaller
- Not a true clinical change, just display change

### Correct Action
1. **Restore prior sensitivity** (return to 7 µV/mm)
2. **Reassess amplitude** (should appear normal again)
3. **Verify consistency** (check sensitivity throughout recording)
4. **Document** sensitivity settings and any changes
5. **Interpret** amplitude only with correct sensitivity

### Teaching Point
- **Always verify sensitivity before interpreting amplitude**
- Sudden amplitude changes may be sensitivity adjustments
- Low-voltage appearance may be inappropriate sensitivity
- Good technique prevents misinterpretation

### ABRET Application
- Given amplitude change → check sensitivity first
- Given low-voltage appearance → verify sensitivity setting
- Understand that sensitivity affects display, not signal
- Know when sensitivity adjustment is appropriate

---

## 9. Exam Readiness Checklist

Use this checklist to verify your understanding:

- [ ] Can explain amplifier function (increase signal strength for display)
- [ ] Can define sensitivity (µV/mm - microvolts per millimeter)
- [ ] Can predict display changes with sensitivity adjustments
- [ ] Can avoid amplitude misinterpretation (verify sensitivity first)
- [ ] Understand that higher sensitivity = lower µV/mm value
- [ ] Know that sensitivity affects appearance, not brain activity
- [ ] Recognize that changing sensitivity doesn't change signal
- [ ] Understand that low-voltage EEG requires proper sensitivity
- [ ] Know that pediatric EEG requires careful sensitivity selection
- [ ] Can identify ABRET exam traps related to sensitivity

---

## 10. Internal Cross-Links

### Workflow
- **Instrumentation Overview:** Sensitivity is part of instrumentation settings
- **Filters & Time Constants:** Sensitivity works with filters for optimal display
- **Artifacts & Troubleshooting:** Sensitivity adjustments used in artifact evaluation

### Patterns
- **Low-Voltage EEG:** Requires proper sensitivity for diagnosis
- **High-Amplitude Activity:** May require lower sensitivity to fit on display
- **Amplitude Abnormalities:** Must verify sensitivity before interpretation

### Cases
- **Sensitivity-related interpretation errors:** Cases teaching sensitivity importance
- **Low-voltage EEG cases:** Cases requiring proper sensitivity
- **Artifact exaggeration:** Cases involving sensitivity and artifacts

### Quizzes
- **Amplifier & sensitivity MCQs:** Questions on function, settings, effects
- **Amplitude interpretation:** Questions on distinguishing display vs true changes
- **Technical settings:** Questions on appropriate sensitivity selection

---

## Study Tips

1. **Memorize the relationship:** Higher sensitivity = lower µV/mm = larger waves
2. **Understand the principle:** Sensitivity affects display, not signal
3. **Learn typical settings:** 7 µV/mm adults, 5 µV/mm pediatrics
4. **Practice prediction:** Given sensitivity change, predict display appearance
5. **Remember the trap:** Don't mistake sensitivity change for clinical change
6. **Always verify:** Check sensitivity before amplitude interpretation
7. **ABRET focus:** Expect questions on sensitivity effects and interpretation

---

**End of Study Guide**

*For additional practice, complete quiz questions tagged: amplifier, sensitivity, gain, amplitude, display*







