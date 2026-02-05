# Case Discussion AI Enhancements

## Overview
Enhanced the case discussion system with AI-powered features to help users collaborate more effectively, reconcile different interpretations, and maintain structured discussions.

## New Features

### 1. AI @Mentions
Users can mention the AI assistant directly in discussions to get expert guidance.

**How to Use:**
- Type `@Neurotrace` or `@AI` in any comment
- Ask specific questions about EEG patterns, findings, or interpretations
- AI responds automatically as a threaded reply

**Example:**
```
User: "@Neurotrace explain why this is not breach rhythm?"
AI: "Breach rhythm typically shows sharp transients over a skull defect 
     with specific waveform morphology. In this case, the waveforms lack..."
```

**Features:**
- Automatic AI response triggered by mentions
- Context-aware: AI has access to full case details and recent discussion
- Educational focus: Explains reasoning, not just answers
- Visible indicator when AI will respond

### 2. Opinion Reconciliation
When discussion participants have conflicting interpretations, AI can analyze and explain the decisive features.

**How to Use:**
1. Click "🔄 Reconcile Views" button
2. Select 2 or more comments with different opinions
3. Click "Reconcile" to generate analysis

**AI Response Format:**
- **Key Differences:** What distinguishes the interpretations
- **Decisive Features:** Which EEG findings resolve the conflict
- **Analysis:** Which view is better supported and why
- **Learning Point:** Educational takeaway

**Use Cases:**
- "Is this artifact or pathological?"
- "Focal vs. generalized seizure origin?"
- "Normal variant vs. abnormality?"

### 3. Discussion Structure
AI can organize free-form discussions into a clear, structured format.

**How to Use:**
- Click "📋 Structure Discussion" button
- AI analyzes all comments and creates organized summary

**Output Format:**

**What We Know (Established Findings):**
- Agreed-upon EEG patterns
- Clear findings identified
- Relevant clinical history

**What We Need (Questions & Gaps):**
- Unanswered questions
- Additional information needed
- Areas of debate

**Working Impression (Current Consensus):**
- Most likely interpretation
- Differential diagnoses
- Next steps

**Benefits:**
- Helps new participants quickly understand discussion state
- Identifies knowledge gaps
- Moves discussion forward productively
- Great for complex cases with many comments

## Technical Implementation

### Backend Changes

#### 1. Enhanced Comment Schema (`server/src/models/CommunityCase.js`)
```javascript
{
    userId: ObjectId,           // Optional for AI comments
    content: String,
    isAI: Boolean,             // Identifies AI-generated comments
    aiType: String,            // 'response', 'reconciliation', 'structure'
    replyTo: ObjectId,         // Thread parent comment
    mentionedUsers: [ObjectId], // Track @mentions
    createdAt: Date
}
```

#### 2. New API Endpoints (`server/src/routes/cases.js`)

**POST `/api/cases/:id/comment`**
- Enhanced to detect @mentions
- Automatically triggers AI response when mentioned
- Returns full updated comment array

**POST `/api/cases/:id/reconcile`**
- Body: `{ commentIds: [id1, id2, ...], question?: string }`
- Analyzes conflicting comments
- Generates reconciliation response

**POST `/api/cases/:id/structure`**
- No body required
- Analyzes all discussion comments
- Generates structured summary

#### 3. Gemini AI Service (`server/src/services/gemini.js`)

**New Methods:**

`generateCaseDiscussionResponse(mentionText, caseData, recentComments)`
- Responds to @mentions
- Context includes full case and recent discussion
- Focuses on education, not diagnosis

`reconcileOpinions(question, conflictingComments, caseData)`
- Compares different interpretations
- Identifies decisive features
- Provides objective analysis

`structureDiscussion(comments, caseData)`
- Organizes discussion into sections
- Synthesizes multiple viewpoints
- Highlights consensus and gaps

### Frontend Changes

#### 1. Enhanced CaseDiscussion Component (`src/components/CaseDiscussion.jsx`)

**New Features:**
- @mention autocomplete button
- AI response detection indicator
- Reconciliation mode with comment selection
- Structure request button
- Reply threading
- Distinguished styling for AI comments

**State Management:**
```javascript
- replyTo: string              // Current reply target
- selectedForReconcile: []     // Comments selected for reconciliation
- showReconcileMode: boolean   // Toggle reconcile selection UI
- isRequestingAI: boolean      // Loading state for AI requests
```

**Visual Indicators:**
- AI comments: Gradient background (indigo-purple)
- AI avatar: "AI" badge with gradient
- Type badges: "Reconciliation", "Structure"
- Selection: Purple ring around selected comments
- Mention indicator: Shows when AI will respond

#### 2. Updated CaseService (`src/services/caseService.js`)

**New Methods:**
```javascript
addComment(caseId, content, replyTo)
requestReconciliation(caseId, commentIds, question)
requestStructure(caseId)
```

## User Experience

