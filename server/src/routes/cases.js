import express from 'express';
import mongoose from 'mongoose';
import CommunityCase from '../models/CommunityCase.js';
import auth from '../middleware/auth.js';
import { caseUpload } from '../config/cloudinary.js';
import geminiService from '../services/gemini.js';

const router = express.Router();

// Storage and upload configuration is in config/cloudinary.js
// It handles both Cloudinary (persistent) and local disk (fallback) storage

// --- Endpoints ---

// 1. Upload Attachment (Cloudinary or Local)
router.post('/upload', auth, caseUpload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Cloudinary provides URL in req.file.path, local storage uses filename
        const isCloudinary = req.file.path && req.file.path.startsWith('http');
        let fileUrl;

        if (isCloudinary) {
            fileUrl = req.file.path;
            console.log('📎 Case file uploaded to Cloudinary:', fileUrl);
        } else {
            // Local storage - build URL
            const host = req.get('host') || 'neurotrace-academy.onrender.com';
            const protocol = host.includes('localhost') ? 'http' : 'https';
            fileUrl = `${protocol}://${host}/uploads/cases/${req.file.filename}`;
            console.log('📎 Case file uploaded to local disk (ephemeral):', fileUrl);
        }

        res.json({
            url: fileUrl,
            filename: req.file.originalname,
            type: req.file.mimetype?.startsWith('image/') ? 'image' : 'pdf',
            size: req.file.size
        });
    } catch (error) {
        console.error('Case upload error:', error);
        res.status(500).json({ error: 'File upload failed: ' + error.message });
    }
});

// 2. Get Featured Case of the Week
router.get('/featured', async (req, res) => {
    try {
        // First, try to get a manually featured case
        let featuredCase = await CommunityCase.findOne({ 
            status: 'published', 
            featured: true 
        })
        .populate('author', 'name')
        .sort({ featuredAt: -1 });

        // If no manually featured case, pick one based on weekly rotation
        if (!featuredCase) {
            const publishedCases = await CommunityCase.find({ status: 'published' })
                .populate('author', 'name')
                .sort({ createdAt: -1 });

            if (publishedCases.length > 0) {
                // Use week number to rotate through community cases
                const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
                const caseIndex = weekNumber % publishedCases.length;
                featuredCase = publishedCases[caseIndex];
            }
        }

        if (!featuredCase) {
            return res.status(404).json({ error: 'No featured case available' });
        }

        res.json(featuredCase);
    } catch (error) {
        console.error('Get featured case error:', error);
        res.status(500).json({ error: 'Failed to fetch featured case' });
    }
});

// 3. Create Case
router.post('/', auth, async (req, res) => {
    try {
        console.log('📥 Creating new case...');
        console.log('User:', req.user?.id);
        console.log('Request body keys:', Object.keys(req.body));
        
        const {
            title,
            history,
            patientInfo,
            medications,
            findings,
            tags,
            attachments
        } = req.body;

        // Validation
        if (!title || !history) {
            console.error('❌ Validation failed: missing required fields');
            return res.status(400).json({ error: 'Title and history are required fields' });
        }

        if (!req.user || !req.user.id) {
            console.error('❌ No user found in request');
            return res.status(401).json({ error: 'User not authenticated' });
        }

        console.log('✅ Validation passed');

        // Sanitize patientInfo to handle empty strings for numeric fields
        const sanitizedPatientInfo = { ...patientInfo };
        if (sanitizedPatientInfo.age === '') {
            sanitizedPatientInfo.age = null;
        }

        const newCase = new CommunityCase({
            title,
            author: req.user.id,
            history,
            patientInfo: sanitizedPatientInfo,
            medications,
            findings,
            tags,
            attachments
        });

        console.log('💾 Saving case to database...');
        const savedCase = await newCase.save();
        console.log('✅ Case saved with ID:', savedCase._id);

        // Populate author info for the response
        await savedCase.populate('author', 'name');

        console.log('✅ Case created successfully');
        res.status(201).json(savedCase);
    } catch (error) {
        console.error('❌ Create case error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: error.message || 'Failed to create case' });
    }
});

// 3. Get All Cases (Feed)
router.get('/', async (req, res) => {
    try {
        const { tag, sort } = req.query;
        let query = { status: 'published' };

        if (tag) {
            query.tags = tag;
        }

        let cases = CommunityCase.find(query)
            .populate('author', 'name')
            .select('-history'); // Exclude full history for list view to save bandwidth

        // Sorting
        if (sort === 'popular') {
            cases = cases.sort({ views: -1 });
        } else {
            cases = cases.sort({ createdAt: -1 }); // Default new first
        }

        const results = await cases.limit(20); // Pagination later
        res.json(results);
    } catch (error) {
        console.error('Get cases error:', error);
        res.status(500).json({ error: 'Failed to fetch cases' });
    }
});

// 4. Get Single Case Detail
router.get('/:id', async (req, res) => {
    try {
        const communityCase = await CommunityCase.findById(req.params.id)
            .populate('author', 'name')
            .populate('comments.userId', 'name');

        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Increment view count
        communityCase.views += 1;
        await communityCase.save();

        res.json(communityCase);
    } catch (error) {
        console.error('Get case detail error:', error);
        res.status(500).json({ error: 'Failed to fetch case details' });
    }
});

// 5a. Get pending cases count (for notification badge) - MUST BE BEFORE /moderation
router.get('/moderation/pending-count', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const count = await CommunityCase.countDocuments({ status: 'pending' });
        res.json({ count });
    } catch (error) {
        console.error('Get pending count error:', error);
        res.status(500).json({ error: 'Failed to fetch pending count' });
    }
});

