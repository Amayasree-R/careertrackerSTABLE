import puppeteer from 'puppeteer'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

/**
 * Generates a PDF from HTML content using Puppeteer.
 */
export async function generatePdfFromHtml(htmlContent) {
    let browser = null
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        const page = await browser.newPage()
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

        // Use screen media type to match what user sees in preview
        await page.emulateMediaType('screen')

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
        })

        return pdfBuffer
    } catch (error) {
        console.error('PDF Generation Error:', error)
        throw error
    } finally {
        if (browser) await browser.close()
    }
}

/**
 * Generates Professional Template HTML that matches the React component exactly.
 * Uses inline styles only (no Tailwind) for Puppeteer compatibility.
 */
export function generateProfessionalHtml(data) {
    // Safe accessors
    const safe = (val) => val || ''
    const safeArray = (val) => Array.isArray(val) ? val : []

    const fullName = safe(data.fullName)
    const email = safe(data.email)
    const phoneNumber = (() => {
        const phone = data.phoneNumber
        if (!phone) return ''
        let p = String(phone).trim()
        p = p.replace(/^\+91/, '').replace(/^0091/, '').replace(/^0(?=\d{10})/, '')
        return p.trim()
    })()
    const summary = safe(data.summary)

    // Handle location whether string or object
    let locationStr = ''
    if (typeof data.location === 'object' && data.location !== null) {
        const loc = data.location
        locationStr = [loc.city, loc.state, loc.country].filter(Boolean).join(', ')
    } else {
        locationStr = safe(data.location)
    }

    const github = safe(data.github || data.socialLinks?.github)
    const linkedin = safe(data.linkedin || data.socialLinks?.linkedin)

    const experience = safeArray(data.experience)
    const education = safeArray(data.education)
    const skills = safeArray(data.skills) // Categorized groups [{ category, items }]
    const masteredSkills = safeArray(data.masteredSkills) // [{ skill, score }] or [string]
    const certificates = safeArray(data.certificates)
    const projects = safeArray(data.projects)

    // Clean URLs (remove https://)

    // Skills Rendering Logic
    const renderSkills = () => {
        let html = ''

        const seen = new Set()
        const flat = []

        // From skills[] groups
        if (Array.isArray(skills)) {
            skills.forEach(group => {
                const items = Array.isArray(group?.items) ? group.items : [group?.items].filter(Boolean)
                items.forEach(skill => {
                    const s = String(skill).toLowerCase().trim()
                    if (s && !seen.has(s)) {
                        seen.add(s)
                        flat.push(skill)
                    }
                })
            })
        }

        // From masteredSkills[]
        if (Array.isArray(masteredSkills)) {
            masteredSkills.forEach(s => {
                const name = s?.name || s?.skill || s
                const sn = String(name).toLowerCase().trim()
                if (sn && !seen.has(sn)) {
                    seen.add(sn)
                    flat.push(name)
                }
            })
        }

        flat.forEach(skill => {
            html += `
                <div style="display: inline-block; color: white; border: 1px solid #475569; border-radius: 3px; padding: 2px 7px; font-size: 9.5px; margin: 2px 3px; line-height: 1.2;">
                    ${skill}
                </div>
            `
        })

        return `<div style="padding: 8px 16px 16px; display: flex; flex-wrap: wrap; gap: 2px;">${html}</div>`
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume - ${fullName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: white; color: #334155; line-height: 1.5; }
        .page { width: 595.28px; min-height: 841.89px; display: flex; flex-direction: row; }
        
        /* Sidebar */
        .sidebar { width: 30%; background: #1e293b; color: white; min-height: 842px; display: flex; flex-direction: column; }
        .name-block { padding: 32px 24px 16px; border-bottom: 1px solid #334155; }
        .name-block h1 { font-size: 20px; font-weight: 700; color: white; margin-bottom: 4px; }
        .name-block .role { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        
        .sidebar-section { border-bottom: 1px solid #334155; padding-bottom: 20px; }
        .sidebar-label { color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; padding: 20px 24px 8px; font-weight: 700; }
        .sidebar-item { color: white; font-size: 10px; padding: 4px 24px; word-break: break-all; }
        
        /* Main Content */
        .content { width: 70%; background: white; padding: 40px 36px; }
        .section-heading { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; margin-bottom: 4px; }
        .heading-underline { height: 2px; background: #1e293b; width: 100%; margin-bottom: 10px; }
        .summary-text { font-family: 'EB Garamond', serif; font-size: 11px; color: #334155; line-height: 1.6; text-align: justify; }
        
        /* Lists */
        .exp-item, .proj-item, .cert-item { margin-bottom: 16px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
        .item-title { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: #1e293b; }
        .item-subtitle { font-family: 'Inter', sans-serif; font-size: 10px; font-style: italic; color: #475569; }
        .item-meta { font-family: 'Inter', sans-serif; font-size: 9px; color: #64748b; }
        .item-description { font-family: 'EB Garamond', serif; font-size: 11px; color: #334155; line-height: 1.5; white-space: pre-line; margin-top: 4px; }
    </style>
</head>
<body>
    <div class="page">
        <!-- Sidebar -->
        <div class="sidebar">
            <div style="padding: 36px 24px 24px; border-bottom: 1px solid #2d3f55;">
                <h1 style="font-size: 18px; font-weight: 700; color: white; line-height: 1.3; letter-spacing: 0.3px; margin: 0;">${fullName}</h1>
                ${(() => {
            const jobTitle = data.targetJob || data.targetJobRole
            if (jobTitle && jobTitle.trim() !== '' && jobTitle.toLowerCase() !== 'candidate') {
                return `<p style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 6px; font-weight: 500;">${jobTitle}</p>`
            }
            return ''
        })()}
            </div>

            <div style="padding: 20px 24px; border-bottom: 1px solid #2d3f55;">
                <div style="color: #64748b; font-size: 8.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">CONTACT</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 6px; height: 6px; background: #475569; border-radius: 50%;"></div>
                        <div style="color: #cbd5e1; font-size: 10px; line-height: 1.4;">${email}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 6px; height: 6px; background: #475569; border-radius: 50%;"></div>
                        <div style="color: #cbd5e1; font-size: 10px; line-height: 1.4;">${phoneNumber}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 6px; height: 6px; background: #475569; border-radius: 50%;"></div>
                        <div style="color: #cbd5e1; font-size: 10px; line-height: 1.4;">${locationStr}</div>
                    </div>
                    ${github ? `
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        <span style="color: #cbd5e1; font-size: 10px; line-height: 1.4;">${github.replace(/https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '')}</span>
                    </div>` : ''}
                    ${linkedin ? `
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771 C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span style="color: #cbd5e1; font-size: 10px; line-height: 1.4;">${(() => {
                let cleaned = String(linkedin).trim()
                cleaned = cleaned.replace(/https?:\/\//i, '')
                cleaned = cleaned.replace(/^www\./i, '')
                cleaned = cleaned.replace(/^linkedin\.com\/in\//i, '')
                cleaned = cleaned.replace(/^linkedin\.com\//i, '')
                cleaned = cleaned.replace(/\/$/, '')
                cleaned = cleaned.split('?')[0]
                cleaned = cleaned.replace(/-\d{5,}$/, '')
                return cleaned
            })()}</span>
                    </div>` : ''}
                </div>
            </div>

            <div style="padding: 20px 24px; border-bottom: 1px solid #2d3f55;">
                <div style="color: #64748b; font-size: 8.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">SKILLS</div>
                ${renderSkills()}
            </div>

            <div style="padding: 20px 24px;">
                <div style="color: #64748b; font-size: 8.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">EDUCATION</div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${education.map(edu => `
                        <div>
                            <p style="color: white; font-size: 10.5px; font-weight: 600; line-height: 1.2; margin: 0 0 2px 0;">${edu.institution}</p>
                            <p style="color: #94a3b8; font-size: 9.5px; margin: 0;">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</p>
                            <p style="color: #64748b; font-size: 9px; margin: 2px 0 0 0;">${edu.year}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Right Content -->
        <div class="content">
            <!-- Summary -->
            <div style="margin-top: 0;">
                <div class="section-heading" style="margin-top: 0;">PROFESSIONAL SUMMARY</div>
                <div class="heading-underline"></div>
                <p class="summary-text">${summary}</p>
            </div>

            <!-- Experience -->
            ${experience.length > 0 ? `
                <div class="section-heading">WORK EXPERIENCE</div>
                <div class="heading-underline"></div>
                ${experience.map(exp => `
                    <div class="exp-item">
                        <div class="item-header">
                            <div>
                                <span class="item-title">${safe(exp.company)}</span>
                                <span style="margin: 0 4px; color: #cbd5e1;">|</span>
                                <span class="item-subtitle">${safe(exp.role)}</span>
                            </div>
                            <div class="item-meta">${safe(exp.duration)}</div>
                        </div>
                        <div class="item-description">${safe(exp.description)}</div>
                    </div>
                `).join('')}
            ` : ''}

            <!-- Projects -->
            ${projects.length > 0 ? `
                <div class="section-heading">PROJECTS</div>
                <div class="heading-underline"></div>
                ${projects.map(proj => `
                    <div class="proj-item">
                        <div class="item-header">
                            <span class="item-title">${safe(proj.title)}</span>
                            <span class="item-subtitle" style="font-size: 9px;">${safeArray(proj.techStack).join(', ')}</span>
                        </div>
                        <div class="item-description">${safe(proj.description)}</div>
                    </div>
                `).join('')}
            ` : ''}

            <!-- Certifications -->
            ${certificates.length > 0 ? `
                <div class="section-heading">CERTIFICATIONS</div>
                <div class="heading-underline"></div>
                ${certificates.map(cert => `
                    <div class="cert-item">
                        <div class="item-header">
                            <span class="item-title">${safe(cert.name || cert.title)}</span>
                            <span class="item-meta">${safe(cert.year || cert.issueYear)}</span>
                        </div>
                        <div class="item-subtitle">${safe(cert.issuer)}</div>
                    </div>
                `).join('')}
            ` : ''}
        </div>
    </div>
</body>
</html>
    `
}


/**
 * Generates a DOCX file from resume data.
 */
export async function generateDocx(resumeData) {
    const { fullName, email, phoneNumber, location, summary, experience, education, skills, projects } = resumeData

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Header
                new Paragraph({
                    text: fullName,
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: `${email} | ${phoneNumber} | ${location}`,
                    alignment: AlignmentType.CENTER,
                }),

                // Summary
                new Paragraph({ text: 'PROFESSIONAL SUMMARY', heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ children: [new TextRun(summary)] }),

                // Skills
                new Paragraph({ text: 'SKILLS', heading: HeadingLevel.HEADING_2 }),
                ...skills.map(skillGroup => new Paragraph({
                    children: [
                        new TextRun({ text: `${skillGroup.category}: `, bold: true }),
                        new TextRun(skillGroup.items.join(', '))
                    ]
                })),

                // Experience
                new Paragraph({ text: 'EXPERIENCE', heading: HeadingLevel.HEADING_2 }),
                ...experience.flatMap(exp => [
                    new Paragraph({
                        children: [
                            new TextRun({ text: exp.company, bold: true }),
                            new TextRun({ text: ` | ${exp.role}`, italic: true }),
                            new TextRun({ text: `\t${exp.duration}`, bold: true })
                        ]
                    }),
                    new Paragraph({ text: exp.description })
                ]),

                // Education
                new Paragraph({ text: 'EDUCATION', heading: HeadingLevel.HEADING_2 }),
                ...education.map(edu => new Paragraph({
                    children: [
                        new TextRun({ text: edu.institution, bold: true }),
                        new TextRun(` - ${edu.degree}, ${edu.field} (${edu.year})`)
                    ]
                })),

                // Projects
                new Paragraph({ text: 'PROJECTS', heading: HeadingLevel.HEADING_2 }),
                ...projects.flatMap(proj => [
                    new Paragraph({
                        children: [
                            new TextRun({ text: proj.title, bold: true }),
                            new TextRun({ text: ` | ${proj.techStack.join(', ')}`, italic: true })
                        ]
                    }),
                    new Paragraph({ text: proj.description })
                ])
            ]
        }]
    })

    return await Packer.toBuffer(doc)
}
