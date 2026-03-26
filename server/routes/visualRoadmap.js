import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { generateVisualRoadmap } from '../services/visualRoadmapService.js';

const router = express.Router();

/**
 * @route   GET /api/visual-roadmap
 * @desc    Get tiered visual roadmap for the authenticated user
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  console.log('Visual roadmap route hit, user:', req.user)
  try {
    const userId = req.user._id || req.user.id;

    // 1. Fetch user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User profile data:', JSON.stringify(user.profile, null, 2))
    console.log('User careerInfo:', JSON.stringify(user.careerInfo, null, 2))

    // 2. Prepare profile object for the service
    const profile = {
      completedSkills: user.profile.completedSkills || [],
      currentSkills: user.profile.currentSkills || [],
      targetJob: user.careerInfo?.targetJobRole || user.profile?.targetJob || 'Software Engineer',
      experienceLevel: user.profile.experienceLevel || 'Entry Level'
    };

    // 3. Pass cached roadmap (if any) — service only updates mastery, never regenerates
    const existingCache = user.careerInfo?.visualRoadmap
      ? (user.careerInfo.visualRoadmap.toObject
          ? user.careerInfo.visualRoadmap.toObject()
          : user.careerInfo.visualRoadmap)
      : null;

    console.log('Calling generateVisualRoadmap with profile:', JSON.stringify(profile, null, 2))
    const visualRoadmap = await generateVisualRoadmap(profile, existingCache);
    console.log('Visual roadmap ready, tiers:', visualRoadmap?.tiers?.length)

    // 4. Persist updated roadmap to MongoDB
    if (!user.careerInfo) {
      user.careerInfo = {};
    }
    user.careerInfo.visualRoadmap = visualRoadmap;
    await user.save();

    res.json({ ...visualRoadmap, targetJob: profile.targetJob });

  } catch (error) {
    console.error('Visual Roadmap Route Error FULL:', error.message, error.stack)
    res.status(500).json({ 
      message: 'Failed to generate visual roadmap', 
      error: error.message 
    });
  }
});

export default router;
