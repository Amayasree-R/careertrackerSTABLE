import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import User from '../models/User.js'
import resumeParserService from '../services/resumeParserService.js'
import { analyzeCertificate } from '../services/certificateService.js'
import { matchSkillStrictly } from '../services/skillMatchingService.js'
import { normalizeSkill } from '../utils/skillNormalizer.js'

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
            await fs.unlink(filePath).catch(() => { });
            const errorMessage = pdfError.message || "Could not read PDF content";
            return res.status(422).json({
                error: errorMessage,
                code: 'PDF_EXTRACTION_FAILED',
                suggestion: 'Please ensure the PDF contains selectable text (not just images or scans)'
            });
        }

        // Get user profile
        const userProfile = await User.findById(userId);
        const targetRole = userProfile.profile?.targetJob || 'General';

        // --- NEW: Text Preprocessing for Certificate Titles ---
        const preprocessCertificateText = (text) => {
            if (!text) return "";
            const lines = text.split('\n');
            const genericHeadings = [
                'CERTIFICATE OF APPRECIATION',
                'CERTIFICATE OF COMPLETION',
                'CERTIFICATE OF ACHIEVEMENT',
                'THE FOLLOWING AWARD IS GIVEN TO',
                'THIS IS TO CERTIFY THAT',
                'AWARDED TO'
            ];
            const courseKeywords = ['COURSE', 'DEVELOPMENT', 'TRAINING', 'PROGRAM', 'CERTIFICATION', 'SPECIALIZATION'];
            
            const prioritizedLines = [];
            const otherLines = [];

            lines.forEach(line => {
                const upperLine = line.toUpperCase().trim();
                // Skip or deprioritize generic headings
                if (genericHeadings.some(h => upperLine.includes(h))) return;
                
                if (courseKeywords.some(k => upperLine.includes(k))) {
                    prioritizedLines.push(line);
                } else {
                    otherLines.push(line);
                }
            });

            return [...prioritizedLines, ...otherLines].join('\n');
        };

        const preprocessedText = preprocessCertificateText(extractedText);
        // --------------------------------------------------------

        const currentSkillState = {
            mastered: userProfile.profile?.completedSkills || [],
            learning: userProfile.profile?.learningSkills || []
        };

        // Build roadmap skills pool BEFORE AI call so AI knows what to match against
        const roadmapSkillsPool = new Set();

        // Source 1: Current Skills
        (userProfile.profile?.currentSkills || []).forEach(s => {
            const name = typeof s === 'string' ? s : (s.name || s.skill);
            if (name) roadmapSkillsPool.add(name);
        });

        // Source 2: Learning Skills
        (userProfile.profile?.learningSkills || []).forEach(s => {
            if (s) roadmapSkillsPool.add(s);
        });

        // Source 3: Suggested Skills
        (userProfile.skillAnalysis?.suggestedSkills || []).forEach(s => {
            if (s) roadmapSkillsPool.add(s);
        });

        // Source 4: Missing Skills
        (userProfile.skillAnalysis?.missingSkills || []).forEach(s => {
            if (s) roadmapSkillsPool.add(s);
        });

        // Source 5: Primary Tech Stack
        (userProfile.careerInfo?.primaryTechStack || []).forEach(s => {
            if (s) roadmapSkillsPool.add(s);
        });

        // Source 6: Roadmap Cache
        if (userProfile.profile?.roadmapCache) {
            try {
                const cache = typeof userProfile.profile.roadmapCache === 'string'
                    ? JSON.parse(userProfile.profile.roadmapCache)
                    : userProfile.profile.roadmapCache;

                if (cache.roadmap && typeof cache.roadmap === 'object') {
                    Object.entries(cache.roadmap).forEach(([phase, items]) => {
                        if (Array.isArray(items)) {
                            items.forEach(item => { if (item?.skill) roadmapSkillsPool.add(item.skill); });
                        }
                    });
                }
                if (Array.isArray(cache.learningPath)) {
                    cache.learningPath.forEach(item => { if (item?.skill) roadmapSkillsPool.add(item.skill); });
                }
                if (Array.isArray(cache.skills)) {
                    cache.skills.forEach(item => {
                        const skillName = typeof item === 'string' ? item : item?.skill;
                        if (skillName) roadmapSkillsPool.add(skillName);
                    });
                }
            } catch (e) {
                console.warn("[Certificate Upload] Failed to parse roadmapCache:", e.message);
            }
        }

        const roadmapSkillNames = Array.from(roadmapSkillsPool).filter(Boolean);
        console.log('[Certificate Upload] Roadmap skills pool built:', roadmapSkillNames.length, 'skills');

        // Analyze with Groq — pass preprocessed text
        let analysis;
        try {
            analysis = await analyzeCertificate(
                preprocessedText,
                targetRole,
                roadmapSkillNames,
                currentSkillState
            );
        } catch (groqError) {
            await fs.unlink(filePath).catch(() => { });

            if (groqError.code === 'GROQ_AUTH_FAILED' || groqError.status === 401) {
                console.error('Groq API authentication failed');
                return res.status(503).json({
                    error: 'AI service configuration error. Please contact the administrator to verify the Groq API key is set correctly.',
                    code: 'AI_CONFIG_ERROR'
                });
            }

            if (groqError.code === 'MISSING_API_KEY') {
                console.error('Groq API key is missing');
                return res.status(503).json({
                    error: 'AI service is not configured. Please contact the administrator.',
                    code: 'AI_NOT_CONFIGURED'
                });
            }

            if (groqError.code === 'INVALID_API_KEY_FORMAT') {
                console.error('Groq API key has invalid format');
                return res.status(503).json({
                    error: 'AI service configuration error. Invalid API key format.',
                    code: 'AI_CONFIG_ERROR'
                });
            }

            console.error('Certificate analysis error:', groqError.message);
            return res.status(503).json({
                error: groqError.message || 'Failed to analyze certificate. Please try again later.',
                code: 'ANALYSIS_FAILED'
            });
        }

        // Validate AI response
        if (!analysis || typeof analysis !== 'object') {
            console.error('[Certificate Upload] AI returned invalid analysis response:', analysis);
            await fs.unlink(filePath).catch(() => { });
            return res.status(503).json({
                error: 'AI service returned invalid response. Please try again.',
                code: 'INVALID_AI_RESPONSE'
            });
        }

        console.log('[Certificate Upload] Full AI analysis response received:', JSON.stringify(analysis, null, 2).substring(0, 500));

        // Combine certified and notMappedToRoadmap skills
        const rawCertifiedSkills = (analysis.skillAchievement?.certified || []).map(s => typeof s === 'string' ? s : s.skill);
        const rawNotMappedSkills = (analysis.skillAchievement?.notMappedToRoadmap || []).map(s => typeof s === 'string' ? s : s.skill);
        
        // Normalize all extracted skills
        const skillsExtracted = [...new Set([...rawCertifiedSkills, ...rawNotMappedSkills])]
            .filter(Boolean)
            .map(s => normalizeSkill(s));

        console.log('[Certificate Upload] 📝 AI Analysis Summary:');
        console.log(`  Certificate Title: ${analysis.certificate?.polishedTitle || 'Unknown'}`);
        console.log(`  Issuer: ${analysis.certificate?.issuer || 'Unknown'}`);
        console.log(`  Issue Date: ${analysis.certificate?.issueDate || 'Unknown'}`);
        console.log(`  Total Skills Extracted: ${skillsExtracted.length}`);
        console.log(`    - Certified (roadmap-matched): ${rawCertifiedSkills.length} → ${rawCertifiedSkills.join(', ') || 'None'}`);
        console.log(`    - Not mapped to roadmap: ${rawNotMappedSkills.length} → ${rawNotMappedSkills.join(', ') || 'None'}`);
        console.log(`  Career Relevance: ${analysis.careerAlignment?.relevanceLevel || 'Unknown'}`);

        // --- Roadmap Skill Matching & Mastery Pipeline ---
        const newlyMasteredSkills = [];
        const allRoadmapSkills = roadmapSkillNames; // already built above

        console.log(`[Certificate Upload] 🔍 Matching ${skillsExtracted.length} extracted skill(s) against ${allRoadmapSkills.length} roadmap skills...`);
        console.log(`[Certificate Upload] Extracted skills:`, skillsExtracted);

        const matchDetails = [];

        for (const certSkill of skillsExtracted) {
            let hasMatch = false;

            for (const roadmapSkillName of allRoadmapSkills) {
                const matchResult = await matchSkillStrictly(certSkill, [roadmapSkillName]);

                if (matchResult.matchFound) {
                    hasMatch = true;
                    console.log(`[Certificate Upload] ✅ MATCH FOUND: "${certSkill}" → "${roadmapSkillName}"`);
                    matchDetails.push({ extracted: certSkill, matched: roadmapSkillName });

                    const alreadyCompleted = userProfile.profile.completedSkills.some(s =>
                        normalizeSkill(s.skill) === normalizeSkill(roadmapSkillName)
                    );

                    if (!alreadyCompleted) {
                        userProfile.profile.completedSkills.push({
                            skill: normalizeSkill(roadmapSkillName),
                            score: 100,
                            masteredAt: new Date(),
                            source: 'certificate'
                        });

                        if (userProfile.profile.learningSkills) {
                            userProfile.profile.learningSkills = userProfile.profile.learningSkills.filter(s =>
                                normalizeSkill(s) !== normalizeSkill(roadmapSkillName)
                            );
                        }

                        if (userProfile.profile.currentSkills) {
                            userProfile.profile.currentSkills = userProfile.profile.currentSkills.filter(s => {
                                const name = typeof s === 'string' ? s : (s.name || s.skill);
                                return normalizeSkill(name) !== normalizeSkill(roadmapSkillName);
                            });
                        }

                        const normalizedRoadmapSkill = normalizeSkill(roadmapSkillName);
                        newlyMasteredSkills.push(normalizedRoadmapSkill);
                    } else {
                        console.log(`[Certificate Upload] ℹ️  "${roadmapSkillName}" already in completedSkills, not adding again`);
                    }
                    break;
                }
            }

            if (!hasMatch) {
                console.warn(`[Certificate Upload] ⚠️  No roadmap match for: "${certSkill}" — adding as mastered anyway`);

                const alreadyCompleted = userProfile.profile.completedSkills.some(s =>
                    normalizeSkill(s.skill) === normalizeSkill(certSkill)
                );

                if (!alreadyCompleted) {
                    const normalizedCertSkill = normalizeSkill(certSkill);
                    userProfile.profile.completedSkills.push({
                        skill: normalizedCertSkill,
                        score: 100,
                        masteredAt: new Date(),
                        source: 'certificate',
                        note: 'Added from certificate (not in original roadmap)'
                    });
                    newlyMasteredSkills.push(normalizedCertSkill);
                    console.log(`[Certificate Upload] ✅ Added unmatched skill as mastered: "${normalizedCertSkill}"`);
                }

                matchDetails.push({ extracted: certSkill, matched: null, addedAsNew: true });
            }
        }

        console.log('[Certificate Upload] 📋 Match Summary:', matchDetails);
        console.log('[Certificate Upload] ✨ Skills promoted to mastered:', newlyMasteredSkills);
        const roadmapUpdated = newlyMasteredSkills.length > 0;

        // Validate and sanitize certificate date data
        const validateAndSanitizeCertData = (analysis) => {
            const cert = analysis.certificate || {};

            console.log('[Certificate Upload] Raw AI response certificateData:', JSON.stringify(cert, null, 2));

            let issueYear = new Date().getFullYear();
            if (cert.issueYear !== undefined && cert.issueYear !== null && cert.issueYear !== '') {
                const parsedYear = Number(cert.issueYear);
                if (!isNaN(parsedYear) && parsedYear >= 1900 && parsedYear <= new Date().getFullYear() + 1) {
                    issueYear = parsedYear;
                    console.log(`[Certificate Upload] Parsed issueYear: ${issueYear}`);
                } else {
                    console.warn(`[Certificate Upload] Invalid issueYear "${cert.issueYear}", using current year`);
                }
            }

            let issueDate = new Date();
            if (cert.issueDate) {
                try {
                    const parsedDate = new Date(cert.issueDate);
                    if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
                        issueDate = parsedDate;
                        console.log(`[Certificate Upload] Parsed issueDate: ${issueDate.toISOString()}`);
                    } else {
                        console.warn(`[Certificate Upload] Invalid issueDate "${cert.issueDate}", using current date`);
                    }
                } catch (e) {
                    console.warn(`[Certificate Upload] Could not parse issueDate "${cert.issueDate}":`, e.message);
                }
            }

            return { issueYear, issueDate };
        };

        const dateValidation = validateAndSanitizeCertData(analysis);

        const newCert = {
            title: analysis.certificate?.title || 'Unknown Certificate',
            polishedTitle: analysis.certificate?.polishedTitle || analysis.certificate?.title || 'Unknown Certificate',
            issuer: analysis.certificate?.issuer || 'Unknown Issuer',
            issueDate: dateValidation.issueDate,
            issueYear: dateValidation.issueYear,
            skills: skillsExtracted,
            masteredSkills: newlyMasteredSkills,
            verificationStatus: 'Verified',
            fileUrl: `http://localhost:5000/certificates/${filename}`,
            verificationMethod: 'certificate',
            useInResume: true,
            uploadedAt: new Date()
        };

        console.log('[Certificate Upload] Certificate object to be saved:', {
            title: newCert.title,
            issuer: newCert.issuer,
            issueYear: newCert.issueYear + ' (type: ' + typeof newCert.issueYear + ')',
            issueDate: newCert.issueDate?.toISOString(),
            skillsCount: newCert.skills.length,
            masteredSkillsCount: newCert.masteredSkills.length
        });

        if (typeof newCert.issueYear !== 'number' || isNaN(newCert.issueYear)) {
            console.error('[Certificate Upload] CRITICAL: issueYear is not a valid number:', newCert.issueYear);
            throw new Error(`Invalid issueYear value: ${newCert.issueYear} (type: ${typeof newCert.issueYear})`);
        }

        if (typeof newCert.issueDate !== 'object' || !(newCert.issueDate instanceof Date)) {
            console.error('[Certificate Upload] CRITICAL: issueDate is not a valid Date:', newCert.issueDate);
            throw new Error(`Invalid issueDate value: ${newCert.issueDate}`);
        }

        userProfile.certifications.push(newCert);

        if (roadmapUpdated) {
            userProfile.profile.roadmapCache = null;
        }

        console.log('[Certificate Upload] Validating user profile before saving...');
        await userProfile.validate();
        console.log('[Certificate Upload] Validation passed, saving...');
        await userProfile.save();

        console.log('[Certificate Upload] Newly mastered skills saved to completedSkills:');
        newlyMasteredSkills.forEach(skill => {
            const skillRecord = userProfile.profile.completedSkills.find(s => s.skill.toLowerCase() === skill.toLowerCase());
            if (skillRecord) {
                console.log(`  ✓ ${skill}: score=${skillRecord.score}, masteredAt=${skillRecord.masteredAt}, source=certificate`);
            }
        });

        const resumeGeneratorService = await import('../services/resumeGeneratorService.js').then(m => m.default || m);
        let resumeData = null;
        try {
            const freshUserData = await User.findById(userId);
            resumeData = resumeGeneratorService.generateResumeData(freshUserData);
            console.log(`[Certificate Upload] Resume data regenerated with ${newlyMasteredSkills.length} new mastered skill(s)`);
        } catch (resumeError) {
            console.warn('[Certificate Upload] Could not regenerate resume data:', resumeError.message);
        }

        res.json({
            success: true,
            certificate: newCert,
            certifiedSkills: skillsExtracted,
            promotedSkills: newlyMasteredSkills,
            masteredSkillsCount: userProfile.profile.completedSkills.length,
            resumeUpdated: resumeData ? true : false,
            message: `Certificate verified! ${newlyMasteredSkills.length} skill(s) marked as mastered and added to your resume.`
        });

    } catch (error) {
        console.error('Certificate Upload Error:', {
            code: error.code,
            message: error.message,
            status: error.status,
            name: error.name
        });

        if (error.name === 'ValidationError') {
            const validationErrors = Object.entries(error.errors)
                .map(([path, err]) => `${path}: ${err.message}`)
                .join('; ');
            console.error('[Certificate Upload] MongoDB Validation Error:', validationErrors);
            return res.status(422).json({
                error: 'Certificate data validation failed. Some certificate fields are invalid.',
                details: validationErrors,
                code: 'VALIDATION_ERROR'
            });
        }

        if (error.status === 401 || error.code === 'GROQ_AUTH_FAILED') {
            return res.status(503).json({
                error: 'AI service authentication failed. Please contact support.',
                code: 'AI_AUTH_ERROR'
            });
        }

        if (error.code === 'ENOENT' || error.code === 'EACCES') {
            return res.status(500).json({
                error: 'Failed to save certificate file. Please try uploading again.',
                code: 'FILE_ERROR'
            });
        }

        res.status(500).json({
            error: error.message || 'An error occurred during certificate upload',
            code: 'UNKNOWN_ERROR'
        });
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
        const skillsToRemove = cert.skills || cert.masteredSkills || [];

        // Identify skills certified by OTHER certificates
        const otherCerts = user.certifications.filter((_, idx) => idx !== certIndex);
        const stillCertifiedSkills = new Set();
        otherCerts.forEach(c => {
            (c.skills || []).forEach(s => stillCertifiedSkills.add(normalizeSkill(s)));
            (c.masteredSkills || []).forEach(s => stillCertifiedSkills.add(normalizeSkill(s)));
        });

        // Determine which skills were ONLY certified by this certificate
        const skillsToActuallyRemove = skillsToRemove.filter(skill => 
            !stillCertifiedSkills.has(normalizeSkill(skill))
        );

        console.log(`[Certificate Delete] Skills only in this cert:`, skillsToActuallyRemove);

        // Remove from user's completedSkills
        if (skillsToActuallyRemove.length > 0) {
            const initialCount = user.profile.completedSkills.length;
            user.profile.completedSkills = user.profile.completedSkills.filter(s => 
                !skillsToActuallyRemove.some(r => normalizeSkill(r) === normalizeSkill(s.skill))
            );
            console.log(`[Certificate Delete] Removed ${initialCount - user.profile.completedSkills.length} skills from completedSkills`);
        }

        if (cert.fileUrl) {
            const filename = cert.fileUrl.split('/').pop();
            const filePath = path.join(UPLOAD_DIR, filename);
            await fs.unlink(filePath).catch(err => console.warn('Could not delete file:', err.message));
        }

        user.certifications.splice(certIndex, 1);
        
        // If skills were removed, clear roadmap cache to force recalculation
        if (skillsToActuallyRemove.length > 0) {
            user.profile.roadmapCache = null;
        }

        await user.save();

        res.json({ 
            success: true,
            message: 'Certificate deleted successfully',
            removedSkills: skillsToActuallyRemove 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};