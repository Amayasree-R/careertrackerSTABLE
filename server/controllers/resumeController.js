/**
 * Resume Controller
 * Handles resume upload, parsing, and analysis requests
 */

import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import User from '../models/User.js'
import resumeParserService from '../services/resumeParserService.js'
import resumeAnalyzerService from '../services/resumeAnalyzerService.js'
import * as resumeGeneratorService from '../services/resumeGeneratorService.js'
import * as aiEnhancementService from '../services/aiEnhancementService.js'
import * as exportService from '../services/exportService.js'

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure temp upload directory - relative to server root
const UPLOAD_DIR = path.join(__dirname, '../../uploads/resumes')

// Ensure upload directory exists
try {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
} catch (err) {
  console.error('Failed to create upload directory:', err)
}

/**
 * Upload and parse resume
 * POST /api/resume/upload
 */
export async function uploadAndParseResume(req, res) {
  try {
    const user = req.user // Attached by authMiddleware
    const file = req.file

    console.log('--- Resume Upload Started ---')
    console.log('User ID:', user?._id)
    console.log('File:', file ? {
      name: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    } : 'No file')

    // 1. Strict Validation
    if (!user) {
      return res.status(401).json({ error: 'User authentication context missing' })
    }

    if (!file) {
      return res.status(400).json({ error: 'No resume file uploaded. Please select a valid PDF.' })
    }

    if (!mongoose.Types.ObjectId.isValid(user._id)) {
      console.error('Invalid User ID format:', user._id)
      return res.status(400).json({ error: 'Invalid user account identifier' })
    }

    // 2. Ensure Directory Exists (Defensive)
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true })
    } catch (dirErr) {
      console.error('Failed to ensure upload directory:', dirErr.message)
      return res.status(500).json({ error: 'Server filesystem error' })
    }

    // 3. Save uploaded file
    const filename = `${user._id}-${Date.now()}.pdf`
    const filePath = path.join(UPLOAD_DIR, filename)

    try {
      await fs.writeFile(filePath, file.buffer)
    } catch (writeErr) {
      console.error('File write error:', writeErr.message)
      return res.status(500).json({ error: 'Failed to save resume file' })
    }

    // 4. Extract and parse resume
    console.log('Parsing resume text...')
    let parsedData
    try {
      const extractedText = await resumeParserService.extractTextFromPdf(filePath)
      parsedData = await resumeParserService.parseResumeText(extractedText)
    } catch (parseErr) {
      console.error('Parser service error:', parseErr.message)
      return res.status(500).json({ error: `Parsing failed: ${parseErr.message}` })
    }

    // 5. Update user with resume data
    user.resumeFile = {
      filename,
      uploadedAt: new Date(),
      filePath: `/uploads/resumes/${filename}`
    }

    user.resumeData = {
      ...parsedData,
      parsedAt: new Date()
    }

    await user.save()

    console.log('--- Resume Upload Success ---')
    return res.status(200).json({
      message: 'Resume uploaded and parsed successfully',
      resumeData: user.resumeData,
      email: parsedData.email,
      phone: parsedData.phone
    })
  } catch (error) {
    console.error('--- Resume Upload Fatal Error ---')
    console.error(error)
    return res.status(500).json({ error: 'An unexpected error occurred during resume processing' })
  }
}

/**
 * Analyze resume and perform skill gap analysis
 * POST /api/resume/analyze
 */
export async function analyzeResume(req, res) {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.resumeData || !user.resumeData.skills || user.resumeData.skills.length === 0) {
      return res.status(400).json({ error: 'No resume data found. Please upload a resume first.' })
    }

    if (!user.careerInfo?.targetJobRole) {
      return res.status(400).json({ error: 'Target job role not set. Please update your profile.' })
    }

    // Initialize GitHub API if token is available
    if (process.env.GITHUB_TOKEN) {
      resumeAnalyzerService.initGithubClient(process.env.GITHUB_TOKEN)
    }

    // Perform skill gap analysis
    const analysis = await resumeAnalyzerService.analyzeSkillGap(
      user.resumeData.skills,
      user.careerInfo.targetJobRole
    )

    // Get learning recommendations
    const recommendations = resumeAnalyzerService.getLearningRecommendations(analysis)

    // Generate roadmap
    const roadmap = resumeAnalyzerService.generateRoadmap(analysis)

    // Update user with analysis results
    user.skillAnalysis = {
      matchingSkills: analysis.matchingSkills,
      missingSkills: analysis.missingSkills,
      suggestedSkills: analysis.suggestedSkills,
      industryDemandSkills: analysis.industryDemandSkills,
      analysisDate: new Date()
    }

    await user.save()

    return res.status(200).json({
      message: 'Skill gap analysis completed',
      analysis: {
        matchPercentage: analysis.matchPercentage,
        matchingSkills: analysis.matchingSkills,
        missingSkills: analysis.missingSkills.slice(0, 10),
        allMissingSkills: analysis.missingSkills,
        industryDemandSkills: analysis.industryDemandSkills
      },
      recommendations,
      roadmap
    })
  } catch (error) {
    console.error('Resume analysis error:', error)
    return res.status(500).json({ error: error.message || 'Failed to analyze resume' })
  }
}

/**
 * Get parsed resume data
 * GET /api/resume/:userId
 */
