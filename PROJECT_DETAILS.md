# Skill Career Tracker - Detailed Project Documentation

## 1. Project Overview
**Skill Career Tracker** is a full-stack MERN application designed to accelerate career growth through AI-driven insights. It bridges the gap between a user's current skills and their target job role by providing personalized learning roadmaps, skill verification quizzes, and a professional AI resume builder.

---

## 2. Technical Architecture

### 2.1 Tech Stack
| Component | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | ^18.3.1 | Component-based UI library |
| **Build Tool** | Vite | ^5.4.1 | Fast build tool and dev server |
| **Styling** | Tailwind CSS | ^3.4.10 | Utility-first CSS framework |
| **Icons** | Lucide React | ^0.436.0 | Modern, consistent icon set |
| **Charts** | Recharts | ^2.12.7 | Composable charting library |
| **State** | React Context | N/A | Global state management |
| **Backend** | Node.js | >=18 | JavaScript runtime |
| **Framework** | Express.js | ^4.19.2 | Web application framework for Node.js |
| **Database** | MongoDB | ^6.8.0 | NoSQL database |
| **ODM** | Mongoose | ^8.6.0 | MongoDB object modeling |
| **AI** | Groq SDK | ^0.7.0 | Fast AI inference (Llama 3.1 8B/70B) |
| **Auth** | JWT | ^9.0.2 | Stateless authentication |

### 2.2 Directory Structure
```
skill-career-tracker/
├── src/                        # Frontend Source Code
│   ├── components/             # Reusable UI components
│   │   ├── profile/            # Profile-related components
│   │   │   ├── CertificateCard.jsx
│   │   │   └── CertificateUpload.jsx
│   │   ├── resume/             # Resume Builder components
│   │   │   ├── AIEnhancementModal.jsx
│   │   │   ├── ResumePreview.jsx
│   │   │   ├── ResumeTemplates.jsx
│   │   │   ├── TemplateSelector.jsx
│   │   │   └── ValidationChecklist.jsx
│   │   ├── Avatar.jsx          # User avatar generator
│   │   ├── ResumeDashboard.jsx # Resume management dashboard
│   │   ├── ResumeUploadForm.jsx # PDF upload component
│   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   ├── SkillGapAnalysis.jsx # Gap analysis visualizer
│   │   ├── SkillRoadmap.jsx    # Roadmap tree visualizer
│   │   └── SkillTooltip.jsx    # Hover details for skills
│   ├── pages/                  # Application Routes
│   │   ├── Dashboard.jsx       # Main user hub
│   │   ├── ResumeBuilder.jsx   # Core Resume Builder page
│   │   ├── Profile.jsx         # User profile & settings
│   │   ├── Roadmap.jsx         # Full roadmap view
│   │   ├── Quiz.jsx            # Skill verification quiz
│   │   ├── Certificates.jsx    # Certificate management
│   │   ├── Login.jsx           # Auth: Login
│   │   └── Signup.jsx          # Auth: Registration
│   ├── layouts/                # Wrapper layouts
│   │   └── DashboardLayout.jsx # Authenticated layout (Sidebar + Header)
│   └── App.jsx                 # Main application entry
├── server/                     # Backend Source Code
│   ├── models/                 # Database Schemas (Mongoose)
│   │   ├── User.js             # User data & progress
│   │   ├── SkillDetail.js      # Skill metadata & resources
│   │   └── ...                 # Other models (Quiz, etc.)
│   ├── routes/                 # API Endpoints
│   │   ├── auth.js             # Authentication routes
│   │   ├── profile.js          # Profile management
│   │   ├── resume.js           # Resume generation & export
│   │   ├── roadmap.js          # Roadmap generation
│   │   ├── quiz.js             # Quiz fetching & submission
│   │   └── skillDetail.js      # Skill resource lookup
│   ├── services/               # Business Logic
│   │   ├── aiEnhancementService.js # Groq/Llama integration
│   │   ├── resumeGeneratorService.js # Data aggregation for resumes
│   │   ├── resumeAnalyzerService.js # Resume parsing & scoring
│   │   ├── roadmapGenerator.js # Roadmap creation logic
│   │   ├── githubProjectService.js # GitHub API integration
│   │   └── quizGenerator.js    # AI quiz generation
│   └── index.js                # Server entry point
└── package.json                # Project dependencies
```

---

## 3. Database Schema

