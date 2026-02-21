/**
 * Skill normalization and standardization
 * Maps common variations to standard skill names
 */

const skillNormalizationMap = {
  // JavaScript variants
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'es6': 'JavaScript',
  'es2015': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',

  // Python variants
  'py': 'Python',
  'python': 'Python',
  'python3': 'Python',
  'python2': 'Python',

  // Java variants
  'java': 'Java',
  'j2ee': 'Java',
  'jdbc': 'Java',

  // Web frameworks
  'react': 'React',
  'reactjs': 'React',
  'vue': 'Vue',
  'vuejs': 'Vue',
  'angular': 'Angular',
  'angularjs': 'Angular',
  'express': 'Express',
  'expressjs': 'Express',
  'django': 'Django',
  'flask': 'Flask',
  'asp.net': 'ASP.NET',
  'aspnet': 'ASP.NET',
  'dotnet': '.NET',
  '.net': '.NET',
  'spring': 'Spring',
  'springframework': 'Spring',
  'springboot': 'Spring Boot',
  'spring boot': 'Spring Boot',

  // Databases
  'sql': 'SQL',
  'mysql': 'MySQL',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'redis': 'Redis',
  'cassandra': 'Cassandra',
  'elasticsearch': 'Elasticsearch',
  'oracle': 'Oracle',
  'sqlite': 'SQLite',
  'firestore': 'Firestore',
  'dynamodb': 'DynamoDB',

  // Cloud services
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'heroku': 'Heroku',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',

  // Version control
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'bitbucket': 'Bitbucket',
  'svn': 'SVN',

  // DevOps/Tools
  'jenkins': 'Jenkins',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'terraform': 'Terraform',
  'ansible': 'Ansible',
  'jenkins': 'Jenkins',
  'nginx': 'Nginx',
  'apache': 'Apache',
  'linux': 'Linux',
  'unix': 'Unix',
  'windows': 'Windows',
  'mac': 'macOS',
  'macos': 'macOS',

  // Mobile
  'react native': 'React Native',
  'reactnative': 'React Native',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'flutter': 'Flutter',
  'android': 'Android',
  'ios': 'iOS',

  // APIs and Protocols
  'rest': 'REST',
  'restful': 'REST',
  'graphql': 'GraphQL',
  'soap': 'SOAP',
  'websocket': 'WebSocket',
  'grpc': 'gRPC',

  // Data Science/ML
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'ai': 'AI',
  'artificial intelligence': 'AI',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'scikit-learn': 'scikit-learn',
  'scikit': 'scikit-learn',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'matplotlib': 'Matplotlib',
  'jupyter': 'Jupyter',

  // Other languages
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'php': 'PHP',
  'ruby': 'Ruby',
  'go': 'Go',
  'golang': 'Go',
  'rust': 'Rust',
  'kotlin': 'Kotlin',
  'r': 'R',
  'scala': 'Scala',

  // Testing
  'junit': 'JUnit',
  'pytest': 'pytest',
  'jest': 'Jest',
  'jasmine': 'Jasmine',
  'mocha': 'Mocha',
  'selenium': 'Selenium',
  'rspec': 'RSpec',

  // Other tools
  'jira': 'Jira',
  'confluence': 'Confluence',
  'slack': 'Slack',
  'figma': 'Figma',
  'sketch': 'Sketch',
  'photoshop': 'Photoshop',
  'css': 'CSS',
  'html': 'HTML',
  'xml': 'XML',
  'json': 'JSON',
  'yaml': 'YAML',
  'toml': 'TOML'
}

/**
 * Escape special regex characters in a string
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalize a skill name to standard form
 * @param {string} skill - Raw skill name from resume
 * @returns {string} - Normalized skill name
 */
export function normalizeSkill(skill) {
  if (!skill) return ''

  const normalized = skill.toLowerCase().trim()
  return skillNormalizationMap[normalized] || skill
}

/**
 * Normalize an array of skills
 * @param {string[]} skills - Array of skill names
 * @returns {string[]} - Array of normalized, deduplicated skills
 */
export function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return []

  const normalized = skills
    .map(s => normalizeSkill(s))
    .filter(s => s.length > 0)

  // Remove duplicates
  return [...new Set(normalized)]
}

