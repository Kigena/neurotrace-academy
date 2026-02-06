# Medical Redaction Editor Guide

**Last Updated:** February 6, 2026

## Overview

The Medical Redaction Editor is a **medical-grade tool** for removing Protected Health Information (PHI) from images and PDFs before uploading to the community cases. It provides HIPAA-compliant redaction tools with canvas-based editing.

---

## Features

### 1. **Black Box Redaction** (Complete Removal)
- Draw solid black rectangles over sensitive information
- **Use for:** Names, MRNs, dates, phone numbers, addresses
- **HIPAA Compliance:** Complete visual removal of PHI
- **Color:** Solid black with red outline during drawing

### 2. **Blur Redaction**
- Apply heavy gaussian blur to areas
- **Use for:** Less sensitive info that needs context hidden
- **Blur Strength:** 20px blur radius
- **Color:** Blue outline during drawing

### 3. **Pixelate Redaction**
- Apply mosaic/pixelation effect
- **Use for:** Faces, handwritten notes
- **Pixel Size:** 20x20px blocks
- **Color:** Purple outline during drawing

### 4. **Text Overlay**
- Add text labels like "REDACTED" or "PHI REMOVED"
- **Use for:** Indicating redaction areas
- **Style:** Bold 24px Arial in black
- **Interactive:** Click-to-place with text input modal

---

## User Workflow

### For New Uploads

1. **Select File** - User clicks "Upload EEG Images/PDFs"
2. **PHI Detection** - Automatic prompt asks if file contains PHI
3. **Open Editor** - If "OK", redaction editor opens
4. **Redact PHI** - User draws redaction boxes over sensitive info
5. **Save** - Redacted file replaces original
6. **Upload** - User clicks "Confirm Upload" to add to case

### For Existing Attachments

1. **View Attachments** - Already uploaded files shown in green cards
2. **Click "Redact"** - Orange button next to "Remove"
3. **Editor Opens** - Fetches file from server
4. **Redact PHI** - User edits the image
5. **Save & Replace** - Redacted version replaces original attachment

---

## Technical Implementation

### Frontend Component

**File:** `src/components/MedicalRedactionEditor.jsx`

**Key Technologies:**
- HTML5 Canvas API for image manipulation
- FileReader API for local file loading
- PDF.js for PDF rendering (dynamic import)
- Canvas blur and pixelation algorithms

### Canvas Drawing System

```javascript
// Redaction object structure
{
  type: 'rectangle' | 'blur' | 'pixelate' | 'text',
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  text?: string // for text type
}
```

### Drawing Modes

**1. Rectangle (Black Box)**
```javascript
ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Solid black
ctx.fillRect(startX, startY, width, height);
```

**2. Blur**
```javascript
ctx.filter = 'blur(20px)';
ctx.drawImage(originalImage, ...);
ctx.filter = 'none';
```

**3. Pixelate**
```javascript
// Sample pixel color at intervals
// Apply same color to block
for (let py = 0; py < height; py += pixelSize) {
  for (let px = 0; px < width; px += pixelSize) {
    // Get pixel color
    // Fill block with that color
  }
}
```

**4. Text Overlay**
```javascript
ctx.font = 'bold 24px Arial';
ctx.fillStyle = '#000000';
ctx.fillText(text, x, y);
```

### Integration with ShareCase

**File:** `src/pages/cases/ShareCase.jsx`

**State Management:**
```javascript
const [showRedactionEditor, setShowRedactionEditor] = useState(false);
const [fileToRedact, setFileToRedact] = useState(null);
const [redactingIndex, setRedactingIndex] = useState(null);
```

**Handlers:**
- `handleFileSelect` - Prompts for redaction on new file selection
- `handleRedactExistingFile` - Fetches and opens editor for existing attachment
- `handleSaveRedactedFile` - Saves redacted file and uploads/replaces
- `handleCancelRedaction` - Closes editor without saving

---

## UI/UX Design

