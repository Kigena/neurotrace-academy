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

        const fileUrl = `/uploads/cases/${req.file.filename}`;

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

// 2. Create Case
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

// 5. Add Comment
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

export default router;
