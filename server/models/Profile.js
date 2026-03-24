import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
  socialLinks: {
    github: String,
    linkedin: String,
    portfolio: String
  },
  targetJob: String,
  experienceLevel: String,
  jobMatchCache: {
    data: { type: Array, default: [] },
    generatedAt: { type: Date }
  },
  lastProfileUpdate: {
    type: Date,
    default: Date.now
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

export default mongoose.model('Profile', profileSchema);
