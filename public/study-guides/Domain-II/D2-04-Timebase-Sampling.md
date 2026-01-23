# NeuroTrace Study Guide

**Domain:** Domain II – EEG Procedures & Instrumentation  
**Section:** Timebase & Sampling Rate  
**Style:** Applied, exam-focused, point-form

---

## 1. Core Concepts (Must Know)

### Timebase Function
- **Timebase controls horizontal time scaling** of EEG display
- Determines how much time is shown per unit of horizontal space
- Measured in mm/sec (millimeters per second)
- Affects visual appearance of waveforms

### Sampling Rate Function
- **Sampling rate controls temporal accuracy** in digital EEG
- Determines how often the signal is recorded (measured in Hz)
- Must be adequate to capture all frequencies accurately
- Inadequate sampling causes aliasing (false patterns)

### Digital EEG Requirements
- **Digital EEG requires adequate sampling** to avoid distortion
- Must sample at least 2× the highest frequency (Nyquist principle)
- Inadequate sampling creates false low-frequency activity
- Sampling rate is a critical technical parameter

### Key Principle
- **Timebase affects appearance; sampling rate affects accuracy**
- Timebase changes visual spacing (display only)
- Sampling rate changes signal capture (affects accuracy)
- Both must be appropriate for accurate interpretation

### Practical Application
- Set appropriate timebase for frequency measurement
- Ensure adequate sampling rate for all frequencies
- Verify sampling rate before interpreting fast activity
- Understand that timebase and sampling are independent settings

---

## 2. EEG Timebase (Paper Speed)

### Measurement
- Measured in **mm/sec** (millimeters per second)
- Controls horizontal spacing of waveforms
- Standard setting: 30 mm/sec
- Alternative settings: 15 mm/sec (compressed), 60 mm/sec (expanded)

### Common Settings

#### 30 mm/sec (Standard)
- **Most common setting** for routine EEG
- Allows accurate frequency measurement
- Good balance of detail and screen space
- Standard for most clinical recordings

#### 15 mm/sec (Compressed View)
- **Compressed view** (half the standard)
- Shows more time in same space
- Waves appear narrower
- May obscure fast activity
- Used for screening or overview

#### 60 mm/sec (Expanded View)
- **Expanded view** (double the standard)
- Shows less time in same space
- Waves appear wider
- Better for frequency measurement
- Used for detailed analysis

### Effects of Faster Timebase (Higher mm/sec)

#### Visual Effects
- **Waves appear wider** (more horizontal space)
- **Easier frequency measurement** (more cycles visible)
- **Better detail** for fast activity
- **Less time** shown on screen

#### Clinical Use
- Frequency analysis
- Spike morphology evaluation
- Fast activity detection
- Detailed waveform analysis

### Effects of Slower Timebase (Lower mm/sec)

#### Visual Effects
- **Waves appear compressed** (less horizontal space)
- **Fast activity may be obscured** (less detail)
- **More time** shown on screen
- **Harder frequency measurement** (fewer cycles visible)

#### Clinical Use
- Screening view
- Long-term monitoring overview
- Compressed display for review
- Not ideal for frequency analysis

### ABRET Trap
- **Mistaking timebase changes for frequency changes**
- Faster timebase makes waves appear wider (not faster frequency)
- Slower timebase makes waves appear narrower (not slower frequency)
- Always verify timebase before frequency interpretation

---

## 3. Sampling Rate (Digital EEG)

### Definition
- Measured in **Hz** (samples per second)
- Determines how often signal is recorded
- Must be adequate for all frequencies present
- Critical for accurate digital EEG

### Nyquist Principle
- **Must be at least 2× highest frequency** (Nyquist principle)
- Minimum sampling rate = 2 × highest frequency
- Example: To record 70 Hz → sampling rate ≥ 140 Hz
- Inadequate sampling causes aliasing

### Typical Settings

#### Standard Sampling Rates
- **200-256 Hz:** Standard for routine EEG
- **500 Hz:** High-resolution recordings
- **1000 Hz:** Very high-resolution (research, special studies)
- **< 200 Hz:** May cause aliasing (not recommended)

