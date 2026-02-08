import express from 'express';
import auth from '../middleware/auth.js';
import { QuizSession } from '../models/QuizSession.js';
import GamificationService from '../services/gamificationService.js';

const router = express.Router();

// Save/Complete a quiz session
router.post('/sessions/complete', auth, async (req, res) => {
    try {
        const { 
            sessionId, 
            mode, 
            questionIds, 
            answers, 
            startTime, 
            endTime,
            timeLimitSec,
            config,
            score 
        } = req.body;

        console.log(`📝 Completing quiz session for user ${req.user.id}`);
        console.log(`Score: ${score?.correct}/${score?.total} (${score?.percent}%)`);

        // Check if session already exists
        let session = await QuizSession.findOne({ sessionId });

        if (session) {
            // Update existing session
            session.endTime = endTime;
            session.answers = answers;
            session.updatedAt = Date.now();
            await session.save();
            console.log(`✅ Updated existing quiz session ${sessionId}`);
        } else {
            // Create new session
            session = new QuizSession({
                userId: req.user.id,
                sessionId,
                mode,
                questionIds,
                answers,
                startTime,
                endTime,
                timeLimitSec,
                config
            });
            await session.save();
            console.log(`✅ Created new quiz session ${sessionId}`);
        }

        // Award XP based on score
        if (score && score.total > 0) {
            const percent = score.percent;
            let xpReward = 0;
            let activityType = 'quiz_completion';
            
            // XP calculation based on score percentage
            if (percent === 100) {
                xpReward = 100; // Perfect score bonus
                activityType = 'quiz_perfect';
            } else if (percent >= 90) {
                xpReward = 80;
            } else if (percent >= 80) {
                xpReward = 60;
            } else if (percent >= 70) {
                xpReward = 40;
            } else if (percent >= 60) {
                xpReward = 30;
            } else {
                xpReward = 20; // Participation XP
            }

            console.log(`⭐ Awarding ${xpReward} XP for ${percent}% score`);

            // Award XP through gamification service
            await GamificationService.awardXP(req.user.id, xpReward, activityType, {
                sessionId,
                mode,
                score: {
                    correct: score.correct,
                    total: score.total,
                    percent: score.percent
                },
                questionCount: score.total
            });

            console.log(`✅ Quiz completion tracked in gamification system`);
        }

        res.json({ 
            success: true, 
            session,
            message: 'Quiz session completed successfully'
        });
    } catch (error) {
        console.error('❌ Complete quiz session error:', error);
        res.status(500).json({ error: 'Failed to complete quiz session', details: error.message });
    }
});

// Get user's quiz history
router.get('/sessions/history', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        
        const sessions = await QuizSession.find({ 
            userId: req.user.id,
            endTime: { $ne: null } // Only completed sessions
        })
        .sort({ endTime: -1 })
        .limit(limit)
        .lean();

        res.json(sessions);
    } catch (error) {
        console.error('Get quiz history error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz history' });
    }
});

// Get quiz statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const sessions = await QuizSession.find({ 
            userId: req.user.id,
            endTime: { $ne: null }
        }).lean();

        if (sessions.length === 0) {
            return res.json({
                totalQuizzes: 0,
                averageScore: 0,
                bestScore: 0,
                totalQuestions: 0,
                correctAnswers: 0
            });
        }

        let totalCorrect = 0;
        let totalQuestions = 0;
        let bestScore = 0;

        sessions.forEach(session => {
            if (session.answers) {
                const answers = Array.from(session.answers.values());
                const correct = answers.filter(a => a.isCorrect).length;
                const total = answers.length;
                
                totalCorrect += correct;
                totalQuestions += total;
                
                const scorePercent = total > 0 ? (correct / total) * 100 : 0;
                if (scorePercent > bestScore) {
                    bestScore = scorePercent;
                }
            }
        });

        const averageScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

        res.json({
            totalQuizzes: sessions.length,
            averageScore: Math.round(averageScore * 10) / 10,
            bestScore: Math.round(bestScore * 10) / 10,
            totalQuestions,
            correctAnswers: totalCorrect
        });
    } catch (error) {
        console.error('Get quiz stats error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz stats' });
    }
});

export default router;
