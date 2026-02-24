
import dotenv from 'dotenv';
import fs from 'fs';
import { matchSkillStrictly } from './services/skillMatchingService.js';

dotenv.config();

async function verifySkillMatching() {
    let output = '--- TESTING STRICT SKILL MATCHING ---\n';

    const targetSkills = ['JavaScript', 'React', 'Node.js', 'Java', 'Python'];

    const testCases = [
        { extracted: 'React.js', expectedMatch: true, expectedSkill: 'React', label: 'Alias Match (React.js -> React)' },
        { extracted: 'Java', expectedMatch: true, expectedSkill: 'Java', label: 'Exact Match (Java)' },
        { extracted: 'JavaScript', expectedMatch: true, expectedSkill: 'JavaScript', label: 'Exact Match (JS)' },
        { extracted: 'Vue.js', expectedMatch: false, expectedSkill: null, label: 'No Match (Vue.js)' },
        { extracted: 'Java', target: ['JavaScript'], expectedMatch: false, expectedSkill: null, label: 'Strict Rule (Java != JS)' },
        { extracted: 'Node.js', target: ['Express.js'], expectedMatch: false, expectedSkill: null, label: 'Strict Rule (Node != Express)' }
    ];

    for (const tc of testCases) {
        output += `Testing ${tc.label}... `;
        const targets = tc.target || targetSkills;
        const result = await matchSkillStrictly(tc.extracted, targets);

        const success = result.matchFound === tc.expectedMatch &&
            (tc.expectedMatch ? result.matchedSkill === tc.expectedSkill : true);

        if (success) {
            output += `✅ PASS (Confidence: ${result.confidence || 0}%)\n`;
        } else {
            output += `❌ FAIL\n`;
            output += `   Result: ${JSON.stringify(result)}\n`;
        }
    }

    fs.writeFileSync('matching_results.txt', output);
    console.log('Results written to matching_results.txt');
}

verifySkillMatching();
