import React, { useState } from 'react';

const CaseDisclaimerModal = ({ isOpen, onAccept, onDecline }) => {
    const [hasRead, setHasRead] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);

    if (!isOpen) return null;

    const canProceed = hasRead && agreedTerms;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-red-600 text-white px-6 py-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Patient Privacy & Case Submission Guidelines
                    </h2>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* Warning Box */}
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                        <p className="text-amber-900 font-semibold text-sm">
                            ⚠️ <strong>IMPORTANT:</strong> All cases shared on this platform must be fully de-identified to protect patient privacy and comply with HIPAA regulations.
                        </p>
                    </div>

                    {/* Requirements */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">🔒 De-identification Requirements</h3>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="text-red-600 font-bold">❌</span>
                                <div>
                                    <strong className="text-slate-900">NEVER Include:</strong>
                                    <ul className="list-disc list-inside text-slate-700 text-sm ml-4 mt-1 space-y-1">
                                        <li>Patient names, initials, or nicknames</li>
                                        <li>Medical record numbers (MRN) or patient IDs</li>
                                        <li>Dates of birth or exact ages over 89 years</li>
                                        <li>Full addresses (beyond state or region)</li>
                                        <li>Phone numbers or email addresses</li>
                                        <li>Social security numbers</li>
                                        <li>Hospital/clinic names or locations</li>
                                        <li>Provider names (physicians, technicians)</li>
                                        <li>Photographs or other images showing faces</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 mt-4">
                                <span className="text-green-600 font-bold">✅</span>
                                <div>
                                    <strong className="text-slate-900">Safe to Include:</strong>
                                    <ul className="list-disc list-inside text-slate-700 text-sm ml-4 mt-1 space-y-1">
                                        <li>Age ranges (e.g., "8 years", "30s", "elderly")</li>
                                        <li>Gender (if relevant to case)</li>
                                        <li>Clinical symptoms and EEG findings</li>
                                        <li>Medications (generic names)</li>
                                        <li>Relative time references (e.g., "recent onset", "chronic")</li>
                                        <li>EEG waveform images with headers cropped/masked</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Guidelines */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">📷 EEG Image Requirements</h3>
                        <p className="text-slate-700 text-sm mb-2">
                            Before uploading EEG screenshots or PDFs:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
                            <li><strong>Crop or mask all headers</strong> containing patient/facility information</li>
                            <li>Remove timestamps and date fields</li>
                            <li>Ensure only waveform traces and technical annotations are visible</li>
                            <li>Verify no identifiers appear in image metadata</li>
                        </ul>
                    </div>

                    {/* Moderation Notice */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">👨‍⚖️ Case Review Process</h3>
                        <p className="text-slate-700 text-sm">
                            All submitted cases undergo admin review to ensure compliance with privacy standards before publication. Cases may be:
                        </p>
                        <ul className="list-disc list-inside text-slate-700 text-sm mt-2 space-y-1">
                            <li><strong>Approved:</strong> Published to community feed</li>
                            <li><strong>Rejected:</strong> Returned if de-identification is insufficient</li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-lg">
                        <p className="mb-2">
                            <strong>Legal Compliance:</strong> By submitting a case, you confirm that:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>The case has been properly de-identified per HIPAA guidelines</li>
                            <li>You have legal authority to share this educational material</li>
                            <li>No patient privacy laws or institutional policies are violated</li>
                            <li>All identifiable information has been removed or anonymized</li>
                        </ul>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={hasRead}
                                onChange={(e) => setHasRead(e.target.checked)}
                                className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                I have <strong>read and understood</strong> the de-identification requirements above
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreedTerms}
                                onChange={(e) => setAgreedTerms(e.target.checked)}
                                className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                I <strong>confirm</strong> that the case I am about to submit is fully de-identified and complies with HIPAA regulations
                            </span>
                        </label>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-200">
                    <button
                        onClick={onDecline}
                        className="px-5 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAccept}
                        disabled={!canProceed}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${
                            canProceed
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        I Understand - Proceed to Share Case
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CaseDisclaimerModal;
