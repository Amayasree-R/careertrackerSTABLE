import ResumeParserService from '../services/resumeParserService.js';

const sampleResumeText = `
JOHN DOE
Software Engineer | San Francisco, CA
john.doe@email.com | (555) 012-3456

SUMMARY
Experienced software engineer with a focus on web technologies and cloud architecture.

EXPERIENCE
Google - Senior Software Engineer
Jan 2020 - Present
- Led the development of a high-traffic microservice using Node.js and Go.
- Optimized database queries, reducing latency by 40%.
- Mentored junior developers and conducted code reviews.

Meta | Software Engineer Intern
Jun 2019 - Dec 2019
- Built a real-time dashboard using React and GraphQL.
- Refactored legacy PHP code to improve maintainability.

EDUCATION
Stanford University
Bachelor of Science in Computer Science
Graduated 2019

PROJECTS
Skill Tracker (React, Node.js, MongoDB)
- Developed a full-stack application to track career progress.
- Implemented JWT authentication and RESTful APIs.

Cloud Optimizer
- Created a tool to monitor and optimize AWS resource usage.
- Used Python and Boto3 for infrastructure management.

SKILLS
Languages: JavaScript, TypeScript, Go, Python, SQL
Frameworks: React, Node.js, Express, Next.js
Tools: Docker, Kubernetes, AWS, Git, Jira

CERTIFICATIONS
Programming in C (NPTEL), Git & GitHub Basics, Python for Beginners

DECLARATION
I hereby declare that the above information is true to the best of my knowledge.
`;

async function testParser() {
    console.log('--- Starting Parser Test ---');
    try {
        const results = await ResumeParserService.parseResumeText(sampleResumeText);

        console.log('\n- Skills -');
        console.log(results.skills);

        console.log('\n- Experience -');
        results.experience.forEach((exp, i) => {
            console.log(`${i + 1}. ${exp.role} at ${exp.company} (${exp.duration})`);
            console.log(`   Desc: ${exp.description.substring(0, 50)}...`);
        });

        console.log('\n- Education -');
        results.education.forEach((edu, i) => {
            console.log(`${i + 1}. ${edu.degree} from ${edu.institution} (${edu.year})`);
        });

        console.log('\n- Projects -');
        results.projects.forEach((proj, i) => {
            console.log(`${i + 1}. ${proj.title}`);
            console.log(`   Tech: ${proj.techStack.join(', ')}`);
        });

        console.log('\n- Certifications -');
        results.certifications.forEach((cert, i) => {
            console.log(`${i + 1}. ${cert.name} by ${cert.issuer} (${cert.date})`);
        });

        console.log('\n--- Test Completed Successfully ---');
    } catch (error) {
        console.error('Test Failed:', error);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

testParser();
