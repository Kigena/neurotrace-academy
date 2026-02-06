# Pattern Recognition Quiz Guide

**Last Updated:** February 5, 2026

## Overview

The Pattern Recognition Quiz is a visual assessment tool that tests users' ability to identify EEG patterns, normal variants, and epileptiform discharges from real EEG images. It provides immediate feedback with detailed explanations to enhance learning.

---

## Features

### 1. **Visual Pattern Identification**
- Shows actual EEG images from the patterns library
- 20 multiple-choice questions per quiz
- 4 answer options per question
- Distractors based on commonly confused patterns

### 2. **Category Filtering**
Users can focus their practice on specific categories:
- **All Patterns** - Mixed quiz covering all categories
- **Normal** - Normal EEG rhythms (PDR, sleep stages, etc.)
- **Variants** - Normal and benign variants (Mu rhythm, wicket spikes, etc.)
- **Epileptiform** - Ictal and interictal patterns (spikes, sharp waves, etc.)
- **Artifacts** - Technical and physiologic artifacts

### 3. **Instant Feedback**
- Immediate indication of correct/incorrect answers
- Detailed explanation of the correct pattern
- Key identifying features highlighted
- Visual indicators (✓ for correct, ✗ for incorrect)

### 4. **Progress Tracking**
- Real-time score display
- Progress bar showing completion
- Final results with percentage
- Pass/Review status (70% passing threshold)

### 5. **Smart Distractors**
- Options based on patterns commonly confused with the correct answer
- Additional random distractors from the same category
- Helps learners distinguish between similar patterns

---

## User Interface

### Introduction Screen
- Quiz overview and instructions
- Category selection buttons
- Statistics (available patterns, question count)
- Feature highlights
- "Start Quiz" button

### Quiz Screen
- Progress bar (Question X of 20)
- Current score display
- Large EEG image display
- 4 labeled answer options (A, B, C, D)
- Pattern category badges
- "Submit Answer" button

### Explanation Screen (after answer)
- Correct/Incorrect indicator
- Detailed explanation
- Key features list
- "Next Question" button

### Results Screen
- Final score (X/20)
- Percentage score
- Pass/Review status
- Actions:
  - Try Again
  - Back to Quiz Hub
  - Study Patterns

---

## Question Generation

### Algorithm
1. Filter patterns that have associated images
2. Apply category filter if selected
3. Randomly shuffle and select 20 patterns
4. For each pattern:
   - Get commonly confused patterns as distractors
   - Fill remaining distractor slots with random patterns from same category
   - Shuffle answer options (A, B, C, D)
   - Generate explanation text

### Example Question Structure
```javascript
{
  pattern: {
    id: "pattern_mu_rhythm",
    name: "Mu Rhythm",
    image: "/images/patterns/mu-rhythm.png",
    category: "NORMAL_VARIANT",
    // ... other pattern data
  },
  options: [
    // Correct answer + 3 distractors
  ],
  correctAnswer: "pattern_mu_rhythm",
  explanation: "Mu Rhythm is characterized by..."
}
```

---

## Technical Implementation

### Frontend Component

**File:** `src/pages/PatternRecognitionQuiz.jsx`

**Key Functions:**

1. **`getPatternsWithImages()`**
   - Filters patterns that have image paths
   - Returns array of patterns with valid images

2. **`generateQuiz(numQuestions = 20)`**
   - Applies category filter
   - Randomly selects patterns
   - Generates distractors
   - Creates question objects

3. **`generateExplanation(pattern)`**
   - Creates educational explanation text
   - Includes key features, morphology, location
   - Adds clinical context

4. **`handleAnswerSelect(patternId)`**
   - Records user's answer selection
   - Prevents changes after submission

5. **`handleSubmitAnswer()`**
   - Checks correctness
   - Updates score
   - Shows explanation

6. **`handleNextQuestion()`**
   - Advances to next question
   - Resets selection state
   - Triggers completion if last question

### State Management

```javascript
const [quizStarted, setQuizStarted] = useState(false);
const [currentQuestion, setCurrentQuestion] = useState(0);
const [score, setScore] = useState(0);
const [selectedAnswer, setSelectedAnswer] = useState(null);
const [showExplanation, setShowExplanation] = useState(false);
const [quizQuestions, setQuizQuestions] = useState([]);
const [quizComplete, setQuizComplete] = useState(false);
const [categoryFilter, setCategoryFilter] = useState('all');
```

