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
    const phoneNumber = safe(data.phoneNumber)
    const github = safe(data.github)
    const linkedin = safe(data.linkedin)
    const portfolio = safe(data.portfolio)
    const summary = safe(data.summary)
    const experience = safeArray(data.experience)
    const education = safeArray(data.education)
    const skills = safeArray(data.skills)
    const certificates = safeArray(data.certificates)

    // Clean URLs (remove https://)
    const cleanUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${fullName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Merriweather', Georgia, serif;
            background: white;
            color: #0f172a;
            line-height: 1.6;
        }
        
        .container {
            width: 595px;
            min-height: 842px;
            padding: 48px;
            background: white;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        
        /* Header Section */
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 24px;
        }
        
        .header h1 {
            font-size: 36px;
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: -0.025em;
            margin-bottom: 12px;
        }
        
        .contact-info {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        .contact-row {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 4px;
        }
        
        .contact-row span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 180px;
        }
        
        /* Section Styles */
        section {
            margin-bottom: 24px;
        }
        
        .section-title {
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin-bottom: 12px;
            color: #0f172a;
        }
        
        .summary {
            font-size: 14px;
            color: #334155;
            line-height: 1.6;
            text-align: justify;
        }
        
        /* Experience Section */
        .experience-item {
            margin-bottom: 24px;
        }
        
        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 4px;
        }
        
        .experience-company {
            color: #0f172a;
        }
        
        .experience-duration {
            font-size: 10px;
            color: #64748b;
        }
        
        .experience-role {
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            font-style: italic;
            margin-bottom: 8px;
        }
        
        .experience-description {
            font-size: 11px;
            color: #334155;
            line-height: 1.6;
            white-space: pre-line;
            text-align: justify;
        }
        
        /* Skills Section */
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 32px;
        }
        
        .skill-item {
            font-size: 11px;
        }
        
        .skill-category {
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: -0.05em;
            margin-right: 8px;
        }
        
        .skill-items {
            color: #475569;
        }
        
        /* Two Column Layout */
        .two-column {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 48px;
            margin-top: 8px;
        }
        
        /* Education Section */
        .education-item {
            font-size: 11px;
            margin-bottom: 8px;
        }
        
        .education-institution {
            font-weight: 700;
            color: #0f172a;
        }
        
        .education-degree {
            color: #475569;
            font-style: italic;
        }
        
        .education-year {
            font-size: 10px;
            color: #94a3b8;
        }
        
        /* Certifications Section */
        .cert-list {
            list-style: none;
            font-size: 11px;
            color: #475569;
        }
        
        .cert-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        
        .cert-name {
            font-weight: 600;
            color: #1e293b;
        }
        
        .cert-year {
            font-size: 10px;
            color: #94a3b8;
        }
        
        @media print {
            body { margin: 0; padding: 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>${fullName}</h1>
            <div class="contact-info">
                <!-- Row 1: Phone • Email -->
                <div class="contact-row">
                    ${phoneNumber ? `<span>${phoneNumber}</span>` : ''}
                    ${phoneNumber && email ? '<span>•</span>' : ''}
                    ${email ? `<span>${email}</span>` : ''}
                </div>
                
                <!-- Row 2: GitHub • LinkedIn • Portfolio -->
                ${github || linkedin || portfolio ? `
                <div class="contact-row">
                    ${github ? `<span>${cleanUrl(github)}</span>` : ''}
                    ${github && linkedin ? '<span>•</span>' : ''}
                    ${linkedin ? `<span>${cleanUrl(linkedin)}</span>` : ''}
                    ${(github || linkedin) && portfolio ? '<span>•</span>' : ''}
                    ${portfolio ? `<span>${cleanUrl(portfolio)}</span>` : ''}
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Professional Summary -->
        <section>
            <h2 class="section-title">Professional Summary</h2>
            <p class="summary">${summary}</p>
        </section>

        <!-- Experience -->
        <section>
            <h2 class="section-title">Experience</h2>
            ${experience.map(exp => `
                <div class="experience-item">
                    <div class="experience-header">
                        <span class="experience-company">${safe(exp.company)}</span>
                        <span class="experience-duration">${safe(exp.duration)}</span>
                    </div>
                    <div class="experience-role">${safe(exp.role)}</div>
                    <div class="experience-description">${safe(exp.description)}</div>
                </div>
            `).join('')}
        </section>

        <!-- Technical Skills -->
        <section>
            <h2 class="section-title">Technical Skills</h2>
            <div class="skills-grid">
                ${skills.map(group => `
                    <div class="skill-item">
                        <span class="skill-category">${safe(group.category)}:</span>
                        <span class="skill-items">${Array.isArray(group.items) ? group.items.join(', ') : safe(group.items)}</span>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- Education & Certifications -->
        <div class="two-column">
            <!-- Education -->
            <section>
                <h2 class="section-title">Education</h2>
                ${education.map(edu => `
                    <div class="education-item">
                        <div class="education-institution">${safe(edu.institution)}</div>
                        <div class="education-degree">${safe(edu.degree)}${edu.field ? ` in ${edu.field}` : ''}</div>
                        <div class="education-year">${safe(edu.year || edu.duration)}</div>
                    </div>
                `).join('')}
            </section>

            <!-- Certifications -->
            ${certificates.length > 0 ? `
            <section>
                <h2 class="section-title">Certifications</h2>
                <ul class="cert-list">
                    ${certificates.map(cert => `
                        <li class="cert-item">
                            <span class="cert-name">${safe(cert.name || cert.title)}</span>
                            <span class="cert-year">${safe(cert.year || cert.issueYear)}</span>
                        </li>
                    `).join('')}
                </ul>
            </section>
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
