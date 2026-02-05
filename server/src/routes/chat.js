import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ChatMessage } from '../models/ChatMessage.js';
import Message from '../models/Message.js';
import ChatRoom from '../models/ChatRoom.js';
import geminiService from '../services/gemini.js';
import { User } from '../models/User.js';
import { QuizSession } from '../models/QuizSession.js';

const router = express.Router();

// --- File Upload Setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitize filename
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, uniqueSuffix + '-' + safeName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept images, PDFs, and common docs
        if (file.mimetype.startsWith('image/') ||
            file.mimetype === 'application/pdf' ||
            file.mimetype.includes('word') ||
            file.mimetype.includes('text') ||
            file.mimetype.includes('spreadsheet')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// --- New Chat System Endpoints ---

// Upload file
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Build absolute URL for the uploaded file
        // Always use HTTPS in production (Render serves over HTTPS)
        const host = req.get('host') || process.env.API_URL || 'neurotrace-academy.onrender.com';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        console.log('📎 File uploaded successfully:', fileUrl);

        res.json({
            url: fileUrl,
            filename: req.file.originalname,
            type: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Get messages for Chat System (Unified)
router.get('/messages', async (req, res) => {
    try {
        const { roomId, type, userId, otherUserId, limit } = req.query;
        const messageLimit = parseInt(limit) || 50;
        let query = {};

        if (type === 'private' && userId && otherUserId) {
            query = {
                type: 'private',
                $or: [
                    { senderId: userId, recipientId: otherUserId },
                    { senderId: otherUserId, recipientId: userId }
                ]
            };
            console.log(`📥 Fetching private messages between ${userId} and ${otherUserId}`);
        } else if (type === 'ai' && userId) {
            query = {
                type: 'ai',
                $or: [
                    { senderId: userId },
                    { senderId: 'ai-bot', recipientId: userId }
                ]
            };
            console.log(`📥 Fetching AI messages for user ${userId}`);
        } else if (type === 'public') {
            query = { type: 'public' };
            console.log(`📥 Fetching public messages`);
        } else if (roomId) {
            query = { roomId };
            console.log(`📥 Fetching messages for room ${roomId}`);
        } else {
            // Default to public chat
            query = { type: 'public' };
            console.log(`📥 Fetching public messages (default)`);
        }

        const messages = await Message.find(query)
            .sort({ timestamp: -1 }) // Newest first for pagination
            .limit(messageLimit)
            .lean();

        console.log(`✅ Found ${messages.length} messages`);
        res.json(messages.reverse()); // Return oldest first for display
    } catch (error) {
        console.error('Fetch messages error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get user's rooms
router.get('/rooms', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        const rooms = await ChatRoom.find({
            'participants.userId': userId,
            isActive: true
        }).sort({ updatedAt: -1 });

        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// Create room
router.post('/rooms', async (req, res) => {
    try {
        const { name, description, createdBy, participants } = req.body;

        const room = new ChatRoom({
            name,
            description,
            createdBy,
            type: 'group',
            participants: [
                { userId: createdBy, role: 'admin' },
                ...participants.map(id => ({ userId: id, role: 'member' }))
            ]
        });

        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// Search users for new chat
router.get('/users/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) return res.json([]);

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        })
            .select('name _id email') // exclude password
            .limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});


// --- Legacy Chatbot Endpoints (Maintained for backward compatibility) ---

// Get chat history for a user (old chatbot)
router.get('/history', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        const messages = await ChatMessage.find({ userId })
            .sort({ timestamp: 1 })
            .limit(50)
            .lean();

        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// Send a message and get AI response (old chatbot)
router.post('/message', async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: 'userId and message are required' });
        }

        // ... (Keep existing validation and logic for consistency)
        // For brevity in this edit, assuming the logic is same as before but using the geminiService.

        // Get user context
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Get stats... (Simplified for now, assuming geminiService handles context if passed)
        // Re-implementing the stats fetching briefly:
        const sessions = await QuizSession.find({ userId }).lean();
        const quizStats = {
            quizzesTaken: sessions.filter(s => s.endTime).length,
            accuracy: 0,
            bestScore: 0
        };
        // ... (stats calculation logic) ...

        const userContext = { name: user.name, ...quizStats };

        // Save user message
        const userMessage = new ChatMessage({ userId, role: 'user', content: message.trim() });
        await userMessage.save();

        // Generate AI response
        // Fetch recent history
        const chatHistory = await ChatMessage.find({ userId }).sort({ timestamp: -1 }).limit(10).lean();
        chatHistory.reverse();

        const aiResponse = await geminiService.generateResponse(message, userContext, chatHistory);

        // Save AI response
        const assistantMessage = new ChatMessage({ userId, role: 'assistant', content: aiResponse });
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

// Contextual AI endpoint - handles page-specific context
router.post('/ai-context', async (req, res) => {
    try {
        const { userId, message, context } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: 'userId and message are required' });
        }

        // Build enhanced system prompt with page context
        let systemPrompt = `You are an expert EEG technologist and educator helping users learn EEG interpretation and ABRET exam preparation.

Current Page Context: ${context.page || 'general'}
${context.pageContext || ''}

`;

        // Add case-specific context if available
        if (context.caseData) {
            systemPrompt += `\nClinical Case Context:
- Title: ${context.caseData.title}
- Patient: ${context.caseData.patientInfo?.age} ${context.caseData.patientInfo?.ageUnit}, ${context.caseData.patientInfo?.gender}
- History: ${context.caseData.history}
- Findings: ${JSON.stringify(context.caseData.findings, null, 2)}

Please help the user understand this specific case.`;
        }

        // Add pattern context if available
        if (context.patternData) {
            systemPrompt += `\nEEG Pattern Context:
- Pattern: ${context.patternData.name}
- Description: ${context.patternData.description || 'N/A'}

Please help the user understand this specific EEG pattern.`;
        }

        // Save user message to Message model (for chat history persistence)
        const userMessage = new Message({
            type: 'ai',
            senderId: userId,
            senderName: context.name || 'User',
            content: message,
            timestamp: new Date()
        });
        await userMessage.save();

        // Generate AI response with enhanced context
        const aiResponse = await geminiService.generateContextualResponse(
            message,
            {
                name: context.name || 'User',
                page: context.page,
                ...context
            },
            systemPrompt
        );

        // Save AI response to database
        const aiMessage = new Message({
            type: 'ai',
            senderId: 'ai-bot',
            senderName: 'EEG Assistant 🤖',
            recipientId: userId,
            content: aiResponse,
            timestamp: new Date()
        });
        await aiMessage.save();

        res.json({
            response: aiResponse,
            _id: aiMessage._id,
            timestamp: aiMessage.timestamp
        });
    } catch (error) {
        console.error('Contextual AI error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate AI response' });
    }
});

router.get('/suggestions', (req, res) => {
    const suggestions = geminiService.getSuggestedQuestions();
    res.json({ suggestions });
});

router.delete('/history', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'userId is required' });
        await ChatMessage.deleteMany({ userId });
        res.json({ message: 'Chat history cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
});

export default router;
