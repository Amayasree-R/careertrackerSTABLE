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

---

## Project Overview

**Project Name:** Skill Career Tracker (CareerPath)

**Description:** A comprehensive MERN (MongoDB, Express, React, Node.js) stack web application designed to help users track their career progression, analyze skill gaps, generate personalized learning roadmaps, and certify their mastery through AI-powered quizzes.

**Target Users:**
- Students planning their career path
- Working professionals looking to upskill
- Career changers seeking guidance
- Job seekers preparing for interviews

**Core Objectives:**
1. Identify skill gaps between current and target job requirements
2. Provide personalized learning roadmaps using AI
3. Generate skill assessments via AI-powered quizzes
4. Track skill mastery with visual progress indicators
5. Enable resume building with AI enhancement
6. Manage certifications and portfolio
7. Integrate GitHub projects for portfolio building

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
- **Runtime:** Node.js
- **Server Framework:** Express 5.2.1
- **Database:** MongoDB 9+ (via Mongoose 9.1.5)
- **Authentication:** JWT (jsonwebtoken 9.0.3), bcryptjs 3.0.3
- **File Processing:**
  - PDF Parsing: pdf-parse 1.1.1, pdfjs-dist 5.4.624
  - Image Processing: Sharp 0.32.6
  - Document Generation: docx 9.5.1
  - Screenshotting: Puppeteer 24.37.3
- **AI Services:**
  - Groq SDK 0.37.0 (Llama 3.3 70b models)
  - Google Generative AI 0.24.1
  - Cerebras Cloud SDK 1.64.1
- **API Integration:** 
  - GitHub API (@octokit/rest 22.0.1)
  - Axios 1.13.3 (HTTP requests)
- **Middleware:**
  - CORS 2.8.6
  - Multer 1.4.4-lts.1 (file uploads)
- **Environment:** dotenv 17.3.1

### Development Tools
- **Frontend:** ESLint 9.39.1, Vite plugins
- **Backend:** Nodemon 3.1.14 (development)
- **Process Manager:** Available via npm scripts

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                       Frontend (React)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Pages: Dashboard, Profile, ResumeBuilder,      │   │
│  │  Certificates, Projects, Quiz, Roadmap         │   │
│  │                                                   │   │
│  │  Components: Skill Cards, Charts, Forms,        │   │
│  │  Preview Panels, Modals                         │   │
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
│  │ Resume Parser/Generator Service                 │   │
│  │ Roadmap Generator Service                       │   │
│  │ Skill Matching Service                          │   │
│  │ Certificate Service                             │   │
│  │ AI Enhancement Service                          │   │
│  │ GitHub Integration Service                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         External AI & Data Services                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Groq API (Quiz & Roadmap Generation)            │   │
│  │ Google Generative AI                            │   │
│  │ GitHub API (Project Extraction)                 │   │
│  │ Stack Overflow (Skill Data)                     │   │
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
├── components/              # Reusable React components
│   ├── Avatar.jsx          # User avatar component
│   ├── ResumePreview.jsx   # Resume preview display
│   ├── ResumeUploadForm.jsx # Resume upload interface
│   ├── Sidebar.jsx         # Navigation sidebar
│   ├── Skeleton.jsx        # Loading placeholders
│   ├── SkillGapAnalysis.jsx # Skill gap visualization
│   ├── SkillRoadmap.jsx    # Learning roadmap display
│   ├── SkillTooltip.jsx    # Skill information tooltip
│   └── profile/            # Profile-related components
│       ├── CertificateSection.jsx
│       ├── EducationSection.jsx
│       ├── ExperienceSection.jsx
│       ├── LocationSection.jsx
│       ├── PersonalDetailsSection.jsx
│       └── SocialLinksSection.jsx
├── layouts/
│   └── DashboardLayout.jsx # Protected dashboard wrapper
├── pages/                  # Page components
│   ├── Certificates.jsx    # Certification management
│   ├── Dashboard.jsx       # Main dashboard
│   ├── Home.jsx           # Landing page (in App.jsx)
│   ├── Login.jsx          # Login page
│   ├── Profile.jsx        # User profile view
│   ├── Projects.jsx       # GitHub projects display
│   ├── ProfileForm.jsx    # Profile setup form
│   ├── Quiz.jsx           # Quiz interface
│   ├── ResumeBuilder.jsx  # Resume builder interface
│   ├── Roadmap.jsx        # Learning roadmap page
│   └── Signup.jsx         # User registration
├── assets/               # Static assets (images, icons)
├── App.jsx              # Main app component with routing
├── index.css            # Global styles
└── main.jsx             # React DOM render

