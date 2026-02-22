import express from 'express'
import multer from 'multer'
import authMiddleware from '../middleware/authMiddleware.js'
import { analyzeReadme } from '../services/cerebrasService.js'
import User from '../models/User.js'

const router = express.Router()

// Multer — memory storage, accept .md and .txt files only, max 2MB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = ['text/plain', 'text/markdown', 'text/x-markdown']
        const ext = file.originalname.toLowerCase()
        if (allowed.includes(file.mimetype) || ext.endsWith('.md') || ext.endsWith('.txt')) {
            cb(null, true)
        } else {
            cb(new Error('Only .md and .txt files are allowed'))
        }
    }
})

// ─────────────────────────────────────────────────────────────
// POST /api/projects/analyze
// Accepts: multipart file (field: "readme") OR JSON { readmeText }
// Returns: { analysis }
// ─────────────────────────────────────────────────────────────
router.post('/analyze', authMiddleware, (req, res, next) => {
    // Try multer first; fall through gracefully if no file is provided
    upload.single('readme')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `File upload error: ${err.message}` })
        }
        if (err) {
            return res.status(400).json({ error: err.message })
        }
        next()
    })
}, async (req, res) => {
    try {
        let text = ''

        if (req.file) {
            // File upload path — decode buffer to UTF-8 string
            text = req.file.buffer.toString('utf-8')
        } else if (req.body?.readmeText) {
            // JSON body path
            text = req.body.readmeText
        } else {
            return res.status(400).json({
                error: 'Provide either a file upload (field: "readme") or a JSON body with { readmeText }'
            })
        }

        if (text.trim().length < 10) {
            return res.status(400).json({ error: 'README text is too short to analyze' })
        }

        const analysis = await analyzeReadme(text)

        return res.status(200).json({ analysis })
    } catch (error) {
        console.error('POST /api/projects/analyze error:', error.message)
        return res.status(500).json({ error: error.message || 'Failed to analyze README' })
    }
})

// ─────────────────────────────────────────────────────────────
// POST /api/projects/save
// Accepts: { analysis, readmeRaw }
// Saves project, auto-promotes extracted skills to completedSkills
// Returns: { success: true, updatedSkills }
// ─────────────────────────────────────────────────────────────
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { analysis, readmeRaw } = req.body

        if (!analysis || typeof analysis !== 'object') {
            return res.status(400).json({ error: 'analysis object is required in request body' })
        }

        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const {
            projectName = '',
            summary = '',
            techStack = [],
            keyFeatures = [],
            skillsExtracted = []
        } = analysis

        // 1. Push the project entry
        user.projects.push({
            projectName,
            summary,
            techStack: Array.isArray(techStack) ? techStack : [],
            keyFeatures: Array.isArray(keyFeatures) ? keyFeatures : [],
            skillsExtracted: Array.isArray(skillsExtracted) ? skillsExtracted : [],
            readmeRaw: readmeRaw || '',
            createdAt: new Date()
        })

        // 2. Skill promotion — for each skill in skillsExtracted:
        const skills = Array.isArray(skillsExtracted) ? skillsExtracted : []
        const now = new Date()

        // Ensure nested arrays are initialized
        if (!user.profile) user.profile = {}
        if (!Array.isArray(user.profile.completedSkills)) user.profile.completedSkills = []
        if (!Array.isArray(user.profile.learningSkills)) user.profile.learningSkills = []
        if (!user.resumeData) user.resumeData = {}
        if (!Array.isArray(user.resumeData.skills)) user.resumeData.skills = []

        const completedSkillNames = user.profile.completedSkills.map(s =>
            (s.skill || '').toLowerCase()
        )

        for (const skill of skills) {
            if (!skill || typeof skill !== 'string') continue

            const skillLower = skill.toLowerCase()

            // Add to completedSkills if not already mastered
            if (!completedSkillNames.includes(skillLower)) {
                user.profile.completedSkills.push({
                    skill,
                    score: 100,
                    masteredAt: now
                })
                completedSkillNames.push(skillLower) // Keep local list in sync
            }

            // Remove from learningSkills if present
            user.profile.learningSkills = user.profile.learningSkills.filter(
                s => s.toLowerCase() !== skillLower
            )

            // Add to resumeData.skills if not already present
            const alreadyInResume = user.resumeData.skills.some(
                s => s.toLowerCase() === skillLower
            )
            if (!alreadyInResume) {
                user.resumeData.skills.push(skill)
            }
        }

        await user.save()

        return res.status(200).json({
            success: true,
            updatedSkills: skillsExtracted
        })
    } catch (error) {
        console.error('POST /api/projects/save error:', error.message)
        return res.status(500).json({ error: error.message || 'Failed to save project' })
    }
})

// ─────────────────────────────────────────────────────────────
// GET /api/projects
// Returns user.projects[] sorted by createdAt descending
// ─────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('projects')
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const sorted = [...(user.projects || [])].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )

        return res.status(200).json({ projects: sorted })
    } catch (error) {
        console.error('GET /api/projects error:', error.message)
        return res.status(500).json({ error: error.message || 'Failed to fetch projects' })
    }
})

// ─────────────────────────────────────────────────────────────
// DELETE /api/projects/:projectId
// Removes a project by its _id subdocument
// Returns: { success: true }
// ─────────────────────────────────────────────────────────────
router.delete('/:projectId', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params

        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const originalLength = user.projects.length
        user.projects = user.projects.filter(
            p => p._id.toString() !== projectId
        )

        if (user.projects.length === originalLength) {
            return res.status(404).json({ error: 'Project not found' })
        }

        await user.save()

        return res.status(200).json({ success: true })
    } catch (error) {
        console.error('DELETE /api/projects/:projectId error:', error.message)
        return res.status(500).json({ error: error.message || 'Failed to delete project' })
    }
})

export default router
