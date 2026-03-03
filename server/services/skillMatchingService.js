
import Groq from 'groq-sdk';

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is missing');
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * Normalizes a skill string for comparison
 * @param {string} skill 
 * @returns {string}
 */
const normalizeSkill = (skill) => {
    if (!skill) return "";
    return skill.toLowerCase()
        .replace(/\.js$/i, "")
        .replace(/js$/i, "")
        .replace(/\.ts$/i, "")
        .replace(/ts$/i, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();
};

const COMMON_ALIASES = {
    "react": ["reactjs", "react.js"],
    "node": ["nodejs", "node.js"],
    "js": ["javascript", "js", "ecmascript"],
    "ts": ["typescript", "ts"],
    "mongodb": ["mongo", "mongodb"],
    "github": ["git", "github"],
    "aws": ["amazon web services", "aws"]
};

/**
 * matches an extracted skill against a list of target skills using fuzzy rules.
 * Sync function - no longer needs Groq for basic matching.
 */
export const matchSkillFuzzy = (extractedSkill, targetSkills) => {
    if (!extractedSkill || !targetSkills || !Array.isArray(targetSkills)) {
        return { matchFound: false, matchedSkill: null };
    }

    const normExtracted = normalizeSkill(extractedSkill);

    for (const targetSkill of targetSkills) {
        const skillName = typeof targetSkill === 'string' ? targetSkill : (targetSkill.name || targetSkill.skill || "");
        if (!skillName) continue;

        const normTarget = normalizeSkill(skillName);

        // 1. Direct normalized match
        if (normExtracted === normTarget) {
            return { matchFound: true, matchedSkill: skillName };
        }

        // 2. Contains check (either way)
        if (normExtracted.length > 2 && normTarget.length > 2) {
            if (normExtracted.includes(normTarget) || normTarget.includes(normExtracted)) {
                return { matchFound: true, matchedSkill: skillName };
            }
        }

        // 3. Alias check
        for (const [canonical, aliases] of Object.entries(COMMON_ALIASES)) {
            const isExtractedAlias = (canonical === normExtracted || aliases.includes(normExtracted));
            const isTargetAlias = (canonical === normTarget || aliases.includes(normTarget));
            if (isExtractedAlias && isTargetAlias) {
                return { matchFound: true, matchedSkill: skillName };
            }
        }
    }

    return { matchFound: false, matchedSkill: null };
};

// Keep the old export name but point to new logic for backward compatibility if needed, 
// though we will update the controller.
export const matchSkillStrictly = async (extractedSkill, targetSkills) => {
    const result = matchSkillFuzzy(extractedSkill, targetSkills);
    return result;
};
