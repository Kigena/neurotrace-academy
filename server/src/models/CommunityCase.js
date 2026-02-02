import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const communityCaseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    // Patient Demographics (Anonymized)
    patientInfo: {
        age: { type: Number }, // e.g., 25
        ageUnit: { type: String, enum: ['years', 'months', 'days'], default: 'years' },
        gender: { type: String, enum: ['', 'Male', 'Female', 'Other', 'Unknown'], default: '' },
        handedness: { type: String, enum: ['', 'Right', 'Left', 'Ambidextrous', 'Unknown'], default: '' }
    },
    // Clinical Details
    history: {
        type: String,
        required: true // HPI is critical
    },
    medications: [{
        type: String
    }],
    // EEG Technical & Findings
    findings: {
        background: { type: String }, // PDR, organization
        interictal: { type: String }, // Spikes, slowing
        ictal: { type: String }, // Seizure description
        classification: { type: String } // e.g., "Normal", "Generalized Epilepsy"
    },
    tags: [{
        type: String // e.g., #Absence, #Artifact
    }],
    // Media
    attachments: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'pdf', 'video', 'other'] },
        filename: { type: String },
        caption: { type: String }
    }],
    // Social & Metrics
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for searching
communityCaseSchema.index({ title: 'text', history: 'text', 'findings.classification': 'text' });
communityCaseSchema.index({ tags: 1 });
communityCaseSchema.index({ createdAt: -1 });

export default mongoose.model('CommunityCase', communityCaseSchema);
