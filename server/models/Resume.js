import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  resumeFile: {
    filename: String,
    uploadedAt: {
      type: Date,
      default: null
    },
    filePath: String
  },
  resumeData: {
    skills: {
      type: [String],
      default: []
    },
    tools: {
      type: [String],
      default: []
    },
    projects: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '', trim: true },
        techStack: { type: [String], default: [] }
      }
    ],
    experience: [
      {
        company: { type: String, default: 'Not Specified', trim: true },
        role: { type: String, required: true, trim: true },
        duration: { type: String, default: '', trim: true },
        description: { type: String, default: '', trim: true }
      }
    ],
    education: [
      {
        institution: { type: String, required: true, trim: true },
        degree: { type: String, default: '', trim: true },
        field: { type: String, default: '', trim: true },
        year: { type: Number, default: null }
      }
    ],
    certifications: [
      {
        name: { type: String, required: true, trim: true },
        issuer: { type: String, default: 'Not Specified', trim: true },
        date: { type: String, default: '', trim: true }
      }
    ],
    rawText: String,
    parsedAt: {
      type: Date,
      default: null
    }
  },
  resumeVersions: [{
    versionName: { type: String, required: true },
    template: { type: String, default: 'modern' },
    targetRole: String,
    content: {
      summary: String,
      experience: Array,
      education: Array,
      skills: Array,
      projects: Array
    },
    createdAt: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now }
  }],
  // Keep certification documents here as per User schema
  certifications: [
    {
      title: String,
      polishedTitle: String,
      issuer: String,
      issueYear: Number,
      issueDate: Date,
      verificationStatus: String,
      skills: [String],
      masteredSkills: [String],
      fileUrl: String,
      verificationMethod: String,
      useInResume: { type: Boolean, default: true },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Resume', resumeSchema);
