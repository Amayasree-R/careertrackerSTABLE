import express from 'express'
import jwt from 'jsonwebtoken'
import { generateQuiz } from '../services/quizGenerator.js'

const router = express.Router()

// Auth middleware (consistent with other routes)
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

// Generate Quiz for a specific skill
router.get('/:skill', authMiddleware, async (req, res) => {
    try {
        const { skill } = req.params
        console.log(`Received quiz request for: ${skill}`)

        if (!skill) {
            return res.status(400).json({ message: 'Skill parameter is required' })
        }

        const questions = await generateQuiz(skill)
        res.json({ questions })
    } catch (error) {
        console.error('Quiz route error:', error)
        res.status(500).json({ message: 'Failed to generate quiz' })
    }
})

export default router
