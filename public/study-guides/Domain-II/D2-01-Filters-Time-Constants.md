# NeuroTrace Study Guide

**Domain:** Domain II – EEG Instrumentation & Procedures  
**Section:** Filters & Time Constants  
**Format:** Point-form, exam-oriented  
**Tone:** Clinical, applied, ABRET-focused

---

## 1. Core Concepts (Must Know)

- EEG filters **attenuate** frequency components; they do not remove signals
- LFF and HFF are the primary EEG filters
- Time constant is mathematically related to LFF
- Digital EEG follows the same physiologic filter principles as analog EEG
- Filter settings affect waveform **appearance**, not the underlying signal
- Understanding filter effects is critical for accurate interpretation

---

## 2. Low-Frequency Filter (LFF)

### Purpose
- Controls display of slow activity (delta, slow theta)
- Prevents baseline drift and very slow artifacts

### Raising LFF
- **Attenuates slow waves**
- **Masks diffuse slowing** (HIGH-YIELD ABRET TRAP)
- Can falsely normalize EEG appearance
- Reduces delta and very slow theta activity
- May hide encephalopathic patterns

### Common Settings
- **Adults:** ~0.1–0.3 Hz
- **Pediatrics:** often lower (0.05–0.1 Hz) to preserve slow activity
- **ICU/Coma:** may need lower settings to detect slow patterns

### ABRET Trap
- **Masked encephalopathy due to high LFF**
- EEG appears "normal" but pathology is hidden
- Always verify LFF setting when assessing diffuse slowing

### Clinical Impact
- High LFF in encephalopathy → false-negative interpretation
- Pediatric EEGs especially vulnerable to LFF effects
- Always check filter settings before reporting "normal" background

---

## 3. High-Frequency Filter (HFF)

### Purpose
- Controls display of fast activity and spike sharpness
- Reduces high-frequency noise and muscle artifact

### Lowering HFF
- **Rounds spikes** (reduces sharpness)
- **Reduces epileptiform morphology**
- Attenuates beta and gamma activity
- May hide fast epileptiform discharges

### Raising HFF
- Preserves spike sharpness
- May increase muscle artifact visibility
- Better for detecting fast epileptiform activity

### Common Settings
- **Typical:** 35–70 Hz
- **Spike detection:** may use higher (70 Hz)
- **Artifact reduction:** may use lower (35 Hz)

### ABRET Trap
- **False-negative epileptiform interpretation** due to low HFF
- Rounded spikes may be missed or misinterpreted
- Always verify HFF when assessing for epileptiform activity

---

## 4. Time Constant (Conceptual)

### Relationship to LFF
- **Shorter time constant = higher LFF**
- **Longer time constant = better slow-wave preservation**
- Time constant and LFF describe the same phenomenon from different perspectives

### Key Concept
- LFF and time constant are inversely related
- Both control slow-wave attenuation
- Understanding one helps understand the other

### Practical Application
- Analog systems: time constant setting
- Digital systems: LFF setting (Hz)
- Both achieve the same result

---

## 5. Filter Effects vs True Pathology (Table)

| EEG Appearance | Technical Cause | Clinical Implication |
|----------------|----------------|----------------------|
| Loss of delta activity | LFF too high | May mask encephalopathy |
| Rounded spikes | HFF too low | May miss epileptiform activity |
| Excess fast activity | HFF too high OR muscle artifact | Need to differentiate |
| Apparent normalization | Improper filtering (LFF too high) | False-negative interpretation |
| Reduced spike amplitude | HFF too low | Epileptiform may be missed |
| Baseline appears "clean" | LFF too high | Slow pathology hidden |

### Critical Distinction
- **Technical distortion:** Caused by filter settings
- **True pathology:** Actual cerebral abnormality
- **ABRET expects:** Ability to differentiate these

---

## 6. Common ABRET Exam Traps

### Trap 1: Confusing Sensitivity with Filter Effects
- **Sensitivity** controls amplitude (µV/mm)
- **Filters** control frequency content
- These are independent settings
- Don't confuse amplitude changes with frequency filtering

