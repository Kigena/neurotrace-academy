# Syndrome-Specific Image Upload Guide

This guide provides **unique image file names** for each syndrome, even if they share similar morphological features. Each syndrome should have its own distinct image to help learners differentiate between them.

## Image Naming Convention

All syndrome images should be saved to: `public/images/patterns/`

Format: `syndrome-{syndrome_id}.png`

---

## Complete Syndrome Image List

### Idiopathic Generalized Epilepsies (IGE)

| Syndrome | ID | Image File Name | Current Status |
|----------|-----|----------------|----------------|
| Childhood Absence Epilepsy (CAE) | `cae` | `syndrome-cae.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Juvenile Absence Epilepsy (JAE) | `jae` | `syndrome-jae.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Juvenile Myoclonic Epilepsy (JME) | `jme` | `syndrome-jme.png` | ✅ Already unique: jme-polyspike-wave.png |
| Epilepsy with GTC Alone (GTCA) | `gtca` | `syndrome-gtca.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Eye Closure Sensitivity Epilepsy | `eye_closure_sensitivity` | `syndrome-eye-closure-sensitivity.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Absence with Eyelid Myoclonus (Jeavons) | `jeavons` | `syndrome-jeavons.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Idiopathic Generalized Epilepsy (IGE) | `ige` | `syndrome-ige.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Atypical Absence | `atypical_absence` | `syndrome-atypical-absence.png` | ⚠️ Currently sharing: slow-spike-wave.png |

### Developmental and Epileptic Encephalopathies

| Syndrome | ID | Image File Name | Current Status |
|----------|-----|----------------|----------------|
| Ohtahara Syndrome (EIEE) | `ohtahara` | `syndrome-ohtahara.png` | ⚠️ Currently sharing: burst-suppression.png |
| Early Myoclonic Encephalopathy (EME) | `eme` | `syndrome-eme.png` | ⚠️ Currently sharing: burst-suppression.png |
| Dravet Syndrome | `dravet` | `syndrome-dravet.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Benign Myoclonic Epilepsy of Infancy (BMEI) | `bmei` | `syndrome-bmei.png` | ⚠️ Currently sharing: polyspike-wave.png |
| West Syndrome (Infantile Spasms) | `west_syndrome` | `syndrome-west-syndrome.png` | ✅ Already unique: hypsarrhythmia.png |
| ESES/CSWS | `eses_csws` | `syndrome-eses-csws.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Landau-Kleffner Syndrome | `landau_kleffner` | `syndrome-landau-kleffner.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Lennox-Gastaut Syndrome (LGS) | `lgs` | `syndrome-lgs.png` | ⚠️ Currently sharing: slow-spike-wave.png |
| Doose Syndrome (MAE) | `doose_mae` | `syndrome-doose-mae.png` | ⚠️ Currently sharing: polyspike-wave.png |
| Angelman Syndrome | `angelman` | `syndrome-angelman.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Rett Syndrome | `rett` | `syndrome-rett.png` | ⚠️ Currently sharing: 3-hz-generalized-spike-wave.png |
| Lissencephaly/Band Heterotopia | `lissencephaly` | `syndrome-lissencephaly.png` | ⚠️ Currently sharing: slow-spike-wave.png |

### Idiopathic Focal Epilepsies

| Syndrome | ID | Image File Name | Current Status |
|----------|-----|----------------|----------------|
| Benign Rolandic Epilepsy (BRE) | `bre` | `syndrome-bre.png` | ⚠️ Currently sharing: focal-spikes-temporal.png |
| Temporal Lobe Epilepsy (TLE) | `tle` | `syndrome-tle.png` | ⚠️ Currently sharing: focal-spikes-temporal.png |
| Frontal Lobe Epilepsy (FLE) | `fle` | `syndrome-fle.png` | ⚠️ Currently sharing: focal-spikes-frontal.png |

---

## Image Requirements

### Technical Specifications
- **Format:** PNG (preferred) or JPG
- **Size:** 1200-2000px width recommended
- **File Size:** Keep under 2MB for fast loading
- **Location:** `public/images/patterns/`

### Content Guidelines
- **Show characteristic pattern** for that specific syndrome
- **Include annotations** if helpful (arrows, labels)
- **Highlight distinguishing features** that make this syndrome unique
- **Use clear, high-quality EEG traces**

---

## Priority List (Most Important First)

