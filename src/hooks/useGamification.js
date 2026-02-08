import { useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import GamificationClient from '../services/gamificationClient';

/**
 * Custom hook for gamification features
 * Use this after user actions to check for new achievements and level ups
 */
const useGamification = () => {
    const notification = useNotification();

    /**
     * Check for progress updates (level ups and new achievements)
     * Call this after significant user actions
     */
    const checkProgress = useCallback(async () => {
        try {
            await GamificationClient.checkProgress(notification);
        } catch (error) {
            console.error('Failed to check progress:', error);
        }
    }, [notification]);

    /**
     * Check specifically for achievement unlocks
     * Call this after actions that might trigger achievements
     */
    const checkAchievements = useCallback(async () => {
        try {
            await GamificationClient.checkAchievements(notification);
        } catch (error) {
            console.error('Failed to check achievements:', error);
        }
    }, [notification]);

    /**
     * Refresh progress data (without notifications)
     * Useful for updating UI after actions
     */
    const refreshProgress = useCallback(async () => {
        try {
            const progress = await GamificationClient.getPreviousProgress();
            return progress;
        } catch (error) {
            console.error('Failed to refresh progress:', error);
            return null;
        }
    }, []);

    return {
        checkProgress,
        checkAchievements,
        refreshProgress
    };
};

export default useGamification;
