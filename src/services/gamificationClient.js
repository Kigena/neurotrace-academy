import apiService from './apiService';

/**
 * Client-side Gamification Service
 * Handles checking for achievements and triggering notifications
 */
class GamificationClient {
    /**
     * Check for new achievements and return any that were unlocked
     */
    static async checkProgress(notificationContext) {
        try {
            const progress = await apiService.get('/gamification/progress');
            
            // Store in localStorage to detect changes
            const previousProgress = this.getPreviousProgress();
            
            if (previousProgress) {
                // Check for level up
                if (progress.level > previousProgress.level) {
                    notificationContext?.showLevelUp(progress.level);
                }
                
                // Check for new achievements
                const previousAchievementIds = new Set(previousProgress.achievements.map(a => a._id));
                const newAchievements = progress.achievements.filter(a => !previousAchievementIds.has(a._id));
                
                // Show toast for each new achievement
                newAchievements.forEach(achievement => {
                    notificationContext?.showAchievementToast(achievement);
                });
            }
            
            // Save current progress
            this.savePreviousProgress(progress);
            
            return progress;
        } catch (error) {
            console.error('Failed to check gamification progress:', error);
            return null;
        }
    }

    /**
     * Load full achievements list and check for newly unlocked ones
     */
    static async checkAchievements(notificationContext) {
        try {
            const achievements = await apiService.get('/gamification/achievements');
            
            // Store in localStorage to detect changes
            const previousAchievements = this.getPreviousAchievements();
            
            if (previousAchievements) {
                const previousUnlockedIds = new Set(
                    previousAchievements.filter(a => a.unlocked).map(a => a._id)
                );
                
                const newlyUnlocked = achievements.filter(
                    a => a.unlocked && !previousUnlockedIds.has(a._id)
                );
                
                // Show toast for each newly unlocked achievement
                newlyUnlocked.forEach(achievement => {
                    notificationContext?.showAchievementToast(achievement);
                });
            }
            
            // Save current achievements
            this.savePreviousAchievements(achievements);
            
            return achievements;
        } catch (error) {
            console.error('Failed to check achievements:', error);
            return null;
        }
    }

    /**
     * Helper to get previous progress from localStorage
     */
    static getPreviousProgress() {
        try {
            const stored = localStorage.getItem('gamification_progress');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }

    /**
     * Helper to save progress to localStorage
     */
    static savePreviousProgress(progress) {
        try {
            localStorage.setItem('gamification_progress', JSON.stringify(progress));
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    /**
     * Helper to get previous achievements from localStorage
     */
    static getPreviousAchievements() {
        try {
            const stored = localStorage.getItem('gamification_achievements');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }

    /**
     * Helper to save achievements to localStorage
     */
    static savePreviousAchievements(achievements) {
        try {
            localStorage.setItem('gamification_achievements', JSON.stringify(achievements));
        } catch (error) {
            console.error('Failed to save achievements:', error);
        }
    }

    /**
     * Clear stored progress (useful on logout)
     */
    static clearStoredProgress() {
        try {
            localStorage.removeItem('gamification_progress');
            localStorage.removeItem('gamification_achievements');
        } catch (error) {
            console.error('Failed to clear progress:', error);
        }
    }
}

export default GamificationClient;
