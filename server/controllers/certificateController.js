
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

        const newCert = {
            title: analysis.certificate?.title || 'Unknown Certificate',
            issuer: analysis.certificate?.issuer || 'Unknown Issuer',
            issueDate: analysis.certificate?.issueDate ? new Date(analysis.certificate.issueDate) : new Date(),
            issueYear: analysis.certificate?.issueYear ? Number(analysis.certificate.issueYear) : new Date().getFullYear(),
            skills: skillsExtracted,
            verificationStatus: 'Verified',
            fileUrl: `http://localhost:5000/certificates/${filename}`,
            verificationMethod: 'certificate',
            useInResume: true,
            uploadedAt: new Date()
        };

        userProfile.certifications.push(newCert);

        // --- Roadmap Skill Integration ---
        let roadmapUpdated = false;
        let matchedSkillName = null;

        // User's target skills to match against (dashboard reads from currentSkills)
        const targetSkills = userProfile.profile.currentSkills || [];

        // Check each extracted skill against the target skills
        for (const skill of skillsExtracted) {
            // Requested Logs
            console.log("Extracted skill:", skill);
            console.log("User currentSkills:", targetSkills);

            const matchResult = await matchSkillStrictly(skill, targetSkills);

            if (matchResult.matchFound && matchResult.matchedSkill) {
                matchedSkillName = matchResult.matchedSkill;

                // 1. Add to completedSkills if not already there
                const alreadyCompleted = userProfile.profile.completedSkills.some(s => s.skill === matchedSkillName);
                if (!alreadyCompleted) {
                    userProfile.profile.completedSkills.push({
                        skill: matchedSkillName,
                        score: 100,
                        masteredAt: new Date()
                    });

                    // Cleanup learning list if present
                    if (userProfile.profile.learningSkills && userProfile.profile.learningSkills.includes(matchedSkillName)) {
                        userProfile.profile.learningSkills = userProfile.profile.learningSkills.filter(s => s !== matchedSkillName);
                    }

                    roadmapUpdated = true;
                }

                if (roadmapUpdated) {
                    // Log success as requested
                    console.log("Roadmap updated:", matchedSkillName);
                    break;
                }
            }
        }

        // Clear roadmapCache to force dashboard to reload fresh data
        if (roadmapUpdated) {
            userProfile.profile.roadmapCache = null;
        }

        await userProfile.save();

        // Return the specific response structure requested by user
        res.json({
            certificate: newCert,
            roadmapUpdated,
            matchedSkill: matchedSkillName
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
