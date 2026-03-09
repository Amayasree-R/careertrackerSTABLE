/**
 * Client-side text polisher
 * Improves text formatting without AI or fabricating content
 */

export function polishText(text) {
    if (!text || typeof text !== 'string') return text

    let polished = text

    // 1. Trim whitespace
    polished = polished.trim()

    // 2. Remove extra spaces (multiple spaces → single space)
    polished = polished.replace(/\s+/g, ' ')

    // 3. Fix spacing around punctuation
    polished = polished.replace(/\s+([.,;:!?])/g, '$1') // Remove space before punctuation
    polished = polished.replace(/([.,;:!?])(\S)/g, '$1 $2') // Add space after punctuation

    // 4. Capitalize first letter of each sentence
    polished = polished.replace(/(^\w|[.!?]\s+\w)/g, (match) => match.toUpperCase())

    // 5. Fix common typos and formatting
    polished = polished.replace(/\bi\b/g, 'I') // Lowercase 'i' → 'I'
    polished = polished.replace(/\s+(,|\.)/g, '$1') // No space before comma/period
    polished = polished.replace(/([.!?]){2,}/g, '$1') // Multiple punctuation → single

    // 6. Ensure bullet points have proper spacing
    polished = polished.replace(/^[•\-\*]\s*/gm, '• ') // Normalize bullets
    polished = polished.replace(/\n{3,}/g, '\n\n') // Max 2 line breaks

    // 7. Capitalize common abbreviations
    const abbrevs = ['ceo', 'cto', 'cfo', 'api', 'ui', 'ux', 'seo', 'crm', 'erp', 'saas', 'b2b', 'b2c', 'kpi', 'roi', 'hr', 'it', 'ai', 'ml', 'css', 'html', 'sql', 'aws', 'gcp']
    abbrevs.forEach(abbr => {
        const regex = new RegExp(`\\b${abbr}\\b`, 'gi')
        polished = polished.replace(regex, abbr.toUpperCase())
    })

    // 8. Fix apostrophes and quotes
    polished = polished.replace(/(\w)'(\w)/g, '$1\'$2') // Proper apostrophe
    polished = polished.replace(/"([^"]*)"/g, '"$1"') // Smart quotes

    return polished
}

/**
 * Polishes all fields in an experience object
 */
export function polishExperience(exp) {
    return {
        ...exp,
        role: polishText(exp.role),
        company: polishText(exp.company),
        duration: exp.duration, // Don't polish dates
        description: polishText(exp.description)
    }
}

/**
 * Polishes an array of achievements
 */
export function polishAchievements(achievements) {
    return achievements.map(a => polishText(a))
}
