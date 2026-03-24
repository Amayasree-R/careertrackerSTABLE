import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Education from '../models/Education.js';
import Experience from '../models/Experience.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import Career from '../models/Career.js';
import SkillAnalysis from '../models/SkillAnalysis.js';
import Roadmap from '../models/Roadmap.js';
import Resume from '../models/Resume.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const LOG_FILE = path.join(process.cwd(), 'validation_log.txt');
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ${msg}\n`);
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    log('MongoDB connected for validation.');
  } catch (error) {
    log(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const validateMigration = async () => {
  log('--- Starting Data Validation ---');
  let mismatchCount = 0;
  let validatedCount = 0;

  try {
    const users = await User.find({});
    log(`Found ${users.length} users to validate.`);

    for (const user of users) {
      log(`Validating user: ${user._id}`);
      
      const newProfile = await Profile.findOne({ userId: user._id });
      const newSkill = await Skill.findOne({ userId: user._id });
      const newCareer = await Career.findOne({ userId: user._id });

      let userMismatches = [];

      // Basic profile validation
      if (user.profile && newProfile) {
        if (user.profile.targetJob !== newProfile.targetJob) userMismatches.push('Profile.targetJob mismatch');
        if (user.profile.experienceLevel !== newProfile.experienceLevel) userMismatches.push('Profile.experienceLevel mismatch');
      } else if (user.profile && !newProfile && Object.keys(user.profile.toObject() || {}).length > 2) {
        // user.profile exists but newProfile doesn't
        userMismatches.push('Missing Profile Document');
      }

      // Skill validation
      if (user.profile && newSkill) {
        if (user.profile.currentSkills?.length !== newSkill.currentSkills?.length) {
          userMismatches.push('Skill.currentSkills length mismatch');
        }
        if (user.profile.completedSkills?.length !== newSkill.completedSkills?.length) {
          userMismatches.push('Skill.completedSkills length mismatch');
        }
      }

      // Arrays count validation
      if (user.education && user.education.length > 0) {
        const edCount = await Education.countDocuments({ userId: user._id });
        if (edCount !== user.education.length) userMismatches.push('Education count mismatch');
      }

      if (user.experience && user.experience.length > 0) {
        const expCount = await Experience.countDocuments({ userId: user._id });
        if (expCount !== user.experience.length) userMismatches.push('Experience count mismatch');
      }

      if (user.projects && user.projects.length > 0) {
        const projCount = await Project.countDocuments({ userId: user._id });
        if (projCount !== user.projects.length) userMismatches.push('Project count mismatch');
      }

      if (userMismatches.length > 0) {
        mismatchCount++;
        log(`Mismatches for user ${user._id}: ${userMismatches.join(', ')}`);
      } else {
        validatedCount++;
      }
    }

    log(`Validation Completed. Validated: ${validatedCount}, Mismatches: ${mismatchCount}`);
  } catch (error) {
    log(`Critical Validation Error: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    log('MongoDB disconnected.');
  }
};

const run = async () => {
  await connectDB();
  await validateMigration();
};

run();
