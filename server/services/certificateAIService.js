import Groq from 'groq-sdk'

let groqInstance = null
const getGroqClient = () => {
    if (!groqInstance) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing in .env file')
        }
        groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY })
    }
    return groqInstance
}

/**
 * Processes certificate text using Groq AI to extract structured metadata.
 * @param {string} text - The extracted text from the certificate.
 * @returns {Promise<object>} - Structured certificate data.
 */
export async function processCertificateText(text) {
    console.log('\n=== Processing Certificate with Groq AI ===')

    const prompt = `
You are a specialized AI for parsing professional certificates. 
Extract the following information from the provided text and return it as a clean JSON object.

Text:
"""
${text}
"""

JSON Structure:
{
  "skillName": "The primary skill or certification title",
  "issuerName": "The organization that issued the certificate (e.g., Coursera, Microsoft, Google)",
  "issueDate": "YYYY-MM-DD (convert if needed, e.g., 'October 2023' -> '2023-10-01')",
  "expiryDate": "YYYY-MM-DD (if mentioned, else null)",
  "confidenceScore": 0-100 (your confidence in these extractions)
}

Rules:
1. If the skill name isn't clear, use the most prominent technology or title mentioned.
2. If dates are missing, use null for that field.
3. Return ONLY the JSON object. No explanations or markdown.
`

    try {
        const groq = getGroqClient()
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' },
            temperature: 0.1
        })

        const result = chatCompletion.choices[0].message.content
        return JSON.parse(result)
    } catch (error) {
        console.error('Groq AI Processing Error:', error)
        throw new Error('Failed to process certificate content with AI')
    }
}

/**
 * Uses Groq to find the closest match between an extracted skill and a list of roadmap skills.
 * @param {string} extractedSkill - The skill name from the certificate.
 * @param {Array<string>} roadmapSkills - List of skill names from the user's roadmap.
 * @returns {Promise<object|null>} - { matchedSkill: string|null, confidence: number }
 */
export async function findClosestRoadmapMatch(extractedSkill, roadmapSkills) {
    if (!roadmapSkills || roadmapSkills.length === 0) return { matchedSkill: null, confidence: 0 }

    const prompt = `
You are a strict technical skill matcher. Java and JavaScript are completely different languages. Never match skills across different programming language ecosystems. Return null if uncertain.

Match the extracted skill "${extractedSkill}" to the closest one in this list: [${roadmapSkills.map(s => `"${s}"`).join(', ')}]

Rules:
1. Java != JavaScript, Node.js, Express.js, React. These are completely different language ecosystems.
2. Only match if technology is genuinely identical or a direct alias (e.g., "React.js" = "React" is acceptable).
3. Return a JSON object with:
   - "matchedSkill": The exact string from the list, or null if no genuine match.
   - "confidence": A score from 0-100 reflecting the certainty of the match. Only use 80+ if match is genuinely certain. If skill names are from different ecosystems, confidence must be 0.

Response Format:
{
  "matchedSkill": string | null,
  "confidence": number
}
`

    try {
        const groq = getGroqClient()
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' },
            temperature: 0
        })

        const result = JSON.parse(chatCompletion.choices[0].message.content)

        console.log(`[AI Matcher] Extracted: "${extractedSkill}" | Result:`, result)

        return {
            matchedSkill: result.matchedSkill || null,
            confidence: result.confidence || 0
        }
    } catch (error) {
        console.error('Skill Matching Error:', error)
        return { matchedSkill: null, confidence: 0 }
    }
}
