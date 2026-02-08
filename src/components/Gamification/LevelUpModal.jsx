import React, { useEffect } from 'react';

/**
 * Level Up Celebration Modal
 */
const LevelUpModal = ({ newLevel, onClose }) => {
    useEffect(() => {
        // Auto close after 5 seconds
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getLevelColor = (lvl) => {
        if (lvl >= 50) return 'from-purple-500 to-pink-500';
        if (lvl >= 25) return 'from-yellow-500 to-orange-500';
        if (lvl >= 10) return 'from-blue-500 to-indigo-500';
        return 'from-green-500 to-teal-500';
    };

    const getLevelTitle = (lvl) => {
        if (lvl >= 50) return 'Master of EEG';
        if (lvl >= 25) return 'Expert Technologist';
        if (lvl >= 10) return 'Senior Tech';
        if (lvl >= 5) return 'Skilled Technologist';
        return 'Advancing Apprentice';
    };

    const getMotivationalMessage = (lvl) => {
        if (lvl >= 50) return 'You have achieved mastery! You are among the elite.';
        if (lvl >= 25) return 'Your expertise is recognized. You are a true professional!';
        if (lvl >= 10) return 'Your dedication is paying off. Keep pushing forward!';
        if (lvl >= 5) return 'Great progress! You are building real skills.';
        return 'Nice work! Every level brings you closer to mastery.';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                {/* Confetti/Stars Background */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white text-center">
                    {/* Animated particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-float-1"></div>
                        <div className="absolute top-10 right-1/4 w-3 h-3 bg-pink-300 rounded-full animate-float-2"></div>
                        <div className="absolute top-5 left-3/4 w-2 h-2 bg-blue-300 rounded-full animate-float-3"></div>
                        <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-green-300 rounded-full animate-float-1"></div>
                        <div className="absolute bottom-5 right-1/3 w-3 h-3 bg-yellow-300 rounded-full animate-float-2"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                        <h2 className="text-3xl font-bold mb-2">LEVEL UP!</h2>
                        <p className="text-indigo-100 text-sm mb-6">You've gained new skills</p>
                        
                        {/* Level Display */}
                        <div className={`inline-block bg-gradient-to-r ${getLevelColor(newLevel)} text-white px-8 py-4 rounded-2xl shadow-xl mb-4`}>
                            <div className="text-5xl font-black">{newLevel}</div>
                            <div className="text-sm font-semibold mt-1 opacity-90">
                                {getLevelTitle(newLevel)}
                            </div>
                        </div>

                        <p className="text-white/90 text-sm px-4">
                            {getMotivationalMessage(newLevel)}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <p className="text-slate-700 mb-4">
                        Keep learning to unlock more achievements and climb the leaderboard!
                    </p>
                    
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        Continue Learning
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LevelUpModal;
