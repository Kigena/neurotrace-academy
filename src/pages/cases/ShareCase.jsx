import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import caseService from '../../services/caseService';

const ShareCase = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, response]
            }));
            setFile(null);
            setFilePreview(null);
            alert('✅ File uploaded successfully!');
        } catch (error) {
            console.error('❌ Upload failed:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`Failed to upload file:\n${errorMessage}\n\nPlease check console for details.`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validation
            if (!formData.title || !formData.history) {
                alert('❌ Title and History are required!');
                setIsSubmitting(false);
                return;
            }

            // Process tags and medications
            const finalData = {
                ...formData,
                medications: formData.medications.split(',').map(m => m.trim()).filter(Boolean),
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            console.log('📤 Submitting case:', finalData);
            const response = await caseService.createCase(finalData);
            console.log('✅ Case created:', response);
            
            alert('✅ Case published successfully!');
            navigate('/cases'); // Redirect to feed
        } catch (error) {
            console.error('❌ Submission failed:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`Failed to create case:\n${errorMessage}\n\nPlease check console for details.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-slate-600">✅ Attached Files ({formData.attachments.length})</h3>
                            {formData.attachments.map((att, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="text-sm text-slate-900 truncate font-medium">{att.filename}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 uppercase bg-white px-2 py-1 rounded">{att.type}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    attachments: prev.attachments.filter((_, i) => i !== idx)
                                                }));
                                            }}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                            Remove
                                        </button>
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
                        <button onClick={() => setStep(2)} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium">Back</button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish Case'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareCase;
