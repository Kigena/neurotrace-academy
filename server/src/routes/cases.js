import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import CommunityCase from '../models/CommunityCase.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// --- Multer Setup for Case Files ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/cases';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp-random-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images and PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and PDFs are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// --- Endpoints ---

// 1. Upload Attachment
router.post('/upload', auth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Build absolute URL for the uploaded file
        // Use protocol and host from the request, or fallback to environment variable
        const protocol = req.protocol || 'https';
        const host = req.get('host') || process.env.API_URL || 'neurotrace-academy.onrender.com';
        const fileUrl = `${protocol}://${host}/uploads/cases/${req.file.filename}`;

        console.log('📎 Case file uploaded successfully:', fileUrl);

        res.json({
            url: fileUrl,
            filename: req.file.originalname,
            type: req.file.mimetype.startsWith('image/') ? 'image' : 'pdf',
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
        const {
            title,
            history,
            patientInfo,
            medications,
            findings,
            tags,
            attachments
        } = req.body;

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

        const savedCase = await newCase.save();

        // Populate author info for the response
        await savedCase.populate('author', 'name');

        res.status(201).json(savedCase);
    } catch (error) {
        console.error('Create case error:', error);
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

// 5. Get Cases for Moderation (Admin Only)
router.get('/moderation', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { status } = req.query;
        let query = {};

        if (status === 'pending') {
            query.status = 'pending';
        } else if (status === 'rejected') {
            query.status = 'rejected';
        }
        // 'all' returns everything

        const cases = await CommunityCase.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.json(cases);
    } catch (error) {
        console.error('Get moderation cases error:', error);
        res.status(500).json({ error: 'Failed to fetch cases for moderation' });
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
        const { content } = req.body;
        const communityCase = await CommunityCase.findById(req.params.id);

        if (!communityCase) {
            return res.status(404).json({ error: 'Case not found' });
        }

        communityCase.comments.push({
            userId: req.user.id,
            content
        });

        await communityCase.save();

        // Return the new comment with populated user
        const newComment = communityCase.comments[communityCase.comments.length - 1];
        res.json(newComment);
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
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

export default router;
