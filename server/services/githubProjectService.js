import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

/**
 * Fetches top repositories for a specific user.
 */
export async function fetchUserProjects(githubUsername) {
    if (!githubUsername) return []

    try {
        // Extract actual username from URL if necessary
        const username = githubUsername.includes('github.com/')
            ? githubUsername.split('github.com/').pop().split('/')[0]
            : githubUsername

        const { data: repos } = await octokit.repos.listForUser({
            username,
            sort: 'updated',
            per_page: 10,
            type: 'owner'
        })

        // Filter out forks and repositories without a description (optional)
        const filteredRepos = repos
            .filter(repo => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5)

        const projectsWithDetails = await Promise.all(
            filteredRepos.map(async (repo) => {
                // Fetch languages for each repo
                const { data: languages } = await octokit.repos.listLanguages({
                    owner: username,
                    repo: repo.name
                })

                return {
                    title: repo.name,
                    description: repo.description,
                    githubUrl: repo.html_url,
                    techStack: Object.keys(languages).slice(0, 5),
                    stars: repo.stargazers_count
                }
            })
        )

        return projectsWithDetails
    } catch (error) {
        console.error('GitHub Project Fetch Error:', error.message)
        return []
    }
}
