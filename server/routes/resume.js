/**
 * Resume Routes
 * Handles resume uploads, parsing, and analysis
 */

import express from 'express'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import {
  uploadAndParseResume,
  analyzeResume,
  getResumeData,
  updateResumeData,
  deleteResume,
  getSkillAnalysis,
  generateResumeData,
  enhanceResumeText,
  exportResume,
  getResumeVersions,
  saveResumeVersion
} from '../controllers/resumeController.js'
import { getAggregatedResumeData } from '../services/resumeGeneratorService.js'
import Groq from 'groq-sdk'
import User from '../models/User.js'
import Certificate from '../models/Certificate.js'

const router = express.Router()

// Middleware to verify token and attach user
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      console.warn(`Auth Failed: User ${decoded.userId} not found in DB`)
      return res.status(401).json({ error: 'User not found or account deactivated.' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth Middleware Verification Error:', error.message)
    // Detailed error logging to help identify why the token is failing
    const errorDetail = error.name === 'TokenExpiredError' ? 'Token expired' : error.message
    res.status(401).json({ error: `Authentication failed: ${errorDetail}` })
  }
}

// Configure multer for file uploads
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed'), false)
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

// Routes
/**
 * Upload and parse resume
 * POST /api/resume/upload
 * File: PDF file
 */
