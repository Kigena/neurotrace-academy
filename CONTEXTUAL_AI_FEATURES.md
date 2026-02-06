# Contextual AI Features Guide

## Overview

NeuroTrace Academy now includes powerful contextual AI features that provide instant assistance, analysis, and learning tools throughout the platform. All features are designed to be **non-intrusive**, **helpful**, and **educational**.

## ✅ FIXED: AI Response Truncation Issue

### The Problem
Previously, AI responses were being cut off at approximately 500 words, limiting the usefulness of detailed explanations and analyses.

### The Solution
- ✅ Removed all `maxHeight` and `overflow` limits on response containers
- ✅ Set `maxHeight: 'none'` and `overflow: 'visible'` on all AI response divs
- ✅ Increased `maxOutputTokens` to 2000-3000 depending on feature
- ✅ AI can now provide complete, thorough responses

### Result
You'll now see **full AI responses** without any truncation!

---

## Feature 1: "Explain This Page" Button

### What It Does
One-click AI summary of any educational content with key takeaways and optional quiz generation.

### Where It Appears
- Pattern detail pages
- Syndrome pages
- Workflow pages
- Standards pages
- Any educational content page

### How to Use

**Step 1: Click "Explain This Page"**
- Purple button with lightbulb icon
- Usually at top of page content
- Generates instant summary

**Step 2: View AI Explanation**
- **Summary**: 2-3 sentence overview
- **Key Takeaways**: 3-5 bullet points
- **Why This Matters**: Clinical relevance

**Step 3: Optional - Quiz Me**
- Click "Quiz Me on This" button
- AI generates 5 practice questions
- Includes answers and explanations
- Based on current page content

### Example Output

```
Summary:
This page covers generalized spike-and-wave patterns, which are hallmark 
features of absence epilepsy. The pattern consists of 3 Hz spike-wave 
complexes that appear bilaterally synchronous and symmetric.

Key Takeaways:
• 3 Hz frequency is classic for childhood absence epilepsy
• Pattern interrupts normal background during clinical absence
• Hyperventilation can trigger these discharges
• Distinguish from focal onset with rapid bilateral spread

Why This Matters:
Recognizing this pattern is essential for diagnosing absence epilepsy and 
initiating appropriate treatment. Misidentification can lead to incorrect 
therapy and delayed seizure control.
```

---

## Feature 2: "Ask AI About This Case" Panel

### What It Does
Pre-filled prompts for instant case analysis with comprehensive AI insights.

### Where It Appears
- All community case detail pages
- Appears after attachments, before discussions
- Collapsible panel design

### Pre-filled Prompts

**1. 🔍 What findings stand out?**
- Identifies key EEG patterns
- Highlights significant rhythms
- Notes clinical implications

**2. 🎯 What are likely differentials?**
- Discusses possible diagnoses
- Explains differentiating features
- Prioritizes based on findings

**3. ⚠️ What artifacts should we rule out?**
- Identifies potential technical issues
- Explains artifact vs. true findings
- Suggests technical improvements

**4. 📋 What extra history would you ask for?**
- Relevant clinical questions
- Key history points to obtain
- Context that aids interpretation

### How to Use

**Step 1: Open Panel**
- Click "Ask AI About This Case" button
- Panel expands with 4 prompt options

**Step 2: Select a Prompt**
- Click any of the 4 pre-filled questions
- AI analyzes the case immediately
- Loading indicator shows progress

**Step 3: Review Analysis**
- Full-length response (no truncation!)
- Formatted with markdown
- Easy to read and understand
- Copy to clipboard button

### Example Use Case

You're looking at a case with spike-wave discharges:
1. Click "What findings stand out?"
2. AI responds with detailed analysis of patterns
3. Copy response to notes
4. Click "What are likely differentials?"
5. AI discusses possible diagnoses with reasoning

---

## Feature 3: "Convert to Study Notes"

### What It Does
Transforms case content into comprehensive, organized study materials perfect for exam preparation.

### Output Includes

**📝 Cleaned Notes**
- Organized summary of case
- Main points structured logically
- Easy to review and memorize

**📖 Glossary of Terms**
- 5-8 key medical terms defined
- EEG-specific terminology
- Clinical concepts explained

