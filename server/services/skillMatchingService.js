
import Groq from 'groq-sdk';

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is missing');
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

/**
 * matches an extracted skill against a list of target skills using strict rules.
 */
export const matchSkillStrictly = async (extractedSkill, targetSkills) => {
    try {
        const groq = getGroqClient();

        const systemPrompt = `
You are a strict technical skill validator. Your job is to determine if an "Extracted Skill" from a certificate matches any skill in the user's "Target Skills" list.

STRICT RULES:
1. Java is NOT JavaScript. They are different ecosystems. No match.
2. Node.js is NOT Express.js. They are different. No match.
3. React.js matches React. Alias matching is allowed for same technology.
4. Only match if it is the EXACT same technology or a well-known alias.
5. Confidence must be 75% or higher to return a match.

INPUT:
Extracted Skill: "${extractedSkill}"
Target Skills: ${JSON.stringify(targetSkills)}

OUTPUT FORMAT (JSON ONLY):
{
  "matchFound": boolean,
  "matchedSkill": "The string from the Target Skills list that matched",
  "confidence": number (0-100),
  "reasoning": "brief explanation"
}

If no match meets the 75% confidence threshold, return matchFound: false and matchedSkill: null.
`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: systemPrompt }],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(completion.choices[0].message.content);

        if (result.matchFound && result.confidence >= 75) {
            return result;
        }

        return { matchFound: false, matchedSkill: null, confidence: result.confidence || 0 };

    } catch (error) {
        console.error('Skill Matching Failed:', error);
        return { matchFound: false, matchedSkill: null, error: error.message };
    }
};
