import express from 'express'
import jwt from 'jsonwebtoken'
import Groq from 'groq-sdk'
import SkillDetail from '../models/SkillDetail.js'

const router = express.Router()

let groqInstance = null
const getGroqClient = () => {
  if (!groqInstance) {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      throw new Error('GROQ_API_KEY is missing in .env file')
    }
    groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqInstance
}

// Inline token verification — same logic your auth.js uses
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

router.post('/skill-detail', verifyToken, async (req, res) => {
  const { skill, targetJob } = req.body
  const normalizedSkill = skill?.toLowerCase().trim()
  const normalizedJob = (targetJob || 'software developer').toLowerCase().trim()

  if (!normalizedSkill) {
    return res.status(400).json({ message: 'Skill name is required' })
  }

  try {
    // 1. Try Cache First
    const cached = await SkillDetail.findOne({ skill: normalizedSkill, targetJob: normalizedJob })
    if (cached) {
      // console.log(`[Cache Hit] ${normalizedSkill}`)
      return res.json(cached)
    }

    // 2. Call AI if no cache
    const prompt = `You are a career advisor and technical educator. A user is preparing for a ${normalizedJob} role and wants to learn "${skill}".

Generate a detailed but concise response in the following JSON format (no markdown, no extra text, just valid JSON):

{
  "description": "A 2-3 sentence explanation of what ${skill} is, what it does, and why developers use it. Be specific and technical but accessible.",
  "whyItMatters": "1-2 sentences on why ${skill} is specifically important for a ${normalizedJob} role in 2025.",
  "resources": [
    {
      "type": "Docs",
      "name": "Official documentation or authoritative reference name",
      "url": "https://actual-working-url.com",
      "difficulty": "Beginner | Intermediate | Advanced"
    },
    {
      "type": "Course",
      "name": "A well-known course or tutorial platform name",
      "url": "https://actual-working-url.com",
      "difficulty": "Beginner | Intermediate | Advanced"
    },
    {
      "type": "Video",
      "name": "A specific video resource or YouTube channel known for this topic",
      "url": "https://actual-working-url.com",
      "difficulty": "Beginner | Intermediate | Advanced"
    },
    {
      "type": "Practice",
      "name": "A hands-on practice platform or project resource",
      "url": "https://actual-working-url.com",
      "difficulty": "Beginner | Intermediate | Advanced"
    },
    {
      "type": "Tutorial",
      "name": "A step-by-step tutorial or guide",
      "url": "https://actual-working-url.com",
      "difficulty": "Beginner | Intermediate | Advanced"
    }
  ]
}

REQUIREMENTS:
- Return ONLY valid JSON, nothing else. No markdown.
- All URLs must be real, well-known, working resources for ${skill}.
- Include exactly 5 resources with diverse types (Docs, Course, Video, Practice, Tutorial).
- Use real resource names (e.g. MDN Web Docs, freeCodeCamp, The Odin Project, etc).`

    const groq = getGroqClient()
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant', // Switch to 8B for speed and token efficiency
      response_format: { type: 'json_object' },
    })

    const text = chatCompletion.choices[0].message.content
    const detail = JSON.parse(text)

    // Validate shape
    if (!detail.description || !detail.resources) {
      throw new Error('Incomplete AI response')
    }

    // 3. Save to Cache
    const newCache = new SkillDetail({
      skill: normalizedSkill,
      targetJob: normalizedJob,
      ...detail
    })
    await newCache.save()

    res.json(detail)
  } catch (error) {
    console.error('Skill detail error:', error.message)

    // Graceful fallback — return a basic structure so the UI doesn't break
    res.json({
      description: `${skill} is a key technology used in modern software development. It plays an important role in building scalable, efficient applications.`,
      whyItMatters: `For a ${targetJob || 'developer'} role, proficiency in ${skill} is increasingly expected by top employers.`,
      resources: [
        {
          type: 'Search',
          name: `Learn ${skill} - YouTube`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial for beginners')}`,
          difficulty: 'Beginner'
        },
        {
          type: 'Docs',
          name: `${skill} Documentation`,
          url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' official documentation')}`,
          difficulty: 'Intermediate'
        }
      ]
    })
  }
})

export default router

