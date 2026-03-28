# Quiz System Documentation

## 1. Overview
The Quiz System is an essential assessment module used to validate a user's unverified self-claimed skills. By passing an assessment, a user's skill state changes from "Learning" to "Mastered".

## 2. Key Features
- **Dynamic Question Generation:** Quizzes can be fetched from a static database or dynamically generated via AI depending on the specific skill and difficulty level.
- **Timed Assessments:** Countdowns add a layer of challenge and prevent external lookup during testing.
- **Multiple formats:** Multiple choice, multiple select, and short answer (if parsed by NLP).
- **Instant Feedback:** Shows correct vs incorrect answers immediately upon submission, alongside a final score.
- **Auto-Mastery Link:** Passing a quiz (e.g., >80% score) directly triggers a database update moving the specific skill to the "Mastered" array on the User's profile.

## 3. Data Architecture & Schema
The Quiz and Assessment Schema structures typically include:
- **Question Schema:**
  - `skill` (String): The skill being tested (e.g., "React").
  - `difficulty` (String): e.g., Beginner, Intermediate, Advanced.
  - `questionText` (String): The actual query.
  - `options` (Array of Strings): Possible answers.
  - `correctAnswer` (String/Index): The true answer.
- **Attempt Schema:**
  - `userId`: Reference to the user.
  - `skill` (String): Tested skill.
  - `score` (Number): Percentage achieved.
  - `passed` (Boolean): Calculated against the threshold.
  - `date`: Timestamp.

## 4. User Flow
1. **Initiation:** User navigates to their profile and clicks "Verify Skill" next to an unverified technical skill.
2. **Preparation:** User is presented with the rules (e.g., "10 Questions, 5 Minutes").
3. **Execution:** User answers questions sequentially.
4. **Submission:** User submits the quiz.
5. **Result & Action:** The UI displays the score. If passed, the skill instantly updates to "Mastered" with visual confetti. If failed, a cooldown timer (e.g., 24 hours) may restrict immediate retries.

## 5. Potential Enhancements
- Code-execution for technical quizzes (e.g., Leetcode-style playgrounds) instead of just multiple choice.
- Adaptive difficulty—if a user answers a question wrong, the next question becomes slightly easier to gauge exact proficiency.
