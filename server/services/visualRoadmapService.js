import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateRoadmap } from './roadmapGenerator.js';

/**
 * Generates a tiered visual roadmap using Gemini AI.
 * Falls back to a priority-based structure if Gemini fails.
 * 
 * @param {Object} profile - User profile containing targetJob, experienceLevel, etc.
 * @returns {Promise<Object>} The tiered roadmap object.
 */
export async function generateVisualRoadmap(profile) {
  try {
    // 1. Get raw learning path data from the existing service
    const roadmapData = await generateRoadmap(profile);
    const learningPath = roadmapData.learningPath || [];

    // 2. Prepare Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY missing. Using fallback tiered roadmap.');
      return generateFallbackRoadmap(learningPath);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = "You are an expert career learning path architect. Your job is to take a list of technical skills and organize them into a structured, visual learning roadmap. You must analyze dependencies between skills, group skills into ordered TIERS (Tier 0 = Mastered, Tier 1 = learn first, etc.), assign each skill a category (Language, Framework, Tool, Database, DevOps), and for each non-mastered skill return 3 real course resources with working URLs from Udemy, Coursera, YouTube, or official docs. Return ONLY valid JSON, no markdown.";

    const userPrompt = `
      Target Job: ${profile.targetJob}
      Experience Level: ${profile.experienceLevel}
      
      Learning Path Data:
      ${JSON.stringify(learningPath, null, 2)}
      
      Organize these skills into the requested JSON structure.
    `;

    // 3. Call Gemini
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const responseText = result.response.text();
    
    // Clean potential markdown if Gemini ignores "no markdown" instruction
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    
    try {
      const tieredRoadmap = JSON.parse(jsonString);
      return tieredRoadmap;
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError);
      return generateFallbackRoadmap(learningPath);
    }

  } catch (error) {
    console.error('generateVisualRoadmap error:', error);
    // Fallback logic
    try {
      const roadmapData = await generateRoadmap(profile);
      return generateFallbackRoadmap(roadmapData.learningPath || []);
    } catch (fallbackError) {
      console.error('Complete failure in generateVisualRoadmap:', fallbackError);
      throw error;
    }
  }
}

/**
 * Fallback function to structure roadmap into tiers based on priority.
 */
function generateFallbackRoadmap(learningPath) {
  const tiers = [
    { tier: 0, label: "Mastered", skills: [] },
    { tier: 1, label: "Start Here", skills: [] },
    { tier: 2, label: "Next Steps", skills: [] },
    { tier: 3, label: "Advanced/Optional", skills: [] }
  ];

  learningPath.forEach(item => {
    const skillData = {
      skill: item.skill,
      status: item.status || (item.priority ? "To Learn" : "Unknown"),
      category: "General", // Best guess
      estimatedTime: item.estimatedTime || "TBD",
      dependencies: [],
      resources: item.resources || []
    };

    if (item.status === "Mastered" || item.estimatedTime === "Completed") {
      tiers[0].skills.push({ ...skillData, status: "Mastered", estimatedTime: "Completed" });
    } else if (item.priority === "High") {
      tiers[1].skills.push({ ...skillData, priority: "High" });
    } else if (item.priority === "Medium") {
      tiers[2].skills.push({ ...skillData, priority: "Medium" });
    } else {
      tiers[3].skills.push({ ...skillData, priority: "Low" });
    }
  });

  return { tiers: tiers.filter(t => t.skills.length > 0) };
}
