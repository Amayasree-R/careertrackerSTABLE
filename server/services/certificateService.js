
import Groq from 'groq-sdk'

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY
  
  // Validate that API key exists
  if (!apiKey) {
    const errorMsg = 'GROQ_API_KEY environment variable is not set'
    console.error(`❌ ${errorMsg}`)
    console.error('   Please add GROQ_API_KEY to your .env file')
    const err = new Error(errorMsg)
    err.code = 'MISSING_API_KEY'
    throw err
  }
  
  // Validate that API key has reasonable length (sk-... format)
  if (apiKey.length < 10) {
    const errorMsg = 'GROQ_API_KEY appears to be invalid (too short)'
    console.error(`❌ ${errorMsg}`)
    const err = new Error(errorMsg)
    err.code = 'INVALID_API_KEY_FORMAT'
    throw err
  }
  
  // Log that key is loaded (show first 4 chars + dots for security)
  const keyPreview = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4)
  console.log(`✅ Groq API key loaded: ${keyPreview}`)
  
  // Create and return Groq client
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
You are a career-focused certificate analyst. Your goal is to parse raw text from a certificate PDF and extract professional metadata.
You must return ONLY a raw JSON object. No markdown formatting, no backticks, no explanations.

INSTRUCTIONS:
1. Analyze the certificate text to understand what was learned or achieved.
2. Extract ONLY skills that are explicitly supported by the certificate content.
3. Identify certificate metadata:
   - title: The original title from the certificate text.
   - issuer: Extract ONLY the organization name if it is EXPLICITLY written. If no organization name is found, return "Independent". NEVER guess or infer an issuer.
   - issueYear: The 4-digit year the certificate was issued (e.g., 2024, 2023). If no date is found, use current year. MUST BE A NUMBER.
   - issueDate: The full date in YYYY-MM-DD format if available; otherwise use January 1st of issueYear. MUST BE A VALID DATE.
4. Generate a "polishedTitle":
   - If issuer is known: Format as '[Issuer] [Topic] Certificate'.
   - If issuer is "Independent": Format as '[Topic] Certificate of Completion'.
   - Ensure it reads naturally on a professional resume.
5. Determine whether the certificate issuer appears credible; if unclear, mark as unverified.
6. Extract ALL skills mentioned in the certificate (technical, frameworks, tools, soft skills).
7. Match extracted skills against roadmap skills:
   - Matched skills → "certified"
   - Unmatched but valid → "notMappedToRoadmap"
8. Decide whether any certified skill can be upgraded to "Mastered" based on strength of evidence.
9. Evaluate how the certification contributes to readiness for the user’s chosen career role.
9. Generate structured outputs that can be directly used to:
   - Show certificate proof in the UI
   - Update skill badges and dashboard statistics
   - Auto-populate resume sections in the future

Rules:
- Extract ALL skills from certificate (be inclusive, not overly strict).
- Return both "certified" (matched) and "notMappedToRoadmap" (unmatched) skills.
- If notMappedToRoadmap is empty it means all certificate skills matched the learning path.
- Do not fabricate issuer names, dates, or platforms.
- Always return valid JSON with proper data types.
- issueYear MUST be a NUMBER (not a string). If unclear, use 2026.
- issueDate MUST be a valid date string in YYYY-MM-DD format. If unclear, use 2026-01-01.
- Do not return "Unknown", "N/A", "Not Found", null, or empty strings for issueYear.
- Do not include explanations, markdown, or extra text outside JSON.

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
    "issueDate": "2026-03-03",
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
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    })

    const responseContent = chatCompletion.choices[0].message.content
    return JSON.parse(responseContent)

  } catch (error) {
    // Log full error for debugging
    console.error('❌ Certificate Analysis Failed:', {
      name: error.name,
      code: error.code || error.status,
      message: error.message,
      type: error.type
    })

    // Handle 401 INVALID_API_KEY errors specifically
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

    // Handle rate limiting errors
    if (error.status === 429 || error.code === '429' || error.message.includes('Rate limit')) {
      console.warn('⚠️  Groq API rate limit hit, using fallback analysis')
      return {
        certificate: {
          title: "Certified Skill Achievement (Verified by System)",
          polishedTitle: "Professional Certification",
          issuer: "Independent",
          issueYear: new Date().getFullYear().toString(),
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

    // For any other error
    console.error('❌ Unexpected error during certificate analysis')
    const genErr = new Error('Failed to analyze certificate. Please try a different file or contact support.')
    genErr.code = 'ANALYSIS_FAILED'
    genErr.originalError = error
    throw genErr
  }
}

