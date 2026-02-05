import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import caseService from '../../services/caseService';
import apiService from '../../services/apiService';
import CaseDisclaimerModal from '../../components/CaseDisclaimerModal';

const ShareCase = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Disclaimer Modal State
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        patientInfo: { age: '', ageUnit: 'years', gender: '', handedness: '' },
        history: '',
        medications: '', // comma separated string
        findings: { background: '', interictal: '', ictal: '', classification: '' },
        tags: '', // comma separated string
        attachments: []
    });

    // Upload State
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Check if user has already agreed in this session
    useEffect(() => {
        const agreedInSession = sessionStorage.getItem('caseDisclaimerAgreed');
        if (agreedInSession === 'true') {
            setShowDisclaimer(false);
            setHasAgreedToTerms(true);
        }
    }, []);

    // Disclaimer handlers
    const handleAcceptDisclaimer = () => {
        setShowDisclaimer(false);
        setHasAgreedToTerms(true);
        sessionStorage.setItem('caseDisclaimerAgreed', 'true');
    };

    const handleDeclineDisclaimer = () => {
        navigate('/cases');
    };

    // Debug helper - can be removed later
    const runDiagnostics = () => {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'https://neurotrace-academy.onrender.com/api';
        
        console.log('=== CASE SHARING DIAGNOSTICS ===');
        console.log('1. Authentication:');
        console.log('   Token present:', !!token);
        console.log('   Token:', token ? `${token.substring(0, 20)}...` : 'MISSING');
        console.log('2. API Configuration:');
        console.log('   API URL:', apiUrl);
        console.log('3. Form State:');
        console.log('   Title:', formData.title);
        console.log('   History:', formData.history ? 'Present' : 'Missing');
        console.log('   Attachments:', formData.attachments.length);
        console.log('4. Current Step:', step);
        console.log('================================');
        
        alert(`Diagnostics logged to console (F12).\n\nToken: ${token ? '✅ Present' : '❌ Missing'}\nAttachments: ${formData.attachments.length}`);
    };

    const handleChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Preview
            if (e.target.files[0].type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setFilePreview(reader.result);
                reader.readAsDataURL(e.target.files[0]);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleAddAttachment = async () => {
        if (!file) return;
        setUploading(true);
        try {
            console.log('📤 Uploading file:', file.name, file.type, file.size);
            const response = await caseService.uploadAttachment(file);
            console.log('✅ Upload response:', response);
            
            // Add to attachments
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, response]
            }));
            
            // Clear the file input for next upload
            setFile(null);
            setFilePreview(null);
            
            // Show success message
            const msg = `✅ File uploaded successfully!\n\n"${file.name}" has been added to your case.\n\nYou can see the preview below in the "Attached Files" section.`;
            alert(msg);
            
            // Scroll to attachments list to show the uploaded file
            setTimeout(() => {
                const attachmentsList = document.querySelector('.bg-green-50');
                if (attachmentsList) {
                    attachmentsList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 300);
        } catch (error) {
            console.error('❌ Upload failed:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`Failed to upload file:\n${errorMessage}\n\nPlease check console for details.`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        console.log('🚀 handleSubmit called');
        setIsSubmitting(true);
        
        try {
            // Validation
            if (!formData.title || !formData.history) {
                console.warn('⚠️ Validation failed: missing required fields');
                alert('❌ Title and History are required!');
                setIsSubmitting(false);
                return;
            }

            // Check authentication
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('❌ No authentication token found');
                alert('❌ You must be logged in to submit a case.\n\nPlease log in and try again.');
                navigate('/login');
                return;
            }

            // Process tags and medications
            const finalData = {
                ...formData,
                medications: formData.medications.split(',').map(m => m.trim()).filter(Boolean),
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            console.log('📤 Submitting case data:', {
                title: finalData.title,
                hasHistory: !!finalData.history,
                attachmentsCount: finalData.attachments.length,
                tagsCount: finalData.tags.length
            });
            
            // Add timeout handling
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout - server may be cold starting. Please try again in 30 seconds.')), 90000)
            );
            
            const response = await Promise.race([
                caseService.createCase(finalData),
                timeoutPromise
            ]);
            
            console.log('✅ Case created successfully:', response);
            
            // Show success message
            alert('✅ Case submitted successfully!\n\n📋 Your case is now pending admin review.\n\nOur team will verify that all patient information is properly de-identified before publishing to the community feed.\n\nYou will be notified once your case is approved.');
            
            // Redirect to cases page
            navigate('/cases');
        } catch (error) {
            console.error('❌ Submission failed:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response
            });
            
            let errorMessage = 'Unknown error occurred';
            
            if (error.message) {
                errorMessage = error.message;
            }
            
            if (error.message?.includes('timeout') || error.message?.includes('cold start')) {
                errorMessage = 'Request timeout - the server is starting up.\n\nPlease wait 30 seconds and try again.';
            } else if (error.message?.includes('Network')) {
                errorMessage = 'Network error - please check your internet connection.';
            } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                errorMessage = 'Session expired - please log in again.';
                setTimeout(() => navigate('/login'), 2000);
            }
            
            alert(`❌ Failed to submit case:\n\n${errorMessage}\n\nPlease check the console (F12) for more details or contact support.`);
        } finally {
            setIsSubmitting(false);
            console.log('✅ handleSubmit completed');
        }
    };

    return (
        <>
            {/* Disclaimer Modal */}
            <CaseDisclaimerModal
                isOpen={showDisclaimer}
                onAccept={handleAcceptDisclaimer}
                onDecline={handleDeclineDisclaimer}
            />

            {/* Submitting Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md mx-4 text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="animate-spin h-12 w-12 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Publishing Your Case</h3>
                        <p className="text-slate-600 text-sm">
                            Please wait while we submit your case for review...
                        </p>
                        <p className="text-xs text-slate-500 mt-3">
                            This may take up to 60 seconds if the server is starting up.
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-text">Share a Clinical Case</h1>
                    <button
                        onClick={runDiagnostics}
                        className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
                        type="button"
                        title="Run diagnostics if you're experiencing issues"
                    >
                        🔍 Debug
                    </button>
                </div>

                {/* Show reminder after disclaimer accepted */}
                {hasAgreedToTerms && (
                    <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                        <p className="text-sm text-amber-900">
                            <strong>⚠️ Reminder:</strong> Ensure all patient identifiers are removed. Your case will undergo admin review before publication.
                        </p>
                    </div>
                )}

            {/* Stepper */}
            <div className="flex items-center mb-8 w-full max-w-lg mx-auto">
                <div className="flex-1 relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-purple-700 text-white`}>1</div>
                    <span className="text-xs mt-1 font-medium text-purple-700">Patient</span>
                </div>

                <div className={`flex-1 h-1 ${step >= 2 ? 'bg-purple-700' : 'bg-slate-200'}`}></div>

                <div className="flex-1 relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-purple-700 text-white' : 'bg-surface border border-slate-300 text-slate-500'}`}>2</div>
                    <span className={`text-xs mt-1 font-medium ${step >= 2 ? 'text-purple-700' : 'text-slate-400'}`}>Findings</span>
                </div>

                <div className={`flex-1 h-1 ${step >= 3 ? 'bg-purple-700' : 'bg-slate-200'}`}></div>

                <div className="flex-1 relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-purple-700 text-white' : 'bg-surface border border-slate-300 text-slate-500'}`}>3</div>
                    <span className={`text-xs mt-1 font-medium ${step >= 3 ? 'text-purple-700' : 'text-slate-400'}`}>Uploads</span>
                </div>
            </div>

            {/* Step 1: Patient Context */}
            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-xl font-semibold text-text">Patient Context</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Case Title (e.g., User with 3Hz Spike & Wave)"
                            className="col-span-2 p-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none"
                            required
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="age"
                                value={formData.patientInfo.age}
                                onChange={(e) => handleChange(e, 'patientInfo')}
                                placeholder="Age"
                                className="w-24 p-3 bg-surface border border-border rounded-lg text-text"
                            />
                            <select
                                name="ageUnit"
                                value={formData.patientInfo.ageUnit}
                                onChange={(e) => handleChange(e, 'patientInfo')}
                                className="p-3 bg-surface border border-border rounded-lg text-text"
                            >
                                <option value="years">Years</option>
                                <option value="months">Months</option>
                                <option value="days">Days</option>
                            </select>
                        </div>
                        <select
                            name="gender"
                            value={formData.patientInfo.gender}
                            onChange={(e) => handleChange(e, 'patientInfo')}
                            className="p-3 bg-surface border border-border rounded-lg text-text"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <textarea
                        name="history"
                        value={formData.history}
                        onChange={handleChange}
                        placeholder="Clinical History (HPI) - Required"
                        className="w-full h-32 p-3 bg-surface border border-border rounded-lg text-text focus:border-primary focus:outline-none"
                    ></textarea>

                    <input
                        type="text"
                        name="medications"
                        value={formData.medications}
                        onChange={handleChange}
                        placeholder="Medications (comma separated, e.g., Keppra, Vimpat)"
                        className="w-full p-3 bg-surface border border-border rounded-lg text-text"
                    />

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.title || !formData.history}
                            className="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                        >
                            Next: Findings
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: EEG Findings */}
            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-xl font-semibold text-slate-900">EEG Findings</h2>

                    <div className="space-y-3">
                        <label className="text-sm text-slate-600">Background Activity (PDR, Organization)</label>
                        <textarea
                            name="background"
                            value={formData.findings.background}
                            onChange={(e) => handleChange(e, 'findings')}
                            className="w-full h-24 p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none transition-all shadow-sm"
                        ></textarea>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm text-slate-600">Interictal Abnormalities (Spikes, Slowing)</label>
                        <textarea
                            name="interictal"
                            value={formData.findings.interictal}
                            onChange={(e) => handleChange(e, 'findings')}
                            className="w-full h-24 p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none transition-all shadow-sm"
                        ></textarea>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm text-slate-600">Ictal Events (Seizures)</label>
                        <textarea
                            name="ictal"
                            value={formData.findings.ictal}
                            onChange={(e) => handleChange(e, 'findings')}
                            className="w-full h-24 p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none transition-all shadow-sm"
                        ></textarea>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep(1)} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium">Back</button>
                        <button
                            onClick={() => setStep(3)}
                            className="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 shadow-sm transition-colors"
                        >
                            Next: Uploads
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Uploads & Review */}
            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-xl font-semibold text-slate-900">Media & Publish</h2>

                    {/* File Uploader */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-slate-700">Upload EEG Images/PDFs</h3>
                            {formData.attachments.length === 0 && (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Recommended</span>
                            )}
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="case-upload"
                                accept="image/*,.pdf"
                            />
                            {file ? (
                                <div className="text-center">
                                    {filePreview && <img src={filePreview} alt="Preview" className="h-32 mx-auto mb-2 rounded shadow-sm border border-slate-200" />}
                                    <p className="text-slate-900 font-medium">{file.name}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={handleAddAttachment}
                                            disabled={uploading}
                                            className="px-4 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploading ? 'Uploading...' : 'Confirm Upload'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFile(null);
                                                setFilePreview(null);
                                            }}
                                            className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-md text-sm hover:bg-slate-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label htmlFor="case-upload" className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <p className="text-purple-700 font-medium">Click to upload EEG trace or PDF</p>
                                    <p className="text-xs text-slate-500 mt-1">Supported: Images, PDF (Max 10MB)</p>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Attachment List */}
                    {formData.attachments.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <h3 className="text-sm font-semibold text-green-700">Attached Files ({formData.attachments.length})</h3>
                            </div>
                            {formData.attachments.map((att, idx) => (
                                <div key={idx} className="bg-green-50 border border-green-300 rounded-lg shadow-sm overflow-hidden">
                                    {att.type === 'image' && att.url && (
                                        <div className="p-3 bg-white border-b border-green-200">
                                            <img 
                                                src={att.url.startsWith('http') ? att.url : `${apiService.getBaseUrl()}${att.url}`}
                                                alt={att.filename}
                                                className="w-full max-h-64 object-contain rounded border border-slate-200"
                                                onLoad={() => console.log('✅ Image loaded successfully:', att.filename)}
                                                onError={(e) => {
                                                    console.error('❌ Image preview failed:', att.url);
                                                    console.log('Full URL:', e.target.src);
                                                    console.log('Base URL:', apiService.getBaseUrl());
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-sm text-slate-900 truncate font-medium">{att.filename}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-slate-500 uppercase bg-white px-2 py-1 rounded border border-slate-200">{att.type}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`Remove "${att.filename}"?`)) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            attachments: prev.attachments.filter((_, i) => i !== idx)
                                                        }));
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-800 text-xs font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="Tags (e.g., #Seizure, #Pediatric, #Artifact)"
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none transition-all shadow-sm"
                    />

                    <div className="flex justify-between pt-4">
                        <button 
                            onClick={() => setStep(2)} 
                            disabled={isSubmitting}
                            className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Publishing Case...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Publish Case</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default ShareCase;
