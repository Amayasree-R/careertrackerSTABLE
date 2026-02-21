import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' })
  }
}

// Save/Update profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { currentSkills, targetJob, experienceLevel } = req.body

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Track if roadmap-critical fields changed
    const importantFieldsChanged =
      (currentSkills && JSON.stringify(currentSkills) !== JSON.stringify(user.profile.currentSkills)) ||
      (targetJob && targetJob !== user.profile.targetJob) ||
      (experienceLevel && experienceLevel !== user.profile.experienceLevel)

    if (importantFieldsChanged) {
      user.profile.lastProfileUpdate = new Date()
    }

    user.profile.currentSkills = currentSkills || user.profile.currentSkills
    user.profile.targetJob = targetJob || user.profile.targetJob
    user.profile.experienceLevel = experienceLevel || user.profile.experienceLevel

    // 1. Robust normalization of completedSkills (handles legacy string data)
    if (user.profile.completedSkills) {
      user.profile.completedSkills = user.profile.completedSkills.map(s => {
        if (typeof s === 'string') return { skill: s, score: 0, masteredAt: new Date() }
        if (s && typeof s === 'object' && s.skill) return s
        return null
      }).filter(Boolean)
    } else {
      user.profile.completedSkills = []
    }

    // 2. Add current skills to completed skills (if not already there)
    // This ensures that "Mastered" count immediately reflects the user's input skills
    if (user.profile.currentSkills && user.profile.currentSkills.length > 0) {
      const existingCompleted = new Set(user.profile.completedSkills.map(s => s.skill))

      user.profile.currentSkills.forEach(skill => {
        if (skill && !existingCompleted.has(skill)) {
          user.profile.completedSkills.push({ skill, score: 0, masteredAt: new Date() })
          existingCompleted.add(skill)
        }
      })
    }

    await user.save()
    res.json({ profile: { ...user.profile, _id: user._id } })
  } catch (error) {
    console.error('Profile Update POST Error:', error)
    res.status(500).json({ message: 'Server error: ' + error.message })
  }
})

// Get complete profile data
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Return both full user and profile subdocument for layout/page compatibility
    res.json({
      user: user,
      profile: user.profile
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update skill status (3-state: to-learn -> learning -> mastered -> to-learn)
router.post('/toggle-skill', authMiddleware, async (req, res) => {
  try {
    const { skill, score = 90, forceMaster = false } = req.body // Allow passing score and forceMaster flag
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const masteredIndex = user.profile.completedSkills.findIndex(s => s.skill === skill)
    const isMastered = masteredIndex !== -1
    const isLearning = user.profile.learningSkills.includes(skill)

    if (forceMaster) {
      // Explicitly set to Mastered (from Quiz)
      if (!isMastered) {
        // Remove from learning if present
        if (isLearning) {
          user.profile.learningSkills = user.profile.learningSkills.filter(s => s !== skill)
        }
        // Add to completed
        user.profile.completedSkills.push({ skill, score, masteredAt: new Date() })
      } else {
        // Update score if already mastered
        user.profile.completedSkills[masteredIndex].score = score
        user.profile.completedSkills[masteredIndex].masteredAt = new Date()
      }
    } else {
      // Standard Toggle Behavior
      if (isMastered) {
        // mastered -> to-learn (remove from both)
        user.profile.completedSkills = user.profile.completedSkills.filter(s => s.skill !== skill)
      } else if (isLearning) {
        // learning -> mastered (move from learning to completed)
        user.profile.learningSkills = user.profile.learningSkills.filter(s => s !== skill)
        user.profile.completedSkills.push({ skill, score, masteredAt: new Date() })
      } else {
        // to-learn -> learning (add to learning)
        user.profile.learningSkills.push(skill)
      }
    }

    await user.save()
    res.json({
      completedSkills: user.profile.completedSkills,
      learningSkills: user.profile.learningSkills
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Set focus skill
router.post('/focus-skill', authMiddleware, async (req, res) => {
  try {
    const { skill } = req.body
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // If same skill clicked again, unset it (toggle behavior)
    user.profile.focusSkill = user.profile.focusSkill === skill ? '' : skill

    await user.save()
    res.json({ focusSkill: user.profile.focusSkill })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router