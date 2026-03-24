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

const LOG_FILE = path.join(process.cwd(), 'migration_log.txt');
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ${msg}\n`);
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log('MongoDB connected for migration.');
  } catch (error) {
    log(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const migrateUsers = async () => {
  log('--- Starting User Data Migration ---');
  let migratedCount = 0;
  let errorCount = 0;

  try {
    const users = await User.find({});
    log(`Found ${users.length} users to migrate.`);

    for (const user of users) {
      try {
        log(`Processing user: ${user._id} (${user.email})`);

        // 1. Profile
        if (user.personalDetails || user.socialLinks || user.profile) {
          await Profile.findOneAndUpdate(
            { userId: user._id },
            {
              userId: user._id,
              personalDetails: user.personalDetails || {},
              socialLinks: user.socialLinks || {},
              targetJob: user.profile?.targetJob || '',
              experienceLevel: user.profile?.experienceLevel || '',
              jobMatchCache: user.profile?.jobMatchCache || { data: [] },
              lastProfileUpdate: user.profile?.lastProfileUpdate || Date.now()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }

        // 2. Education (Array 1-to-many)
        if (user.education && user.education.length > 0) {
          // Clear existing for idempotency to avoid duplicates if re-run
          await Education.deleteMany({ userId: user._id });
          const edDocs = user.education.map(ed => ({
            userId: user._id,
            degree: ed.degree,
            specialization: ed.specialization,
            college: ed.college,
            startYear: ed.startYear,
            endYear: ed.endYear
          }));
          await Education.insertMany(edDocs);
        }

        // 3. Experience (Array 1-to-many)
        if (user.experience && user.experience.length > 0) {
          await Experience.deleteMany({ userId: user._id });
          const expDocs = user.experience.map(exp => ({
            userId: user._id,
            company: exp.company,
            role: exp.role,
            startDate: exp.startDate,
            endDate: exp.endDate,
            responsibilities: exp.responsibilities
          }));
          await Experience.insertMany(expDocs);
        }

        // 4. Skill
        if (user.profile) {
          await Skill.findOneAndUpdate(
            { userId: user._id },
            {
              userId: user._id,
              currentSkills: user.profile.currentSkills || [],
              completedSkills: user.profile.completedSkills || [],
              learningSkills: user.profile.learningSkills || [],
              focusSkill: user.profile.focusSkill || ''
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }

        // 5. Project (Array 1-to-many)
        if (user.projects && user.projects.length > 0) {
          await Project.deleteMany({ userId: user._id });
          const projDocs = user.projects.map(proj => ({
            userId: user._id,
            projectName: proj.projectName,
            summary: proj.summary,
            techStack: proj.techStack,
            keyFeatures: proj.keyFeatures,
            skillsExtracted: proj.skillsExtracted,
            readmeRaw: proj.readmeRaw,
            createdAt: proj.createdAt || Date.now()
          }));
          await Project.insertMany(projDocs);
        }

        // 6. Career
        if (user.careerInfo) {
          await Career.findOneAndUpdate(
            { userId: user._id },
            {
              userId: user._id,
              roleType: user.careerInfo.roleType,
              collegeName: user.careerInfo.collegeName,
              degree: user.careerInfo.degree,
              graduationYear: user.careerInfo.graduationYear,
              currentCompany: user.careerInfo.currentCompany,
              previousCompanies: user.careerInfo.previousCompanies || [],
              yearsOfExperience: user.careerInfo.yearsOfExperience,
              primaryTechStack: user.careerInfo.primaryTechStack || [],
              targetJobRole: user.careerInfo.targetJobRole
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }

        // 7. SkillAnalysis
        if (user.skillAnalysis) {
          await SkillAnalysis.findOneAndUpdate(
            { userId: user._id },
            {
              userId: user._id,
              matchingSkills: user.skillAnalysis.matchingSkills || [],
              missingSkills: user.skillAnalysis.missingSkills || [],
              suggestedSkills: user.skillAnalysis.suggestedSkills || [],
              industryDemandSkills: user.skillAnalysis.industryDemandSkills || [],
              analysisDate: user.skillAnalysis.analysisDate
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }

        // 8. Roadmap
        if (user.profile?.roadmapCache || user.careerInfo?.visualRoadmap) {
          await Roadmap.findOneAndUpdate(
            { userId: user._id },
            {
              userId: user._id,
              roadmapCache: user.profile?.roadmapCache || null,
              visualRoadmap: user.careerInfo?.visualRoadmap || null
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }

        // 9. Resume (including certifications)
        await Resume.findOneAndUpdate(
          { userId: user._id },
          {
            userId: user._id,
            resumeFile: user.resumeFile || {},
            resumeData: user.resumeData || {},
            resumeVersions: user.resumeVersions || [],
            certifications: user.certifications || []
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        migratedCount++;
      } catch (err) {
        log(`Error migrating user ${user._id}: ${err.message}`);
        errorCount++;
      }
    }

    log(`Migration Script Completed. Migrated: ${migratedCount}, Errors: ${errorCount}`);
  } catch (error) {
    log(`Critical Migration Error: ${error.message}`);
  } finally {
    await mongoose.disconnect();
    log('MongoDB disconnected.');
  }
};

const run = async () => {
  await connectDB();
  await migrateUsers();
};

run();
