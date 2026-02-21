import Groq from 'groq-sdk'
import { Octokit } from '@octokit/rest'
import axios from 'axios'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

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

export async function generateRoadmap(profile) {
  try {
    const { completedSkills, currentSkills, targetJob, experienceLevel } = profile;

    // Use completedSkills (the source of truth for "Mastered") instead of currentSkills
    // Handle both string array (legacy) and object array (new)
    const masteredSkills = (Array.isArray(completedSkills) && completedSkills.length > 0
      ? (typeof completedSkills[0] === 'object' ? completedSkills.map(s => s?.skill) : completedSkills)
      : (currentSkills || []))
      .filter(s => typeof s === 'string' && s.trim().length > 0);

    console.log(`\n=== Generating Roadmap for ${targetJob} ===`)

    // 1. Get skills from GitHub (primary source - most accurate)
    const githubSkills = await getGitHubSkillsAdvanced(targetJob)

    // 2. Get supplementary skills from Stack Overflow
    const stackOverflowSkills = await getStackOverflowSkills(targetJob)

    // 3. Combine with GitHub prioritized (GitHub skills come first)
    const allSkills = [...githubSkills, ...stackOverflowSkills]
    // Normalize checking for unique skills
    const uniqueSkillsSet = new Set(allSkills.filter(s => typeof s === 'string').map(s => s.toLowerCase()))

    // Let's get the standard required skills first
    let requiredSkills = getRequiredSkills(targetJob, [...uniqueSkillsSet])

    // Now, merge user's MASTERED skills into requiredSkills if not present
    // Normalize skills for comparison
    const requiredSkillsLower = new Set(requiredSkills.map(s => s.toLowerCase()))

    const additionalUserSkills = masteredSkills.filter(userSkill =>
      userSkill && !requiredSkillsLower.has(userSkill.toLowerCase())
    )

    // Capitalize properly before adding
    const formattedUserSkills = additionalUserSkills.map(s => capitalizeSkill(s))

    // Final list includes standard top 15 + any extra skills the user has mastered
    const finalRequiredSkills = [...requiredSkills, ...formattedUserSkills]

    console.log(`Required skills (${finalRequiredSkills.length}):`, finalRequiredSkills)

    // 5. Find missing skills
    // We check against finalRequiredSkills using masteredSkills to exclude what they already know
    const masteredSkillsLower = masteredSkills.map(s => s.toLowerCase())
    const missingSkills = finalRequiredSkills.filter(skill =>
      skill && !masteredSkillsLower.includes(skill.toLowerCase())
    )
    console.log(`Missing skills (${missingSkills.length}):`, missingSkills)

    // 6. Get GitHub projects
    const githubProjects = await getGitHubProjects(targetJob, masteredSkills)

    // 7. Use AI to generate descriptions, resources, and priority
    // We only generate learning path for MISSING skills
    const learningPath = await getAILearningPath(missingSkills, targetJob, experienceLevel)

    // 8. Create objects for mastered skills so they appear in the graph
    const masteredSkillsObjects = masteredSkills.map(skill => ({
      skill: capitalizeSkill(skill),
      priority: 'High', // Default value
      estimatedTime: 'Completed',
      resources: [],
      status: 'Mastered' // Helper field if needed
    }))

    // Combine both for the full roadmap visualization
    const fullLearningPath = [...masteredSkillsObjects, ...learningPath]

    return {
      skillGap: calculateSkillGap(masteredSkills, finalRequiredSkills),
      missingSkills: missingSkills,
      learningPath: fullLearningPath, // Return all skills (mastered + to-learn)
      projects: githubProjects
    }
  } catch (error) {
    console.error('generateRoadmap error:', error);
    throw error;
  }
}

