import mongoose from 'mongoose';

// Hierarchical exam blueprint. For this milestone only the exam root and the
// four top-level ABRET R. EEG T. 2026 domains are populated; objectives and
// knowledge areas will be added as child nodes in a later content milestone.

const blueprintNodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    blueprintKey: { type: String, required: true, index: true },
    nodeType: {
        type: String,
        enum: ['exam', 'domain', 'objective', 'knowledge_area'],
        required: true,
    },
    parentCode: { type: String, default: null, index: true },
    title: { type: String, required: true },
    romanNumeral: { type: String, default: null },
    legacyDomainId: { type: String, default: null },
    weightPercent: { type: Number, default: null, min: 0, max: 100 },
    sortOrder: { type: Number, default: 0 },
    source: {
        organization: { type: String, default: null },
        credential: { type: String, default: null },
        document: { type: String, default: null },
        year: { type: Number, default: null },
    },
    active: { type: Boolean, default: true },
}, { timestamps: true });

export const BlueprintNode = mongoose.model('BlueprintNode', blueprintNodeSchema);
