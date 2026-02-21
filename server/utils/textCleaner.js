/**
 * Text cleaning and normalization utilities
 * Used for processing extracted resume text
 */

/**
 * Remove extra whitespace and normalize line breaks
 */
export function normalizeWhitespace(text) {
  if (!text) return ''
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]+/g, ' ')
    .trim()
}

/**
 * Remove special characters and normalize text
 */
export function cleanText(text) {
  if (!text) return ''
  return text
    .replace(/[•\-\*→▪]/g, '') // Remove bullet points
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim()
}

/**
 * Split text into lines and filter empty ones
 */
export function getCleanLines(text) {
  if (!text) return []
  return text
    .split('\n')
    .map(line => cleanText(line).trim())
    .filter(line => line.length > 0)
}

/**
 * Detect section headers in resume text
 * Returns array of {sectionName, startIndex}
 */
export function detectSections(text) {
  const sectionPatterns = {
    SKILLS: /^(technical\s+skills|skills|competencies|technologies|tools|expertise|technical\s+expertise|skils|skills\s+&\s+tools)/i,
    EXPERIENCE: /^(work\s+experience|professional\s+experience|experience|employment|work\s+history|experience\s+summary)/i,
    EDUCATION: /^(education|academic|qualification|university|degree|academic\s+background|educational\s+background)/i,
    PROJECTS: /^(projects|portfolio|publications|key\s+projects|personal\s+projects|academic\s+projects)/i,
    CERTIFICATIONS: /^(certifications|certificates|credentials|licenses|achievements|awards|certification)/i,
    SUMMARY: /^(summary|professional\s+summary|objective|about|profile|professional\s+profile)/i,
    DECLARATION: /^(declaration|official\s+declaration)/i,
    REFERENCES: /^(references|referees)/i,
    LANGUAGES: /^(languages|linguistic\s+skills)/i,
    INTERESTS: /^(interests|hobbies|activities|extracurricular\s+activities)/i
  }

  const lines = getCleanLines(text)
  const sections = {}

  lines.forEach((line, index) => {
    Object.entries(sectionPatterns).forEach(([sectionName, pattern]) => {
      if (pattern.test(line) && !sections[sectionName]) {
        sections[sectionName] = index
      }
    })
  })

  return sections
}

/**
 * Extract text between two section indices
 */
export function extractSection(lines, startIndex, endIndex = null) {
  const end = endIndex || lines.length
  return lines.slice(startIndex + 1, end).join('\n')
}

/**
 * Parse duration strings like "Jan 2020 - Dec 2021" or "2 years"
 */
export function parseDuration(text) {
  if (!text) return null

  const dateRangePattern = /([A-Za-z]+\s*\d{4}|present|current)\s*[-–]\s*([A-Za-z]+\s*\d{4}|present|current)/i
  const yearCountPattern = /(\d+)\s+(year|yr|month|mo)/i

  const dateMatch = text.match(dateRangePattern)
  if (dateMatch) return text

  const yearMatch = text.match(yearCountPattern)
  if (yearMatch) return text

  return text
}

/**
 * Extract email from text
 */
export function extractEmail(text) {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const matches = text.match(emailPattern)
  return matches ? matches[0] : null
}

/**
 * Extract phone numbers from text
 */
export function extractPhone(text) {
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
  const matches = text.match(phonePattern)
  return matches ? matches[0] : null
}

/**
 * Extract URLs from text
 */
export function extractUrls(text) {
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
  return text.match(urlPattern) || []
}