```

### Backend Structure

```
server/
├── index.js                    # Server entry point
├── package.json               # Dependencies
├── config/
│   └── roleSkills.js          # Predefined role skill mappings
├── controllers/
│   ├── certificateController.js    # Certificate management logic
│   └── resumeController.js         # Resume operations logic
├── middleware/
│   └── authMiddleware.js      # JWT authentication middleware
├── models/
│   ├── User.js                # User schema & model
│   └── SkillDetail.js         # Skill details schema
├── routes/
│   ├── auth.js                # Authentication endpoints
│   ├── certificate.js         # Certificate endpoints
│   ├── profile.js             # Profile endpoints
│   ├── projects.js            # GitHub projects endpoints
│   ├── quiz.js                # Quiz generation endpoints
│   ├── resume.js              # Resume operations endpoints
│   ├── roadmap.js             # Roadmap generation endpoints
│   └── skillDetail.js         # Skill details endpoints
├── services/
│   ├── aiEnhancementService.js        # AI text enhancement
│   ├── cerebrasService.js             # Cerebras AI integration
│   ├── certificateService.js          # Certificate processing
│   ├── exportService.js               # Resume export functionality
│   ├── githubProjectService.js        # GitHub project fetching
│   ├── projectSkillIntegrationService.js # Project-skill mapping
│   ├── quizGenerator.js               # AI quiz generation
│   ├── resumeAnalyzerService.js       # Resume analysis
│   ├── resumeGeneratorService.js      # Resume content generation
│   ├── resumeParserService.js         # PDF parsing & extraction
│   ├── roadmapGenerator.js            # Learning path generation
│   └── skillMatchingService.js        # Skill matching logic
├── utils/
│   ├── skillNormalizer.js     # Skill name normalization
│   └── textCleaner.js         # Text processing utilities
└── tests/
    ├── resume_preview.html     # Resume preview test file
    ├── simple.js              # Simple test script
    ├── testParser.js          # Parser testing
    └── testTemplate.js        # Template testing
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  
  // Basic Info
  username: String (required, unique),
  email: String (required, unique),
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
  currentStatus: String (enum: ['Student', 'Working Professional']),
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
    currentSkills: [String],              // Skills user has
    targetJob: String,                    // Target job role
    experienceLevel: String,              // Experience level
    completedSkills: [{                   // Mastered skills with scores
      skill: String,
      score: Number,
      masteredAt: Date
    }],
    learningSkills: [String],             // Currently learning
    focusSkill: String,                   // Current focus skill
    roadmapCache: {                       // Cached roadmap
      data: Object,
      generatedAt: Date
    },
    lastProfileUpdate: Date
  },
  
  // Career Info
  careerInfo: {
    roleType: String,                     // 'student', 'employed', 'unemployed'
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
    targetJobRole: String
  },
  
  // Resume File
  resumeFile: {
    filename: String,
    uploadedAt: Date,
    filePath: String
  },
  
  // Parsed Resume Data
  resumeData: {
    skills: [String],
    tools: [String],
    projects: [{
      title: String,
      description: String,
      techStack: [String]
    }],
    experience: [{
      company: String,
      role: String,
      duration: String,
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      graduationYear: String
    }],
    certifications: [String]
  },
  
  // Certifications
  certifications: [{
    title: String,
    polishedTitle: String,
    issuer: String,
    issueDate: Date,
    issueYear: Number,
    certificateUrl: String,
    useInResume: Boolean
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
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

#### 1. **Home Page (App.jsx)**
- Landing page with hero section
- Navigation with Login/Signup links
- Gradient background with call-to-action
- Responsive design with Tailwind CSS

**Key Components:**
```jsx
- Navigation bar with branding
- Hero section with main CTA
- "Get Started" button linking to signup
```

#### 2. **Login Page (Login.jsx)**
- Form-based login with validation
- Username and password fields
- Password visibility toggle
- Error message display
- Loading state management
- Redirect to dashboard on success

**Features:**
```javascript
- Client-side validation
- Token storage in localStorage
- Error handling and display
- Loading indicators
```

#### 3. **Dashboard (Dashboard.jsx)**
- Main user hub after login
- Skill progress visualization with Radar chart
- Three-column skill organization:
  - Skills to Learn (backlog)
  - Currently Learning (in-progress)
  - Mastered Skills (completed)
- Skill filtering and search
- Skill detail tooltips
- Skill status transitions

**Key Features:**
```javascript
- Real-time skill filtering
- Priority-based sorting
- Status-based filtering
- Search functionality
- Skill card interactions (move between columns)
- Hover tooltips with skill details
- Radar chart visualization of skill progress
```

#### 4. **Profile Page (Profile.jsx)**
- User information display
- Personal details section
- Education history
- Work experience
- Social links
- Avatar with initials
- Read-only view of profile

**Sections:**
```javascript
- Header: Name, email, status badge, location
- Personal Info: DOB, gender, nationality, location details
- Education: Degree/specialization/college/year
- Experience: Company/role/dates/description
- Social Links: GitHub, LinkedIn, Portfolio
```

#### 5. **Resume Builder (ResumeBuilder.jsx)**
- Resume creation and management
- Multiple sections (summary, experience, education, skills, projects, certificates)
- AI-powered resume generation
- Resume preview panel
- Export functionality (PDF/DOCX)
- Version management
- Section-by-section regeneration

**Key Functionalities:**
```javascript
- Fetch aggregated user data
- Generate resume via AI
- Edit resume sections manually
- Regenerate individual sections
- Preview in real-time
- Export as PDF/DOCX
- Save multiple versions
- Load from localStorage cache
```

#### 6. **Quiz Page (Quiz.jsx)**
- AI-generated skill assessments
- 25 multiple-choice questions per quiz
- Difficulty-based questions
- Progress tracking
- Score calculation (>90% to pass)
- Celebration effects on pass
- Retry functionality
- Fallback quiz system

**Features:**
```javascript
- Question display with options
- Progress indicator
- Score tracker
- Submit functionality
- Result display with score
- Celebratory confetti on pass
- Retry option on fail
- Answer review
```

#### 7. **Certificates Page (Certificates.jsx)**
- Certificate display and management
- Upload new certificates
- Toggle certificate visibility (for resume)
- Delete certificates
- Certificate metadata display
- Search and filter

#### 8. **Projects Page (Projects.jsx)**
- GitHub project integration
- Fetch user's GitHub projects
- Display project details:
  - Name, description, tech stack
  - Repository link
  - Stars/forks count
- Link projects to skills

#### 9. **Roadmap Page (Roadmap.jsx)**
- Learning path visualization
- Skill progression timeline
- Resource recommendations
- Priority-based learning order
- Interactive path exploration
- Time estimates for each skill

### Component Library

#### Skill Cards
```jsx
// Display skill with status, priority, and time estimate
<SkillCard
  skill={skillData}
  status="learning"  // 'toLearn', 'learning', 'mastered'
  onAction={handleSkillAction}
/>
```

#### Skill Tooltip
```jsx
// Popup with skill details, resources, why it matters
<SkillTooltip
  skill={skillData}
  position="top"
/>
```

#### Resume Preview
```jsx
// Real-time resume preview
<ResumePreview
  resumeData={resumeData}
  template="professional"
/>
```

#### Chart Components
```jsx
// Radar chart for skill visualization
<SkillRadar
  roadmap={roadmapData}
  profile={userProfile}
/>
```

---

## Backend Implementation

### Authentication System

#### JWT-Based Authentication
```javascript
// Signup Process
POST /api/auth/signup
{
  username, email, fullName, phoneNumber, password,
  personalDetails, currentStatus, education, experience, socialLinks
}
// Returns: { token, user: { id, username, email, fullName } }

// Login Process
POST /api/auth/login
{ username, password }
// Returns: { token, userId, username }

// Token Storage
localStorage.setItem('token', token)
```

#### Auth Middleware
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ message: 'No token' })
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}
```

### Controllers

#### Resume Controller
Handles resume-related operations:
- `uploadAndParseResume()` - Parse uploaded PDF resume
- `analyzeResume()` - Analyze skills and gaps
- `getResumeData()` - Fetch parsed resume data
- `generateResumeData()` - Generate resume content via AI
- `enhanceResumeText()` - Improve resume text
- `exportResume()` - Export as PDF/DOCX
- `getSkillAnalysis()` - Analyze skills from resume

#### Certificate Controller
Manages certificates:
- `uploadCertificate()` - Upload certificate image/PDF
- `getCertificates()` - Retrieve user certificates
- `toggleCertificateResume()` - Include/exclude from resume
- `deleteCertificate()` - Remove certificate

---

## API Routes & Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /signup              - Create new user account
POST   /login               - Login and get JWT token
```

