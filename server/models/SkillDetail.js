import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    difficulty: { type: String }
});

const skillDetailSchema = new mongoose.Schema({
    skill: { type: String, required: true, lowercase: true, trim: true },
    targetJob: { type: String, lowercase: true, trim: true, default: 'software developer' },
    description: { type: String, required: true },
    whyItMatters: { type: String },
    resources: [resourceSchema],
    createdAt: { type: Date, default: Date.now, expires: '30d' } // Auto-delete after 30 days
});

// Compound index for fast lookup
skillDetailSchema.index({ skill: 1, targetJob: 1 }, { unique: true });

const SkillDetail = mongoose.model('SkillDetail', skillDetailSchema);

export default SkillDetail;