router.post('/upload', authMiddleware, (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 5MB limit' })
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` })
    } else if (err) {
      return res.status(400).json({ error: err.message })
    }
    next()
  })
}, uploadAndParseResume)

/**
 * Analyze resume and perform skill gap analysis
 * POST /api/resume/analyze
 */
router.post('/analyze', authMiddleware, analyzeResume)

// --- AI Resume Generator Endpoints ---
// IMPORTANT: All specific named routes MUST come before wildcard routes like /:userId

/**
 * Get all data needed for resume builder
 * GET /api/resume/data
 */
router.get('/data', authMiddleware, async (req, res) => {
  try {
    // CRITICAL: Fetch full user object and their certificates
    const user = await User.findById(req.user._id).lean()
    const certificates = await Certificate.find({ userId: req.user._id }).lean()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const data = getAggregatedResumeData(user, certificates)
    res.json(data)
  } catch (error) {
    console.error('Resume Data API Error:', error)
    res.status(500).json({ error: 'Failed to aggregate resume data' })
  }
})

/**
 * Generate resume data from user profile
 * POST /api/resume/generate
 */
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    // CRITICAL: Fetch full user object and their certificates
    const user = await User.findById(req.user._id).lean()
    const certificates = await Certificate.find({ userId: req.user._id }).lean()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userData = getAggregatedResumeData(user, certificates)

    // Debug: Log full userData BEFORE sending to Groq
    console.log('📤 Sending to Groq AI:', JSON.stringify(userData, null, 2))

    // 1. Initialize Groq
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'Groq API key not configured' })
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    // 2. Detect user profile type
    const { detectUserProfile } = await import('../services/resumeGeneratorService.js')
    const profile = detectUserProfile(userData)

    console.log(`👤 User Profile: ${profile.isStudent ? 'STUDENT/FRESHER' : 'PROFESSIONAL'}`)

    // 3. Construct Tailored Prompt based on profile
    let prompt = ''

    if (profile.isStudent) {
      // STUDENT/FRESHER PROMPT
      prompt = `
You are an expert ATS-optimized resume writer specializing in student and fresher resumes. Generate a high-impact, professional resume in JSON format for a student/fresher based on their data.

USER DATA:
${JSON.stringify(userData, null, 2)}

CRITICAL INSTRUCTIONS:
1. This is a STUDENT/FRESHER resume. The user has NO professional work experience.
2. NEVER fabricate or hallucinate work experience, companies, job titles, dates, or skills that are not present in the user data.
3. If a field has no data, return an empty array for it. Do NOT invent placeholder content.

CONTENT GUIDELINES:
1. Summary: Write a 3-4 sentence professional summary that:
   - Highlights their academic background and educational achievements
   - Emphasizes their passion for ${userData.targetJobRole}
   - Showcases their learning trajectory and skills they are mastering
   - Conveys ambition, growth mindset, and eagerness to contribute
   - DO NOT mention "years of experience" or fabricate work history

2. Education: Use the provided education data as-is. This is their strongest section.

3. Academic Highlights: Since they have no work experience, create an "academicHighlights" array with 2-3 items based on:
   - Academic projects (if any in projects array)
   - Relevant coursework related to ${userData.targetJobRole}
   - Academic achievements or competitions
   - If no data exists, return empty array - DO NOT fabricate

4. Skills: Categorize their 'knownSkills' and 'masteredSkills' into logical groups:
   - Emphasize what they are actively learning and have mastered
   - Group by: Programming Languages, Frameworks/Tools, Core Concepts, etc.
   - Return in 'skills' array with 'category' and 'items' (array of strings)

5. Mastered Skills: Return a flat list in 'masteredSkills' where each item is: { "name": "SkillName" }

6. Certificates: Include all certificates from the data to strengthen their profile

7. Projects: Include all projects from the data - these are crucial for freshers

8. Format: Return ONLY a valid JSON object. No conversational text.

EXPECTED JSON STRUCTURE:
{
  "summary": "string (student-focused, growth-oriented)",
  "education": [
    { "institution": "string", "degree": "string", "field": "string", "year": "string" }
  ],
  "academicHighlights": [
    { "title": "string", "description": "string" }
  ],
  "skills": [
    { "category": "category name", "items": ["skill 1", "skill 2"] }
  ],
  "masteredSkills": [
    { "name": "skill name" }
  ],
  "projects": [
    { "title": "string", "description": "string", "techStack": ["string"] }
  ],
  "certificates": [
    { "name": "string", "issuer": "string", "year": "string" }
  ]
}

TONE: Ambitious, growth-oriented, academic, emphasizing potential and learning capability.
      `
    } else {
      // PROFESSIONAL PROMPT
      prompt = `
You are an expert ATS-optimized resume writer. Generate a high-impact, professional resume in JSON format for an experienced professional based on their data.

USER DATA:
${JSON.stringify(userData, null, 2)}

CRITICAL SAFETY INSTRUCTIONS:
1. NEVER fabricate or hallucinate experience, companies, job titles, dates, or skills that are not present in the user data.
2. If a field has no data, return an empty array for it. Do NOT invent placeholder content.
3. Only use information explicitly provided in the USER DATA above.

CONTENT GUIDELINES:
1. Summary: Write a 3-4 sentence professional summary tailoring to the target role: ${userData.targetJobRole}
   - Highlight years of experience (if duration data is available)
   - Emphasize key achievements and expertise areas
   - Showcase value proposition for the target role

2. Contact Info: Include the user's phone (${userData.phoneNumber}), GitHub (${userData.github}), and LinkedIn (${userData.linkedin}) in your internal context to ensure the resume is complete.

3. Experience: For each experience entry, expand content into a professional 'description' string containing 3 high-impact STAR-method bullet points separated by newlines (\\n):
   - Situation/Task: What was the challenge or responsibility?
   - Action: What specific actions did they take?
   - Result: What measurable impact did they achieve?
   - Use action verbs, quantify achievements where possible
   - If the original description is already detailed, enhance it rather than replace it

4. Skills: Categorize 'knownSkills' and 'masteredSkills' into logical groups:
   - Group by: Programming Languages, Frameworks, Tools, Cloud/DevOps, Databases, etc.
   - Return them in the 'skills' array with 'category' and 'items' (array of strings)

5. Mastered Skills: Also return a flat list in 'masteredSkills' where each item is an object: { "name": "SkillName" }

6. Projects: Include all projects from the data, enhancing descriptions to highlight technical complexity and impact

7. Certificates: Include all certificates to demonstrate continuous learning

8. Format: Return ONLY a valid JSON object. No conversational text.

EXPECTED JSON STRUCTURE:
{
  "summary": "string",
  "education": [
    { "institution": "string", "degree": "string", "field": "string", "year": "string" }
  ],
  "experience": [
    { "company": "string", "role": "string", "duration": "string", "description": "bullet 1\\nbullet 2\\nbullet 3" }
  ],
  "skills": [
    { "category": "category name", "items": ["skill 1", "skill 2"] }
  ],
  "masteredSkills": [
    { "name": "skill name" }
  ],
  "projects": [
    { "title": "string", "description": "string", "techStack": ["string"] }
  ],
  "certificates": [
    { "name": "string", "issuer": "string", "year": "string" }
  ]
}

TONE: Results-driven, professional, achievement-focused, emphasizing measurable impact.
      `
    }

    // 4. Call Groq
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional resume generator. You only output valid JSON. You NEVER fabricate information not present in the user data.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    })

    const aiResponse = JSON.parse(completion.choices[0].message.content)

    // Debug: Log full Groq response AFTER parsing
    console.log('📥 Received from Groq AI:', JSON.stringify(aiResponse, null, 2))

    // 5. Return to frontend
    res.json({
      message: 'Resume generated successfully',
      resume: aiResponse,
      profileType: profile.isStudent ? 'student' : 'professional'
    })

  } catch (error) {
    console.error('AI Resume Generation Fatal Error:', error)
    res.status(500).json({ error: `Generation failed: ${error.message}` })
  }
})

/**
 * Enhance specific text using AI
 * POST /api/resume/enhance-text
 */
router.post('/enhance-text', authMiddleware, enhanceResumeText)

/**
 * Regenerate a specific section of the resume
 * POST /api/resume/regenerate-section
 */
router.post('/regenerate-section', authMiddleware, async (req, res) => {
  try {
    const { section, currentResumeData } = req.body

    if (!section) {
      return res.status(400).json({ error: 'Section name is required' })
    }

    // Fetch fresh user data and certificates
    const user = await User.findById(req.user._id).lean()
    const certificates = await Certificate.find({ userId: req.user._id }).lean()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userData = getAggregatedResumeData(user, certificates)
    const { detectUserProfile } = await import('../services/resumeGeneratorService.js')
    const profile = detectUserProfile(userData)

    // Initialize Groq
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'Groq API key not configured' })
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    console.log(`🔄 Regenerating section: ${section} for ${profile.isStudent ? 'STUDENT' : 'PROFESSIONAL'}`)

    // Build section-specific prompts
    let prompt = ''
    let systemMessage = 'You are a professional resume writer. Return ONLY valid JSON.'

    switch (section) {
      case 'summary':
        prompt = profile.isStudent ? `
Rewrite ONLY the professional summary for a student/fresher resume.

USER DATA:
${JSON.stringify(userData, null, 2)}

INSTRUCTIONS:
- Write a 3-4 sentence professional summary
- Highlight academic background and passion for ${userData.targetJobRole}
- Emphasize learning trajectory and growth mindset
- DO NOT mention work experience
- Return JSON: { "summary": "your new summary text" }
        ` : `
Rewrite ONLY the professional summary for an experienced professional.

USER DATA:
${JSON.stringify(userData, null, 2)}

INSTRUCTIONS:
- Write a 3-4 sentence professional summary for ${userData.targetJobRole}
- Highlight key achievements and expertise
- Emphasize value proposition
- Return JSON: { "summary": "your new summary text" }
        `
        break

      case 'skills':
        prompt = `
Re-categorize ONLY the skills section.

USER DATA:
Known Skills: ${JSON.stringify(userData.knownSkills)}
Mastered Skills: ${JSON.stringify(userData.masteredSkills)}

INSTRUCTIONS:
- Categorize skills into logical groups (Languages, Frameworks, Tools, etc.)
- Return JSON:
{
  "skills": [{ "category": "name", "items": ["skill1", "skill2"] }],
  "masteredSkills": [{ "name": "skill" }]
}
        `
        break

      case 'experience':
        if (profile.isStudent) {
          prompt = `
Generate ONLY academic highlights for a student resume.

USER DATA:
${JSON.stringify({ education: userData.education, projects: userData.projects }, null, 2)}

INSTRUCTIONS:
- Create 2-3 academic highlights based on projects or coursework
- If no data, return empty array
- DO NOT fabricate
- Return JSON: { "academicHighlights": [{ "title": "...", "description": "..." }] }
          `
        } else {
          prompt = `
Rewrite ONLY the experience section with STAR-method bullet points.

CURRENT EXPERIENCE:
${JSON.stringify(currentResumeData?.experience || userData.experience, null, 2)}

INSTRUCTIONS:
- For each entry, create 3 high-impact bullet points (Situation, Action, Result)
- Use action verbs and quantify achievements
- Return JSON: { "experience": [{ "company": "...", "role": "...", "duration": "...", "description": "bullet1\\nbullet2\\nbullet3" }] }
          `
        }
        break

      case 'certificates':
        prompt = `
Format ONLY the certificates section.

USER DATA:
${JSON.stringify(userData.certificates, null, 2)}

INSTRUCTIONS:
- Return certificates in clean format
- Return JSON: { "certificates": [{ "name": "...", "issuer": "...", "year": "..." }] }
        `
        break

      default:
        return res.status(400).json({ error: 'Invalid section name' })
    }

    // Call Groq
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    })

    const aiResponse = JSON.parse(completion.choices[0].message.content)
    console.log(`✅ Section regenerated:`, aiResponse)

    res.json({
      section,
      content: aiResponse
    })

  } catch (error) {
    console.error('Section Regeneration Error:', error)
    res.status(500).json({ error: `Failed to regenerate ${req.body.section}: ${error.message}` })
  }
})

/**
 * Export resume as PDF or DOCX
 * POST /api/resume/export/:format
 */
router.post('/export/:format', authMiddleware, exportResume)

/**
 * Get saved resume versions
 * GET /api/resume/versions
 */
router.get('/versions', authMiddleware, getResumeVersions)

/**
 * Save a new resume version
 * POST /api/resume/save-version
 */
router.post('/save-version', authMiddleware, saveResumeVersion)

// --- Wildcard Routes (MUST be last) ---

/**
 * Get parsed resume data
 * GET /api/resume/:userId
 */
router.get('/:userId', authMiddleware, getResumeData)

/**
 * Update resume data (manual editing)
 * PUT /api/resume/:userId
 * Body: { resumeData: object }
 */
router.put('/:userId', authMiddleware, updateResumeData)

/**
 * Delete resume
 * DELETE /api/resume/:userId
 */
router.delete('/:userId', authMiddleware, deleteResume)

/**
 * Get skill analysis results
 * GET /api/resume/:userId/analysis
 */
router.get('/:userId/analysis', authMiddleware, getSkillAnalysis)

export default router
