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

// Smart Search - AI-powered natural language search
router.post('/smart-search', auth, async (req, res) => {
    try {
        const { query, searchType, currentCaseId } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }

        let results = [];

        if (searchType === 'cases') {
            // Import CommunityCase model
            const CommunityCase = (await import('../models/CommunityCase.js')).default;
            const allCases = await CommunityCase.find({ status: 'published' })
                .select('title history patientInfo findings')
                .limit(100);
            
            results = await geminiService.findSimilarCases(query, allCases, currentCaseId);
            
            // Add paths to results
            results = results.map(r => ({
                ...r,
                path: `/cases/${r.caseId}`,
                type: 'case'
            }));
        } else if (searchType === 'patterns') {
            // Load patterns from data file
            const patternsData = await import('../data/neurotrace_patterns_library_v2.json', { assert: { type: 'json' } });
            const allPatterns = patternsData.default.patterns || [];
            
            results = await geminiService.comparePatterns(query, allPatterns);
            
            // Add paths
            results = results.map(r => ({
                ...r,
                title: r.name,
                path: `/patterns/${r.patternId}`,
                type: 'pattern'
            }));
        } else if (searchType === 'resources') {
            // Build resource index
            const resourceIndex = await buildResourceIndex();
            
            results = await geminiService.findResourcesForTopic(query, resourceIndex);
        }

        res.json({ results, searchType, query });
    } catch (error) {
        console.error('Smart search error:', error);
        res.status(500).json({ error: 'Search failed. Please try again.' });
    }
});

// Helper: Build resource index
async function buildResourceIndex() {
    const resources = [];
    
    // Add patterns
    const patternsData = await import('../data/neurotrace_patterns_library_v2.json', { assert: { type: 'json' } });
    (patternsData.default.patterns || []).forEach(p => {
        resources.push({
            title: p.name,
            type: 'pattern',
            path: `/patterns/${p.id}`,
            topics: [p.category, ...(p.tags || [])],
            preview: p.description
        });
    });

    // Add syndromes
    const syndromesData = await import('../data/syndromes_v2.json', { assert: { type: 'json' } });
    (syndromesData.default.syndromes || []).forEach(s => {
        resources.push({
            title: s.name,
            type: 'syndrome',
            path: `/syndromes/${s.id}`,
            topics: [s.category, ...(s.keywords || [])],
            preview: s.overview
        });
    });

    // Add workflow domains
    const workflowData = await import('../data/workflow-domains.json', { assert: { type: 'json' } });
    (workflowData.default.domains || []).forEach(d => {
        resources.push({
            title: d.title,
            type: 'workflow',
            path: '/workflow',
            topics: d.sections?.map(s => s.title) || [],
            preview: d.description
        });
    });

    return resources;
}

export default router;