### Profile Routes (`/api/profile`)
```
GET    /                    - Get user profile
POST   /                    - Update profile (skills, target job)
GET    /:userId             - Get specific user profile (public)
```

### Roadmap Routes (`/api/roadmap`)
```
GET    /                    - Generate/fetch cached learning roadmap
```

### Quiz Routes (`/api/quiz`)
```
GET    /:skill              - Generate quiz for specific skill
```

### Resume Routes (`/api/resume`)
```
POST   /upload              - Upload and parse resume PDF
POST   /analyze             - Analyze resume for skill gaps
GET    /data                - Get aggregated resume data
POST   /generate            - Generate resume via AI
POST   /:section/regenerate - Regenerate specific section
POST   /export              - Export resume (PDF/DOCX)
GET    /versions            - List resume versions
POST   /versions            - Save resume version
```

### Certificate Routes (`/api/cert`)
```
GET    /                    - Get all certificates
POST   /upload              - Upload certificate
PATCH  /toggle-resume/:id   - Toggle certificate visibility
DELETE /:id                 - Delete certificate
```

### Skill Detail Routes (`/api`)
```
GET    /skill-details/:skill - Get resources for a skill
```

### Project Routes (`/api/projects`)
```
GET    /                    - Fetch GitHub projects
GET    /github              - Get GitHub project details
```

