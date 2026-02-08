import React, { createContext, useContext, useState, useCallback } from 'react';
import AchievementToast from '../components/Gamification/AchievementToast';
import LevelUpModal from '../components/Gamification/LevelUpModal';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [levelUpData, setLevelUpData] = useState(null);

    const showAchievementToast = useCallback((achievement) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, achievement }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showLevelUp = useCallback((newLevel) => {
        setLevelUpData(newLevel);
    }, []);

    const closeLevelUp = useCallback(() => {
        setLevelUpData(null);
    }, []);

    return (
        <NotificationContext.Provider value={{ 
            showAchievementToast, 
            showLevelUp 
        }}>
            {children}
            
            {/* Render Achievement Toasts */}
            <div className="fixed top-4 right-4 z-[9999] space-y-4 pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <AchievementToast
                            achievement={toast.achievement}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Render Level Up Modal */}
            {levelUpData && (
                <LevelUpModal 
                    newLevel={levelUpData}
                    onClose={closeLevelUp}
                />
            )}
        </NotificationContext.Provider>
    );
};
