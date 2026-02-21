# Project Review: Skill Career Tracker

## 1. Project Overview
"Skill Career Tracker" is a full-stack web application designed to help users navigate their career path. It assesses a user's current skills against a target job role, identifies skill gaps, and generates a personalized learning roadmap using AI. The application features a modern, responsive UI and a robust backend for data management.

 **Key Value Props:**
*   **Personalization:** Tailored roadmaps based on individual skill profiles.
*   **AI-Powered:** Uses Large Language Models (LLMs) via Groq SDK to generate intelligent insights and quizzes.
*   **Actionable:** Provides concrete steps, resources, and project recommendations to bridge skill gaps.
*   **Gamification:** Quiz system with scoring to track mastery.

## 2. Frontend Architecture
The frontend is built with **React** using **Vite** for fast development and bundling.

*   **Framework:** React 18+
*   **Styling:** Tailwind CSS for utility-first styling, ensuring a clean and responsive design.
*   **Routing:** `react-router-dom` handles client-side navigation (Dashboard, Profile, Roadmap, Quiz).
*   **State Management:** React `useState` and `useEffect` hooks, along with `localStorage` for persisting user sessions and basic profile data.
*   **Visualizations:** `recharts` is used for rendering data visuals like the Radar Chart for skill fingerprinting.
*   **Key Components:**
    *   `Dashboard` - The central hub displaying stats, skill radar chart, and navigation.
    *   `ProfileForm` - Collects user data (current skills, target role).
    *   `Roadmap` - Displays the AI-generated learning path, progress bars, and resource links.
    *   `Quiz` - Interactive component for testing skill mastery.
    *   `Signup`/`Login` - Authentication forms.

## 3. Backend Architecture
The backend is a **RESTful API** built with **Node.js** and **Express**.

*   **Server:** Express.js handling HTTP requests/responses.
*   **Authentication:** JWT (JSON Web Tokens) for secure, stateless authentication. Passwords are hashed using `bcryptjs`.
*   **AI Integration:**
    *   Uses **Groq SDK** to interface with high-performance LLMs (e.g., Llama 3).
    *   Generates skill gap analyses, learning roadmaps, and quiz questions dynamically.
*   **Key Dependencies:** `express`, `mongoose`, `cors`, `dotenv`, `groq-sdk`, `jsonwebtoken`, `bcryptjs`.

## 4. Database
The application uses **MongoDB** (specifically MongoDB Atlas) for data persistence, modeled with **Mongoose**.

**Core Data Models:**
*   **User (`User.js`):** Stores user credentials, profile data (skills, target job), and career info (education, experience).
    *   *Key Fields:* `username`, `password`, `profile` (targetJob, currentSkills, learningSkills, completedSkills), `skillAnalysis` (snapshot of AI analysis).
*   **Other Potential Models (Implied):** While `User` is the primary model seen, complex apps often separate `Roadmaps` or `QuizResults` into their own collections, though this current iteration seems to embed much of this within the User profile or generate it on-the-fly.

## 5. Working Flow
1.  **Onboarding:** User signs up/logs in.
2.  **Profile Creation:** User enters their current technical skills and their desired target job role.
3.  **Analysis (AI):** The backend sends this profile to the AI, which determines missing skills and generates a roadmap.
4.  **Dashboard:** User views their "Skill Fingerprint" (Radar Chart), progress stats, and a list of skills to learn.
5.  **Learning Loop:**
    *   User selects a skill to focus on.
    *   User views resources/roadmap for that skill.
    *   User takes a quiz to prove mastery.
    *   If passed, the skill moves to "Mastered," updating the charts and progress.

## 6. File Structure
The project follows a standard MERN separation of concerns:

```
/skill-career-tracker
├── /public              # Static assets
├── /src                 # Frontend Functionality
│   ├── /components      # Reusable UI components (SkillTooltip, ResumePreview, etc.)
│   ├── /layouts         # Page layouts (DashboardLayout)
│   ├── /pages           # Main page views (Dashboard, Login, Roadmap, etc.)
│   ├── App.jsx          # Main application router and layout structure
│   └── main.jsx         # Entry point
├── /server              # Backend API
│   ├── /config          # Configuration files
│   ├── /models          # Mongoose database schemas (User.js)
│   ├── /routes          # API route definitions (auth, profile, roadmap, quiz, resume)
│   ├── /services        # Business logic (likely AI service wrappers)
│   ├── index.js         # Server entry point
│   └── .env             # Environment variables (API keys, DB URI)
└── package.json         # Project dependencies and scripts
```