---

## Core Services

### 1. Quiz Generator Service (`quizGenerator.js`)

**Purpose:** Generate AI-powered quizzes using Groq API

**Key Function:** `generateQuiz(skill, attempt, previousTopics)`
```javascript
// Features:
- Generates 25 unique multiple-choice questions
- Supports retry with different questions
- Anti-repetition rules to prevent duplicate questions
- Mixes difficulty levels (easy, medium, hard)
- Uses Groq's Llama 3.1 8B model
- Returns JSON with questions and correct answers
```

**Question Format:**
```json
{
  "id": 1,
  "difficulty": "easy|medium|hard",
  "question": "Question text",
  "options": ["A", "B", "C", "D"],
  "correctOption": "A"
}
```

### 2. Roadmap Generator Service (`roadmapGenerator.js`)

**Purpose:** Generate personalized learning roadmaps

**Key Function:** `generateRoadmap(profile)`
```javascript
// Features:
- Analyzes target job role
- Identifies skill gaps
- Fetches real job requirements from GitHub/Stack Overflow
- Provides learning resources
- Estimates learning time
- Creates skill dependencies
- Integrates user's existing skills
- Caches roadmap for performance
```

**Data Sources:**
1. GitHub Repository Analysis (primary)
2. Stack Overflow Trends
3. Predefined role-skill mappings
4. User's current skills

**Output Structure:**
```json
{
  "skillGap": {
    "mastered": 5,
    "toLearn": 12,
    "percentage": 29.4
  },
  "missingSkills": ["React", "Node.js", ...],
  "learningPath": [{
    "skill": "React",
    "priority": "High",
    "estimatedTime": "4 weeks",
    "resources": [{
      "type": "course",
      "name": "...",
      "url": "..."
    }],
    "status": "To Learn"
  }],
  "projects": [...]
}
```

### 3. Resume Parser Service (`resumeParserService.js`)

**Purpose:** Extract and parse resume PDFs

