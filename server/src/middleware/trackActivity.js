import GamificationService from '../services/gamificationService.js';

/**
 * Middleware to automatically track user activities and award XP
 * Usage: Add this middleware AFTER actions that should award XP
 */

// Track quiz completion
export const trackQuizCompletion = async (req, res, next) => {
    try {
        if (req.user && req.quizResult) {
            const isPerfect = req.quizResult.score === 100;
            const xp = isPerfect 
                ? GamificationService.XP_REWARDS.QUIZ_PERFECT
                : GamificationService.XP_REWARDS.QUIZ_COMPLETE;
            
            const activityType = isPerfect ? 'quiz_perfect' : 'quiz_complete';
            
            await GamificationService.awardXP(
                req.user.id,
                xp,
                activityType,
                { score: req.quizResult.score }
            );
        }
    } catch (error) {
        console.error('Track quiz error:', error);
        // Don't fail the request if tracking fails
    }
    next();
};

// Track case sharing
export const trackCaseShare = async (req, res, next) => {
    try {
        if (req.user && req.newCase) {
            await GamificationService.awardXP(
                req.user.id,
                GamificationService.XP_REWARDS.CASE_SHARE,
                'case_share',
                { caseId: req.newCase._id }
            );
        }
    } catch (error) {
        console.error('Track case share error:', error);
    }
    next();
};

// Track case approval (admin moderates)
export const trackCaseApproval = async (caseAuthorId) => {
    try {
        if (caseAuthorId) {
            await GamificationService.awardXP(
                caseAuthorId,
                GamificationService.XP_REWARDS.CASE_APPROVED,
                'case_approved'
            );
        }
    } catch (error) {
        console.error('Track case approval error:', error);
    }
};

// Track comment posting
export const trackCommentPost = async (req, res, next) => {
    try {
        if (req.user && req.newComment) {
            await GamificationService.awardXP(
                req.user.id,
                GamificationService.XP_REWARDS.COMMENT_POST,
                'comment_post'
            );
        }
    } catch (error) {
        console.error('Track comment error:', error);
    }
    next();
};

// Track daily login
export const trackDailyLogin = async (userId) => {
    try {
        if (userId) {
            // Award XP for daily login (streak is automatically updated)
            await GamificationService.awardXP(
                userId,
                GamificationService.XP_REWARDS.DAILY_LOGIN,
                'daily_login'
            );
        }
    } catch (error) {
        console.error('Track daily login error:', error);
    }
};

// Track pattern/syndrome study
export const trackStudy = async (userId, type) => {
    try {
        if (userId) {
            const xp = type === 'pattern' 
                ? GamificationService.XP_REWARDS.PATTERN_STUDY
                : GamificationService.XP_REWARDS.SYNDROME_STUDY;
            
            const activityType = type === 'pattern' ? 'pattern_study' : 'syndrome_study';
            
            await GamificationService.awardXP(userId, xp, activityType);
        }
    } catch (error) {
        console.error('Track study error:', error);
    }
};

// Track helpful vote
export const trackHelpfulVote = async (commentAuthorId) => {
    try {
        if (commentAuthorId) {
            await GamificationService.awardXP(
                commentAuthorId,
                GamificationService.XP_REWARDS.COMMENT_HELPFUL,
                'comment_helpful'
            );
        }
    } catch (error) {
        console.error('Track helpful vote error:', error);
    }
};

export default {
    trackQuizCompletion,
    trackCaseShare,
    trackCaseApproval,
    trackCommentPost,
    trackDailyLogin,
    trackStudy,
    trackHelpfulVote
};
