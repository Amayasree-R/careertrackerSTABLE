import axios from 'axios';

const TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'go', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl',
  'react', 'angular', 'vue', 'next.js', 'nuxt', 'svelte', 'redux',
  'node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'rails',
  'graphql', 'rest', 'grpc', 'websocket',
  'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions',
  'aws', 'azure', 'gcp', 'heroku', 'vercel',
  'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch',
  'cassandra', 'dynamodb', 'firebase', 'supabase',
  'git', 'linux', 'bash', 'nginx', 'apache',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
  'pandas', 'numpy', 'spark', 'kafka', 'hadoop',
  'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'jest', 'mocha', 'cypress', 'selenium', 'pytest',
  'microservices', 'ci/cd', 'devops', 'agile', 'scrum',
];

/**
 * Extracts matched skills from a job description text.
 * @param {string} text - The job description text.
 * @returns {string[]} Array of matched skill keywords.
 */
function extractSkills(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return TECH_SKILLS.filter((skill) => {
    // Use word-boundary-aware matching to avoid false positives (e.g. "r" inside words)
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
    return pattern.test(lower);
  });
}

/**
 * Derives a human-readable match label from a numeric score.
 * @param {number} score
 * @returns {string}
 */
function getMatchLabel(score) {
  if (score >= 75) return 'Strong Match';
  if (score >= 50) return 'Good Match';
  if (score >= 25) return 'Partial Match';
  return 'Low Match';
}

/**
 * Fetches jobs from the Adzuna API and scores them against user skills.
 *
 * @param {Object} options
 * @param {string}   options.targetJob        - Search query / job title.
 * @param {number}  [options.resultsPerPage=20] - Number of results to request.
 * @param {string[]} [options.userSkills=[]]   - Skills the user already has (used for missingSkills).
 * @returns {Promise<Object[]>} Sorted array of scored job objects.
 */
async function getMatchedJobs({ targetJob, resultsPerPage = 50, userSkills = [] } = {}) {
  const appId  = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error('ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables must be set.');
  }

  if (!targetJob || !targetJob.trim()) {
    throw new Error('targetJob is required.');
  }

  const url = 'https://api.adzuna.com/v1/api/jobs/in/search/1';

  const response = await axios.get(url, {
    params: {
      app_id:           appId,
      app_key:          appKey,
      results_per_page: resultsPerPage,
      what:             targetJob.trim(),
    },
    timeout: 15000,
  });

  const results = (response.data && response.data.results) || [];

  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase());

  const scoredJobs = results.map((job) => {
    const descriptionText = [
      job.title || '',
      job.description || '',
      (job.category && job.category.label) || '',
    ].join(' ');

    const requiredSkills = extractSkills(descriptionText);

    // Determine which skills are matched (user has them) and which are missing
    const matchedSkills  = normalizedUserSkills.length > 0
      ? requiredSkills.filter((s) => normalizedUserSkills.includes(s))
      : requiredSkills; // when no user profile provided, treat all found skills as "matched"

    const missingSkills = normalizedUserSkills.length > 0
      ? requiredSkills.filter((s) => !normalizedUserSkills.includes(s))
      : [];

    const matchScore = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

    const matchLabel = getMatchLabel(matchScore);

    return {
      title:       job.title        || null,
      company:     (job.company && job.company.display_name) || null,
      location:    (job.location && job.location.display_name) || null,
      salary_min:  job.salary_min   || null,
      salary_max:  job.salary_max   || null,
      redirect_url: job.redirect_url || null,
      description: job.description  || null,
      matchScore,
      matchedSkills,
      missingSkills,
      matchLabel,
    };
  });

  // Sort by matchScore descending
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

  return scoredJobs;
}

export { getMatchedJobs };
