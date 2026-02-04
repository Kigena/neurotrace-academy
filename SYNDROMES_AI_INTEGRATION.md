# Syndromes Page AI Integration

## Overview
Added Contextual AI Assistant to both Syndromes pages (list and detail views) with syndrome-specific context and suggested questions.

## Changes Implemented

### 1. Syndromes List Page (`src/pages/Syndromes.jsx`)

**Added:**
- ContextualAI component import
- Contextual AI widget with `syndromes` page context
- Wrapped return in React Fragment

```jsx
import ContextualAI from "../components/ContextualAI.jsx";

return (
  <>
    <section className="space-y-6">
      {/* Syndromes list content */}
    </section>

    {/* Contextual AI Assistant */}
    <ContextualAI
      context={{
        page: 'syndromes'
      }}
    />
  </>
);
```

### 2. Syndrome Detail Page (`src/pages/SyndromeDetail.jsx`)

**Added:**
- ContextualAI component import
- Contextual AI widget with syndrome-specific data
- Wrapped return in React Fragment

```jsx
import ContextualAI from "../components/ContextualAI.jsx";

return (
  <>
    <div className="space-y-6">
      {/* Syndrome detail content */}
    </div>

    {/* Contextual AI Assistant */}
    <ContextualAI
      context={{
        page: 'syndrome-detail',
        syndromeData: syndrome
      }}
    />
  </>
);
```

### 3. Enhanced ContextualAI Component (`src/components/ContextualAI.jsx`)

**Updated `getContextPrompt()` for syndromes:**

```javascript
case 'syndrome-detail':
    return `You are viewing the syndrome: "${syndromeData?.name || 'Unknown'}".
Classification: ${syndromeData?.classification || 'N/A'}
Age Range: ${syndromeData?.age_range || 'N/A'}
${syndromeData?.description ? `Description: ${syndromeData.description}` : ''}

What would you like to know about this syndrome?`;

case 'syndromes':
    return `You are browsing EEG syndromes and epilepsy classifications. I can help you understand syndrome characteristics, diagnostic criteria, and clinical features!`;
```

**Updated `getSuggestedQuestions()` for syndromes:**

```javascript
case 'syndrome-detail':
    return [
        `What is ${syndromeData?.name}?`,
        "What are the typical EEG patterns?",
        "What is the age of onset?",
        "How is it diagnosed?"
    ];

case 'syndromes':
    return [
        "What are the main epilepsy syndrome classifications?",
        "How do I differentiate similar syndromes?",
        "What are the most common syndromes?",
        "Explain the ILAE classification"
    ];
```

## Context Provided to AI

### Syndromes List Page
- **Page Type**: `syndromes`
- **Context**: General browsing of syndrome classifications
- **AI Capabilities**: 
  - Explain syndrome categories
  - Differentiate similar syndromes
  - Discuss classification systems
  - Answer general syndrome questions

### Syndrome Detail Page
- **Page Type**: `syndrome-detail`
- **Context Data**: Full syndrome object including:
  - Name
  - Classification
  - Age range
  - Description
  - Clinical features
  - Morphology
  - Diagnostic criteria
- **AI Capabilities**:
  - Explain specific syndrome
  - Discuss EEG patterns
  - Age of onset information
  - Diagnostic approach
  - Differential diagnosis

## Suggested Questions

### On Syndromes List Page
```
💡 What are the main epilepsy syndrome classifications?
💡 How do I differentiate similar syndromes?
💡 What are the most common syndromes?
💡 Explain the ILAE classification
```

### On Syndrome Detail Page (e.g., Childhood Absence Epilepsy)
```
💡 What is Childhood Absence Epilepsy?
💡 What are the typical EEG patterns?
💡 What is the age of onset?
💡 How is it diagnosed?
```

## User Experience

### Syndromes List Page

```
┌────────────────────────────────────────┐
│  EEG Syndromes Classification          │
│                                        │
│  [Syndromes Grid...]                   │
│                                        │
│  - Childhood Absence Epilepsy          │
│  - Juvenile Myoclonic Epilepsy         │
│  - West Syndrome                       │
│  - ...                                 │
└────────────────────────────────────────┘
                                    [🤖] ← Floating AI Button
```