**Key Methods:**
- `extractTextFromPdf(filePath)` - Converts PDF to text
- `parseResumeText(rawText)` - Extracts structured data
- `parseSkills(lines, sectionIndices)` - Extracts skills
- `parseExperience(lines, sectionIndices)` - Extracts work history
- `parseEducation(lines, sectionIndices)` - Extracts education
- `parseProjects(lines, sectionIndices)` - Extracts projects

**Parsing Logic:**
```javascript
// Dual PDF parsing approach
1. Try pdf-parse first (faster)
2. Fallback to pdfjs-dist if needed
3. Clean and normalize text
4. Detect sections (Education, Experience, Skills, etc.)
5. Extract structured data from each section
6. Return normalized JSON
```

### 4. Resume Generator Service (`resumeGeneratorService.js`)

**Purpose:** Generate and enhance resume content

**Key Function:** `getAggregatedResumeData(user)`
```javascript
// Aggregates data from multiple user sources:
- Personal details (name, email, location)
- Education history
- Work experience
- Mastered and known skills
- Projects (from dashboard and resume)
- Certificates
- Target job role
```

### 5. Resume Analyzer Service (`resumeAnalyzerService.js`)

**Purpose:** Analyze resume for completeness and improvement

**Features:**
- Score resume sections
- Identify missing sections
- Suggest improvements
- Extract keywords
- Compare with job requirements

### 6. Skill Matching Service (`skillMatchingService.js`)

**Purpose:** Match extracted skills with target job requirements

**Key Function:** `matchSkillFuzzy(extractedSkill, targetSkills)`
```javascript
// Matching Strategy:
1. Normalized exact match (lowercase, trim special chars)
2. Substring matching for partial skills
3. Alias matching (e.g., JS = JavaScript)
4. Handles common abbreviations (Node.js, React.js, etc.)
```

### 7. GitHub Project Service (`githubProjectService.js`)

**Purpose:** Fetch and integrate GitHub projects

**Capabilities:**
- Fetch user repositories
- Extract project details (stars, forks, languages)
- Analyze project tech stack
- Link projects to skills
- Provide GitHub integration suggestions

### 8. AI Enhancement Service (`aiEnhancementService.js`)

**Purpose:** Enhance resume and profile text using AI

**Features:**
- Polish resume descriptions
- Improve bullet points
- Generate achievement summaries
- Optimize for ATS (Applicant Tracking System)
- Rephrase sections for clarity

### 9. Certificate Service (`certificateService.js`)

**Purpose:** Handle certificate processing

**Features:**
- Validate certificate files
- Extract certificate metadata
- Store certificate references
- Track certificate dates and issuers

### 10. Export Service (`exportService.js`)

**Purpose:** Export resume to multiple formats

**Supported Formats:**
- PDF (using Puppeteer for HTML-to-PDF)
- DOCX (using docx library)
- HTML (for preview/printing)

---

## Key Features Detailed

### 1. Skill Gap Analysis

**Workflow:**
1. User inputs current skills and target job role
2. System fetches job requirements from GitHub/Stack Overflow
3. Compares current skills against requirements
4. Identifies gaps and calculates skill percentage

**Visualization:**
- Radar chart showing all skills
- Color-coded indicators (mastered=blue, learning=orange, toLearn=gray)
- Percentage-based progress bars
- Skill count badges

### 2. AI-Generated Quizzes

**Quiz Generation Flow:**
```
User clicks "Take Quiz"
    ↓
Backend fetches skill details
    ↓
Groq API generates 25 unique questions
    ↓
Questions returned and rendered
    ↓
User answers questions
    ↓
Calculate score (>90% = pass)
    ↓
If pass: Mark skill as "Mastered", Show celebration
If fail: Offer retry with new questions
```

**Question Types:**
- Conceptual understanding
- Code output prediction
- Debugging scenarios
- Best-practice decisions
- Real-world scenarios

### 3. Resume Building & Enhancement

**Resume Generation Process:**
```
Fetch user's aggregated data
    ↓
AI analyzes data and generates sections:
  - Professional summary (AI-crafted from profile)
  - Experience (formatted and enhanced)
  - Education (structured from profile)
  - Skills (categorized by proficiency)
  - Projects (with description enrichment)
  - Certifications (formatted for impact)
    ↓
Display preview with edit capability
    ↓
User can:
  - Edit any section
  - Regenerate specific sections
  - Change template
  - Export to PDF/DOCX
```

