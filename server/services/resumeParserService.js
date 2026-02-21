/**
 * Resume Parser Service
 * Extracts text from PDF and parses sections to structured data
 */

import pdfParse from 'pdf-parse'
import {
  normalizeWhitespace,
  cleanText,
  getCleanLines,
  detectSections,
  extractSection,
  parseDuration,
  extractEmail,
  extractPhone,
  extractUrls
} from '../utils/textCleaner.js'
import { extractSkillsFromText, normalizeSkills } from '../utils/skillNormalizer.js'

class ResumeParserService {
  /**
   * Extract text from PDF file
   */
  async extractTextFromPdf(filePath) {
    try {
      const fs = await import('fs/promises')
      const pdfBuffer = await fs.readFile(filePath)
      const data = await pdfParse(pdfBuffer)
      const extractedText = data.text

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Insufficient text extracted from PDF')
      }

      return extractedText
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`)
    }
  }

  /**
   * Parse extracted text into structured resume data
   */
  async parseResumeText(rawText) {
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('No text content to parse')
    }

    const normalizedText = normalizeWhitespace(rawText)
    const lines = getCleanLines(normalizedText)

    // Detect sections
    const sectionIndices = detectSections(normalizedText)

    // Extract each section
    const parsed = {
      email: extractEmail(normalizedText),
      phone: extractPhone(normalizedText),
      urls: extractUrls(normalizedText),
      skills: this.parseSkills(lines, sectionIndices),
      tools: this.parseTools(lines, sectionIndices),
      experience: this.parseExperience(lines, sectionIndices),
      education: this.parseEducation(lines, sectionIndices),
      projects: this.parseProjects(lines, sectionIndices),
      certifications: this.parseCertifications(lines, sectionIndices),
      rawText: normalizedText
    }

    return parsed
  }

  /**
   * Parse skills section
   */
  parseSkills(lines, sectionIndices) {
    if (!sectionIndices.SKILLS) return []

    const startIdx = sectionIndices.SKILLS
    const sectionKeys = Object.keys(sectionIndices)
    const nextSectionStart = Math.min(
      ...Object.values(sectionIndices)
        .filter(idx => idx > startIdx),
      lines.length
    )

    const skillsSection = extractSection(lines, startIdx, nextSectionStart - 1)

    // Improved splitting: handles bullets, newlines, and various delimiters
    const rawSkills = skillsSection.split(/[\n,;•\-\|▪→\*]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 60)
      // Filter out common header words that might be captured
      .filter(s => !/^(technical\s+skills|skills|technologies|tools|competencies)$/i.test(s))

    return normalizeSkills(rawSkills)
  }

  /**
   * Parse tools/technologies
   */
  parseTools(lines, sectionIndices) {
    const tools = []
    const allText = lines.join(' ')

    // Enhanced patterns for tool extraction
    const toolsPatterns = [
      /(?:tools|technologies|software|platforms|frameworks|libraries|vcs|databases|os|ide|cloud)(?:\s+used)?:\s*([^\n.]+)/gi,
      /(?:proficient\s+in|familiar\s+with):\s*([^\n.]+)/gi
    ]

    toolsPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(allText)) !== null) {
        const toolsList = match[1]
          .split(/[,;|•]/)
          .map(t => t.trim())
          .filter(t => t.length > 1)
        tools.push(...toolsList)
      }
    })

    // Also extract skills from the entire text to ensure nothing is missed
    const extraSkills = extractSkillsFromText(allText)

    return normalizeSkills([...new Set([...tools, ...extraSkills])])
  }

  /**
   * Parse work experience section
   */
  parseExperience(lines, sectionIndices) {
    if (!sectionIndices.EXPERIENCE) return []

    const startIdx = sectionIndices.EXPERIENCE
    const nextSectionStart = Math.min(
      ...Object.values(sectionIndices)
        .filter(idx => idx > startIdx),
      lines.length
    )

    const experienceLines = lines.slice(startIdx + 1, nextSectionStart)
    const experiences = []
    let currentExp = null

    experienceLines.forEach((line, index) => {
      const cleanedLine = cleanText(line)
      if (!cleanedLine) return

      // Enhanced job title/company detection: 
      // Look for patterns like "Software Engineer | Google" or "Google - Software Engineer"
      const isHeader = (
        // Common job titles
        /(?:developer|engineer|specialist|manager|analyst|intern|lead|architect|consultant|trainee|designer)/i.test(cleanedLine) ||
        // Bullet patterns followed by caps
        /^[A-Z][a-zA-Z\s]+(?:\s*[,|\-–—]\s*[A-Z][a-zA-Z\s]+)+$/.test(cleanedLine)
      ) && cleanedLine.length > 5 && cleanedLine.length < 100

      // Date detection in the current or next line
      const containsDate = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{2}\/\d{4}|\d{4})\s*(?:-|–|—|to)\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{2}\/\d{4}|\d{4}|present|current|now)/i.test(cleanedLine)

      if (isHeader || (containsDate && !currentExp)) {
        if (currentExp && (currentExp.company || currentExp.role)) {
          experiences.push(currentExp)
        }

        currentExp = {
          company: '',
          role: '',
          duration: '',
          description: ''
        }

        // Try to split company and role
        const parts = cleanedLine.split(/[-–—|•,]/).map(p => p.trim())
        if (parts.length >= 2) {
          // Heuristic: Shorter or containing "Inc", "LLC", "Corp" is usually the company
          if (/(?:inc|llc|corp|co|ltd|pvt|solutions|systems|lab|university|tech|group)/i.test(parts[0])) {
            currentExp.company = parts[0]
            currentExp.role = parts[1]
          } else {
            currentExp.role = parts[0]
            currentExp.company = parts[1]
          }
        } else {
          currentExp.role = cleanedLine
        }

        if (containsDate) {
          currentExp.duration = parseDuration(cleanedLine)
        } else if (index + 1 < experienceLines.length) {
          const nextLine = cleanText(experienceLines[index + 1])
          if (/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current|\d{4})/i.test(nextLine)) {
            currentExp.duration = parseDuration(nextLine)
          }
        }
      } else if (currentExp) {
        // Handle descriptions and bullet points
        if (cleanedLine.length > 0) {
          currentExp.description += (currentExp.description ? ' ' : '') + cleanedLine
        }
      }
    })

    if (currentExp && (currentExp.company || currentExp.role)) {
      experiences.push(currentExp)
    }

    return experiences.map(exp => ({
      ...exp,
      description: exp.description.trim().replace(/\s+/g, ' ')
    }))
  }

  /**
   * Parse education section
   */
  parseEducation(lines, sectionIndices) {
    if (!sectionIndices.EDUCATION) return []

    const startIdx = sectionIndices.EDUCATION
    const nextSectionStart = Math.min(
      ...Object.values(sectionIndices)
        .filter(idx => idx > startIdx),
      lines.length
    )

    const educationLines = lines.slice(startIdx + 1, nextSectionStart)
    const educations = []
    let currentEdu = null

    educationLines.forEach(line => {
      const cleanedLine = cleanText(line)
      if (!cleanedLine) return

      const isInstitution = /university|college|institute|school|academy|polytechnic|vidyalaya|presidency/i.test(cleanedLine)
      const degreeMatch = cleanedLine.match(/\b(?:bachelor|master|ph\.?d|associate|diploma|b\.?s|m\.?s|b\.?e|m\.?e|b\.?tech|m\.?tech|mba|bba|hsc|ssc|cbse|icse)\b/i)

      if (isInstitution) {
        if (currentEdu) educations.push(currentEdu)
        currentEdu = {
          institution: cleanedLine,
          degree: '',
          field: '',
          year: null
        }
      } else if (degreeMatch) {
        if (!currentEdu) {
          currentEdu = { institution: 'Not Specified', degree: '', field: '', year: null }
        }
        currentEdu.degree = degreeMatch[0]
        const remaining = cleanedLine.replace(degreeMatch[0], '').trim()
        if (remaining) currentEdu.field = remaining.replace(/^[^a-zA-Z0-9]+/, '')
      }

      if (currentEdu) {
        const yearMatch = cleanedLine.match(/\b(20|19)\d{2}\b/)
        if (yearMatch) currentEdu.year = parseInt(yearMatch[0])
      }
    })

    if (currentEdu) educations.push(currentEdu)
    return educations.filter(edu => edu.institution || edu.degree)
  }

  /**
   * Parse projects section
   */
  parseProjects(lines, sectionIndices) {
    if (!sectionIndices.PROJECTS) return []

    const startIdx = sectionIndices.PROJECTS
    const nextSectionStart = Math.min(
      ...Object.values(sectionIndices)
        .filter(idx => idx > startIdx),
      lines.length
    )

    const projectLines = lines.slice(startIdx + 1, nextSectionStart)
    const projects = []
    let currentProject = null

    projectLines.forEach((line) => {
      const cleanedLine = cleanText(line)
      if (!cleanedLine) return

      // Heuristic for project header: Short title starts with capital, maybe has links or tech in parens
      const isHeader = /^[A-Z][a-zA-Z0-9\s&+]{2,30}(?:\s*\(.*?\))?$/.test(cleanedLine) ||
        /^(?:project|title):\s*(.+)/i.test(cleanedLine)

      if (isHeader) {
        if (currentProject) projects.push(currentProject)

        const title = cleanedLine.replace(/^(?:project|title):\s*/i, '').trim()
        currentProject = {
          title,
          description: '',
          techStack: []
        }

        // Try to extract tech from title
        const techMatch = cleanedLine.match(/\(([^)]+)\)/)
        if (techMatch) {
          currentProject.techStack = techMatch[1].split(/[,;]/).map(t => t.trim())
        }
      } else if (currentProject) {
        currentProject.description += (currentProject.description ? ' ' : '') + cleanedLine
        const autoSkills = extractSkillsFromText(cleanedLine)
        currentProject.techStack = [...new Set([...currentProject.techStack, ...autoSkills])]
      }
    })

    if (currentProject) projects.push(currentProject)
    return projects.filter(p => p.title && p.title.length > 2)
  }

  /**
   * Parse certifications section
   */
  parseCertifications(lines, sectionIndices) {
    if (!sectionIndices.CERTIFICATIONS) return []

    const startIdx = sectionIndices.CERTIFICATIONS
    const nextSectionStart = Math.min(
      ...Object.values(sectionIndices)
        .filter(idx => idx > startIdx),
      lines.length
    )

    const certLines = lines.slice(startIdx + 1, nextSectionStart)
    const certifications = []

    certLines.forEach(line => {
      const cleanedLine = cleanText(line)
      if (!cleanedLine || cleanedLine.length < 3) return

      // Skip lines that look like section headers (safety check)
      if (/^(declaration|references|languages|additional|summary|profile|about)/i.test(cleanedLine)) return

      // If the line contains commas but common cert keywords like "in" or "(" are present, 
      // it might be a single cert or a list. 
      // If it looks like a list: "Cert 1, Cert 2, Cert 3"
      if (cleanedLine.includes(',') && !cleanedLine.includes('(') && cleanedLine.split(',').length > 2) {
        const parts = cleanedLine.split(',').map(p => p.trim()).filter(p => p.length > 2)
        parts.forEach(part => {
          certifications.push({
            name: part,
            issuer: 'Not Specified',
            date: 'No Date'
          })
        })
      } else {
        const dateMatch = cleanedLine.match(/\b(?:20|19)\d{2}\b/)
        const issuerMatch = cleanedLine.match(/\(([^)]+)\)|–\s*([^,]+)|:\s*([^,]+)/)

        certifications.push({
          name: dateMatch ? cleanedLine.replace(dateMatch[0], '').trim() : cleanedLine,
          issuer: issuerMatch ? (issuerMatch[1] || issuerMatch[2] || issuerMatch[3]).trim() : 'Not Specified',
          date: dateMatch ? dateMatch[0] : 'No Date'
        })
      }
    })

    return certifications.filter(c => c.name && c.name.length > 2)
  }
}

export default new ResumeParserService()