export async function getResumeData(req, res) {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.resumeData) {
      return res.status(404).json({ error: 'No resume data found' })
    }

    return res.status(200).json({
      resumeData: user.resumeData,
      resumeFile: user.resumeFile,
      skillAnalysis: user.skillAnalysis
    })
  } catch (error) {
    console.error('Get resume error:', error)
    return res.status(500).json({ error: error.message || 'Failed to retrieve resume' })
  }
}

/**
 * Update resume data (manual editing)
 * PUT /api/resume/:userId
 */
export async function updateResumeData(req, res) {
  try {
    const { userId } = req.params
    const { resumeData } = req.body

    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update only allowed fields
    const allowedFields = ['skills', 'tools', 'projects', 'experience', 'education', 'certifications']

    allowedFields.forEach(field => {
      if (resumeData[field] !== undefined) {
        user.resumeData[field] = resumeData[field]
      }
    })

    user.resumeData.parsedAt = new Date()
    await user.save()

    return res.status(200).json({
      message: 'Resume data updated successfully',
      resumeData: user.resumeData
    })
  } catch (error) {
    console.error('Update resume error:', error)
    return res.status(500).json({ error: error.message || 'Failed to update resume' })
  }
}

/**
 * Delete resume data
 * DELETE /api/resume/:userId
 */
export async function deleteResume(req, res) {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Delete uploaded file if exists
    if (user.resumeFile && user.resumeFile.filePath) {
      try {
        const filePath = path.join(UPLOAD_DIR, user.resumeFile.filename)
        await fs.unlink(filePath)
      } catch (err) {
        console.log('Could not delete file:', err.message)
      }
    }

    // Clear resume data from user
    user.resumeFile = null
    user.resumeData = {}
    user.skillAnalysis = {}

    await user.save()

    return res.status(200).json({
      message: 'Resume data deleted successfully'
    })
  } catch (error) {
    console.error('Delete resume error:', error)
    return res.status(500).json({ error: error.message || 'Failed to delete resume' })
  }
}

/**
 * Get skill analysis results
 * GET /api/resume/:userId/analysis
 */
export async function getSkillAnalysis(req, res) {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.skillAnalysis || !user.skillAnalysis.matchingSkills) {
      return res.status(404).json({ error: 'No skill analysis found. Run analysis first.' })
    }

    const recommendations = resumeAnalyzerService.getLearningRecommendations(user.skillAnalysis)
    const roadmap = resumeAnalyzerService.generateRoadmap(user.skillAnalysis)

    return res.status(200).json({
      skillAnalysis: user.skillAnalysis,
      recommendations,
      roadmap
    })
  } catch (error) {
    console.error('Get skill analysis error:', error)
    return res.status(500).json({ error: error.message || 'Failed to retrieve analysis' })
  }
}

/**
 * Generate resume data
 */
export async function generateResumeData(req, res) {
  try {
    const { options } = req.body
    const data = await resumeGeneratorService.assembleResumeData(req.user, options)
    res.json(data)
  } catch (error) {
    console.error('Generate Resume Error:', error)
    res.status(500).json({ error: 'Failed to generate resume data' })
  }
}

/**
 * Enhance specific text
 */
export async function enhanceResumeText(req, res) {
  try {
    const { text, type, targetRole } = req.body
    let result
    if (type === 'summary') {
      result = await aiEnhancementService.generateProfessionalSummary(req.user)
    } else if (type === 'achievement') {
      result = await aiEnhancementService.enhanceAchievement(text, targetRole)
    } else {
      return res.status(400).json({ error: 'Invalid enhancement type' })
    }
    res.json({ result })
  } catch (error) {
    console.error('Enhance Text Error:', error)
    res.status(500).json({ error: 'Failed to enhance text' })
  }
}

/**
 * Export resume
 */
export async function exportResume(req, res) {
  try {
    const { format } = req.params
    const { resumeData, htmlContent } = req.body

    if (format === 'pdf') {
      let content = htmlContent
      if (!content && resumeData) {
        // Generate Professional Template HTML that matches the live preview exactly
        content = exportService.generateProfessionalHtml(resumeData)
      }

      if (!content) {
        return res.status(400).json({ error: 'HTML content or Resume Data required for PDF export' })
      }

      const pdfBuffer = await exportService.generatePdfFromHtml(content)
      res.contentType('application/pdf')
      res.send(pdfBuffer)
    } else if (format === 'docx') {
      const docxBuffer = await exportService.generateDocx(resumeData)
      res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      res.send(docxBuffer)
    } else {
      res.status(400).json({ error: 'Invalid export format' })
    }
  } catch (error) {
    console.error('Export Error:', error)
    res.status(500).json({ error: 'Failed to export resume' })
  }
}

/**
 * Get resume versions
 */
export async function getResumeVersions(req, res) {
  try {
    res.json({ versions: req.user.resumeVersions })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resume versions' })
  }
}

/**
 * Save resume version
 */
export async function saveResumeVersion(req, res) {
  try {
    const { versionName, template, targetRole, content } = req.body

    // Free tier check: Limit to 2 versions
    if (req.user.resumeVersions.length >= 2) {
      return res.status(403).json({ error: 'Free tier limit reached. Max 2 resume versions allowed. Upgrade to Pro for unlimited versions.' })
    }

    req.user.resumeVersions.push({
      versionName,
      template,
      targetRole,
      content,
      createdAt: new Date(),
      lastModified: new Date()
    })

    await req.user.save()
    res.json({ message: 'Resume version saved successfully', versions: req.user.resumeVersions })
  } catch (error) {
    console.error('Save Version Error:', error)
    res.status(500).json({ error: 'Failed to save resume version' })
  }
}