### Data Source

**Patterns Library:** `src/data/neurotrace_patterns_library_v2.json`

**Required Fields:**
- `id` - Unique pattern identifier
- `name` - Pattern display name
- `image` - Path to EEG image (e.g., `/images/patterns/pdr.png`)
- `category` - Pattern category (NORMAL, NORMAL_VARIANT, EPILEPTIFORM, etc.)
- `key_features` - Array of identifying features
- `common_confusions` - Array of commonly confused pattern IDs
- `topography` - Location information
- `morphology` - Pattern description
- `clinical_context` - Clinical context object

---

## Image Management

### Current Status
The quiz is designed to use images from `public/images/patterns/` directory. Based on the IMAGE_PLACEMENT_GUIDE.md, the following images are referenced:

**Alpha Variants:**
- `fast-alpha-variant.png`
- `slow-alpha-variant.png`
- `alpha-squeak.png`

**Temporal Variants:**
- `rmtd.png`
- `wicket-spikes.png`

**Central/Midline:**
- `midline-theta.png`

**Generalized:**
- `6-hz-spike-wave.png`

**Posterior-Temporal:**
- `14-6-hz-positive-bursts.png`

**Sleep:**
- `bets-bsss.png`

**Uncommon:**
- `sreda.png`

### Adding Images

To add pattern images:

1. **Place image files** in `public/images/patterns/`
2. **Name files** according to pattern data (e.g., `pdr.png`, `mu-rhythm.png`)
3. **Update pattern data** in `neurotrace_patterns_library_v2.json` if needed:
   ```json
   {
     "id": "pattern_pdr",
     "name": "Posterior Dominant Rhythm (PDR)",
     "image": "/images/patterns/pdr.png",
     ...
   }
   ```
4. **Test display** - Images auto-load when available

### Image Fallback

If an image is not found, a placeholder SVG is displayed with the text "EEG Pattern Image Not Available". The quiz remains functional.

---

## Quiz Flow

### 1. Start Screen
```
User arrives → Sees introduction → Selects category → Clicks "Start Quiz"
```

### 2. Question Loop (20 questions)
```
Display image → Show 4 options → User selects → Submits answer → 
Show explanation → Next question
```

### 3. Results
```
Calculate score → Show percentage → Display pass/fail → Offer actions
```

---

## Scoring

- **Questions:** 20
- **Points per question:** 1
- **Maximum score:** 20
- **Passing percentage:** 70% (14/20)
- **Results:**
  - ≥70% = PASS (green indicator)
  - <70% = REVIEW (orange indicator)

---

## Category Badge Colors

Visual color coding for pattern categories:

| Category | Badge Color |
|----------|-------------|
| NORMAL | Green (bg-green-100, text-green-800) |
| NORMAL_VARIANT | Blue (bg-blue-100, text-blue-800) |
| BENIGN_VARIANT | Cyan (bg-cyan-100, text-cyan-800) |
| EPILEPTIFORM | Red (bg-red-100, text-red-800) |
| ICTAL | Dark Red (bg-red-200, text-red-900) |
| INTERICTAL | Orange (bg-orange-100, text-orange-800) |
| ARTIFACT | Gray (bg-gray-100, text-gray-800) |

---

## Accessibility

- **Keyboard shortcuts:** Not implemented yet (future enhancement)
- **Screen readers:** Button labels and ARIA attributes needed (future)
- **Color contrast:** High contrast for readability
- **Font sizes:** Responsive and readable

---

## User Experience

### Visual Design
- **Gradient backgrounds:** Purple-blue-pink gradient
- **Card-based layout:** Clean, modern cards
- **Icon usage:** SVG icons for visual interest
- **Color coding:** Green for correct, red for incorrect
- **Progress indicators:** Visual progress bar

### Feedback Mechanisms
1. **Immediate visual feedback** on answer selection
2. **Animated transitions** between questions
3. **Detailed explanations** after each answer
4. **Score tracking** throughout quiz
5. **Encouraging messages** in results

---

## Integration

### Quiz Hub Integration

**File:** `src/pages/Quiz.jsx`

The Pattern Recognition Quiz is featured prominently on the Quiz Hub page:

