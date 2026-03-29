import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { generateRoadmap } from '../services/roadmapGenerator.js'

const router = express.Router()

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ message: 'No token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Generate or fetch cached roadmap
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user.profile || !user.profile.targetJob || user.profile.targetJob.trim() === '') {
      console.log('Roadmap skip: Profile incomplete or no target job');
      return res.status(400).json({ message: 'Profile not complete' })
    }

    let { roadmapCache, lastProfileUpdate } = user.profile

    const hasDuplicates = (() => {
      const names = (roadmapCache?.data?.learningPath || [])
        .map(s => s.skill?.toLowerCase().replace(/[^a-z0-9]/g, ''))
      return names.length !== new Set(names).size
    })()

    if (hasDuplicates) {
      console.log('⚡ Invalidating roadmap cache due to duplicates...');
      roadmapCache = undefined;
      user.profile.roadmapCache = undefined;
      await user.save();
    }

    // Check if valid cache exists
    if (roadmapCache && roadmapCache.data && roadmapCache.generatedAt) {
      const cacheTime = new Date(roadmapCache.generatedAt).getTime()
      const updateTime = new Date(lastProfileUpdate || 0).getTime()

      if (cacheTime > updateTime) {
        console.log('✓ Returning cached roadmap')
        if (roadmapCache.data.learningPath) {
          const seen = new Set()
          roadmapCache.data.learningPath = roadmapCache.data.learningPath.filter(item => {
            const key = item.skill?.toLowerCase().replace(/[^a-z0-9]/g, '')
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
        }
        return res.json(roadmapCache.data)
      }
    }

    console.log('⚡ Generating fresh roadmap...')
    const roadmapData = await generateRoadmap(user.profile)

    // Update cache
    user.profile.roadmapCache = {
      data: roadmapData,
      generatedAt: new Date()
    }
    await user.save()

    res.json(roadmapData)
  } catch (error) {
    console.error('Roadmap Route Error:', error)
    res.status(500).json({ message: 'Failed to generate roadmap: ' + error.message })
  }
})

export default router