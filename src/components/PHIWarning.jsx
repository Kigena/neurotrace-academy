import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

/**
 * PHI Warning Component - Quietly checks for potential PHI and warns user
 */
const PHIWarning = ({ content, onContentChange }) => {
    const [phiCheck, setPhiCheck] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [lastChecked, setLastChecked] = useState('');

    useEffect(() => {
        // Debounce PHI check - only check when user stops typing
        const debounceTimer = setTimeout(() => {
            if (content && content.length > 20 && content !== lastChecked) {
                checkForPHI(content);
            }
        }, 1000); // 1 second delay after user stops typing

        return () => clearTimeout(debounceTimer);
    }, [content]);

    const checkForPHI = async (text) => {
        setIsChecking(true);
        try {
            const result = await apiService.post('/ai/check-phi', { content: text });
            setPhiCheck(result);
            setLastChecked(text);
        } catch (error) {
            console.error('PHI check error:', error);
            // Fail silently - don't disrupt user experience
        } finally {
            setIsChecking(false);
        }
    };

    if (!phiCheck || !phiCheck.hasPHI) {
        return null; // No warning needed
    }

    const getRiskColor = () => {
        switch (phiCheck.riskLevel) {
            case 'critical': return 'red';
            case 'high': return 'orange';
            case 'medium': return 'yellow';
            default: return 'yellow';
        }
    };

    const color = getRiskColor();
    const bgColor = `bg-${color}-50`;
    const borderColor = `border-${color}-300`;
    const textColor = `text-${color}-800`;
    const buttonColor = `bg-${color}-600`;

    return (
        <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-4 mb-4`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {phiCheck.riskLevel === 'critical' ? (
                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className={`w-6 h-6 text-${color}-600`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold ${textColor} mb-2`}>
                        {phiCheck.riskLevel === 'critical' ? '🔒 Critical: Protected Health Information Detected' :
                         phiCheck.riskLevel === 'high' ? '⚠️ Warning: Possible PHI Detected' :
                         '⚠️ Notice: Please Review Your Content'}
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                        {phiCheck.detections.map((detection, idx) => (
                            <div key={idx} className={`${textColor}`}>
                                <p className="font-medium">• {detection.message}</p>
                                {detection.examples && detection.examples.length > 0 && (
                                    <p className="text-xs ml-4 opacity-75">
                                        Examples: {detection.examples.join(', ')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className={`mt-3 p-3 bg-white rounded border ${borderColor}`}>
                        <p className="text-sm font-medium text-slate-700 mb-2">
                            📝 Please anonymize before posting:
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1">
                            <li>• Replace names with "Patient" or "Technologist"</li>
                            <li>• Use age ranges instead of specific dates</li>
                            <li>• Remove facility names and locations</li>
                            <li>• Avoid specific identifiers (MRN, phone, email)</li>
                        </ul>
                    </div>

                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => {
                                // Suggest user edit the content
                                alert('Please review and edit your content to remove any identifying information before posting.');
                            }}
                            className="px-4 py-2 bg-white border-2 border-current text-current rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
                        >
                            I'll Edit My Content
                        </button>
                        <button
                            onClick={() => setPhiCheck(null)}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PHIWarning;
