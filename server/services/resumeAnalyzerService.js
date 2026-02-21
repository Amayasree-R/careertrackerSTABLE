/**
 * Resume Analyzer Service
 * Performs skill gap analysis by comparing user skills with industry demands
 */

import axios from 'axios'
import { extractSkillsFromText, normalizeSkills, getAllKnownSkills } from '../utils/skillNormalizer.js'

class ResumeAnalyzerService {
  constructor() {
    this.octokit = null
    this.industrySkillCache = {}
  }

  /**
   * Initialize GitHub API client (requires GITHUB_TOKEN in env)
   */
  initGithubClient(githubToken) {
    if (githubToken) {
      // Store token for later use with axios
      this.githubToken = githubToken
    }
  }

  /**
   * Get industry-demanded skills for a specific job role
   * Uses GitHub API to find popular repositories related to the role
   */
  async getIndustrySkills(jobRole, limit = 50) {
    // Check cache first
    if (this.industrySkillCache[jobRole]) {
      return this.industrySkillCache[jobRole]
    }

    try {
      const skills = []
      const knownSkills = getAllKnownSkills()

      // Search GitHub for repositories matching the job role
      const searchQueries = this.generateSearchQueries(jobRole)

      for (const query of searchQueries) {
        try {
          const response = await axios.get('https://api.github.com/search/repositories', {
            params: {
              q: query,
              sort: 'stars',
              per_page: 30,
              order: 'desc'
            },
            headers: this.githubToken ? { Authorization: `token ${this.githubToken}` } : {}
          })

          if (response.data && response.data.items) {
            response.data.items.forEach(repo => {
              // Extract skills from repository topics
              if (repo.topics && Array.isArray(repo.topics)) {
                repo.topics.forEach(topic => {
                  const normalized = this.normalizeGithubTopic(topic)
                  if (knownSkills.includes(normalized)) {
                    skills.push(normalized)
                  }
                })
              }

              // Extract skills from repository language
              if (repo.language) {
                const normalized = this.normalizeGithubTopic(repo.language)
                if (knownSkills.includes(normalized)) {
                  skills.push(normalized)
                }
              }

              // Extract from description
              if (repo.description) {
                const descSkills = extractSkillsFromText(repo.description, knownSkills)
                skills.push(...descSkills)
              }
            })
          }
        } catch (err) {
          console.log(`Query "${query}" failed:`, err.message)
          continue
        }
      }

      // Deduplicate and sort by frequency
      const skillFrequency = {}
      skills.forEach(skill => {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1
      })

      const sortedSkills = Object.entries(skillFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([skill]) => skill)

      // Cache the results
      this.industrySkillCache[jobRole] = sortedSkills

      return sortedSkills
    } catch (error) {
      console.error('Error fetching industry skills:', error.message)
      // Return default skills if API fails
      return this.getDefaultSkillsForRole(jobRole)
    }
  }

  /**
   * Generate search queries based on job role
   */
  generateSearchQueries(jobRole) {
    const role = jobRole.toLowerCase()
    const queries = [
      `${role} project`,
      `${role} template`,
      role,
      `${role} boilerplate`,
      `${role} starter`
    ]
    return [...new Set(queries)].slice(0, 3)
  }

  /**
   * Normalize GitHub topics/languages
   */
  normalizeGithubTopic(topic) {
    if (!topic) return ''
    
    const normalizedMap = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'cs': 'C#',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'react': 'React',
      'vue': 'Vue',
      'angular': 'Angular',
      'express': 'Express',
      'django': 'Django',
      'spring': 'Spring',
      'aws': 'AWS',
      'gcp': 'GCP',
      'postgresql': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes'
    }