**Resume Templates:** Professional (clean, ATS-friendly format)

### 4. Learning Roadmap

**Roadmap Components:**
1. **Skill Dependencies** - Shows which skills to learn first
2. **Resource Recommendations** - Courses, tutorials, books
3. **Time Estimates** - Realistic learning duration
4. **Difficulty Levels** - Beginner to advanced progression
5. **Project Suggestions** - Real-world projects to practice

**Priority Calculation:**
- Market demand for skill
- Prerequisite skills
- Learning complexity
- Job requirements

### 5. Certificate Management

**Features:**
- Upload certificate images/PDFs
- Extract certificate details (name, issuer, date)
- Include/exclude from resume
- Display in profile
- Search and filter

### 6. GitHub Integration

**Capabilities:**
- Fetch user's GitHub repositories
- Extract project details
- Analyze tech stack usage
- Link projects to skills
- Include in portfolio/resume

### 7. Profile Management

**Profile Data:**
- Personal information (DOB, location, etc.)
- Education history
- Work experience
- Skills and expertise
- Social profiles (GitHub, LinkedIn, Portfolio)
- Target job role
- Experience level

---

## Data Flow & Workflows

### User Registration & Login Flow

```
┌─────────────────────────────────────────────────────────┐
│                    SIGNUP FLOW                          │
└─────────────────────────────────────────────────────────┘

1. User submits signup form
   ├─ Username validation (unique)
   ├─ Email validation (unique)
   ├─ Password hashing (bcryptjs)
   └─ Create user document

2. Server generates JWT token
   └─ Token valid for 7 days

3. Store token in localStorage
   └─ Redirect to dashboard

4. On Dashboard load
   ├─ Token checked via authMiddleware
   ├─ JWT decoded to get userId
   └─ User data loaded from MongoDB

┌─────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                           │
└─────────────────────────────────────────────────────────┘

1. Submit username/password
2. Query database for user
3. Compare passwords (bcryptjs.compare)
4. Generate JWT if match
5. Return token to client
6. Store in localStorage
7. Redirect to dashboard
```

### Skill Progression Workflow

```
┌─────────────────────────────────────────────────────────┐
│              SKILL PROGRESSION FLOW                      │
└─────────────────────────────────────────────────────────┘

1. User creates/updates profile
   ├─ currentSkills: ["JavaScript", "React", "Node.js"]
   └─ targetJob: "Full Stack Developer"

2. Dashboard loads
   ├─ Fetch user profile
   ├─ Generate/load cached roadmap
   └─ Display skill cards

3. User moves skill: "React" → Learning
   ├─ Update profile.learningSkills
   ├─ Save to database
   └─ Refresh UI

4. User takes quiz for "React"
   ├─ Request /api/quiz/React
   ├─ Generate 25 questions via Groq
   ├─ Display quiz interface
   └─ Track user answers

5. Quiz completed
   ├─ Calculate score
   ├─ If score >= 90%:
   │  ├─ Add to completedSkills
   │  ├─ Remove from learningSkills
   │  ├─ Show celebration effect
   │  └─ Update dashboard
   └─ Else:
      ├─ Offer retry
      └─ Show feedback

6. Skill marked as Mastered
   ├─ Record score and date
   ├─ Update roadmap if needed
   └─ Update skill visualization
```

### Resume Building Workflow

```
┌─────────────────────────────────────────────────────────┐
│              RESUME BUILDING FLOW                        │
└─────────────────────────────────────────────────────────┘

Option A: Build from Scratch
1. User navigates to Resume Builder
2. Fetch/aggregate user data
   ├─ Personal details
   ├─ Education
   ├─ Experience
   ├─ Skills
   └─ Certifications
3. Click "Generate Resume"
4. Backend aggregates all data
5. Groq AI generates:
   ├─ Professional summary
   ├─ Enhanced experience descriptions
   ├─ Skills categorization
   └─ Achievement statements
6. Display in preview panel
7. User edits sections as needed
8. Save/Export

Option B: Upload & Parse Resume
1. User uploads PDF resume
2. Backend parses PDF
   ├─ Extract text
   ├─ Detect sections
   ├─ Parse skills/experience/education
   └─ Normalize data
3. Merge with profile data
4. Generate enhanced version
5. Display for review/edit
6. Save to profile

Option C: Edit Existing Resume
1. Load last generated resume from localStorage
2. Allow section-by-section editing
3. Regenerate specific sections via AI
4. Preview changes in real-time
5. Save new version
6. Export when ready
```

