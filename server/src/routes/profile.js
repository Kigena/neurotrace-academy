import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { User } from '../models/User.js';
import auth from '../middleware/auth.js';
import UserProgress from '../models/UserProgress.js';
import CommunityCase from '../models/CommunityCase.js';
import { QuizSession } from '../models/QuizSession.js';
import '../config/cloudinary.js'; // Initialize Cloudinary config

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
    }
});

/**
 * Get public profile by user ID
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // For now, all profiles are public (privacy check can be added later if needed)

        // Get user progress/gamification data
        const progress = await UserProgress.findOne({ user: userId });

        // Get basic stats
        const casesCount = await CommunityCase.countDocuments({
            author: userId,
            status: 'published'
        });

        const quizSessions = await QuizSession.find({ userId });
        const quizzesCompleted = quizSessions.filter(s => s.endTime).length;

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                role: user.role,
                profile: user.profile,
                createdAt: user.createdAt
            },
            stats: {
                level: progress?.level || 1,
                xp: progress?.xp || 0,
                achievements: progress?.unlockedAchievements?.length || 0,
                streak: progress?.streak?.current || 0,
                casesShared: casesCount,
                quizzesCompleted,
                commentsPosted: progress?.stats?.commentsPosted || 0
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

/**
 * Update own profile
 */
router.put('/', auth, async (req, res) => {
    try {
        const { bio, location, institution, certifications, specializations, socialLinks, isPublic } = req.body;

        const updates = {};
        if (bio !== undefined) updates['profile.bio'] = bio.substring(0, 500); // Enforce max length
        if (location !== undefined) updates['profile.location'] = location;
        if (institution !== undefined) updates['profile.institution'] = institution;
        if (certifications !== undefined) updates['profile.certifications'] = certifications;
        if (specializations !== undefined) updates['profile.specializations'] = specializations;
        if (socialLinks !== undefined) updates['profile.socialLinks'] = socialLinks;
        if (isPublic !== undefined) updates['profile.isPublic'] = isPublic;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        res.json({ user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * Get user activity/portfolio
 */
router.get('/:userId/activity', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user's cases
        const cases = await CommunityCase.find({
            submittedBy: userId,
            status: 'approved'
        })
            .select('title description tags createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get quiz stats
        const quizSessions = await QuizSession.find({ userId });
        const quizStats = {
            total: quizSessions.filter(s => s.endTime).length,
            totalQuestions: 0,
            correctAnswers: 0
        };

        quizSessions.forEach(session => {
            if (session.answers) {
                const answers = Object.values(session.answers);
                quizStats.totalQuestions += answers.length;
                quizStats.correctAnswers += answers.filter(a => a.isCorrect).length;
            }
        });

        quizStats.accuracy = quizStats.totalQuestions > 0
            ? Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100)
            : 0;

        res.json({
            cases,
            quizStats
        });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

/**
 * Upload avatar
 */
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'neurotrace/avatars',
                    transformation: [
                        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        // Update user's avatar URL
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { 'profile.avatar': result.secure_url },
            { new: true }
        ).select('-passwordHash');

        res.json({
            user,
            avatarUrl: result.secure_url
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

/**
 * Delete avatar
 */
router.delete('/avatar', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { 'profile.avatar': null },
            { new: true }
        ).select('-passwordHash');

        res.json({ user });
    } catch (error) {
        console.error('Delete avatar error:', error);
        res.status(500).json({ error: 'Failed to delete avatar' });
    }
});

export default router;
