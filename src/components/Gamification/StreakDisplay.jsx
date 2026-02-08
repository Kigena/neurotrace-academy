import React from 'react';

/**
 * Streak Display Component
 */
const StreakDisplay = ({ currentStreak, longestStreak, compact = false }) => {
    const getStreakColor = (streak) => {
        if (streak >= 100) return 'text-purple-600';
        if (streak >= 30) return 'text-orange-500';
        if (streak >= 7) return 'text-red-500';
        return 'text-slate-600';
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <div className="flex flex-col">
                    <span className={`font-bold text-lg ${getStreakColor(currentStreak)}`}>
                        {currentStreak}
                    </span>
                    <span className="text-[10px] text-slate-500 -mt-1">day streak</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
                {/* Fire Icon */}
                <div className="relative">
                    <span className="text-5xl">🔥</span>
                    {currentStreak >= 7 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {currentStreak >= 100 ? '!' : currentStreak >= 30 ? '★' : '✓'}
                        </div>
                    )}
                </div>
                
                {/* Streak Info */}
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${getStreakColor(currentStreak)}`}>
                            {currentStreak}
                        </span>
                        <span className="text-slate-600 font-medium">
                            {currentStreak === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Current Streak</p>
                    
                    {longestStreak > currentStreak && (
                        <p className="text-xs text-slate-500 mt-1">
                            Best: {longestStreak} days
                        </p>
                    )}
                </div>
            </div>
            
            {/* Motivational message */}
            <div className="mt-3 pt-3 border-t border-orange-200">
                <p className="text-xs text-slate-600">
                    {currentStreak === 0 && "Start your learning journey today!"}
                    {currentStreak === 1 && "Great start! Come back tomorrow to continue."}
                    {currentStreak >= 2 && currentStreak < 7 && "Keep it up! You're building momentum."}
                    {currentStreak >= 7 && currentStreak < 30 && "🔥 On fire! You're developing a habit."}
                    {currentStreak >= 30 && currentStreak < 100 && "🌟 Amazing dedication! You're a pro."}
                    {currentStreak >= 100 && "👑 LEGENDARY! You're an inspiration to all."}
                </p>
            </div>
        </div>
    );
};

export default StreakDisplay;