```jsx
<Link
  to="/quiz/pattern-recognition"
  className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 hover:shadow-lg transition-all"
>
  <div className="absolute top-3 right-3">
    <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
      NEW
    </span>
  </div>
  <h2>Pattern Recognition Quiz</h2>
  {/* ... */}
</Link>
```

### App Routing

**File:** `src/App.jsx`

```jsx
import PatternRecognitionQuiz from "./pages/PatternRecognitionQuiz.jsx";

// In Routes
<Route path="/quiz/pattern-recognition" element={
  <ProtectedRoute>
    <PatternRecognitionQuiz />
  </ProtectedRoute>
} />
```

---

## Future Enhancements

### 1. **Difficulty Levels**
- Easy: Only show basic patterns
- Medium: Include variants
- Hard: Include rare patterns and artifacts

### 2. **Timed Mode**
- Add countdown timer
- Time limit per question (e.g., 60 seconds)
- Penalize for slow answers

### 3. **Performance Analytics**
- Track performance per category
- Identify weak areas
- Suggest targeted practice

### 4. **Progressive Difficulty**
- Start easy, increase difficulty
- Adaptive questioning based on performance

### 5. **Review Mode**
- Review all questions at end
- See all explanations
- Flag questions for later review

### 6. **Image Zoom**
- Click to enlarge EEG images
- Pan and zoom for detail inspection

### 7. **Annotation Mode**
- Allow users to mark features on image
- Draw on EEG to highlight findings

### 8. **Multiplayer Mode**
- Compete with other users
- Leaderboards
- Real-time challenges

### 9. **Study Sets**
- Create custom quiz sets
- Focus on specific patterns
- Save favorite questions

### 10. **Export Results**
- Download quiz results as PDF
- Share performance with instructors
- Track improvement over time

---

## Testing

### Manual Testing Checklist

1. **Quiz Start**
   - [ ] Navigate to `/quiz`
   - [ ] Click Pattern Recognition Quiz card
   - [ ] Verify introduction screen displays

2. **Category Filtering**
   - [ ] Click each category button
   - [ ] Verify selection highlights
   - [ ] Start quiz with different categories

3. **Question Display**
   - [ ] Verify EEG image displays (or placeholder)
   - [ ] Check 4 answer options show
   - [ ] Verify category badges display correctly

4. **Answer Selection**
   - [ ] Select each option
   - [ ] Verify visual selection state
   - [ ] Try changing selection before submit

5. **Submit Answer**
   - [ ] Submit correct answer
   - [ ] Submit incorrect answer
   - [ ] Verify explanation displays
   - [ ] Check score updates correctly

6. **Navigation**
   - [ ] Click "Next Question"
   - [ ] Verify progress bar updates
   - [ ] Complete all 20 questions

7. **Results Screen**
   - [ ] Verify final score displays
   - [ ] Check pass/fail status
   - [ ] Test all action buttons

### Edge Cases

- **No images available:** Quiz should still work with placeholders
- **< 4 patterns in category:** Alert and prevent quiz start
- **Network slow loading:** Image error handling
- **Browser back button:** State should persist (currently resets)

---

## Troubleshooting

### Quiz Won't Start
1. Check browser console for errors
2. Verify patterns data loaded correctly
3. Check category filter has enough patterns
4. Ensure user is authenticated

### Images Not Displaying
1. Check `public/images/patterns/` directory
2. Verify image file names match pattern data
3. Check browser network tab for 404 errors
4. Confirm image paths in JSON are correct

### Score Not Updating
1. Check `handleSubmitAnswer()` function
2. Verify state updates correctly
3. Check for React strict mode double renders

---

## Performance Considerations

- **Pattern data size:** ~2000 patterns, minimal load time
- **Image loading:** Lazy load or preload next question
- **State management:** Efficient React hooks
- **Re-renders:** Optimized with proper dependencies
- **Bundle size:** Single component, no external dependencies

---

## Support

For questions or issues:
1. Review this guide
2. Check pattern data structure in JSON
3. Verify image paths and files
4. Test with different categories

---

## Changelog

### Version 1.0.0 (Feb 5, 2026)
- Initial release
- 20-question format
- Category filtering (5 categories)
- Visual pattern identification
- Instant feedback with explanations
- Score tracking and results screen
- Integration with Quiz Hub
- Protected route requiring authentication
