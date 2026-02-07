import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import apiService from '../services/apiService';

/**
 * Study Notes Button - Convert content to comprehensive study notes
 */
const StudyNotesButton = ({ pageTitle, pageContent, caseId = null }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [studyNotes, setStudyNotes] = useState(null);

    const handleGenerateNotes = async () => {
        setIsLoading(true);
        try {
            let response;
            if (caseId) {
                // Use case-specific endpoint
                response = await apiService.post(`/cases/${caseId}/study-notes`, {});
            } else {
                // Use generic endpoint
                response = await apiService.post('/ai/study-notes', {
                    pageTitle,
                    pageContent: pageContent.substring(0, 4000)
                });
            }
            setStudyNotes(response.studyNotes);
        } catch (error) {
            console.error('Study notes error:', error);
            alert('Failed to generate study notes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([studyNotes], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pageTitle.replace(/[^a-z0-9]/gi, '_')}_study_notes.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            {/* Generate Button */}
            <button
                onClick={handleGenerateNotes}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 text-sm font-medium shadow-md"
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Notes...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Convert to Study Notes</span>
                    </>
                )}
            </button>

            {/* Study Notes Panel */}
            {studyNotes && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                            </svg>
                            Study Notes
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium"
                                title="Download as text file"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </button>
                            <button
                                onClick={() => setStudyNotes(null)}
                                className="text-emerald-600 hover:text-emerald-800"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Notes Content - No character limit, with markdown rendering */}
                    <div className="prose prose-sm max-w-none bg-white rounded-lg p-6 border border-emerald-200 prose-p:text-slate-800 prose-headings:text-slate-900 prose-strong:font-bold prose-ul:text-slate-800 prose-li:text-slate-800">
                        <ReactMarkdown>{studyNotes}</ReactMarkdown>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(studyNotes);
                                alert('✅ Study notes copied to clipboard!');
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyNotesButton;
