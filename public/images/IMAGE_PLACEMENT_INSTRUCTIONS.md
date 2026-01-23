# Image Placement Instructions

## Trace Alternant PSG Image

The Age-Related EEG Development section is now configured to display a trace alternant PSG image.

### To Complete the Integration:

1. **Save the image file:**
   - File name: `trace-alternant-psg.png`
   - Location: `public/images/trace-alternant-psg.png`
   - Format: PNG or JPG

2. **Image Description:**
   - The image shows a polysomnography (PSG) recording titled "Quiet Sleep with Trace Alternans"
   - It displays multiple channels: EEG (Fp1-T3, T3-O1, etc.), EOG (LOC, ROC), EMG (CHIN), respiratory (FLOW, ABD), and ECG
   - Purple boxes highlight attenuation periods (reduced amplitude)
   - Orange boxes highlight activity periods (increased amplitude)
   - This demonstrates the normal discontinuous trace alternant pattern in neonates

3. **Current Status:**
   - ✅ Image display section added to Age-Related EEG Development section
   - ✅ Image path configured: `/images/trace-alternant-psg.png`
   - ⏳ **Waiting for image file to be placed in `public/images/` directory**

### Where It Appears:

The image will be displayed in:
- **Section:** Domain I → Age-Related EEG Development
- **Location:** After "High-Yield Exam Warning" and before "Download PDF" button
- **Component:** `src/components/SectionDetail.jsx` (line ~809)

### Image Features to Highlight:

The component includes annotations explaining:
- Attenuation periods (purple boxes) - quiet phase
- Activity periods (orange boxes) - active phase
- Discontinuous pattern is normal in neonates
- Multiple channel display
- EMG shows no activity (quiet sleep)
- Regular respiratory pattern

Once the image file is placed in `public/images/trace-alternant-psg.png`, it will automatically display in the section.






