# IGE (Idiopathic Generalized Epilepsy) Multiple Images Guide

## Overview

IGE (Idiopathic Generalized Epilepsy) is an umbrella term that includes multiple syndromes:
- **CAE** (Childhood Absence Epilepsy) - 3 Hz spike-and-wave
- **JAE** (Juvenile Absence Epilepsy) - 3-4 Hz spike-and-wave
- **JME** (Juvenile Myoclonic Epilepsy) - Polyspike-and-wave
- **Jeavons** (Absence with Eyelid Myoclonus) - 3-4 Hz spike-and-wave, photosensitive
- **GTCA** (Generalized Tonic-Clonic Seizures Alone)

## Current Image Configuration

IGE currently supports **3 images** (can be expanded):

1. **3 Hz Generalized Spike-and-Wave** → `3-hz-generalized-spike-wave.png`
   - Typical for CAE and JAE
   - Shows classic absence pattern

2. **Polyspike-and-Wave** → `polyspike-wave.png`
   - Typical for JME
   - Shows multiple spikes followed by slow wave

3. **Slow Spike-and-Wave (LGS Pattern)** → `slow-spike-wave.png`
   - For atypical absence (LGS context)
   - Shows slower frequency (1.5-2.5 Hz)

## How to Add More Images

### Option 1: Add to Existing Images Array

The IGE entry in `syndromes_v2.json` has an `images` array. You can add more images:

```json
"morphology": {
  "images": [
    "/images/patterns/3-hz-generalized-spike-wave.png",
    "/images/patterns/polyspike-wave.png",
    "/images/patterns/slow-spike-wave.png",
    "/images/patterns/ige-example-1.png",  // Add your new image
    "/images/patterns/ige-example-2.png",  // Add another image
    "/images/patterns/ige-example-3.png"   // Add more as needed
  ]
}
```

### Option 2: Name Your Images

You can name IGE-specific images using this convention:

- `ige-cae-example.png` - CAE example
- `ige-jae-example.png` - JAE example
- `ige-jme-example.png` - JME example
- `ige-jeavons-example.png` - Jeavons example
- `ige-gtca-example.png` - GTCA example
- `ige-generalized-1.png` - General IGE example 1
- `ige-generalized-2.png` - General IGE example 2
- `ige-hyperventilation.png` - IGE during hyperventilation
- `ige-photic.png` - IGE during photic stimulation
- `ige-sleep.png` - IGE during sleep

### Step-by-Step Instructions

1. **Save your images** to: `public/images/patterns/`
2. **Name them** using the convention above (or any descriptive name)
3. **Update** `src/data/syndromes_v2.json`:
   - Find the IGE entry (id: "ige")
   - Add your image paths to the `morphology.images` array
4. **Refresh** your browser - images will appear automatically!

## Image Display

All images in the `images` array will display:
- On the IGE syndrome detail page (`/syndromes/ige`)
- In the "EEG Morphology" tab
- With numbered captions (Example 1, Example 2, etc.)
- Responsive sizing (max-width: 4xl)
- Automatic error handling (missing images won't break the page)

## Recommended Images for IGE

Consider adding images showing:

1. **Different IGE syndromes:**
   - CAE (3 Hz spike-and-wave)
   - JAE (3-4 Hz spike-and-wave)
   - JME (polyspike-and-wave)
   - Jeavons (3-4 Hz with eyelid myoclonus)

2. **Activation procedures:**
   - Hyperventilation response
   - Photic stimulation response
   - Sleep activation
   - Sleep deprivation response

3. **Different states:**
   - Awake
   - Drowsy
   - Sleep
   - Post-ictal

4. **Comparison images:**
   - Typical vs atypical absence
   - IGE vs focal epilepsy
   - IGE vs symptomatic generalized epilepsy

## Image Requirements

- **Format:** PNG (preferred) or JPG
- **Size:** 1200-2000px width recommended
- **File Size:** Keep under 2MB for fast loading
- **Quality:** Clear, well-annotated EEG traces
- **Content:** Should clearly show the IGE pattern with appropriate annotations

## Example: Adding 5 More Images

```json
"morphology": {
  "images": [
    "/images/patterns/3-hz-generalized-spike-wave.png",
    "/images/patterns/polyspike-wave.png",
    "/images/patterns/slow-spike-wave.png",
    "/images/patterns/ige-cae-hyperventilation.png",
    "/images/patterns/ige-jme-awakening.png",
    "/images/patterns/ige-jeavons-photic.png",
    "/images/patterns/ige-comparison.png",
    "/images/patterns/ige-sleep-activation.png"
  ]
}
```

All 8 images will display on the IGE detail page!

## Need Help?

- See `ALL_PATTERNS_IMAGE_GUIDE.md` for general image naming conventions
- See `README.md` for basic image requirements
- Check `PatternDetail.jsx` for how multiple images are displayed (same logic used for syndromes)




