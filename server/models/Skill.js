import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentSkills: {
    type: [String],
    default: []
  },
  completedSkills: [
    {
      skill: String,
      score: Number,
      masteredAt: { type: Date, default: Date.now }
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Skill', skillSchema);
