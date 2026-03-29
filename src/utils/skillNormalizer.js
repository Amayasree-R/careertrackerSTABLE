/**
 * Frontend version of Skill Normalization
 * Matches backend logic to ensure UI consistency
 */

/**
 * Normalize a skill name to standard form
 * Strips common suffixes like "Development", "Programming", etc.
 * @param {string} skill - Raw skill name
 * @returns {string} - Normalized skill name
 */
export function normalizeSkill(skill) {
  if (!skill) return ''

  let normalized = skill.toLowerCase().trim()
  
  // Blacklist of generic words that should never be skills
  const blacklist = [
    'development', 'completion', 'training', 'course', 
    'program', 'fundamentals', 'basics', 'advanced', 
    'independent', 'certification', 'award', 'achievement', 
    'studies', 'learning', 'education', 'professional',
    'certificate', 'certified', 'training', 'specialization'
  ]
  
  if (blacklist.includes(normalized)) return ''
  
  // Remove common suffixes
  const suffixes = [
    ' development', ' programming', ' fundamentals', 
    ' course', ' training', ' basics', ' essentials',
    ' bootcamp', ' masterclass', ' certification',
    ' developer', ' engineer'
  ]
  
  for (const suffix of suffixes) {
    if (normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length).trim()
    }
  }

  // Capitalize first letter for consistency
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

/**
 * Compare two skills using normalization
 * @param {string} s1 
 * @param {string} s2 
 * @returns {boolean}
 */
export function isSameSkill(s1, s2) {
  return normalizeSkill(s1) === normalizeSkill(s2)
}