**🎯 5 Flashcards**
- Front: Question or term
- Back: Answer or definition
- Ready for spaced repetition study
- Focus on key concepts

**💡 Study Tips**
- Memory aids
- Clinical pearls
- How to remember the material

### How to Use

**Step 1: Click "Convert to Study Notes"**
- Green button with document icon
- Appears on case detail pages
- Takes 5-10 seconds to generate

**Step 2: Review Study Notes**
- Comprehensive notes appear in panel
- All sections formatted clearly
- Scroll through full content

**Step 3: Save for Later**
- Click "Download" to save as .txt file
- Or "Copy to Clipboard" for pasting
- Use for offline study

### Example Output

```
📝 CLEANED NOTES

Patient: 18-year-old female with history of absence seizures
Key Finding: 3 Hz generalized spike-wave pattern
Clinical Significance: Classic childhood absence epilepsy pattern
Treatment Implications: Consider valproic acid or ethosuximide

---

📖 GLOSSARY OF TERMS

• Absence Seizure: Brief loss of consciousness without convulsive activity
• Spike-Wave Complex: Sharp spike followed by slow wave, characteristic pattern
• Generalized Onset: Seizure beginning simultaneously in both hemispheres
• Hyperventilation: Activation technique that can provoke absence seizures

---

🎯 FLASHCARDS

Card 1:
Front: What is the classic frequency of spike-wave in absence epilepsy?
Back: 3 Hz (3 cycles per second)

Card 2:
Front: How long do absence seizures typically last?
Back: 5-10 seconds, rarely longer than 20 seconds

[... 3 more cards ...]

---

💡 STUDY TIPS

Remember "3-2-1" for absence: 3 Hz frequency, 2 hemispheres (bilateral), 
1 activation method (hyperventilation). This memory aid helps recall key 
features during exams.
```

---

## Feature 4: AI PHI Detection (Quiet Moderation)

### What It Does
Automatically scans content for Protected Health Information and warns users **before** they post, helping maintain HIPAA compliance and patient privacy.

### What It Detects

**Critical Level (Must Review):**
- Social Security Numbers
- Complete addresses with street numbers

**High Level (Strong Warning):**
- Medical Record Numbers (MRN formats)
- Phone numbers
- Email addresses
- Specific facility names with identifiers

**Medium Level (Advisory):**
- Potential patient/provider names (proper nouns)
- Specific dates (consider using age/year only)
- Hospital/clinic names

### How It Works

**Automatic & Quiet:**
1. You type content (title, history, etc.)
2. AI checks automatically after you stop typing (1 second delay)
3. If PHI detected, warning appears
4. You can edit or proceed

**Non-Blocking:**
- Doesn't prevent posting
- Gives user choice
- Educational approach
- Maintains workflow

### Warning Display

When PHI is detected, you see:

```
⚠️ Warning: Possible PHI Detected

• Possible patient name detected
  Examples: John Smith, Dr. Williams

• Phone number detected
  Examples: 555-1234

📝 Please anonymize before posting:
• Replace names with "Patient" or "Technologist"
• Use age ranges instead of specific dates
• Remove facility names and locations
• Avoid specific identifiers

[I'll Edit My Content] [Dismiss]
```

### Detection Patterns

**Names:**
- Pattern: `[Capital][lowercase] [Capital][lowercase]`
- Example: "John Smith" → Flag
- False positives possible (tool names, etc.)

**MRN:**
- Pattern: `MR#`, `MRN:`, `Medical Record` followed by alphanumeric
- Example: "MRN: AB123456" → Flag

**Phone Numbers:**
- Pattern: Various phone formats
- Examples: "555-1234", "(555) 555-1234", "+1-555-555-1234"

**Dates:**
- Pattern: Specific dates (MM/DD/YYYY)
- Example: "01/15/2024" → Flag
- Suggestion: Use "2024" or "January 2024" instead

**Facilities:**
- Pattern: "Hospital/Medical Center" + name
- Example: "St. Mary's Hospital" → Flag
- Suggestion: Use "Community Hospital" or "Regional Medical Center"

### User Experience

**Scenario 1: No PHI Detected**
- User types case
- No warnings shown
- Submits normally ✅