### High Priority (Currently Sharing Generic Images)
1. **CAE** - `syndrome-cae.png` - Show typical 3 Hz spike-and-wave with hyperventilation response
2. **JAE** - `syndrome-jae.png` - Show 3-4 Hz spike-and-wave, slightly faster than CAE
3. **LGS** - `syndrome-lgs.png` - Show slow spike-and-wave (1.5-2.5 Hz) + GPFA
4. **ESES/CSWS** - `syndrome-eses-csws.png` - Show continuous spike-and-wave during NREM sleep
5. **Landau-Kleffner** - `syndrome-landau-kleffner.png` - Show ESES pattern with temporal/perisylvian emphasis
6. **Dravet** - `syndrome-dravet.png` - Show photosensitive pattern, may show evolution over time
7. **Doose (MAE)** - `syndrome-doose-mae.png` - Show myoclonic-astatic pattern
8. **BMEI** - `syndrome-bmei.png` - Show benign myoclonic pattern (normal background)
9. **GTCA** - `syndrome-gtca.png` - Show GTC pattern upon awakening
10. **Jeavons** - `syndrome-jeavons.png` - Show eyelid myoclonus with eye closure

### Medium Priority
11. **Ohtahara** - `syndrome-ohtahara.png` - Show burst-suppression with tonic seizures
12. **EME** - `syndrome-eme.png` - Show burst-suppression with myoclonic seizures
13. **Angelman** - `syndrome-angelman.png` - Show generalized pattern with characteristic features
14. **Rett** - `syndrome-rett.png` - Show generalized/multifocal pattern
15. **Lissencephaly** - `syndrome-lissencephaly.png` - Show pattern with structural malformation context
16. **Eye Closure Sensitivity** - `syndrome-eye-closure-sensitivity.png` - Show eye closure triggered pattern
17. **Atypical Absence** - `syndrome-atypical-absence.png` - Show slow spike-and-wave with gradual onset/offset

### Lower Priority (Already Have Unique Images)
- ✅ **JME** - Already has `jme-polyspike-wave.png`
- ✅ **West Syndrome** - Already has `hypsarrhythmia.png`

### Focal Epilepsies
18. **BRE** - `syndrome-bre.png` - Show centrotemporal spikes activated by sleep
19. **TLE** - `syndrome-tle.png` - Show temporal spikes with ictal evolution
20. **FLE** - `syndrome-fle.png` - Show frontal spikes with ictal evolution

---

## Syndrome-Specific Image Characteristics

### CAE (syndrome-cae.png)
- **Key Feature:** Classic 3 Hz spike-and-wave, abrupt onset/offset
- **Context:** Hyperventilation response
- **Distinguishing:** Pure absence, no motor features

### JAE (syndrome-jae.png)
- **Key Feature:** 3-4 Hz spike-and-wave (slightly faster than CAE)
- **Context:** Adolescence, less hyperventilation response
- **Distinguishing:** Slightly faster frequency than CAE

### LGS (syndrome-lgs.png)
- **Key Feature:** Slow spike-and-wave (1.5-2.5 Hz) + GPFA during sleep
- **Context:** Multiple seizure types, cognitive impairment
- **Distinguishing:** Slower than typical 3 Hz, GPFA during sleep

### ESES/CSWS (syndrome-eses-csws.png)
- **Key Feature:** Continuous spike-and-wave during NREM sleep (≥85%)
- **Context:** Sleep recording, disappears in REM/wake
- **Distinguishing:** ONLY in NREM sleep, continuous pattern

### Landau-Kleffner (syndrome-landau-kleffner.png)
- **Key Feature:** ESES pattern with temporal/perisylvian emphasis
- **Context:** Acquired aphasia, sleep recording
- **Distinguishing:** ESES + language loss, temporal emphasis

### Dravet (syndrome-dravet.png)
- **Key Feature:** Photosensitive, may show evolution over time
- **Context:** Febrile seizures early, photosensitive
- **Distinguishing:** Photosensitive, fever-sensitive, pattern evolves

### Doose (MAE) (syndrome-doose-mae.png)
- **Key Feature:** Myoclonic-astatic (myoclonic jerk followed by atonic drop)
- **Context:** Drop attacks, variable prognosis
- **Distinguishing:** Myoclonic-astatic pattern, may remit or evolve to LGS