/**
 * Extract skills from a block of text using keyword matching
 * @param {string} text - Text to search for skills
 * @param {string[]} knownSkills - Optional list of skills to match against
 * @returns {string[]} - Found skills
 */
export function extractSkillsFromText(text, knownSkills = null) {
  if (!text) return []

  const skillKeywords = knownSkills || Object.keys(skillNormalizationMap)
  const foundSkills = []
  const textLower = text.toLowerCase()

  skillKeywords.forEach(keyword => {
    // Escape keyword for safe regex usage (handles C++, C#, .NET etc)
    const safeKeyword = escapeRegex(keyword)

    // Use word boundaries ONLY if the keyword starts/ends with a word character
    // For things like C++, we need to be careful with trailing boundaries
    const startBoundary = /^\w/.test(keyword) ? '\\b' : ''
    const endBoundary = /\w$/.test(keyword) ? '\\b' : ''

    const regex = new RegExp(`${startBoundary}${safeKeyword}${endBoundary}`, 'gi')
    if (regex.test(textLower)) {
      foundSkills.push(normalizeSkill(keyword))
    }
  })

  return [...new Set(foundSkills)]
}

/**
 * Categorize skills by type
 * @param {string[]} skills - Array of skill names
 * @returns {object} - Skills grouped by category
 */
export function categorizeSkills(skills) {
  if (!Array.isArray(skills)) return {}

  const categories = {
    languages: [],
    frameworks: [],
    databases: [],
    cloudTools: [],
    devTools: [],
    other: []
  }

  const categoryMap = {
    // Languages
    'JavaScript': 'languages',
    'Python': 'languages',
    'Java': 'languages',
    'TypeScript': 'languages',
    'C++': 'languages',
    'C#': 'languages',
    'PHP': 'languages',
    'Ruby': 'languages',
    'Go': 'languages',
    'Rust': 'languages',
    'Kotlin': 'languages',
    'R': 'languages',
    'Scala': 'languages',
    'Swift': 'languages',
    'SQL': 'languages',
    'HTML': 'languages',
    'CSS': 'languages',

    // Frameworks
    'React': 'frameworks',
    'Vue': 'frameworks',
    'Angular': 'frameworks',
    'Express': 'frameworks',
    'Django': 'frameworks',
    'Flask': 'frameworks',
    'Spring': 'frameworks',
    'Spring Boot': 'frameworks',
    'ASP.NET': 'frameworks',
    '.NET': 'frameworks',
    'React Native': 'frameworks',
    'Flutter': 'frameworks',
    'Svelte': 'frameworks',
    'Next.js': 'frameworks',
    'Nuxt': 'frameworks',

    // Databases
    'MySQL': 'databases',
    'PostgreSQL': 'databases',
    'MongoDB': 'databases',
    'Redis': 'databases',
    'Cassandra': 'databases',
    'Elasticsearch': 'databases',
    'Oracle': 'databases',
    'SQLite': 'databases',
    'Firestore': 'databases',
    'DynamoDB': 'databases',

    // Cloud Tools
    'AWS': 'cloudTools',
    'Azure': 'cloudTools',
    'GCP': 'cloudTools',
    'Heroku': 'cloudTools',
    'Docker': 'cloudTools',
    'Kubernetes': 'cloudTools',

    // DevTools
    'Git': 'devTools',
    'GitHub': 'devTools',
    'GitLab': 'devTools',
    'Bitbucket': 'devTools',
    'Jenkins': 'devTools',
    'CI/CD': 'devTools',
    'Terraform': 'devTools',
    'Ansible': 'devTools',
    'Nginx': 'devTools',
    'Apache': 'devTools',
    'Linux': 'devTools',
    'Jest': 'devTools',
    'Mocha': 'devTools',
    'pytest': 'devTools'
  }

  skills.forEach(skill => {
    const category = categoryMap[skill] || 'other'
    categories[category].push(skill)
  })

  return categories
}

/**
 * Get all known skills from the normalization map
 * @returns {string[]} - All known standard skill names
 */
export function getAllKnownSkills() {
  return Object.values(skillNormalizationMap).filter((v, i, a) => a.indexOf(v) === i)
}