// IMPROVED: Get skills from GitHub repositories - more accurate than Stack Overflow
async function getGitHubSkillsAdvanced(targetJob) {
  try {
    console.log(`Analyzing GitHub repos for ${targetJob}...`)

    // Improve search query - focus on actual tech terms, not job titles
    let searchTerms = targetJob.toLowerCase()

    // Replace job-specific terms with technology terms
    if (searchTerms.includes('backend') || searchTerms.includes('back-end')) {
      searchTerms = 'language:javascript express OR language:python django OR language:java spring'
    } else if (searchTerms.includes('frontend') || searchTerms.includes('front-end')) {
      searchTerms = 'react vue angular javascript'
    } else if (searchTerms.includes('fullstack') || searchTerms.includes('full-stack')) {
      searchTerms = 'nodejs react fullstack'
    } else if (searchTerms.includes('data')) {
      searchTerms = 'python pandas machine-learning'
    } else if (searchTerms.includes('devops')) {
      searchTerms = 'docker kubernetes terraform'
    } else if (searchTerms.includes('mobile')) {
      searchTerms = 'language:dart flutter OR language:swift ios OR language:kotlin android OR react-native'
    }

    // Search for recent, popular repos in this domain
    const searchQuery = `${searchTerms} stars:>100 pushed:>2023-01-01`
    const { data } = await octokit.search.repos({
      q: searchQuery,
      sort: 'stars',
      order: 'desc',
      per_page: 50
    })

    // Collect skills from multiple sources
    const skillFrequency = new Map()

    // Whitelist of known technical skills (languages, frameworks, tools)
    const technicalSkills = new Set([
      // Languages
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go',
      'rust', 'php', 'swift', 'kotlin', 'scala', 'r', 'dart', 'elixir', 'c',
      // Frontend Frameworks/Libraries
      'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby',
      'preact', 'solid', 'qwik',
      // Backend Frameworks
      'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'laravel',
      'rails', 'asp.net', 'nestjs', 'koa', 'phoenix',
      // Mobile (modern only)
      'react-native', 'flutter', 'ionic', 'android', 'ios', 'swiftui',
      // CSS/Styling
      'css', 'sass', 'scss', 'less', 'tailwind', 'bootstrap', 'mui',
      'styled-components', 'emotion', 'chakra-ui',
      // Build Tools
      'webpack', 'vite', 'rollup', 'parcel', 'babel', 'esbuild',
      // Testing
      'jest', 'mocha', 'cypress', 'selenium', 'playwright', 'vitest',
      'pytest', 'junit',
      // Databases
      'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'sqlite',
      'cassandra', 'dynamodb', 'firebase', 'supabase',
      // DevOps/Cloud
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible',
      'jenkins', 'gitlab-ci', 'github-actions', 'circleci',
      // State Management
      'redux', 'mobx', 'vuex', 'pinia', 'zustand', 'recoil',
      // API/Data
      'graphql', 'rest', 'grpc', 'apollo', 'prisma', 'sequelize', 'mongoose',
      'typeorm', 'axios',
      // Core Web
      'html', 'html5', 'css3',
      // Version Control
      'git', 'github', 'gitlab',
      // Data Science/ML
      'tensorflow', 'pytorch', 'keras', 'pandas', 'numpy', 'scikit-learn',
      'jupyter', 'spark', 'hadoop', 'airflow',
      // Security (for cybersecurity roles)
      'wireshark', 'nmap', 'metasploit', 'kali-linux', 'penetration-testing',
      'cryptography', 'networking'
    ])

    // Deprecated/old mobile frameworks to exclude
    const deprecatedMobile = ['jquery-mobile', 'ibm-mobilefirst', 'mobile-safari',
      'windows-mobile', 'mobile-application', 'titanium-mobile',
      'samsung-mobile', 'mobile-website', 'mobile-development',
      'appcelerator-mobile']

    data.items.forEach(repo => {
      // 1. Primary language (most important)
      if (repo.language) {
        const lang = repo.language.toLowerCase()
        if (technicalSkills.has(lang)) {
          skillFrequency.set(lang, (skillFrequency.get(lang) || 0) + 5)
        }
      }

      // 2. Topics (technologies/frameworks used)
      if (repo.topics && repo.topics.length > 0) {
        repo.topics.forEach(topic => {
          const topicLower = topic.toLowerCase()

          // Skip if deprecated mobile framework
          if (deprecatedMobile.includes(topicLower)) return

          // Skip if contains 'backend' or 'frontend' in name
          if (topicLower.includes('backend') || topicLower.includes('frontend')) return

          // Special filtering for frontend: exclude iOS/Android unless it's React Native
          if (searchTerms.includes('react') || searchTerms.includes('vue') || searchTerms.includes('angular')) {
            if ((topicLower === 'ios' || topicLower === 'android') && !topicLower.includes('react-native')) {
              return // Skip iOS/Android in frontend (unless React Native)
            }
          }

          // Only accept if in whitelist
          if (technicalSkills.has(topicLower)) {
            skillFrequency.set(topicLower, (skillFrequency.get(topicLower) || 0) + 2)
          }
        })
      }
    })

    // Sort by frequency (most common = most important)
    const sortedSkills = Array.from(skillFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill)
      .slice(0, 20)

    console.log(`✓ GitHub found ${sortedSkills.length} skills (sorted by usage frequency)`)
    console.log(`Top skills:`, sortedSkills.slice(0, 10))

    // Fallback: If very few skills found, add role-specific defaults
    if (sortedSkills.length < 5) {
      console.log('⚠ Few skills found, adding role-specific defaults')
      const defaults = getRoleDefaults(targetJob)
      return [...sortedSkills, ...defaults].slice(0, 20)
    }

    return sortedSkills
  } catch (error) {
    console.error('✗ GitHub advanced skills error:', error.message)
    return []
  }
}

