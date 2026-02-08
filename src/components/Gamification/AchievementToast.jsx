import React, { useEffect, useState } from 'react';

/**
 * Achievement Unlock Toast Notification
 */
const AchievementToast = ({ achievement, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Fade in
        setTimeout(() => setIsVisible(true), 100);

        // Auto close after 8 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 8000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const tierColors = {
        bronze: 'from-amber-500 to-amber-700',
        silver: 'from-slate-400 to-slate-600',
        gold: 'from-yellow-400 to-yellow-600',
        platinum: 'from-indigo-500 to-purple-600'
    };

    return (
        <div className={`fixed top-4 right-4 z-[9999] transition-all duration-300 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className="bg-white rounded-2xl shadow-2xl border-4 border-yellow-400 overflow-hidden max-w-sm">
                {/* Confetti Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 opacity-50"></div>
                
                {/* Content */}
                <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🎉</span>
                            <h3 className="font-bold text-slate-900">Achievement Unlocked!</h3>
                        </div>
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Achievement Display */}
                    <div className="flex items-center gap-4 mb-4">
                        {/* Badge */}
                        <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${tierColors[achievement.tier]} flex items-center justify-center shadow-lg animate-bounce`}>
                            <span className="text-4xl">{achievement.icon}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-slate-900 mb-1">
                                {achievement.name}
                            </h4>
                            <p className="text-sm text-slate-600 mb-2">
                                {achievement.description}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                                    +{achievement.xpReward} XP
                                </span>
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold uppercase">
                                    {achievement.tier}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 animate-progress-fill"
                            style={{ width: '100%' }}
                        ></div>
                    </div>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer pointer-events-none"></div>
            </div>
        </div>
    );
};

export default AchievementToast;