#### Frequency Requirements
- **EEG frequencies:** 0.5-70 Hz (typical range)
- **Minimum sampling:** 140 Hz (for 70 Hz)
- **Recommended:** 200-256 Hz (safety margin)
- **High-frequency activity:** May need 500+ Hz

### Clinical Application
- **Routine EEG:** 200-256 Hz adequate
- **Fast activity:** May need higher sampling
- **Muscle artifact:** High frequency, needs adequate sampling
- **ICU monitoring:** May need higher sampling for fast patterns

---

## 4. Aliasing

### Definition
- **Occurs when sampling rate is too low**
- Fast signals appear as slower activity
- False low-frequency pattern created
- Digital EEG artifact, not pathology

### Mechanism
- Sampling too slow to capture fast activity
- Fast signal "folds back" into lower frequencies
- Creates false pattern at lower frequency
- Cannot be corrected after recording

### Clinical Consequence
- **Muscle artifact may mimic cerebral slowing**
- Fast muscle activity aliased to slow delta
- May be mistaken for pathological slowing
- Can lead to misdiagnosis

### Example
- **Muscle artifact:** 100 Hz activity
- **Sampling rate:** 50 Hz (too low)
- **Result:** Aliased to appear as 0-25 Hz (false slowing)
- **Interpretation error:** Mistaken for cerebral slowing

### ABRET Emphasis
- **Aliasing is a digital EEG artifact, not pathology**
- Must recognize aliasing vs true slowing
- Always verify sampling rate adequacy
- Understand that aliasing cannot be corrected

### Prevention
- Use adequate sampling rate (≥ 200 Hz)
- Verify sampling rate before recording
- Recognize aliasing patterns
- Understand Nyquist principle

---

## 5. Timebase vs Sampling (Comparison Table)

| Parameter | Affects | Common Error | Clinical Impact |
|-----------|---------|--------------|-----------------|
| **Timebase** | Visual spacing | Misreading frequency | Display only, not signal |
| **Sampling rate** | Signal accuracy | Aliasing | Affects signal capture |
| **Both** | Interpretation | False patterns | Can cause misdiagnosis |

### Key Distinctions

