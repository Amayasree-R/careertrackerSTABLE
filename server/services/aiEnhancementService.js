import Groq from 'groq-sdk'

let groqInstance = null
const getGroqClient = () => {
    if (!groqInstance) {
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            throw new Error('GROQ_API_KEY is missing in .env file')
        }
        groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY })
    }
    return groqInstance
}

/**
 * Generates a professional summary based on user profile and mastered skills.
 */
export async function generateProfessionalSummary(userData) {
    const { fullName, profile, careerInfo, careerStatus } = userData
    const masteredSkills = profile.completedSkills.map(s => s.skill).join(', ')

    const role = careerInfo?.targetJobRole || profile.targetJob || 'Software Developer'
    const expLevel = profile.experienceLevel || 'Entry'
    const status = careerStatus || 'Professional'

    const prompt = `You are a professional resume writer. Create a compelling 3-4 line professional summary for the following person:
  Name: ${fullName}
  Target Role: ${role}
  Experience Level: ${expLevel} (${status})
  Mastered Skills: ${masteredSkills}
  
  Tone should be professional and match the experience level. Return ONLY the summary text, no extra conversational text.`

    try {
        const groq = getGroqClient()
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
        })
        return completion.choices[0].message.content.trim()
    } catch (error) {
        console.error('AI Summary Generation Error:', error)
        return `Results-driven ${role} with expertise in ${masteredSkills}. Dedicated to building scalable solutions and delivering high-quality results.`
    }
}

/**
 * Enhances a responsibility statement into a STAR-format achievement.
 */
export async function enhanceAchievement(rawText, targetRole) {
    const prompt = `Convert the following resume responsibility into a high-impact achievement using the STAR method (Situation, Task, Action, Result). 
  Add quantified metrics (e.g., percentages, timelines, team size) where plausible to make it more professional.
  Target Role: ${targetRole || 'Software Engineer'}
  Raw Text: "${rawText}"
  
  Format: One single high-impact bullet point starting with a strong action verb.
  Return 3 variations in a JSON array format.
  Example Return: ["Managed a team of 5 to deliver X...", "Successfully led X initiative...", "Optimized X by 40%..."]`

    try {
        const groq = getGroqClient()
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' }
        })
        const result = JSON.parse(completion.choices[0].message.content)
        return Array.isArray(result) ? result : Object.values(result)[0]
    } catch (error) {
        console.error('AI Achievement Enhancement Error:', error)
        return [rawText]
    }
}

/**
 * Generates project descriptions from GitHub data.
 */
export async function generateProjectDescription(repoName, repoDescription, repoLanguages) {
    const prompt = `Create a professional one-line resume project description for:
  Project Name: ${repoName}
  Initial Description: ${repoDescription || 'A programming project'}
  Languages Used: ${repoLanguages.join(', ')}
  
  Format: "Built [project name] using [major tech], achieving [impact/result]."
  Return ONLY the one-line description.`

    try {
        const groq = getGroqClient()
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
        })
        return completion.choices[0].message.content.trim()
    } catch (error) {
        console.error('AI Project Description Error:', error)
        return `Developed ${repoName} using ${repoLanguages.slice(0, 3).join(', ')}.`
    }
}