### BMEI (syndrome-bmei.png)
- **Key Feature:** Myoclonic seizures only, normal background
- **Context:** Normal development, excellent prognosis
- **Distinguishing:** Normal background (vs Dravet - abnormal), myoclonic only

### GTCA (syndrome-gtca.png)
- **Key Feature:** GTC seizures only, often upon awakening
- **Context:** No absence, no myoclonus
- **Distinguishing:** GTC only, normal background

### Jeavons (syndrome-jeavons.png)
- **Key Feature:** Eyelid myoclonus with eye closure, highly photosensitive
- **Context:** Eye closure triggers, photic stimulation
- **Distinguishing:** Eyelid myoclonus, eye closure sensitivity

### Ohtahara (syndrome-ohtahara.png)
- **Key Feature:** Burst-suppression continuous (wake and sleep), tonic seizures
- **Context:** Earliest onset, tonic seizures
- **Distinguishing:** Continuous burst-suppression, tonic seizures (not myoclonic)

### EME (syndrome-eme.png)
- **Key Feature:** Burst-suppression continuous, myoclonic seizures
- **Context:** Earliest onset, myoclonic seizures
- **Distinguishing:** Continuous burst-suppression, myoclonic seizures (not tonic)

### Angelman (syndrome-angelman.png)
- **Key Feature:** Generalized spike-and-wave, may be photosensitive
- **Context:** Happy demeanor, ataxia, genetic condition
- **Distinguishing:** Clinical features (happy demeanor) + EEG pattern

### Rett (syndrome-rett.png)
- **Key Feature:** Generalized or multifocal spike-and-wave
- **Context:** Hand wringing, developmental regression, genetic condition
- **Distinguishing:** Clinical features (hand wringing) + EEG pattern

### Lissencephaly (syndrome-lissencephaly.png)
- **Key Feature:** Generalized pattern, may show hypsarrhythmia in infancy
- **Context:** Structural malformation (smooth brain or band heterotopia)
- **Distinguishing:** Structural imaging correlation, pattern correlates with severity

### Eye Closure Sensitivity (syndrome-eye-closure-sensitivity.png)
- **Key Feature:** Pattern triggered by eye closure
- **Context:** Eye closure testing, may be associated with Jeavons
- **Distinguishing:** Eye closure triggers pattern immediately

### Atypical Absence (syndrome-atypical-absence.png)
- **Key Feature:** Slow spike-and-wave (1.5-2.5 Hz), gradual onset/offset
- **Context:** LGS context, longer duration
- **Distinguishing:** Slower than typical, gradual onset/offset

### BRE (syndrome-bre.png)
- **Key Feature:** Centrotemporal spikes dramatically activated by sleep
- **Context:** Sleep activation (10-100x increase), normal cognition
- **Distinguishing:** Centrotemporal location, dramatic sleep activation

### TLE (syndrome-tle.png)
- **Key Feature:** Temporal spikes with ictal evolution
- **Context:** Ictal recording, temporal localization
- **Distinguishing:** Temporal location, ictal evolution pattern

### FLE (syndrome-fle.png)
- **Key Feature:** Frontal spikes with ictal evolution
- **Context:** Ictal recording, frontal localization
- **Distinguishing:** Frontal location, ictal evolution pattern

---

## Quick Upload Checklist

- [ ] Save images to `public/images/patterns/`
- [ ] Use exact file names listed above (case-sensitive)
- [ ] Verify images are PNG or JPG format
- [ ] Check file size (under 2MB)
- [ ] Test image display on syndrome detail pages
- [ ] Images will automatically appear once uploaded

---

## After Uploading Images

1. **Images will automatically appear** on syndrome detail pages (`/syndromes/:id`)
2. **No code changes needed** - the JSON is already configured
3. **Test by visiting** a syndrome page (e.g., `/syndromes/cae`)
4. **Check both tabs** - "Morphology" and "Overview" tabs display images

---

## Notes

- **Even if patterns look similar**, each syndrome should have its own image to help learners distinguish between them
- **Include clinical context** in images when possible (e.g., age markers, activation procedures)
- **Annotate distinguishing features** (arrows, labels) to highlight what makes each syndrome unique
- **Consider showing multiple views** if helpful (e.g., awake vs sleep, interictal vs ictal)

---

## Support

If you need help:
- Check existing images in `public/images/patterns/` for reference
- See `ALL_PATTERNS_IMAGE_GUIDE.md` for pattern image naming
- Review syndrome detail pages to see how images are displayed