// 5b. Get Cases for Moderation (Admin Only)
router.get('/moderation', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { status } = req.query;
        console.log('🔍 Moderation query - status param:', status);
        let query = {};

        if (status === 'pending') {
            query.status = 'pending';
        } else if (status === 'rejected') {
            query.status = 'rejected';
        }
        // 'all' returns everything

        console.log('🔍 MongoDB query:', JSON.stringify(query));

        try {
            // Try to populate normally first
            const cases = await CommunityCase.find(query)
                .populate({
                    path: 'author',
                    select: 'name email',
                    options: { strictPopulate: false } // Don't throw on missing refs
                })
                .sort({ createdAt: -1 })
                .lean();

            console.log('📦 Found cases:', cases.length);
            
            // Clean up cases with missing authors
            const cleanedCases = cases.map(caseItem => {
                if (!caseItem.author || typeof caseItem.author === 'string') {
                    // Author is missing or wasn't populated
                    return {
                        ...caseItem,
                        author: { 
                            _id: caseItem.author || null,
                            name: 'Unknown User', 
                            email: 'deleted@user.com' 
                        }
                    };
                }
                return caseItem;
            });

            console.log('📦 Cleaned cases:', cleanedCases.length);
            console.log('📦 Case details:', cleanedCases.slice(0, 3).map(c => ({ 
                id: c._id, 
                title: c.title, 
                status: c.status, 
                author: c.author?.name 
            })));

            res.json(cleanedCases);
        } catch (populateError) {
            console.error('⚠️ Populate failed, fetching without author:', populateError);
            
            // Fallback: fetch without populating
            const cases = await CommunityCase.find(query)
                .sort({ createdAt: -1 })
                .lean();
            
            // Add placeholder authors
            const casesWithPlaceholder = cases.map(caseItem => ({
                ...caseItem,
                author: { name: 'Unknown User', email: 'system@user.com' }
            }));
            
            res.json(casesWithPlaceholder);
        }
    } catch (error) {
        console.error('❌ Get moderation cases error:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to fetch cases for moderation', 
            details: error.message,
            errorType: error.name 
        });
    }
});

// 6. Moderate Case (Admin Only)
router.put('/:id/moderate', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { status, moderationNotes } = req.body;

        if (!['published', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const communityCase = await CommunityCase.findById(req.params.id);
        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        communityCase.status = status;
        communityCase.moderationNotes = moderationNotes || '';
        communityCase.reviewedBy = req.user.id;
        communityCase.reviewedAt = new Date();

        await communityCase.save();

        res.json(communityCase);
    } catch (error) {
        console.error('Moderate case error:', error);
        res.status(500).json({ error: 'Failed to moderate case' });
    }
});