**Click AI Button:**
```
┌──────────────────────────────────────┐
│ ⚡ EEG Assistant            [⋮] [✕]  │
│ Helping with: syndromes              │
│ 5 messages (last 50)                 │
├──────────────────────────────────────┤
│ 📍 Context: You are browsing EEG     │
│    syndromes and epilepsy...         │
├──────────────────────────────────────┤
│ ╔════════════════════════════════╗  │
│ ║ ⚡ Quick Help         [▼]       ║  │
│ ║────────────────────────────────║  │
│ ║ 💡 Main epilepsy classifications? │
│ ║ 💡 Differentiate similar syndromes?│
│ ║ 💡 Most common syndromes?       ║  │
│ ║ 💡 Explain ILAE classification  ║  │
│ ╚════════════════════════════════╝  │
└──────────────────────────────────────┘
```

### Syndrome Detail Page

```
┌────────────────────────────────────────┐
│  ← Back to syndromes                   │
│                                        │
│  Childhood Absence Epilepsy            │
│  [Genetic Generalized Epilepsy]        │
│                                        │
│  Classification: Genetic Epilepsy      │
│  Age Range: 4-10 years                 │
│                                        │
│  [Overview] [Clinical] [EEG] [...]     │
│                                        │
│  Description: Brief staring spells...  │
└────────────────────────────────────────┘
                                    [🤖] ← Floating AI Button
```

**Click AI Button:**
```
┌──────────────────────────────────────┐
│ ⚡ EEG Assistant            [⋮] [✕]  │
│ Helping with: syndrome detail        │
├──────────────────────────────────────┤
│ 📍 Context: "Childhood Absence        │
│    Epilepsy", Classification:         │
│    Genetic Epilepsy, Age: 4-10 years  │
├──────────────────────────────────────┤
│ ╔════════════════════════════════╗  │
│ ║ ⚡ Quick Help         [▼]       ║  │
│ ║────────────────────────────────║  │
│ ║ 💡 What is Childhood Absence    ║  │
│ ║    Epilepsy?                    ║  │
│ ║ 💡 What are the typical EEG     ║  │
│ ║    patterns?                    ║  │
│ ║ 💡 What is the age of onset?    ║  │
│ ║ 💡 How is it diagnosed?         ║  │
│ ╚════════════════════════════════╝  │
└──────────────────────────────────────┘
```

## AI Interaction Examples

### Example 1: Syndromes List Page

**User clicks:** "What are the main epilepsy syndrome classifications?"

**AI Response:**
```
The main epilepsy syndrome classifications according to the 
ILAE (International League Against Epilepsy) include:

1. Genetic Generalized Epilepsies (GGE)
   - Childhood Absence Epilepsy
   - Juvenile Myoclonic Epilepsy
   - Juvenile Absence Epilepsy

2. Focal Epilepsies
   - Benign Epilepsy with Centrotemporal Spikes (BECTS)
   - Temporal Lobe Epilepsy
   - Frontal Lobe Epilepsy

3. Epileptic Encephalopathies
   - West Syndrome (Infantile Spasms)
   - Lennox-Gastaut Syndrome
   - Dravet Syndrome

Would you like to know more about any specific classification?
```

### Example 2: Syndrome Detail Page (Childhood Absence Epilepsy)

**User clicks:** "What are the typical EEG patterns?"

**AI Response:**
```
In Childhood Absence Epilepsy, the typical EEG pattern is:

**3 Hz Spike-and-Wave Complexes**
- Generalized, bilaterally synchronous
- Regular 3 Hz frequency (2.5-3.5 Hz)
- High amplitude (typically >200 μV)
- Abrupt onset and termination
- Duration: Usually 4-20 seconds

**Key Features:**
- Appears during hyperventilation (activation procedure)
- Background activity is normal
- No focal abnormalities
- Provoked by eye closure in some cases

**Clinical Correlation:**
- Each discharge = brief absence seizure
- Patient shows behavioral arrest
- No memory of the event

Would you like to know more about diagnostic procedures or 
treatment options?
```

### Example 3: Differential Diagnosis

**User asks:** "How do I differentiate Childhood Absence from Juvenile Myoclonic Epilepsy?"

