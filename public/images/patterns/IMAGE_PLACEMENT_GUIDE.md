# EEG Pattern Image Placement Guide

## Quick Reference: Image File Names

Based on the Normal EEG Variants chapter you provided, here are the exact file names to use:

### Alpha Variants
- **Fig. 3.1** → `fast-alpha-variant.png`
- **Fig. 3.2** → `slow-alpha-variant.png`
- **Fig. 3.3** → `alpha-squeak.png`

### Temporal Variants
- **Fig. 3.4** → `rmtd.png` (Rhythmic Mid-Temporal Theta Bursts of Drowsiness)
- **Fig. 3.10** → `wicket-spikes.png` (Wicket Spikes)

### Central/Midline Variants
- **Fig. 3.5** → `midline-theta.png` (Midline Theta Rhythm / Ciganek Rhythm)

### Generalized Variants
- **Fig. 3.8** → `6-hz-spike-wave.png` (6-Hz Spike-and-Wave Bursts / Phantom Spike-and-Wave)

### Posterior-Temporal Variants
- **Fig. 3.7** → `14-6-hz-positive-bursts.png` (14- and 6-Hz Positive Bursts / Ctenoids)

### Sleep Variants
- **Fig. 3.9** → `bets-bsss.png` (Benign Sporadic Sleep Spikes / BETS)

### Uncommon Variants
- **Fig. 3.6a-d** → `sreda.png` (SREDA - you may want to use the most representative image or create a composite)

## Steps to Add Images

1. **Save each image** from your source to this directory: `public/images/patterns/`
2. **Name them exactly** as listed above (case-sensitive)
3. **Verify the images display** by visiting the pattern detail page (e.g., `/patterns/pattern_fast_alpha_variant`)
4. **Images will automatically appear** in the "Core Identity" tab of each pattern

## Image Display

Images will be displayed:
- On pattern detail pages (`/patterns/:id`)
- In the "Core Identity" tab
- With automatic fallback message if image is missing
- Responsive sizing (max-width: 4xl)
- With caption showing pattern name

## Additional Images

If you have additional EEG images from other sources, you can:
1. Add them to this directory
2. Update the pattern in `neurotrace_patterns_library_v2.json` with the `image` field
3. The image will automatically appear on the pattern detail page