// 7. Add Comment
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const { content, replyTo } = req.body;
        const communityCase = await CommunityCase.findById(req.params.id);

        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Check for AI mentions
        const aiMentionRegex = /@(Neurotrace|AI|NeurotraceAI)/gi;
        const hasAIMention = aiMentionRegex.test(content);

        const newComment = {
            userId: req.user.id,
            content,
            replyTo: replyTo || null
        };

        communityCase.comments.push(newComment);
        await communityCase.save();

        // Populate the new comment
        await communityCase.populate('comments.userId', 'name');
        const addedComment = communityCase.comments[communityCase.comments.length - 1];

        // If AI is mentioned, trigger AI response
        if (hasAIMention) {
            // Import gemini service at the top if not already imported
            const geminiService = (await import('../services/gemini.js')).default;
            
            try {
                // Generate AI response
                const aiResponse = await geminiService.generateCaseDiscussionResponse(
                    content,
                    communityCase,
                    communityCase.comments.slice(-10) // Last 10 comments for context
                );

                // Add AI comment
                communityCase.comments.push({
                    userId: null,
                    content: aiResponse,
                    isAI: true,
                    aiType: 'response',
                    replyTo: addedComment._id
                });

                await communityCase.save();
            } catch (aiError) {
                console.error('AI response generation failed:', aiError);
                // Continue without AI response
            }
        }

        // Return updated comments
        await communityCase.populate('comments.userId', 'name');
        res.json(communityCase.comments);
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// 7b. Request AI Reconciliation
router.post('/:id/reconcile', auth, async (req, res) => {
    try {
        const { commentIds, question } = req.body;
        const communityCase = await CommunityCase.findById(req.params.id)
            .populate('comments.userId', 'name');

        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Get the specific comments to reconcile
        const commentsToReconcile = communityCase.comments.filter(c => 
            commentIds.includes(c._id.toString())
        );

        if (commentsToReconcile.length < 2) {
            return res.status(400).json({ error: 'Need at least 2 comments to reconcile' });
        }

        const geminiService = (await import('../services/gemini.js')).default;

        // Generate reconciliation response
        const reconciliation = await geminiService.reconcileOpinions(
            question || 'What are the key differences and what features decide between these views?',
            commentsToReconcile,
            communityCase
        );

        // Add AI reconciliation comment
        communityCase.comments.push({
            userId: null,
            content: reconciliation,
            isAI: true,
            aiType: 'reconciliation'
        });

        await communityCase.save();
        await communityCase.populate('comments.userId', 'name');
        
        res.json(communityCase.comments);
    } catch (error) {
        console.error('Reconciliation error:', error);
        res.status(500).json({ error: 'Failed to generate reconciliation' });
    }
});

// 7c. Request Discussion Structure
router.post('/:id/structure', auth, async (req, res) => {
    try {
        const communityCase = await CommunityCase.findById(req.params.id)
            .populate('comments.userId', 'name');

        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        const geminiService = (await import('../services/gemini.js')).default;

        // Generate structured summary
        const structure = await geminiService.structureDiscussion(
            communityCase.comments,
            communityCase
        );

        // Add AI structure comment
        communityCase.comments.push({
            userId: null,
            content: structure,
            isAI: true,
            aiType: 'structure'
        });

        await communityCase.save();
        await communityCase.populate('comments.userId', 'name');
        
        res.json(communityCase.comments);
    } catch (error) {
        console.error('Structure generation error:', error);
        res.status(500).json({ error: 'Failed to generate structure' });
    }
});