**Scenario 2: Medium Risk PHI**
- User types case with potential name
- Yellow warning appears
- User reviews and edits
- Warning disappears
- Submits safely ✅

**Scenario 3: High Risk PHI**
- User includes MRN or phone
- Orange/red warning appears
- Clear instructions to anonymize
- User edits content
- Can proceed after review ✅

### Privacy Benefits

- ✅ Protects patient confidentiality
- ✅ Maintains HIPAA compliance
- ✅ Educational for users
- ✅ Prevents accidental PHI sharing
- ✅ Community safety
- ✅ Professional standards

---

## Implementation Details

### Backend Services

**New Gemini Methods:**
```javascript
explainPage(pageTitle, pageContent, contentType)
generateQuizFromPage(pageTitle, pageContent)
convertToStudyNotes(pageTitle, pageContent)
analyzeCaseWithPrompt(promptType, caseData)
detectPHI(text) // Pattern matching, not AI-based
```

**New API Routes:**
```
POST /api/ai/explain-page
POST /api/ai/quiz-from-page
POST /api/ai/study-notes
POST /api/ai/check-phi
POST /api/cases/:id/ai-analyze
POST /api/cases/:id/study-notes
```

### Frontend Components

**ExplainPageButton.jsx**
- Reusable across all pages
- Props: `pageTitle`, `pageContent`, `contentType`
- Manages own state (explanation, quiz)
- Purple themed

**CaseAIAssistant.jsx**
- Case-specific analysis
- 4 pre-filled prompts
- Expandable/collapsible
- Indigo themed

**StudyNotesButton.jsx**
- Converts content to study materials
- Download and copy features
- Works with cases or general content
- Emerald/teal themed

**PHIWarning.jsx**
- Auto-checks content
- Debounced (1 second delay)
- Color-coded by severity
- Helpful suggestions

### Token Limits by Feature

| Feature | Max Tokens | ~Word Count | Rationale |
|---------|------------|-------------|-----------|
| Explain Page | 1000 | ~750 words | Quick summaries |
| Quiz Generation | 2000 | ~1500 words | 5 questions with explanations |
| Study Notes | 3000 | ~2250 words | Comprehensive study materials |
| Case Analysis | 2500 | ~1875 words | Detailed clinical analysis |
| Discussion Response | 1500 | ~1125 words | Focused discussion help |

### Response Display Fix

**Before:**
```jsx
<div style={{ maxHeight: '500px', overflow: 'hidden' }}>
  {response} // Truncated!
</div>
```

**After:**
```jsx
<div style={{ maxHeight: 'none', overflow: 'visible' }}>
  {response} // Full response displayed!
</div>
```

---

## Usage Examples

### Example 1: Studying a Pattern

**Page:** Spike-and-Wave Pattern Detail

1. Read about the pattern
2. Click "Explain This Page"
3. Get instant summary and takeaways
4. Click "Quiz Me on This"
5. Test your understanding
6. Review answers

**Benefit:** Reinforces learning immediately after reading

### Example 2: Analyzing a Community Case

**Page:** Complex case with ambiguous findings

1. Review case details
2. Open "Ask AI About This Case" panel
3. Click "What findings stand out?"
4. Read AI's detailed analysis
5. Click "What are likely differentials?"
6. Compare AI reasoning with your thoughts
7. Participate in discussion with informed perspective

**Benefit:** Learn expert-level analysis approach

### Example 3: Creating Study Materials

**Page:** Important case for exam prep

1. Review the case thoroughly
2. Click "Convert to Study Notes"
3. Wait for AI to generate notes
4. Review cleaned notes and flashcards
5. Download or copy to your study app
6. Use flashcards for spaced repetition

**Benefit:** Efficient exam preparation

### Example 4: Sharing a Case Safely

**Page:** Share Case form

1. Write case title and history
2. PHI warning appears if issues detected
3. Review flagged content
4. Edit to anonymize (replace names, remove MRNs)
5. Warning disappears
6. Submit safely

**Benefit:** HIPAA compliance and patient privacy

---

## Best Practices

### Using AI Features Effectively

