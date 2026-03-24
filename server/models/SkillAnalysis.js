import mongoose from 'mongoose';

const skillAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  matchingSkills: [String],
  missingSkills: [String],
  suggestedSkills: [String],
  industryDemandSkills: [String],
  analysisDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('SkillAnalysis', skillAnalysisSchema);