function getRoleDefaults(jobTitle) {
  const jobLower = jobTitle.toLowerCase()

  if (jobLower.includes('cyber') || jobLower.includes('security')) {
    return ['python', 'linux', 'networking', 'cryptography', 'penetration-testing',
      'wireshark', 'nmap', 'metasploit', 'burp-suite', 'kali-linux']
  }

  if (jobLower.includes('mobile')) {
    return ['swift', 'kotlin', 'flutter', 'react-native', 'ios', 'android',
      'dart', 'xcode', 'android-studio']
  }

  if (jobLower.includes('devops') || jobLower.includes('cloud')) {
    return ['docker', 'kubernetes', 'aws', 'terraform', 'ansible',
      'jenkins', 'linux', 'python', 'bash']
  }

  if (jobLower.includes('data') || jobLower.includes('ml') || jobLower.includes('ai')) {
    return ['python', 'pandas', 'numpy', 'tensorflow', 'pytorch',
      'scikit-learn', 'jupyter', 'sql', 'matplotlib']
  }

  return ['git', 'linux', 'docker', 'python', 'javascript']
}

async function getStackOverflowSkills(jobTitle) {
  try {
    // Extract keywords from job title
    const keywords = jobTitle.toLowerCase()
      .replace(/developer|engineer|specialist|designer|scientist/gi, '')
      .trim()
      .split(/[\s-]+/)
      .filter(word => word.length > 2)

    if (keywords.length === 0) return []

    // Search for tags related to keywords
    const response = await axios.get('https://api.stackexchange.com/2.3/tags', {
      params: {
        order: 'desc',
        sort: 'popular',
        site: 'stackoverflow',
        inname: keywords[0], // Use primary keyword
        pagesize: 30
      }
    })

    const blacklist = [
      'careers', 'certification', 'community', 'interview', 'questions',
      'tutorial', 'learning', 'beginner', 'tips', 'help', 'documentation'
    ]

    // Filter job title words
    const jobWords = keywords

    const skills = response.data.items
      .map(item => item.name.toLowerCase())
      .filter(tag => {
        // Remove blacklisted terms
        if (blacklist.includes(tag)) return false

        // Remove job title itself
        if (jobWords.includes(tag)) return false

        // Keep technical skills only (1-2 words max)
        return tag.split(/[\s-]/).length <= 2
      })

    console.log(`✓ Stack Overflow found ${skills.length} supplementary skills`)

    return skills.slice(0, 10)
  } catch (error) {
    console.error('✗ Stack Overflow error:', error.message)
    return []
  }
}

