# Smart Search Feature Guide

**Last Updated:** February 5, 2026

## Overview

The Smart Search feature provides AI-powered natural language search across NeuroLinea's content, including cases, patterns, and educational resources. Users can ask questions in plain English and get relevant results instantly.

---

## Features

### 1. **AI-Powered Natural Language Search**
- Search using conversational queries
- Automatically detects search intent (cases, patterns, or resources)
- Returns ranked results with relevance scores

### 2. **Find Similar Cases**
- Embedded button in case detail pages
- AI analyzes case characteristics to find similar ones
- Displays similarity scores and relevance explanations

### 3. **Pattern Comparison**
- Compare EEG patterns (e.g., "triphasic waves vs GPDs")
- Highlights key distinguishing features
- Useful for learning differential diagnosis

### 4. **Resource Finder**
- Find where topics are covered in the academy
- Searches across patterns, syndromes, workflows, and standards
- Returns specific sections when applicable

---

## User Interface

### Search Button
- Located in the navbar (top right)
- **Keyboard shortcut:** `Ctrl+K` (or `⌘K` on Mac)
- Gradient blue/indigo button with search icon

### Search Modal
- Clean, modern interface with large search input
- Example queries to get started
- Real-time AI analysis with loading indicators
- Results displayed with relevance scores

### Similar Cases Button
- Located in case detail pages (below study notes)
- Purple/pink gradient button
- Shows AI-generated similarity analysis

---

## Example Queries

### Cases
```
"Find cases similar to absence seizures"
"Cases with pediatric patients"
"Show me artifact examples"
"Neonatal EEG cases"
```

### Patterns
```
"Show me triphasic waves vs GPDs"
"Compare spike-wave patterns"
"Difference between BECTS and benign variants"
"Sleep patterns in children"
```

### Resources
```
"Where do we cover electrode pop?"
"Find info on breach rhythm"
"Learn about montage selection"
"Where is artifact rejection explained?"
```

---

## Technical Implementation

### Frontend Components

#### `SmartSearch.jsx`
**Location:** `src/components/SmartSearch.jsx`

**Purpose:** Main search modal with natural language input

**Features:**
- Keyboard shortcut listener (Ctrl+K)
- Auto-detection of search intent
- Example queries for guidance
- Real-time AI search with loading states
- Results display with relevance scoring

#### `SimilarCasesButton.jsx`
**Location:** `src/components/SimilarCasesButton.jsx`

**Purpose:** Find cases similar to the current one

**Features:**
- Context-aware (uses current case title)
- AI analysis with loading spinner
- Collapsible results panel
- Direct navigation to similar cases

### Backend Services

#### AI Service (`gemini.js`)
**Location:** `server/src/services/gemini.js`

**New Methods:**

1. **`findSimilarCases(query, allCases, currentCaseId)`**
   - Analyzes query against case database
   - Returns 3-5 most relevant cases
   - Includes relevance score (0-100)

2. **`comparePatterns(query, allPatterns)`**
   - Compares EEG patterns based on query
   - Highlights key distinguishing features
   - Useful for differential diagnosis

3. **`findResourcesForTopic(query, resourceIndex)`**
   - Searches across patterns, syndromes, workflows
   - Returns specific sections when applicable
   - Explains relevance to query

#### API Route (`ai.js`)
**Location:** `server/src/routes/ai.js`

**New Endpoint:** `POST /api/ai/smart-search`

**Request Body:**
```json
{
  "query": "Find cases similar to absence seizures",
  "searchType": "cases|patterns|resources",
  "currentCaseId": "optional-case-id-to-exclude"
}
```

**Response:**
```json
{
  "results": [
    {
      "title": "Case title",
      "relevance": "Why this is relevant",
      "score": 85,
      "path": "/cases/123",
      "type": "case"
    }
  ],
  "searchType": "cases",
  "query": "Find cases similar to absence seizures"
}
```

---

## Integration Points

### Navbar
The `SmartSearch` component is integrated into the Navbar:

```jsx
import SmartSearch from "./SmartSearch";

// Inside Navbar component
<div className="flex items-center gap-4">
  <SmartSearch />
  {/* Other navbar items */}
</div>
```

### Case Detail Page
The `SimilarCasesButton` is added to case detail pages:

```jsx
import SimilarCasesButton from "../components/SimilarCasesButton.jsx";

// Inside CommunityCaseView component
<SimilarCasesButton 
  currentCaseId={eegCase._id}
  currentCaseTitle={eegCase.title}
/>
```

---

## Search Intent Detection

The system automatically detects search intent based on keywords:

| Keywords | Search Type |
|----------|-------------|
| "case", "similar", "patient" | Cases |
| "pattern", "wave", "rhythm", "vs", "compare" | Patterns |
| "where", "cover", "learn", "resource", "find" | Resources |
| Default | Cases |

