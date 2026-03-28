# Job Matches Documentation

## 1. Overview
The Job Matches system is designed to provide users with tailored career opportunities by analyzing their current skills, projects, and experiences against scraping data or APIs from major job boards.

## 2. Key Features
- **Algorithmic Matching:** Evaluates the user's mastered skills and profile keywords against job descriptions to calculate a "Match Score" (e.g., 85% match).
- **Skill Gap Analysis:** Highlights the missing skills required for a particular job opening, providing direct links to external resources or internal roadmap goals.
- **Save/Apply Later:** Users can bookmark jobs they are interested in.
- **Industry Trends:** Displays an aggregated view of the most demanded skills in their desired field based on recent job postings.
- **Direct Apply Links:** If enabled, provides a direct URL to apply on the employer's page or supported platforms (like LinkedIn/Indeed).

## 3. Data Architecture & Schema
The Job Schema and Match logic relies heavily on:
- `jobId` (String): Unique identifier.
- `title` (String): Position title.
- `company` (String): Employer name.
- `location` (String): Geographic or Remote.
- `requiredSkills` (Array of Strings): Skills necessary for the role.
- `matchPercentage` (Number, virtual/calculated): Derived value per user.
- `isSaved` (Boolean): User-specific metadata mapping.

## 4. User Flow
1. **Profile Sync:** System runs a match routine upon user profile update.
2. **Dashboard Navigation:** User clicks on "Job Matches" in their dashboard.
3. **Filtering:** User sorts jobs by match percentage, date posted, or location.
4. **Insights View:** User expands a job card to see what skills match and what they are lacking.
5. **Action:** User saves the job to apply later, or clicks through to apply immediately.

## 5. Potential Enhancements
- Cover letter generation based on the specific job description and the user's resume using LLMs (e.g., OpenAI API).
- Salary insights for matched roles based on regional data.
