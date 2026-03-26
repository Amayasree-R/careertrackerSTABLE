# CareerTracker — Full Project Documentation

> **Version**: Stable | **Last Updated**: March 2026
> **Stack**: React 19 + Vite · Node.js / Express 5 · MongoDB Atlas · Mongoose 9

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Database Design](#4-database-design--schemas)
5. [Backend — API Routes](#5-backend--api-routes)
6. [Backend — Services](#6-backend--services)
7. [Frontend — Pages](#7-frontend--pages)
8. [Frontend — Components](#8-frontend--components)
9. [Authentication Flow](#9-authentication-flow)
10. [Key Data Flows](#10-key-data-flows)
11. [Environment Variables](#11-environment-variables)

---

## 1. Project Overview

CareerTracker is a full-stack AI-powered career development platform designed to help users (students and working professionals) plan and accelerate their career journey. It provides:

- **AI-generated career roadmaps** personalized to the user's target job and experience level (GitHub + Stack Overflow + Groq LLM)
- **Resume builder** with multiple templates, AI enhancement, and PDF export (Puppeteer)
- **Certificate management** — upload PDFs/images, AI extracts skills and auto-promotes them to "Mastered"
- **Project README analyzer** — upload/paste a project README and Cerebras AI extracts tech stack and key features
- **Adaptive quiz system** — Groq LLM generates questions for each skill; passing promotes the skill to "Mastered"
- **Job match engine** — compares user skills against real job listings from an external API
- **Visual roadmap** — interactive graph view of skill progression
- **Profile system** — personal details, education, experience, social links, skill tracking (learning → mastered)

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.0 | UI library |
| Vite | 7.2.4 | Build tool and dev server |
| React Router DOM | 7.13.0 | Client-side routing |
| Recharts | 3.7.0 | Charts and graphs |
| Lucide React | 0.563.0 | Icon library |
| @hello-pangea/dnd | 18.0.1 | Drag-and-drop (resume builder) |
| canvas-confetti | 1.9.4 | Celebration animations |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| Axios | 1.13.5 | HTTP client |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x | Runtime |
| Express | 5.2.1 | Web framework |
| Mongoose | 9.1.5 | MongoDB ODM |
| bcryptjs | 3.0.3 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT auth |
| multer | 1.4.4-lts.1 | File uploads |
| Puppeteer | 24.37.3 | PDF generation (resume export) |
| sharp | 0.32.6 | Image processing |
| pdf-parse + pdfjs-dist | — | PDF text extraction |
| groq-sdk | 0.37.0 | Groq LLM (quiz, cert analysis, roadmap) |
| @google/generative-ai | 0.24.1 | Google Gemini AI |
| @cerebras/cerebras_cloud_sdk | 1.64.1 | Cerebras AI (README analysis) |
| @octokit/rest | 22.0.1 | GitHub API (roadmap skill fetching) |
| axios | 1.13.3 | HTTP client (Stack Overflow API) |
| dotenv | 17.3.1 | Environment variable loading |
| docx | 9.5.1 | DOCX generation |

### Database
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Mongoose | Schema definition, validation, querying |

---

## 3. Folder Structure

```
careertrackerSTABLE/
│
├── public/                          ← Static public assets (favicon, etc.)
├── dist/                            ← Production build output (git-ignored)
├── uploads/                         ← Uploaded user files
│   └── certificates/                ← Certificate PDF/image files
│
├── src/                             ← React frontend source
│   ├── main.jsx                     ← React entry point
│   ├── App.jsx                      ← Router + route definitions
│   ├── index.css                    ← Global base styles
│   │
│   ├── assets/                      ← Images, SVGs used in app
│   │
│   ├── pages/                       ← Top-level route components
│   │   ├── Home.jsx                 ← Landing / splash page
│   │   ├── Login.jsx                ← Login form
│   │   ├── Signup.jsx               ← Multi-step registration form
│   │   ├── Dashboard.jsx            ← Main dashboard (skills, roadmap summary)
│   │   ├── Profile.jsx              ← Read-only profile view
│   │   ├── ProfileForm.jsx          ← Edit profile form
│   │   ├── Roadmap.jsx              ← Skill roadmap list view
│   │   ├── VisualRoadmap.jsx        ← Interactive graph roadmap
│   │   ├── Quiz.jsx                 ← Skill quiz (AI-generated questions)
│   │   ├── Certificates.jsx         ← Certificate upload + management
│   │   ├── Projects.jsx             ← README analyzer + project list
│   │   ├── JobMatches.jsx           ← AI job matching results
│   │   └── ResumeBuilder.jsx        ← Full resume builder
│   │
│   ├── components/
│   │   ├── common/                  ← Shared UI primitives
│   │   │   ├── Avatar.jsx           ← Initials avatar with dark/orange theme
│   │   │   ├── Sidebar.jsx          ← Navigation sidebar
│   │   │   ├── Skeleton.jsx         ← Loading skeleton component
│   │   │   └── SkillTooltip.jsx     ← Skill hover tooltip with details
│   │   │
│   │   ├── profile/                 ← Profile-specific components
│   │   │   ├── CertificateCard.jsx  ← Single certificate display card
│   │   │   └── CertificateUpload.jsx ← Certificate upload form + preview
│   │   │
│   │   └── resume/                  ← Resume builder components
│   │       ├── AIEnhancementModal.jsx    ← AI text improvement modal
│   │       ├── ResumePreview.jsx         ← Live resume preview
│   │       ├── ResumeTemplates.jsx       ← All template HTML/CSS definitions
│   │       ├── TemplateSelector.jsx      ← Template picker UI
│   │       ├── ThemeColorPicker.jsx      ← Color theme selector
│   │       ├── ValidationChecklist.jsx   ← Resume completeness checklist
│   │       ├── forms/                    ← Section-specific form components
│   │       └── templates/               ← Template rendering units
│   │
│   ├── hooks/                       ← Custom React hooks
│   ├── layouts/                     ← Layout wrapper components
│   └── utils/                       ← Frontend utility functions
│
├── server/                          ← Express backend
│   ├── index.js                     ← Entry point — mounts all routes
│   ├── .env                         ← Secrets (git-ignored)
│   ├── .env.example                 ← Environment variable template
│   │
│   ├── config/                      ← DB connection config
│   ├── middleware/
│   │   └── authMiddleware.js        ← JWT verification middleware
│   │
│   ├── models/                      ← Mongoose schemas
│   │   ├── User.js                  ← Primary user document (246 lines)
│   │   ├── Resume.js                ← Separate resume document
│   │   ├── Career.js                ← Career info (dual-write target)
│   │   ├── Skill.js                 ← Skill tracking (dual-write target)
│   │   ├── Project.js               ← AI-analyzed project document
│   │   ├── Roadmap.js               ← Cached roadmap document
│   │   ├── SkillDetail.js           ← Learning resources for each skill
│   │   ├── SkillAnalysis.js         ← Skills gap analysis results
│   │   ├── Education.js             ← Education record document
│   │   ├── Experience.js            ← Experience record document
│   │   └── Profile.js               ← Standalone profile document
│   │
│   ├── routes/                      ← Express routers (mounted in index.js)
│   │   ├── auth.js                  ← /api/auth (signup, login)
│   │   ├── profile.js               ← /api/profile (get, update, toggle-skill)
│   │   ├── roadmap.js               ← /api/roadmap (cached roadmap gen)
│   │   ├── quiz.js                  ← /api/quiz/:skill
│   │   ├── certificate.js           ← /api/cert (CRUD + toggle)
│   │   ├── projects.js              ← /api/projects (README upload + analysis)
│   │   ├── jobs.js                  ← /api/jobs/matches (job matching)
│   │   ├── resume.js                ← /api/resume (full resume CRUD)
│   │   ├── skillDetail.js           ← /api/skill-detail/:skill
│   │   └── visualRoadmap.js         ← /api/visual-roadmap
│   │
│   ├── services/                    ← Business logic layer
│   │   ├── roadmapGenerator.js      ← GitHub + Stack Overflow + Groq AI
│   │   ├── quizGenerator.js         ← Groq AI quiz question generation
│   │   ├── certificateService.js    ← PDF parsing + AI skill extraction
│   │   ├── projectSkillIntegrationService.js ← Filters skills by roadmap relevance
│   │   ├── jobMatchingService.js    ← External job API + skill scoring
│   │   ├── visualRoadmapService.js  ← Visual roadmap node generation
│   │   ├── resumeGeneratorService.js ← AI resume content generation
│   │   ├── resumeParserService.js   ← PDF resume text extraction
│   │   ├── resumeAnalyzerService.js ← AI resume analysis
│   │   ├── exportService.js         ← Puppeteer PDF + DOCX export
│   │   ├── aiEnhancementService.js  ← AI text enhancement for resume fields
│   │   ├── cerebrasService.js       ← README analysis via Cerebras AI
│   │   ├── dualWriteProfileService.js ← Sync between User doc and sub-models
│   │   ├── githubProjectService.js  ← GitHub repo lookup for projects
│   │   └── skillMatchingService.js  ← Skill comparison utilities
│   │
│   ├── controllers/                 ← Route handler functions
│   ├── data/                        ← Static data files
│   ├── utils/                       ← Backend utility helpers
│   ├── scripts/                     ← One-off migration scripts
│   ├── tests/                       ← Backend tests
│   └── logs/                        ← Server-generated log files
│
├── scripts/                         ← Project-level scripts
├── package.json                     ← Frontend dependencies (Vite)
├── vite.config.js                   ← Vite config
├── tailwind.config.js               ← Tailwind config
├── index.html                       ← HTML entry point
└── start_dev.bat                    ← Windows dev server launcher
```

---

## 4. Database Design & Schemas

### 4.1 User (Primary Document — `users` collection)

The `User` model is the **central document** for the entire application. Most user data is embedded in this single document.

```
User {
  // ── Core Identity ──
  username: String (unique)
  email: String (unique, lowercase)
  fullName: String
  phoneNumber: String
  password: String (bcrypt hashed)
  createdAt: Date

  // ── Personal Details ──
  personalDetails: {
    dob: Date
    gender: enum['Male', 'Female', 'Other', 'Prefer not to say']
    nationality: String
    location: { city, state, country }
  }
  currentStatus: enum['Student', 'Working Professional']

  // ── Education & Experience ──
  education: [{ degree, specialization, college, startYear, endYear }]
  experience: [{ company, role, startDate, endDate, responsibilities }]
  socialLinks: { github, linkedin, portfolio }

  // ── Career Profile (Skills & Roadmap) ──
  profile: {
    currentSkills: [String]            ← To-learn or in-progress skills
    targetJob: String                  ← Job title to build roadmap for
    experienceLevel: String            ← Beginner / Intermediate / Senior
    completedSkills: [{                ← Mastered skills (quiz passed or cert)
      skill: String,
      score: Number,                   ← Quiz score (0–100)
      masteredAt: Date
    }]
    learningSkills: [String]           ← Skills currently being learned
    focusSkill: String                 ← Single skill user is focusing on
    roadmapCache: {                    ← Cached roadmap data to reduce API calls
      data: Object,
      generatedAt: Date
    }
    jobMatchCache: {                   ← Cached job match results (3h TTL)
      data: Array,
      generatedAt: Date
    }
    lastProfileUpdate: Date            ← Triggers roadmap cache invalidation
  }

  // ── Career Info (Dual-Write Target) ──
  careerInfo: {
    roleType: enum['student', 'employed', 'unemployed']
    collegeName, degree, graduationYear
    currentCompany, previousCompanies[{ companyName, role, duration }]
    yearsOfExperience: Number
    primaryTechStack: [String]
    targetJobRole: String
    visualRoadmap: Object              ← Cached visual roadmap
  }

  // ── Resume (Uploaded File) ──
  resumeFile: { filename, uploadedAt, filePath }

  // ── Resume (Parsed Data) ──
  resumeData: {
    skills: [String], tools: [String]
    projects: [{ title, description, techStack }]
    experience: [{ company, role, duration, description }]
    education: [{ institution, degree, field, year }]
    certifications: [{ name, issuer, date }]
    rawText: String, parsedAt: Date
  }

  // ── Skill Gap Analysis ──
  skillAnalysis: {
    matchingSkills, missingSkills, suggestedSkills, industryDemandSkills
    analysisDate: Date
  }

  // ── Certifications (AI-Analyzed) ──
  certifications: [{
    title, polishedTitle, issuer, issueYear, issueDate
    verificationStatus, verificationMethod
    skills: [String]                   ← All skills found in cert
    masteredSkills: [String]           ← Skills promoted to mastered
    fileUrl: String
    useInResume: Boolean (default: true)
    uploadedAt: Date
  }]

  // ── Projects (README-Analyzed) ──
  projects: [{
    projectName, summary
    techStack: [String]
    keyFeatures: [String]
    skillsExtracted: [String]
    readmeRaw: String
    createdAt: Date
  }]

  // ── Resume Versions ──
  resumeVersions: [{
    versionName, template, targetRole
    content: { summary, experience[], education[], skills[], projects[] }
    createdAt, lastModified: Date
  }]

  migrationCompleted: Boolean
}
```

### 4.2 Resume (`resumes` collection)

Separate document that **mirrors** the resume-related fields from the User document. Used when decoupled resume management is needed.

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId → User | Owner reference |
| `resumeFile` | Object | `{ filename, uploadedAt, filePath }` |
| `resumeData` | Object | Parsed PDF data (skills, experience, education, etc.) |
| `resumeVersions` | Array | Multiple saved resume drafts |
| `certifications` | Array | Certificate records (mirrors User certifications) |

### 4.3 Career (`careers` collection)

Career background information decoupled from the main User document.

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId → User | Owner reference (unique) |
| `roleType` | enum | `student`, `employed`, `unemployed` |
| `collegeName`, `degree`, `graduationYear` | String/Number | Education info |
| `currentCompany` | String | Current employer |
| `previousCompanies` | Array | `[{ companyName, role, duration }]` |
| `yearsOfExperience` | Number | Total professional experience |
| `primaryTechStack` | [String] | Primary technologies used |
| `targetJobRole` | String | Career goal |

### 4.4 Skill (`skills` collection)

Decoupled skill tracking document.

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId → User | Owner (unique) |
| `currentSkills` | [String] | In-progress skills |
| `completedSkills` | Array | `[{ skill, score, masteredAt }]` |
| `learningSkills` | [String] | Currently studying |
| `focusSkill` | String | Single priority skill |

### 4.5 Project (`projects` collection)

Stores AI-analyzed project information from README uploads.

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId → User | Owner |
| `projectName` | String | Auto-extracted project name |
| `summary` | String | AI-generated project summary |
| `techStack` | [String] | Technologies detected |
| `keyFeatures` | [String] | Key project features |
| `skillsExtracted` | [String] | Skills inferred from README |
| `readmeRaw` | String | Original README text |

### 4.6 Roadmap (`roadmaps` collection)

Caches generated roadmap and visual roadmap data per user.

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId → User | Owner (unique) |
| `roadmapCache` | Object | `{ data, generatedAt }` — list-view roadmap |
| `visualRoadmap` | Object | Node-graph roadmap data |

### 4.7 Other Models

| Model | Collection | Purpose |
|---|---|---|
| `SkillDetail` | `skilldetails` | Learning resources for individual skills |
| `SkillAnalysis` | `skillanalyses` | Skill gap analysis snapshots |
| `Education` | `educations` | Standalone education records |
| `Experience` | `experiences` | Standalone experience records |
| `Profile` | `profiles` | Standalone profile documents |

---

## 5. Backend — API Routes

All routes are mounted in `server/index.js`. All protected routes require `Authorization: Bearer <JWT>` header.

### 5.1 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | ❌ | Register new user. Accepts full profile data. Returns JWT. |
| POST | `/api/auth/login` | ❌ | Login with username + password. Returns JWT (7-day expiry). |

**Signup Body Fields**:
`username`, `email`, `fullName`, `phoneNumber`, `password`, `currentStatus`, `personalDetails`, `education[]`, `experience[]`, `socialLinks`

### 5.2 Profile — `/api/profile`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/profile` | ✅ | Fetch full user profile. Uses `dualWriteProfileService`. |
| POST | `/api/profile` | ✅ | Save/update profile (name, skills, target job, personal details, etc.) |
| POST | `/api/profile/toggle-skill` | ✅ | Cycle a skill through: `to-learn → learning → mastered → to-learn` |
| POST | `/api/profile/focus-skill` | ✅ | Set the user's single current focus skill |

**Note**: Updating profile also sets `lastProfileUpdate`, which **invalidates the roadmap cache**.

### 5.3 Roadmap — `/api/roadmap`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/roadmap` | ✅ | Returns cached roadmap if fresh, otherwise generates a new one via `roadmapGenerator.js`. Cache invalidated when `lastProfileUpdate > roadmapCache.generatedAt`. |

**Roadmap Response Structure**:
```json
{
  "skillGap": { "current": 3, "required": 12, "percentage": 25 },
  "missingSkills": ["TypeScript", "Docker", "..."],
  "learningPath": [
    { "skill": "React", "status": "Mastered", "estimatedTime": "Completed", ... },
    { "skill": "TypeScript", "priority": "High", "estimatedTime": "4 weeks", "resources": [...] }
  ],
  "projects": [{ "name": "...", "githubUrl": "...", "stars": 1200, ... }]
}
```

### 5.4 Quiz — `/api/quiz`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/quiz/:skill` | ✅ | Generate 10 MCQ questions for the given skill using Groq LLM. Passing a quiz promotes the skill to `completedSkills`. |

### 5.5 Certificates — `/api/cert`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/cert` | ✅ | Get all user certificates |
| POST | `/api/cert/upload` | ✅ | Upload a certificate file (PDF/JPG/PNG). AI extracts skills automatically. |
| PATCH | `/api/cert/toggle-resume/:id` | ✅ | Toggle whether a cert appears on the generated resume |
| DELETE | `/api/cert/:id` | ✅ | Delete a certificate |

### 5.6 Projects (README Analyzer) — `/api/projects`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | ✅ | List all user uploaded projects |
| POST | `/api/projects/upload-readme` | ✅ | Upload README file → Cerebras AI analyzes it |
| POST | `/api/projects/paste-readme` | ✅ | Paste raw README text → Cerebras AI analyzes it |
| DELETE | `/api/projects/:id` | ✅ | Delete a project |

**Project Analysis Output**: `projectName`, `summary`, `techStack[]`, `keyFeatures[]`, `skillsExtracted[]`

**Skill Integration**: After analysis, `projectSkillIntegrationService` filters extracted skills against the current roadmap and only promotes relevant skills to `completedSkills`.

### 5.7 Job Matches — `/api/jobs`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/jobs/matches` | ✅ | Returns scored job listings. Uses 3-hour cache. Add `?refresh=true` to force refresh. |

**Response**:
```json
{
  "source": "cache|live",
  "generatedAt": "ISO Date",
  "results": [{ "title": "...", "company": "...", "matchScore": 85, ... }]
}
```

### 5.8 Resume — `/api/resume`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/resume` | ✅ | Get the user's resume data and all versions |
| POST | `/api/resume/upload` | ✅ | Upload a PDF resume to parse |
| POST | `/api/resume/generate` | ✅ | AI-generate resume content from profile data |
| POST | `/api/resume/analyze` | ✅ | Analyze uploaded resume for skill gap |
| POST | `/api/resume/versions` | ✅ | Save a new resume version |
| GET | `/api/resume/versions/:id` | ✅ | Get a specific resume version |
| PUT | `/api/resume/versions/:id` | ✅ | Update a resume version |
| DELETE | `/api/resume/versions/:id` | ✅ | Delete a resume version |
| POST | `/api/resume/export/pdf` | ✅ | Export resume as PDF via Puppeteer |
| POST | `/api/resume/export/docx` | ✅ | Export resume as DOCX |
| POST | `/api/resume/enhance` | ✅ | AI enhance a specific text field |

### 5.9 Skill Detail — `/api` (skillDetail routes)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/skill-detail/:skill` | ✅ | Get detailed learning resources, description, and roadmap for a specific skill |

### 5.10 Visual Roadmap — `/api/visual-roadmap`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/visual-roadmap` | ✅ | Get or generate the interactive node-graph roadmap |

---

## 6. Backend — Services

### `roadmapGenerator.js`
**Core intelligence of the roadmap**: Fetches trending skills from GitHub repos (by star count) and Stack Overflow tags. Combines them with `getRequiredSkills()` to produce a top-15 required skill list. Then calls Groq LLM (`llama-3.3-70b-versatile`) to generate learning paths, estimated times, and resource recommendations only for **missing** skills.

**Key Fix (March 2026)**: Irrelevant user skills are no longer merged into the `finalRequiredSkills`. Only skills relevant to the target job are shown in the roadmap graph and used in the skill gap calculation.

### `quizGenerator.js`
Uses Groq LLM to generate 10 multiple-choice questions for any skill. Returns questions with 4 options each and the correct answer index.

### `certificateService.js`
1. Receives uploaded certificate file (PDF or image)
2. Extracts text using `pdf-parse` / `pdfjs-dist` or image-to-text
3. Sends text to Groq LLM for structured extraction: title, issuer, skills, issue date
4. Saves to user's `certifications[]` array
5. Triggers skill mastery update if relevant skills are found

### `projectSkillIntegrationService.js`
After a README is analyzed, this service:
1. Gets all skills extracted from the project
2. Compares them against the user's current roadmap required skills
3. Only promotes skills to "Mastered" if they are relevant to the user's target job
4. Prevents unrelated skills (e.g., "Markdown") from polluting the mastered skills list

### `jobMatchingService.js`
Fetches job listings from an external API filtered by target job role. Scores each listing against user skills using a weighted matching algorithm. Returns ranked results with match percentage.

### `visualRoadmapService.js`
Transforms the linear roadmap data into node-graph format. Assigns positions, priority colors, and dependency edges between skills.

### `resumeParserService.js`
Extracts structured data from uploaded PDF resumes using `pdfjs-dist`. Identifies skills, experience, education, and certifications using pattern matching.

### `resumeGeneratorService.js`
Uses Groq LLM to generate professional resume content (summary, bullet points) based on the user's profile data and target role.

### `exportService.js`
- **PDF**: Uses Puppeteer to launch headless Chromium, renders the resume template HTML to a PDF
- **DOCX**: Uses the `docx` library to generate a formatted Word document

### `aiEnhancementService.js`
Enhances specific text fields (e.g., experience bullet points, professional summary) using Groq LLM. Called from the Resume Builder's AI Enhancement modal.

### `cerebrasService.js`
Sends README text to Cerebras AI API for project analysis. Returns structured JSON with `projectName`, `summary`, `techStack`, `keyFeatures`, and `skillsExtracted`.

### `dualWriteProfileService.js`
Dual-write layer that keeps the embedded `User.profile`, `User.careerInfo` fields in sync with the separate `Skill`, `Career`, and `Profile` collection documents. Exposes: `getProfileData()`, `updateProfile()`, `toggleSkill()`, `setFocusSkill()`.

---

## 7. Frontend — Pages

### `Dashboard.jsx`
The main post-login screen. Displays:
- Skill gap progress bar (mastered vs. required)
- Mastered, learning, and to-learn skill badges
- Focus skill highlight
- Roadmap summary (missing skills)
- Quick links to Quiz, Certificates, Projects
- Job match preview card

### `Profile.jsx`
Read-only profile view. Shows:
- Avatar (initials, `#2a1500` / `#ff5500` theme)
- Status badge (Student / Working Professional)
- Personal details (DOB, gender, nationality, location)
- Education and experience records
- Social links (GitHub, LinkedIn, Portfolio)

### `ProfileForm.jsx`
Editable profile form. Allows updating:
- Personal details, status, social links
- All inputs use `#1a1a1a` background, `#ff5500` focus border
- Save button triggers `PATCH /api/profile` and updates `lastProfileUpdate`

### `Roadmap.jsx`
List-style roadmap view. Shows:
- Skill gap percentage ring
- Mastered skills (highlighted green/orange)
- Skills to learn (with priority badges: High/Medium/Low)
- Estimated time to completion
- Recommended learning resources (links)
- Recommended GitHub project ideas

### `VisualRoadmap.jsx`
Interactive node-graph view of the skill roadmap. Features:
- Draggable skill nodes
- Color-coded by status (Mastered, Learning, To-Learn)
- Priority-based sorting
- Node click to open skill detail

### `Quiz.jsx`
AI-generated 10-question MCQ quiz for a selected skill. Features:
- Question navigation (previous/next)
- Real-time answer selection
- Auto-scoring on completion
- Passing the quiz promotes the skill to `completedSkills` (mastered)
- Confetti celebration animation on pass

### `Certificates.jsx`
Certificate management page. Shows:
- Verified asset count badge
- Upload form (`CertificateUpload` component)
- Grid of `CertificateCard` components
- Empty state with call-to-action
- Toggle to include/exclude from resume
- Delete functionality

### `Projects.jsx`
README analyzer + project list. Features:
- Left panel: README upload (file or paste text)
- Tab toggle: Upload mode vs. Paste mode
- AI analysis via Cerebras API
- Right panel: List of analyzed projects with tech stack tags
- Skill extraction results shown per project

### `JobMatches.jsx`
Job matching interface. Shows:
- List of matched job listings
- Match score percentage per listing
- Required skills breakdown (matching vs. missing)
- Skill badges with color coding
- Search/filter capabilities
- Cached results with refresh option

### `ResumeBuilder.jsx`
Full-featured resume builder. Features:
- Multi-section forms: Summary, Experience, Education, Skills, Projects, Certifications
- Template selector (multiple professional templates)
- Theme color picker
- AI enhancement for any text field (via AI Enhancement Modal)
- Real-time live preview pane
- Drag-and-drop section reordering
- Validation checklist
- Export as PDF or DOCX

### `Login.jsx` / `Signup.jsx`
- **Login**: Username + password form with JWT response handling
- **Signup**: Multi-step form (Basic info → Career status → Skills → Social links) with field validation

### `Home.jsx`
Landing page shown to unauthenticated users.

---

## 8. Frontend — Components

### Common

| Component | Purpose |
|---|---|
| `Avatar.jsx` | Displays user initials in a circle. Theme: `bg-[#2a1500]`, `text-[#ff5500]`. Supports custom size. |
| `Sidebar.jsx` | Left navigation sidebar with route links (Dashboard, Roadmap, Quiz, Certificates, Projects, Jobs, Resume, Profile). |
| `Skeleton.jsx` | Animated loading placeholder component. Used across all pages during data fetching. |
| `SkillTooltip.jsx` | Hover tooltip on skill badges. Shows skill description, learning resources, progress, and quiz shortcut. |

### Profile

| Component | Purpose |
|---|---|
| `CertificateCard.jsx` | Displays a single certificate: title, issuer, issue date, extracted skills, and action buttons (toggle resume, delete). |
| `CertificateUpload.jsx` | Upload form with file drag-and-drop support. Handles PDF and image formats. Shows upload progress and AI analysis result. |

### Resume

| Component | Purpose |
|---|---|
| `ResumeTemplates.jsx` | Defines the HTML/CSS for all resume templates. |
| `ResumePreview.jsx` | Live-renders the resume using the selected template and current form data. |
| `TemplateSelector.jsx` | Grid of template thumbnails for selection. |
| `ThemeColorPicker.jsx` | Color swatches for customizing resume accent color. |
| `ValidationChecklist.jsx` | Shows which required resume sections are filled in. |
| `AIEnhancementModal.jsx` | Modal with AI rewrite options for any selected text field in the resume. |

---

## 9. Authentication Flow

```
1. User submits login form (username + password)
     ↓
2. POST /api/auth/login
     → bcrypt.compare(password, user.password)
     → jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
     ↓
3. Token stored in localStorage ('token')
     ↓
4. All subsequent API calls include:
     Authorization: Bearer <token>
     ↓
5. authMiddleware decodes token → attaches req.userId
     ↓
6. On logout: localStorage.removeItem('token') → redirect to /login
```

**Token Lifetime**: 7 days. No refresh token mechanism currently.

---

## 10. Key Data Flows

### Skill Mastery Flow (3 Pathways)

```
Path A — Manual Toggle:
  User clicks skill badge on Dashboard
    → POST /api/profile/toggle-skill
    → to-learn → learning → mastered → to-learn (cycle)
    → dualWriteProfileService syncs User + Skill documents

Path B — Quiz Pass:
  User completes Quiz.jsx with score ≥ threshold
    → Frontend PATCH /api/profile
    → skill added to User.profile.completedSkills with score
    → lastProfileUpdate set → roadmapCache invalidated

Path C — Certificate Upload:
  User uploads certificate → POST /api/cert/upload
    → certificateService extracts skills
    → Skills added to User.certifications[].masteredSkills
    → Profile sync updates completedSkills
```

### Roadmap Generation Flow

```
GET /api/roadmap
  → Check roadmapCache.generatedAt vs lastProfileUpdate
  → If cache is fresh: return cached data
  → If stale:
      1. getGitHubSkillsAdvanced(targetJob)   → GitHub API (top repos by stars)
      2. getStackOverflowSkills(targetJob)    → Stack Overflow API (popular tags)
      3. getRequiredSkills()                  → Top 15 trending skills
      4. finalRequiredSkills = [...requiredSkills] (no irrelevant user skills added)
      5. missingSkills = finalRequired - masteredSkills
      6. getAILearningPath(missingSkills)     → Groq LLM
      7. masteredSkillsObjects = masteredSkills filtered by finalRequiredSkillsLower
      8. fullLearningPath = [mastered..., toLearn...]
      9. skillGap = { current, required, percentage }
     10. Save to roadmapCache → return response
```

### Certificate to Skill Flow

```
POST /api/cert/upload (multipart/form-data)
  → multer.memoryStorage() receives file buffer
  → certificateService.extractText(buffer)    → pdf-parse / pdfjs-dist
  → certificateService.analyzeWithAI(text)    → Groq LLM
  → Returns: { title, issuer, issueDate, skills[], masteredSkills[] }
  → Saved to User.certifications[]
  → Profile refreshed in localStorage on client
```

---

## 11. Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | Server port (default: 5000) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (32+ characters) |
| `GROQ_API_KEY` | ✅ | Groq LLM API key (quiz, certs, roadmap AI) |
| `GITHUB_TOKEN` | ✅ | GitHub PAT for repo search API |
| `GOOGLE_GENERATIVE_AI_KEY` | ⚪ | Google Gemini alternative AI |
| `CEREBRAS_API_KEY` | ⚪ | Cerebras AI for README analysis |

### Frontend (`.env` in project root)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ (prod) | Backend base URL (e.g., `http://localhost:5000` in dev) |

---

## Recent Changes (March 2026)

| File | Change |
|---|---|
| `server/services/roadmapGenerator.js` | **Fixed**: Removed logic that merged irrelevant user skills into `finalRequiredSkills`. Mastered skill objects now filtered to only job-relevant skills. Skill gap calculation updated accordingly. |
| `src/components/common/Avatar.jsx` | Updated to dark/orange theme: `bg-[#2a1500]`, `text-[#ff5500]` |
| `src/pages/Profile.jsx` | Full dark theme: `#0a0a0a` background, `#111111` cards, `#242424` borders |
| `src/pages/ProfileForm.jsx` | Input styling: `#1a1a1a` background, `#ff5500` focus, `#ff5500` button |
| `src/pages/Projects.jsx` | Left panel: `#111111` card, FolderGit2 icon `#ff5500`, tab toggles updated |
| `src/pages/Certificates.jsx` | Loading icon, stats card, empty state all updated to dark/orange theme |
