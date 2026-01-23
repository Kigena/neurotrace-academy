# JME (Juvenile Myoclonic Epilepsy) Image Guide

## Current Image Configuration

JME uses a **dedicated JME-specific image**:

- **Primary Image:** `jme-polyspike-wave.png` (JME-specific)
- **Location:** `/images/patterns/jme-polyspike-wave.png`
- **Status:** Ready for upload (see `JME_IMAGE_UPLOAD_INSTRUCTIONS.md`)

## Why Polyspike-and-Wave for JME?

**JME Characteristic Pattern:**
- **Polyspike-and-wave** (multiple spikes followed by slow wave) is MORE COMMON in JME than pure 3 Hz spike-and-wave
- This distinguishes JME from typical absence (CAE/JAE) which shows pure 3 Hz spike-and-wave
- Polyspike-and-wave correlates with myoclonic jerks

## Image Requirements

- **File Name:** `jme-polyspike-wave.png` (JME-specific)
- **Location:** `public/images/patterns/`
- **Format:** PNG (preferred) or JPG
- **Size:** 1200-2000px width recommended
- **File Size:** Keep under 2MB for fast loading
- **Content:** Should clearly show polyspike-and-wave pattern (multiple spikes followed by slow wave)

## Optional: Multiple Images

If you have multiple JME examples, you can update JME to support multiple images like IGE:

1. **Update** `src/data/syndromes_v2.json`:
   - Find JME entry (id: "jme")
   - Change `image` to `images` array:

```json
"morphology": {
  "images": [
    "/images/patterns/jme-polyspike-wave.png",
    "/images/patterns/jme-awakening.png",
    "/images/patterns/jme-sleep-deprivation.png",
    "/images/patterns/jme-photic.png"
  ]
}
```

2. **Name additional images:**
   - `jme-awakening.png` - JME pattern upon awakening
   - `jme-sleep-deprivation.png` - JME during sleep deprivation
   - `jme-photic.png` - JME during photic stimulation
   - `jme-polyspike-variant.png` - Different polyspike morphology

## Image Display

The image will display:
- On JME syndrome detail page (`/syndromes/jme`)
- In the "EEG Morphology" tab
- With caption "Juvenile Myoclonic Epilepsy (JME) - EEG Morphology"
- Responsive sizing (max-width: 4xl)
- Automatic error handling (missing images won't break the page)

## Key Distinction

**JME vs Typical Absence:**
- **JME:** Polyspike-and-wave (multiple spikes) → `jme-polyspike-wave.png` (JME-specific)
- **CAE/JAE:** 3 Hz spike-and-wave (single spike) → `3-hz-generalized-spike-wave.png`

This visual distinction is critical for ABRET exam preparation!

## Upload Instructions

**See `JME_IMAGE_UPLOAD_INSTRUCTIONS.md` for detailed step-by-step upload instructions.**

