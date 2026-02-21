import Groq from 'groq-sdk'

let groqInstance = null
const getGroqClient = () => {
    if (!groqInstance) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing in .env file')
        }
        groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY })
    }
    return groqInstance
}

export async function generateQuiz(skill, attempt = 1, previousTopics = "") {
    console.log(`\n=== Generating Quiz for Skill: ${skill} (Attempt: ${attempt}) ===`)

    try {
        const prompt = `IMPORTANT SYSTEM CONSTRAINT:
This quiz is being generated using a SMALL, FAST language model
(llama-3.1-8b-instant).
Design questions that are precise, concise, and efficient.
Avoid unnecessary verbosity.

GOAL:
Generate a NEW and UNIQUE set of exactly 25 multiple-choice questions (MCQs)
for the skill: "${skill}".

CONTEXT:
- This is attempt number ${attempt} for the skill "${skill}".
- The user has already taken a quiz for this skill and FAILED.
- The user is retrying the quiz.
- Each retry MUST produce a completely different set of questions.

CRITICAL ANTI-REPETITION RULES (MUST FOLLOW):
1. Questions MUST be different from all previous attempts for this skill.
2. Do NOT repeat:
   - question wording
   - question intent
   - examples
   - code snippets
   - scenarios
3. Even if a topic overlaps, the framing, logic, and angle MUST be different.
4. Avoid very common or overused interview questions.

ANTI-REPETITION CONTEXT:
Previously covered concepts/questions for "${skill}":
${previousTopics || "None (First Attempt)"}

QUESTION DESIGN RULES:
- Mix difficulty levels: easy, medium, hard
- Use diverse styles:
  - conceptual understanding
  - code output prediction
  - debugging scenarios
  - best-practice decisions
- Keep questions concise and clear (optimized for an 8B model)
- Do NOT include explanations
- Do NOT include hints
- Do NOT use markdown
- Do NOT add any text outside JSON

FORMAT RULES (STRICT):
- Generate EXACTLY 25 questions
- EACH question MUST contain:
  - id
  - difficulty
  - question
  - exactly 4 options
  - correctOption
- Return ONLY valid JSON

OUTPUT FORMAT:
{
  "skill": "${skill}",
  "attempt": ${attempt},
  "questions": [
    {
      "id": 1,
      "difficulty": "easy | medium | hard",
      "question": "Question text here",
      "options": ["A", "B", "C", "D"],
      "correctOption": "A"
    }
  ]
}`

        const groq = getGroqClient()
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' },
            temperature: 0.7
        })

        let text = chatCompletion.choices[0].message.content

        console.log('DEBUG: Raw AI Response:', text)

        // Clean up markdown if present
        if (text.includes('```json')) {
            text = text.replace(/```json\n?|\n?```/g, '').trim()
        } else if (text.includes('```')) {
            text = text.replace(/```\n?|\n?```/g, '').trim()
        }

        let parsed;
        try {
            parsed = JSON.parse(text)
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError)
            console.error('Failed Text:', text)
            throw new Error('AI returned invalid JSON: ' + parseError.message)
        }

        // Extract questions array
        let questions = [];
        if (parsed.questions && Array.isArray(parsed.questions)) {
            questions = parsed.questions;
        } else if (Array.isArray(parsed)) {
            questions = parsed;
        } else {
            const potentialArray = Object.values(parsed).find(val => Array.isArray(val))
            if (potentialArray) {
                questions = potentialArray;
            }
        }

        if (!questions || questions.length === 0) {
            throw new Error('Invalid quiz format received from AI')
        }

        // Map correctOption to correctAnswer for frontend compatibility
        const mappedQuestions = questions.map(q => {
            let correctAnswerString = q.correctOption;

            // If correctOption is a single letter (A,B,C,D), map it to the option text
            if (/^[A-D]$/i.test(q.correctOption) && q.options && q.options.length >= 4) {
                const index = q.correctOption.toUpperCase().charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1...
                if (q.options[index]) {
                    correctAnswerString = q.options[index];
                }
            }

            return {
                ...q,
                correctAnswer: correctAnswerString
            };
        });

        console.log(`✓ Generated ${mappedQuestions.length} questions for ${skill}`)
        return mappedQuestions

    } catch (error) {
        console.error('Quiz generation error:', error)

        // Check for Rate Limit error
        if (error.message.includes('429') || error.message.includes('Rate limit') || error.message.includes('tokens')) {
            console.warn('⚠️ Rate Limit exceeded. Using Fallback Quiz.')
            try {
                const fallbackModule = await import('../data/fallbackQuiz.js')
                return fallbackModule.FALLBACK_QUIZ.questions
            } catch (importError) {
                console.error('Failed to load fallback quiz:', importError)
            }
        }

        // Fallback for ANY error to keep demo running
        try {
            const fallbackModule = await import('../data/fallbackQuiz.js')
            return fallbackModule.FALLBACK_QUIZ.questions
        } catch {
            throw new Error('Failed to generate quiz. Please try again.')
        }
    }
}
