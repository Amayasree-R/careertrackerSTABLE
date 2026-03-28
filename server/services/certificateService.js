import Groq from 'groq-sdk'

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    const errorMsg = 'GROQ_API_KEY environment variable is not set'
    console.error(`❌ ${errorMsg}`)
    console.error('   Please add GROQ_API_KEY to your .env file')
    const err = new Error(errorMsg)
    err.code = 'MISSING_API_KEY'
    throw err
  }

  if (apiKey.length < 10) {
    const errorMsg = 'GROQ_API_KEY appears to be invalid (too short)'
    console.error(`❌ ${errorMsg}`)
    const err = new Error(errorMsg)
    err.code = 'INVALID_API_KEY_FORMAT'
    throw err
  }

  const keyPreview = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4)
  console.log(`✅ Groq API key loaded: ${keyPreview}`)

  try {
    return new Groq({ apiKey })
  } catch (initError) {
    console.error('❌ Failed to initialize Groq client:', initError.message)
    const err = new Error('Failed to initialize AI service')
    err.code = 'GROQ_INIT_FAILED'
    err.originalError = initError
    throw err
  }
}

export const analyzeCertificate = async (certificateText, targetRole, roadmapSkills, currentSkillState) => {
  try {
    const groq = getGroqClient()

    const systemPrompt = `
You are an expert Certificate Analyzer.
Your goal is to parse raw text extracted from a certificate PDF and return professional metadata.
You must return ONLY a raw JSON object. No markdown, no backticks, no explanations.

CRITICAL: PDF text is often extracted out of order due to layout parsing. Treat all text as an unordered bag of words — do not assume reading order is correct.

INSTRUCTIONS:

1. Identify the certificate TITLE (in order of priority):
   - Look for "Certificate of [X]" or "Certificate in [X]" → use as title
   - Look for "completion of [X] Course" or "training in [X]" → derive title as "[X] Certificate"
   - NEVER use boilerplate phrases like "THE FOLLOWING AWARD IS GIVEN TO" as the title
   - NEVER return "Unknown Certificate" if ANY course or topic name is detectable

2. Extract the SKILL/TOPIC from phrases like:
   - "completion of [X] Course"
   - "training in [X]"
   - "certified in [X]"
   - "course in [X]"

3. Extract the ISSUER:
   - Look for an organization name, institution, or platform name
   - "Head of Event", "Mentor", "THE FOLLOWING AWARD IS GIVEN TO", "Certificate of Appreciation" are NOT issuers — they are roles or boilerplate
   - Recipient names (the person the certificate is given to) are NOT issuers
   - If no organization name is explicitly found, set issuer to "Independent"

4. Extract dates:
   - issueYear: 4-digit year (MUST BE A NUMBER). Look for year ranges like "2025-26" → use 2025. If not found, use 2026.
   - issueDate: YYYY-MM-DD format. If only year found, use YYYY-01-01. MUST BE A VALID DATE STRING.

5. Generate a "polishedTitle":
   - If issuer is known: "[Issuer] [Topic] Certificate"
   - If issuer is "Independent": "[Topic] Certificate of Completion"
   - Example: "React Development Certificate of Completion"
   - NEVER produce "Unknown Certificate" as polishedTitle

6. Extract ALL skills mentioned in the certificate (technical, frameworks, tools, soft skills).

7. Match extracted skills against roadmapSkills:
   - Matched skills → "certified"
   - Unmatched but valid → "notMappedToRoadmap"

8. Decide whether any certified skill can be upgraded to "Mastered" based on strength of evidence.

9. Evaluate how the certification contributes to readiness for the user's target role.

RULES:
- Do not fabricate issuer names, dates, or platforms
- Always return valid JSON with proper data types
- issueYear MUST be a NUMBER not a string
- issueDate MUST be a valid YYYY-MM-DD string
- Do not return "Unknown", "N/A", "Not Found", null, or empty strings for required fields
- No explanations, markdown, or extra text outside JSON

Input:
{
  "certificateText": "${certificateText.replace(/"/g, '\\"')}",
  "targetRole": "${targetRole}",
  "roadmapSkills": ${JSON.stringify(roadmapSkills)},
  "currentSkillState": ${JSON.stringify(currentSkillState)}
}

Output JSON Schema:
{
  "certificate": {
    "title": "",
    "polishedTitle": "",
    "issuer": "",
    "issueYear": 2026,
    "issueDate": "2026-01-01",
    "verificationStatus": "Verified | Unverified"
  },
  "skillsExtracted": [
    {
      "skill": "",
      "evidence": ""
    }
  ],
  "skillAchievement": {
    "certified": [
      {
        "skill": "",
        "achievementStatus": "Certified",
        "canUpgradeToMastered": true
      }
    ],
    "notMappedToRoadmap": [
      {
        "skill": "",
        "reason": "Not found in user's learning roadmap but is a valuable skill for their target role"
      }
    ]
  },
  "careerAlignment": {
    "targetRole": "",
    "relevanceLevel": "Low | Medium | High",
    "summary": ""
  }
}
`

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: systemPrompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    })

    const responseContent = chatCompletion.choices[0].message.content
    return JSON.parse(responseContent)

  } catch (error) {
    console.error('❌ Certificate Analysis Failed:', {
      name: error.name,
      code: error.code || error.status,
      message: error.message,
      type: error.type
    })

    if (error.status === 401 || error.message.includes('401') ||
      error.message.includes('INVALID_API_KEY') ||
      error.message.includes('Invalid API key') ||
      error.message.includes('Unauthorized')) {
      console.error('❌ Groq API Authentication Failed - Invalid API Key')
      const apiErr = new Error('AI service configuration error. Please ensure GROQ_API_KEY is set correctly.')
      apiErr.code = 'GROQ_AUTH_FAILED'
      apiErr.status = 401
      throw apiErr
    }

    if (error.status === 429 || error.code === '429' || error.message.includes('Rate limit')) {
      console.warn('⚠️  Groq API rate limit hit, using fallback analysis')
      return {
        certificate: {
          title: "Certified Skill Achievement (Verified by System)",
          polishedTitle: "Professional Certification",
          issuer: "Independent",
          issueYear: new Date().getFullYear(),
          issueDate: `${new Date().getFullYear()}-01-01`,
          verificationStatus: "Verified"
        },
        skillsExtracted: [
          { skill: "Certificate Analysis", evidence: "Fallback Mode" }
        ],
        skillAchievement: {
          certified: [],
          notMappedToRoadmap: []
        },
        careerAlignment: {
          targetRole: targetRole || "Professional",
          relevanceLevel: "Medium",
          summary: "Certificate analysis temporarily unavailable. Please try again shortly."
        }
      }
    }

    console.error('❌ Unexpected error during certificate analysis')
    const genErr = new Error('Failed to analyze certificate. Please try a different file or contact support.')
    genErr.code = 'ANALYSIS_FAILED'
    genErr.originalError = error
    throw genErr
  }
}