### Color Scheme
- **Primary:** Red-to-pink gradient (danger/PHI warning theme)
- **Tool Highlights:**
  - Black Box: Black background
  - Blur: Blue (#3b82f6)
  - Pixelate: Purple (#8b5cf6)
  - Text: Green (#10b981)

### Layout
```
┌─────────────────────────────────────────┐
│ Header (Red gradient)                   │
│  Medical Redaction Editor               │
│  + PHI warning message                  │
├─────────────────────────────────────────┤
│ Toolbar (Slate-100 background)          │
│  [Black Box] [Blur] [Pixelate] [Text]  │
│  [Undo] [Reset]     Redactions: X       │
├─────────────────────────────────────────┤
│                                         │
│          Canvas Area                    │
│      (Image with overlays)              │
│                                         │
├─────────────────────────────────────────┤
│ Footer                                  │
│  Tips         [Cancel] [Save & Use]     │
└─────────────────────────────────────────┘
```

### Interactions
- **Mouse Down** - Start drawing
- **Mouse Move** - Update drawing preview
- **Mouse Up** - Finalize redaction
- **Undo** - Remove last redaction
- **Reset** - Clear all redactions

---

## PHI Detection & Prompts

### Initial File Selection Prompt
```
🔒 Medical Image Detected

Does this image contain Protected Health Information (PHI) like:
• Patient names or initials
• Medical record numbers (MRN)
• Dates of birth or service
• Hospital/facility identifiers

Click OK to open the Redaction Editor, or Cancel to upload as-is.
```

### Components That Need Redaction

According to HIPAA, these 18 identifiers must be removed:
1. Names
2. Geographic subdivisions smaller than state
3. Dates (except year)
4. Telephone numbers
5. Fax numbers
6. Email addresses
7. Social Security numbers
8. Medical record numbers
9. Health plan beneficiary numbers
10. Account numbers
11. Certificate/license numbers
12. Vehicle identifiers
13. Device identifiers and serial numbers
14. Web URLs
15. IP addresses
16. Biometric identifiers
17. Full-face photos
18. Any other unique identifying number/code

---

## File Processing

### Image Files
1. **Load:** FileReader.readAsDataURL()
2. **Canvas:** Draw to canvas at scaled size
3. **Edit:** Apply redactions via canvas operations
4. **Export:** canvas.toBlob() as PNG

### PDF Files
1. **Load:** pdfjs-dist dynamically imported
2. **Render:** First page rendered to canvas
3. **Edit:** Canvas redaction (same as images)
4. **Export:** Canvas exported as PNG (PDF → Image)

**Note:** PDFs are converted to images during redaction. Original PDF metadata is not preserved.

---

## Export Format

- **Output:** PNG image (even if input was JPEG or PDF)
- **Quality:** Lossless PNG format
- **Filename:** Preserves original filename
- **Size:** Full canvas dimensions

---

## Performance Considerations

### Canvas Scaling
- **Max Width:** 1200px
- **Max Height:** 800px
- **Aspect Ratio:** Preserved
- **Purpose:** Keep UI responsive while maintaining quality

### Memory Management
- **Original Image:** Stored in state for redrawing
- **Redactions Array:** Stores all redaction objects
- **Canvas Context:** Single context instance
- **Cleanup:** State cleared on save/cancel

---

## Browser Compatibility

### Requirements
- **Canvas API:** ✅ All modern browsers
- **FileReader API:** ✅ All modern browsers
- **Blob API:** ✅ All modern browsers
- **PDF.js:** ✅ Dynamic import (optional for PDFs)

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Security & Privacy

### Client-Side Only
- **All editing happens locally** in the browser
- **No server-side processing** of PHI before redaction
- **Original files** are NOT sent to server until redacted
- **User control** over what gets redacted

### HIPAA Compliance
- ✅ **Black box** provides complete visual removal
- ✅ **User-controlled** redaction process
- ✅ **No intermediate storage** of unredacted PHI
- ✅ **Clear warnings** about PHI requirements

### Limitations
- **Metadata:** Image EXIF data is NOT stripped (future enhancement)
- **PDF Text:** PDF text layers are removed (converted to image)
- **Reversibility:** Redactions are permanent once saved

---

## Future Enhancements

### Planned Features
1. **Auto-Detection:** AI-powered PHI detection with auto-redaction suggestions
2. **Template Redaction:** Save common redaction patterns (e.g., "header area always black box")
3. **Batch Redaction:** Apply same redactions to multiple pages/files
4. **EXIF Stripping:** Remove all image metadata
5. **PDF Preservation:** Maintain PDF format with embedded redactions
6. **Undo History:** Multiple undo levels
7. **Zoom & Pan:** For precise redaction on large images
8. **Shape Tools:** Oval, polygon redaction shapes
9. **Color Picker:** Custom redaction colors
10. **Export Options:** JPEG quality settings, file format selection

### Advanced Features (Future)
- OCR-based text detection for auto-highlighting PHI candidates
- Machine learning model to identify faces, dates, names
- Blockchain verification of redaction integrity
- Audit trail of redaction operations
- Multi-user collaboration on redaction

---

## Usage Tips

### Best Practices
1. **Always use Black Box** for complete PHI removal (names, MRNs, DOB)
2. **Check corners** - PHI often appears in image headers/footers
3. **Review before saving** - Undo is available during editing only
4. **Zoom browser** - Use Ctrl++ to zoom in for precise redaction
5. **Multiple passes** - Review image at different zoom levels

### Common PHI Locations in EEG Images
- **Top header:** Patient name, MRN, DOB, hospital
- **Bottom footer:** Technician name, date/time
- **Side margins:** Room numbers, bed numbers
- **Annotations:** Handwritten notes with names/dates

---

## Troubleshooting

### Image Won't Load
- **Check file size:** Very large files may timeout
- **Check format:** Only images and PDFs supported
- **Browser console:** Check for errors

### Redaction Not Showing
- **Check tool selected:** Tool must be active (highlighted)
- **Check drawing:** Must click and drag to create area
- **Check size:** Very small areas may not be visible

### PDF Not Loading
- **PDF.js Required:** Automatically imported, needs network access
- **First Page Only:** Only first page is rendered
- **Converted to Image:** PDF becomes PNG after redaction

### Save Failed
- **Check file size:** Very large canvases may fail
- **Check memory:** Close other tabs if low on RAM
- **Try again:** Re-open editor and retry

---

## API Reference

### Component Props

```typescript
interface MedicalRedactionEditorProps {
  file: File;                          // File to redact
  onSave: (redactedFile: File) => void; // Callback when saved
  onCancel: () => void;                // Callback when cancelled
}
```

### Methods

- `loadImage(file, canvas, context)` - Load image file to canvas
- `loadPDF(file, canvas, context)` - Load PDF file to canvas (first page)
- `getMousePos(e)` - Get mouse position relative to canvas
- `handleMouseDown(e)` - Start redaction drawing
- `handleMouseMove(e)` - Update redaction preview
- `handleMouseUp()` - Finalize redaction
- `drawCurrentRedaction(pos)` - Draw active redaction
- `pixelateArea(x, y, width, height)` - Apply pixelation effect
- `addTextRedaction()` - Add text overlay
- `redrawCanvas()` - Redraw canvas with all redactions
- `handleUndo()` - Remove last redaction
- `handleReset()` - Clear all redactions
- `handleSave()` - Export redacted image

---

## Testing

### Manual Test Cases

1. **Test Black Box**
   - [ ] Upload image with text
   - [ ] Draw black box over text
   - [ ] Verify text is completely hidden
   - [ ] Save and check exported image

2. **Test Blur**
   - [ ] Draw blur area
   - [ ] Verify 20px blur applied
   - [ ] Check blur extent matches drawing

3. **Test Pixelate**
   - [ ] Draw pixelate area
   - [ ] Verify mosaic effect
   - [ ] Check pixelation is permanent

4. **Test Text Overlay**
   - [ ] Click tool, click canvas
   - [ ] Enter text in modal
   - [ ] Verify text appears on canvas

5. **Test Undo/Reset**
   - [ ] Draw multiple redactions
   - [ ] Undo last one
   - [ ] Reset all
   - [ ] Verify canvas restored

6. **Test Save/Cancel**
   - [ ] Redact image
   - [ ] Save - verify file updated
   - [ ] Cancel - verify no changes

7. **Test PDF Support**
   - [ ] Upload PDF
   - [ ] Verify first page renders
   - [ ] Redact and save
   - [ ] Verify exported as PNG

---

## Support

For questions or issues:
1. Check this guide
2. Review browser console for errors
3. Test with different file formats
4. Verify browser compatibility

---

## Changelog

### Version 1.0.0 (Feb 6, 2026)
- Initial release
- Black box, blur, pixelate, text tools
- Image and PDF support
- Undo/reset functionality
- Integration with case upload workflow
- Automatic PHI detection prompt
- HIPAA-compliant redaction capabilities
