# Pattern EEG Images Directory

This directory contains EEG images for pattern examples in the NeuroTrace Academy Pattern Library.

## Image Naming Convention

Images should be named using the pattern ID from `neurotrace_patterns_library_v2.json`:

- `fast-alpha-variant.png` → pattern_fast_alpha_variant
- `slow-alpha-variant.png` → pattern_slow_alpha_variant
- `alpha-squeak.png` → pattern_alpha_squeak
- `rmtd.png` → pattern_rmtd
- `midline-theta.png` → pattern_midline_theta
- `sreda.png` → pattern_sreda
- `14-6-hz-positive-bursts.png` → pattern_14_6_hz_positive_bursts
- `6-hz-spike-wave.png` → pattern_6_hz_spike_wave
- `bets-bsss.png` → pattern_bets
- `wicket-spikes.png` → pattern_wicket_spikes

## Image Requirements

- **Format:** PNG, JPG, or GIF
- **Recommended size:** 1200-2000px width for good display quality
- **File size:** Keep under 2MB for fast loading
- **Content:** Should clearly show the pattern with appropriate annotations/arrows if needed

## How Images Are Used

1. **Pattern Detail Pages:** Images display in the "Core Identity" tab
2. **Study Guides:** Images can be referenced in PDF study guides
3. **Pattern Library:** Images appear when viewing individual pattern details

## Adding New Images

1. Save the image file in this directory (`public/images/patterns/`)
2. Name it according to the pattern ID (see naming convention above)
3. Update the pattern in `neurotrace_patterns_library_v2.json` to include the `image` field:
   ```json
   "image": "/images/patterns/your-image-name.png"
   ```
4. The image will automatically appear on the pattern detail page

## Current Pattern Images Needed

Based on the Normal EEG Variants content provided, the following images are needed:

- ✅ `fast-alpha-variant.png` - Fast Alpha Variant (Fig. 3.1)
- ✅ `slow-alpha-variant.png` - Slow Alpha Variant (Fig. 3.2)
- ✅ `alpha-squeak.png` - Alpha Squeak (Fig. 3.3)
- ✅ `rmtd.png` - RMTD (Fig. 3.4)
- ✅ `midline-theta.png` - Midline Theta (Fig. 3.5)
- ✅ `sreda.png` - SREDA (Fig. 3.6a-d)
- ✅ `14-6-hz-positive-bursts.png` - 14&6 Hz Positive Bursts (Fig. 3.7)
- ✅ `6-hz-spike-wave.png` - 6 Hz Spike-and-Wave (Fig. 3.8)
- ✅ `bets-bsss.png` - BSSS/BETS (Fig. 3.9)
- ✅ `wicket-spikes.png` - Wicket Spikes (Fig. 3.10)

## Image Sources

The images you provided from the textbook chapter should be saved here with the appropriate names listed above.





