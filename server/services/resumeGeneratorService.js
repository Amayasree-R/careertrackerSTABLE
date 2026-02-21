import * as aiService from './aiEnhancementService.js'
import * as githubService from './githubProjectService.js'

/**
 * Aggregates all user data specifically for the resume builder.
 * Maps User schema fields to resume-ready format.
 */
export function getAggregatedResumeData(user) {
    // 1. Personal Details
    const fullName = user.fullName || ''
    const email = user.email || ''
    const phoneNumber = user.phoneNumber || ''

    // Location formatting
    const location = user.personalDetails?.location
        ? {
            city: user.personalDetails.location.city || '',
            state: user.personalDetails.location.state || '',
            country: user.personalDetails.location.country || ''
        }
        : null

    // Social links
    const github = user.socialLinks?.github || ''
    const linkedin = user.socialLinks?.linkedin || ''
    const portfolio = user.socialLinks?.portfolio || ''

    // 2. Education (from user.education array)
    // Map: college -> institution, specialization -> field, endYear -> year
    const education = (user.education || []).map(edu => ({
        institution: edu.college || '',
        degree: edu.degree || '',
        field: edu.specialization || '',
        year: edu.endYear || 'Ongoing'
    }))

    // 3. Experience (from user.experience array)
    // Map: responsibilities -> description, format dates to duration string
    const experience = (user.experience || []).map(exp => {
        let duration = ''
        if (exp.startDate && exp.endDate) {
            const start = new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            const end = new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            duration = `${start} - ${end}`
        } else if (exp.startDate) {
            const start = new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            duration = `${start} - Present`
        }

        return {
            company: exp.company || '',
            role: exp.role || '',
            duration: duration,
            description: exp.responsibilities || ''
        }
    })

    // 4. Mastered Skills (from user.profile.completedSkills)
    // Filter: score >= 90
    const masteredSkills = (user.profile?.completedSkills || [])
        .filter(s => s.score >= 90)
        .map(s => ({
            skill: s.skill,
            score: s.score
        }))

    // 5. Known Skills (from user.profile.currentSkills)
    const knownSkills = user.profile?.currentSkills || []

    // 6. Target Job Role
    const targetJobRole = user.careerInfo?.targetJobRole || user.profile?.targetJob || 'Software Engineer'

    // 7. Certificates (from user.certifications)
    // Map: title -> name, filter useInResume !== false
    const certificates = (user.certifications || [])
        .filter(cert => cert.useInResume !== false)
        .map(cert => ({
            name: cert.title || '',
            issuer: cert.issuer || '',
            year: cert.issueYear ? cert.issueYear.toString() : ''
        }))

    // 8. Projects (from user.resumeData.projects if available)
    const projects = (user.resumeData?.projects || []).map(proj => ({
        title: proj.title || '',
        description: proj.description || '',
        techStack: proj.techStack || []
    }))

    // VALIDATION LOGGING
    console.log('📊 Resume Data Validation:')
    console.log(`   Full Name: ${fullName || '❌ MISSING'}`)
    console.log(`   Email: ${email || '❌ MISSING'}`)
    console.log(`   Phone: ${phoneNumber || '❌ MISSING'}`)
    console.log(`   Location: ${location ? '✅' : '❌ MISSING'}`)
    console.log(`   GitHub: ${github || '❌ MISSING'}`)
    console.log(`   LinkedIn: ${linkedin || '❌ MISSING'}`)
    console.log(`   Education: ${education.length} entries`)
    console.log(`   Experience: ${experience.length} entries`)
    console.log(`   Mastered Skills: ${masteredSkills.length} skills (score >= 90)`)
    console.log(`   Known Skills: ${knownSkills.length} skills`)
    console.log(`   Certificates: ${certificates.length} certificates`)
    console.log(`   Projects: ${projects.length} projects`)
    console.log(`   Target Role: ${targetJobRole}`)

    // Warnings for empty critical fields
    if (!fullName) console.warn('⚠️  CRITICAL: fullName is missing!')
    if (!email) console.warn('⚠️  CRITICAL: email is missing!')
    if (experience.length === 0) console.warn('⚠️  WARNING: No experience entries found!')
    if (masteredSkills.length === 0 && knownSkills.length === 0) {
        console.warn('⚠️  WARNING: No skills found! Check profile.completedSkills and profile.currentSkills')
    }

    return {
        // Personal details
        fullName,
        email,
        phoneNumber,
        location,
        github,
        linkedin,
        portfolio,

        // Career data
        education,
        experience,
        masteredSkills,
        knownSkills,
        certificates,
        projects,
        targetJobRole
    }
}

/**
 * Detects user profile type (student vs professional) based on data availability.
 */
export function detectUserProfile(data) {
    const hasExperience = data.experience?.length > 0
    const hasSkills = (data.knownSkills?.length > 0) || (data.masteredSkills?.length > 0)
    const isStudent = !hasExperience

    return {
        isStudent,
        hasExperience,
        hasSkills
    }
}


/**
 * Assembles all data for a resume.
 */
export async function assembleResumeData(user, options = {}) {
    const { targetRole, template = 'modern' } = options

    // 1. Basic Info
    const basicInfo = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        location: `${user.personalDetails?.location?.city || ''}, ${user.personalDetails?.location?.country || ''}`,
        socialLinks: user.socialLinks
    }

    // 2. Summary (AI Generated or existing)
    let summary = ''
    if (options.generateSummary) {
        summary = await aiService.generateProfessionalSummary(user)
    }

    // 3. Skills (Categorized and mastery-checked)
    const masteredSkills = (user.profile.completedSkills || [])
        .map(s => {
            if (typeof s === 'string') return { name: s, score: 100, masteredAt: new Date(), level: 'Proficient' }
            return {
                name: s.skill,
                score: s.score || 0,
                masteredAt: s.masteredAt || new Date(),
                level: (s.score || 0) >= 90 ? 'Expert' : 'Proficient'
            }
        })
        .filter(s => s.score >= 50) // Show anything above 50%

    // Categorization logic (simplified but more robust)
    const categorizedSkills = [
        { category: 'Technical Skills', items: masteredSkills.map(s => s.name) }
    ]

    // Add skills from resume data if profile is empty
    if (categorizedSkills[0].items.length === 0 && user.resumeData?.skills) {
        categorizedSkills[0].items = user.resumeData.skills.slice(0, 15)
    }

    // 4. Projects (GitHub + AI)
    let projects = []
    if (user.socialLinks?.github) {
        const githubProjects = await githubService.fetchUserProjects(user.socialLinks.github)
        projects = await Promise.all(githubProjects.map(async (proj) => ({
            ...proj,
            description: options.enhanceProjects
                ? await aiService.generateProjectDescription(proj.title, proj.description, proj.techStack)
                : proj.description
        })))
    }

    // 5. Experience & Education
    const experience = user.resumeData?.experience || []
    const education = user.resumeData?.education || []

    return {
        ...basicInfo,
        summary,
        skills: categorizedSkills,
        masteredSkills, // Raw list for bubbles/badges
        projects,
        experience,
        education,
        template,
        targetRole: targetRole || user.careerInfo?.targetJobRole || user.profile.targetJob
    }
}
