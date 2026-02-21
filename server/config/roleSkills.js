// server/config/roleSkills.js

export const ROLE_SKILLS = {
  frontend: {
    core: ['html', 'css', 'javascript', 'typescript', 'react'],
    supporting: ['redux', 'tailwind', 'vite', 'git', 'rest'],
    optional: ['next.js', 'react-native', 'jest', 'cypress', 'accessibility']
  },

  backend: {
    core: ['javascript', 'node.js', 'express', 'mongodb', 'sql'],
    supporting: ['sequelize', 'mongoose', 'docker', 'jwt', 'redis'],
    optional: ['graphql', 'kubernetes', 'microservices', 'aws']
  },

  data_scientist: {
    core: ['python', 'pandas', 'numpy', 'scikit-learn', 'sql'],
    supporting: ['tensorflow', 'pytorch', 'jupyter', 'matplotlib'],
    optional: ['spark', 'hadoop', 'aws']
  },

  cloud_engineer: {
    core: ['aws', 'linux', 'docker', 'kubernetes', 'networking'],
    supporting: ['terraform', 'ci-cd', 'git', 'monitoring'],
    optional: ['azure', 'gcp', 'ansible']
  }
}
