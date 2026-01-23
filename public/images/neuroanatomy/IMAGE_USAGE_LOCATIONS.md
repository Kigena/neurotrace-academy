# Image Usage Locations - Quick Reference

## Circle of Willis & Cerebral Artery Images

### Where to Find the Images in Study Guides

**Study Guide:** `Domain-I/D1-12-Neuroanatomy-Brain-Structures.md`  
**Section:** **6. Blood Supply Summary** (starts at line 387)

---

### Image 1: Circle of Willis - Inferior View
**File:** `circle-of-willis.png`  
**Location in Guide:** Line 389  
**Figure:** Figure 3  
**Context:** Right at the start of Section 6, before the "Circle of Willis" heading

**To view:**
1. Open: `public/study-guides/Domain-I/D1-12-Neuroanatomy-Brain-Structures.md`
2. Scroll to Section 6: Blood Supply Summary
3. First image you'll see

---

### Image 2: Circle of Willis - Educational Diagram
**File:** `vascular-supply-of-brain.png`  
**Location in Guide:** Line 416  
**Figure:** Figure 4  
**Context:** After the Circle of Willis components description, before ACA section

**To view:**
1. Open the study guide
2. Go to Section 6
3. Scroll past Figure 3
4. After the "Clinical Significance" bullet points

---

### Image 3: Arteries of the Brain - Inferior View
**File:** `arteries-of-the-brain.png`  
**Location in Guide:** Line 419  
**Figure:** Figure 5  
**Context:** Right after Figure 4, before ACA section

**To view:**
1. Open the study guide
2. Go to Section 6
3. Scroll past Figure 4
4. Immediately after Figure 4

---

### Image 4: Anterior Cerebral Artery - Segments
**File:** `anterior_circulation.png`  
**Location in Guide:** Line 448  
**Figure:** Figure 6  
**Context:** In the ACA section, after the "Lesions cause" bullet points

**To view:**
1. Open the study guide
2. Go to Section 6
3. Scroll to "Anterior Cerebral Artery (ACA)" subsection
4. After the lesion descriptions, before MCA section

---

## How to Access the Study Guide

### Option 1: Web Interface
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:5002`
3. Go to Domain I → Brain Structures & Functions
4. Scroll to Section 6: Blood Supply Summary

### Option 2: PDF
1. Open: `public/study-guides/Domain-I/D1-12-Neuroanatomy-Brain-Structures.pdf`
2. Go to page with "Blood Supply Summary" heading
3. Images will be embedded in the PDF

### Option 3: Markdown File
1. Open: `public/study-guides/Domain-I/D1-12-Neuroanatomy-Brain-Structures.md`
2. Search for: "## 6. Blood Supply Summary"
3. Images are referenced with `![...](/images/neuroanatomy/...)` syntax

---

## Image File Mapping

| Image Reference in Guide | Actual File Name | Status |
|-------------------------|------------------|--------|
| circle-of-willis-inferior-view.png | `circle-of-willis.png` | ✅ Updated |
| circle-of-willis-educational.png | `vascular-supply-of-brain.png` | ✅ Updated |
| arteries-brain-inferior-view.png | `arteries-of-the-brain.png` | ✅ Updated |
| aca-segments-medial-view.png | `anterior_circulation.png` | ✅ Updated |

---

## Quick Navigation

**In the study guide, search for:**
- "Figure 3" → Circle of Willis inferior view
- "Figure 4" → Circle of Willis educational diagram
- "Figure 5" → Arteries of brain inferior view
- "Figure 6" → ACA segments medial view

**Or search for:**
- "Circle of Willis - Inferior View"
- "Circle of Willis - Educational Diagram"
- "Arteries of the Brain - Inferior View"
- "Anterior Cerebral Artery - Segments"

---

## Notes

- All images are in: `public/images/neuroanatomy/`
- Images are referenced using relative paths: `/images/neuroanatomy/filename.png`
- Images will display in both web interface and PDF exports
- If images don't display, check that the file names match exactly



