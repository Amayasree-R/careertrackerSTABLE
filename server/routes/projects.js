import express from 'express'
import multer from 'multer'
import authMiddleware from '../middleware/authMiddleware.js'
import { analyzeReadme } from '../services/cerebrasService.js'
import { processProjectSkills } from '../services/projectSkillIntegrationService.js'
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
        const newProject = {
            projectName,
            summary,
            techStack: Array.isArray(techStack) ? techStack : [],
            keyFeatures: Array.isArray(keyFeatures) ? keyFeatures : [],
            skillsExtracted: Array.isArray(skillsExtracted) ? skillsExtracted : [],
            readmeRaw: readmeRaw || '',
            createdAt: new Date()
        }
        user.projects.push(newProject)

        // 2. Smart Skill Integration
        // This service may call user.save() internally if skills are promoted
        const integrationResult = await processProjectSkills(user, analysis.skillsExtracted || [])

        // 3. Final save to ensure project itself is persisted even if no skills were promoted
        await user.save()

        // Get the saved project (with _id)
        const savedProject = user.projects[user.projects.length - 1]

        return res.status(200).json({
            success: true,
            project: savedProject,
            updatedSkills: integrationResult.promoted,
            integrationSummary: integrationResult
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

        const projectIndex = user.projects.findIndex(
            p => p._id.toString() === projectId
        )

        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' })
        }

        const projectToDelete = user.projects[projectIndex]
        const skillsToRemove = projectToDelete.skillsExtracted || []

        // Import normalization utility
        const { normalizeSkill } = await import('../utils/skillNormalizer.js')

        // Identify skills still covered by OTHER projects
        const otherProjects = user.projects.filter((_, idx) => idx !== projectIndex)
        const stillInProjects = new Set()
        otherProjects.forEach(p => {
            (p.skillsExtracted || []).forEach(s => stillInProjects.add(normalizeSkill(s)))
        })

        // Identify skills covered by ALL certificates
        const stillInCerts = new Set()
        user.certifications.forEach(c => {
            (c.skills || []).forEach(s => stillInCerts.add(normalizeSkill(s)));
            (c.masteredSkills || []).forEach(s => stillInCerts.add(normalizeSkill(s)));
        });

        // Determine which skills were ONLY in this project
        const skillsToActuallyRemove = skillsToRemove.filter(skill => {
            const norm = normalizeSkill(skill)
            return !stillInProjects.has(norm) && !stillInCerts.has(norm)
        })

        console.log(`[Project Delete] Skills to remove from profile:`, skillsToActuallyRemove)

        // Remove from user's completedSkills
        if (skillsToActuallyRemove.length > 0) {
            const initialCount = user.profile.completedSkills.length;
            user.profile.completedSkills = user.profile.completedSkills.filter(s => 
                !skillsToActuallyRemove.some(r => normalizeSkill(r) === normalizeSkill(s.skill))
            );
            user.profile.roadmapCache = null; // Clear cache to reflect change
            console.log(`[Project Delete] Removed ${initialCount - user.profile.completedSkills.length} skills from completedSkills`);
        }

        // Delete project
        user.projects.splice(projectIndex, 1)

        await user.save()

        return res.status(200).json({ 
            success: true,
            message: 'Project deleted',
            removedSkills: skillsToActuallyRemove
        })
    } catch (error) {
        console.error('DELETE /api/projects/:projectId error:', error.message)
        return res.status(500).json({ error: error.message || 'Failed to delete project' })
    }
})

export default router
