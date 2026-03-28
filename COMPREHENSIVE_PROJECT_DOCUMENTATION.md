# Career Tracker - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Database Schema](#database-schema)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend Implementation](#backend-implementation)
8. [API Routes & Endpoints](#api-routes--endpoints)
9. [Core Services](#core-services)
10. [Authentication System](#authentication-system)
11. [Key Features Detailed](#key-features-detailed)
12. [Data Flow & Workflows](#data-flow--workflows)
13. [Setup & Installation](#setup--installation)
14. [Running the Application](#running-the-application)
15. [Environment Variables](#environment-variables)
16. [Visual Roadmap System](#visual-roadmap-system)
17. [Resume AI Prompts & Generation Logic](#resume-ai-prompts--generation-logic)
18. [Skill Normalization System](#skill-normalization-system)
19. [Text Processing Utilities](#text-processing-utilities)
20. [UI Component Details](#ui-component-details)
21. [Routing & Layout Architecture](#routing--layout-architecture)

---

## Project Overview

**Project Name:** Skill Career Tracker (CareerPath)

**Description:** A comprehensive MERN (MongoDB, Express, React, Node.js) stack web application designed to help users track their career progression, analyze skill gaps, generate personalized learning roadmaps, and certify their mastery through AI-powered quizzes. The application features a premium dark-themed UI with a signature orange accent.

**Target Users:**
- Students planning their career path
- Working professionals looking to upskill
- Career changers seeking guidance
- Job seekers preparing for interviews

**Core Objectives:**
1. Identify skill gaps between current and target job requirements
2. Provide personalized learning roadmaps using AI (Gemini 1.5-flash) with specialized caching for performance
3. Generate skill assessments via AI-powered quizzes (Llama 3.1 8B via Groq)
4. Track skill mastery with visual progress indicators
5. Enable resume building with AI enhancement
6. Manage certifications and portfolio
7. Integrate project analysis using Cerebras AI (README upload)
8. Match job listings against user skills via Adzuna API

---

## Technology Stack

### Frontend
- **Framework:** React 19.2.0 (with Vite 7.2.4)
- **Routing:** React Router DOM 7.13.0
- **Styling:** Tailwind CSS 3.4.1, PostCSS 8.4.35
- **UI Components:** Lucide React (icons) 0.563.0
- **Charts:** Recharts 3.7.0 (data visualization)
- **Drag & Drop:** @hello-pangea/dnd 18.0.1
- **Effects:** Canvas Confetti 1.9.4 (celebration animations)
- **HTTP Client:** Axios 1.13.5
- **Build Tool:** Vite 7.2.4

### Backend
- **Runtime:** Node.js (ES Modules — `"type": "module"`)
- **Server Framework:** Express 5.2.1
- **Database:** MongoDB (via Mongoose 9.1.5) — local (`mongodb://localhost:27017/career-tracker`) or Atlas
- **Authentication:** JWT (jsonwebtoken 9.0.3), bcryptjs 3.0.3
- **File Processing:**
  - PDF Parsing: pdf-parse 1.1.1, pdfjs-dist 5.4.624
  - Image Processing: Sharp 0.32.6
  - Document Generation: docx 9.5.1
  - Screenshotting/PDF Export: Puppeteer 24.37.3
- **AI Services:** 
    - Groq SDK 0.37.0 — Llama 3.3 70B (resume generation, certificate analysis, skill details), **Llama 3.1 8B** (quiz generation)
    - Cerebras Cloud SDK 1.64.1 — llama3.1-8b (project README analysis)
    - Google Generative AI 0.24.1 — **Gemini 1.5-flash** (Visual Roadmap tier organization & resources)
- **UI Theme:** Custom Dark/Orange theme (`#111111` background, `#ff5500` primary accent)
- **Job Matching:** Adzuna REST API (job board search + skill scoring)
- **API Integration:**
  - GitHub API via @octokit/rest 22.0.1 (roadmap skill sourcing)
  - Axios 1.13.3 (HTTP requests, Stack Overflow API)
- **Middleware:**
  - CORS 2.8.6
  - Multer 1.4.4-lts.1 (file uploads — memory storage)
- **Environment:** dotenv 17.3.1

### Development Tools
- **Frontend:** ESLint 9.39.1, Vite plugins
- **Backend:** Nodemon 3.1.14 (development hot reload)

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                       Frontend (React)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Pages: Dashboard, Profile, ResumeBuilder,      │   │
│  │  Certificates, Projects, Quiz, Roadmap,         │   │
│  │  Visual Roadmap (Tiered), Job Matches            │   │
│  │                                                   │   │
│  │  Components: Skill Cards, Radar Chart, Forms,   │   │
│  │  Preview Panels, Modals, Skill Tooltips          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓ (Axios)
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (Port 5000)              │
│                    Express Server                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Routes & Middleware Layer                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Auth Routes  │  Profile Routes                  │   │
│  │ Quiz Routes  │  Resume Routes                   │   │
│  │ Roadmap      │  Certificate Routes              │   │
│  │ Projects     │  Skill Details Routes            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          Controllers & Services Layer                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Quiz Generator Service                          │   │
│  │ Resume Parser/Generator/Analyzer Service        │   │
│  │ Roadmap Generator Service                       │   │
│  │ Visual Roadmap Service (Tiered/Gemini)          │   │
│  │ Skill Matching/Normalization Service            │   │
│  │ Certificate Service                             │   │
│  │ AI Enhancement Service                          │   │
│  │ GitHub Integration Service                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         External AI & Data Services                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Groq API (Quiz, Resume, Roadmap, Certs, Skills) │   │
│  │ Google Generative AI / Gemini (Visual Roadmap)  │   │
│  │ Cerebras API (Project README Analysis)          │   │
│  │ Adzuna API (Job Matching)                       │   │
│  │ GitHub API (Roadmap + Resume Analysis)          │   │
│  │ Stack Overflow API (Skill Trends)               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Data Layer (MongoDB)                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ User Collection       (Profiles, Skills)        │   │
│  │ SkillDetail Collection (Skill Resources)        │   │
│  │ Certificates Collection                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **MVC Pattern:** Controllers handle requests, Services handle business logic, Models define data structure
2. **Middleware Pattern:** Authentication, file upload, and request processing middleware
3. **Service Layer Pattern:** Separation of concerns with specialized services
4. **Repository Pattern:** Mongoose models act as data access layer
5. **Factory Pattern:** Service initialization (e.g., Groq client instantiation)
6. **Singleton Pattern:** AI client instances are cached to prevent multiple initializations

---

## Directory Structure

### Frontend Structure

```
src/
├── components/                  # Reusable React components
│   ├── Avatar.jsx               # User avatar component
│   ├── ResumePreview.jsx        # Legacy resume preview display (root-level)
│   ├── ResumeUploadForm.jsx     # Resume upload interface
│   ├── Sidebar.jsx              # Navigation sidebar (Dashboard, Profile, Resume Builder,
│   │                            #   Projects, Certificates, Job Matches)
│   ├── Skeleton.jsx             # Loading placeholders (StatsCardSkeleton, SkillCardSkeleton)
│   ├── SkillGapAnalysis.jsx     # Skill gap visualization
│   ├── SkillRoadmap.jsx         # Learning roadmap display
│   ├── SkillTooltip.jsx         # Skill information tooltip
│   ├── profile/                 # Profile-related components
│   │   ├── CertificateCard.jsx  # Single certificate display card
│   │   └── CertificateUpload.jsx # Certificate upload form component
│   └── resume/                  # Resume builder sub-components
│       ├── AchievementForm.jsx  # Achievements editor form
│       ├── AIEnhancementModal.jsx # AI Success Enhancer modal (Groq-powered)
│       ├── EducationForm.jsx    # Education section editor
│       ├── ExperienceForm.jsx   # Experience section editor
│       ├── InterestsForm.jsx    # Interests section editor
│       ├── LanguagesForm.jsx    # Languages section editor
│       ├── ResumePreview.jsx    # Live resume preview (resume-specific)
│       ├── ResumeTemplates.jsx  # Template rendering logic
│       ├── TemplateSelector.jsx # Template picker (Professional, Modern Sidebar, Balanced)
│       ├── ThemeColorPicker.jsx # Theme color customizer
│       ├── ValidationChecklist.jsx # Resume quality score checklist
│       └── templates/           # Individual template components
│           ├── ProfessionalClassicTemplate.jsx
│           ├── ModernSidebarTemplate.jsx
│           └── BalancedTwoColumnTemplate.jsx
├── layouts/
│   └── DashboardLayout.jsx      # Protected dashboard wrapper
├── pages/                       # Page components
│   ├── Certificates.jsx         # Certification management
│   ├── Dashboard.jsx            # Main dashboard (radar chart, skill columns, focus skill)
│   ├── Home.jsx                 # Landing page (inside App.jsx as inline component)
│   ├── JobMatches.jsx           # Job matching page (Adzuna API)
│   ├── Login.jsx                # Login page
│   ├── Profile.jsx              # User profile view (read-only)
│   ├── ProfileForm.jsx          # Profile setup / edit form
│   ├── Projects.jsx             # Project dashboard (README upload + Cerebras analysis)
│   ├── Quiz.jsx                 # Quiz interface (25 MCQ, 90% pass)
│   ├── ResumeBuilder.jsx        # Resume builder (multi-template, AI-powered)
│   ├── Roadmap.jsx              # Learning roadmap page (linear list with skill gap stats)
│   ├── Signup.jsx               # User registration (multi-section form)
│   └── VisualRoadmap.jsx        # Tiered visual roadmap (Gemini AI + alternating timeline)
├── utils/
│   ├── textPolisher.js          # Client-side text formatting helpers (no AI)
│   └── useDescriptionEnhancer.js # Custom React hook for debounced AI description enhancement
├── assets/                      # Static assets
├── App.jsx                      # Main app with routing (Home component inline)
├── index.css                    # Global styles
└── main.jsx                     # React DOM render entry point
```

### Backend Structure

```
server/
├── index.js                         # Server entry point — loads all routes
├── package.json                     # Dependencies (ES Modules)
├── .env                             # Environment variables (not committed)
├── .env.example                     # Environment variable template
├── config/
│   └── roleSkills.js                # Predefined role-to-skill mappings
├── controllers/
│   ├── certificateController.js     # Certificate upload, list, toggle, delete
│   └── resumeController.js          # Resume upload/parse/analyze/export/versions
├── middleware/
│   └── authMiddleware.js            # JWT auth — exports `protect` (sets req.user & req.userId)
├── models/
│   ├── User.js                      # Main user schema (skills, resume, certs, projects, jobs cache)
│   └── SkillDetail.js               # Skill resources cache (30-day TTL)
├── routes/
│   ├── auth.js                      # POST /signup, POST /login
│   ├── certificate.js               # GET /, POST /upload, PATCH /toggle-resume/:id, DELETE /:id
│   ├── jobs.js                      # GET /matches (Adzuna + skill scoring + 3h cache)
│   ├── profile.js                   # GET /, POST /, toggle-skill, focus-skill
│   ├── projects.js                  # POST /analyze (Cerebras README), POST /save, GET /, DELETE /:id
│   ├── quiz.js                      # GET /:skill (Groq quiz generation)
│   ├── resume.js                    # Upload, parse, analyze, generate, enhance, export, versions
│   ├── roadmap.js                   # GET / (cached or fresh AI roadmap)
│   ├── skillDetail.js               # POST /skill-detail (AI + MongoDB cache)
│   └── visualRoadmap.js             # GET / (Gemini tiered roadmap, cached in careerInfo.visualRoadmap)
├── services/
│   ├── aiEnhancementService.js      # Groq: summary, achievement, project description helpers
│   ├── cerebrasService.js           # Cerebras llama3.1-8b: README analysis
│   ├── certificateService.js        # Groq: certificate text analysis + skill extraction
│   ├── exportService.js             # Puppeteer PDF + docx DOCX resume export
│   ├── githubProjectService.js      # GitHub API: job-related repo skill extraction
│   ├── jobMatchingService.js        # Adzuna API: fetch jobs + score against user skills
│   ├── projectSkillIntegrationService.js # Promote README-extracted skills to Mastered
│   ├── quizGenerator.js             # Groq llama-3.1-8b-instant: 25-question quiz
│   ├── resumeAnalyzerService.js     # GitHub-based industry skill gap analysis service
│   ├── resumeGeneratorService.js    # Data aggregator + student/professional profile detector
│   ├── resumeParserService.js       # PDF text extraction (pdf-parse + pdfjs-dist fallback)
│   ├── roadmapGenerator.js          # Groq + GitHub + Stack Overflow roadmap builder
│   ├── skillMatchingService.js      # Fuzzy skill matching (aliases, substrings, normalization)
│   └── visualRoadmapService.js      # Google Gemini 1.5-flash: tiered visual roadmap generator
├── utils/
│   ├── skillNormalizer.js           # Skill name normalization
│   └── textCleaner.js               # Text processing utilities
├── data/
│   └── fallbackQuiz.js              # Static fallback quiz questions
└── tests/
    ├── resume_preview.html          # Resume preview test file
    ├── simple.js                    # Simple test script
    ├── testParser.js                # PDF parser testing
    └── testTemplate.js              # Template testing
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,

  // Basic Info
  username: String (required, unique),
  email: String (required, unique, lowercase),
  fullName: String (required),
  phoneNumber: String (required),
  password: String (required, hashed),

  // Personal Details
  personalDetails: {
    dob: Date,
    gender: String (enum: ['Male', 'Female', 'Other', 'Prefer not to say']),
    nationality: String,
    location: {
      city: String,
      state: String,
      country: String
    }
  },

  // Status & Career
  currentStatus: String (required, enum: ['Student', 'Working Professional']),
  education: [{
    degree: String,
    specialization: String,
    college: String,
    startYear: String,
    endYear: String
  }],
  experience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    responsibilities: String
  }],

  // Social Links
  socialLinks: {
    github: String,
    linkedin: String,
    portfolio: String
  },

  // Profile & Skills
  profile: {
    currentSkills: [String],                // Skills user knows
    targetJob: String,                      // Target job role
    experienceLevel: String,
    completedSkills: [{                     // Mastered skills (from quiz, certs, or projects)
      skill: String,
      score: Number,
      masteredAt: Date,
      source: String                        // 'practice' | 'certificate' (optional)
    }],
    learningSkills: [String],               // Currently learning (default: [])
    focusSkill: String,                     // Current focus skill (default: '')
    roadmapCache: {                         // Cached roadmap (Object, expires on profile change)
      data: Object,
      generatedAt: Date
    },
    jobMatchCache: {                        // Cached Adzuna job matches (3h TTL)
      data: Array,
      generatedAt: Date
    },
    lastProfileUpdate: Date                 // Updated whenever currentSkills/targetJob/experienceLevel changes
  },

  // Career Info
  careerInfo: {
    roleType: String (enum: ['student', 'employed', 'unemployed', null]),
    collegeName: String,
    degree: String,
    graduationYear: Number,
    currentCompany: String,
    previousCompanies: [{
      companyName: String,
      role: String,
      duration: String
    }],
    yearsOfExperience: Number,
    primaryTechStack: [String],
    targetJobRole: String,
    visualRoadmap: Object          // Cached tiered roadmap from Gemini (tiers[], targetJob)
  },

  // Uploaded Resume File Reference
  resumeFile: {
    filename: String,
    uploadedAt: Date,
    filePath: String
  },

  // Parsed Resume Data (from PDF upload)
  resumeData: {
    skills: [String],
    tools: [String],
    projects: [{
      title: String (required),
      description: String,
      techStack: [String]
    }],
    experience: [{
      company: String,
      role: String (required),
      duration: String,
      description: String
    }],
    education: [{
      institution: String (required),
      degree: String,
      field: String,
      year: Number
    }],
    certifications: [{
      name: String (required),
      issuer: String,
      date: String
    }],
    rawText: String,
    parsedAt: Date
  },

  // Skill Gap Analysis Results
  skillAnalysis: {
    matchingSkills: [String],
    missingSkills: [String],
    suggestedSkills: [String],
    industryDemandSkills: [String],
    analysisDate: Date
  },

  // Certifications (uploaded as PDF, analyzed by Groq)
  certifications: [{
    title: String,
    polishedTitle: String,
    issuer: String,
    issueYear: Number,
    issueDate: Date,
    verificationStatus: String,
    skills: [String],
    masteredSkills: [String],
    fileUrl: String,
    verificationMethod: String,
    useInResume: Boolean (default: true),
    uploadedAt: Date
  }],

  // AI-analyzed Projects (from README uploads via Cerebras)
  projects: [{
    projectName: String,
    summary: String,
    techStack: [String],
    keyFeatures: [String],
    skillsExtracted: [String],
    readmeRaw: String,
    createdAt: Date
  }],

  // Saved Resume Versions
  resumeVersions: [{
    versionName: String (required),
    template: String (default: 'modern'),
    targetRole: String,
    content: {
      summary: String,
      experience: Array,
      education: Array,
      skills: Array,
      projects: Array
    },
    createdAt: Date,
    lastModified: Date
  }],

  createdAt: Date,
  migrationCompleted: Boolean
}
```

### SkillDetail Collection

```javascript
{
  _id: ObjectId,
  skill: String (required, lowercase, unique with targetJob),
  targetJob: String (lowercase, default: 'software developer'),
  description: String (required),
  whyItMatters: String,
  resources: [{
    type: String,              // 'book', 'course', 'tutorial', 'documentation'
    name: String,
    url: String,
    difficulty: String         // 'beginner', 'intermediate', 'advanced'
  }],
  createdAt: { type: Date, default: Date.now, expires: 2592000 } // Auto-delete after 30 days
}
```

---

## Frontend Implementation

### Core Pages

#### 1. **Home Page (App.jsx — inline `Home` component)**
- Landing page with hero section
- Navigation bar with CareerPath branding and backdrop blur
- "Start Your Journey" and "Get Started" CTAs linking to `/signup`
- Gradient background (`from-blue-50 via-white to-purple-50`)
- Login link in navbar
- Hero headline: "Your Personalized Path to Your Dream Career"

#### 2. **Login Page (Login.jsx)**
- Form-based login with username + password
- Password visibility toggle
- Error message display
- Token stored in `localStorage` on success
- Redirects to `/dashboard`

#### 3. **Dashboard (Dashboard.jsx)**
- Main hub post-login
- **Intro prompt** shown when profile is incomplete (no `targetJob`) — CTA to `/profile`
- **Target Career Path header** showing target job title with "Full Roadmap" and "Edit Profile" buttons
- **Stats panel** (left column): Mastered count / required total, Learning count, AI Resume shortcut, Overall Match % progress bar
  - Progress formula: `(mastered + learning × 0.5) / required × 100`
- **Radar chart** ("Skill Fingerprint 🧬") — Recharts RadarChart showing skill mastery levels
  - Mastered = 100, Learning = 60, To Learn = 20
  - Labels truncated at 12 chars, uppercase tracking
- **Certificate CTA card** — black gradient banner linking to `/dashboard/certificates`
- **Skill Acquisition section** — filter toolbar + three-column kanban layout
- Three-column skill layout: **To Learn** / **Learning** / **Mastered**
- Skill filtering: search term (`searchTerm`), priority filter (All/High/Medium/Low), status filter (All/To Learn/Learning/Mastered), hide mastered toggle
- Skill cards sorted by priority weight: High=1, Medium=2, Low=3
- Optimistic UI: parallel `Promise.all` for profile + roadmap; shows cached `localStorage` data first
- **Skill interactions:**
  - Click skill card → 3-state toggle cycle (To Learn → Learning → Mastered → To Learn)
  - ⭐ focus icon → `POST /api/profile/focus-skill` (toggles current focus skill)
  - Click skill name → opens `SkillTooltip` modal with AI-generated description + resources
- Skeleton loaders: `StatsCardSkeleton` × 3, `SkillCardSkeleton` for skill list
- Parallel data fetch: `GET /api/profile` + `GET /api/roadmap`

**Skill Status Cycle:**
```
To Learn → Learning → Mastered → To Learn
```

#### 4. **Profile Page (Profile.jsx)**
- Read-only display of user info
- Name, email, status badge, location
- Personal details (DOB, gender, nationality)
- Education and work experience history
- Social links (GitHub, LinkedIn, Portfolio)
- Avatar with initials

#### 5. **ProfileForm Page (ProfileForm.jsx)**
- **Simplified Edit Flow:** Updated to a dedicated "Edit Profile" experience
- **Target Job Focus:** Allows users to set or update their target job role to drive roadmap generation
- **Automatic Skill Mapping:** Manual skill entry has been removed; skills are now automatically derived from the target career path and certifications
- Sends data to `POST /api/profile`
- Triggers `lastProfileUpdate` timestamp update → invalidates roadmap cache (but Visual Roadmap uses a persistent cache-first update model)

#### 6. **Resume Builder (ResumeBuilder.jsx)**
- Multi-section AI-powered resume builder
- **Sidebar navigation:** Simplified to focus on core content: Experience, Education, Achievements, Projects, Interests, Languages
- **Template selector:** Professional Classic, Modern Sidebar, Balanced Two-Column
- **Theme color picker** for visual customization
- **AI generation:** fetches aggregated data + calls `POST /api/resume/generate` (Groq Llama 3.3 70B)
- **Profile type detection:** separate prompts for Student/Fresher vs. Professional
- **Section regeneration:** each section can be individually regenerated via `POST /api/resume/regenerate-section`
- **AI Enhancement Modal:** inline text enhancer using Groq (3 variations shown)
- **Validation Checklist:** quality score (0–100%) checking summary length, skills count, projects, experience, education
- **Export:** PDF (Puppeteer) or DOCX (docx library) via `POST /api/resume/export/:format`
- **Resume versioning:** save named versions to DB, load from `localStorage` per user ID
- **Forms:** separate form components for Experience, Education, Achievements, Interests, Languages
- **Client-side text polisher** (`textPolisher.js`) for formatting without AI
- **User-specific localStorage:** `resumeData_<userId>` key to isolate per user

**Key Resume Sections (JSON output from AI):**
```json
{
  "summary": "string",
  "experience": [{ "company", "role", "duration", "description (STAR bullets)" }],
  "education": [{ "institution", "degree", "field", "year" }],
  "skills": [{ "category", "items": [] }],
  "masteredSkills": [{ "name" }],
  "projects": [{ "title", "description", "techStack": [] }],
  "certificates": [{ "name", "issuer", "year" }],
  "achievements": [],
  "interests": [],
  "languages": [],
  "contact": { "email", "phone", "linkedin", "github" }
}
```

#### 7. **Quiz Page (Quiz.jsx)**
- AI-generated 25-question MCQ assessments per skill
- Difficulty levels: easy, medium, hard
- Pass threshold: **90%** (23/25 correct)
- Celebration confetti on pass (canvas-confetti)
- Retry with different questions on fail (anti-repetition enforced)
- On pass: calls `POST /api/profile/toggle-skill` with `forceMaster: true` to mark skill Mastered
- Fallback quiz from `server/data/fallbackQuiz.js` if AI fails

#### 8. **Certificates Page (Certificates.jsx)**
- Upload certificate PDFs via `CertificateUpload` component
- Display certificates via `CertificateCard` component
- Each certificate: polished title, issuer, year, skills extracted
- Toggle visibility for resume inclusion (`useInResume` flag)
- Delete certificates
- On upload success: refreshes profile in localStorage

#### 9. **Projects Page (Projects.jsx)**
- README-based project analysis (not GitHub API — users upload `.md` or `.txt` files)
- Upload README file or paste raw text
- Cerebras llama3.1-8b analyzes: project name, summary, tech stack, key features, extracted skills
- Preview analysis before saving
- Save project to DB: skills auto-promoted to Mastered if they match roadmap
- Delete saved projects
- Project cards show: name, summary, tech stack badges, key features, extracted skills

#### 10. **Job Matches Page (JobMatches.jsx)**
- Fetches real job listings from **Adzuna API** based on user's target job role
- Scores each job by comparing job description skills against user's known + mastered skills
- Match labels: **Strong Match (≥75%)**, **Good Match (≥50%)**, **Partial Match (≥25%)**, **Low Match**
- Shows matched skills (green badges) and missing skills (gray badges) per listing
- Client-side search by title or company
- **3-hour server-side cache** in `profile.jobMatchCache` — refresh button bypasses cache
- Filters: only shows jobs with at least one detected skill
- Links to live job posting via "View Job" button

#### 11. **Roadmap Page (Roadmap.jsx)**
- Classic linear roadmap page (separate from VisualRoadmap)
- **Skill Gap Analysis panel:** displays Current Skills count, Required Skills count, Match Percentage, gradient progress bar, and Missing Skills list
- **Learning Path cards:** per-skill cards with priority badge, time estimate, descriptions, and resource links
- Mastered skill cards shown with green checkmark badge
- Skill cards interactive: hover opens `SkillTooltip` (click on skill name), ESC or click-outside closes
- Animated loading screen with bouncing dots and 🗺️ emoji
- Optimistic UI: loads from `localStorage` (`userRoadmap`) before API response
- Parallel fetch: `GET /api/profile` + `GET /api/roadmap`
- Back to Dashboard button in header

#### 12. **Visual Roadmap Page (VisualRoadmap.jsx)**
- Located at `/dashboard/visual-roadmap` (within `DashboardLayout`)
- Tiered roadmap view with alternating left/right timeline layout
- **Performance Optimized (Cache-First):** The roadmap is generated once by Gemini and stored. Mastery status updates are computed instantly in-process rather than via AI regeneration.
- **Progress calculation:** counts Mastered skills across all tiers → percentage
- **Vertical timeline spine:** center line with gradient (`#ff5500` theme)
- **Tiers displayed in sequence:**
  - Tier 0: "Mastered" (green badge)
  - Tier 1: "Start Here" (indigo badge)
  - Tier 2: "Next Steps" (purple badge)
  - Tier 3: "Advanced/Optional" (orange badge)
- Skills alternate left/right of the center line per tier
- **Skill node dot color:** mastered=green, High priority=indigo, Medium=purple, Low=gray
- **Skill card:** shows skill name, category badge, time estimate, priority, dependencies list, optional resources
- Click skill card → **Detail slide-in panel** showing course resources (YouTube, Course, Docs, etc.)
- Resource icons by type: YouTube → YouTube icon, Course → GraduationCap, Docs → BookOpen, others → Globe
- **Cache:** stored in `user.careerInfo.visualRoadmap` in MongoDB
- **Refresh:** query `?refresh=true` forces Gemini regeneration + cache update
- Skeleton loader: animated pulse layout with header + 3 timeline entries

### Component Library

#### `Sidebar.jsx`
Navigation links: Dashboard, Profile, Resume Builder, Projects (FolderGit2 icon), Certificates, Job Matches, Visual Roadmap (Map icon)

- Fixed left sidebar (w-64)
- Active state: blue-600 background + white text + shadow + slight x-translate
- Inactive: slate-500 text, hover to slate-900
- Footer: version label "CareerPath v1.0.0"

#### `SkillTooltip.jsx`
Modal overlay (not a hover popup) — opens as a full-screen backdrop when a skill name is clicked:
- Fixed `inset-0` overlay with `bg-black/40 backdrop-blur-sm`
- Content: max-w-2xl, max-h-85vh scrollable modal
- Header: gradient avatar with skill initial, skill name, close button
- Skill description paragraph
- "Why it matters" section
- Resources list with **9 resource type icons** (Docs, Course, Video, Tutorial, Practice, Tool, Search, Book, Playground)
- Per-type badge colors for visual scanning
- Closes on: backdrop click, ESC key, close button
- Cancels fetch on unmount (via `cancelled` flag)
- Fetches from: `POST /api/skill-detail` with `{ skill, targetJob }`

#### `resume/AIEnhancementModal.jsx`
Modal opens when user clicks "AI Enhance" on a text field. Shows original vs. enhanced comparison + up to 3 variations to pick from.

#### `resume/TemplateSelector.jsx`
Three templates with gradient header:
- `professional` — Traditional single-column (Layout icon)
- `modern-sidebar` — Two-part sidebar design (Sidebar icon)
- `balanced` — Efficient section layout (Grid3x3 icon)

Active state: indigo-50 background + indigo-500 border + ring

#### `resume/ValidationChecklist.jsx`
Quality score panel (0–100%) with 5 weighted checks:
- Summary length > 100 characters
- Skills count ≥ 3
- Projects count ≥ 2
- Experience section present
- Education section present

Each check worth 20 points; score shown as percentage.

#### `resume/ThemeColorPicker.jsx`
Color picker for resume accent color.

#### `utils/useDescriptionEnhancer.js`
Custom React hook with 800ms debounce for real-time Groq-powered description enhancement.

#### `utils/textPolisher.js`
Client-side formatting (no AI call):
- Trim, punctuation spacing, sentence capitalization
- Abbreviation uppercasing: API, UI, AWS, CSS, HTML, JS, etc.
- Bullet normalization
- Used in ResumeBuilder for instant lightweight text cleanup

---

## Backend Implementation

### Layout System

#### DashboardLayout (`DashboardLayout.jsx`)
- Wraps all `/dashboard/*` routes via React Router `<Outlet />`
- Fixed left `<Sidebar />` (w-64)
- Right content area with `ml-64` offset
- **Sticky top nav bar** (`backdrop-blur-md bg-white/80 border-b`) containing:
  - Right-aligned: "Logged in as" label + `fullName`, `Avatar` (sm), Logout button
- **Logout handler:** removes `token` + `userProfile` from `localStorage`, navigates to `/login`
- Fetches `GET /api/profile` on mount to populate top bar name
- Main content: `max-w-7xl mx-auto px-6 py-10`

---

### Authentication System

#### JWT-Based Authentication
```javascript
// Signup
POST /api/auth/signup
Body: { username, email, fullName, phoneNumber, password, currentStatus,
        personalDetails?, education?, experience?, socialLinks? }
Returns: { token, user: { id, username, email, fullName } }

// Login
POST /api/auth/login
Body: { username, password }
Returns: { token, userId, username }

// Token lifetime: 7 days
// Storage: localStorage.setItem('token', token)
```

#### Auth Middleware (`authMiddleware.js`)
```javascript
// Exported as: `protect`
// Sets: req.user = { _id: decoded.userId }, req.userId = decoded.userId
export const protect = (req, res, next) => {
  // Extract Bearer token from Authorization header
  // Verify with JWT_SECRET
  // Return 401 if missing or invalid
}
```

> **Note:** Routes have two different auth middleware patterns:
> - `profile.js`, `roadmap.js`, `quiz.js`: inline local middleware — sets only `req.userId = decoded.userId`
> - `resume.js`, `visualRoadmap.js`: inline middleware that additionally fetches full `User` from DB — sets `req.user` (full document)
> - `certificate.js`: uses shared `protect` from `authMiddleware.js` — sets `req.user = { _id }` and `req.userId`

### Signup Form Validation

**`Signup.jsx`** performs client-side validation before submitting:
- `fullName` — required
- `username` — required
- `email` — required + regex format check
- `phoneNumber` — required + must be numeric only
- `password` — required + minimum 6 characters
- `confirmPassword` — must match password
- `currentStatus` — required (Student / Working Professional)
- **Education fields** — required for **all** statuses (degree, specialization, college, years)
- **Experience fields** — required only for `Working Professional` (company, role, dates)
- Social links — optional but URL format validated if provided
- **Password strength indicator** via `getPasswordStrength()` helper
- On error: auto-scrolls to top to reveal first error

**Data transformation on submit:**
- Education years string `"2020-2024"` → split into `startYear` / `endYear`
- Experience dates string `"Jan 2022 - Present"` → `startDate` / `endDate` ("present" → `null`)
- Non-professional users: `experience: []` sent to server
- On success: stores `token`, `userId`, `username` in `localStorage`

---

### Controllers

#### Resume Controller (`resumeController.js`)
- `uploadAndParseResume()` — parse uploaded PDF resume (dual parser: pdf-parse → pdfjs-dist fallback)
- `analyzeResume()` — skill gap analysis against target job
- `getResumeData()` — fetch parsed resume data by userId
- `updateResumeData()` — manual edit of parsed resume data
- `deleteResume()` — remove resume data
- `generateResumeData()` — wrapper for AI generation (moved to inline route handler in `resume.js`)
- `enhanceResumeText()` — AI enhancement of arbitrary text
- `enhanceDescription()` — real-time STAR-format description polish
- `exportResume()` — export as PDF (Puppeteer) or DOCX (docx)
- `getResumeVersions()` — list saved versions
- `saveResumeVersion()` — persist named version to DB
- `getSkillAnalysis()` — return stored skill analysis

#### Certificate Controller (`certificateController.js`)
- `getCertificates()` — list user certifications
- `uploadCertificate()` — save file → extract PDF text → Groq analysis → update user skills
- `toggleCertificateResume()` — flip `useInResume` flag
- `deleteCertificate()` — remove certificate and file

---

## API Routes & Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /signup              — Create new user account
POST   /login               — Login and receive JWT token
```

### Profile Routes (`/api/profile`)
```
GET    /                    — Get full user profile + certifications
POST   /                    — Update profile (currentSkills, targetJob, experienceLevel)
POST   /toggle-skill        — 3-state skill cycle: to-learn → learning → mastered
                              Body: { skill, score?, forceMaster? }
POST   /focus-skill         — Set or unset the focus skill (toggle)
                              Body: { skill }
```

### Roadmap Routes (`/api/roadmap`)
```
GET    /                    — Return cached roadmap or generate fresh one
                              Invalidates cache when profile.lastProfileUpdate > roadmapCache.generatedAt
                              Query: refresh=true to force regeneration
```

### Visual Roadmap Routes (`/api/visual-roadmap`)
```
GET    /                    — Get tiered visual roadmap (Gemini AI)
                              Cache: stored in user.careerInfo.visualRoadmap (invalidated by refresh param)
                              Query: refresh=true to force Gemini regeneration
                              Returns: { tiers: [{ tier, label, skills[] }], targetJob }
                              Falls back to priority-based tiering if GEMINI_API_KEY missing
```

### Quiz Routes (`/api/quiz`)
```
GET    /:skill              — Generate 25-question quiz for a skill (Groq Llama 3.1 8B)
                              Query: attempt (default 1 — different questions per retry)
```

### Resume Routes (`/api/resume`)
```
POST   /upload              — Upload + parse PDF resume (5MB limit, PDF only)
POST   /analyze             — Skill gap analysis of parsed resume
GET    /data                — Get aggregated user data for resume builder
POST   /generate            — AI resume generation (Groq llama-3.3-70b-versatile)
                              Detects student vs. professional, tailors prompt accordingly
POST   /regenerate-section  — Regenerate a specific section: summary | skills | experience | certificates
POST   /enhance-text        — AI-enhance arbitrary text (3 variations returned)
POST   /enhance-description — Real-time STAR-format polish (single result)
POST   /export/:format      — Export resume as PDF (Puppeteer) or DOCX (docx library)
GET    /versions            — List saved resume versions
POST   /save-version        — Save named resume version to DB
GET    /:userId             — Get raw parsed resume data
PUT    /:userId             — Update parsed resume data manually
DELETE /:userId             — Delete resume data
GET    /:userId/analysis    — Get stored skill analysis
```

### Certificate Routes (`/api/cert`)
```
GET    /                    — Get all user certificates
POST   /upload              — Upload PDF certificate (memory storage → file save → Groq analysis)
PATCH  /toggle-resume/:id   — Toggle useInResume flag
DELETE /:id                 — Delete certificate and its file
```

### Skill Detail Routes (`/api`)
```
POST   /skill-detail        — Get or generate skill info (description, why it matters, resources)
                              Body: { skill, targetJob }
                              Cached in MongoDB SkillDetail collection (30-day TTL)
```

### Project Routes (`/api/projects`)
```
POST   /analyze             — Analyze README text/file with Cerebras llama3.1-8b
                              Accepts: multipart file (field: "readme") OR JSON { readmeText }
POST   /save                — Save analyzed project + auto-promote roadmap-matched skills to Mastered
GET    /                    — Get all saved projects for current user
DELETE /:id                 — Delete a project
```

### Job Match Routes (`/api/jobs`)
```
GET    /matches             — Fetch + score job listings from Adzuna API
                              Query: refresh=true to bypass 3h cache
                              Returns: { source, generatedAt, results[] }
                              Results scored by skill overlap with user's known + mastered skills
```

---

## Core Services

### 1. Quiz Generator Service (`quizGenerator.js`)

**AI Model:** Groq `llama-3.1-8b-instant`  
**Purpose:** Generate 25-question MCQ quizzes per skill

**Key Function:** `generateQuiz(skill, attempt, previousTopics)`
- Generates exactly 25 unique multiple-choice questions
- Each retry attempt uses different questions (anti-repetition rules enforced in prompt)
- Mixes difficulty: easy, medium, hard
- Question styles: conceptual, code output, debugging, best-practice
- Returns `{ skill, attempt, questions: [{ id, difficulty, question, options, correctOption }] }`
- Temperature: 0.7 for variety
- Response format: `json_object`

**Fallback:** `server/data/fallbackQuiz.js` used if Groq fails

### 2. Roadmap Generator Service (`roadmapGenerator.js`)

**AI Model:** Groq `llama-3.3-70b-versatile`  
**Purpose:** Generate personalized learning roadmaps combining multiple data sources

**Key Function:** `generateRoadmap(profile)`
1. Fetch skills from GitHub via `@octokit/rest` (primary source)
2. Supplement with industry technology trends
3. Merge with predefined role mappings (`config/roleSkills.js`)
4. Compute missing skills (required - mastered)
5. Generate AI-enhanced learning path with resources + time estimates
6. Merge user's own mastered skills into roadmap for graph display
7. Return cached if `cacheTime > lastProfileUpdate`

**Output:**
```json
{
  "skillGap": { "mastered": 5, "toLearn": 12, "percentage": 29.4 },
  "missingSkills": ["React", "Node.js"],
  "learningPath": [{
    "skill": "React",
    "priority": "High",
    "estimatedTime": "4 weeks",
    "resources": [{ "type": "course", "name": "...", "url": "..." }],
    "status": "To Learn"
  }]
}
```

### 3. Resume Parser Service (`resumeParserService.js`)

**Purpose:** Extract structured data from uploaded PDF resumes

**Methods:**
- `extractTextFromPdf(filePath)` — dual-approach: pdf-parse first, pdfjs-dist fallback
- `parseResumeText(rawText)` — detect sections and extract structured data
- Section parsers: `parseSkills()`, `parseExperience()`, `parseEducation()`, `parseProjects()`

### 4. Resume Generator Service (`resumeGeneratorService.js`)

**Purpose:** Aggregate all user data for the resume builder and detect profile type

**Key Functions:**
- `getAggregatedResumeData(user)` — maps User schema fields to resume-ready format:
  - Merges `user.projects[]` (Dashboard/Cerebras) + `user.resumeData.projects[]`
  - Deduplicates projects by title (dashboard version takes priority)
  - Separates `certifiedSkills` (source: certificate) from `practiceSkills`
  - Filters certificates by `useInResume: true`
  - Returns contact block, education, experience, skills, projects, certificates, targetJobRole
- `detectUserProfile(data)` — returns `{ isStudent, hasExperience, hasSkills }`
  - Student = no experience entries

**AI Prompt Strategy (in `routes/resume.js`):**
- **Student prompt:** summary focused on academic background, no work experience fabrication, `academicHighlights` instead of experience
- **Professional prompt:** STAR-method bullet points for experience, achievement-focused summary
- Model: `llama-3.3-70b-versatile` with `response_format: { type: 'json_object' }`
- System message explicitly prohibits hallucination

### 5. Cerebras Service (`cerebrasService.js`)

**AI Model:** Cerebras `llama3.1-8b`  
**Purpose:** Analyze project README files

**Key Function:** `analyzeReadme(readmeText)`
- Extracts: `projectName`, `summary`, `techStack`, `keyFeatures`, `skillsExtracted`
- Normalization rules: React not ReactJS, Node.js not NodeJS, etc.
- Input truncated at 8000 characters
- Validates all required keys in response

### 6. Project Skill Integration Service (`projectSkillIntegrationService.js`)

**Purpose:** Auto-promote skills from saved projects to Mastered status

**Key Function:** `processProjectSkills(user, extractedSkills)`
- Compares extracted skills against user's active roadmap (`profile.roadmapCache.data`)
- Only promotes skills that match roadmap requirements (not arbitrary skills)
- Deduplicates — won't re-add already mastered skills
- Sets `score: 100`, `masteredAt: now`
- Also removes promoted skills from `learningSkills`

### 7. Certificate Service (`certificateService.js`)

**AI Model:** Groq `llama-3.3-70b-versatile`  
**Purpose:** Parse and analyze uploaded certificate PDFs

**Key Function:** `analyzeCertificate(certificateText, targetRole, roadmapSkills, currentSkillState)`
- Extracts: `title`, `polishedTitle`, `issuer`, `issueYear`, `issueDate`
- Generates polished title for resume display
- Classifies skills as `certified` (matches roadmap) or `notMappedToRoadmap`
- Determines if certified skills can be upgraded to Mastered
- Returns structured JSON consumed by `certificateController.js`

**polishedTitle format:**
- Known issuer: `[Issuer] [Topic] Certificate`
- Unknown issuer: `[Topic] Certificate of Completion`

### 8. Job Matching Service (`jobMatchingService.js`)

**Purpose:** Fetch and score job listings from Adzuna against user skills

**Key Function:** `getMatchedJobs({ targetJob, resultsPerPage, userSkills })`
- Calls Adzuna REST API (`https://api.adzuna.com/v1/api/jobs/in/search/1`) — currently scoped to India (`in`)
- Extracts skills from job description using a 80+ term `TECH_SKILLS` dictionary with word-boundary regex
- Scores each job: `(matchedSkills.length / requiredSkills.length) * 100`
- Match labels: Strong Match (≥75%), Good Match (≥50%), Partial Match (≥25%), Low Match
- Sorts results by `matchScore` descending
- Returns per-job: `title`, `company`, `location`, `salary_min/max`, `redirect_url`, `description`, `matchScore`, `matchedSkills`, `missingSkills`, `matchLabel`
- Server caches results in `user.profile.jobMatchCache` for 3 hours

### 9. AI Enhancement Service (`aiEnhancementService.js`)

**AI Model:** Groq `llama-3.1-8b-instant`  
**Purpose:** Utility AI helpers for resume content

- `generateProfessionalSummary(userData)` — 3-4 line professional summary from profile
- `enhanceAchievement(rawText, targetRole)` — converts responsibility → STAR bullet (3 variations in JSON array)
- `generateProjectDescription(repoName, desc, languages)` — one-line project description
- Singleton `groqInstance` (cached to prevent multiple initializations)

### 10. Export Service (`exportService.js`)

**Purpose:** Render resume to PDF or DOCX

- **PDF:** `generatePdfFromHtml(htmlContent)` — Puppeteer headless Chrome, A4 format, screen media type
- **DOCX:** `generateDocxFromData(data)` — uses `docx` library
- `generateProfessionalHtml(data)` — produces inline-styled HTML matching the React preview (no Tailwind — Puppeteer compatible)

### 11. GitHub Project Service (`githubProjectService.js`)

**Purpose:** Fetch skill-related data from GitHub repositories for roadmap generation

- Used internally by `roadmapGenerator.js` to source real-world skill requirements
- Not directly exposed to users as a browseable page

### 13. Resume Analyzer Service (`resumeAnalyzerService.js`)

**Purpose:** Perform detailed skill gap analysis using GitHub as the industry demand signal

**Class:** `ResumeAnalyzerService` (exported as singleton)

**Key Methods:**
- `initGithubClient(githubToken)` — stores GitHub token for authenticated requests
- `getIndustrySkills(jobRole, limit=50)` — queries GitHub search API: runs 3 search queries (`[role] project`, `[role] template`, `[role]`), extracts topics/languages/descriptions from top repos, deduplicates, returns top 50 most frequent skills. In-memory cache per jobRole.
- `analyzeSkillGap(userSkills, jobRole)` — returns: `{ matchingSkills, missingSkills, suggestedSkills, industryDemandSkills, matchPercentage }`
- `getLearningRecommendations(analysis)` — categorizes skills into `{ critical (top 5), important (5–10), nice_to_have }` from suggested skills
- `getRelatedSkills(skills)` — hardcoded skill relation map (e.g., React → Redux, Next.js, TypeScript, Jest)
- `generateRoadmap(analysis, currentLevel)` — divides suggested skills into 4 phases: Foundation (0-2m), Intermediate (2-4m), Advanced (4-6m), Specialization (6+m)
- Fallback: `getDefaultSkillsForRole(jobRole)` with hardcoded arrays for 6 roles: frontend, backend, full stack, devops, data scientist, mobile developer

**GitHub topic normalization map (sample):** js→JavaScript, ts→TypeScript, react→React, springboot→Spring Boot, k8s→Kubernetes, postgres→PostgreSQL (30+ mappings)

### 14. Visual Roadmap Service (`visualRoadmapService.js`)

**AI Model:** Google Gemini `gemini-1.5-flash`  
**Purpose:** Organize the learning path into a tiered, visually-ordered roadmap

**Key Function:** `generateVisualRoadmap(profile, existingCache = null)`
1. **Cache-First Strategy:** If an `existingCache` is provided, the service skips AI generation and only re-computes mastery statuses for existing skills.
2. If no cache exists, it calls `generateRoadmap(profile)` from `roadmapGenerator.js` to get raw `learningPath`.
3. Initializes Gemini with `GEMINI_API_KEY`.
4. Sends skill data + target job to Gemini with system prompt.
5. Parses JSON response and saves to `user.careerInfo.visualRoadmap` in MongoDB.

**`generateFallbackRoadmap(learningPath)`:**
- Tier 0: Mastered
- Tier 1: High priority (Start Here)
- Tier 2: Medium priority (Next Steps)
- Tier 3: Low priority (Advanced/Optional)
- All skills assigned category: "General"

**Gemini AI Instructions:**
- Groups skills into ordered tiers (Tier 0 = Mastered, Tier 1 = learn first, etc.)
- Assigns each skill a `category`: Language | Framework | Tool | Database | DevOps
- Returns 3 real course resources per non-mastered skill (Udemy, Coursera, YouTube, official docs)
- Response format: strict JSON, no markdown

### 12. Skill Matching Service (`skillMatchingService.js`)

**Purpose:** Fuzzy skill matching for resume analysis and certificate skill mapping

**`matchSkillStrictly(extractedSkill, targetSkills)`:**
1. Normalized exact match (lowercase, trim special chars)
2. Substring matching
3. Alias matching (JS = JavaScript, Node = Node.js, etc.)

---

## Role Skills Configuration (`config/roleSkills.js`)

Predefined skill sets for common roles with three tiers per role:

| Role | Core Skills | Supporting Skills | Optional Skills |
|---|---|---|---|
| `frontend` | html, css, javascript, typescript, react | redux, tailwind, vite, git, rest | next.js, react-native, jest, cypress, accessibility |
| `backend` | javascript, node.js, express, mongodb, sql | sequelize, mongoose, docker, jwt, redis | graphql, kubernetes, microservices, aws |
| `data_scientist` | python, pandas, numpy, scikit-learn, sql | tensorflow, pytorch, jupyter, matplotlib | spark, hadoop, aws |
| `cloud_engineer` | aws, linux, docker, kubernetes, networking | terraform, ci-cd, git, monitoring | azure, gcp, ansible |

Used by `roadmapGenerator.js` as a fallback/supplement when GitHub data is unavailable.

---

## Key Features Detailed

### 1. Skill Gap Analysis

**Workflow:**
1. User sets `currentSkills` and `targetJob` in profile
2. Roadmap generator fetches job requirements (GitHub + roleSkills config)
3. Compares mastered skills against requirements to find gaps
4. Dashboard visualizes with Radar chart + three skill columns
5. Skills can be toggled between: To Learn → Learning → Mastered

**Visualization:**
- Radar chart: mastered=100, learning=60, to-learn=20
- Three kanban-style columns with filtering by search, priority, status
- Skill cards show priority badge, time estimate, focus toggle

### 2. AI-Generated Quizzes

**Flow:**
```
User clicks "Take Quiz" on a skill (from Dashboard)
    ↓
GET /api/quiz/:skill
    ↓
Groq llama-3.1-8b-instant generates 25 MCQs (JSON)
    ↓
Quiz interface renders questions one at a time with Prev/Next navigation
    ↓
User selects one option per question (selectedAnswers: { questionIndex: option })
    ↓
User submits all answers
    ↓
score = count(selectedAnswers[idx] === question.correctAnswer)
    ↓
passed = score >= 23  // exactly 23+ out of 25 (92%)
    ↓
≥ 23: Mark skill Mastered + confetti (colors: #2563eb, #3b82f6, #60a5fa)
< 23: Offer retry (window.location.reload()) or Back to Dashboard
```

**Result screen messages:**
- Pass: 🏆 "Certification Earned!" — green, skill added to "skill fingerprint"
- Fail: 📚 "Keep Learning!" — red, review resources and retry

**On Pass:**
- `POST /api/profile/toggle-skill` with `{ skill, score, forceMaster: true }`
- Skill moves from learningSkills → completedSkills with score + date

**Question object structure:**
```json
{ "id": 0, "difficulty": "medium", "question": "...", "options": ["A","B","C","D"], "correctAnswer": "A" }
```

> Note: The field is `correctAnswer` (not `correctOption`).

### 3. Resume Building & Enhancement

**Generation Flow:**
```
GET /api/resume/data
    → Aggregates: name, contact, education, experience, skills,
      projects (Dashboard + parsed resume, deduplicated),
      certificates (useInResume=true only)
    ↓
detectUserProfile() → isStudent (no experience) or Professional
    ↓
POST /api/resume/generate
    ↓
Groq llama-3.3-70b-versatile with tailored prompt:
  - Student: academic summary, no work exp, academicHighlights
  - Professional: STAR bullets, achievement-focused
    ↓
Frontend renders in selected template (Professional/Sidebar/Balanced)
    ↓
User can: edit sections, regenerate individual sections, pick theme,
  add achievements/interests/languages, export PDF/DOCX
```

**Resume Quality Checklist (client-side):**
- Summary > 100 characters
- Mastered skills ≥ 3
- Projects ≥ 2
- Experience present
- Education present

### 4. Project Dashboard (Cerebras AI)

**Flow:**
```
User uploads README (.md / .txt, max 2MB) or pastes text
    ↓
POST /api/projects/analyze
    ↓
Cerebras llama3.1-8b extracts:
  projectName, summary, techStack, keyFeatures, skillsExtracted
    ↓
Frontend shows preview card
    ↓
User clicks "Save Project"
    ↓
POST /api/projects/save
    ↓
processProjectSkills(): compare extractedSkills with roadmapCache
    ↓
Roadmap-matched skills → added to completedSkills (score: 100)
    ↓
Project saved to user.projects[]
```

### 5. Job Matches (Adzuna API)

**Flow:**
```
GET /api/jobs/matches
    ↓
Check 3h cache in user.profile.jobMatchCache
    ↓
If stale/missing: call Adzuna API with targetJob
    ↓
Score each listing: extract skills from description, compare with userSkills
    ↓
Return sorted by matchScore descending
    ↓
Frontend: filter visible jobs (must have ≥1 detected skill)
           client-side search by title/company
           Show matched (green) and missing (gray) skill badges
           "View Job" button links to live listing
```

### 6. Certificate Management & Auto-Mastery

**Flow:**
```
User uploads PDF certificate
    ↓
File saved to uploads/certificates/
    ↓
pdf-parse extracts text
    ↓
Groq (certificateService) analyzes text:
  - extracts title, polishedTitle, issuer, issueYear
  - classifies skills as certified or notMappedToRoadmap
    ↓
Matched skills can be auto-promoted to Mastered
    ↓
Certificate saved to user.certifications[]
    ↓
Certificate auto-included in resume (useInResume: true)
    ↓
User can toggle resume inclusion or delete
```

### 7. Learning Roadmap

**Generation:**
- GitHub API: search job-relevant repos for skill signals
- Industry technology trends and role mappings
- `config/roleSkills.js`: predefined skill sets per role
- Groq AI: generate descriptions, resources (courses, docs, books), priority, time estimates
- Cache invalidated when `profile.lastProfileUpdate` > `roadmapCache.generatedAt`

**Per-Skill Data:**
```json
{
  "skill": "React",
  "priority": "High",
  "estimatedTime": "4 weeks",
  "resources": [{ "type": "course", "name": "...", "url": "..." }],
  "status": "To Learn"
}
```

### 8. Skill Detail Tooltips

- **Triggered by clicking** a skill name on Dashboard or Roadmap page (not hover)
- Opens `SkillTooltip` as a **full-screen modal** (fixed overlay with backdrop blur)
- Calls `POST /api/skill-detail` with `{ skill, targetJob }` using JWT auth
- Groq generates: description, whyItMatters, curated resources
- Resources shown with **9 type icons**: Docs📄, Course🎓, Video🎬, Tutorial📝, Practice💻, Tool🛠️, Search🔍, Book📕, Playground🎮
- Each resource has a color-coded type badge (blue=Docs, purple=Course, red=Video, etc.)
- Cached in MongoDB `SkillDetail` collection (30-day TTL auto-expire)
- On cache hit: returns instantly without AI call
- Closes on: ESC key, backdrop click, or X button

---

---

## Visual Roadmap System

### Overview
The Visual Roadmap is a dedicated tiered view of the user's learning path, powered by Google Gemini AI. It provides a more structured, dependency-aware representation compared to the classic Roadmap page.

### Route
- **Frontend:** `/dashboard/visual-roadmap` (`VisualRoadmap.jsx`)
- **API:** `GET /api/visual-roadmap` (`routes/visualRoadmap.js`)
- **Service:** `services/visualRoadmapService.js`

### Data Flow
```
GET /api/visual-roadmap
    ↓
authMiddleware (shared protect) → req.user
    ↓
Check user.careerInfo.visualRoadmap cache
    ↓ (if refresh=true or no cache)
Fetch full roadmap via generateRoadmap(profile)  [roadmapGenerator.js]
    ↓
Send learningPath + targetJob to Gemini 1.5-flash
    ↓
Gemini organizes skills into tiers + assigns categories + provides resources
    ↓ (if GEMINI_API_KEY missing or Gemini fails)
Fallback: generateFallbackRoadmap() — priority-based tiering
    ↓
Save result to user.careerInfo.visualRoadmap in MongoDB
    ↓
Return { tiers, targetJob }
```

### Frontend Behaviour
- Progress bar calculated from total skills vs. Mastered skills across all tiers
- Skills rendered as **alternating left/right cards** on a vertical center line
- Clicking a skill card toggles a **resource detail panel** (slides in with course links)
- Tier labels color-coded: Mastered=green, Start Here=indigo, Next Steps=purple, Advanced=orange
- Refreshing forces full Gemini regeneration and cache update

---

## Resume AI Prompts & Generation Logic

### Profile Type Detection (`detectUserProfile`)
```javascript
{ isStudent: !data.experience || data.experience.length === 0,
  hasExperience: data.experience.length > 0,
  hasSkills: data.knownSkills.length > 0 }
```

### Student/Fresher Prompt Strategy
When `isStudent === true`:
- Summary: 3-4 sentences, academic background, passion for target role, growth mindset — **no "years of experience"**
- Experience section: **replaced with `academicHighlights`** (projects, coursework, competitions)
- Skills: categorized; `Mastered Skills` group always listed first
- **Anti-hallucination rule**: empty fields return `[]`, never fabricated content

**Expected student JSON structure:**
```json
{
  "summary": "...",
  "education": [...],
  "academicHighlights": [{ "title": "...", "description": "..." }],
  "skills": [{ "category": "Mastered Skills", "items": [...] }, ...],
  "masteredSkills": [{ "name": "..." }],
  "projects": [...],
  "certificates": [{ "name": "polishedTitle", "issuer": "...", "year": "..." }],
  "contact": { "email", "phone", "linkedin", "github" }
}
```

### Professional Prompt Strategy
When `isStudent === false`:
- Summary: achievement-focused, years of experience, value proposition for target role
- Experience: each entry gets **3 STAR-method bullet points** as `description` string (newline separated)
- Skills: same categorization, `Mastered Skills` first
- STAR bullets: Situation/Action/Result, action verbs, quantifiable achievements

**Expected professional JSON structure:**
```json
{
  "summary": "...",
  "education": [...],
  "experience": [{ "company", "role", "duration", "description": "bullet1\nbullet2\nbullet3" }],
  "skills": [...],
  "masteredSkills": [...],
  "projects": [...],
  "certificates": [...],
  "contact": { "email", "phone", "linkedin", "github" }
}
```

### Safety Guidelines Enforced in Prompts
1. Never fabricate companies, job titles, dates, or skills not in user data
2. Empty fields → empty arrays (never placeholder content)
3. `contact` block returned EXACTLY as provided — no modifications
4. `certificates` must use `polishedTitle` (not raw certificate title)
5. `masteredSkills` always returned as `[{ "name": "..." }]` objects

---

## Skill Normalization System

### `server/utils/skillNormalizer.js`

Maintains a `skillNormalizationMap` with **80+ entries** mapping common variations to canonical names:

| Raw Input | Normalized |
|---|---|
| js, es6, es2015 | JavaScript |
| ts | TypeScript |
| py, python3 | Python |
| reactjs | React |
| vuejs | Vue |
| expressjs | Express |
| springboot, spring boot | Spring Boot |
| postgres | PostgreSQL |
| mongo | MongoDB |
| k8s | Kubernetes |
| amazon web services | AWS |
| google cloud | GCP |
| dotnet, .net | .NET |
| reactnative | React Native |
| ...(80+ total) | ... |

**Key functions exported:**
- `normalizeSkill(skill)` — returns canonical name or original if not found
- `normalizeSkills(skills[])` — maps array through normalization
- `extractSkillsFromText(text, knownSkills)` — word-boundary regex match against known skills list
- `getAllKnownSkills()` — returns complete list of canonical skill names

---

## Text Processing Utilities

### `server/utils/textCleaner.js`

Utilities for processing extracted resume text:

- `normalizeWhitespace(text)` — converts `\r\n` → `\n`, collapses tabs/spaces
- `cleanText(text)` — removes bullet chars (`•`, `-`, `*`, `→`, `▪`) and control characters
- `getCleanLines(text)` — splits, cleans, filters empty lines
- `detectSections(text)` — regex-based section header detection for 10 section types:
  - SKILLS, EXPERIENCE, EDUCATION, PROJECTS, CERTIFICATIONS, SUMMARY, DECLARATION, REFERENCES, LANGUAGES, INTERESTS
- `extractSection(lines, startIndex, endIndex)` — slices raw lines between section boundaries
- `parseDuration(text)` — handles date ranges ("Jan 2020 - Dec 2021") and year counts ("2 years")
- `extractEmail(text)` — regex email extraction from resume text

---

## UI Component Details

### `Avatar.jsx`
- Renders up to 2 initials from `fullName` (split on spaces, first letter each)
- `size` prop variants: `xs` (w-8), `sm` (w-10), `md` (w-16), `lg` (w-24), `xl` (w-32), `2xl` (w-40)
- Gradient: `from-blue-500 via-indigo-600 to-purple-600`
- Glossy overlay via `bg-gradient-to-tr from-white/10 to-transparent`
- Hover: `hover:scale-105 hover:rotate-3 hover:shadow-2xl`
- Used in: `DashboardLayout` top bar, `Profile.jsx`

### `Skeleton.jsx` — Three Loading Placeholder Variants
- `Skeleton({ className })` — generic animated pulse block (base component)
- `SkillCardSkeleton` — mimics skill card: icon placeholder, name/subtitle lines, description lines
- `StatsCardSkeleton` — mimics stats card: label + large number placeholder
- All use `animate-pulse bg-slate-200 rounded-xl`

---

## Routing & Layout Architecture

### Complete Route Map (`App.jsx`)

```
/ (public)                     → Home (inline component)
/login                         → Login.jsx
/signup                        → Signup.jsx
/profile                       → ProfileForm.jsx (NOT inside DashboardLayout)
/roadmap                       → Roadmap.jsx (NOT inside DashboardLayout)
/quiz/:skill                   → Quiz.jsx (NOT inside DashboardLayout)

/dashboard/*                   → DashboardLayout (protected, has Sidebar + TopNav)
├── /dashboard                 → Dashboard.jsx (index)
├── /dashboard/profile         → Profile.jsx
├── /dashboard/certificates    → Certificates.jsx
├── /dashboard/resume-builder  → ResumeBuilder.jsx
├── /dashboard/projects        → Projects.jsx
├── /dashboard/job-matches     → JobMatches.jsx
├── /dashboard/jobs            → JobMatches.jsx (alias)
└── /dashboard/visual-roadmap  → VisualRoadmap.jsx
```

### Authentication Guard
- `DashboardLayout` — fetches profile on mount; if no token → redirect to `/login`
- Individual pages (`Quiz`, `Roadmap`, `ProfileForm`) also check for `localStorage.getItem('token')` on mount
- No centralized `PrivateRoute` component — each page/layout handles its own auth check

### localStorage Keys Used
| Key | Set By | Used By |
|---|---|---|
| `token` | Login/Signup | All pages (auth header) |
| `userId` | Signup | Signup, ResumeBuilder |
| `username` | Signup | Signup |
| `userProfile` | Dashboard, Roadmap | Dashboard, Roadmap (optimistic UI) |
| `userRoadmap` | Dashboard, Roadmap | Dashboard, Roadmap (optimistic UI) |
| `resumeData_<userId>` | ResumeBuilder | ResumeBuilder (user-scoped persistence) |

---

## Data Flow & Workflows

### User Registration & Login Flow

```
SIGNUP:
1. User submits signup form
   → username uniqueness check, password bcrypt hash
   → Create User document in MongoDB
2. Server generates JWT (7-day expiry)
3. Client stores token in localStorage
4. Redirect to /dashboard

LOGIN:
1. Submit username + password
2. Find user by username
3. bcryptjs.compare() — verify password
4. Return JWT + userId
5. Client stores in localStorage → redirect to /dashboard
```

### Skill Progression Workflow

```
1. User creates profile via /profile (ProfileForm page)
   currentSkills: ["JavaScript", "React"]
   targetJob: "Full Stack Developer"

2. Dashboard loads:
   → Parallel fetch: GET /api/profile + GET /api/roadmap
   → Roadmap cache checked (invalidated if profile changed)
   → Skill cards rendered in three columns

3. User toggles skill to Learning:
   → POST /api/profile/toggle-skill { skill }
   → to-learn → learning

4. User takes quiz:
   → /quiz/:skill (React route)
   → GET /api/quiz/:skill (Groq generates 25 Qs)
   → User answers, submits
   → Score ≥ 90%?

5a. PASS:
   → POST /api/profile/toggle-skill { skill, score, forceMaster: true }
   → Skill moves to completedSkills with score + date
   → Canvas confetti celebration
   → Dashboard refreshed

5b. FAIL:
   → Offer retry
   → New questions generated (attempt++, different topics)

6. README project saved with matching skill:
   → processProjectSkills() promotes skill to Mastered (score: 100)
```

### Resume Building Workflow

```
Option A: AI Generate from Profile
1. GET /api/resume/data — aggregate all user data
2. detectUserProfile() → student or professional
3. POST /api/resume/generate → Groq llama-3.3-70b-versatile
   Student path: academic summary, highlights, no fabricated work experience
   Professional path: STAR bullets, achievement-focused summary
4. Result rendered in selected template
5. User edits / regenerates individual sections
6. POST /api/resume/export/:format (PDF via Puppeteer / DOCX via docx)
7. POST /api/resume/save-version to persist named version

Option B: Upload & Parse Resume
1. POST /api/resume/upload — PDF, max 5MB
2. pdf-parse → pdfjs-dist fallback → structured data
3. Merged with profile data
4. Available for review in Resume Builder

Option C: Load from localStorage
1. resumeData_<userId> key checked on page load
2. If present: merge saved content with fresh API data
3. Always refresh contact info from API
```

### Quiz & Certification Workflow

```
QUIZ:
1. GET /api/quiz/:skill?attempt=<n>
2. Groq llama-3.1-8b-instant generates 25 Qs (JSON mode, temperature 0.7)
3. Anti-repetition: previousTopics passed to prompt on retries
4. Pass threshold: ≥ 90% (23+/25)

RESULT:
PASS → toggle-skill (forceMaster) → completedSkills updated → confetti
FAIL → retry offered (generateQuiz with incremented attempt)

CERTIFICATE UPLOAD:
1. POST /api/cert/upload — PDF file
2. File saved to uploads/certificates/
3. resumeParserService.extractTextFromPdf() → raw text
4. analyzeCertificate() → Groq extracts metadata + skills
5. Matched skills optionally promoted to Mastered
6. Saved to user.certifications[]
7. useInResume: true by default
8. Auto-included in resume generation (certificates array in /data)
```

---

### Visual Roadmap Workflow

```
User navigates to /dashboard/visual-roadmap
    ↓
VisualRoadmap.jsx mounts → fetchRoadmap()
    ↓
GET /api/visual-roadmap
    ↓
Check user.careerInfo.visualRoadmap (cache)
    ↓ Cache hit → return cached data immediately
    ↓ (System automatically re-computes mastery status in-process)
    ↓ Cache miss:
        1. generateRoadmap(profile)  [Groq + GitHub + Industry Trends]
        2. Gemini 1.5-flash organizes into tiers + categories + resources
        3. Save initial roadmap to user.careerInfo.visualRoadmap
    ↓
Frontend renders tiered timeline
    ↓
User can click any skill card → view course resources
(Roadmap auto-updates when skills are mastered)
```

---

## Setup & Installation

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** — local (`mongodb://localhost:27017/career-tracker`) or Atlas
- **Groq API Key** — required for AI features (quiz, resume, roadmap, certificates)
- **Cerebras API Key** — required for project README analysis
- **Adzuna API credentials** — required for job matching
- **GitHub Token** — optional, improves roadmap skill sourcing

### Step 1: Clone/Extract Project

```bash
cd careertrackerSTABLE
```

### Step 2: Install Frontend Dependencies

```bash
# In root directory
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 4: Configure Environment Variables

Create `server/.env`:

```env
# Server
PORT=5000

# Database (choose one)
MONGODB_URI=mongodb://localhost:27017/career-tracker
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/career-tracker

# Auth
JWT_SECRET=your_super_secret_jwt_key_here_long_and_random

# AI — Required
GROQ_API_KEY=gsk_...          # console.groq.com (quiz, resume, roadmap, certs, skill details)
CEREBRAS_API_KEY=csk-...      # cloud.cerebras.ai (project README analysis)

# Job Matching — Required for Job Matches page
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key

# GitHub — Optional (improves roadmap + resume analysis quality)
GITHUB_TOKEN=ghp_...

# Visual Roadmap — Optional (enables Gemini AI tiered roadmap; falls back gracefully if not set)
GEMINI_API_KEY=AIza...

# Optional
# GOOGLE_GENERATIVE_AI_KEY=...   # alias for GEMINI_API_KEY
```

### Step 5: Start MongoDB

```bash
# If using local MongoDB:
mongod
```

---

## Running the Application

### Development Mode

```bash
# Terminal 1 — Backend
cd server
npm run dev      # nodemon index.js — hot reload

# Terminal 2 — Frontend
npm run dev      # Vite dev server
```

Or use the provided script:
```bash
start_dev.bat
```

### Access

- **Frontend:** http://localhost:5173
- **API Server:** http://localhost:5000/api
- **Health Check:** `GET http://localhost:5000` → `{ "message": "Career Path Tracker API" }`

### Production Build

```bash
# Build frontend bundle
npm run build

# Start backend
cd server && npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret (keep long and random) |
| `GROQ_API_KEY` | Yes | Groq API key — used for quiz, resume, roadmap, certs, skill details |
| `CEREBRAS_API_KEY` | Yes | Cerebras API key — used for project README analysis only |
| `ADZUNA_APP_ID` | Yes | Adzuna app ID — job matching |
| `ADZUNA_APP_KEY` | Yes | Adzuna app key — job matching |
| `GITHUB_TOKEN` | No | GitHub personal access token — optional, improves roadmap |
| `PORT` | No | Server port (default: 5000) |
| `GEMINI_API_KEY` | No | Google Gemini key — used by Visual Roadmap tier organizer; falls back to priority-based if missing |
| `GOOGLE_GENERATIVE_AI_KEY` | No | Alias for Gemini key — either name works |

---

## Troubleshooting

### MongoDB Connection Issues
```
Error: MongooseError: Cannot connect to MongoDB
Solutions:
1. Ensure local MongoDB is running: mongod
2. Verify MONGODB_URI in server/.env
   - Local: mongodb://localhost:27017/career-tracker
   - Atlas: check credentials and IP whitelist
3. Restart backend server
```

### Groq API Errors
```
Error: GROQ_API_KEY is missing or invalid
Solutions:
1. Get key from console.groq.com
2. Add GROQ_API_KEY=gsk_... to server/.env
3. Restart backend
```

### Cerebras API Errors
```
Error: CEREBRAS_API_KEY is missing or Cerebras request fails
Solutions:
1. Get key from cloud.cerebras.ai
2. Add CEREBRAS_API_KEY=csk-... to server/.env
3. Project analysis will fail without this key
```

### Adzuna / Job Matches Not Loading
```
Error: Failed to fetch job matches / no jobs shown
Solutions:
1. Ensure ADZUNA_APP_ID and ADZUNA_APP_KEY are set in server/.env
2. Make sure your profile has a Target Job Role set (Profile page)
3. Check that you have skills listed in your profile
4. Job cache is 3 hours — click Refresh to force new fetch
5. Adzuna API is scoped to India ("in") — listings may be limited for other regions
```

### Visual Roadmap Not Loading
```
Error: Failed to generate visual roadmap
Solutions:
1. If GEMINI_API_KEY is missing: roadmap will still load via fallback (priority-based tiers)
2. If GEMINI_API_KEY is present but invalid: check cloud.google.com/generative-ai for valid key
3. Ensure GROQ_API_KEY is set (Visual Roadmap depends on roadmapGenerator.js which uses Groq)
4. Try the "Regenerate Path" button to force a fresh generation
5. Check server console for "Visual Roadmap Route Error FULL" logs
```

### CORS Issues
```
Error: CORS policy: No 'Access-Control-Allow-Origin'
Solutions:
1. Ensure both servers are running (frontend :5173, backend :5000)
2. Backend CORS allows http://localhost:5173 by default
```

### JWT / Auth Errors
```
Error: Token expired / Not authorized
Solutions:
1. Log out and log back in to get a fresh token
2. Tokens are valid for 7 days
3. localStorage token is cleared on logout
```

### Resume Upload Fails
```
Error: File size exceeds limit
Solutions:
1. Resume PDFs must be < 5MB
2. Certificate uploads: PDF only
3. README files for project analysis: .md or .txt, < 2MB
```

---

## Project Statistics

### Code Metrics
- **Frontend Pages:** 12 route-level components (added `VisualRoadmap.jsx`)
- **Frontend Components:** 20+ React components (including resume sub-components, `Avatar`, `Skeleton`)
- **Backend Route Modules:** 10 (`auth`, `profile`, `resume`, `roadmap`, `quiz`, `certificate`, `projects`, `jobs`, `skillDetail`, `visualRoadmap`)
- **Services:** 14 specialized service modules (added `visualRoadmapService`, `resumeAnalyzerService`)
- **Utilities:** 4 backend utility modules (`skillNormalizer`, `textCleaner`) + 2 frontend (`textPolisher`, `useDescriptionEnhancer`)
- **Database Models:** 2 Mongoose schemas (`User`, `SkillDetail`)
- **API Endpoints:** 32+ RESTful endpoints

### Key Dependencies
| Category | Package | Version |
|---|---|---|
| Frontend framework | react | 19.2.0 |
| Build tool | vite | 7.2.4 |
| Routing | react-router-dom | 7.6.2 |
| HTTP client | axios | 1.9.0 |
| Styling | tailwindcss | 3.4.17 |
| Charts | recharts | 2.15.3 |
| Icons | lucide-react | 0.511.0 |
| Backend | express | 5.2.1 |
| ODM | mongoose | 9.1.5 |
| AI (primary) | groq-sdk | 0.37.0 |
| AI (projects) | @cerebras/cerebras_cloud_sdk | 1.64.1 |
| PDF export | puppeteer | 24.37.3 |
| DOCX export | docx | 9.5.1 |
| Auth | jsonwebtoken + bcryptjs | — |

---

## Security Measures

1. **Password Security**
   - `bcryptjs` hashing with salt rounds — never stored in plain text

2. **JWT Authentication**
   - Signed with `JWT_SECRET`, 7-day expiration
   - `authMiddleware.js` validates every protected route

3. **CORS Protection**
   - `app.use(cors())` — all origins permitted in current development configuration
   - For production: configure `cors({ origin: 'https://your-domain.com' })` in `server/index.js`

4. **File Upload Security**
   - `multer` memory storage — files never written to disk in transit
   - MIME type + extension validation (PDF for resumes/certs, .md/.txt for README)
   - Size limits: 5MB resumes, 2MB README

5. **Input Validation**
   - Email format, username length, password strength checked at signup
   - All API inputs validated before DB writes

6. **Environment Variables**
   - All API keys stored in `server/.env` — not committed to version control
   - No secrets in frontend code

7. **Mongoose Schema Enforcement**
   - Strict schemas prevent unexpected field injection
   - Enum validation on status fields

---

## Performance Optimizations

1. **Job Match Caching**
   - Adzuna API results cached in MongoDB (`profile.jobMatchCache`) for 3 hours per user
   - Reduces external API calls; force-refresh available via `?refresh=true`

2. **Roadmap Caching (Linear)**
   - Generated roadmaps cached in `profile.roadmapCache`
   - Invalidated when `profile.lastProfileUpdate > roadmapCache.generatedAt`

2b. **Visual Roadmap Caching (Tiered)**
   - Tiered Gemini roadmap cached in `careerInfo.visualRoadmap` in MongoDB
   - Only invalidated on explicit `refresh=true` request (no time-based expiry)

3. **Skeleton Loaders**
   - Job Matches, Dashboard, and Resume pages show skeleton UI while data loads — no blank states

4. **User-Scoped localStorage**
   - Resume builder data keyed as `resumeData_<userId>` — prevents data bleed between users on shared devices

5. **Database Indexing**
   - Compound indexes on `SkillDetail` for fast skill-matching queries

6. **Vite Build Optimization**
   - Tree-shaking, code splitting, CSS purging via Tailwind
   - Fast HMR in development

7. **Groq JSON Mode**
   - Resume generator uses `response_format: { type: 'json_object' }` to eliminate parsing overhead and hallucinated wrapper text

8. **Static File Serving**
   - Certificate files served from `/certificates` path → mapped to `uploads/certificates/` directory
   - `app.use('/certificates', express.static(path.join(__dirname, '../uploads/certificates')))`

---

## Future Enhancement Ideas

1. **Advanced Analytics Dashboard**
   - Learning velocity charts
   - Skill gap trends over time

2. **Mobile App**
   - React Native version with offline quiz support

3. **Social / Community Features**
   - Share progress, leaderboards, peer skill endorsements

4. **LinkedIn Integration**
   - Import profile data, export resume directly

5. **Adaptive Quiz Difficulty**
   - ML-based question difficulty that adjusts per user performance

6. **Payment & Premium Tier**
   - Premium templates, AI coaching, priority job listings

---

## Conclusion

Career Tracker is a full-stack MERN application with **three-tier AI integration** (Groq for resume/roadmap/quiz/certs/skill-details, Cerebras for project README analysis, Google Gemini for tiered visual roadmap organization), live job matching via Adzuna, and a complete resume builder with three templates and export options.

The application provides two roadmap views:
- **Classic Roadmap** (`/roadmap`) — linear skill gap analysis with Stats panel and skill cards
- **Visual Roadmap** (`/dashboard/visual-roadmap`) — AI-tiered alternating timeline with skill category tags and course resources

Key architectural highlights:
- Clean service/route/controller separation across 10 route modules and 14 services
- JWT auth throughout with two auth middleware patterns (lightweight userId-only vs. full user fetch)
- MongoDB for all user + skill cache persistence with TTL auto-expiry on SkillDetail
- Optimistic UI on Dashboard and Roadmap (localStorage cache → API refresh pattern)
- User-scoped localStorage for resume data (`resumeData_<userId>`)
- Anti-hallucination safety rules enforced in all AI prompts
- Role-based profile detection (Student vs. Professional) for tailored resume generation

All major features are implemented. The modular architecture makes it straightforward to extend individual services (swap AI providers, add job boards, add new roles to `roleSkills.js`, etc.) without touching unrelated modules.

---

**Last Updated:** March 26, 2026
**Version:** 1.2.0
**Status:** Production Ready