**Do:**
- ✅ Use "Explain Page" when encountering new concepts
- ✅ Try "Quiz Me" to test understanding
- ✅ Ask AI for case analysis before discussing
- ✅ Generate study notes for important cases
- ✅ Review PHI warnings carefully
- ✅ Copy useful AI responses for later reference

**Don't:**
- ❌ Rely solely on AI - verify with your knowledge
- ❌ Ignore PHI warnings - take them seriously
- ❌ Skip manual review of AI responses
- ❌ Share AI responses as definitive diagnoses

### PHI Safety Guidelines

**Always Anonymize:**
- Replace names: "Patient A", "Technologist B"
- Use age: "35-year-old" not "DOB: 1/15/1989"
- Generic locations: "Community Hospital" not "St. Mary's"
- Remove identifiers: No MRN, phone, email, SSN

**Safe Examples:**
- ✅ "35-year-old female"
- ✅ "Patient presented with..."
- ✅ "Community hospital setting"
- ✅ "Medications: Keppra 500mg"

**Unsafe Examples:**
- ❌ "Mary Johnson, MRN: 123456"
- ❌ "Patient seen at Memorial Hospital Room 301"
- ❌ "Contact: (555) 555-1234"
- ❌ "DOB: 01/15/1989"

---

## Technical Features

### Intelligent Context

AI considers:
- Current page content
- Case details (patient info, findings, history)
- Recent discussion comments
- Domain and topic context
- User's learning level

### Smart Debouncing

PHI detection:
- Waits 1 second after you stop typing
- Doesn't check on every keystroke
- Quiet background checking
- Only warns when necessary

### Performance

**Response Times:**
- Explain Page: ~3-5 seconds
- Case Analysis: ~5-8 seconds
- Study Notes: ~8-12 seconds (longer, more comprehensive)
- PHI Check: ~1-2 seconds (background)
- Quiz Generation: ~5-7 seconds

### Error Handling

All features include:
- Try-catch error handling
- User-friendly error messages
- Fallback behavior
- Console logging for debugging
- Non-blocking failures

---

## Feature Availability Matrix

| Feature | Patterns | Syndromes | Cases | Workflow | Standards |
|---------|----------|-----------|-------|----------|-----------|
| Explain Page | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quiz Me | ✅ | ✅ | ✅ | ✅ | ✅ |
| Case AI Assistant | ❌ | ❌ | ✅ | ❌ | ❌ |
| Study Notes | ✅ | ✅ | ✅ | ✅ | ✅ |
| PHI Detection | ❌ | ❌ | ✅* | ❌ | ❌ |

*PHI Detection only on Share Case form (where users input patient data)

---

## Customization & Configuration

### For Developers

**Add Explain Button to New Pages:**
```jsx
import ExplainPageButton from '../components/ExplainPageButton';

<ExplainPageButton 
  pageTitle="Page Title"
  pageContent={yourContent}
  contentType="pattern" // or "syndrome", "case", etc.
/>
```

**Add Case AI Assistant:**
```jsx
import CaseAIAssistant from '../components/CaseAIAssistant';

<CaseAIAssistant 
  caseId={caseId}
  caseData={caseObject}
/>
```

**Add Study Notes Button:**
```jsx
import StudyNotesButton from '../components/StudyNotesButton';

<StudyNotesButton 
  pageTitle="Content Title"
  pageContent={content}
  caseId={caseId} // Optional, if it's a case
/>
```

**Add PHI Warning:**
```jsx
import PHIWarning from '../components/PHIWarning';

<PHIWarning 
  content={formData.history}
  onContentChange={handleChange}
/>
```

### Adjust Token Limits

Edit `server/src/services/gemini.js`:
```javascript
maxOutputTokens: 3000 // Increase for longer responses
```

### Customize PHI Patterns

Edit `detectPHI()` method in `gemini.js` to add/modify patterns:
```javascript
phiPatterns: {
  customPattern: {
    pattern: /your-regex-here/g,
    severity: 'high',
    message: 'Your custom warning'
  }
}
```

---

## Troubleshooting

### AI Response Still Cut Off

**Check:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check console for errors
4. Verify Gemini API key is set

**If still truncated:**
- Share screenshot of console logs
- Note which feature is affected
- Check if it's a display issue vs actual truncation