**AI Response:**
```
Great question! Here are the key differences:

**Age of Onset:**
- CAE: 4-10 years (peak 5-7)
- JME: 12-18 years (peak 15)

**EEG Pattern:**
- CAE: 3 Hz spike-wave
- JME: 4-6 Hz polyspike-wave

**Seizure Types:**
- CAE: Only absence seizures initially
- JME: Myoclonic jerks + generalized tonic-clonic

**Time of Day:**
- CAE: Throughout the day
- JME: Predominantly morning myoclonic jerks

**Prognosis:**
- CAE: Often remits in adolescence
- JME: Usually lifelong, but well-controlled

**Treatment:**
- CAE: Ethosuximide or valproate
- JME: Valproate, levetiracetam

Would you like more details about either syndrome?
```

## Benefits

### For Students
- ✅ **Context-Aware Help** - AI knows which syndrome they're viewing
- ✅ **Quick Questions** - One-click access to common queries
- ✅ **Differential Diagnosis** - Compare similar syndromes
- ✅ **Clinical Correlation** - Link EEG findings to syndromes
- ✅ **ILAE Classification** - Understand epilepsy categories

### For Learning
- ✅ **Syndrome Characteristics** - Learn defining features
- ✅ **EEG Patterns** - Understand typical findings
- ✅ **Age Relevance** - Know age ranges for syndromes
- ✅ **Diagnostic Approach** - Learn how to diagnose
- ✅ **Treatment Guidance** - Understand management options

### For Exam Prep
- ✅ **ABRET Relevant** - Covers exam-relevant syndromes
- ✅ **Classification Systems** - Master ILAE framework
- ✅ **Pattern Recognition** - Link patterns to syndromes
- ✅ **Differential Diagnosis** - Practice discrimination
- ✅ **Clinical Context** - Understand real-world application

## Integration Points

### 1. Syndromes List Page
- **AI Access**: Via floating button
- **Context**: General syndrome browsing
- **Use Case**: Learning about classifications, comparing syndromes

### 2. Syndrome Detail Page
- **AI Access**: Via floating button
- **Context**: Specific syndrome data
- **Use Case**: Deep dive into one syndrome, ask specific questions

### 3. Cross-Page Continuity
- **Chat History**: Shared across both pages
- **Context Switching**: AI adapts to current page
- **Conversation Flow**: Can discuss multiple syndromes

## Complete Page Coverage

The Contextual AI is now available on:

1. ✅ **Case Detail** - Case-specific help
2. ✅ **Cases List** - General case guidance
3. ✅ **Pattern Detail** - Pattern-specific explanations
4. ✅ **Patterns List** - Pattern library navigation
5. ✅ **Syndromes List** - Syndrome classifications **(NEW)**
6. ✅ **Syndrome Detail** - Specific syndrome help **(NEW)**
7. ✅ **Quiz Session** - Concept explanations (no answers)

## Files Changed

1. **src/pages/Syndromes.jsx**
   - Added ContextualAI import
   - Added AI widget with syndromes context
   - Wrapped return in fragment

2. **src/pages/SyndromeDetail.jsx**
   - Added ContextualAI import
   - Added AI widget with syndrome data
   - Wrapped return in fragment

3. **src/components/ContextualAI.jsx**
   - Added `syndromes` case to `getContextPrompt()`
   - Enhanced `syndrome-detail` case with more data
   - Added `syndromes` case to `getSuggestedQuestions()`
   - Added `syndrome-detail` case to suggested questions

## Testing Checklist

- [x] AI button appears on Syndromes list page
- [x] AI button appears on Syndrome detail page
- [x] Context banner shows correct page
- [x] Suggested questions relevant to syndromes
- [x] Click suggestion sends question
- [x] AI provides syndrome-specific answers
- [x] Chat history persists across pages
- [x] Can switch between syndromes and ask about each
- [x] Message counter and clear history work
- [x] Menu dropdown functions properly

---

## Summary

The Contextual AI Assistant is now fully integrated into **Syndromes pages**:

- 🎯 **Syndromes List** - General epilepsy classification help
- 🧠 **Syndrome Detail** - Specific syndrome deep dives
- 💡 **Smart Suggestions** - Relevant questions for each context
- 📚 **Educational Focus** - ILAE classification, EEG patterns, diagnosis
- 🔄 **Seamless Experience** - Same great AI across all pages

Students can now get **instant, context-aware help** with epilepsy syndromes! 🎉
