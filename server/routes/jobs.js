import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { getMatchedJobs } from '../services/jobMatchingService.js';

const router = express.Router();

const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

// GET /api/jobs/matches
// Protected — returns job matches scored against the user's current skills & target job
router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const targetJob =
      user.careerInfo?.targetJobRole?.trim() ||
      user.profile?.targetJob?.trim() ||
      'software developer';

    console.log('[GET /api/jobs/matches] Resolved targetJob:', targetJob);

    const userSkills = [...new Set([
      ...(user.profile?.completedSkills || []).map(s => s.skill),
      ...(user.profile?.currentSkills || []),
    ])];

    console.log('[GET /api/jobs/matches] Resolved userSkills:', userSkills);

    const forceRefresh = req.query.refresh === 'true';

    // Return cached results if fresh and refresh not requested
    if (!forceRefresh && user.profile?.jobMatchCache?.generatedAt) {
      const age = Date.now() - new Date(user.profile.jobMatchCache.generatedAt).getTime();
      if (age < CACHE_TTL_MS && Array.isArray(user.profile.jobMatchCache.data)) {
        return res.json({
          source: 'cache',
          generatedAt: user.profile.jobMatchCache.generatedAt,
          results: user.profile.jobMatchCache.data,
        });
      }
    }

    // Fetch and score fresh results
    const results = await getMatchedJobs({
      targetJob,
      userSkills,
    });

    // Persist to cache
    user.profile.jobMatchCache = {
      data: results,
      generatedAt: new Date(),
    };
    await user.save();

    return res.json({
      source: 'live',
      generatedAt: user.profile.jobMatchCache.generatedAt,
      results,
    });
  } catch (err) {
    console.error('[GET /api/jobs/matches]', err.message);
    return res.status(500).json({ error: err.message || 'Failed to fetch job matches.' });
  }
});

export default router;