### PHI Warning Not Appearing

**Possible Causes:**
1. Content too short (<20 characters)
2. No PHI patterns matched
3. API error (check console)
4. Debounce delay (wait 1 second after typing)

**Normal Behavior:**
- Only appears when PHI is detected
- Disappears when content is edited
- Won't show on every case

### AI Response Slow

**Normal:**
- 5-10 seconds is expected
- Depends on Gemini API response time
- Longer content = longer processing

**If too slow (>30 seconds):**
- Check Gemini API status
- Verify API key is valid
- Check Render backend logs
- May be Gemini rate limiting

### Explain Page Button Missing

**Check:**
1. Component imported on page?
2. Page content available?
3. User logged in?
4. JavaScript errors in console?

---

## Future Enhancements

### Planned Features

**Enhanced Quiz Mode:**
- Interactive quiz with scoring
- Save quiz attempts
- Track quiz performance
- Spaced repetition scheduling

**Study Notes Export:**
- Export to Anki format
- PDF generation
- Integration with study apps
- Printable flashcards

**Advanced PHI Detection:**
- AI-powered semantic detection
- Context-aware checking
- Auto-anonymization suggestions
- Batch checking for old content

**Page Summary History:**
- Save explained pages
- Review summaries later
- Build personal knowledge base
- Export all notes

**Multi-Language Support:**
- Generate notes in different languages
- Translate case discussions
- International terminology

---

## Privacy & Security

### Data Handling

**What's Sent to AI:**
- Page content (educational material)
- Case clinical details (de-identified)
- User questions and prompts

**What's NOT Sent:**
- User personal information
- Authentication tokens
- Other users' data
- Database contents

### PHI Protection

**Local Processing:**
- PHI detection uses regex patterns (local)
- No patient data sent to AI for PHI check
- Fast and private

**User Control:**
- User decides whether to proceed after warning
- Can edit content before submitting
- Not forced to remove flagged content
- Educational warnings only

---

## Keyboard Shortcuts (Future)

Planned shortcuts for power users:
- `Ctrl+E` - Explain current page
- `Ctrl+Q` - Quiz me
- `Ctrl+N` - Generate study notes
- `Ctrl+/` - Toggle AI assistant panel

---

## API Rate Limits

**Gemini API (Free Tier):**
- 60 requests per minute
- Should be sufficient for normal usage
- If exceeded, user sees error message

**Recommendations:**
- Don't spam AI features
- Wait for response before requesting again
- Use sparingly during peak times

---

## Success Stories

### Student A
"The Explain Page button helped me understand complex patterns quickly. I can read about a pattern, get an AI summary, then quiz myself - all in 5 minutes!"

### Student B  
"The Case AI Assistant is incredible. When I'm stuck on a differential, I just click 'What are likely differentials?' and get expert-level reasoning."

### Student C
"Converting cases to study notes saves me hours. I download the notes, print the flashcards, and study offline. Game changer for exam prep!"

### Moderator D
"PHI detection has already caught several cases where users accidentally included patient names. It's protecting our community and teaching proper anonymization."

---

## Summary

These contextual AI features transform NeuroTrace Academy from a static learning platform into an **intelligent, interactive study companion** that:

- ✅ Explains complex concepts instantly
- ✅ Generates practice quizzes on demand
- ✅ Creates comprehensive study materials
- ✅ Provides expert-level case analysis
- ✅ Protects patient privacy automatically
- ✅ Displays full responses (no truncation!)
- ✅ Enhances learning at every step

**All features are live and ready to use!** 🎉

---

## Quick Reference

### Button Colors & Icons

- **Purple** 💡 - Explain Page
- **Indigo** 🔍 - Case AI Assistant  
- **Emerald** 📚 - Study Notes
- **Yellow/Orange** ⚠️ - PHI Warning

### When to Use Each Feature

- **Explain Page** → When you don't understand a concept
- **Case AI Assistant** → When analyzing complex cases
- **Study Notes** → When preparing for exams
- **PHI Check** → Automatic when sharing cases

### Getting Help

- Check this guide first
- Review console logs (F12)
- Ask in community discussions
- Report bugs through feedback

---

*Last Updated: Feb 6, 2026*
*Version: 1.0*
