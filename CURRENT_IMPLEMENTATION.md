# Career Tracker - Complete Implementation Documentation

**Document Version:** 1.0  
**Last Updated:** February 24, 2026  
**Project Name:** Skill Career Tracker (CareerPath)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend Implementation](#backend-implementation)
6. [Database Models](#database-models)
7. [API Endpoints](#api-endpoints)
8. [Services](#services)
9. [Authentication & Middleware](#authentication--middleware)
10. [File Structure](#file-structure)
11. [Key Features](#key-features)
12. [Deployment](#deployment)

---

## Project Overview

**CareerPath** is a comprehensive career development platform that helps users track their skills, plan their career roadmaps, build resumes, and master technical concepts through interactive quizzes and project-based learning.

### Core Objectives
- Provide personalized skill development roadmaps based on career goals
- Enable resume building with AI-powered analysis and enhancement
- Generate skill assessments through adaptive quizzes
- Track skill mastery and progress
- Connect with GitHub for project-based learning
- Certificate generation and tracking

---

## Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
│  React 19.2 + React Router 7.13 + Vite 7.2.4 + Tailwind CSS    │
│                    (Running on http://localhost:5173)            │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST
                           │ (Axios/Fetch)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   API SERVER (Backend)                           │
│  Express.js 5.2 + Node.js                                       │
│           (Running on http://localhost:5000)                     │
│                                                                  │
│  ├─ Auth Routes (JWT Authentication)                            │
│  ├─ Profile Routes (User Data Management)                       │
│  ├─ Resume Routes (Upload, Parse, Analyze)                      │
│  ├─ Roadmap Routes (Skill Path Generation)                      │
│  ├─ Quiz Routes (Assessment Generation)                         │
│  ├─ Certificate Routes (Certificate Management)                 │
│  ├─ Projects Routes (GitHub Integration)                        │
│  └─ Skill Detail Routes (Skill Information)                     │
│                                                                  │
│  ├─ Controllers (Business Logic)                                │
│  ├─ Services (AI, Parsing, Analysis)                            │
│  └─ Middleware (Authentication, Error Handling)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ (Mongoose ODM)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     DATABASE                                     │
│  MongoDB (Cloud or Local Instance)                              │
│  Database: skill_career_tracker                                 │
│                                                                  │
│  Collections:                                                   │
│  - users (User profiles & data)                                 │
│  - skilldetails (Skill information)                             │
│  - quizzes (Quiz data cache)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Communication Flow

1. **Frontend → Backend**: HTTP REST API requests with JWT tokens in Authorization headers
2. **Backend → Database**: Mongoose queries for data persistence
3. **Backend → External APIs**: 
   - Groq API (AI-powered responses)
   - GitHub API (Project data)
   - Cerebras API (Alternative AI)
   - Google Generative AI (Alternative AI)

---

## Technology Stack

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React | 19.2.0 |
| **Router** | React Router DOM | 7.13.0 |
| **Build Tool** | Vite | 7.2.4 |
| **Styling** | Tailwind CSS | 3.4.1 |
| **CSS Processing** | PostCSS + Autoprefixer | 8.4.35 + 10.4.17 |
| **HTTP Client** | Axios | 1.13.5 |
| **Icons** | Lucide React | 0.563.0 |
| **Charts** | Recharts | 3.7.0 |
| **Drag & Drop** | @hello-pangea/dnd | 18.0.1 |
| **Animations** | Canvas Confetti | 1.9.4 |
| **Linting** | ESLint | 9.39.1 |
| **Dev Server** | Vite | 7.2.4 |

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Express.js | 5.2.1 |
| **Runtime** | Node.js | Latest (LTS recommended) |
| **Database** | MongoDB | Cloud/Local |
| **ODM** | Mongoose | 9.1.5 |
| **Authentication** | JWT + bcryptjs | 9.0.3 + 3.0.3 |
| **CORS** | cors | 2.8.6 |
| **File Upload** | multer | 1.4.4-lts.1 |
| **PDF Processing** | pdf-parse | 1.1.1 |
| **PDF.js** | pdfjs-dist | 5.4.624 |
| **Document Export** | docx | 9.5.1 |
| **Image Processing** | sharp | 0.32.6 |
| **Web Scraping** | puppeteer | 24.37.3 |
| **AI APIs** | groq-sdk, @cerebras/sdk, @google/generative-ai | 0.37.0 + 1.64.1 + 0.24.1 |
| **GitHub API** | @octokit/rest | 22.0.1 |
| **Environment** | dotenv | 17.3.1 |
| **Dev Tools** | nodemon | 3.1.14 |

---

## Frontend Implementation

### Directory Structure

```
src/
├── App.jsx                    # Main app routing & home page
├── main.jsx                   # React entry point
├── index.css                  # Global styles
├── assets/                    # Static assets
├── components/
│   ├── Avatar.jsx            # User avatar component
│   ├── ResumePreview.jsx     # Resume preview display
│   ├── ResumeUploadForm.jsx  # Resume upload handler
│   ├── Sidebar.jsx           # Navigation sidebar
│   ├── Skeleton.jsx          # Loading skeleton
│   ├── SkillGapAnalysis.jsx  # Skill gap visualization
│   ├── SkillRoadmap.jsx      # Roadmap visualization
│   ├── SkillTooltip.jsx      # Interactive tooltips
│   ├── profile/              # Profile-related components
│   └── resume/               # Resume-related components
├── layouts/
│   └── DashboardLayout.jsx   # Protected dashboard wrapper
└── pages/
    ├── Certificates.jsx       # Certificate management
    ├── Dashboard.jsx          # Main dashboard
    ├── Home.jsx              # Landing page (in App.jsx)
    ├── Login.jsx             # Authentication
    ├── Signup.jsx            # Registration
    ├── Profile.jsx           # User profile view
    ├── ProfileForm.jsx       # Profile edit form
    ├── Projects.jsx          # GitHub projects
    ├── Quiz.jsx              # Skill assessments
    ├── ResumeBuilder.jsx     # Resume builder interface
    └── Roadmap.jsx           # Skill roadmap display
```

### Key Frontend Features

#### 1. **Authentication Flow**
```jsx
// User Flow:
Home (Public) 
  ↓
  ├─ Signup/Login
  │   ├─ Create account with basic info
  │   └─ Store JWT token in localStorage
  ↓
Dashboard (Protected)
  ├─ Profile Setup
  ├─ Resume Management
  ├─ Skill Roadmap
  ├─ Quiz System
  ├─ Certificates
  └─ Projects
```

#### 2. **Component Hierarchy**
```
App
├── Home (public route)
├── Login (public route)
├── Signup (public route)
├── DashboardLayout (protected)
│   ├── Sidebar
│   ├── Avatar
│   ├── Dashboard
│   ├── Profile
│   ├── ResumeBuilder
│   │   ├── ResumeUploadForm
│   │   └── ResumePreview
│   ├── Certificates
│   ├── Quiz
│   └── Projects
├── ProfileForm
├── Roadmap
│   └── SkillRoadmap
└── Quiz/:skill
    └── Quiz
```

#### 3. **State Management**
- **Local Storage**: JWT tokens, user profiles
- **React State**: Component-level UI state
- **Context** (if implemented): Global user context
- **API Calls**: Direct fetch/axios calls to backend

#### 4. **Styling Approach**
- **Tailwind CSS**: Utility-first CSS framework
- **Component-level**: Inline Tailwind classes
- **Custom**: Minimal custom CSS in index.css
- **Responsive**: Mobile-first with breakpoints (sm:, md:, lg:, xl:)

---

## Backend Implementation

### Directory Structure

```
server/
├── index.js                      # Express app setup & routes
├── config/
│   └── roleSkills.js            # Role-to-skills mapping
├── controllers/
│   ├── certificateController.js # Certificate logic
│   ├── resumeController.js      # Resume upload/parse logic
│   └── (more controllers)
├── middleware/
│   └── authMiddleware.js        # JWT verification
├── models/
│   ├── User.js                  # User schema
│   └── SkillDetail.js           # Skill information schema
├── routes/
│   ├── auth.js                  # /api/auth endpoints
│   ├── profile.js               # /api/profile endpoints
│   ├── resume.js                # /api/resume endpoints
│   ├── roadmap.js               # /api/roadmap endpoints
│   ├── quiz.js                  # /api/quiz endpoints
│   ├── certificate.js           # /api/cert endpoints
│   ├── projects.js              # /api/projects endpoints
│   └── skillDetail.js           # /api/skillDetail endpoints
├── services/
│   ├── aiEnhancementService.js      # AI text enhancement
│   ├── cerebrasService.js           # Cerebras API integration
│   ├── certificateService.js        # Certificate generation
│   ├── exportService.js             # Document export (DOCX/PDF)
│   ├── githubProjectService.js      # GitHub API integration
│   ├── projectSkillIntegrationService.js  # Project-skill linking
│   ├── quizGenerator.js             # Quiz question generation
│   ├── resumeAnalyzerService.js     # Resume analysis
│   ├── resumeGeneratorService.js    # Resume generation
│   ├── resumeParserService.js       # Resume PDF parsing
│   ├── roadmapGenerator.js          # Learning path generation
│   └── skillMatchingService.js      # Skill matching logic
├── utils/
│   ├── skillNormalizer.js      # Skill normalization
│   └── textCleaner.js          # Text processing
└── data/
    └── fallbackQuiz.js         # Default quiz questions
```

### Server Initialization

```javascript
// server/index.js

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware Setup
app.use(cors())                                    // Enable CORS
app.use(express.json())                           // JSON parsing
app.use('/certificates', express.static(...))    // Static file serving

// Routes Registration
app.use('/api/auth', authRoutes)         // Auth endpoints
app.use('/api/profile', profileRoutes)   // Profile endpoints
app.use('/api/resume', resumeRoutes)     // Resume endpoints
app.use('/api/roadmap', roadmapRoutes)   // Roadmap endpoints
app.use('/api/quiz', quizRoutes)         // Quiz endpoints
app.use('/api/cert', certificateRoutes)  // Certificate endpoints
app.use('/api/projects', projectRoutes)  // Projects endpoints
app.use('/api', skillDetailRoutes)       // Skill detail endpoints

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Connection error:', err))

// Server Startup
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

---

## Database Models

### User Schema

```javascript
// server/models/User.js

{
  _id: ObjectId,
  
  // Authentication
  username: String (unique, required),
  email: String (unique, required, lowercase),
  password: String (hashed with bcrypt),
  
  // Personal Information
  fullName: String (required),
  phoneNumber: String (required),
  personalDetails: {
    dob: Date,
    gender: Enum ['Male', 'Female', 'Other', 'Prefer not to say'],
    nationality: String,
    location: {
      city: String,
      state: String,
      country: String
    }
  },
  
  // Status & Education
  currentStatus: Enum ['Student', 'Working Professional'] (required),
  education: [{
    degree: String,
    specialization: String,
    college: String,
    startYear: String,
    endYear: String
  }],
  
  // Work Experience
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
    currentSkills: [String],        // Skills user is learning
    targetJob: String,              // Target job title
    experienceLevel: String,        // Beginner/Intermediate/Advanced
    completedSkills: [{             // Skills user has mastered
      skill: String,
      score: Number (0-100),
      masteredAt: Date
    }],
    learningSkills: [String],       // Currently learning
    focusSkill: String,             // Primary focus
    roadmapCache: Object,           // Cached roadmap data
    lastProfileUpdate: Date         // Last update timestamp
  },
  
  // Career Information
  careerInfo: {
    roleType: Enum ['student', 'employed', 'unemployed'],
    yearsOfExperience: Number,
    expectedSalary: Number,
    jobPreferences: Array
  },
  
  // Resume Data
  resumeData: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
    skills: [String],
    experience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      graduationDate: Date
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      link: String
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: Date,
      link: String
    }],
    resumeVersions: [{
      template: String,
      content: String,
      createdAt: Date
    }]
  },
  
  // Tracking
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

### Skill Detail Schema

```javascript
// server/models/SkillDetail.js

{
  _id: ObjectId,
  skill: String (unique),
  category: String,              // Technical, Soft, etc.
  difficulty: Enum ['Beginner', 'Intermediate', 'Advanced'],
  description: String,
  prerequisites: [String],       // Required skills
  relatedSkills: [String],       // Similar skills
  resources: [{
    title: String,
    type: String (article, video, course),
    url: String,
    difficulty: String
  }],
  estimatedLearningTime: String, // e.g., "2-4 weeks"
  projects: [{
    name: String,
    description: String,
    difficulty: String
  }],
  marketDemand: {
    trend: String,
    companies: [String],
    salaryRange: String
  }
}
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Authenticate user | No |
| POST | `/logout` | Logout user | Yes |

**Signup Request:**
```json
{
  "username": "string",
  "email": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "password": "string",
  "currentStatus": "Student|Working Professional",
  "personalDetails": {...},
  "education": [...],
  "experience": [...]
}
```

**Login Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt_token_string",
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string"
  }
}
```

---

### Profile Routes (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/` | Save/Update profile | Yes |
| GET | `/` | Get user profile | Yes |
| PUT | `/focus-skill` | Update focus skill | Yes |
| POST | `/mark-skill-complete` | Mark skill as completed | Yes |
| DELETE | `/skill/:skill` | Remove skill | Yes |

**POST `/` Request:**
```json
{
  "currentSkills": ["JavaScript", "React"],
  "targetJob": "Full Stack Developer",
  "experienceLevel": "Intermediate"
}
```

---

### Resume Routes (`/api/resume`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/upload` | Upload PDF resume | Yes |
| GET | `/` | Get resume data | Yes |
| PUT | `/` | Update resume data | Yes |
| GET | `/analyze` | Analyze resume | Yes |
| GET | `/skills-analysis` | Get skill analysis | Yes |
| POST | `/enhance/:section` | AI enhance section | Yes |
| POST | `/export` | Export resume (DOCX) | Yes |
| GET | `/versions` | Get resume versions | Yes |
| POST | `/save-version` | Save new version | Yes |

**Upload Resume:**
- Accepts PDF file via multipart/form-data
- Parses resume using pdf-parse
- Extracts text and analyzes content

**Resume Data Structure:**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": [{
    "company": "string",
    "position": "string",
    "startDate": "date",
    "endDate": "date",
    "description": "string"
  }],
  "education": [{
    "institution": "string",
    "degree": "string",
    "field": "string",
    "graduationDate": "date"
  }],
  "projects": [{
    "name": "string",
    "description": "string",
    "technologies": ["string"],
    "link": "string"
  }],
  "certifications": [{
    "name": "string",
    "issuer": "string",
    "date": "date",
    "link": "string"
  }]
}
```

---

### Roadmap Routes (`/api/roadmap`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/` | Generate skill roadmap | Yes |
| GET | `/cached` | Get cached roadmap | Yes |

**Roadmap Structure:**
```json
{
  "targetJob": "string",
  "masteredSkills": ["string"],
  "requiredSkills": ["string"],
  "learningPath": [{
    "skill": "string",
    "priority": "High|Medium|Low",
    "estimatedTime": "string",
    "description": "string",
    "resources": [{
      "title": "string",
      "type": "string",
      "url": "string"
    }]
  }],
  "githubProjects": [{
    "name": "string",
    "url": "string",
    "description": "string",
    "skills": ["string"]
  }],
  "recommendedCourses": ["string"]
}
```

---

### Quiz Routes (`/api/quiz`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/:skill` | Get quiz questions | Yes |
| POST | `/submit` | Submit quiz answers | Yes |
| GET | `/results/:skill` | Get quiz results | Yes |

**Quiz Response:**
```json
{
  "skill": "string",
  "questions": [{
    "_id": "string",
    "question": "string",
    "type": "multiple-choice|true-false|short-answer",
    "options": ["string"],
    "difficulty": "Beginner|Intermediate|Advanced",
    "explanation": "string"
  }],
  "totalQuestions": "number",
  "timeLimit": "number (seconds)"
}
```

---

### Certificate Routes (`/api/cert`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/generate` | Generate certificate | Yes |
| GET | `/` | List user certificates | Yes |
| GET | `/:id` | Get certificate details | Yes |
| DELETE | `/:id` | Delete certificate | Yes |

**Generate Certificate:**
```json
{
  "skill": "string",
  "score": "number",
  "completionDate": "date"
}
```

---

### Projects Routes (`/api/projects`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/` | List GitHub projects | Yes |
| GET | `/by-skill/:skill` | Get projects for skill | Yes |
| POST | `/match-skills` | Match projects to skills | Yes |

---

### Skill Detail Routes (`/api`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/skill/:skillName` | Get skill details | No |
| GET | `/skills/category/:category` | Get skills by category | No |

---

## Services

### 1. **Resume Parser Service** (`resumeParserService.js`)

**Purpose:** Extract text and structured data from PDF resumes

**Key Functions:**
- `parseResume(filePath)` - Convert PDF to text
- `extractStructuredData(text)` - Parse text into resume sections
- `identifySkills(text)` - Extract skill mentions

**Process:**
```
PDF File
  ↓ (pdf-parse)
Raw Text
  ↓ (regex/NLP)
Structured Data
  {
    name, email, phone,
    experience, education,
    skills, projects
  }
```

---

### 2. **Resume Analyzer Service** (`resumeAnalyzerService.js`)

**Purpose:** Analyze resume quality and provide feedback

**Key Functions:**
- `analyzeResume(resumeData)` - Overall analysis
- `calculateCompleteness()` - Check section completeness
- `calculateATS_Score()` - ATS (Applicant Tracking System) score
- `getImprovementSuggestions()` - Actionable feedback

**Metrics Calculated:**
- ATS Score (0-100)
- Completeness %
- Skill relevance
- Experience clarity
- Formatting issues

---

### 3. **Resume Generator Service** (`resumeGeneratorService.js`)

**Purpose:** Generate professional resume from user data

**Key Functions:**
- `generateResumeHTML(userData)` - Create HTML resume
- `generateResumePDF(userData)` - Export as PDF
- `generateResumeDocx(userData)` - Export as DOCX
- `applyTemplate(data, template)` - Apply styling template

**Templates Available:**
- Professional (Conservative)
- Modern (Creative)
- Executive (Senior roles)
- Academic (Student-focused)

---

### 4. **Roadmap Generator Service** (`roadmapGenerator.js`)

**Purpose:** Create personalized skill learning paths

**Algorithm:**
```
User Input
├── Target Job: "Full Stack Developer"
├── Current Skills: ["JavaScript", "HTML"]
└── Experience Level: "Beginner"
  ↓
1. Fetch Required Skills (GitHub API)
2. Identify Missing Skills
3. Prioritize Skills (AI)
4. Generate Learning Path
5. Find GitHub Projects
6. Compile Roadmap
  ↓
Roadmap Output
├── Required Skills (15+)
├── Learning Path (steps, resources)
├── GitHub Projects (practice)
└── Estimated Timeline
```

**Key Functions:**
- `generateRoadmap(profile)` - Main roadmap generation
- `getGitHubSkillsAdvanced(jobTitle)` - Fetch from GitHub
- `getStackOverflowSkills(jobTitle)` - Fetch from StackOverflow
- `getAILearningPath(skills, job, level)` - Use Groq AI
- `getGitHubProjects(job, skills)` - Find practice projects

---

### 5. **Quiz Generator Service** (`quizGenerator.js`)

**Purpose:** Generate adaptive quiz questions for skill assessment

**Key Functions:**
- `generateQuiz(skill, difficulty, count)` - Generate questions
- `validateAnswers(answers)` - Score responses
- `calculateScore(responses)` - Compute final score
- `selectNextDifficulty(score)` - Adaptive difficulty

**Question Types:**
- Multiple Choice (4 options)
- True/False
- Short Answer
- Coding (pseudocode)

---

### 6. **AI Enhancement Service** (`aiEnhancementService.js`)

**Purpose:** Use AI to improve resume and skill descriptions

**Features:**
- Enhance summary sections
- Improve experience descriptions
- Suggest better skill keywords
- Refine project descriptions

**AI Providers Used:**
- Groq (Primary)
- Cerebras (Fallback)
- Google Generative AI (Fallback)

---

### 7. **GitHub Project Service** (`githubProjectService.js`)

**Purpose:** Integrate with GitHub to find learning projects

**Key Functions:**
- `searchRepositories(topic, language)` - Find repos
- `getProjectDetails(owner, repo)` - Get full project info
- `extractTechStack(repoData)` - Identify skills
- `rankProjectsBySkill(projects, skills)` - Sort by relevance

**Integration:**
- Uses @octokit/rest (GitHub API client)
- Requires GITHUB_TOKEN in .env
- Searches by language and topic

---

### 8. **Certificate Service** (`certificateService.js`)

**Purpose:** Generate downloadable certificates

**Features:**
- Create PDF certificates
- Store certificate records
- Track completion dates
- Generate unique certificate IDs

**Certificate Data:**
```json
{
  "id": "unique_id",
  "courseName": "JavaScript Mastery",
  "recipientName": "User Name",
  "completionDate": "2026-02-24",
  "score": 95,
  "certificateUrl": "https://..."
}
```

---

### 9. **Export Service** (`exportService.js`)

**Purpose:** Export resumes in various formats

**Supported Formats:**
- DOCX (Microsoft Word)
- PDF
- JSON
- Markdown

**Implementation:**
- Uses `docx` library for Word generation
- Uses Puppeteer for PDF generation
- Preserves formatting across formats

---

### 10. **Project Skill Integration Service** (`projectSkillIntegrationService.js`)

**Purpose:** Link GitHub projects to skill development

**Functions:**
- `matchProjectsToSkills(skills)` - Find relevant projects
- `calculateProjectDifficulty(project)` - Estimate difficulty
- `generateProjectPlan(project, userLevel)` - Create learning plan

---

## Authentication & Middleware

### JWT Authentication Flow

```
User Login
  ↓
Email + Password Validate
  ↓
Generate JWT Token
  token = sign({userId}, SECRET, {expiresIn: '7d'})
  ↓
Store in localStorage (Frontend)
  localStorage.setItem('token', token)
  ↓
Send with Requests
  headers: { 'Authorization': `Bearer ${token}` }
  ↓
Backend Verify
  jwt.verify(token, SECRET)
  ↓
Extract userId from token
  ↓
Attach to request (req.user, req.userId)
```

### Auth Middleware Implementation

```javascript
// server/middleware/authMiddleware.js

export const protect = (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      req.user = { _id: decoded.userId }
      req.userId = decoded.userId
      
      next()
    } catch (error) {
      res.status(401).json({ error: 'Token verification failed' })
    }
  } else {
    res.status(401).json({ error: 'No token provided' })
  }
}
```

### Protected Routes Pattern

```javascript
// Usage in routes
router.post('/', authMiddleware, async (req, res) => {
  // req.userId is now available
  const user = await User.findById(req.userId)
  // ... route logic
})
```

---

## File Structure Details

### Frontend Component Organization

```
src/
├── pages/              # Page-level components
│   ├── Dashboard.jsx   # Main dashboard view
│   ├── Login.jsx       # Authentication
│   ├── Signup.jsx      # Registration
│   ├── Profile.jsx     # User profile
│   ├── Quiz.jsx        # Skill assessments
│   ├── ResumeBuilder.jsx  # Resume creation
│   ├── Roadmap.jsx     # Skill paths
│   ├── Certificates.jsx # Certificate display
│   └── Projects.jsx    # GitHub projects
│
├── components/         # Reusable components
│   ├── Sidebar.jsx     # Navigation
│   ├── Avatar.jsx      # User avatar
│   ├── ResumePreview.jsx # Resume preview
│   ├── SkillRoadmap.jsx # Roadmap visualization
│   ├── SkillGapAnalysis.jsx # Gap analysis
│   ├── SkillTooltip.jsx # Interactive tooltips
│   ├── Skeleton.jsx    # Loading state
│   └── ... other components
│
├── layouts/
│   └── DashboardLayout.jsx # Main layout wrapper
│
├── assets/             # Images, fonts, etc.
├── App.jsx             # Root component & routing
├── main.jsx            # Entry point
└── index.css           # Global styles
```

### Backend Organization

```
server/
├── index.js                    # Server entry point
│
├── routes/                     # API endpoints
│   ├── auth.js                # /api/auth
│   ├── profile.js             # /api/profile
│   ├── resume.js              # /api/resume
│   ├── roadmap.js             # /api/roadmap
│   ├── quiz.js                # /api/quiz
│   ├── certificate.js         # /api/cert
│   ├── projects.js            # /api/projects
│   └── skillDetail.js         # /api/skillDetail
│
├── controllers/                # Business logic
│   ├── resumeController.js
│   └── certificateController.js
│
├── models/                     # Database schemas
│   ├── User.js
│   └── SkillDetail.js
│
├── services/                   # Specialized services
│   ├── roadmapGenerator.js     # Skill path generation
│   ├── quizGenerator.js        # Quiz creation
│   ├── resumeParserService.js  # PDF parsing
│   ├── resumeAnalyzerService.js # Resume analysis
│   ├── resumeGeneratorService.js # Resume generation
│   ├── aiEnhancementService.js # AI improvements
│   ├── githubProjectService.js # GitHub integration
│   ├── certificateService.js   # Certificate generation
│   ├── exportService.js        # Document export
│   └── ... other services
│
├── middleware/
│   └── authMiddleware.js       # JWT verification
│
├── config/
│   └── roleSkills.js           # Job role configurations
│
├── utils/
│   ├── skillNormalizer.js      # Skill normalization
│   └── textCleaner.js          # Text processing
│
├── data/
│   └── fallbackQuiz.js         # Default quiz questions
│
└── package.json               # Dependencies
```

---

## Key Features

### 1. **User Authentication**
- Secure signup with profile setup
- JWT-based login
- Password hashing with bcryptjs
- Token expiration (7 days)
- Protected routes

### 2. **Profile Management**
- Comprehensive user profile
- Current and target job tracking
- Skill management (current, learning, completed)
- Education and experience records
- Social media links
- Profile update tracking

### 3. **Resume System**
- **Upload & Parse**: PDF parsing and text extraction
- **Analysis**: ATS score, completeness check, suggestions
- **Generation**: Create resume from user data
- **Enhancement**: AI-powered text improvement
- **Export**: DOCX, PDF, JSON formats
- **Versioning**: Save multiple resume versions
- **Templates**: Multiple professional templates

### 4. **Skill Roadmap**
- AI-generated learning paths
- GitHub project integration
- Skill prioritization
- Resource recommendations
- Difficulty levels
- Estimated completion times

### 5. **Quiz System**
- Adaptive question difficulty
- Multiple question types
- Skill-specific assessments
- Score tracking
- Performance analytics
- Pass/fail thresholds

### 6. **Certificates**
- Automatic certificate generation
- PDF download
- Certificate records tracking
- Shareable links
- Skill mastery proof

### 7. **GitHub Integration**
- Find relevant projects by skill
- Project-skill matching
- Learning path integration
- Difficulty assessment

### 8. **AI Integration**
- Multiple AI providers (Groq, Cerebras, Google)
- Resume enhancement
- Quiz generation
- Learning path optimization
- Skill recommendations

---

## Deployment

### Environment Variables Required

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skill_career_tracker

# JWT
JWT_SECRET=your_secret_key_here

# API Keys
GROQ_API_KEY=your_groq_api_key
CEREBRAS_API_KEY=your_cerebras_api_key
GOOGLE_API_KEY=your_google_api_key
GITHUB_TOKEN=your_github_token

# Server
PORT=5000
NODE_ENV=development|production
```

### Frontend Build & Deployment

```bash
# Install dependencies
npm install

# Development server
npm run dev        # Runs on http://localhost:5173

# Build for production
npm build          # Creates dist/ folder

# Preview production build
npm run preview
```

### Backend Setup

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Development with nodemon
npm run dev        # Runs on http://localhost:5000

# Production
npm start
```

### Database Setup

1. Create MongoDB account (MongoDB Atlas)
2. Create cluster
3. Get connection string
4. Add to `.env` as MONGODB_URI
5. Collections created automatically on first use

---

## Data Flow Examples

### Complete User Journey Example

#### 1. **User Registration**
```
Frontend: signup form
  ↓
POST /api/auth/signup
  ├─ Validate input
  ├─ Hash password
  ├─ Create User document
  └─ Return JWT token
  ↓
Frontend: Store token, Navigate to dashboard
```

#### 2. **Profile Setup → Roadmap Generation**
```
Frontend: Profile form (target job, current skills)
  ↓
POST /api/profile/
  ├─ Update User document
  └─ Trigger roadmap invalidation
  ↓
Frontend: Click "View Roadmap"
  ↓
GET /api/roadmap/
  ├─ Check cache (if fresh, return)
  └─ Generate new:
      1. GitHub API: Get skills for job
      2. Groq: Generate learning path
      3. GitHub: Find projects
      4. Cache result
  ↓
Frontend: Display roadmap with skills, resources, projects
```

#### 3. **Resume Upload → Analysis**
```
Frontend: Upload resume.pdf
  ↓
POST /api/resume/upload (multipart/form-data)
  ├─ Save file to disk
  ├─ Parse PDF → extract text
  ├─ Analyze content
  │   ├─ Extract sections
  │   ├─ Identify skills
  │   └─ Calculate ATS score
  └─ Update User document
  ↓
Frontend: Display resume preview + analysis + suggestions
```

---

## Performance Optimization

### Caching Strategy
- Roadmaps cached for 7 days
- Quiz questions cached
- User profile in localStorage
- API response caching

### Database Indexing
```javascript
// Recommended indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ username: 1 })
db.skilldetails.createIndex({ skill: 1 })
```

### Frontend Optimization
- Lazy loading for components
- Code splitting via Vite
- Asset optimization (Tailwind CSS purging)
- Image optimization

---

## Error Handling

### Backend Error Responses

```javascript
// 400 Bad Request
{ error: "All basic fields required" }

// 401 Unauthorized
{ error: "Token is not valid" }

// 404 Not Found
{ error: "User not found" }

// 500 Server Error
{ error: "Server error message" }
```

### Frontend Error Handling
- Try-catch blocks in API calls
- User-friendly error messages
- Navigation to login on 401
- Error logging

---

## Testing & Debugging

### Available Debug Endpoints

```javascript
// server/
- debug_server.js      # Server status
- diag_db.js          # Database diagnostics
- verify_migration.js # Data migration checks
- verify_matching.js  # Skill matching test
- check_skills.js     # Skill validation
```

### Running Tests

```bash
# Frontend lint
npm run lint

# Backend nodemon watch
npm run dev

# Manual testing
# Use Postman/Thunder Client for API testing
```

---

## Current System Status

### Fully Implemented ✅
- User authentication (signup/login)
- Profile management
- Resume upload & parsing
- Resume analysis
- Resume export
- Skill roadmap generation
- Quiz system
- Certificate generation
- GitHub integration
- AI enhancement services
- Multiple AI provider support

### In Development / Planned
- Advanced analytics dashboard
- Peer comparison features
- Mentorship system
- Real-time notifications
- Mobile app
- Advanced filtering & search

---

## Contact & Support

For issues or questions regarding:
- **Frontend**: Check `src/` directory
- **Backend**: Check `server/` directory
- **Database**: Check MongoDB Atlas
- **Deployment**: Refer to package.json scripts

---

**Document Generated:** February 24, 2026  
**Project Status:** Stable (Release)  
**Maintenance:** Active
