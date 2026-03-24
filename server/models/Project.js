import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: { type: String, default: '' },
  summary: { type: String, default: '' },
  techStack: { type: [String], default: [] },
  keyFeatures: { type: [String], default: [] },
  skillsExtracted: { type: [String], default: [] },
  readmeRaw: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
