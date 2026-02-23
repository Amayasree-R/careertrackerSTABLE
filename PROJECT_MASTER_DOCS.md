# CareerPath — Skill & Career Tracker
## 📋 Complete Project Documentation

> **Version:** 1.0.0  
> **Last Updated:** February 2026  
> **Stack:** React 19 + Vite · Node/Express · MongoDB · Tailwind CSS · Groq AI · Google Gemini AI

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Folder Structure](#3-folder-structure)
4. [Architecture Overview](#4-architecture-overview)
5. [Frontend — Detailed Breakdown](#5-frontend--detailed-breakdown)
6. [Backend — Detailed Breakdown](#6-backend--detailed-breakdown)
7. [Database Schema](#7-database-schema)
8. [API Reference](#8-api-reference)
9. [Authentication Flow](#9-authentication-flow)
10. [AI Integration](#10-ai-integration)
11. [Resume System](#11-resume-system)
12. [Quiz & Skill Tracking System](#12-quiz--skill-tracking-system)
13. [Data Flow Diagrams](#13-data-flow-diagrams)
14. [Environment Variables](#14-environment-variables)
15. [Running the Project](#15-running-the-project)

---

## 1. Project Overview

**CareerPath** is a full-stack web application that helps users (both students and working professionals) plan, track, and accelerate their career growth. It combines:

- A **personalized career roadmap** generator powered by AI
- A **skill assessment quiz system** to validate what users know
- A **resume builder** with AI-generated content using the Groq LLM API (LLaMA 3.3 70B)
- A **resume parser** that extracts structured data from PDF uploads
- A **skill gap analysis** engine that compares user skills against target role demands
- A **certificate management** system
- A **profile system** storing detailed educational, professional, and career information

The app is designed with two distinct user archetypes: **Students/Freshers** and **Working Professionals**, and tailors all AI outputs accordingly.

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI library |
| Vite | 7.2.4 | Build tool & dev server |
| React Router DOM | 7.13.0 | Client-side routing |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| Axios | 1.13.5 | HTTP client for API calls |
| Recharts | 3.7.0 | Data visualization / charts |
| Lucide React | 0.563.0 | Icon library |
| @hello-pangea/dnd | 18.0.1 | Drag-and-drop for resume builder |
| canvas-confetti | 1.9.4 | Confetti animation on quiz pass |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥18 | JavaScript runtime |
| Express | 5.2.1 | Web framework |
| Mongoose | 9.1.5 | MongoDB ODM |
| MongoDB | Cloud Atlas | Primary database |
| bcryptjs | 3.0.3 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT authentication |
| multer | 1.4.4-lts | File upload handling |
| pdf-parse | 1.1.1 | PDF text extraction |
| Puppeteer | 24.37.3 | Headless browser for PDF export |
| docx | 9.5.1 | DOCX resume export |
| sharp | 0.32.6 | Image processing |
| Groq SDK | 0.37.0 | LLaMA 3.3 70B AI completions |
| @google/generative-ai | 0.24.1 | Google Gemini AI |
| @octokit/rest | 22.0.1 | GitHub API integration |
| nodemon | 3.1.11 | Dev auto-restart |

---

## 3. Folder Structure

```
skill-career-tracker/                  ← Project root
│
├── index.html                         ← Vite entry HTML
├── vite.config.js                     ← Vite configuration
├── tailwind.config.js                 ← Tailwind configuration
├── postcss.config.js                  ← PostCSS configuration
├── eslint.config.js                   ← ESLint rules
├── package.json                       ← Frontend dependencies
├── start_dev.bat                      ← Windows dev launcher script
│
├── public/                            ← Static assets served as-is
│   └── (favicon, robots.txt, etc.)
│
├── uploads/                           ← File storage for uploaded files
│   └── certificates/                  ← Certificate images/PDFs
│
├── scripts/                           ← Utility scripts
│
├── src/                               ← Frontend source code (React)
│   ├── main.jsx                       ← React app entry point
│   ├── App.jsx                        ← Root component & router
│   ├── index.css                      ← Global styles
│   │
│   ├── assets/                        ← Static assets (images, icons)
│   │
│   ├── layouts/                       ← Shared layout wrappers
│   │   └── DashboardLayout.jsx        ← Sidebar + outlet layout for dashboard
│   │
│   ├── pages/                         ← Top-level route pages
│   │   ├── Home.jsx                   ← Landing/home page (inline in App.jsx)
│   │   ├── Login.jsx                  ← Login form + auth
│   │   ├── Signup.jsx                 ← Multi-step signup wizard
│   │   ├── Dashboard.jsx              ← Main dashboard with stats & roadmap
│   │   ├── Profile.jsx                ← View/edit full user profile
│   │   ├── ProfileForm.jsx            ← Initial profile setup form (post-signup)
│   │   ├── Roadmap.jsx                ← Career roadmap visualization
│   │   ├── Quiz.jsx                   ← Skill assessment quiz page
│   │   ├── ResumeBuilder.jsx          ← AI resume builder page
│   │   └── Certificates.jsx           ← Certificate management page
│   │
│   └── components/                    ← Reusable UI components
│       ├── Avatar.jsx                 ← User avatar with initials fallback
│       ├── Sidebar.jsx                ← Dashboard sidebar navigation
│       ├── Skeleton.jsx               ← Loading placeholder skeletons
│       ├── SkillGapAnalysis.jsx       ← Skill gap visualization component
│       ├── SkillRoadmap.jsx           ← Roadmap rendering component
│       ├── SkillTooltip.jsx           ← Rich skill details tooltip
│       ├── ResumePreview.jsx          ← Live resume preview renderer
│       ├── ResumeUploadForm.jsx       ← PDF resume upload form
│       ├── profile/                   ← Profile-specific sub-components
│       │   ├── PersonalInfoSection.jsx
│       │   └── CareerInfoSection.jsx
│       └── resume/                    ← Resume sub-components
│           ├── ResumeEditor.jsx       ← Editable resume section editor
│           ├── TemplateSelector.jsx   ← Resume template chooser
│           ├── ExportOptions.jsx      ← Export (PDF/DOCX) controls
│           ├── VersionManager.jsx     ← Resume versions list
│           └── SectionEditor.jsx     ← Per-section AI regeneration
│
└── server/                            ← Backend source code (Node.js)
    ├── index.js                       ← Express app entry point
    ├── package.json                   ← Backend dependencies
    ├── .env                           ← Environment variables (gitignored)
    ├── signup_debug.log               ← Signup debug log file
    │
    ├── config/
    │   └── db.js                      ← MongoDB connection config
    │
    ├── models/                        ← Mongoose data models
    │   ├── User.js                    ← Main User schema (all user data)
    │   └── SkillDetail.js             ← Skill detail/metadata schema
    │
    ├── middleware/
    │   └── authMiddleware.js          ← JWT verification middleware
    │
    ├── routes/                        ← Express route handlers
    │   ├── auth.js                    ← /api/auth (signup, login)
    │   ├── profile.js                 ← /api/profile (CRUD + skill toggle)
    │   ├── roadmap.js                 ← /api/roadmap (AI roadmap generation)
    │   ├── skillDetail.js             ← /api/skill-detail (resource lookup)
    │   ├── quiz.js                    ← /api/quiz (question generation)
    │   ├── resume.js                  ← /api/resume (upload, parse, generate, export)
    │   └── certificate.js             ← /api/cert (upload, verify, manage)
    │
    ├── controllers/
    │   ├── resumeController.js        ← Resume business logic handlers
    │   └── (other controllers inline in routes)
    │
    ├── services/                      ← Business logic / AI service layer
    │   ├── roadmapGenerator.js        ← AI roadmap generation (Groq/Gemini)
    │   ├── quizGenerator.js           ← AI quiz question generation
    │   ├── resumeParserService.js     ← PDF parsing & structured extraction
    │   ├── resumeAnalyzerService.js   ← Skill gap analysis from resume
    │   ├── resumeGeneratorService.js  ← Resume data aggregation & profile detection
    │   ├── aiEnhancementService.js    ← AI text enhancement (bullet points, summary)
    │   ├── exportService.js           ← PDF/DOCX export via Puppeteer & docx
    │   ├── certificateService.js      ← Certificate verification logic
    │   └── githubProjectService.js   ← Fetch GitHub projects via Octokit
    │
    ├── data/
    │   └── skillsData.js              ← Static skill taxonomy data
    │
    ├── utils/                         ← Helper utilities
    │   ├── tokenHelper.js             ← JWT sign/verify helpers
    │   └── fileHelper.js              ← File path/cleanup utilities
    │
    └── tests/                         ← Test scripts
        ├── test-signup.js
        └── test-key.js
```

---

## 4. Architecture Overview

The application follows a **standard 3-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT TIER                          │
│   React 19 SPA (Vite) — runs on http://localhost:5173  │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│   │  Pages   │  │Components│  │  React Router DOM    │ │
│   └──────────┘  └──────────┘  └──────────────────────┘ │
│              Axios HTTP calls with JWT                  │
└────────────────────────┬────────────────────────────────┘
                         │ REST API calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                      │
│   Express.js Server — runs on http://localhost:5000     │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│   │  Routes  │→ │ Services │→ │   AI APIs (Groq/     │ │
│   │  (REST)  │  │          │  │   Gemini/GitHub)     │ │
│   └──────────┘  └──────────┘  └──────────────────────┘ │
│   ┌─────────────────────────────────────────────┐       │
│   │        authMiddleware (JWT guard)           │       │
│   └─────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     DATA TIER                           │
│         MongoDB Atlas (Cloud) / Local MongoDB           │
│   ┌──────────────────────────────────────────────────┐  │
│   │         User Collection (main document)          │  │
│   │   + SkillDetail Collection (metadata)            │  │
│   └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Communication Pattern

- **Frontend → Backend:** All communication is over **REST** using **Axios**. Every protected request sends `Authorization: Bearer <JWT>` in the request header.
- **Backend → DB:** Mongoose ODM handles all MongoDB operations using async/await.
- **Backend → AI:** Server directly calls **Groq SDK** or **Google Generative AI SDK** server-side to keep API keys secret.
- **Files:** Uploaded PDFs are handled in **memory** by Multer (not written to disk), then parsed inline. Certificates and generated files are stored in `/uploads/`.

---

## 5. Frontend — Detailed Breakdown

### 5.1 Entry Points

| File | Role |
|------|------|
| `index.html` | Vite HTML shell; imports `main.jsx` |
| `src/main.jsx` | Renders `<App />` into `#root` |
| `src/App.jsx` | Root component containing all `<Route>` declarations |

### 5.2 Routing Structure

The app uses **React Router v7** with nested layouts:

```
/                       → Home (landing page)
/login                  → Login page
/signup                 → Multi-step Signup Wizard
/profile                → ProfileForm (initial setup after signup)
/roadmap                → Roadmap page
/quiz/:skill            → Quiz page for a specific skill

/dashboard              → DashboardLayout (with Sidebar)
  /dashboard            → Dashboard (index — main stats page)
  /dashboard/profile    → Profile (view/edit profile)
  /dashboard/certificates → Certificates page
  /dashboard/resume-builder → ResumeBuilder page
```

### 5.3 Pages

#### `Home.jsx` (inline in App.jsx)
- Landing page with hero section
- Gradient branding (`from-blue-600 to-purple-600`)
- Links to `/login` and `/signup`

#### `Login.jsx`
- Username + password form
- POST `/api/auth/login` → receives JWT + user info
- Stores token in `localStorage` as `careerToken` + `careerUser`
- Redirects to `/dashboard` on success

#### `Signup.jsx`
- **Multi-step wizard** with ~5 steps:
  1. Basic Info (username, email, fullName, phone, password)
  2. Personal Details (DOB, gender, nationality, location)
  3. Current Status (Student / Working Professional)
  4. Education history
  5. Social Links (GitHub, LinkedIn, Portfolio)
- Validates each step before advancing
- On final submit: POST `/api/auth/signup` → auto-login → redirects to `/profile`

#### `ProfileForm.jsx`
- Initial career profile setup (run once after signup)
- Fields: current skills, target job role, experience level
- POST `/api/profile` to save

#### `Dashboard.jsx`
- Core hub of the app; largest file (27KB)
- Fetches user profile from `/api/profile`
- Displays:
  - Skill mastery stats (mastered count, learning count, progress bars)
  - AI-generated career roadmap (calls `/api/roadmap`)
  - Focus skill selector
  - Skill toggle cards (to-learn → learning → mastered 3-state)
  - Skill gap analysis panel (`<SkillGapAnalysis />`)
  - XP / achievement section

#### `Profile.jsx`
- Full profile view and editing within the dashboard
- Sections: Personal Info, Career Info, Education, Experience, Social Links
- Uses sub-components in `components/profile/`

#### `Roadmap.jsx`
- Dedicated roadmap visualization page
- Renders detailed phase-by-phase roadmap from AI
- Uses `<SkillRoadmap />` component

#### `Quiz.jsx`
- Skill-specific MCQ quiz; parameterized by `/:skill`
- Fetches questions from `/api/quiz?skill=<name>`
- On quiz complete:
  - Shows score and confetti animation (if passed)
  - Calls `/api/profile/toggle-skill` with `forceMaster: true` to auto-master skill

#### `ResumeBuilder.jsx`
- Full AI-powered resume builder (18KB)
- Workflow:
  1. Upload existing PDF (`<ResumeUploadForm />`) OR generate from profile
  2. AI generates resume JSON via POST `/api/resume/generate`
  3. Display live preview with `<ResumePreview />`
  4. Per-section AI regeneration
  5. Export to PDF/DOCX

#### `Certificates.jsx`
- Upload and manage certificates
- Shows verification status
- Calls `/api/cert` endpoints

### 5.4 Key Components

#### `Sidebar.jsx`
- Fixed sidebar navigation for dashboard
- Links: Dashboard, Profile, Resume Builder, Certificates
- Displays user avatar and name from localStorage

#### `DashboardLayout.jsx`
- Wraps all `/dashboard/*` routes
- Renders `<Sidebar />` + `<Outlet />` (nested page)
- Handles auth guard: redirects to `/login` if no token

#### `ResumePreview.jsx` (23KB)
- Live HTML preview of the generated resume
- Supports multiple templates (modern, classic, minimal)
- All sections are editable inline

#### `SkillGapAnalysis.jsx`
- Compares user's known skills against target role
- Shows: Matching Skills ✅ | Missing Skills ❌ | Suggested Skills 💡

#### `SkillTooltip.jsx` (11KB)
- Rich tooltip popup on skill hover
- Shows: skill description, resources, related skills, roadmap position

#### `SkillRoadmap.jsx`
- Phase-by-phase visual roadmap
- Supports drag-drop reordering

#### `Skeleton.jsx`
- Loading placeholder UI (shimmer effect)

#### `Avatar.jsx`
- Displays user avatar; falls back to initials with colored background

---

## 6. Backend — Detailed Breakdown

### 6.1 Entry Point: `server/index.js`

The Express app initializes in order:
1. Load `.env` via `dotenv`
2. Create Express app
3. Apply middleware: `cors()`, `express.json()`, static file serving for `/certificates`
4. Mount all route modules
5. Connect to MongoDB via Mongoose
6. Listen on `PORT` (default: `5000`)

### 6.2 Route Modules

#### `routes/auth.js` — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new user, hash password, return JWT |
| POST | `/api/auth/login` | Verify credentials, return JWT |

**Signup Flow:**
1. Validate required fields (username, email, fullName, phoneNumber, password, currentStatus)
2. Check for duplicate username/email
3. Hash password with bcrypt (salt rounds: 10)
4. Save new `User` document to MongoDB
5. Sign JWT (expires in 7d)
6. Return `{ token, user: { id, username, email, fullName } }`

**Login Flow:**
1. Find user by username
2. `bcrypt.compare()` password
3. Sign JWT and return

#### `routes/profile.js` — `/api/profile`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/profile` | Fetch full user + profile data |
| POST | `/api/profile` | Update currentSkills, targetJob, experienceLevel |
| POST | `/api/profile/toggle-skill` | 3-state skill toggle (to-learn → learning → mastered) |
| POST | `/api/profile/focus-skill` | Set/unset the current focus skill |

**Skill Toggle Logic (3-state):**
- `to-learn` → `learning`: adds to `learningSkills[]`
- `learning` → `mastered`: moves to `completedSkills[]` with score & timestamp
- `mastered` → `to-learn`: removes from both arrays
- `forceMaster: true` (from quiz): directly sets mastered with quiz score

#### `routes/roadmap.js` — `/api/roadmap`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/roadmap` | Generate or return cached AI roadmap |

- Uses **caching**: if `roadmapCache` exists and `lastProfileUpdate` is before the cache, returns the cached roadmap
- Otherwise calls `roadmapGenerator.js` service → Groq/Gemini → structured JSON phases

#### `routes/quiz.js` — `/api/quiz`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/quiz` | Generate MCQ questions for a skill |

- Accepts `?skill=<name>` query param
- Calls `quizGenerator.js` → Groq AI → `{ questions: [...] }`

#### `routes/skillDetail.js` — `/api/skill-detail`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/skill-detail` | Get metadata, resources, roadmap for a skill |

- Queries `SkillDetail` collection or generates via AI

#### `routes/resume.js` — `/api/resume`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/resume/upload` | Upload PDF, parse, extract structured data |
| POST | `/api/resume/analyze` | Run skill gap analysis on parsed resume |
| GET | `/api/resume/data` | Aggregate all user data for resume builder |
| POST | `/api/resume/generate` | AI-generate full resume JSON (Groq LLaMA 3.3) |
| POST | `/api/resume/enhance-text` | AI-enhance a specific text snippet |
| POST | `/api/resume/regenerate-section` | Regenerate a specific section (summary/skills/experience/etc.) |
| POST | `/api/resume/export/:format` | Export resume as PDF or DOCX |
| GET | `/api/resume/versions` | List saved resume versions |
| POST | `/api/resume/save-version` | Save a named resume version |
| GET | `/api/resume/:userId` | Get raw parsed resume data |
| PUT | `/api/resume/:userId` | Manually update resume data |
| DELETE | `/api/resume/:userId` | Delete resume data |
| GET | `/api/resume/:userId/analysis` | Get skill analysis results |

#### `routes/certificate.js` — `/api/cert`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/cert/upload` | Upload certificate image/PDF |
| GET | `/api/cert` | Fetch all user certificates |
| PUT | `/api/cert/:id` | Update certificate details |
| DELETE | `/api/cert/:id` | Remove a certificate |

### 6.3 Middleware

#### `authMiddleware.js`
```
Request → Extract Bearer token from Authorization header
       → jwt.verify(token, JWT_SECRET)
       → Attach decoded userId to req.userId
       → Call next()
```
Mounted inline in most route files. A more capable version in `resume.js` also attaches the full `req.user` object from the database.

### 6.4 Services

#### `roadmapGenerator.js`
- Accepts user profile (skills, targetJob, experienceLevel)
- Determines if user is student or professional
- Sends tailored prompt to **Groq** (LLaMA 3.3) or **Google Gemini**
- Returns structured JSON: `{ phases: [{ name, skills: [], resources: [] }] }`
- Result gets cached in `user.profile.roadmapCache`

#### `quizGenerator.js`
- Accepts skill name
- Prompts AI to generate 5-10 MCQ questions
- Returns `{ questions: [{ question, options: [], correctAnswer, explanation }] }`

#### `resumeParserService.js`
- Accepts PDF buffer (from Multer memory storage)
- Uses `pdf-parse` to extract raw text
- Sends to Groq AI for structured data extraction:
  ```json
  {
    "skills": [], "tools": [],
    "projects": [{ title, description, techStack }],
    "experience": [{ company, role, duration, description }],
    "education": [{ institution, degree, field, year }],
    "certifications": [{ name, issuer, date }]
  }
  ```
- Saves parsed data to `user.resumeData`

#### `resumeAnalyzerService.js`
- Compares `user.resumeData.skills` against `user.profile.targetJob` requirements
- Calls AI for industry-required skills for the target role
- Produces:
  - `matchingSkills[]` — skills user has that match target role
  - `missingSkills[]` — skills required but user lacks
  - `suggestedSkills[]` — adjacent skills worth learning
  - `industryDemandSkills[]` — trending skills for the role
- Saves to `user.skillAnalysis`

#### `resumeGeneratorService.js`
- `getAggregatedResumeData(user)` — combines data from all user fields into one object sent to Groq
- `detectUserProfile(userData)` — returns `{ isStudent: bool }` based on work experience presence

#### `aiEnhancementService.js`
- Takes any text snippet + context
- Returns AI-enhanced, professional version (better wording, STAR method, action verbs)

#### `exportService.js`
- **PDF Export:** Uses **Puppeteer** to render the resume HTML template headlessly and print to PDF
- **DOCX Export:** Uses the `docx` library to generate a Word document from the resume JSON structure

#### `certificateService.js`
- Handles file path management for uploaded certificate files
- Verification logic (checks URL or file authenticity)

#### `githubProjectService.js`
- Uses `@octokit/rest` to fetch user's public GitHub repositories
- Extracts project names, descriptions, and tech stacks for resume population

---

## 7. Database Schema

The app uses a **single primary collection**: `users`, managed through the `User` Mongoose model.

### User Schema

```
User {
  // ── Core Auth ──────────────────────────────────
  username:       String (unique, required)
  email:          String (unique, required, lowercase)
  fullName:       String (required)
  phoneNumber:    String (required)
  password:       String (hashed with bcrypt, required)
  createdAt:      Date (default: now)

  // ── Personal Details ───────────────────────────
  personalDetails: {
    dob:          Date
    gender:       Enum ['Male', 'Female', 'Other', 'Prefer not to say']
    nationality:  String
    location: { city, state, country }
  }

  // ── Career Status ──────────────────────────────
  currentStatus:  Enum ['Student', 'Working Professional'] (required)

  // ── Academic / Professional History ───────────
  education:  [{ degree, specialization, college, startYear, endYear }]
  experience: [{ company, role, startDate, endDate, responsibilities }]

  // ── Social Links ───────────────────────────────
  socialLinks: { github, linkedin, portfolio }

  // ── Career Profile (from ProfileForm) ─────────
  profile: {
    currentSkills:    [String]         // User's known skills
    targetJob:        String           // Desired job role
    experienceLevel:  String           // Beginner / Intermediate / Expert
    completedSkills:  [{ skill, score, masteredAt }]  // Mastered skills
    learningSkills:   [String]         // Skills currently being learned
    focusSkill:       String           // Current focus skill
    roadmapCache:     Object           // Cached AI roadmap JSON
    lastProfileUpdate: Date
  }

  // ── Detailed Career Info ───────────────────────
  careerInfo: {
    roleType:         Enum ['student', 'employed', 'unemployed']
    collegeName, degree, graduationYear  // If student
    currentCompany                       // If employed
    previousCompanies: [{ companyName, role, duration }]
    yearsOfExperience: Number
    primaryTechStack: [String]
    targetJobRole:    String
  }

  // ── Resume Upload Reference ────────────────────
  resumeFile: { filename, uploadedAt, filePath }

  // ── Parsed Resume Data (from AI parsing) ───────
  resumeData: {
    skills:         [String]
    tools:          [String]
    projects:       [{ title, description, techStack }]
    experience:     [{ company, role, duration, description }]
    education:      [{ institution, degree, field, year }]
    certifications: [{ name, issuer, date }]
    rawText:        String
    parsedAt:       Date
  }

  // ── Skill Gap Analysis Results ─────────────────
  skillAnalysis: {
    matchingSkills:       [String]
    missingSkills:        [String]
    suggestedSkills:      [String]
    industryDemandSkills: [String]
    analysisDate:         Date
  }

  // ── Certifications ────────────────────────────
  certifications: [{
    title, issuer, issueYear, issueDate
    verificationStatus, skills, fileUrl
    verificationMethod
    useInResume: Boolean
    uploadedAt: Date
  }]

  // ── Resume Versions (saved snapshots) ─────────
  resumeVersions: [{
    versionName, template, targetRole
    content: { summary, experience, education, skills, projects }
    createdAt, lastModified
  }]
}
```

### SkillDetail Schema
Stores metadata for individual skills (resources, difficulty, prerequisites) to power the `SkillTooltip` and `SkillDetail` pages.

---

## 8. API Reference

### Auth Endpoints

| Method | URL | Auth | Request Body | Response |
|--------|-----|------|-------------|---------|
| POST | `/api/auth/signup` | ❌ | `{ username, email, fullName, phoneNumber, password, currentStatus, personalDetails?, education?, experience?, socialLinks? }` | `{ token, user: { id, username, email, fullName } }` |
| POST | `/api/auth/login` | ❌ | `{ username, password }` | `{ token, user: { id, username, fullName } }` |

### Profile Endpoints

| Method | URL | Auth | Body / Params | Response |
|--------|-----|------|-------------|---------|
| GET | `/api/profile` | ✅ | — | `{ user, profile }` |
| POST | `/api/profile` | ✅ | `{ currentSkills, targetJob, experienceLevel }` | `{ profile }` |
| POST | `/api/profile/toggle-skill` | ✅ | `{ skill, score?, forceMaster? }` | `{ completedSkills, learningSkills }` |
| POST | `/api/profile/focus-skill` | ✅ | `{ skill }` | `{ focusSkill }` |

### Roadmap Endpoints

| Method | URL | Auth | Response |
|--------|-----|------|---------|
| GET | `/api/roadmap` | ✅ | `{ roadmap: { phases: [...] }, cached: bool }` |

### Quiz Endpoints

| Method | URL | Auth | Query Params | Response |
|--------|-----|------|-------------|---------|
| GET | `/api/quiz` | ✅ | `?skill=Python` | `{ questions: [{ question, options, correctAnswer, explanation }] }` |

### Resume Endpoints

| Method | URL | Auth | Notes |
|--------|-----|------|-------|
| POST | `/api/resume/upload` | ✅ | `multipart/form-data`, field: `resume` (PDF, max 5MB) |
| POST | `/api/resume/analyze` | ✅ | Runs skill gap analysis |
| GET | `/api/resume/data` | ✅ | Aggregated profile + resume data |
| POST | `/api/resume/generate` | ✅ | AI generates full resume JSON |
| POST | `/api/resume/enhance-text` | ✅ | `{ text, context }` → `{ enhanced }` |
| POST | `/api/resume/regenerate-section` | ✅ | `{ section, currentResumeData }` |
| POST | `/api/resume/export/pdf` | ✅ | Returns PDF binary stream |
| POST | `/api/resume/export/docx` | ✅ | Returns DOCX binary stream |
| GET | `/api/resume/versions` | ✅ | List all saved versions |
| POST | `/api/resume/save-version` | ✅ | `{ versionName, template, content }` |

---

## 9. Authentication Flow

```
1. User registers via /signup
   → Server hashes password → saves to MongoDB → signs JWT
   → JWT stored in localStorage: careerToken

2. User logs in via /login
   → Server verifies username + bcrypt password match
   → Signs new JWT → stored in localStorage

3. Every protected request:
   Frontend adds:  Authorization: Bearer <JWT>
   Backend middleware: jwt.verify(token, JWT_SECRET)
   If valid: extracts userId, attaches to req
   If invalid/expired: returns 401

4. Token lifecycle:
   - Expires in 7 days
   - No refresh token mechanism (re-login required)
   - Logout = clear localStorage
```

---

## 10. AI Integration

### Groq (LLaMA 3.3 70B Versatile)
Used for all text generation tasks.

| Feature | Service | Model |
|---------|---------|-------|
| Resume generation | `routes/resume.js` | `llama-3.3-70b-versatile` |
| Section regeneration | `routes/resume.js` | `llama-3.3-70b-versatile` |
| Resume parsing (PDF → JSON) | `resumeParserService.js` | `llama-3.3-70b-versatile` |
| Quiz generation | `quizGenerator.js` | Groq |
| Roadmap generation | `roadmapGenerator.js` | Groq and/or Gemini |
| AI text enhancement | `aiEnhancementService.js` | Groq |

**Key Pattern:**
```js
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const completion = await groq.chat.completions.create({
  messages: [{ role: 'system', content: '...' }, { role: 'user', content: prompt }],
  model: 'llama-3.3-70b-versatile',
  response_format: { type: 'json_object' }  // Forces JSON output
})
const result = JSON.parse(completion.choices[0].message.content)
```

### Google Gemini AI
Used as an alternative for roadmap generation and other tasks via `@google/generative-ai`.

### Profile-Aware AI Prompting
The system detects if the user is a **student/fresher** or **professional** using `detectUserProfile()` and sends completely different prompt templates:

- **Student prompts:** Focus on academic background, projects, learning trajectory; explicitly forbidden from fabricating work experience
- **Professional prompts:** Focus on STAR-method bullet points, quantifiable achievements, career progression

---

## 11. Resume System

The resume system is the most complex part of the application:

### Workflow

```
Option A: Upload PDF Resume
  1. User uploads PDF via ResumeUploadForm
  2. Multer stores file in memory (buffer)
  3. pdf-parse extracts raw text
  4. Groq AI structures the raw text into JSON
  5. Structured data saved to user.resumeData
  6. Skill gap analysis runs: user.skillAnalysis populated

Option B: Generate from Profile
  1. ResumeBuilder calls GET /api/resume/data
  2. Server aggregates data from:
     - user.profile (skills, targetJob)
     - user.careerInfo (companies, tech stack)
     - user.education, user.experience
     - user.certifications
     - user.resumeData (from uploaded PDF, if any)
  3. Aggregated data sent to Groq with student/professional prompt
  4. Groq returns full resume JSON
  5. Frontend renders via ResumePreview

Per-Section Regeneration:
  User clicks "Regenerate" on a section (summary/skills/experience/certificates)
  → POST /api/resume/regenerate-section { section, currentResumeData }
  → Groq generates only that section
  → Frontend patches the section in the resume state

Export:
  → PDF: Puppeteer renders HTML template → saves PDF → streams to client
  → DOCX: docx library builds Word document → streams to client

Version Control:
  User can save named snapshots of their resume
  → Stored in user.resumeVersions[]
  → Can be loaded and compared
```

---

## 12. Quiz & Skill Tracking System

### Skill States
Each skill in the roadmap has a **3-state progression**:

```
[To Learn] ──toggle──→ [Learning] ──toggle──→ [Mastered] ──toggle──→ [To Learn]
                                                   ↑
                               (also set via quiz with forceMaster: true)
```

Data mapping:
- **To Learn:** Not in `learningSkills`, not in `completedSkills`
- **Learning:** Present in `learningSkills[]`
- **Mastered:** Present in `completedSkills[]` with `{ skill, score, masteredAt }`

### Quiz Flow
```
1. User clicks "Take Quiz" on a skill  →  Navigate to /quiz/:skill
2. QuizPage: GET /api/quiz?skill=<name>
3. Groq generates 5-10 MCQ questions (JSON)
4. User answers all questions
5. Score calculated (percentage correct)
6. If score ≥ passing threshold:
   - Confetti animation fires (canvas-confetti)
   - POST /api/profile/toggle-skill { skill, score, forceMaster: true }
   - Skill moved to "Mastered" state in DB
7. If failed: option to retry
```

---

## 13. Data Flow Diagrams

### Signup & Initial Setup
```
User fills Signup form (5 steps)
  → POST /api/auth/signup (all user data)
  → MongoDB: new User document created
  → JWT returned → stored in localStorage
  → Redirect to /profile (ProfileForm)
     → User sets: currentSkills, targetJob, experienceLevel
     → POST /api/profile
     → MongoDB: user.profile updated
     → Redirect to /dashboard
```

### Dashboard Load
```
/dashboard renders DashboardLayout
  → GET /api/profile (Authorization: Bearer JWT)
  → Returns: { user, profile }
  → Display: skill cards, stats, focus skill
  → GET /api/roadmap
  → If roadmapCache valid: return cache
  → Else: AI generates new roadmap → cache saved → return
  → Display: phase cards with skills
```

### Resume Build & Export
```
GET /api/resume/data → aggregate user data
POST /api/resume/generate → Groq AI → resume JSON
Frontend renders ResumePreview (live HTML)
User edits manually or clicks "Regenerate Section"
POST /api/resume/save-version → save snapshot
POST /api/resume/export/pdf → Puppeteer → download PDF
```

---

## 14. Environment Variables

### Server `.env` file (`server/.env`)

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/careertracker

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# AI APIs
GROQ_API_KEY=gsk_...your_groq_api_key...
GEMINI_API_KEY=AIza...your_google_gemini_key...

# GitHub (optional)
GITHUB_TOKEN=ghp_...your_github_token...

# Server
PORT=5000
```

> ⚠️ **Never commit `.env` to version control.** It is already listed in `.gitignore`.

---

## 15. Running the Project

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Groq API key (free tier available at console.groq.com)
- Google Gemini API key (optional)

### Setup & Start

#### 1. Install Frontend Dependencies
```bash
# In project root
cd skill-career-tracker
npm install
```

#### 2. Install Backend Dependencies
```bash
cd server
npm install
```

#### 3. Configure Environment
```bash
# Edit server/.env with your credentials
# (see Environment Variables section above)
```

#### 4. Start Both Servers

**Option A: Windows batch script**
```bat
start_dev.bat
```

**Option B: Manual (two terminals)**
```bash
# Terminal 1 — Frontend (root)
npm run dev
# Runs on: http://localhost:5173

# Terminal 2 — Backend (server/)
cd server
npm run dev
# Runs on: http://localhost:5000
```

### Available Scripts

| Location | Command | Description |
|----------|---------|-------------|
| Root | `npm run dev` | Start Vite dev server (port 5173) |
| Root | `npm run build` | Build for production |
| Root | `npm run preview` | Preview production build |
| Root | `npm run lint` | Run ESLint |
| `server/` | `npm run dev` | Start Express with nodemon (port 5000) |
| `server/` | `npm start` | Start Express without nodemon |

---

*Documentation generated: February 2026. Covers CareerPath v1.0.0.*