// 7d. Delete Comment
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
    try {
        console.log('🗑️ Delete comment request:', {
            caseId: req.params.id,
            commentId: req.params.commentId,
            userId: req.user.id
        });

        const communityCase = await CommunityCase.findById(req.params.id);

        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Find the comment
        const comment = communityCase.comments.id(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user owns the comment or is admin
        const isOwner = comment.userId && comment.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        // Remove the comment
        communityCase.comments.pull(req.params.commentId);
        await communityCase.save();

        console.log('✅ Comment deleted successfully');

        // Return updated comments
        await communityCase.populate('comments.userId', 'name');
        res.json(communityCase.comments);
    } catch (error) {
        console.error('❌ Delete comment error:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

// 7b. Test endpoint to verify routes are working
router.get('/:id/test-edit', auth, (req, res) => {
    res.json({ 
        message: 'Edit route is accessible',
        caseId: req.params.id,
        userId: req.user.id,
        userRole: req.user.role,
        timestamp: new Date().toISOString()
    });
});

// 8. Feature/Unfeature Case (Admin Only)
router.put('/:id/feature', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { featured } = req.body;

        const communityCase = await CommunityCase.findById(req.params.id);
        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        if (communityCase.status !== 'published') {
            return res.status(400).json({ error: 'Only published cases can be featured' });
        }

        communityCase.featured = featured;
        communityCase.featuredAt = featured ? new Date() : null;

        await communityCase.save();

        res.json(communityCase);
    } catch (error) {
        console.error('Feature case error:', error);
        res.status(500).json({ error: 'Failed to feature case' });
    }
});

// 8b. Update Case (Owner or Admin Only)
router.put('/:id', auth, async (req, res) => {
    try {
        console.log('========================================');
        console.log('📝 UPDATE CASE REQUEST RECEIVED');
        console.log('Case ID:', req.params.id);
        console.log('User ID:', req.user.id);
        console.log('User Role:', req.user.role);
        console.log('Request Body Keys:', Object.keys(req.body));
        console.log('========================================');

        const communityCase = await CommunityCase.findById(req.params.id);
        
        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Check if user is owner or admin
        const isOwner = communityCase.author.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'You can only edit your own cases' });
        }

        const {
            title,
            history,
            patientInfo,
            medications,
            findings,
            tags,
            attachments
        } = req.body;

        // Sanitize patientInfo
        const sanitizedPatientInfo = { ...patientInfo };
        if (sanitizedPatientInfo.age === '') {
            sanitizedPatientInfo.age = null;
        }

        // Update fields
        if (title) communityCase.title = title;
        if (history) communityCase.history = history;
        if (patientInfo) communityCase.patientInfo = sanitizedPatientInfo;
        if (medications !== undefined) communityCase.medications = medications;
        if (findings) communityCase.findings = findings;
        if (tags !== undefined) communityCase.tags = tags;
        if (attachments !== undefined) communityCase.attachments = attachments;
        
        communityCase.updatedAt = Date.now();

        console.log('💾 Saving updated case...');
        await communityCase.save();
        
        await communityCase.populate('author', 'name');
        
        console.log('✅ Case updated successfully');
        console.log('========================================');
        res.json(communityCase);
    } catch (error) {
        console.error('========================================');
        console.error('❌ UPDATE CASE ERROR');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('========================================');
        res.status(500).json({ error: error.message || 'Failed to update case' });
    }
});

// 8c. AI Case Analysis with Pre-filled Prompts
router.post('/:id/ai-analyze', auth, async (req, res) => {
    try {
        const { promptType } = req.body; // 'findings', 'differentials', 'artifacts', 'history'
        
        const communityCase = await CommunityCase.findById(req.params.id);
        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        const analysis = await geminiService.analyzeCaseWithPrompt(promptType, communityCase);
        
        res.json({ analysis, promptType });
    } catch (error) {
        console.error('AI case analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze case' });
    }
});

// 8d. Convert Case to Study Notes
router.post('/:id/study-notes', auth, async (req, res) => {
    try {
        const communityCase = await CommunityCase.findById(req.params.id);
        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        const pageContent = `
Title: ${communityCase.title}
Patient: ${communityCase.patientInfo?.age} ${communityCase.patientInfo?.ageUnit}, ${communityCase.patientInfo?.gender}
History: ${communityCase.history}
Medications: ${communityCase.medications?.join(', ')}
EEG Findings:
- Background: ${communityCase.findings?.background}
- Interictal: ${communityCase.findings?.interictal}
- Ictal: ${communityCase.findings?.ictal}
- Classification: ${communityCase.findings?.classification}
        `.trim();

        const studyNotes = await geminiService.convertToStudyNotes(communityCase.title, pageContent);
        
        res.json({ studyNotes });
    } catch (error) {
        console.error('Study notes generation error:', error);
        res.status(500).json({ error: 'Failed to generate study notes' });
    }
});

// 8e. Check for PHI in Content
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

// 9. Delete Case (Admin Only)
router.delete('/:id', auth, async (req, res) => {
    try {
        console.log('🗑️ Delete case request:', req.params.id);
        console.log('User:', req.user.id, 'Role:', req.user.role);
        
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const communityCase = await CommunityCase.findById(req.params.id);
        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Log case being deleted
        console.log('🗑️ Deleting case:', {
            id: communityCase._id,
            title: communityCase.title,
            author: communityCase.author,
            status: communityCase.status
        });

        await CommunityCase.findByIdAndDelete(req.params.id);

        console.log('✅ Case deleted successfully');
        res.json({ message: 'Case deleted successfully', id: req.params.id });
    } catch (error) {
        console.error('❌ Delete case error:', error);
        res.status(500).json({ error: 'Failed to delete case' });
    }
});

export default router;
