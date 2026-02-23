import Cerebras from '@cerebras/cerebras_cloud_sdk'

/**
 * Analyzes a README (or any project description text) and returns structured
 * project information using the Cerebras llama-3.3-70b model.
 *
 * Used EXCLUSIVELY in the Project Dashboard module.
 *
 * @param {string} readmeText - Raw README or project description text
 * @returns {Promise<{
 *   projectName: string,
 *   summary: string,
 *   techStack: string[],
 *   keyFeatures: string[],
 *   skillsExtracted: string[]
 * }>}
 */
export async function analyzeReadme(readmeText) {
  const client = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY })
  if (!readmeText || typeof readmeText !== 'string' || readmeText.trim().length === 0) {
    throw new Error('analyzeReadme: readmeText must be a non-empty string')
  }

  const prompt = `You are an expert software engineer and technical analyst. Analyze the following project README and extract structured information from it.

README TEXT:
---
${readmeText.slice(0, 8000)}
---

Return a JSON object with EXACTLY this shape and nothing else:
{
  "projectName": "The name of the project (string)",
  "summary": "2-3 sentences describing what the project does and its main purpose (string)",
  "techStack": ["All technologies, languages, frameworks, libraries, and tools mentioned or implied (array of strings)"],
  "keyFeatures": ["3-5 bullet points describing the main features or capabilities of the project (array of strings)"],
  "skillsExtracted": ["Flat list of all technical skills found, normalized to their common canonical names (array of strings)"]
}

NORMALIZATION RULES for skillsExtracted:
- Use "React" not "ReactJS" or "React.js"
- Use "Node.js" not "NodeJS" or "node"
- Use "TypeScript" not "TS"
- Use "JavaScript" not "JS"
- Use "PostgreSQL" not "Postgres" or "psql"
- Use "MongoDB" not "Mongo"
- Use "Express.js" not "ExpressJS"
- Use "Next.js" not "NextJS"
- Use "Tailwind CSS" not "TailwindCSS"
- Remove duplicates

Return ONLY the JSON object. No markdown, no explanation, no extra text.`

  let rawContent
  try {
    const response = await client.chat.completions.create({
      model: 'llama3.1-8b',
      messages: [
        {
          role: 'system',
          content: 'You are a technical analyst. You only output valid JSON with no markdown formatting or extra text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    })

    rawContent = response.choices[0]?.message?.content

    if (!rawContent) {
      throw new Error('Cerebras returned an empty response')
    }
  } catch (err) {
    throw new Error(`analyzeReadme: ${err.message}`)
  }

  // Parse JSON
  let parsed
  try {
    parsed = JSON.parse(rawContent)
  } catch (e) {
    throw new Error(`analyzeReadme: Failed to parse Cerebras JSON response — ${e.message}`)
  }

  // Validate expected shape
  const requiredKeys = ['projectName', 'summary', 'techStack', 'keyFeatures', 'skillsExtracted']
  const missingKeys = requiredKeys.filter(key => !(key in parsed))
  if (missingKeys.length > 0) {
    throw new Error(`analyzeReadme: Cerebras response is missing required fields: ${missingKeys.join(', ')}`)
  }

  // Defensive type guards
  return {
    projectName: String(parsed.projectName || ''),
    summary: String(parsed.summary || ''),
    techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
    keyFeatures: Array.isArray(parsed.keyFeatures) ? parsed.keyFeatures : [],
    skillsExtracted: Array.isArray(parsed.skillsExtracted) ? parsed.skillsExtracted : []
  }
}