    const lower = topic.toLowerCase().trim()
    return normalizedMap[lower] || topic
  }

  /**
   * Get default industry skills for common roles (fallback)
   */
  getDefaultSkillsForRole(jobRole) {
    const roleSkillsMap = {
      'frontend developer': [
        'JavaScript', 'React', 'Vue', 'HTML', 'CSS', 'TypeScript',
        'Redux', 'Webpack', 'Babel', 'Jest', 'Git', 'REST'
      ],
      'backend developer': [
        'Python', 'Java', 'JavaScript', 'SQL', 'PostgreSQL', 'MongoDB',
        'Express', 'Django', 'Spring Boot', 'REST', 'Git', 'Docker'
      ],
      'full stack developer': [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB',
        'PostgreSQL', 'HTML', 'CSS', 'Git', 'Docker', 'REST'
      ],
      'devops engineer': [
        'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'AWS', 'Linux',
        'Terraform', 'Ansible', 'Git', 'Nginx', 'Python', 'Bash'
      ],
      'data scientist': [
        'Python', 'Machine Learning', 'Pandas', 'NumPy', 'Matplotlib',
        'scikit-learn', 'TensorFlow', 'SQL', 'Jupyter', 'R'
      ],
      'mobile developer': [
        'React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS',
        'JavaScript', 'Git', 'REST', 'Firebase'
      ]
    }

    return roleSkillsMap[jobRole.toLowerCase()] || []
  }

  /**
   * Perform skill gap analysis
   */
  async analyzeSkillGap(userSkills, jobRole) {
    if (!Array.isArray(userSkills)) {
      throw new Error('User skills must be an array')
    }

    if (!jobRole || typeof jobRole !== 'string') {
      throw new Error('Job role must be specified')
    }

    try {
      // Get normalized user skills
      const normalizedUserSkills = normalizeSkills(userSkills)

      // Get industry-demanded skills for the role
      const industrySkills = await this.getIndustrySkills(jobRole)

      // Calculate overlap
      const matchingSkills = normalizedUserSkills.filter(skill =>
        industrySkills.some(indSkill => this.skillMatch(skill, indSkill))
      )

      // Skills the user is missing
      const missingSkills = industrySkills.filter(skill =>
        !normalizedUserSkills.some(userSkill => this.skillMatch(userSkill, skill))
      )

      // Suggested skills (top missing skills)
      const suggestedSkills = missingSkills.slice(0, 10)

      return {
        matchingSkills: normalizedUserSkills.filter(s => matchingSkills.includes(s)),
        missingSkills,
        suggestedSkills,
        industryDemandSkills: industrySkills,
        matchPercentage: normalizedUserSkills.length > 0
          ? Math.round((matchingSkills.length / industrySkills.length) * 100)
          : 0
      }
    } catch (error) {
      throw new Error(`Skill gap analysis failed: ${error.message}`)
    }
  }

  /**
   * Check if two skills match (handles variations)
   */
  skillMatch(skill1, skill2) {
    const normalize = (s) => s.toLowerCase().replace(/[.\-\s]/g, '')
    return normalize(skill1) === normalize(skill2)
  }

  /**
   * Get learning recommendations based on skill gap
   */
  getLearningRecommendations(analysis) {
    const recommendations = {
      critical: [], // Most in-demand missing skills
      important: [], // Common missing skills
      nice_to_have: [] // Less common but useful
    }

    if (!analysis || !analysis.suggestedSkills) {
      return recommendations
    }

    // First 3-5 suggested skills are critical
    recommendations.critical = analysis.suggestedSkills.slice(0, 5)

    // Next batch is important
    recommendations.important = analysis.suggestedSkills.slice(5, 10)

    // Related skills that might be nice to have
    const relatedSkills = this.getRelatedSkills(analysis.suggestedSkills)
    recommendations.nice_to_have = relatedSkills.slice(0, 5)

    return recommendations
  }

  /**
   * Get skills related to the ones in the learning path
   */
  getRelatedSkills(skills) {
    const skillRelations = {
      'React': ['Redux', 'Next.js', 'TypeScript', 'Jest'],
      'JavaScript': ['TypeScript', 'Node.js', 'Express'],
      'Python': ['Django', 'Flask', 'scikit-learn', 'Pandas'],
      'PostgreSQL': ['SQL', 'MongoDB', 'Redis'],
      'Docker': ['Kubernetes', 'CI/CD', 'Docker Compose'],
      'AWS': ['Azure', 'GCP', 'Terraform'],
      'Machine Learning': ['Python', 'TensorFlow', 'Pandas', 'NumPy'],
      'Kubernetes': ['Docker', 'CI/CD', 'Helm'],
      'Spring Boot': ['Java', 'Hibernate', 'PostgreSQL'],
      'Angular': ['TypeScript', 'RxJS', 'Jest']
    }

    const related = new Set()
    skills.forEach(skill => {
      if (skillRelations[skill]) {
        skillRelations[skill].forEach(relSkill => related.add(relSkill))
      }
    })

    return Array.from(related)
  }

  /**
   * Generate a skill development roadmap
   */
  generateRoadmap(analysis, currentLevel = 'beginner') {
    const roadmap = {
      phase1: {
        title: 'Foundation (0-2 months)',
        skills: [],
        description: 'Build foundational knowledge'
      },
      phase2: {
        title: 'Intermediate (2-4 months)',
        skills: [],
        description: 'Develop practical experience'
      },
      phase3: {
        title: 'Advanced (4-6 months)',
        skills: [],
        description: 'Master advanced concepts'
      },
      phase4: {
        title: 'Specialization (6+ months)',
        skills: [],
        description: 'Specialize and deepen expertise'
      }
    }

    if (!analysis || !analysis.suggestedSkills) {
      return roadmap
    }

    // Distribute skills across phases
    const skills = analysis.suggestedSkills
    const skillsPerPhase = Math.ceil(skills.length / 4)

    roadmap.phase1.skills = skills.slice(0, skillsPerPhase)
    roadmap.phase2.skills = skills.slice(skillsPerPhase, skillsPerPhase * 2)
    roadmap.phase3.skills = skills.slice(skillsPerPhase * 2, skillsPerPhase * 3)
    roadmap.phase4.skills = skills.slice(skillsPerPhase * 3)

    return roadmap
  }
}

export default new ResumeAnalyzerService()
