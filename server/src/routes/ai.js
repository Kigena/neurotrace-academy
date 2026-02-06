import express from 'express';
import auth from '../middleware/auth.js';
import geminiService from '../services/gemini.js';

const router = express.Router();

/**
 * Contextual AI Routes
 * For page-level AI features like "Explain this page", "Quiz me", etc.
 */

// Explain Page Content
router.post('/explain-page', auth, async (req, res) => {
    try {
        const { pageTitle, pageContent, contentType } = req.body;
        
        if (!pageTitle || !pageContent) {
            return res.status(400).json({ error: 'Page title and content required' });
        }

        const explanation = await geminiService.explainPage(pageTitle, pageContent, contentType);
        
        res.json({ explanation });
    } catch (error) {
        console.error('Explain page error:', error);
        res.status(500).json({ error: 'Failed to explain page' });
    }
});

// Generate Quiz from Page
router.post('/quiz-from-page', auth, async (req, res) => {
    try {
        const { pageTitle, pageContent } = req.body;
        
        if (!pageTitle || !pageContent) {
            return res.status(400).json({ error: 'Page title and content required' });
        }

        const quiz = await geminiService.generateQuizFromPage(pageTitle, pageContent);
        
        res.json({ quiz });
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// Convert Page to Study Notes
router.post('/study-notes', auth, async (req, res) => {
    try {
        const { pageTitle, pageContent } = req.body;
        
        if (!pageTitle || !pageContent) {
            return res.status(400).json({ error: 'Page title and content required' });
        }

        const studyNotes = await geminiService.convertToStudyNotes(pageTitle, pageContent);
        
        res.json({ studyNotes });
    } catch (error) {
        console.error('Study notes generation error:', error);
        res.status(500).json({ error: 'Failed to generate study notes' });
    }
});

// Check Content for PHI
router.post('/check-phi', auth, async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Content required' });
        }

        const phiCheck = geminiService.detectPHI(content);
        
        res.json(phiCheck);
    } catch (error) {
        console.error('PHI check error:', error);
        res.status(500).json({ error: 'Failed to check for PHI' });
    }
});

export default router;
