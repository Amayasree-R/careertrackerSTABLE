# Career Tracker - Project Documentation

## 1. Project Overview

**Career Tracker** is a comprehensive full-stack application designed to help users navigate their career paths in the tech industry. It provides tools for assessing current skills, generating personalized learning roadmaps, closing skill gaps through quizzes, and building ATS-friendly resumes with AI assistance.

## 2. Technology Stack

*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion (animations), Recharts (data visualization).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose ODM).
*   **AI Integration**: Groq SDK (Llama-3.3-70b) for dynamic content generation (Quizzes, Resume Enhancement).
*   **Authentication**: JWT (JSON Web Tokens).

## 3. Core Modules

### 3.1 Authentication & User Profile
*   **Overview**: Secure access management and comprehensive user profiling.
*   **Key Features**:
    *   Signup/Login with JWT.
    *   Detailed profile storage: Education, Experience, Social Links.
    *   Career specific data: Target Job, Current Status, Primary Tech Stack.
*   **Files**: `src/pages/Signup.jsx`, `src/pages/Login.jsx`, `server/models/User.js`.

### 3.2 Dashboard & Career Roadmap
*   **Overview**: The central hub for tracking career progress.
*   **Key Features**:
    *   **Skill Fingerprint (Radar Chart)**: Visualizes user's strength across different skill categories compared to the target role.
    *   **Interactive Roadmap**: Lists skills with priorities (High/Medium/Low) and status (To Learn, Learning, Mastered).
    *   **Progress Tracking**: Visual indicators for roadmap completion.
*   **Files**: `src/pages/Dashboard.jsx`, `src/pages/Roadmap.jsx`.

### 3.3 Skill Gap Analysis
*   **Overview**: Analyzes the difference between the user's current skills and industry demands for their target role.
*   **Key Features**:
    *   **Match Percentage**: Calculates how well the user fits the target role.
    *   **Classification**:
        *   Matched Skills (Green)
        *   Missing Skills (Red)
    *   **Recommendations**: Categorizes missing skills into Critical, Important, and Nice-to-have.
*   **Files**: `src/components/SkillGapAnalysis.jsx`, `server/controllers/profileController.js` (logic derived from backend).

### 3.4 Quiz System (Skill Verification)
*   **Overview**: Validates skill mastery through AI-generated assessments.
*   **Mechanism**: Generates 25 MCQs dynamically. A score of >90% marks a skill as "Mastered".
*   **Documentation**: See [QUIZ_SYSTEM_DOCUMENTATION.md](./QUIZ_SYSTEM_DOCUMENTATION.md) for full details.

### 3.5 AI Resume Builder
*   **Overview**: Advanced tool for creating and managing resumes.
*   **Key Features**:
    *   **AI Enhancement**: Uses Groq AI to rewrite summaries and experience descriptions for better impact.
    *   **Versioning**: Save multiple versions of a resume (e.g., tailored for different roles).
    *   **Export**: Generate PDF or DOCX downloads.
    *   **Real-time Preview**: Split-screen editor and preview.
*   **Files**: `src/pages/ResumeBuilder.jsx`, `server/routes/resume.js`, `server/controllers/resumeController.js`.

## 4. Database Schema

### User Model (`User.js`)
The central entity containing:
*   **Identity**: `username`, `email`, `password` (hashed).
*   **Profile**: `currentSkills`, `masteredSkills` (with scores), `targetJob`.
*   **Resume Data**: Nested structure for parsed/generated resume content (`education`, `experience`, `projects`).
*   **Meta**: `resumeVersions`, `skillAnalysis` results.

### SkillDetail Model (`SkillDetail.js`)
Stores metadata about skills:
*   `skill`: Name (e.g., "React").
*   `description`, `whyItMatters`.
*   `resources`: Links to learning materials (Videos, Articles).
*   **TTL**: Auto-deletes after 30 days (`expires: '30d'`) implies a caching strategy for gathered skill info.

## 5. API Architecture

All routes are prefixed with `/api` and typically require `Authorization: Bearer <token>`.

| Route Prefix | Description | Key Endpoints |
|--------------|-------------|---------------|
| `/api/auth` | Authentication | `/signup`, `/login` |
| `/api/profile`| User Profile | `/`, `/toggle-skill`, `/focus-skill` |
| `/api/roadmap`| Roadmap Gen | `/` (Generates path based on profile) |
| `/api/quiz` | Quiz Gen | `/:skill` (Fetches questions) |
| `/api/resume` | Resume Tools | `/generate`, `/enhance-text`, `/save-version` |

## 6. Usage Workflow

1.  **Onboarding**: User signs up and inputs current skills + target job.
2.  **Analysis**: System generates a Roadmap and Skill Gap Analysis.
3.  **Learning**: User marks skills as "Learning".
4.  **Verification**: User takes Quizzes for "Learning" skills.
    *   pass -> Skill becomes "Mastered".
5.  **Application**: User builds a resume using the Resume Builder, pulling in their verified skills and specific experience.
