
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
            
            // Return detailed error message from extraction diagnostics
            const errorMessage = pdfError.message || "Could not read PDF content";
            return res.status(422).json({ 
                error: errorMessage,
                code: 'PDF_EXTRACTION_FAILED',
                suggestion: 'Please ensure the PDF contains selectable text (not just images or scans)'
            });
        }

        // Analyze with Groq
        const userProfile = await User.findById(userId);
        const targetRole = userProfile.profile?.targetJob || 'General';

        const currentSkillState = {
            mastered: userProfile.profile?.completedSkills || [],
            learning: userProfile.profile?.learningSkills || []
        };

        let analysis;
        try {
            analysis = await analyzeCertificate(
                extractedText,
                targetRole,
                [],
                currentSkillState
            );
        } catch (groqError) {
            // Delete uploaded file before returning error
            await fs.unlink(filePath).catch(() => { });
            
            // Handle specific Groq API errors
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
            
            // Generic AI analysis failure
            console.error('Certificate analysis error:', groqError.message);
            return res.status(503).json({ 
                error: groqError.message || 'Failed to analyze certificate. Please try again later.',
                code: 'ANALYSIS_FAILED'
            });
        }

        // Validate and safely extract analysis data
        if (!analysis || typeof analysis !== 'object') {
            console.error('[Certificate Upload] AI returned invalid analysis response:', analysis);
            await fs.unlink(filePath).catch(() => {});
            return res.status(503).json({
                error: 'AI service returned invalid response. Please try again.',
                code: 'INVALID_AI_RESPONSE'
            });
        }

        console.log('[Certificate Upload] Full AI analysis response received:', JSON.stringify(analysis, null, 2).substring(0, 500));

        // Map fields exactly as requested
        // Combine both certified (roadmap-matched) and notMappedToRoadmap (new) skills
        const certifiedSkills = (analysis.skillAchievement?.certified || []).map(s => typeof s === 'string' ? s : s.skill);
        const notMappedSkills = (analysis.skillAchievement?.notMappedToRoadmap || []).map(s => typeof s === 'string' ? s : s.skill);
        const skillsExtracted = [...certifiedSkills, ...notMappedSkills].filter(Boolean);
        
        console.log('[Certificate Upload] 📝 AI Analysis Summary:');
        console.log(`  Certificate Title: ${analysis.certificate?.polishedTitle || 'Unknown'}`);
        console.log(`  Issuer: ${analysis.certificate?.issuer || 'Unknown'}`);
        console.log(`  Issue Date: ${analysis.certificate?.issueDate || 'Unknown'}`);
        console.log(`  Total Skills Extracted: ${skillsExtracted.length}`);
        console.log(`    - Certified (roadmap-matched): ${certifiedSkills.length} → ${certifiedSkills.join(', ') || 'None'}`);
        console.log(`    - Not mapped to roadmap: ${notMappedSkills.length} → ${notMappedSkills.join(', ') || 'None'}`);
        console.log(`  Career Relevance: ${analysis.careerAlignment?.relevanceLevel || 'Unknown'}`);

        // --- Roadmap Skill Integration (ENHANCED PIPELINE) ---
        const newlyMasteredSkills = [];
        const roadmapSkillsPool = new Set();

        console.log('[Certificate Upload] Building roadmap skills pool from multiple sources...');

        // 1. Gather all potential roadmap skills from all sources
        
        // Source 1: Current Skills
        if (userProfile.profile?.currentSkills && Array.isArray(userProfile.profile.currentSkills)) {
            console.log('[Certificate Upload] Source 1 - currentSkills:', userProfile.profile.currentSkills);
            userProfile.profile.currentSkills.forEach(s => {
                const skillName = typeof s === 'string' ? s : (s.name || s.skill);
                if (skillName) roadmapSkillsPool.add(skillName);
            });
        }

        // Source 2: Learning Skills
        if (userProfile.profile?.learningSkills && Array.isArray(userProfile.profile.learningSkills)) {
            console.log('[Certificate Upload] Source 2 - learningSkills:', userProfile.profile.learningSkills);
            userProfile.profile.learningSkills.forEach(s => {
                if (s) roadmapSkillsPool.add(s);
            });
        }

        // Source 3: Suggested Skills (from skill analysis)
        if (userProfile.skillAnalysis?.suggestedSkills && Array.isArray(userProfile.skillAnalysis.suggestedSkills)) {
            console.log('[Certificate Upload] Source 3 - suggestedSkills:', userProfile.skillAnalysis.suggestedSkills);
            userProfile.skillAnalysis.suggestedSkills.forEach(s => {
                if (s) roadmapSkillsPool.add(s);
            });
        }

        // Source 4: Missing Skills (from skill analysis)
        if (userProfile.skillAnalysis?.missingSkills && Array.isArray(userProfile.skillAnalysis.missingSkills)) {
            console.log('[Certificate Upload] Source 4 - missingSkills:', userProfile.skillAnalysis.missingSkills);
            userProfile.skillAnalysis.missingSkills.forEach(s => {
                if (s) roadmapSkillsPool.add(s);
            });
        }

        // Source 5: Primary Tech Stack
        if (userProfile.careerInfo?.primaryTechStack && Array.isArray(userProfile.careerInfo.primaryTechStack)) {
            console.log('[Certificate Upload] Source 5 - primaryTechStack:', userProfile.careerInfo.primaryTechStack);
            userProfile.careerInfo.primaryTechStack.forEach(s => {
                if (s) roadmapSkillsPool.add(s);
            });
        }

        // Source 6: Roadmap Cache (most comprehensive)
        if (userProfile.profile?.roadmapCache) {
            try {
                const cache = typeof userProfile.profile.roadmapCache === 'string'
                    ? JSON.parse(userProfile.profile.roadmapCache)
                    : userProfile.profile.roadmapCache;

                console.log('[Certificate Upload] Source 6 - roadmapCache structure:', {
                    hasRoadmap: !!cache.roadmap,
                    hasLearningPath: !!cache.learningPath,
                    hasSkills: !!cache.skills
                });

                // Extract from roadmap object (phases)
                if (cache.roadmap && typeof cache.roadmap === 'object') {
                    Object.entries(cache.roadmap).forEach(([phase, items]) => {
                        if (Array.isArray(items)) {
                            items.forEach(item => {
                                if (item?.skill) {
                                    console.log(`  [Roadmap] Phase "${phase}": ${item.skill}`);
                                    roadmapSkillsPool.add(item.skill);
                                }
                            });
                        }
                    });
                }

                // Extract from learningPath array
                if (Array.isArray(cache.learningPath)) {
                    cache.learningPath.forEach(item => {
                        if (item?.skill) {
                            console.log(`  [LearningPath]: ${item.skill}`);
                            roadmapSkillsPool.add(item.skill);
                        }
                    });
                }

                // Extract from skills array
                if (Array.isArray(cache.skills)) {
                    cache.skills.forEach(item => {
                        const skillName = typeof item === 'string' ? item : item?.skill;
                        if (skillName) {
                            console.log(`  [Skills]: ${skillName}`);
                            roadmapSkillsPool.add(skillName);
                        }
                    });
                }
            } catch (e) {
                console.warn("[Certificate Upload] Failed to parse roadmapCache:", e.message);
            }
        }

        const allRoadmapSkills = Array.from(roadmapSkillsPool).filter(Boolean);
        console.log('[Certificate Upload] ✅ Final roadmap skills pool:', allRoadmapSkills);
        console.log('[Certificate Upload] 📊 Total skills to match against:', allRoadmapSkills.length);

        // 2. Process each extracted skill
        console.log(`[Certificate Upload] 🔍 Attempting to match ${skillsExtracted.length} extracted skill(s)...`);
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
                    } else {
                        console.log(`[Certificate Upload] ℹ️  "${roadmapSkillName}" already in completedSkills, not adding again`);
                    }
                    break; // Move to next extracted skill after finding a match
                }
            }

            if (!hasMatch) {
                console.warn(`[Certificate Upload] ⚠️  No match found for extracted skill: "${certSkill}"`);
                console.warn(`[Certificate Upload] Searched against ${allRoadmapSkills.length} roadmap skills`);
                console.warn(`[Certificate Upload] Adding as new mastered skill anyway (not in roadmap but certified from course)`);
                
                // Even if skill is not in the user's current roadmap, 
                // add it as mastered since it's proven by certificate
                const alreadyCompleted = userProfile.profile.completedSkills.some(s =>
                    s.skill.toLowerCase() === certSkill.toLowerCase()
                );
                
                if (!alreadyCompleted) {
                    userProfile.profile.completedSkills.push({
                        skill: certSkill,
                        score: 100,
                        masteredAt: new Date(),
                        source: 'certificate',
                        note: 'Added from certificate (not in original roadmap)'
                    });
                    newlyMasteredSkills.push(certSkill);
                    console.log(`[Certificate Upload] ✅ Added unmatched skill as mastered: "${certSkill}"`);
                }
                
                matchDetails.push({ extracted: certSkill, matched: null, addedAsNew: true });
            }
        }

        console.log('[Certificate Upload] 📋 Match Summary:', matchDetails);
        console.log('[Certificate Upload] ✨ Skills promoted to mastered:', newlyMasteredSkills);
        const roadmapUpdated = newlyMasteredSkills.length > 0;

        // Validate and sanitize certificate data from AI response
        const validateAndSanitizeCertData = (analysis) => {
            const cert = analysis.certificate || {};
            
            // Log raw certificate data for debugging
            console.log('[Certificate Upload] Raw AI response certificateData:', JSON.stringify(cert, null, 2));
            
            // Process issueYear - ensure it's a valid 4-digit number
            let issueYear = new Date().getFullYear();
            if (cert.issueYear !== undefined && cert.issueYear !== null && cert.issueYear !== '') {
                const parsedYear = Number(cert.issueYear);
                // Check if it's a valid year (4-digit number between 1900 and current+1)
                if (!isNaN(parsedYear) && parsedYear >= 1900 && parsedYear <= new Date().getFullYear() + 1) {
                    issueYear = parsedYear;
                    console.log(`[Certificate Upload] Parsed issueYear: ${issueYear}`);
                } else {
                    console.warn(`[Certificate Upload] Invalid issueYear "${cert.issueYear}" (parsed as ${parsedYear}), using current year ${new Date().getFullYear()} instead`);
                }
            } else {
                console.log(`[Certificate Upload] No issueYear provided, using current year ${new Date().getFullYear()}`);
            }
            
            // Process issueDate - ensure it's a valid date
            let issueDate = new Date();
            if (cert.issueDate) {
                try {
                    const parsedDate = new Date(cert.issueDate);
                    // Check if date is valid and not in the future
                    if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
                        issueDate = parsedDate;
                        console.log(`[Certificate Upload] Parsed issueDate: ${issueDate.toISOString()}`);
                    } else {
                        console.warn(`[Certificate Upload] Invalid issueDate "${cert.issueDate}" (future or invalid), using current date instead`);
                    }
                } catch (e) {
                    console.warn(`[Certificate Upload] Could not parse issueDate "${cert.issueDate}":`, e.message);
                }
            } else {
                console.log('[Certificate Upload] No issueDate provided, using current date');
            }
            
            return {
                issueYear,
                issueDate
            };
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

        // Validate certificate object before saving
        console.log('[Certificate Upload] Certificate object to be saved:', {
            title: newCert.title,
            issuer: newCert.issuer,
            issueYear: newCert.issueYear + ' (type: ' + typeof newCert.issueYear + ')',
            issueDate: newCert.issueDate?.toISOString(),
            skillsCount: newCert.skills.length,
            masteredSkillsCount: newCert.masteredSkills.length
        });

        // Verify issueYear is actually a number and not NaN
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

        // Validate the entire user record before saving
        console.log('[Certificate Upload] Validating user profile before saving...');
        await userProfile.validate();
        console.log('[Certificate Upload] User profile validation passed, saving...');
        await userProfile.save();

        // Log the completedSkills for verification
        console.log('[Certificate Upload] Newly mastered skills saved to completedSkills:');
        newlyMasteredSkills.forEach(skill => {
            const skillRecord = userProfile.profile.completedSkills.find(s => s.skill.toLowerCase() === skill.toLowerCase());
            if (skillRecord) {
                console.log(`  ✓ ${skill}: score=${skillRecord.score}, masteredAt=${skillRecord.masteredAt}, source=certificate`);
            }
        });

        // Get updated resume data with newly mastered skills
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

        // Handle MongoDB validation errors (e.g., invalid issueYear)
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
        
        // Handle Groq API authentication errors
        if (error.status === 401 || error.code === 'GROQ_AUTH_FAILED') {
            return res.status(503).json({ 
                error: 'AI service authentication failed. Please contact support.',
                code: 'AI_AUTH_ERROR'
            });
        }
        
        // Handle file system errors (PDF not saved/readable)
        if (error.code === 'ENOENT' || error.code === 'EACCES') {
            return res.status(500).json({
                error: 'Failed to save certificate file. Please try uploading again.',
                code: 'FILE_ERROR'
            });
        }
        
        // Default error response
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
