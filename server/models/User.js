import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  personalDetails: {
    dob: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    nationality: String,
    location: {
      city: String,
      state: String,
      country: String
    }
  },
  currentStatus: {
    type: String,
    enum: ['Student', 'Working Professional'],
    required: true
  },
  education: [{
    degree: String,
    specialization: String,
    college: String,
    startYear: String,
    endYear: String
  }],
  experience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    responsibilities: String
  }],
  socialLinks: {
    github: String,
    linkedin: String,
    portfolio: String
  },
  profile: {
    currentSkills: [String],
    targetJob: String,
    experienceLevel: String,
    completedSkills: [
      {
        skill: String,
        score: Number,
        masteredAt: { type: Date, default: Date.now },
        _id: false
      }
    ],
    learningSkills: {
      type: [String],
      default: []
    },
    focusSkill: {
      type: String,
      default: ''
    },
    roadmapCache: {
      type: Object,
      default: null
    },
    lastProfileUpdate: {
      type: Date,
      default: Date.now
    }
  },
  // Career data fields
  careerInfo: {
    roleType: {
      type: String,
      enum: ['student', 'employed', 'unemployed', null],
      default: null
    },
    collegeName: String,
    degree: String,
    graduationYear: Number,
    currentCompany: String,
    previousCompanies: [
      {
        companyName: String,
        role: String,
        duration: String,
        _id: false
      }
    ],
    yearsOfExperience: Number,
    primaryTechStack: [String],
    targetJobRole: String
  },
  // Uploaded resume file reference
  resumeFile: {
    filename: String,
    uploadedAt: {
      type: Date,
      default: null
    },
    filePath: String
  },
  // Parsed resume data
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
        techStack: { type: [String], default: [] },
        _id: false
      }
    ],
    experience: [
      {
        company: { type: String, default: 'Not Specified', trim: true },
        role: { type: String, required: true, trim: true },
        duration: { type: String, default: '', trim: true },
        description: { type: String, default: '', trim: true },
        _id: false
      }
    ],
    education: [
      {
        institution: { type: String, required: true, trim: true },
        degree: { type: String, default: '', trim: true },
        field: { type: String, default: '', trim: true },
        year: { type: Number, default: null },
        _id: false
      }
    ],
    certifications: [
      {
        name: { type: String, required: true, trim: true },
        issuer: { type: String, default: 'Not Specified', trim: true },
        date: { type: String, default: '', trim: true },
        _id: false
      }
    ],
    rawText: String,
    parsedAt: {
      type: Date,
      default: null
    }
  },
  // Skill gap analysis results
  skillAnalysis: {
    matchingSkills: [String],
    missingSkills: [String],
    suggestedSkills: [String],
    industryDemandSkills: [String],
    analysisDate: {
      type: Date,
      default: null
    }
  },
  certifications: [
    {
      title: String,
      issuer: String,
      issueYear: Number,
      issueDate: Date,
      verificationStatus: String,
      skills: [String],
      fileUrl: String,
      verificationMethod: String,
      useInResume: { type: Boolean, default: true },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
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
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('User', userSchema)