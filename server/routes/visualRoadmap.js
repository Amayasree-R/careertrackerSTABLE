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

    console.log('--- DEBUG: MASTERED SKILLS FIELDS ---');
    console.log('user.masteredSkills:', user.masteredSkills);
    console.log('user.profile?.completedSkills:', user.profile?.completedSkills);
    console.log('user.careerInfo?.masteredSkills:', user.careerInfo?.masteredSkills);
    console.log('-----------------------------------');

    // Temporarily force cache bypass
    await User.findByIdAndUpdate(userId, {
      $unset: { 'careerInfo.visualRoadmap': '' }
    });
    const user2 = await User.findById(userId); // re-fetch after clearing

    // 2. Prepare profile object for the service
    const profile = {
      masteredSkills: user2.masteredSkills || user2.profile?.completedSkills || user2.careerInfo?.masteredSkills || [],
      currentSkills: user2.profile?.currentSkills || [],
      skillsToAcquire: user2.careerInfo?.skillsToAcquire || [],
      targetJob: user2.careerInfo?.targetJobRole || user2.profile?.targetJob || 'Software Engineer',
      experienceLevel: user2.profile?.experienceLevel || 'Entry Level'
    };

    // 3. Force regeneration (pass null for cache)
    console.log('Calling generateVisualRoadmap with profile:', JSON.stringify(profile, null, 2))
    const visualRoadmap = await generateVisualRoadmap(profile, null);
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
