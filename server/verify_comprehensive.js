import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models (assuming ES modules and correct resolution)
import User from './models/User.js';
import Certificate from './models/Certificate.js';

const API_BASE = 'http://localhost:5000/api';
const SAMPLE_CERT = 'c:/careertrackerSTABLE/server/test_verification_cert.pdf';
const ROADMAP_SKILL = 'Machine Learning';

async function runVerification() {
    try {
        console.log('--- STARTING COMPREHENSIVE VERIFICATION ---');

        // 1. Connect to DB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // 2. Setup Test User
        const username = `comp_test_${Date.now()}`;
        const testUser = new User({
            username,
            email: `${username}@example.com`,
            fullName: 'Comprehensive Verifier',
            phoneNumber: '1234567890',
            password: 'hashed_password_irrelevant_for_direct_token',
            currentStatus: 'Working Professional',
            profile: {
                targetJob: 'Data Scientist',
                learningSkills: [ROADMAP_SKILL],
                completedSkills: [],
                roadmapCache: {
                    data: {
                        missingSkills: [ROADMAP_SKILL]
                    },
                    generatedAt: new Date()
                }
            }
        });
        await testUser.save();
        console.log(`✓ Test User created: ${testUser._id}`);

        // 3. Generate Token
        const token = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const authConfig = { headers: { 'Authorization': `Bearer ${token}` } };

        // 4. Verify Upload & Roadmap Reflection
        console.log('4. Uploading certificate (expecting roadmap match)...');
        const form = new FormData();
        form.append('certificate', fs.createReadStream(SAMPLE_CERT));

        const uploadRes = await axios.post(`${API_BASE}/certificates/upload`, form, {
            headers: { ...form.getHeaders(), ...authConfig.headers }
        });

        console.log('   API Response:', JSON.stringify(uploadRes.data, null, 2));

        if (uploadRes.data.roadmapUpdated && String(uploadRes.data.matchedSkill).toLowerCase() === ROADMAP_SKILL.toLowerCase()) {
            console.log(`✓ SUCCESS: Roadmap matched "${ROADMAP_SKILL}"`);
        } else {
            console.log('--- ERROR DETAILS ---');
            console.log('Response RoadmapUpdated:', uploadRes.data.roadmapUpdated);
            console.log('Response MatchedSkill:', uploadRes.data.matchedSkill);
            throw new Error(`Roadmap match failed. Expected ${ROADMAP_SKILL}`);
        }

        // 5. Verify DB State (Skill Mastered)
        console.log('5. Verifying DB state...');
        const updatedUser = await User.findById(testUser._id);
        console.log('   Completed Skills in DB:', JSON.stringify(updatedUser.profile.completedSkills, null, 2));

        const masteredSkill = updatedUser.profile.completedSkills.find(s => s.skill.toLowerCase() === ROADMAP_SKILL.toLowerCase());

        if (masteredSkill && masteredSkill.verificationMethod === 'certificate') {
            console.log('✓ SUCCESS: Skill marked as mastered in DB with correct verification method');
        } else {
            throw new Error('Skill not correctly updated in User profile');
        }

        if (updatedUser.profile.learningSkills.includes(ROADMAP_SKILL)) {
            throw new Error('Skill still present in learningSkills list');
        }
        console.log('✓ SUCCESS: Skill removed from learningSkills');

        // 6. Verify Toggle includeInResume
        const certId = uploadRes.data.certificate._id;
        console.log('6. Toggling resume inclusion...');
        const toggleRes = await axios.patch(`${API_BASE}/certificates/${certId}/toggle-resume`, {}, authConfig);

        const toggledCert = await Certificate.findById(certId);
        if (toggledCert.includeInResume === true) {
            console.log('✓ SUCCESS: includeInResume toggled to true');
        } else {
            throw new Error('Toggle failed to update DB');
        }

        // 7. Verify Delete & Skill Reversion
        console.log('7. Deleting certificate (expecting roadmap reversion)...');
        await axios.delete(`${API_BASE}/certificates/${certId}`, authConfig);

        const deletedCert = await Certificate.findById(certId);
        if (!deletedCert) {
            console.log('✓ SUCCESS: Certificate deleted from DB');
        } else {
            throw new Error('Certificate still exists in DB after deletion');
        }

        const finalUser = await User.findById(testUser._id);
        const revertedSkill = finalUser.profile.learningSkills.includes(ROADMAP_SKILL);
        const stillMastered = finalUser.profile.completedSkills.some(s => s.skill === ROADMAP_SKILL);

        if (revertedSkill && !stillMastered) {
            console.log('✓ SUCCESS: Skill reverted from Mastered back to Learning');
        } else {
            throw new Error('Skill reversion failed');
        }

        // 8. Cleanup user
        await User.findByIdAndDelete(testUser._id);
        console.log('✓ Cleanup: Test User deleted');

        console.log('\n🌟 ALL FEATURES VERIFIED SUCCESSFULLY! 🌟');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

runVerification();
