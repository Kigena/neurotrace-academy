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
            const response = await caseService.uploadAttachment(file);
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, response]
            }));
            setFile(null);
            setFilePreview(null);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Process tags and medications
            const finalData = {
                ...formData,
                medications: formData.medications.split(',').map(m => m.trim()).filter(Boolean),
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            await caseService.createCase(finalData);
            navigate('/cases'); // Redirect to feed
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to create case');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-text mb-6">Share a Clinical Case</h1>

            {/* Stepper */}
            <div className="flex items-center mb-8">
                {[1, 2, 3].map(num => (
                    <div key={num} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= num ? 'bg-primary text-white' : 'bg-surface text-textSecondary border border-border'}`}>
                            {num}
                        </div>
                        {num < 3 && <div className={`w-12 h-1 ${step > num ? 'bg-primary' : 'bg-border'}`}></div>}
                    </div>
                ))}
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
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
                        >
                            Next: Findings
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: EEG Findings */}
            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-xl font-semibold text-text">EEG Findings</h2>

                    <div className="space-y-3">
                        <label className="text-sm text-textSecondary">Background Activity (PDR, Organization)</label>
                        <textarea
                            name="background"
                            value={formData.findings.background}
                            onChange={(e) => handleChange(e, 'findings')}
                            className="w-full h-24 p-3 bg-surface border border-border rounded-lg text-text"
                        ></textarea>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm text-textSecondary">Interictal Abnormalities (Spikes, Slowing)</label>
                        <textarea
                            name="interictal"
                            value={formData.findings.interictal}
                            onChange={(e) => handleChange(e, 'findings')}
                            className="w-full h-24 p-3 bg-surface border border-border rounded-lg text-text"
                        ></textarea>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm text-textSecondary">Ictal Events (Seizures)</label>
                        <textarea
                            name="ictal"
                            value={formData.findings.ictal}
                            onChange={(e) => handleChange(e, 'findings')}
                            className="w-full h-24 p-3 bg-surface border border-border rounded-lg text-text"
                        ></textarea>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep(1)} className="px-6 py-2 text-textSecondary hover:text-text">Back</button>
                        <button
                            onClick={() => setStep(3)}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                        >
                            Next: Uploads
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Uploads & Review */}
            {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-xl font-semibold text-text">Media & Publish</h2>

                    {/* File Uploader */}
                    <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-surface/50">
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="case-upload"
                            accept="image/*,.pdf"
                        />
                        {file ? (
                            <div className="text-center">
                                {filePreview && <img src={filePreview} alt="Preview" className="h-32 mx-auto mb-2 rounded shadow-sm" />}
                                <p className="text-text font-medium">{file.name}</p>
                                <button
                                    onClick={handleAddAttachment}
                                    disabled={uploading}
                                    className="mt-2 px-4 py-1.5 bg-secondary text-white rounded-md text-sm"
                                >
                                    {uploading ? 'Uploading...' : 'Confirm Upload'}
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="case-upload" className="cursor-pointer text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <p className="text-primary font-medium">Click to upload EEG trace or PDF</p>
                                <p className="text-xs text-textSecondary mt-1">Supported: Images, PDF</p>
                            </label>
                        )}
                    </div>

                    {/* Attachment List */}
                    {formData.attachments.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-textSecondary">Attached Files ({formData.attachments.length})</h3>
                            {formData.attachments.map((att, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                                    <span className="text-sm text-text truncate">{att.filename}</span>
                                    <span className="text-xs text-textSecondary uppercase">{att.type}</span>
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
                        className="w-full p-3 bg-surface border border-border rounded-lg text-text"
                    />

                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep(2)} className="px-6 py-2 text-textSecondary hover:text-text">Back</button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover shadow-lg disabled:opacity-50"
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
