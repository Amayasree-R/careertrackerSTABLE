import { generateProfessionalHtml } from '../services/exportService.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const mockData = {
    fullName: 'Arjun Sharma',
    targetJobRole: 'Senior Full Stack Engineer',
    email: 'arjun.sharma@example.com',
    phoneNumber: '+91 98765 43210',
    location: {
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India'
    },
    github: 'https://github.com/arjunsharma',
    linkedin: 'https://linkedin.com/in/arjunsharma',
    summary: 'Senior Full Stack Engineer with 8+ years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. Proven track record of leading teams and delivering high-quality software solutions in fast-paced environments.',
    skills: [
        { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
        { category: 'Backend', items: ['Node.js', 'Express.js', 'NestJS', 'PostgreSQL', 'MongoDB'] },
        { category: 'DevOps', items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'] }
    ],
    masteredSkills: [
        { skill: 'React', score: 98 },
        { skill: 'Node.js', score: 95 },
        { skill: 'System Design', score: 92 }
    ],
    experience: [
        {
            company: 'TechFlow Solutions',
            role: 'Lead Full Stack Engineer',
            duration: 'Jan 2021 - Present',
            description: '• Architected and developed a microservices-based e-commerce platform using NestJS and React.\n• Improved system performance by 40% through optimized database queries and caching strategies.\n• Led a team of 6 engineers and implemented agile methodologies.'
        },
        {
            company: 'DataScale Inc.',
            role: 'Senior Software Engineer',
            duration: 'Jun 2017 - Dec 2020',
            description: '• Developed high-traffic data visualization dashboards using D3.js and React.\n• Managed AWS infrastructure and implemented automated deployment pipelines.'
        }
    ],
    projects: [
        {
            title: 'OpenQuest AI',
            techStack: ['OpenAI API', 'Next.js', 'Pinecone'],
            description: 'An AI-powered quest generator for tabletop RPGs, featuring vector-based story retrieval and dynamic world-building.'
        },
        {
            title: 'CloudMonitor',
            techStack: ['Go', 'Prometheus', 'Grafana'],
            description: 'Real-time infrastructure monitoring tool with anomaly detection and automated alerting.'
        }
    ],
    education: [
        {
            institution: 'Indian Institute of Technology, Madras',
            degree: 'B.Tech',
            field: 'Computer Science',
            year: '2016'
        }
    ],
    certificates: [
        {
            name: 'AWS Solutions Architect Professional',
            issuer: 'Amazon Web Services',
            year: '2022'
        },
        {
            name: 'Google Cloud Professional Cloud Architect',
            issuer: 'Google Cloud',
            year: '2021'
        }
    ]
}

const html = generateProfessionalHtml(mockData)
const outputPath = path.join(__dirname, 'resume_preview.html')

fs.writeFileSync(outputPath, html)
console.log(`✅ Success! Preview HTML generated at: ${outputPath}`)