function getRequiredSkills(targetJob, trendingSkills) {
  // The trending skills are already sorted by relevance from GitHub
  // Just capitalize them properly

  const capitalized = trendingSkills.map(skill => capitalizeSkill(skill))

  // Return top 15
  return capitalized.slice(0, 15)
}

function capitalizeSkill(skill) {
  // Comprehensive mapping for proper capitalization
  const specialCases = {
    'html': 'HTML',
    'css': 'CSS',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'sql': 'SQL',
    'nosql': 'NoSQL',
    'api': 'API',
    'rest': 'REST',
    'graphql': 'GraphQL',
    'nodejs': 'Node.js',
    'node': 'Node.js',
    'node.js': 'Node.js',
    'reactjs': 'React',
    'react': 'React',
    'react-native': 'React Native',
    'vuejs': 'Vue.js',
    'vue': 'Vue.js',
    'angular': 'Angular',
    'angularjs': 'AngularJS',
    'nextjs': 'Next.js',
    'next': 'Next.js',
    'next.js': 'Next.js',
    'nuxtjs': 'Nuxt.js',
    'nuxt': 'Nuxt.js',
    'svelte': 'Svelte',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mysql': 'MySQL',
    'sqlite': 'SQLite',
    'redis': 'Redis',
    'elasticsearch': 'Elasticsearch',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'k8s': 'Kubernetes',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'Google Cloud',
    'git': 'Git',
    'github': 'GitHub',
    'gitlab': 'GitLab',
    'linux': 'Linux',
    'unix': 'Unix',
    'python': 'Python',
    'java': 'Java',
    'c++': 'C++',
    'cpp': 'C++',
    'c#': 'C#',
    'csharp': 'C#',
    'ruby': 'Ruby',
    'php': 'PHP',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'go': 'Go',
    'golang': 'Go',
    'rust': 'Rust',
    'scala': 'Scala',
    'r': 'R',
    'matlab': 'MATLAB',
    'ui': 'UI',
    'ux': 'UX',
    'ci-cd': 'CI/CD',
    'cicd': 'CI/CD',
    'tensorflow': 'TensorFlow',
    'pytorch': 'PyTorch',
    'keras': 'Keras',
    'pandas': 'Pandas',
    'numpy': 'NumPy',
    'scikit-learn': 'Scikit-learn',
    'django': 'Django',
    'flask': 'Flask',
    'fastapi': 'FastAPI',
    'express': 'Express.js',
    'expressjs': 'Express.js',
    'spring': 'Spring',
    'springboot': 'Spring Boot',
    'laravel': 'Laravel',
    'rails': 'Ruby on Rails',
    'asp.net': 'ASP.NET',
    'dotnet': '.NET',
    '.net': '.NET',
    'webpack': 'Webpack',
    'vite': 'Vite',
    'babel': 'Babel',
    'redux': 'Redux',
    'mobx': 'MobX',
    'tailwind': 'Tailwind CSS',
    'tailwindcss': 'Tailwind CSS',
    'bootstrap': 'Bootstrap',
    'sass': 'Sass',
    'scss': 'SCSS',
    'less': 'Less',
    'jquery': 'jQuery',
    'jest': 'Jest',
    'mocha': 'Mocha',
    'cypress': 'Cypress',
    'selenium': 'Selenium',
    'graphql': 'GraphQL',
    'apollo': 'Apollo',
    'prisma': 'Prisma',
    'sequelize': 'Sequelize',
    'mongoose': 'Mongoose',
    'machine-learning': 'Machine Learning',
    'deep-learning': 'Deep Learning',
    'artificial-intelligence': 'AI',
    'data-science': 'Data Science',
    'devops': 'DevOps',
    'microservices': 'Microservices',
    'serverless': 'Serverless',
    'firebase': 'Firebase',
    'supabase': 'Supabase',
    'android': 'Android',
    'ios': 'iOS',
    'flutter': 'Flutter',
    'xamarin': 'Xamarin'
  }

  const skillLower = skill.toLowerCase()

  if (specialCases[skillLower]) {
    return specialCases[skillLower]
  }

  // Default: capitalize first letter
  return skill.charAt(0).toUpperCase() + skill.slice(1)
}

