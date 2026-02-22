import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import User from '../models/User.js'
import Certificate from '../models/Certificate.js'
import * as extractorService from '../services/certificateExtractorService.js'
import * as aiService from '../services/certificateAIService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_DIR = path.join(__dirname, '../../uploads/certificates')

// Ensure upload directory exists
try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
} catch (err) {
    console.error('Failed to create cert upload directory:', err)
}

/**
 * GET all certificates for the requesting user.
 */
export const getCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: req.user._id }).sort({ uploadedAt: -1 })
        res.json(certificates)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * UPLOAD and process a new certificate.
 */
export const uploadCertificate = async (req, res) => {
    try {
        const user = req.user
        const file = req.file

        if (!user || !file) {
            return res.status(400).json({ error: 'User context or file missing' })
        }

        const filename = `${user._id}-cert-${Date.now()}.pdf`
        const filePath = path.join(UPLOAD_DIR, filename)
        await fs.writeFile(filePath, file.buffer)

        // 1. Extract Text (Primary + Fallback handled in service)
        let extractionResult
        try {
            extractionResult = await extractorService.extractTextFromPdf(filePath)
        } catch (extractError) {
            console.error('Extraction Failure:', extractError)
            return res.status(422).json({
                error: 'Could not extract text from this PDF. Please ensure it is a valid document and not just an image-only scan.',
                details: extractError.message
            })
        }

        const { text } = extractionResult

        // 2. Process with AI
        const aiData = await aiService.processCertificateText(text)

        // 3. Roadmap Matching Logic
        const userNode = await User.findById(user._id)
        let roadmapUpdated = false
        let matchedRoadmapSkill = null

        // Get roadmap skills from cache if available
        const roadmapSkills = userNode.profile?.roadmapCache?.data?.missingSkills || []

        if (roadmapSkills.length > 0) {
            const matchResult = await aiService.findClosestRoadmapMatch(aiData.skillName, roadmapSkills)

            // Only accept match if confidence >= 75
            if (matchResult && matchResult.matchedSkill && matchResult.confidence >= 75) {
                matchedRoadmapSkill = matchResult.matchedSkill

                // Update User Profile Skill Status
                const isAlreadyMastered = userNode.profile.completedSkills.some(s => s.skill === matchedRoadmapSkill)

                if (!isAlreadyMastered) {
                    userNode.profile.completedSkills.push({
                        skill: matchedRoadmapSkill,
                        score: 100, // Direct mastery via cert
                        masteredAt: new Date(),
                        verificationMethod: 'certificate'
                    })
                    // Remove from learning if present
                    userNode.profile.learningSkills = userNode.profile.learningSkills.filter(s => s !== matchedRoadmapSkill)
                    await userNode.save()
                    roadmapUpdated = true
                }
            } else {
                console.log(`[Certificate Process] Match ignored due to low confidence (${matchResult?.confidence || 0}) or no match.`)
                matchedRoadmapSkill = null
                roadmapUpdated = false
            }
        }

        // 4. Save to MongoDB
        const fileUrl = `http://localhost:5000/certificates/${filename}`
        const certificate = new Certificate({
            userId: user._id,
            skillName: aiData.skillName || 'Unknown Skill',
            issuerName: aiData.issuerName || 'Unknown Issuer',
            issueDate: aiData.issueDate ? new Date(aiData.issueDate) : new Date(),
            expiryDate: aiData.expiryDate ? new Date(aiData.expiryDate) : null,
            certificateUrl: fileUrl,
            extractedText: text,
            matchedRoadmapSkill, // Save the matching roadmap skill
            confidenceScore: aiData.confidenceScore || 0,
            includeInResume: false,
            verificationMethod: 'certificate',
            uploadedAt: new Date()
        })

        await certificate.save()

        res.json({
            message: 'Certificate processed successfully',
            certificate,
            roadmapUpdated,
            matchedSkill: matchedRoadmapSkill
        })

    } catch (error) {
        console.error('Upload Process Error:', error)
        res.status(500).json({ error: error.message })
    }
}

/**
 * TOGGLE certificate inclusion in resume.
 */
export const toggleCertificateResume = async (req, res) => {
    try {
        const { certificateId } = req.params
        const certificate = await Certificate.findOne({ _id: certificateId, userId: req.user._id })

        if (!certificate) {
            return res.status(404).json({ error: 'Certificate not found or unauthorized' })
        }

        certificate.includeInResume = !certificate.includeInResume
        await certificate.save()

        res.json({ message: 'Visibility toggled', includeInResume: certificate.includeInResume })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE certificate and revert skill status.
 */
export const deleteCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params
        const certificate = await Certificate.findOne({ _id: certificateId, userId: req.user._id })

        if (!certificate) {
            return res.status(404).json({ error: 'Certificate not found' })
        }

        // 1. Revert skill status if applicable
        const user = await User.findById(req.user._id)
        const skillToRevert = certificate.matchedRoadmapSkill || certificate.skillName

        // Find if this specific skill was marked mastered via 'certificate'
        const skillIndex = user.profile.completedSkills.findIndex(
            s => s.skill === skillToRevert && s.verificationMethod === 'certificate'
        )

        if (skillIndex !== -1) {
            const skillName = user.profile.completedSkills[skillIndex].skill
            user.profile.completedSkills.splice(skillIndex, 1)
            // Add back to learning
            if (!user.profile.learningSkills.includes(skillName)) {
                user.profile.learningSkills.push(skillName)
            }
            await user.save()
        }

        // 2. Delete file from disk
        const filename = certificate.certificateUrl.split('/').pop()
        const filePath = path.join(UPLOAD_DIR, filename)
        try {
            await fs.unlink(filePath)
        } catch (err) {
            console.warn('File deletion failed (may already be gone):', err.message)
        }

        // 3. Delete from DB
        await Certificate.findByIdAndDelete(certificateId)

        res.json({ message: 'Certificate deleted and roadmap reverted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
