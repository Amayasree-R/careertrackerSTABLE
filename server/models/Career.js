import mongoose from 'mongoose';

const careerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
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
      duration: String
    }
  ],
  yearsOfExperience: Number,
  primaryTechStack: [String],
  targetJobRole: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Career', careerSchema);
