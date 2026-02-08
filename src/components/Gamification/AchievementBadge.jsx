import React from 'react';

/**
 * Achievement Badge Component
 */
const AchievementBadge = ({ achievement, unlocked = false, onClick }) => {
    const tierColors = {
        bronze: 'from-amber-600 to-amber-800',
        silver: 'from-slate-400 to-slate-600',
        gold: 'from-yellow-400 to-yellow-600',
        platinum: 'from-indigo-400 to-purple-600'
    };
    
    const tierBorder = {
        bronze: 'border-amber-600',
        silver: 'border-slate-400',
        gold: 'border-yellow-400',
        platinum: 'border-purple-500'
    };

    return (
        <div 
            className={`group relative cursor-pointer transition-all duration-300 ${
                unlocked ? 'hover:scale-105' : 'opacity-50'
            }`}
            onClick={onClick}
        >
            {/* Badge Container */}
            <div className={`relative w-24 h-24 rounded-xl border-4 ${
                unlocked ? tierBorder[achievement.tier] : 'border-slate-300'
            } ${
                unlocked 
                    ? `bg-gradient-to-br ${tierColors[achievement.tier]}` 
                    : 'bg-slate-200'
            } flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl`}>
                
                {/* Icon */}
                <span className="text-4xl filter drop-shadow-lg">
                    {unlocked ? achievement.icon : '🔒'}
                </span>
                
                {/* Shine effect for unlocked badges */}
                {unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                )}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl max-w-xs">
                    <p className="font-bold mb-1">{achievement.name}</p>
                    <p className="text-slate-300 mb-1">{achievement.description}</p>
                    <div className="flex items-center justify-between text-slate-400 text-[10px] mt-1 pt-1 border-t border-slate-700">
                        <span>{achievement.tier.toUpperCase()}</span>
                        <span>+{achievement.xpReward} XP</span>
                    </div>
                    {!unlocked && (
                        <p className="text-yellow-400 text-[10px] mt-1">🔒 Locked</p>
                    )}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="w-2 h-2 bg-slate-900 transform rotate-45"></div>
                </div>
            </div>
        </div>
    );
};

export default AchievementBadge;
