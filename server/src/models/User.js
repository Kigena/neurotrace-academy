import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    profile: {
        avatar: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: 500,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        institution: {
            type: String,
            default: ''
        },
        certifications: {
            type: [String],
            default: []
        },
        specializations: {
            type: [String],
            default: []
        },
        socialLinks: {
            linkedin: {
                type: String,
                default: ''
            },
            twitter: {
                type: String,
                default: ''
            },
            website: {
                type: String,
                default: ''
            }
        },
        isPublic: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: null
    }
});

export const User = mongoose.model('User', userSchema);
