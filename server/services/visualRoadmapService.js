import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateRoadmap } from './roadmapGenerator.js';

function buildResources(skillName) {
  const encoded = encodeURIComponent(skillName);
  return [
    {
      name: `${skillName} - Full Course`,
      platform: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${encoded}+full+course`,
      free: true
    },
    {
      name: `${skillName} - The Complete Guide`,
      platform: 'Udemy',
      url: `https://www.udemy.com/courses/search/?q=${encoded}`,
      free: false
    },
    {
      name: `${skillName} - Official Documentation`,
      platform: 'Official Docs',
      url: `https://www.google.com/search?q=${encoded}+official+documentation`,
      free: true
    }
  ];
}

function enrichTiers(tiers) {
  return tiers.map(tier => ({
    ...tier,
    skills: tier.skills.map(skill => ({
      ...skill,
      resources: skill.status === 'Mastered'
        ? []
        : (!skill.resources || skill.resources.length === 0)
          ? buildResources(skill.skill)
          : skill.resources
    }))
  }));
}

export async function generateVisualRoadmap(profile, existingCache = null) {
  try {
    // If a cached roadmap exists, only update mastery statuses — never regenerate
    if (existingCache && existingCache.tiers && existingCache.tiers.length > 0) {
      const masteredSkills = (Array.isArray(profile.masteredSkills)
        ? profile.masteredSkills.map(s => (typeof s === 'object' ? s.skill : s)?.toLowerCase())
        : []
      ).filter(Boolean);

      // Update status in-place — never move skills between tiers
      const updatedTiers = existingCache.tiers
        .filter(tier => tier.label?.toLowerCase() !== 'mastered' && tier.tier !== 0)
        .map(tier => ({
          ...tier,
          skills: tier.skills.map(skill => ({
            ...skill,
            status: masteredSkills.includes(skill.skill?.toLowerCase()) ? 'Mastered' : 'To Learn',
            resources: masteredSkills.includes(skill.skill?.toLowerCase())
              ? []
              : (skill.resources?.length > 0 ? skill.resources : buildResources(skill.skill))
          }))
        }));

      return {
        ...existingCache,
        tiers: updatedTiers
      };
    }

    // No cache exists — generate fresh for the first time only
    const roadmapData = await generateRoadmap(profile);
    const learningPath = roadmapData.learningPath || [];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY missing. Using fallback tiered roadmap.');
      return generateFallbackRoadmap(learningPath);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = "You are an expert career learning path architect. Organize the given skills into a tiered visual learning roadmap. Group skills into ordered TIERS (Tier 0 = Mastered, Tier 1 = learn first, etc.), assign each skill a category (Language, Framework, Tool, Database, DevOps), estimate time to learn, list dependencies, set priority (High/Medium/Low), and set status (Mastered or To Learn). Do NOT include any resources or course links — only structural organization. Return ONLY valid raw JSON, no markdown fences.";

    const userPrompt = `
      Target Job: ${profile.targetJob}
      Experience Level: ${profile.experienceLevel}

      Learning Path Data:
      ${JSON.stringify(learningPath, null, 2)}

      Return a JSON object with this exact shape (no resources field):
      {
        "tiers": [
          {
            "tier": 0,
            "label": "Mastered",
            "skills": [
              {
                "skill": "JavaScript",
                "status": "Mastered",
                "category": "Language",
                "estimatedTime": "Completed",
                "dependencies": [],
                "priority": "High"
              }
            ]
          }
        ]
      }
    `;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt }
    ]);

    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json|```/g, '').trim();

    try {
      const tieredRoadmap = JSON.parse(jsonString);
      tieredRoadmap.tiers = enrichTiers(
        tieredRoadmap.tiers.filter(t => t.label?.toLowerCase() !== 'mastered' && t.tier !== 0)
      );
      return tieredRoadmap;
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', parseError);
      return generateFallbackRoadmap(learningPath);
    }

  } catch (error) {
    console.error('generateVisualRoadmap error:', error);
    try {
      const roadmapData = await generateRoadmap(profile);
      return generateFallbackRoadmap(roadmapData.learningPath || []);
    } catch (fallbackError) {
      console.error('Complete failure in generateVisualRoadmap:', fallbackError);
      throw error;
    }
  }
}

function generateFallbackRoadmap(learningPath) {
  const tiers = [
    { tier: 1, label: "Start Here", skills: [] },
    { tier: 2, label: "Next Steps", skills: [] },
    { tier: 3, label: "Advanced/Optional", skills: [] }
  ];

  learningPath.forEach(item => {
    const isMastered = item.status === 'Mastered' || item.estimatedTime === 'Completed';
    const skillData = {
      skill: item.skill,
      status: isMastered ? 'Mastered' : (item.status || 'To Learn'),
      category: 'General',
      estimatedTime: isMastered ? 'Completed' : (item.estimatedTime || 'TBD'),
      dependencies: [],
      resources: isMastered ? [] : buildResources(item.skill)
    };

    if (item.priority === 'High' || (!item.priority && isMastered)) {
      tiers[0].skills.push({ ...skillData, priority: 'High' });
    } else if (item.priority === 'Medium') {
      tiers[1].skills.push({ ...skillData, priority: 'Medium' });
    } else {
      tiers[2].skills.push({ ...skillData, priority: 'Low' });
    }
  });

  return { tiers: tiers.filter(t => t.skills.length > 0) };
}