#### Timebase
- **Display setting only** (doesn't affect signal)
- Changes visual appearance
- Can be changed during review
- Doesn't affect signal accuracy

#### Sampling Rate
- **Affects signal capture** (critical for accuracy)
- Determines what frequencies can be recorded
- Cannot be changed after recording
- Must be set correctly before recording

### ABRET Application
- Given waveform appearance → consider timebase
- Given false patterns → consider sampling rate
- Understand that both affect interpretation
- Know when each is the problem

---

## 6. Common ABRET Exam Traps

### Trap 1: Confusing Timebase with Sensitivity
- **Reality:** These are independent settings
- **Timebase:** Horizontal scaling (mm/sec)
- **Sensitivity:** Vertical scaling (µV/mm)
- Don't confuse horizontal and vertical scaling

### Trap 2: Assuming Default Sampling is Always Adequate
- **Reality:** Default sampling may not be adequate for all studies
- Fast activity may require higher sampling
- ICU EEG may need higher sampling
- Always verify sampling rate for study type

### Trap 3: Interpreting Aliased Muscle Artifact as Slowing
- **Reality:** Aliased muscle can look like cerebral slowing
- Must recognize aliasing patterns
- Verify sampling rate before diagnosing slowing
- Understand that aliasing is artifact, not pathology

### Trap 4: Forgetting Nyquist Principle
- **Reality:** Must sample at 2× highest frequency
- Inadequate sampling causes aliasing
- Cannot record frequencies above Nyquist limit
- Always verify sampling rate meets Nyquist requirement

### Trap 5: Changing Timebase to "Fix" Frequency
- **Reality:** Timebase doesn't change frequency
- Timebase only changes visual appearance
- Cannot fix frequency problems with timebase
- Must understand that timebase is display only

---

## 7. Clinical Correlation

### Accurate Frequency Measurement
- **Requires correct timebase** (typically 30 mm/sec)
- Cannot measure frequency accurately with wrong timebase
- Faster timebase makes measurement easier
- Always verify timebase before frequency analysis

### Pediatric EEG
- **May require higher sampling rates** (fast activity common)
- Pediatric EEG often has more fast activity
- Need adequate sampling to avoid aliasing
- Standard 200-256 Hz usually adequate

### ICU EEG
- **Often demands higher temporal resolution**
- Fast patterns common (seizures, status)
- May need higher sampling (500 Hz)
- Continuous monitoring requires adequate sampling

### Best Practice
- Set appropriate timebase at start (30 mm/sec standard)
- Verify sampling rate meets Nyquist requirement
- Document timebase and sampling in technical report
- Recognize aliasing patterns
- Understand that timebase and sampling are independent

---

## 8. Case-Based Example

### Scenario
**Clinical Setting:** Routine EEG recording  
**EEG Finding:** Rhythmic delta activity during patient movement  
**Clinical Concern:** Possible encephalopathy or seizure  
**Pattern:** 2-3 Hz rhythmic slowing, maximum frontal

### Hidden Issue
- **Sampling rate too low** (100 Hz, inadequate)
- Patient movement creates muscle artifact (50-100 Hz)
- Muscle artifact aliased to appear as 2-3 Hz delta
- False pattern mistaken for cerebral slowing

### Correct Action
1. **Increase sampling rate** (to 200-256 Hz)
2. **Reassess pattern** (should see true muscle artifact)
3. **Verify sampling adequacy** (meets Nyquist for all frequencies)
4. **Document** sampling rate and correction
5. **Interpret** only with adequate sampling

### Teaching Point
- **Always consider sampling adequacy before diagnosing slowing**
- Rhythmic slowing during movement suggests artifact
- Aliased muscle can mimic cerebral slowing
- Good technique prevents misinterpretation

### ABRET Application
- Given rhythmic slowing → check sampling rate first
- Given movement-related pattern → consider aliasing
- Understand that aliasing is artifact, not pathology
- Know when to increase sampling rate

---

## 9. Exam Readiness Checklist

Use this checklist to verify your understanding:

- [ ] Can explain timebase effects (horizontal scaling, mm/sec)
- [ ] Can define sampling rate (Hz, samples per second)
- [ ] Can identify aliasing (false low-frequency from inadequate sampling)
- [ ] Can apply Nyquist principle (sampling ≥ 2× highest frequency)
- [ ] Understand that timebase affects appearance, not signal
- [ ] Know that sampling rate affects accuracy, not just appearance
- [ ] Recognize that aliasing is artifact, not pathology
- [ ] Understand that timebase and sampling are independent
- [ ] Know typical settings (30 mm/sec timebase, 200-256 Hz sampling)
- [ ] Can identify ABRET exam traps related to timebase and sampling

---

## 10. Internal Cross-Links

### Workflow
- **Digital EEG Settings:** Timebase and sampling are part of digital settings
- **Instrumentation Overview:** Both are instrumentation parameters
- **Artifacts & Troubleshooting:** Aliasing is a technical artifact

### Patterns
- **Frequency Analysis:** Requires correct timebase for measurement
- **Muscle Artifact:** May be aliased if sampling inadequate
- **Fast Activity:** Requires adequate sampling to avoid aliasing

### Cases
- **Aliasing simulations:** Cases teaching aliasing recognition
- **Apparent rhythmic slowing:** Cases involving aliased artifact
- **ICU EEG monitoring:** Cases requiring high sampling rates

### Quizzes
- **Timebase & sampling MCQs:** Questions on settings, effects, Nyquist
- **Aliasing identification:** Questions on recognizing aliasing
- **Technical parameters:** Questions on appropriate settings

---

## Study Tips

1. **Memorize Nyquist:** Sampling ≥ 2× highest frequency
2. **Understand timebase:** 30 mm/sec standard, affects visual spacing only
3. **Learn aliasing:** Inadequate sampling creates false low-frequency
4. **Practice recognition:** Given pattern, identify if aliasing possible
5. **Remember independence:** Timebase and sampling are separate settings
6. **Know typical settings:** 30 mm/sec timebase, 200-256 Hz sampling
7. **ABRET focus:** Expect questions on aliasing, Nyquist, timebase effects

---

**End of Study Guide**

*For additional practice, complete quiz questions tagged: timebase, sampling-rate, aliasing, nyquist, frequency*







