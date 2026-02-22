import mongoose from 'mongoose'

const certificateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skillName: {
        type: String,
        required: true,
        trim: true
    },
    issuerName: {
        type: String,
        required: true,
        trim: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date
    },
    certificateUrl: {
        type: String,
        required: true
    },
    extractedText: {
        type: String
    },
    matchedRoadmapSkill: {
        type: String,
        default: null
    },
    confidenceScore: {
        type: Number,
        default: 0
    },
    includeInResume: {
        type: Boolean,
        default: false
    },
    verificationMethod: {
        type: String,
        default: 'certificate'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
})

const Certificate = mongoose.model('Certificate', certificateSchema)

export default Certificate