### For Learners
- Get instant expert guidance on confusing findings
- See how experts reconcile different interpretations
- Learn critical thinking through AI analysis
- Understand structured approach to EEG interpretation

### For Educators
- AI assists without replacing human expertise
- Maintains educational focus
- Encourages discussion rather than ending it
- Teaches systematic analysis

### For Discussion Quality
- Reduces confusion from conflicting opinions
- Keeps discussions organized and productive
- Provides reference points for learning
- Encourages evidence-based interpretations

## AI Behavior Guidelines

### Response Style
- Educational, not diagnostic
- 2-4 paragraphs max
- Proper EEG terminology
- References ABRET standards
- Acknowledges uncertainty when appropriate

### Context Awareness
- Full case details (history, findings, demographics)
- Recent discussion (last 10 comments)
- Specific question asked
- Clinical significance focus

### Limitations
- Does not provide definitive diagnoses
- Encourages critical thinking
- Points out when more information is needed
- Respectful of all participant opinions

## Testing Scenarios

### 1. AI Mention Test
```
1. Open any community case
2. Add comment: "@Neurotrace what pattern is shown here?"
3. Verify AI responds automatically
4. Check AI comment has gradient background
5. Verify response is contextually relevant
```

### 2. Reconciliation Test
```
1. Find case with 2+ differing opinions
2. Click "Reconcile Views"
3. Select conflicting comments
4. Click "Reconcile"
5. Verify AI provides structured comparison
6. Check "Reconciliation" badge appears
```

### 3. Structure Test
```
1. Find case with 5+ comments
2. Click "Structure Discussion"
3. Verify AI organizes into three sections
4. Check "Structure" badge appears
5. Verify synthesis is accurate
```

### 4. Reply Threading Test
```
1. Click "Reply" on any comment
2. Verify reply indicator shows
3. Post reply
4. Check replyTo linkage in data
```

## Future Enhancements

### Potential Additions
- **Threaded View:** Visual threading of replies
- **Vote System:** Upvote helpful comments/AI responses
- **AI Confidence:** Show AI certainty level
- **Follow-up Questions:** Suggested clarifying questions
- **Discussion Summary:** Auto-generated case summary
- **Citation Links:** Link to pattern library/references
- **Notification:** Alert when AI responds to your mention
- **Discussion Templates:** Pre-structured discussion formats
- **Expert Highlighting:** Flag comments from verified experts

### Advanced AI Features
- **Pattern Detection:** Auto-suggest relevant patterns
- **Similar Cases:** Link to similar discussed cases
- **Quiz Generation:** Create questions from discussion
- **Learning Path:** Suggest study topics from discussion
- **Collaborative Diagnosis:** Multi-user diagnostic workflow

## Performance Considerations

### API Rate Limiting
- AI requests may take 5-10 seconds
- Loading states prevent duplicate requests
- Consider rate limiting per user/case

### Cost Optimization
- AI calls only on explicit user action (@mention, reconcile, structure)
- Context limited to relevant information
- Token limits enforced (1500-2000 tokens)

### Caching
- Consider caching AI responses for identical questions
- Store structured summaries until new comments added

## Security & Privacy

### Content Moderation
- All AI responses logged for review
- Admin can remove inappropriate AI comments
- User comments still require moderation for published cases

### Data Privacy
- AI receives case data (already anonymized)
- No patient identifiers in AI context
- Discussion content is case-related only

## Deployment Notes

### Environment Variables
Ensure `GEMINI_API_KEY` is set in production:
```
GEMINI_API_KEY=your_api_key_here
```

### Database Migration
No migration needed - new fields have defaults and are optional.

### Testing Checklist
- [ ] @mention detection works
- [ ] AI responses appear correctly
- [ ] Reconciliation generates meaningful analysis
- [ ] Structure organizes discussions logically
- [ ] Visual styling distinguishes AI comments
- [ ] Error handling for AI failures
- [ ] Loading states work properly
- [ ] Mobile responsive layout

## Documentation Links
- Gemini AI API: https://ai.google.dev/docs
- Comment Schema: `server/src/models/CommunityCase.js`
- Discussion Component: `src/components/CaseDiscussion.jsx`
- AI Service: `server/src/services/gemini.js`

## Support & Troubleshooting

### Common Issues

**AI not responding to @mentions:**
- Check GEMINI_API_KEY is configured
- Verify spelling: @Neurotrace or @AI
- Check server logs for API errors

**Reconciliation fails:**
- Ensure at least 2 comments selected
- Check comments have content
- Verify API key has quota remaining

**Structure doesn't appear:**
- Need at least 3-4 comments for meaningful structure
- Check for API timeout (increase if needed)
- Review generated content for quality

### Debug Mode
Enable verbose logging in gemini.js:
```javascript
console.log('AI Request:', { prompt, context });
console.log('AI Response:', response);
```

## Credits
- AI powered by Google Gemini 2.5 Flash
- Discussion UX inspired by medical case collaboration platforms
- Structured discussion format based on clinical reasoning frameworks
