# Quick Start: Adding EEG Pattern Images

## Step-by-Step Instructions

### 1. Save Your Images
Save each EEG image file to this directory: `public/images/patterns/`

### 2. Name Files Correctly
Use these exact file names (case-sensitive):

| Figure | Pattern | File Name |
|--------|---------|-----------|
| Fig. 3.1 | Fast Alpha Variant | `fast-alpha-variant.png` |
| Fig. 3.2 | Slow Alpha Variant | `slow-alpha-variant.png` |
| Fig. 3.3 | Alpha Squeak | `alpha-squeak.png` |
| Fig. 3.4 | RMTD | `rmtd.png` |
| Fig. 3.5 | Midline Theta | `midline-theta.png` |
| Fig. 3.6a-d | SREDA | `sreda.png` |
| Fig. 3.7 | 14&6 Hz Positive Bursts | `14-6-hz-positive-bursts.png` |
| Fig. 3.8 | 6 Hz Spike-and-Wave | `6-hz-spike-wave.png` |
| Fig. 3.9 | BETS/BSSS | `bets-bsss.png` |
| Fig. 3.10 | Wicket Spikes | `wicket-spikes.png` |

### 3. Verify Images Appear
1. Start the development server: `npm run dev`
2. Visit a pattern page: `http://localhost:5002/patterns/pattern_fast_alpha_variant`
3. Check the "Core Identity" tab - the image should appear automatically
4. Check the "ABRET Pearls" tab - the image also appears there

### 4. Images Are Already Configured
✅ All pattern entries in `neurotrace_patterns_library_v2.json` already have image paths configured  
✅ The PatternDetail component is set up to display images  
✅ The study guide PDF includes image references  
✅ Images will automatically appear once you place the files

## What Happens When Images Are Missing?

- A placeholder message will appear showing where the image should be placed
- The pattern detail page will still function normally
- Once you add the image file, it will automatically appear on refresh

## Image Format Recommendations

- **Format:** PNG (preferred) or JPG
- **Size:** 1200-2000px width for good quality
- **File Size:** Keep under 2MB for fast loading
- **Quality:** Clear, well-annotated EEG traces are best

## Need Help?

See `README.md` and `IMAGE_PLACEMENT_GUIDE.md` in this directory for more detailed information.





