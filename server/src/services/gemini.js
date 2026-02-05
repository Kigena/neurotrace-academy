import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    /**
     * Build context-aware system prompt
     */
    buildSystemPrompt(userContext, eegPatterns) {
        return `You are an EEG teaching assistant for NeuroTrace Academy, an interactive platform for learning EEG interpretation.

User Context:
- Name: ${userContext.name || 'Student'}
- Quizzes taken: ${userContext.quizzesTaken || 0}
- Overall accuracy: ${userContext.accuracy || 0}%
- Best score: ${userContext.bestScore || 0}%

Your role:
1. Help students learn EEG interpretation and pattern recognition
2. Explain EEG patterns, syndromes, and clinical significance
3. Provide educational guidance, not just answers
4. Reference specific patterns and encourage critical thinking
5. Be supportive, clear, and use appropriate medical terminology

Available EEG Patterns in the database:
${eegPatterns || 'Loading pattern database...'}

Guidelines:
- When asked about patterns, reference their clinical significance
- For quiz help, explain the reasoning, don't just give answers
- Encourage learning through understanding, not memorization
- Be concise but thorough
- Use medical terminology appropriately for the student level`;
    }

    /**
     * Build pattern context from EEG patterns
     */
    buildPatternsContext() {
        // This will be populated with actual patterns from patterns.js
        // For now, including common patterns
        return `Common EEG Patterns:
- Spike-and-Wave: Brief sharp spike followed by slow wave, characteristic of absence seizures
- BECTS (Benign Epilepsy with Centrotemporal Spikes): High-amplitude centrotemporal spikes during sleep
- Hypsarrhythmia: Chaotic high-voltage slow waves with multifocal spikes (infantile spasms)
- 3 Hz Spike-Wave: Regular 3 Hz generalized spike-wave discharges (absence epilepsy)
- Photoparoxysmal Response: Epileptiform response to photic stimulation
- Alpha Rhythm: 8-12 Hz posterior dominant rhythm in awake, relaxed state
- Sleep Spindles: 12-14 Hz waveforms during stage 2 sleep
- K-Complexes: Sharp negative wave followed by positive component in sleep`;
    }

    /**
     * Generate AI response with context
     */
    async generateResponse(userMessage, userContext = {}, chatHistory = []) {
        try {
            const systemPrompt = this.buildSystemPrompt(
                userContext,
                this.buildPatternsContext()
            );

            // Build conversation history
            const conversationHistory = chatHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            // Start chat session with history
            const chat = this.model.startChat({
                history: conversationHistory,
                generationConfig: {
                    maxOutputTokens: 2000,
                    temperature: 0.7,
                },
            });

            // Add system context as first message if no history
            const contextualMessage = chatHistory.length === 0
                ? `${systemPrompt}\n\nUser question: ${userMessage}`
                : userMessage;

            const result = await chat.sendMessage(contextualMessage);
            const response = result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate AI response. Please try again.');
        }
    }

    /**
     * Generate contextual AI response with page-specific context
     * Used by the floating AI widget that appears on different pages
     */
    async generateContextualResponse(userMessage, userContext = {}, customSystemPrompt = null) {
        try {
            // Use custom system prompt if provided, otherwise build default
            const systemPrompt = customSystemPrompt || this.buildSystemPrompt(
                userContext,
                this.buildPatternsContext()
            );

            // Start chat with context
            const chat = this.model.startChat({
                generationConfig: {
                    maxOutputTokens: 2000,
                    temperature: 0.7,
                },
            });

            // Combine system prompt with user message
            const contextualMessage = `${systemPrompt}\n\nUser: ${userMessage}`;

            const result = await chat.sendMessage(contextualMessage);
            const response = result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API contextual error:', error);
            throw new Error('Failed to generate contextual AI response. Please try again.');
        }
    }

    /**
     * Generate quick suggestions for new users
     */
    getSuggestedQuestions() {
        return [
            "What are spike-and-wave patterns?",
            "Explain the difference between BECTS and absence seizures",
            "How do I identify hypsarrhythmia?",
            "What should I study first?",
            "Create a study plan for me"
        ];
    }

    /**
     * Generate AI response to @mentions in case discussions
     */
    async generateCaseDiscussionResponse(mentionText, caseData, recentComments = []) {
        try {
            const systemPrompt = `You are NeuroTrace AI, an expert EEG technologist assistant helping with case discussions.

Case Context:
- Title: ${caseData.title}
- Patient: ${caseData.patientInfo?.age} ${caseData.patientInfo?.ageUnit}, ${caseData.patientInfo?.gender}
- History: ${caseData.history}
- Findings:
  Background: ${caseData.findings?.background || 'Not specified'}
  Interictal: ${caseData.findings?.interictal || 'Not specified'}
  Ictal: ${caseData.findings?.ictal || 'Not specified'}
  Classification: ${caseData.findings?.classification || 'Not specified'}

Recent Discussion:
${recentComments.map((c, i) => `${i + 1}. ${c.userId?.name || 'User'}: ${c.content}`).join('\n')}

Your role in case discussions:
1. Answer specific questions about EEG patterns, rhythms, and findings
2. Explain clinical significance and differential diagnoses
3. Help identify artifacts vs. true patterns
4. Provide educational context without giving definitive diagnoses
5. Reference ABRET standards and best practices
6. Be concise but thorough (2-4 paragraphs max)

Guidelines:
- Focus on teaching EEG interpretation skills
- Acknowledge uncertainty when appropriate
- Encourage critical thinking
- Use proper terminology
- Be respectful of all discussion participants`;

            // Remove @mention from text
            const cleanedText = mentionText.replace(/@(Neurotrace|AI|NeurotraceAI)/gi, '').trim();

            const chat = this.model.startChat({
                generationConfig: {
                    maxOutputTokens: 1500,
                    temperature: 0.7,
                },
            });

            const result = await chat.sendMessage(`${systemPrompt}\n\nQuestion: ${cleanedText}`);
            return result.response.text();
        } catch (error) {
            console.error('Case discussion AI error:', error);
            throw new Error('Failed to generate discussion response');
        }
    }

    /**
     * Reconcile conflicting opinions in case discussions
     */
    async reconcileOpinions(question, conflictingComments, caseData) {
        try {
            const systemPrompt = `You are NeuroTrace AI, helping reconcile different interpretations in an EEG case discussion.

Case: ${caseData.title}

Conflicting Views:
${conflictingComments.map((c, i) => 
    `View ${String.fromCharCode(65 + i)} (${c.userId?.name || 'User'}): ${c.content}`
).join('\n\n')}

Your task:
1. Identify the key differences between these interpretations
2. Explain which EEG features or clinical factors are decisive
3. Discuss which view is more consistent with the case data
4. Acknowledge if both views have merit in certain contexts
5. Provide educational insights about the differential diagnosis

Format your response as:
**Key Differences:**
[Brief summary of what differs]

**Decisive Features:**
[What EEG findings or clinical factors resolve the conflict]

**Analysis:**
[Which interpretation is better supported and why]

**Learning Point:**
[Educational takeaway from this discussion]

Be objective, educational, and reference EEG interpretation principles.`;

            const chat = this.model.startChat({
                generationConfig: {
                    maxOutputTokens: 2000,
                    temperature: 0.7,
                },
            });

            const result = await chat.sendMessage(`${systemPrompt}\n\nQuestion: ${question}`);
            return result.response.text();
        } catch (error) {
            console.error('Opinion reconciliation AI error:', error);
            throw new Error('Failed to reconcile opinions');
        }
    }

    /**
     * Structure case discussion into organized sections
     */
    async structureDiscussion(comments, caseData) {
        try {
            const systemPrompt = `You are NeuroTrace AI, organizing a case discussion into a structured format.

Case: ${caseData.title}

Discussion Comments:
${comments.filter(c => !c.isAI).map((c, i) => 
    `${i + 1}. ${c.userId?.name || 'User'}: ${c.content}`
).join('\n')}

Your task: Organize this discussion into three clear sections:

**What We Know (Established Findings):**
- List agreed-upon EEG findings
- Note clear patterns/rhythms identified
- Include relevant clinical history points

**What We Need (Questions & Gaps):**
- Unanswered questions raised
- Additional information needed
- Areas of uncertainty or debate

**Working Impression (Current Consensus):**
- Most likely interpretation based on discussion
- Key differential diagnoses mentioned
- Next steps or recommendations if discussed

Guidelines:
- Be concise and organized
- Use bullet points for clarity
- Synthesize multiple similar points
- Maintain objectivity
- Highlight areas where more discussion is needed`;

            const chat = this.model.startChat({
                generationConfig: {
                    maxOutputTokens: 1500,
                    temperature: 0.7,
                },
            });

            const result = await chat.sendMessage(systemPrompt);
            return result.response.text();
        } catch (error) {
            console.error('Discussion structure AI error:', error);
            throw new Error('Failed to structure discussion');
        }
    }
}

export default new GeminiService();