### Quiz & Certification Workflow

```
┌─────────────────────────────────────────────────────────┐
│           QUIZ & CERTIFICATION FLOW                      │
└─────────────────────────────────────────────────────────┘

QUIZ GENERATION:
1. GET /api/quiz/:skill?attempt=1
2. Check if quiz exists for skill
3. Generate 25 questions via Groq API
   ├─ Unique questions each attempt
   ├─ Mixed difficulty levels
   └─ Varied question types
4. Return questions and IDs

QUIZ ANSWERING:
1. User selects answers for each question
2. Frontend tracks answers
3. Display progress indicator
4. Show current question count

SCORING:
1. Submit quiz answers
2. Compare against correctOptions
3. Calculate score: (correct / 25) * 100
4. Determine pass/fail (threshold: 90%)

RESULT HANDLING:
If PASS (score >= 90%):
├─ Update completedSkills in DB
├─ Record score and date
├─ Mark skill as Mastered
├─ Remove from learningSkills
├─ Show celebration (confetti)
└─ Update dashboard

If FAIL (score < 90%):
├─ Show score and areas to improve
├─ Offer retry (generates new questions)
├─ Suggest learning resources
└─ Keep skill in learningSkills
```

---

## Setup & Installation

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account or local MongoDB installation
- **Groq API Key** (for AI features)
- **GitHub Token** (optional, for GitHub integration)

### Step 1: Clone/Extract Project

```bash
# Navigate to project directory
cd careertrackerSTABLE
```

### Step 2: Install Frontend Dependencies

```bash
# In root directory
npm install
```

This installs:
- React 19, React Router, Tailwind CSS
- Axios for HTTP requests
- Recharts for visualizations
- Canvas Confetti for effects
- Lucide React for icons

### Step 3: Install Backend Dependencies

```bash
# Navigate to server directory
cd server
npm install
```

This installs:
- Express server framework
- MongoDB Mongoose ODM
- JWT authentication
- Groq SDK for AI
- Multer for file uploads
- PDF parsing libraries
- And more...

### Step 4: Configure Environment Variables

Create `.env` file in `server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careertracker?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# AI Services
GROQ_API_KEY=your_groq_api_key_from_console.groq.com

# GitHub Integration (Optional)
GITHUB_TOKEN=your_github_personal_access_token

# Optional: Other AI Services
GOOGLE_GENERATIVE_AI_KEY=your_google_key
CEREBRAS_API_KEY=your_cerebras_key
```

### Step 5: Configure MongoDB

#### Option A: MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create a cluster
3. Create database user with password
4. Get connection string
5. Replace `username:password` with your credentials

#### Option B: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod

# Update .env
MONGODB_URI=mongodb://localhost:27017/careertracker
```

---

## Running the Application

### Development Mode

#### Terminal 1: Start Backend Server

```bash
cd server
npm run dev
```

Output:
```
Server running on port 5000
MongoDB connected: cluster0.c9akciq.mongodb.net
```

#### Terminal 2: Start Frontend Development Server

```bash
# In root directory
npm run dev
```

Output:
```
VITE v7.2.4 ready in 234 ms

