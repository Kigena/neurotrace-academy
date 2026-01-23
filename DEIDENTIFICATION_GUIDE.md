# De-identification Guide for EEG Cases

## Overview

All cases must be de-identified before import into NeuroTrace Academy. This guide outlines what to remove, what to convert, and what can be safely kept.

## 1. Remove Completely (Do NOT Store)

### Patient Identifiers
- **Patient name** (e.g., "TEANA JELIMO")
- **Patient ID / Record numbers** (e.g., "PR24100028", MRNs)
- **Date of birth** (DOB) - even if partial

### Facility Identifiers
- **Facility name** (e.g., "PRISCUS EEG SERVICES")
- **Facility location** (address, city, PO Box)
- **Phone numbers**
- **Website URLs**
- **Email addresses**

### Provider Identifiers
- **Referring physician names**
- **Technologist names**
- **Interpreter names**
- Any "Ref by / doctor / tech" fields (even if blank in headers)

## 2. Convert to Safer Form (Keep Educational Value)

### Date/Time
- **Exact dates** → Convert to relative time:
  - "October 15, 2024" → "2024-Q4" or "Recent"
  - "Day 0" for study day references
  - Remove exact timestamps from EEG headers

### Age
- **Specific age** → Use age group:
  - "8 years" → "School-age child (8y)" (acceptable)
  - Or just "School-age child" (safest)
  - Never include DOB

### Location/Address
- **Specific addresses** → "Not provided" or blank
- **City/State** → Remove or generalize to region if needed

## 3. Waveform Images (PDF Pages)

### Header Cropping/Masking
EEG waveform screenshots often contain identifiers in headers. You must:

**Option A: Crop Headers**
- Remove entire header section from all EEG images
- Ensure no patient identifiers remain visible

**Option B: Mask Headers**
- Overlay a mask/block over header fields
- Ensure complete coverage of:
  - Patient name fields
  - ID fields
  - Date/time fields
  - Facility information

### Best Practice
- Use a consistent de-identification method across all images
- Verify no identifiers are visible after processing
- Keep only the waveform traces and essential technical annotations

## 4. Safe to Keep (Clinical + EEG Facts)

### Clinical History
- ✅ Age group (generalized)
- ✅ Clinical symptoms and semiology
- ✅ Seizure descriptions (generalized)
- ✅ Associated symptoms
- ✅ Time course (relative: "recent onset", "chronic")

### EEG Technical Details
- ✅ Electrode placement (10-20 system)
- ✅ Montage types used
- ✅ Instrument settings:
  - Speed (mm/s)
  - Sensitivity (µV/mm)
  - Filter settings (LFF, HFF)
  - Notch filter status
- ✅ States recorded (wake, sleep, etc.)
- ✅ Activation procedures performed/omitted

### EEG Findings
- ✅ Background description
- ✅ PDR frequency
- ✅ Pattern descriptions (morphology, topography)
- ✅ Epileptiform activity descriptions
- ✅ Artifact descriptions
- ✅ Reactivity observations

### Clinical Correlation
- ✅ Pattern interpretations
- ✅ Clinical correlations (generalized)
- ✅ Recommendations (generalized)

## 5. De-identification Checklist

Before adding a case to `cases.json`, verify:

- [ ] Patient name removed
- [ ] Patient ID/MRN removed
- [ ] Facility name removed
- [ ] Facility address/contact removed
- [ ] Exact dates converted to relative time
- [ ] Provider names removed
- [ ] Age generalized to age group
- [ ] Location/address removed or generalized
- [ ] PDF headers cropped or masked
- [ ] All waveform images reviewed for identifiers
- [ ] Clinical content preserved (de-identified)
- [ ] Technical details preserved
- [ ] Educational value maintained

## 6. Case JSON Structure

When creating a de-identified case, include a `deidentification` field:

```json
{
  "deidentification": {
    "status": "deidentified",
    "removedFields": [
      "patientName",
      "patientId",
      "facilityName",
      "facilityContacts",
      "exactDateTime"
    ],
    "dateHandling": "generalized_to_quarter",
    "imageHandling": "crop_or_mask_headers"
  }
}
```

## 7. Example: De-identified Case

See `case-0004` in `src/data/cases.json` for a complete example of a properly de-identified case.

**Key Features:**
- Age: "8 years" → Acceptable (or use "School-age child")
- Date: "Recent onset" (no exact date)
- Location: Not provided
- Clinical history: Generalized descriptions
- Technical details: Preserved
- PDF: Headers cropped/masked

## 8. Resources

When attaching PDFs:
- Store in `/public/assets/cases/` directory
- Name files with case ID: `case-XXXX-eeg-waves.pdf`
- Ensure all headers are cropped/masked
- Reference in case JSON: `resources[].pathOrUrl`

## Compliance

This de-identification process ensures:
- ✅ HIPAA compliance (US)
- ✅ GDPR compliance (EU)
- ✅ General privacy protection
- ✅ Educational value preserved
- ✅ No re-identification risk

## Questions?

If unsure about whether to include specific information, err on the side of caution and remove it. Educational value can be maintained through generalized descriptions without specific identifiers.