---

## AI Response Format

### Case Search Results
```javascript
{
  caseId: "123",
  title: "Case title",
  relevance: "This case involves similar seizure patterns...",
  score: 85 // 0-100 match score
}
```

### Pattern Comparison Results
```javascript
{
  patternId: "triphasic-waves",
  name: "Triphasic Waves",
  reason: "Relevant for comparison with GPDs",
  key_differences: "Triphasic waves have characteristic phase reversal..."
}
```

### Resource Finder Results
```javascript
{
  title: "Electrode Pop Artifact",
  type: "pattern",
  path: "/patterns/electrode-pop",
  relevance: "This resource covers electrode pop detection and removal",
  section: "Artifacts > Technical Artifacts"
}
```

---

## Performance Considerations

1. **Case Limit:** Searches up to 100 published cases
2. **Pattern Limit:** Searches up to 30 patterns
3. **AI Timeout:** 30-second timeout for AI responses
4. **Token Usage:** 2000 max output tokens per search
5. **Temperature:** 0.3 for consistent results

---

## User Experience

### Loading States
- **Initial State:** Example queries and search categories
- **Searching:** Animated spinner with context-specific message
- **Results:** Ranked list with relevance scores and visual indicators
- **No Results:** Helpful message with search tips

### Keyboard Navigation
- `Ctrl+K` / `⌘K`: Open search
- `Escape`: Close search modal
- `Enter`: Execute search

### Visual Feedback
- Gradient progress bars for match scores
- Color-coded result types (green=cases, purple=patterns, orange=resources)
- Hover effects on clickable results
- Disabled state for empty queries

---

## Error Handling

### Frontend Errors
- Network failures: Display user-friendly alert
- Empty queries: Disable search button
- Invalid responses: Fallback to empty results array

### Backend Errors
- AI service failures: Return 500 with error message
- Missing data: Return empty results
- Malformed JSON: Extract JSON from response text

---

## Future Enhancements

1. **Search History:** Save and suggest previous searches
2. **Filters:** Allow users to specify search type upfront
3. **Pagination:** Handle large result sets
4. **Bookmarks:** Save interesting search results
5. **Analytics:** Track popular queries to improve content

---

## Testing

### Manual Testing Checklist

1. **Basic Search**
   - [ ] Open search with Ctrl+K
   - [ ] Type query and press Enter
   - [ ] Verify results display
   - [ ] Click result to navigate

2. **Similar Cases**
   - [ ] Open any case detail page
   - [ ] Click "Find Similar Cases"
   - [ ] Verify AI analysis runs
   - [ ] Check similarity scores

3. **Pattern Comparison**
   - [ ] Search "triphasic waves vs GPDs"
   - [ ] Verify pattern results
   - [ ] Check key differences display

4. **Resource Finder**
   - [ ] Search "where do we cover electrode pop"
   - [ ] Verify resource results
   - [ ] Check section info

### Example Test Cases

```javascript
// Test queries
const testQueries = [
  "Find cases similar to absence seizures",
  "Show me triphasic waves vs GPDs",
  "Where do we cover electrode pop?",
  "Pediatric EEG patterns",
  "Compare spike and sharp waves"
];

// Expected behavior
testQueries.forEach(query => {
  console.log(`Testing: ${query}`);
  // Should return relevant results
  // Should detect correct search type
  // Should have relevance scores
});
```

---

## Troubleshooting

### Search Not Working
1. Check browser console for errors
2. Verify auth token is present
3. Check network tab for API call failures
4. Verify backend is running

### No Results
1. Try different search queries
2. Check if cases are published (status: 'published')
3. Verify AI service is properly configured
4. Check backend logs for AI errors

### Slow Performance
1. Reduce case limit in backend
2. Add loading timeout
3. Cache frequent searches
4. Optimize AI prompt length

---

## Deployment Notes

### Environment Variables
No additional environment variables required. Uses existing `GEMINI_API_KEY`.

### Database Requirements
- Access to `CommunityCase` model
- Cases must have `status: 'published'`

### File Dependencies
- `server/src/data/neurotrace_patterns_library_v2.json`
- `server/src/data/syndromes_v2.json`
- `server/src/data/workflow-domains.json`

---

## Support

For questions or issues:
1. Check this guide first
2. Review browser console for errors
3. Check backend logs for AI service errors
4. Test with example queries to isolate the issue

---

## Changelog

### Version 1.0.0 (Feb 5, 2026)
- Initial release
- Smart Search modal with natural language input
- Similar Cases button for case detail pages
- Pattern comparison search
- Resource finder across all content types
- Keyboard shortcuts (Ctrl+K)
- Auto-detection of search intent
