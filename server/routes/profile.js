import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { getProfileData, updateProfile, toggleSkill, setFocusSkill } from '../services/dualWriteProfileService.js'

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
    const result = await updateProfile(req.userId, req.body)
    res.json(result)
  } catch (error) {
    console.error('Profile Update POST Error:', error)
    res.status(500).json({ message: 'Server error: ' + error.message })
  }
})

// Get complete profile data with legacy certificate migration
router.get('/', authMiddleware, async (req, res) => {
  try {
    const data = await getProfileData(req.userId)
    if (!data) return res.status(404).json({ message: 'User not found' })

    res.json(data)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update skill status (3-state: to-learn -> learning -> mastered -> to-learn)
router.post('/toggle-skill', authMiddleware, async (req, res) => {
  try {
    const result = await toggleSkill(req.userId, req.body)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message })
  }
})

// Set focus skill
router.post('/focus-skill', authMiddleware, async (req, res) => {
  try {
    const { skill } = req.body
    const result = await setFocusSkill(req.userId, skill)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message })
  }
})

export default router