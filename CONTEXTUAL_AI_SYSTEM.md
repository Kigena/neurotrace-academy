# Contextual AI System

## Overview
The Contextual AI System provides an intelligent, page-aware AI assistant that appears throughout the application, offering context-specific help based on what the user is viewing.

## ✨ Key Features

### 1. **Floating AI Widget**
- 🎯 Appears on all major pages
- 💬 Accessible via a floating button (bottom-right corner)
- 🎨 Beautiful gradient design with pulse animation
- 📱 Responsive and mobile-friendly

### 2. **Context Awareness**
The AI knows exactly where it is and adapts its responses:

| Page | Context Provided | AI Capabilities |
|------|------------------|-----------------|
| **Case Detail** | Full case data (history, findings, patient info) | Diagnoses, EEG interpretation, differential diagnoses, treatment options |
| **Cases List** | Browsing cases | General case discussion, study tips |
| **Pattern Detail** | Specific pattern info | Pattern explanation, identification tips, clinical significance |
| **Patterns List** | Browsing patterns | Pattern comparisons, study guidance |
| **Quiz Session** | Quiz mode | Concept explanation (no direct answers!), pattern clarification |

### 3. **Smart Suggestions**
Each page provides contextual quick questions:
- Case Detail: "What is the most likely diagnosis?"
- Pattern Detail: "What causes this pattern?"
- Quiz: "Explain spike-and-wave patterns"

### 4. **Persistent Chat History**
- All conversations saved to database
- Message history persists across sessions
- Associated with user account

## 🏗️ Architecture

### Frontend Components

#### `ContextualAI.jsx`
Main widget component that:
- Displays floating button
- Manages chat window state
- Builds context-specific prompts
- Handles message sending/receiving
- Shows suggested questions based on page

**Props:**
```javascript
{
  context: {
    page: string,           // 'case-detail', 'patterns', 'quiz', etc.
    caseData?: object,      // Full case object (if on case page)
    patternData?: object,   // Pattern object (if on pattern page)
    syndromeData?: object   // Syndrome object (if on syndrome page)
  }
}
```

### Backend API

#### Endpoint: `POST /api/chat/ai-context`
Handles contextual AI requests with enriched page context.

**Request Body:**
```javascript
{
  userId: string,
  message: string,
  context: {
    name: string,
    page: string,
    pageContext: string,
    caseData?: object,
    patternData?: object
  }
}
```

**Response:**
```javascript
{
  response: string,      // AI response text
  _id: string,          // Message ID
  timestamp: Date       // Message timestamp
}
```

#### Enhanced Gemini Service
`generateContextualResponse(message, userContext, customSystemPrompt)`
- Accepts custom system prompts with page context
- Generates responses aware of current page and content
- Maintains high-quality educational focus

## 📍 Implementation Locations

### Pages with Contextual AI:
1. ✅ `src/pages/CaseDetail.jsx` - Case-specific assistance
2. ✅ `src/pages/Cases.jsx` - General case browsing help
3. ✅ `src/pages/PatternDetail.jsx` - Pattern-specific help
4. ✅ `src/pages/Patterns.jsx` - Pattern library navigation
5. ✅ `src/pages/QuizSession.jsx` - Quiz assistance (concept help only)

### Backend Files:
1. ✅ `server/src/routes/chat.js` - New `/ai-context` endpoint
2. ✅ `server/src/services/gemini.js` - New `generateContextualResponse()` method

## 🎓 Educational Design

### Quiz Mode Special Behavior
When on a quiz page, the AI:
- ❌ **Does NOT** give direct answers
- ✅ **Does** explain concepts and patterns
- ✅ **Does** help with understanding
- ✅ **Does** encourage critical thinking

Example Quiz Prompt:
```
"You are taking a quiz. I can help explain concepts, but I won't give you 
direct answers! Ask me to explain any EEG patterns or concepts you're unsure about."
```

## 🎨 UI/UX Features

### Visual Design
- **Floating Button:** Gradient purple/indigo with pulse animation
- **Chat Window:** 
  - 400px wide × 600px tall
  - Rounded corners, shadow
  - Gradient header
  - Context banner showing current page

### User Experience
- **One-Click Access:** Always visible, never intrusive
- **Smart Positioning:** Bottom-right, doesn't block content
- **Context Hints:** Banner shows what page AI is aware of
- **Quick Questions:** Suggested questions for each context
- **Real-time Typing:** Loading animation during AI response

## 🔒 Security & Privacy

### Authentication
- ✅ AI widget only visible to logged-in users
- ✅ User ID required for all AI requests
- ✅ Messages associated with user accounts

### Data Handling
- ✅ Only sends necessary context (no sensitive data)
- ✅ Patient info sanitized before sending to AI
- ✅ All messages saved to database for history

## 🚀 Usage Examples

### Example 1: Case Discussion
**Page:** Case Detail - "Absence Seizure Pattern"

**AI Context:**
```
You are viewing a clinical case: "Absence Seizure Pattern"
Patient: 8 years, Female
History: Brief staring spells, unresponsive for 5-10 seconds
Findings: 3 Hz spike-and-wave discharges

How can I help you understand this case?
```

**User:** "What is the most likely diagnosis?"

