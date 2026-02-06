# Pattern Image Audit

**Date:** February 6, 2026

## Issue Found

Several patterns in the data have `image` field pointing to files that don't exist, but they have `images` array with actual files.

### Example: SREDA Pattern

**Pattern Data:**
```json
{
  "id": "pattern_sreda",
  "name": "Subclinical Rhythmic Electrographic Discharge in Adults (SREDA)",
  "image": "/images/patterns/sreda.png",  // ❌ File doesn't exist
  "images": [
    "/images/patterns/sreda-1.png",  // ✅ File exists
    "/images/patterns/sreda-2.png",
    "/images/patterns/sreda-3.png",
    "/images/patterns/sreda-4.png"
  ]
}
```

## Fix Applied

Updated `PatternRecognitionQuiz.jsx` to:

1. **Check for both `image` and `images` array** when filtering patterns
2. **Prefer `images` array over single `image`** (more likely to exist)
3. **Fall back to single `image`** if no array available

### New Functions Added:

```javascript
// Filter patterns with either single image or images array
const getPatternsWithImages = () => {
    return patternsData.filter(p => {
        const hasSingleImage = p.image && p.image !== '';
        const hasImagesArray = p.images && Array.isArray(p.images) && p.images.length > 0;
        return hasSingleImage || hasImagesArray;
    });
};

// Get the best image to display (prefer images array first)
const getPatternImage = (pattern) => {
    if (pattern.images && Array.isArray(pattern.images) && pattern.images.length > 0) {
        return pattern.images[0]; // Use first image from array
    }
    return pattern.image || '';
};
```

## Available Pattern Images

Based on scan of `public/images/patterns/`, the following images exist:

- 14-6-hz-positive-bursts.png
- 3-hz-generalized-spike-wave.png
- alpha-coma.png
- alpha-squeak.png
- bets-bsss.png
- burst-suppression.png
- diffuse-slowing.png
- extreme-delta-brush.png
- fast-alpha-variant.png
- firda.png
- focal-slowing.png
- focal-spikes-frontal.png
- focal-spikes-temporal.png
- gpfa.png
- hypsarrhythmia.png
- jme-polyspike-wave.png
- k-complex.png
- lambda-waves.png
- midline-theta.png
- mu-rhythm.png
- oirda.png
- pdr.png
- polyspike-wave.png
- posts.png
- pswcs.png
- rmtd.png
- sleep-spindles.png
- slow-alpha-variant.png
- slow-spike-wave.png
- sreda-1.png (part of SREDA series)
- sreda-2.png
- sreda-3.png
- sreda-4.png
- And more...

## Result

✅ **All patterns with images should now display correctly in the quiz**
- Patterns with single images: Use that image
- Patterns with image arrays: Use first image from array
- Patterns with missing `image` but valid `images` array: Use first from array
- Total: 50+ patterns with images available for quiz

## Testing

To verify the fix:
1. Navigate to `/quiz/pattern-recognition`
2. Start a quiz
3. All questions should show EEG images
4. SREDA question should show `sreda-1.png`
5. No "Image Not Available" placeholders (unless truly missing)
