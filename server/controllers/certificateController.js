
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import User from '../models/User.js'
import resumeParserService from '../services/resumeParserService.js'
import { analyzeCertificate } from '../services/certificateService.js'
import { matchSkillStrictly } from '../services/skillMatchingService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOAD_DIR = path.join(__dirname, '../../uploads/certificates')

// Ensure upload directory exists
try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
} catch (err) {
    console.error('Failed to create cert upload directory:', err)
}


export const getCertificates = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.certifications || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const uploadCertificate = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const file = req.file;

        if (!userId || !file) {
            return res.status(400).json({ error: 'User context or file missing' });
        }

        // Save file
        const filename = `${userId}-cert-${Date.now()}.pdf`;
        const filePath = path.join(UPLOAD_DIR, filename);
        await fs.writeFile(filePath, file.buffer);

        // Extract Text
        let extractedText = "";
        try {
            extractedText = await resumeParserService.extractTextFromPdf(filePath);
        } catch (pdfError) {
            console.error("PDF Parsing failed:", pdfError.message);
            // Delete file if parsing failed completely
            await fs.unlink(filePath).catch(() => { });
            return res.status(422).json({ error: "Could not read PDF content" });
        }

        // Analyze with Groq
        const userProfile = await User.findById(userId);
        const targetRole = userProfile.profile?.targetJob || 'General';

        const currentSkillState = {
            mastered: userProfile.profile?.completedSkills || [],
            learning: userProfile.profile?.learningSkills || []
        };

        const analysis = await analyzeCertificate(
            extractedText,
            targetRole,
            [],
            currentSkillState
        );

        // Map fields exactly as requested
        const skillsExtracted = (analysis.skillAchievement?.certified || []).map(s => typeof s === 'string' ? s : s.skill);

        // --- Roadmap Skill Integration (REFINED PIPELINE) ---
        const newlyMasteredSkills = [];
        const roadmapSkillsPool = new Set();

        // 1. Gather all potential roadmap skills
        if (userProfile.profile?.currentSkills) {
            userProfile.profile.currentSkills.forEach(s => roadmapSkillsPool.add(typeof s === 'string' ? s : s.name || s.skill));
        }
        if (userProfile.profile?.targetSkills) {
            userProfile.profile.targetSkills.forEach(s => roadmapSkillsPool.add(typeof s === 'string' ? s : s.name || s.skill));
        }
        if (userProfile.profile?.learningSkills) {
            userProfile.profile.learningSkills.forEach(s => roadmapSkillsPool.add(s));
        }
        if (userProfile.profile?.roadmapCache) {
            try {
                const cache = typeof userProfile.profile.roadmapCache === 'string'
                    ? JSON.parse(userProfile.profile.roadmapCache)
                    : userProfile.profile.roadmapCache;

                if (cache.roadmap) {
                    Object.values(cache.roadmap).forEach(phase => {
                        if (Array.isArray(phase)) {
                            phase.forEach(item => {
                                if (item.skill) roadmapSkillsPool.add(item.skill);
                            });
                        }
                    });
                }
            } catch (e) {
                console.warn("Failed to parse roadmapCache:", e.message);
            }
        }

        const allRoadmapSkills = Array.from(roadmapSkillsPool).filter(Boolean);
        console.log('Roadmap skills pool:', allRoadmapSkills);

        // 2. Process each extracted skill
        for (const certSkill of skillsExtracted) {
            for (const roadmapSkillName of allRoadmapSkills) {
                const matchResult = await matchSkillStrictly(certSkill, [roadmapSkillName]);
                console.log(`Matching cert skill "${certSkill}" against "${roadmapSkillName}" → ${matchResult.matchFound}`);

                if (matchResult.matchFound) {
                    const alreadyCompleted = userProfile.profile.completedSkills.some(s =>
                        s.skill.toLowerCase() === roadmapSkillName.toLowerCase()
                    );

                    if (!alreadyCompleted) {
                        userProfile.profile.completedSkills.push({
                            skill: roadmapSkillName,
                            score: 100,
                            masteredAt: new Date(),
                            source: 'certificate'
                        });

                        if (userProfile.profile.learningSkills) {
                            userProfile.profile.learningSkills = userProfile.profile.learningSkills.filter(s =>
                                s.toLowerCase() !== roadmapSkillName.toLowerCase()
                            );
                        }

                        if (userProfile.profile.currentSkills) {
                            userProfile.profile.currentSkills = userProfile.profile.currentSkills.filter(s => {
                                const name = typeof s === 'string' ? s : (s.name || s.skill);
                                return name.toLowerCase() !== roadmapSkillName.toLowerCase();
                            });
                        }

                        newlyMasteredSkills.push(roadmapSkillName);
                    }
                }
            }
        }

        console.log('Skills promoted to mastered:', newlyMasteredSkills);
        const roadmapUpdated = newlyMasteredSkills.length > 0;

        const newCert = {
            title: analysis.certificate?.title || 'Unknown Certificate',
            polishedTitle: analysis.certificate?.polishedTitle || analysis.certificate?.title || 'Unknown Certificate',
            issuer: analysis.certificate?.issuer || 'Unknown Issuer',
            issueDate: analysis.certificate?.issueDate ? new Date(analysis.certificate.issueDate) : new Date(),
            issueYear: analysis.certificate?.issueYear ? Number(analysis.certificate.issueYear) : new Date().getFullYear(),
            skills: skillsExtracted,
            masteredSkills: newlyMasteredSkills,
            verificationStatus: 'Verified',
            fileUrl: `http://localhost:5000/certificates/${filename}`,
            verificationMethod: 'certificate',
            useInResume: true,
            uploadedAt: new Date()
        };

        userProfile.certifications.push(newCert);

        if (roadmapUpdated) {
            userProfile.profile.roadmapCache = null;
        }

        await userProfile.save();

        res.json({
            success: true,
            certificate: newCert,
            promotedSkills: newlyMasteredSkills,
            message: `Certificate verified! ${newlyMasteredSkills.length} skill(s) marked as mastered.`
        });

    } catch (error) {
        console.error('Certificate Upload Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const toggleCertificateResume = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.userId);

        const cert = user.certifications.id(id);
        if (!cert) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        cert.useInResume = !cert.useInResume;
        await user.save();

        res.json({
            message: 'Certificate updated',
            useInResume: cert.useInResume
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const certIndex = user.certifications.findIndex(c => c._id.toString() === id);
        if (certIndex === -1) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        const cert = user.certifications[certIndex];

        // Delete physical file
        if (cert.fileUrl) {
            const filename = cert.fileUrl.split('/').pop();
            const filePath = path.join(UPLOAD_DIR, filename);
            await fs.unlink(filePath).catch(err => console.warn('Could not delete file:', err.message));
        }

        // Remove from array
        user.certifications.splice(certIndex, 1);
        await user.save();

        res.json({ message: 'Certificate deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