➜  Local:   http://localhost:5173/
```

### Production Build

#### Build Frontend

```bash
npm run build
```

Creates optimized bundle in `dist/` directory.

#### Start Production Backend

```bash
cd server
npm start
```

```bash
PORT=5000 node index.js
```

### Access the Application

- **Frontend:** http://localhost:5173
- **API Server:** http://localhost:5000/api

### Testing Endpoints

#### Health Check
```bash
curl http://localhost:5000
# Response: { "message": "Career Path Tracker API" }
```

#### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User",
    "phoneNumber": "1234567890",
    "password": "password123",
    "currentStatus": "Student"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

---

## Troubleshooting

### MongoDB Connection Issues
```
Error: MongooseError: Cannot connect to MongoDB
Solution:
1. Check MONGODB_URI in .env
2. Ensure MongoDB Atlas cluster is running
3. Check network access in MongoDB Atlas (IP whitelist)
4. Verify username/password correctness
```

### GROQ API Errors
```
Error: GROQ_API_KEY is missing
Solution:
1. Get API key from console.groq.com
2. Add to .env file
3. Restart server
```

### CORS Issues
```
Error: CORS policy: No 'Access-Control-Allow-Origin'
Solution:
1. Check server CORS configuration
2. Ensure frontend and backend are on same/allowed origins
3. Restart servers
```

### Token Expiration
```
Error: Token expired
Solution:
1. User needs to login again
2. New token will be generated
3. Old token auto-cleared from localStorage
```

### Resume Upload Fails
```
Error: File size exceeds limit
Solution:
1. Ensure PDF is < 5MB
2. Compress PDF if needed
3. Try uploading again
```

---

## Project Statistics

### Code Metrics
- **Frontend Components:** 15+ React components
- **Backend Routes:** 7 route modules with 25+ endpoints
- **Services:** 10+ specialized service modules
- **Database Models:** 2 main schemas (User, SkillDetail)
- **API Endpoints:** 25+ RESTful endpoints

### Dependencies
- **Frontend:** 10 major dependencies
- **Backend:** 20+ major dependencies
- **dev Dependencies:** Various linting and build tools

### File Organization
- **Frontend Source:** ~2000 lines of React/JSX
- **Backend Source:** ~5000+ lines of Node.js/JavaScript
- **Documentation:** Multiple comprehensive guides

---

## Security Measures

1. **Password Security**
   - Bcryptjs hashing with salt rounds
   - Never stored in plain text

2. **JWT Authentication**
   - Token-based authentication
   - 7-day expiration
   - Secret key based validation

3. **CORS Protection**
   - Frontend and backend origin validation
   - Prevents cross-origin attacks

4. **File Upload Security**
   - File type validation (PDF only for resumes)
   - File size limits (5MB max)
   - Memory-based storage to prevent disk attacks

5. **Input Validation**
   - Email format validation
   - Username length requirements
   - Password strength checks

6. **Environment Variables**
   - API keys stored securely in .env
   - Never committed to version control

---

## Performance Optimizations

1. **Roadmap Caching**
   - Cache generated roadmaps
   - Invalidate only on profile changes

2. **Component Loading**
   - Skeleton loaders for better UX
   - Lazy loading of routes

3. **Database Indexing**
   - Compound indexes on SkillDetail
   - Faster queries for common searches

4. **API Optimization**
   - Minimal data transfer
   - Aggregated endpoints reduce requests
   - Response compression ready

5. **Frontend Optimization**
   - Vite for fast bundling
   - Tree-shaking for smaller bundle
   - CSS optimization with Tailwind

---

## Future Enhancement Ideas

1. **Real-time Collaboration**
   - Peer learning with other users
   - Mentor-mentee connections

2. **Advanced Analytics**
   - Learning progress analytics
   - Skill marketplace insights
   - Job market trends

3. **Mobile App**
   - React Native mobile version
   - Offline quiz capability

4. **Social Features**
   - Share progress and achievements
   - Leaderboards
   - Community projects

5. **Personalization**
   - Machine learning-based recommendations
   - Adaptive difficulty in quizzes
   - Personalized learning paths

6. **Integration Extensions**
   - LinkedIn integration
   - Indeed job matching
   - LeetCode/GeeksforGeeks integration

7. **Payment & Monetization**
   - Premium features
   - Certificate verification
   - Career coaching integration

---

## Conclusion

The Career Tracker application is a comprehensive, production-ready MERN stack platform that leverages AI to provide personalized career development support. It combines modern web technologies with intelligent services to deliver a unique learning and career progression experience.

The modular architecture ensures scalability, maintainability, and extensibility. Each component has clear responsibilities, making it easy to enhance features or integrate new technologies in the future.

For more information or support, refer to the individual documentation files or review the source code comments throughout the project.

---

**Last Updated:** March 3, 2026
**Version:** 1.0.0
**Status:** Production Ready