async function getGitHubProjects(targetJob, currentSkills) {
  try {
    const searchQuery = `${targetJob} beginner tutorial`
    const { data } = await octokit.search.repos({
      q: searchQuery,
      sort: 'stars',
      order: 'desc',
      per_page: 6
    })

    return data.items.map(repo => ({
      name: repo.name,
      description: repo.description,
      difficulty: 'Intermediate',
      skills: currentSkills.slice(0, 3),
      githubUrl: repo.html_url,
      stars: repo.stargazers_count
    }))
  } catch (error) {
    console.error('GitHub projects error:', error.message)
    return []
  }
}

async function getAILearningPath(skills, targetJob, experienceLevel) {
  if (skills.length === 0) {
    return []
  }

  try {
    const prompt = `You are a career advisor. For a ${targetJob} at ${experienceLevel} level, create learning recommendations for these skills:

${skills.slice(0, 15).map((s, i) => `${i + 1}. ${s}`).join('\n')}

For each skill, provide descriptions and resources. Return a valid JSON object (no markdown) with a "skills" key containing an array of skill objects:

{
  "skills": [
    {
      "skill": "Skill Name",
      "priority": "High or Medium or Low",
      "estimatedTime": "X weeks",
      "resources": [...]
    }
  ]
}

IMPORTANT:
- **STRICT PRIORITY RULES**: You MUST categorize skills into High, Medium, and Low. 
  - **High (Limit: Max top 5 skills)**: Only the absolute "must-have" core technologies.
  - **Medium (Major list)**: Important libraries, tools, or best practices.
  - **Low (Remaining list)**: Non-essential, soft skills, or auxiliary tools.
- **CRITICAL**: Do NOT mark everything High. Differentiation is mandatory.
- **REALISTIC TIMELINES**: 
  - Major Frameworks: 4-8 weeks | Secondary Tools: 1-2 weeks | Soft Skills: 1 week
- Return ONLY the JSON object, no markdown, no extra text`

    const groq = getGroqClient()
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    })

    const text = chatCompletion.choices[0].message.content

    console.log('✓ AI generated learning path descriptions')

    let parsed = JSON.parse(text)

    // Groq sometimes wraps the array in an object if forced to json_object
    if (!Array.isArray(parsed) && parsed.skills) {
      parsed = parsed.skills
    } else if (!Array.isArray(parsed) && Object.values(parsed)[0] && Array.isArray(Object.values(parsed)[0])) {
      parsed = Object.values(parsed)[0]
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }

    throw new Error('Invalid AI response structure')
  } catch (error) {
    console.error('✗ Groq AI error:', error.message)
    return skills.slice(0, 15).map((skill, index) => ({
      skill,
      priority: index < 4 ? 'High' : index < 10 ? 'Medium' : 'Low',
      estimatedTime: index < 4 ? '4 weeks' : '2 weeks',
      resources: [
        { type: 'Search', name: `Learn ${skill}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}` },
        { type: 'Search', name: `Documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' documentation')}` }
      ]
    }))
  }
}

function calculateSkillGap(currentSkills, requiredSkills) {
  const current = currentSkills.length
  const required = requiredSkills.length
  const percentage = required > 0 ? Math.round((current / required) * 100) : 0

  return { current, required, percentage }
}
