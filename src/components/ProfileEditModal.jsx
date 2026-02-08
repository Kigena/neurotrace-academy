import React, { useState, useRef } from 'react';
import apiService from '../services/apiService';

const SPECIALIZATIONS = [
    'Pediatric EEG',
    'Adult EEG',
    'ICU/Critical Care',
    'Epilepsy Monitoring',
    'Sleep Studies',
    'Intraoperative Monitoring',
    'Long-term Monitoring',
    'Ambulatory EEG'
];

function ProfileEditModal({ user, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.profile?.bio || '',
        location: user?.profile?.location || '',
        institution: user?.profile?.institution || '',
        specializations: user?.profile?.specializations || [],
        linkedin: user?.profile?.socialLinks?.linkedin || '',
        twitter: user?.profile?.socialLinks?.twitter || '',
        website: user?.profile?.socialLinks?.website || '',
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.profile?.avatar || null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSpecializationToggle = (spec) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations.includes(spec)
                ? prev.specializations.filter(s => s !== spec)
                : [...prev.specializations, spec]
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('File must be an image');
                return;
            }
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate inputs
            if (!formData.name || formData.name.trim().length < 2) {
                throw new Error('Name must be at least 2 characters');
            }
            if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                throw new Error('Please enter a valid email address');
            }
            if (formData.bio && formData.bio.length > 500) {
                throw new Error('Bio must be 500 characters or less');
            }

            // Upload avatar if changed
            if (avatar) {
                const avatarFormData = new FormData();
                avatarFormData.append('avatar', avatar);
                await apiService.post('/profile/avatar', avatarFormData);
            }

            // Update basic profile
            await apiService.put('/auth/profile', {
                userId: user._id || user.id,
                name: formData.name,
                email: formData.email,
            });

            // Update extended profile
            await apiService.put('/profile', {
                bio: formData.bio,
                location: formData.location,
                institution: formData.institution,
                specializations: formData.specializations,
                socialLinks: {
                    linkedin: formData.linkedin,
                    twitter: formData.twitter,
                    website: formData.website,
                }
            });

            // Fetch updated user data
            const updatedUser = await apiService.get(`/profile/${user._id || user.id}`);
            onSave(updatedUser.user);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const charCount = formData.bio.length;
    const charLimit = 500;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Edit Profile</h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Profile Picture
                            </label>
                            <div className="flex items-center gap-4">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar preview"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                                        {formData.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Change Photo
                                    </button>
                                    <p className="text-xs text-slate-500 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                maxLength={500}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Tell us about yourself..."
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>Brief description of your expertise</span>
                                <span className={charCount > charLimit * 0.9 ? 'text-orange-600' : ''}>
                                    {charCount}/{charLimit}
                                </span>
                            </div>
                        </div>

                        {/* Location & Institution */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="City, State"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Institution
                                </label>
                                <input
                                    type="text"
                                    name="institution"
                                    value={formData.institution}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Hospital or Organization"
                                />
                            </div>
                        </div>

                        {/* Specializations */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Specializations
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SPECIALIZATIONS.map((spec) => (
                                    <button
                                        key={spec}
                                        type="button"
                                        onClick={() => handleSpecializationToggle(spec)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.specializations.includes(spec)
                                                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                                                : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                            }`}
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Social Links
                            </label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600 w-24 text-sm">LinkedIn</span>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600 w-24 text-sm">Twitter</span>
                                    <input
                                        type="url"
                                        name="twitter"
                                        value={formData.twitter}
                                        onChange={handleChange}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="https://twitter.com/username"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600 w-24 text-sm">Website</span>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ProfileEditModal;