### 3.1 User Model (`User.js`)
The `User` collection is the core of the application, storing authentication credentials, profile data, and career progress.

| Field | Type | Description |
| :--- | :--- | :--- |
| `username`, `email` | String | Unique identifiers |
| `password` | String | Hashed password (bcrypt) |
| `personalDetails` | Object | Location, DOB, Gender, Nationality |
| `education` | Array | List of educational qualifications |
| `experience` | Array | Work experience entries |
| `socialLinks` | Object | GitHub, LinkedIn, Portfolio URLs |
| `profile` | Object | **Core Career Data**: `targetJob`, `currentSkills`, `completedSkills` (Mastery tracking), `focusSkill` |
| `certifications` | Array | Verified certificates |
| `resumeData` | Object | Stores parsed or generated resume content |

### 3.2 SkillDetail Model (`SkillDetail.js`)
Acts as a cache or knowledge base for detailed skill information to avoid repetitive AI calls or external lookups.

| Field | Type | Description |
| :--- | :--- | :--- |
| `skill` | String | Name of the skill (indexed, unique with targetJob) |
| `targetJob` | String | Context for the skill |
| `description` | String | Brief explanation of the skill |
| `resources` | Array | List of learning resources (URL, name, type) |
| `createdAt` | Date | TTL index (30 days) to refresh data |

---

## 4. API Reference

### 4.1 Authentication (`/api/auth`)
-   `POST /register`: Create a new user account.
-   `POST /login`: Authenticate and receive a JWT.

### 4.2 Profile Management (`/api/profile`)
-   `GET /`: Fetch current user's full profile.
-   `PUT /`: Update profile details (education, experience, etc.).
-   `POST /toggle-skill`: Toggle a skill between "To Learn" and "Learning".
-   `POST /focus-skill`: Set a specific skill as the current primary focus.

### 4.3 Resume Builder (`/api/resume`)
-   `GET /data`: Fetch aggregated data for the resume builder.
-   `POST /generate`: Trigger AI generation of resume content (Summary, Descriptions).
-   `POST /export/pdf`: Generate a PDF from the provided HTML content.
-   `POST /upload`: Parse an uploaded PDF resume to pre-fill profile data.

### 4.4 Roadmap & Skills (`/api/roadmap`, `/api/quiz`)
-   `GET /roadmap`: Generate a personalized learning path based on the user's `targetJob` and `currentSkills`.
-   `GET /quiz/:skill`: Fetch a quiz for a specific skill.
-   `POST /quiz/:skill/submit`: Submit quiz answers and update mastery score.

---

## 5. Feature Deep Dives

### 5.1 AI Resume Builder Workflow
1.  **Data Aggregation**: `resumeGeneratorService.js` pulls data from `User` profile, `experience`, `education`, and social usage.
2.  **AI Enhancement**: `aiEnhancementService.js` uses **Groq (Llama 3.1 8B Instant)** to:
    -   Draft a professional summary matching the target role.
    -   Rewrite experience bullet points using the STAR method.
    -   Generate project descriptions from GitHub repo names/stacks.
3.  **Preview & Edit**: React frontend renders the resume in real-time (`ResumePreview.jsx`).
4.  **Export**: The exact HTML from the preview is sent to the backend, styled with Tailwind CSS, and converted to PDF using Puppeteer/HTML-to-PDF.

### 5.2 Dynamic Learning Roadmap
-   The system analyzes the gap between `user.profile.currentSkills` and the required skills for `user.profile.targetJob`.
-   It generates a prioritized list (High/Medium/Low) of skills to learn.
-   As users complete quizzes (`score >= 90`), skills move to the `completedSkills` array, updating the roadmap progress automatically.

---

## 6. Configuration & Environment

### Environment Variables (`.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing tokens |
| `GROQ_API_KEY` | API key for Groq AI service |
| `GITHUB_TOKEN` | (Optional) For fetching GitHub repo details |

### Rate Limits
-   **AI Service**: Adjusted to use `llama-3.1-8b-instant` to avoid strict rate limits on the 70B model.
-   **PDF Export**: Basic throttling applied implicitly by server processing time.

---

## 7. Future Improvements
-   **ATS Scoring**: Integrate a resume scoring algorithm to give feedback on ATS compatibility.
-   **Job Board Integration**: Suggest real-world job openings based on the user's roadmap progress.
-   **Social Sharing**: Allow users to share their verified skill badges directly to LinkedIn.
