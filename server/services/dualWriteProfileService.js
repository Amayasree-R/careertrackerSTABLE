import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Skill from '../models/Skill.js';

export const getProfileData = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) return null;

  const newProfile = await Profile.findOne({ userId });
  const newSkill = await Skill.findOne({ userId });

  // Dual Read fallback logic
  const responseProfile = { ...(user.profile ? user.profile.toObject() : {}) };

  if (newProfile) {
    Object.assign(responseProfile, {
      personalDetails: newProfile.personalDetails,
      socialLinks: newProfile.socialLinks,
      targetJob: newProfile.targetJob,
      experienceLevel: newProfile.experienceLevel,
      jobMatchCache: newProfile.jobMatchCache,
      lastProfileUpdate: newProfile.lastProfileUpdate
    });
  }

  if (newSkill) {
    Object.assign(responseProfile, {
      currentSkills: newSkill.currentSkills,
      completedSkills: newSkill.completedSkills,
      learningSkills: newSkill.learningSkills,
      focusSkill: newSkill.focusSkill
    });
  }

  return {
    user,
    profile: {
      ...responseProfile,
      certifications: user.certifications || []
    }
  };
};

export const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const { currentSkills, targetJob, experienceLevel, masteredSkills } = data;

  // Track if roadmap-critical fields changed
  const importantFieldsChanged =
    (currentSkills && JSON.stringify(currentSkills) !== JSON.stringify(user.profile.currentSkills)) ||
    (targetJob && targetJob !== user.profile.targetJob) ||
    (experienceLevel && experienceLevel !== user.profile.experienceLevel) ||
    (masteredSkills && masteredSkills.length > 0);

  if (importantFieldsChanged) {
    user.profile.lastProfileUpdate = new Date();
  }

  if (currentSkills) user.profile.currentSkills = currentSkills;
  if (targetJob) {
    user.profile.targetJob = targetJob;
    if (user.careerInfo) {
      user.careerInfo.targetJobRole = targetJob;
      user.careerInfo.roadmapCache = undefined;
      user.careerInfo.visualRoadmap = undefined;
    }
  }
  if (experienceLevel) user.profile.experienceLevel = experienceLevel;

  // 0. Process explicit masteredSkills strictly
  if (masteredSkills && Array.isArray(masteredSkills)) {
    if (!user.profile.completedSkills) user.profile.completedSkills = [];
    const existingCompleted = new Set(user.profile.completedSkills.map(s => s.skill));
    masteredSkills.forEach(skill => {
      if (!existingCompleted.has(skill)) {
        user.profile.completedSkills.push({ skill, score: 90, masteredAt: new Date() });
        existingCompleted.add(skill);
      }
    });
  }

  // 1. Robust normalization of completedSkills
  if (user.profile.completedSkills) {
    user.profile.completedSkills = user.profile.completedSkills.map(s => {
      if (typeof s === 'string') return { skill: s, score: 0, masteredAt: new Date() };
      if (s && typeof s === 'object' && s.skill) return s;
      return null;
    }).filter(Boolean);
  } else {
    user.profile.completedSkills = [];
  }

  // 2. Add current skills to completed skills (if not already there)
  if (user.profile.currentSkills && user.profile.currentSkills.length > 0) {
    const existingCompleted = new Set(user.profile.completedSkills.map(s => s.skill));
    user.profile.currentSkills.forEach(skill => {
      if (skill && !existingCompleted.has(skill)) {
        user.profile.completedSkills.push({ skill, score: 0, masteredAt: new Date() });
        existingCompleted.add(skill);
      }
    });
  }

  // legacy save
  await user.save();

  // Dual Write to New Collections
  await Profile.findOneAndUpdate(
    { userId },
    {
      targetJob: user.profile.targetJob,
      experienceLevel: user.profile.experienceLevel,
      lastProfileUpdate: user.profile.lastProfileUpdate
    },
    { upsert: true }
  );

  await Skill.findOneAndUpdate(
    { userId },
    {
      currentSkills: user.profile.currentSkills,
      completedSkills: user.profile.completedSkills
    },
    { upsert: true }
  );

  return getProfileData(userId);
};

export const toggleSkill = async (userId, data) => {
  const { skill, score = 90, forceMaster = false } = data;
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const masteredIndex = user.profile.completedSkills.findIndex(s => s.skill === skill);
  const isMastered = masteredIndex !== -1;
  const isLearning = user.profile.learningSkills.includes(skill);

  if (forceMaster) {
    if (!isMastered) {
      if (isLearning) {
        user.profile.learningSkills = user.profile.learningSkills.filter(s => s !== skill);
      }
      user.profile.completedSkills.push({ skill, score, masteredAt: new Date() });
    } else {
      user.profile.completedSkills[masteredIndex].score = score;
      user.profile.completedSkills[masteredIndex].masteredAt = new Date();
    }
  } else {
    if (isMastered) {
      user.profile.completedSkills = user.profile.completedSkills.filter(s => s.skill !== skill);
    } else if (isLearning) {
      user.profile.learningSkills = user.profile.learningSkills.filter(s => s !== skill);
      user.profile.completedSkills.push({ skill, score, masteredAt: new Date() });
    } else {
      user.profile.learningSkills.push(skill);
    }
  }

  await user.save(); // legacy

  // Dual Write to New Collection
  await Skill.findOneAndUpdate(
    { userId },
    {
      completedSkills: user.profile.completedSkills,
      learningSkills: user.profile.learningSkills
    },
    { upsert: true }
  );

  return {
    completedSkills: user.profile.completedSkills,
    learningSkills: user.profile.learningSkills
  };
};

export const setFocusSkill = async (userId, skill) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.profile.focusSkill = user.profile.focusSkill === skill ? '' : skill;
  await user.save(); // legacy

  // Dual Write to New Collection
  await Skill.findOneAndUpdate(
    { userId },
    { focusSkill: user.profile.focusSkill },
    { upsert: true }
  );

  return { focusSkill: user.profile.focusSkill };
};
