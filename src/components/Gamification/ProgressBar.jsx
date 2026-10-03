import React from 'react';

/**
 * Level and XP Progress Bar Component
 */
const ProgressBar = ({ level, xp, xpToNextLevel, showDetails = true, onDark = false }) => {
    const progress = (xp / xpToNextLevel) * 100;
    
    // Level tier colors
    const getLevelColor = (lvl) => {
        if (lvl >= 50) return 'from-purple-500 to-pink-500'; // Master
        if (lvl >= 25) return 'from-yellow-500 to-orange-500'; // Expert
        if (lvl >= 10) return 'from-blue-500 to-indigo-500'; // Senior
        return 'from-green-500 to-teal-500'; // Beginner
    };
    
    const getLevelTitle = (lvl) => {
        if (lvl >= 50) return 'Master';
        if (lvl >= 25) return 'Expert';
        if (lvl >= 10) return 'Senior Tech';
        if (lvl >= 5) return 'Technologist';
        return 'Apprentice';
    };

    return (
        <div className="w-full">
            {showDetails && (
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getLevelColor(level)} text-white font-bold text-sm`}>
                            Level {level}
                        </div>
                        <span className={`text-sm font-medium ${onDark ? "text-indigo-100" : "text-slate-600"}`}>
                            {getLevelTitle(level)}
                        </span>
                    </div>
                    <span className={`text-xs font-medium ${onDark ? "text-indigo-200" : "text-slate-500"}`}>
                        {xp} / {xpToNextLevel} XP
                    </span>
                </div>
            )}
            
            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getLevelColor(level)} transition-all duration-500 ease-out`}
                    style={{ width: `${progress}%` }}
                >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
            </div>
            
            {!showDetails && (
                <div className="mt-1 text-xs text-slate-500 text-right">
                    {xp} / {xpToNextLevel} XP to Level {level + 1}
                </div>
            )}
        </div>
    );
};

export default ProgressBar;
