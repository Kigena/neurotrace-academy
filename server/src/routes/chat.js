import express from 'express';
import { ChatMessage } from '../models/ChatMessage.js';
import geminiService from '../services/gemini.js';
import { User } from '../models/User.js';
import { QuizSession } from '../models/QuizSession.js';

const router = express.Router();

// Get chat history for a user
router.get('/history', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const messages = await ChatMessage.find({ userId })
            .sort({ timestamp: 1 })
            .limit(50) // Last 50 messages
            .lean();

        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// Send a message and get AI response
router.post('/message', async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: 'userId and message are required' });
        }

        // Validate message length
        if (message.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        if (message.length > 1000) {
            return res.status(400).json({ error: 'Message is too long (max 1000 characters)' });
        }

        // Get user context for personalized responses
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's quiz statistics
        const sessions = await QuizSession.find({ userId }).lean();
        const quizStats = {
            quizzesTaken: sessions.filter(s => s.endTime).length,
            accuracy: 0,
            bestScore: 0
        };

        if (sessions.length > 0) {
            let totalCorrect = 0;
            let totalQuestions = 0;

            sessions.forEach(session => {
                if (session.answers) {
                    const correct = Object.values(session.answers).filter(a => a.isCorrect).length;
                    const total = Object.keys(session.answers).length;
                    totalCorrect += correct;
                    totalQuestions += total;

                    const scorePercent = total > 0 ? (correct / total) * 100 : 0;
                    if (scorePercent > quizStats.bestScore) {
                        quizStats.bestScore = Math.round(scorePercent);
                    }
                }
            });

            quizStats.accuracy = totalQuestions > 0
                ? Math.round((totalCorrect / totalQuestions) * 100)
                : 0;
        }

        const userContext = {
            name: user.name,
            ...quizStats
        };

        // Get recent chat history for context
        const chatHistory = await ChatMessage.find({ userId })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();

        chatHistory.reverse(); // Oldest first

        // Save user message
        const userMessage = new ChatMessage({
            userId,
            role: 'user',
            content: message.trim()
        });
        await userMessage.save();

        // Generate AI response
        const aiResponse = await geminiService.generateResponse(
            message,
            userContext,
            chatHistory
        );

        // Save AI response
        const assistantMessage = new ChatMessage({
            userId,
            role: 'assistant',
            content: aiResponse
        });
        await assistantMessage.save();

        res.json({
            response: aiResponse,
            timestamp: assistantMessage.timestamp,
            messageId: assistantMessage._id
        });
    } catch (error) {
        console.error('Error processing chat message:', error);
        res.status(500).json({ error: error.message || 'Failed to process message' });
    }
});

// Get suggested questions
router.get('/suggestions', (req, res) => {
    const suggestions = geminiService.getSuggestedQuestions();
    res.json({ suggestions });
});

// Clear chat history for a user
router.delete('/history', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        await ChatMessage.deleteMany({ userId });
        res.json({ message: 'Chat history cleared' });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
});

export default router;
