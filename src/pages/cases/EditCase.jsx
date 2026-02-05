import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import caseService from '../../services/caseService';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const EditCase = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Load existing case data
    useEffect(() => {
        const loadCase = async () => {
            try {
                const caseData = await caseService.getCaseById(id);
                
                // Check permission
                if (user.id !== caseData.author?._id && user.role !== 'admin') {
                    alert('❌ You do not have permission to edit this case.');
                    navigate(`/cases/${id}`);
                    return;
                }

                // Populate form with existing data
                setFormData({
                    title: caseData.title || '',
                    patientInfo: caseData.patientInfo || { age: '', ageUnit: 'years', gender: '', handedness: '' },
                    history: caseData.history || '',
                    medications: caseData.medications?.join(', ') || '',
                    findings: caseData.findings || { background: '', interictal: '', ictal: '', classification: '' },
                    tags: caseData.tags?.join(', ') || '',
                    attachments: caseData.attachments || []
                });
                
                setLoading(false);
            } catch (err) {
                console.error('Failed to load case:', err);
                setError('Failed to load case for editing');
                setLoading(false);
            }
        };

        if (id && user) {
            loadCase();
        }
    }, [id, user, navigate]);

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
            console.log('📤 Uploading new file:', file.name);
            const response = await caseService.uploadAttachment(file);
            console.log('✅ Upload response:', response);
            
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, response]
            }));
            
            setFile(null);
            setFilePreview(null);
            alert(`✅ File "${file.name}" uploaded successfully!`);
        } catch (error) {
            console.error('❌ Upload failed:', error);
            alert(`Failed to upload file: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveAttachment = (index) => {
        if (window.confirm('Remove this attachment?')) {
            setFormData(prev => ({
                ...prev,
                attachments: prev.attachments.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async () => {
        console.log('🚀 handleSubmit called for edit');
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

            console.log('📤 Updating case:', id);
            await caseService.updateCase(id, finalData);
            console.log('✅ Case updated successfully');
            
            alert('✅ Case updated successfully!');
            navigate(`/cases/${id}`);
        } catch (error) {
            console.error('❌ Update failed:', error);
            alert(`❌ Failed to update case: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text">Edit Case</h1>
                <p className="text-sm text-slate-600 mt-1">Update case details and attachments</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= s ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {s}
                        </div>
                        {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-purple-600' : 'bg-slate-200'}`}></div>}
                    </div>
                ))}
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Basic Information</h2>
                    
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Case Title *"
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            name="age"
                            value={formData.patientInfo.age}
                            onChange={(e) => handleChange(e, 'patientInfo')}
                            placeholder="Patient Age"
                            className="p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                        />
                        <select
                            name="ageUnit"
                            value={formData.patientInfo.ageUnit}
                            onChange={(e) => handleChange(e, 'patientInfo')}
                            className="p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                        >
                            <option value="years">Years</option>
                            <option value="months">Months</option>
                            <option value="days">Days</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <select
                            name="gender"
                            value={formData.patientInfo.gender}
                            onChange={(e) => handleChange(e, 'patientInfo')}
                            className="p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Unknown">Unknown</option>
                        </select>
                        <select
                            name="handedness"
                            value={formData.patientInfo.handedness}
                            onChange={(e) => handleChange(e, 'patientInfo')}
                            className="p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                        >
                            <option value="">Select Handedness</option>
                            <option value="Right">Right</option>
                            <option value="Left">Left</option>
                            <option value="Ambidextrous">Ambidextrous</option>
                            <option value="Unknown">Unknown</option>
                        </select>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button onClick={() => navigate(`/cases/${id}`)} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium">Cancel</button>
                        <button onClick={() => setStep(2)} className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Next</button>
                    </div>
                </div>
            )}

            {/* Step 2: Clinical Details */}
            {step === 2 && (
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Clinical Details</h2>
                    
                    <textarea
                        name="history"
                        value={formData.history}
                        onChange={handleChange}
                        placeholder="Clinical History / HPI *"
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none resize-none"
                        rows="4"
                        required
                    />

                    <input
                        type="text"
                        name="medications"
                        value={formData.medications}
                        onChange={handleChange}
                        placeholder="Medications (comma-separated)"
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                    />

                    <textarea
                        name="background"
                        value={formData.findings.background}
                        onChange={(e) => handleChange(e, 'findings')}
                        placeholder="Background Activity"
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none resize-none"
                        rows="2"
                    />

                    <textarea
                        name="interictal"
                        value={formData.findings.interictal}
                        onChange={(e) => handleChange(e, 'findings')}
                        placeholder="Interictal Findings"
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none resize-none"
                        rows="2"
                    />

                    <textarea
                        name="ictal"
                        value={formData.findings.ictal}
                        onChange={(e) => handleChange(e, 'findings')}
                        placeholder="Ictal Findings"
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none resize-none"
                        rows="2"
                    />

                    <input
                        type="text"
                        name="classification"
                        value={formData.findings.classification}
                        onChange={(e) => handleChange(e, 'findings')}
                        placeholder="Classification (e.g., Normal, Generalized Epilepsy)"
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                    />

                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep(1)} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium">Back</button>
                        <button onClick={() => setStep(3)} className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Next</button>
                    </div>
                </div>
            )}

            {/* Step 3: Attachments & Tags */}
            {step === 3 && (
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Attachments & Tags</h2>

                    {/* Current Attachments */}
                    {formData.attachments.length > 0 && (
                        <div className="space-y-3 mb-4">
                            <h3 className="text-sm font-semibold text-slate-700">Current Attachments</h3>
                            {formData.attachments.map((att, idx) => (
                                <div key={idx} className="bg-slate-50 border border-slate-300 rounded-lg overflow-hidden">
                                    {att.type === 'image' && att.url && (
                                        <div className="p-3 bg-white border-b border-slate-200">
                                            <img 
                                                src={att.url.startsWith('http') ? att.url : `${apiService.getBaseUrl()}${att.url}`}
                                                alt={att.filename}
                                                className="w-full max-h-64 object-contain rounded"
                                                onError={(e) => {
                                                    console.error('❌ Image preview failed:', att.url);
                                                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="red">Failed to load</text></svg>';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between p-3">
                                        <span className="text-sm text-slate-900 font-medium">{att.filename}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAttachment(idx)}
                                            className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload New Attachment */}
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50">
                        <input
                            type="file"
                            id="case-upload-edit"
                            className="hidden"
                            onChange={handleFileSelect}
                            accept="image/*,.pdf"
                        />
                        
                        {file ? (
                            <div className="space-y-3">
                                {filePreview && (
                                    <img src={filePreview} alt="Preview" className="w-full max-h-48 object-contain rounded" />
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-900 font-medium">{file.name}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddAttachment}
                                            disabled={uploading}
                                            className="px-4 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            {uploading ? 'Uploading...' : 'Add File'}
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
                            </div>
                        ) : (
                            <label htmlFor="case-upload-edit" className="cursor-pointer text-center w-full flex flex-col items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <p className="text-purple-700 font-medium">Upload Additional Files</p>
                                <p className="text-xs text-slate-500 mt-1">Images, PDF (Max 10MB)</p>
                            </label>
                        )}
                    </div>

                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="Tags (e.g., #Seizure, #Pediatric)"
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                    />

                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep(2)} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium">Back</button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg disabled:opacity-50 transition-all"
                        >
                            {isSubmitting ? 'Updating...' : 'Update Case'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditCase;
