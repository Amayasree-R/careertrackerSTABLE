/**
 * Project Skill Integration Service
 * 
 * Responsibilities:
 * - Compare skills extracted from projects with the user's current roadmap.
 * - Promote project-verified skills to "Mastered" status ONLY if they are relevant to the roadmap.
 */

/**
 * Normalizes a skill name for case-insensitive and whitespace-invariant comparison.
 * @param {string} skill 
 * @returns {string}
 */
const normalize = (skill) => (skill || '').toLowerCase().trim().replace(/[\s\-_.\/]/g, '');

/**
 * Processes skills extracted from a project and promotes relevant ones to Mastered.
 * 
 * @param {Object} user - The Mongoose user document
 * @param {string[]} extractedSkills - Skills found in the project README
 * @returns {Object} Result of the integration
 */
export const processProjectSkills = async (user, extractedSkills) => {
    if (!extractedSkills || !Array.isArray(extractedSkills) || extractedSkills.length === 0) {
        return { promoted: [], reason: 'No skills extracted from project' };
    }

    const roadmapData = user.profile?.roadmapCache?.data;
    if (!roadmapData) {
        return { promoted: [], reason: 'No active roadmap found for user' };
    }

    // 1. Build a set of all skills required in the roadmap (Missing + Already Mastered)
    // We include Mastered skills from roadmap to allow refreshing/updating if needed,
    // though the primary goal is helping with "Missing" skills.
    const roadmapSkills = [
        ...(roadmapData.missingSkills || []),
        ...(roadmapData.learningPath || []).map(item => item.skill)
    ];

    if (roadmapSkills.length === 0) {
        return { promoted: [], reason: 'Roadmap contains no specific skills' };
    }

    // Create a mapping of normalized name -> original roadmap name for restoration
    const roadmapNormalizedMap = new Map();
    roadmapSkills.forEach(s => {
        if (s) roadmapNormalizedMap.set(normalize(s), s);
    });

    // 2. Identify skills that exist in BOTH the project and the roadmap
    const skillsToPromote = [];
    extractedSkills.forEach(extracted => {
        const norm = normalize(extracted);
        if (roadmapNormalizedMap.has(norm)) {
            skillsToPromote.push(roadmapNormalizedMap.get(norm));
        }
    });

    if (skillsToPromote.length === 0) {
        return { promoted: [], reason: 'Extracted skills do not match roadmap requirements' };
    }

    // 3. Atomically update the user document
    const now = new Date();
    const promotedList = [];

    // Track existing completed skills to avoid duplicates
    const existingCompleted = new Set(user.profile.completedSkills.map(s => normalize(s.skill)));

    skillsToPromote.forEach(skillName => {
        const norm = normalize(skillName);
        
        // Only add if not already in completedSkills
        if (!existingCompleted.has(norm)) {
            user.profile.completedSkills.push({
                skill: skillName,
                score: 100, // Project verification counts as high competency
                masteredAt: now
            });
            promotedList.push(skillName);
            existingCompleted.add(norm); // Local update to avoid duplicates in same batch
        }

        // Always ensure it's removed from learningSkills
        user.profile.learningSkills = user.profile.learningSkills.filter(
            s => normalize(s) !== norm
        );

        // Update resumeData skills if not already present
        if (!user.resumeData) user.resumeData = { skills: [] };
        if (!Array.isArray(user.resumeData.skills)) user.resumeData.skills = [];
        
        const alreadyInResume = user.resumeData.skills.some(s => normalize(s) === norm);
        if (!alreadyInResume) {
            user.resumeData.skills.push(skillName);
        }
    });

    // Save changes
    if (promotedList.length > 0) {
        user.profile.lastProfileUpdate = now;
        await user.save();
    }

    return {
        promoted: promotedList,
        totalExtracted: extractedSkills.length,
        matchCount: skillsToPromote.length
    };
};