### Trap 2: Assuming Digital EEG Compensates
- Digital EEG still requires correct filter settings
- "Automatic" settings may not be optimal
- Always verify filter values, even in digital systems

### Trap 3: Misattributing Filter Distortion to Clinical Improvement
- Patient appears "better" but it's just filter change
- Always check settings before attributing changes to clinical status
- Filter changes ≠ clinical improvement

### Trap 4: Thinking Photic Stimulation Affects Slow-Wave Interpretation
- Photic affects fast activity (beta/gamma)
- Does NOT affect slow-wave (delta/theta) interpretation
- LFF affects slow waves independently

### Trap 5: Not Verifying Settings
- Always check LFF/HFF before interpretation
- Settings may have been changed during recording
- Document filter settings in technical report

---

## 7. Clinical Correlation

### Diffuse Slowing Assessment
- **Requires correct LFF** (typically 0.1–0.3 Hz for adults)
- High LFF will mask diffuse slowing
- Always verify LFF when assessing encephalopathy

### Pediatric EEGs
- **Especially vulnerable** to filter effects
- Need lower LFF to preserve slow activity
- Pediatric norms include more slow activity

### Filter Misuse Consequences
- **Missed pathology:** High LFF hides encephalopathy
- **False positives:** Low HFF rounds normal variants
- **Incorrect interpretation:** Technical artifact mistaken for pathology

### Best Practice
- Verify filter settings at start of recording
- Document settings in technical report
- Re-check settings if EEG appears unexpectedly "normal"

---

## 8. Case-Based Example

### Scenario
**Clinical Setting:** Adult patient with altered mental status  
**EEG Finding:** Background appears normal, well-organized  
**Hidden Issue:** LFF set to 1.0 Hz (too high)

### What Happened
- Diffuse slowing was present but attenuated by high LFF
- EEG appeared "normal" due to filter artifact
- True pathology (encephalopathy) was masked

### Correct Action
1. **Lower LFF** to 0.1–0.3 Hz
2. **Reassess** background activity
3. **Verify** diffuse slowing is now visible
4. **Document** filter change and findings

### Teaching Point
- **Always verify settings** before interpretation
- Filter changes can dramatically alter EEG appearance
- "Normal" appearance may be technical artifact

---

## 9. Exam Readiness Checklist

Use this checklist to verify your understanding:

- [ ] Can explain the difference between LFF and HFF
- [ ] Can predict waveform distortion from filter changes
- [ ] Can identify filter-related artifacts
- [ ] Can differentiate technical distortion from true pathology
- [ ] Understand that raising LFF masks diffuse slowing
- [ ] Know that lowering HFF rounds spikes
- [ ] Recognize that filter settings must be verified
- [ ] Understand time constant relationship to LFF
- [ ] Can identify ABRET exam traps related to filters
- [ ] Know common filter settings for adults vs pediatrics

---

## 10. Internal Cross-Links

### Workflow
- **Instrumentation & Display Settings** (parent section)
- Related sections: Montages, Artifacts, Waveform Identification

### Patterns
- **Diffuse Slowing:** Requires correct LFF to visualize
- **Epileptiform Activity:** Requires correct HFF to detect sharp morphology
- **Normal Variants:** May be distorted by improper filtering

### Cases
- Filter-related interpretation errors
- Cases involving masked encephalopathy
- Technical artifact vs true pathology

### Quizzes
- Applied filter physics MCQs
- Predict waveform appearance from filter changes
- Identify filter-related artifacts
- ABRET-style filter trap questions

---

## Study Tips

1. **Memorize the traps:** High LFF masks slowing; Low HFF rounds spikes
2. **Practice prediction:** Given filter change, predict EEG appearance
3. **Verify settings:** Always check LFF/HFF before interpretation
4. **Clinical correlation:** Understand why filters matter for patient care
5. **ABRET focus:** Expect questions on filter effects and waveform distortion

---

**End of Study Guide**

*For additional practice, complete quiz questions tagged: lff, hff, time-constant, signal-distortion, abret-trap*