**AI:** "Based on the 3 Hz spike-and-wave pattern in an 8-year-old with brief 
staring spells, this is characteristic of **Childhood Absence Epilepsy**..."

### Example 2: Pattern Learning
**Page:** Pattern Detail - "Sleep Spindles"

**AI Context:**
```
You are viewing the EEG pattern: "Sleep Spindles"
Description: 12-14 Hz waveforms during stage 2 sleep

Ask me anything about this pattern!
```

**User:** "How do I identify it?"

**AI:** "Sleep spindles are identified by their distinctive characteristics..."

### Example 3: Quiz Help
**Page:** Quiz Session

**User:** "What's the answer to question 5?"

**AI:** "I can't give you the direct answer, but I can help you understand 
the concepts! What pattern or topic is the question about?"

## 📊 Benefits

### For Students
- 🎯 **Context-aware help** - No need to re-explain what you're looking at
- 💡 **Instant clarification** - Questions answered immediately
- 📚 **Learning support** - Explanations, not just answers
- 🔄 **Continuous availability** - Always accessible

### For Learning Outcomes
- ✅ Improved comprehension of complex cases
- ✅ Better pattern recognition skills
- ✅ Deeper understanding through questioning
- ✅ Encourages active learning

### For User Experience
- ✨ Seamless integration across all pages
- 🎨 Non-intrusive floating design
- 📱 Consistent experience everywhere
- ⚡ Fast, real-time responses

## 🛠️ Future Enhancements

### Potential Improvements
1. **Image Analysis:** Upload EEG images for AI interpretation
2. **Study Plans:** AI-generated personalized study schedules
3. **Voice Input:** Speak questions instead of typing
4. **Multi-language:** Support for non-English speakers
5. **Advanced Context:** Track user's learning progress and adapt
6. **Collaborative Learning:** Share AI conversations with peers
7. **Offline Mode:** Cache common responses for offline access

### Technical Improvements
1. **Caching:** Cache common questions per page type
2. **Streaming:** Stream AI responses word-by-word
3. **Rate Limiting:** Prevent API abuse
4. **Analytics:** Track most common questions per page
5. **A/B Testing:** Test different prompt strategies

## 🧪 Testing the System

### Manual Testing Steps

1. **Test Case Detail Page:**
   ```
   1. Navigate to any case detail page
   2. Click the floating AI button
   3. Verify context banner shows case title
   4. Try suggested question
   5. Ask custom question about the case
   6. Verify AI responds with case-specific info
   ```

2. **Test Pattern Page:**
   ```
   1. Go to pattern detail
   2. Open AI widget
   3. Ask "What causes this pattern?"
   4. Verify AI knows which pattern you're viewing
   ```

3. **Test Quiz Mode:**
   ```
   1. Start a quiz
   2. Open AI widget
   3. Try to ask for direct answer
   4. Verify AI refuses but offers concept help
   ```

4. **Test Message Persistence:**
   ```
   1. Send a message to AI
   2. Refresh page
   3. Reopen AI widget
   4. Verify message history is preserved
   ```

### API Testing
```bash
# Test contextual AI endpoint
curl -X POST http://localhost:5003/api/chat/ai-context \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "message": "What is hypsarrhythmia?",
    "context": {
      "name": "Test User",
      "page": "patterns",
      "pageContext": "Browsing EEG patterns"
    }
  }'
```

## 📝 Code Examples

### Adding AI to a New Page

```javascript
import ContextualAI from "../components/ContextualAI.jsx";

function MyNewPage() {
  const [myData, setMyData] = useState(null);
  
  return (
    <>
      <section>
        {/* Your page content */}
      </section>
      
      {/* Add Contextual AI */}
      <ContextualAI
        context={{
          page: 'my-new-page',
          // Add any relevant data
          myData: myData
        }}
      />
    </>
  );
}
```

### Custom Context in Gemini Service

```javascript
// In server/src/services/gemini.js
const customPrompt = `
You are helping a user on the ${context.page} page.

Current Context:
${context.customInfo}

Provide helpful, educational responses.
`;

const response = await geminiService.generateContextualResponse(
  userMessage,
  userContext,
  customPrompt
);
```

## 🎓 Best Practices

### When Building Context
1. ✅ **Include relevant data only** - Don't send entire objects
2. ✅ **Sanitize sensitive info** - Remove PHI/PII before sending
3. ✅ **Be specific** - "viewing Case X" vs "on cases page"
4. ✅ **Provide structure** - Use consistent format for context

### When Writing Prompts
1. ✅ **Be explicit about role** - "You are an EEG educator..."
2. ✅ **Set clear boundaries** - "Don't give quiz answers"
3. ✅ **Provide context first** - Page info before constraints
4. ✅ **Encourage thinking** - "Help users understand"

## 📚 Related Documentation
- [Chat System](CHAT_FIXES_SUMMARY.md)
- [AI Integration](server/src/services/gemini.js)
- [User Context](src/contexts/AuthContext.jsx)

---

## 🎉 Summary

The Contextual AI System transforms the learning experience by providing intelligent, page-aware assistance throughout the application. Students can now:

- **Learn faster** with context-specific help
- **Understand deeper** through interactive questioning
- **Practice better** with quiz support that encourages thinking
- **Study smarter** with AI that knows what they're looking at

This system represents a significant enhancement to the educational value of NeuroTrace Academy! 🚀
