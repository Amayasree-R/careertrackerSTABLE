# Resume Dashboard - Complete Architecture & Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Data Models](#data-models)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [AI Integration](#ai-integration)
9. [Complete Workflow](#complete-workflow)
10. [Setup & Configuration](#setup--configuration)

---

## System Overview

The Resume Dashboard is an intelligent, AI-powered resume builder and management system that allows users to:
- Upload and parse PDF resumes
- Generate ATS-optimized resumes using AI (Groq LLM)
- Edit and customize resume sections in real-time
- Perform skill gap analysis
- Export resumes as PDF/DOCX
- Manage multiple resume versions

### Key Features
- **AI Resume Generation**: Context-aware resume creation tailored for students/freshers or professionals
- **Intelligent Parsing**: PDF resume parsing with skill extraction and normalization
- **Live Preview**: Real-time editable preview with inline editing
- **Template System**: Multiple professional templates (Modern, Professional, Minimalist)
- **Export Functionality**: High-quality PDF export with Puppeteer
- **Skill Matching**: Integration with user's skill profile and mastered skills
- **Project Integration**: Auto-imports GitHub projects and certificate data
- **Contact Protection**: Ensures user contact information is never hallucinated by AI

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React + Vite)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐        ┌──────────────────┐              │
│  │  ResumeBuilder   │───────▶│  ResumePreview   │              │
│  │  (Main Page)     │        │  (Live Display)  │              │
│  └────────┬─────────┘        └──────────────────┘              │
│           │                                                      │
│           ├─────────▶ ResumeTemplates.jsx                       │
│           ├─────────▶ TemplateSelector.jsx                      │
│           ├─────────▶ ValidationChecklist.jsx                   │
│           └─────────▶ AIEnhancementModal.jsx                    │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │ Authorization: Bearer <JWT>
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Routes Layer                           │  │
│  │  /api/resume/* ─────▶ resume.js (Main Router)            │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                 Controllers Layer                         │  │
│  │  • uploadAndParseResume()                                 │  │
│  │  • analyzeResume()                                        │  │
│  │  • generateResumeData()                                   │  │
│  │  • exportResume()                                         │  │
│  │  • enhanceResumeText()                                    │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                  Services Layer                           │  │
│  │  ┌─────────────────────────────────────────────────┐     │  │
│  │  │ resumeParserService.js                          │     │  │
│  │  │  • extractTextFromPdf() (pdf-parse + pdfjs)    │     │  │
│  │  │  • parseResumeText()                            │     │  │
│  │  │  • parseSkills/Experience/Projects/etc()        │     │  │
│  │  └─────────────────────────────────────────────────┘     │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────┐     │  │
│  │  │ resumeAnalyzerService.js                        │     │  │
│  │  │  • getIndustrySkills() (GitHub API)            │     │  │
│  │  │  • analyzeSkillGap()                            │     │  │
│  │  │  • generateRoadmap()                            │     │  │
│  │  └─────────────────────────────────────────────────┘     │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────┐     │  │
│  │  │ resumeGeneratorService.js                       │     │  │
│  │  │  • getAggregatedResumeData()                    │     │  │
│  │  │  • detectUserProfile() (Student vs Pro)        │     │  │
│  │  │  • assembleResumeData()                         │     │  │
│  │  └─────────────────────────────────────────────────┘     │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────┐     │  │
│  │  │ aiEnhancementService.js                         │     │  │
│  │  │  • generateProfessionalSummary()                │     │  │
│  │  │  • enhanceAchievement()                         │     │  │
│  │  └─────────────────────────────────────────────────┘     │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────┐     │  │
│  │  │ exportService.js                                │     │  │
│  │  │  • generatePdfFromHtml() (Puppeteer)           │     │  │
│  │  │  • generateProfessionalHtml()                   │     │  │
│  │  │  • generateDocx() (docx library)               │     │  │
│  │  └─────────────────────────────────────────────────┘     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼──────────────┐
         │               │              │
         ▼               ▼              ▼
    ┌────────┐    ┌──────────┐   ┌──────────┐
    │MongoDB │    │ Groq API │   │ GitHub   │
    │  User  │    │  (LLM)   │   │   API    │
    │ Schema │    │          │   │          │
    └────────┘    └──────────┘   └──────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Router**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **PDF Parsing**: pdf-parse, pdfjs-dist
- **PDF Generation**: Puppeteer
- **DOCX Generation**: docx library
- **AI Integration**: Groq SDK (llama-3.3-70b-versatile)

### External APIs
- **Groq API**: AI-powered resume generation and text enhancement
- **GitHub API**: Industry skill analysis and project fetching

---

## Frontend Architecture

### Main Component: ResumeBuilder.jsx

**Location**: `src/pages/ResumeBuilder.jsx`

#### State Management
```javascript
const [isGenerating, setIsGenerating] = useState(false)
const [isExporting, setIsExporting] = useState(false)
const [isLoadingData, setIsLoadingData] = useState(true)
const [regeneratingSection, setRegeneratingSection] = useState(null)
const [userRawData, setUserRawData] = useState(null) // Raw profile data
const [resumeData, setResumeData] = useState({
    versionName: 'My Professional Resume',
    template: 'professional',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    masteredSkills: [],
    projects: [],
    certificates: [],
    contact: { email: '', phone: '', linkedin: '', github: '' }
})
```

#### Key Functions

**1. fetchInitialData()**
- Fetches user profile data from `/api/resume/data`
- Checks localStorage for saved resume
- Merges saved content with fresh profile data
- Always prioritizes profile data for contact info

**2. handleGenerate()**
- Calls `/api/resume/generate` to generate AI resume
- Sanitizes all fields to prevent undefined/null values
- Implements "Contact-First Protection" - always overwrites AI contact with fresh profile data
- Saves generated resume to localStorage

**3. handleRegenerateSection(section)**
- Regenerates specific section (summary, skills, experience, etc.)
- Sends current resume data for context
- Updates only the regenerated section

**4. handleSectionEdit(sectionName, updatedData)**
- Handles inline editing of resume sections
- Updates state and localStorage

**5. handleExport()**
- Calls `/api/resume/export/pdf`
- Downloads generated PDF with user's name

#### UI Structure
```
┌─────────────────────────────────────────────────────┐
│ Top Bar: Back Button | Title | Export PDF Button   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Left Column              Right Column             │
│  ┌──────────────┐        ┌────────────────┐       │
│  │              │        │                │       │
│  │ AI Resume    │        │  Live Preview  │       │
│  │ Generator    │        │                │       │
│  │              │        │  (ResumePreview│       │
│  │ [Generate]   │        │   Component)   │       │
│  │              │        │                │       │
│  │ [Clear]      │        │  • Edit inline │       │
│  │              │        │  • Regenerate  │       │
│  │              │        │    sections    │       │
│  └──────────────┘        └────────────────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### ResumePreview Component

**Location**: `src/components/ResumePreview.jsx`

#### Features
- **Error Boundary**: Prevents crashes from malformed data
- **Inline Editing**: EditableSection wrapper for all sections
- **Professional Layout**: Sidebar + Content layout
- **Responsive**: Follows A4 dimensions (595px × 842px)

#### Editable Sections
- Summary
- Experience
- Education
- Skills
- Projects
- Certificates

### ResumeTemplates Component

**Location**: `src/components/resume/ResumeTemplates.jsx`

#### Available Templates

**1. ModernTemplate**
- Bold indigo accents
- Border-bottom header
- Compact, modern styling

**2. ProfessionalTemplate**
- Dark sidebar (slate-900)
- Two-column layout
- Serif fonts for body text
- Clean, corporate look

**3. MinimalistTemplate**
- Simple, clean design
- Single column
- Maximum readability

#### Template Features
- All templates support inline editing via EditableSection wrapper
- Consistent data structure across templates
- Print-optimized styling

---

## Backend Architecture

### Routes: resume.js

**Location**: `server/routes/resume.js`

#### Authentication Middleware
```javascript
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const user = await User.findById(decoded.userId)
  req.user = user
  next()
}
```

#### File Upload Configuration
```javascript
const storage = multer.memoryStorage()
const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed'), false)
  }
  cb(null, true)
}
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})
```

### Controllers: resumeController.js

**Location**: `server/controllers/resumeController.js`

#### uploadAndParseResume()
```javascript
1. Validate user and file (PDF only, max 5MB)
2. Save uploaded file to uploads/resumes/
3. Extract text using resumeParserService.extractTextFromPdf()
4. Parse text into structured data using resumeParserService.parseResumeText()
5. Update user.resumeData and user.resumeFile
6. Return parsed data
```

#### analyzeResume()
```javascript
1. Fetch user and validate resume data exists
2. Initialize resumeAnalyzerService with GitHub token
3. Call analyzeSkillGap() to compare user skills with industry demands
4. Generate learning recommendations and roadmap
5. Update user.skillAnalysis
6. Return analysis results
```

#### exportResume()
```javascript
1. Get format from params (pdf or docx)
2. Fetch resume data from request body
3. For PDF:
   - Generate HTML using exportService.generateProfessionalHtml()
   - Convert to PDF using exportService.generatePdfFromHtml() (Puppeteer)
4. For DOCX:
   - Generate Word document using docx library
5. Stream file to client with appropriate headers
```

### Services Layer

#### resumeParserService.js

**Purpose**: Extract and parse resume PDFs into structured data

**Key Methods**:

**1. extractTextFromPdf(filePath)**
```javascript
• Primary: pdf-parse library
• Fallback: pdfjs-dist if pdf-parse fails or returns little text
• Error handling for corrupted PDFs
• Returns: Plain text string
```

**2. parseResumeText(rawText)**
```javascript
• Normalizes whitespace
• Detects sections (SKILLS, EXPERIENCE, EDUCATION, etc.)
• Extracts each section using specialized parsers
• Returns: {
    email, phone, urls, skills, tools,
    experience, education, projects, certifications, rawText
  }
```

**3. parseSkills(lines, sectionIndices)**
```javascript
• Splits by delimiters (commas, bullets, newlines)
• Filters out section headers
• Normalizes skill names using skillNormalizer
```

**4. parseExperience(lines, sectionIndices)**
```javascript
• Detects job titles and company names
• Extracts duration using regex (Jan 2020 - Mar 2022)
• Groups bullet points into descriptions
• Returns: [{ company, role, duration, description }]
```

**5. parseEducation(lines, sectionIndices)**
```javascript
• Detects institutions (university, college, etc.)
• Extracts degree (Bachelor, Master, PhD, etc.)
• Parses year using regex
• Returns: [{ institution, degree, field, year }]
```

**6. parseProjects(lines, sectionIndices)**
```javascript
• Detects project titles
• Extracts tech stack from parentheses or description
• Auto-extracts skills from description
• Returns: [{ title, description, techStack }]
```

#### resumeAnalyzerService.js

**Purpose**: Perform skill gap analysis using GitHub API

**Key Methods**:

**1. getIndustrySkills(jobRole, limit)**
```javascript
• Searches GitHub repositories for the target role
• Extracts skills from:
  - Repository topics
  - Programming languages
  - Repository descriptions
• Caches results per job role
• Returns: Array of top industry-demanded skills
```

**2. analyzeSkillGap(userSkills, targetJobRole)**
```javascript
• Fetches industry skills using getIndustrySkills()
• Compares user skills with industry demands
• Calculates match percentage
• Returns: {
    matchingSkills: [],
    missingSkills: [],
    industryDemandSkills: [],
    matchPercentage: number
  }
```

**3. generateRoadmap(analysis)**
```javascript
• Creates structured learning path
• Prioritizes missing high-demand skills
• Groups by difficulty/category
• Estimates learning timeline
```

#### resumeGeneratorService.js

**Purpose**: Aggregate user data for AI resume generation

**Key Methods**:

**1. getAggregatedResumeData(user)**
```javascript
Maps User schema fields to resume-ready format:
• Contact block (email, phone, linkedin, github)
• Education (maps college → institution, specialization → field)
• Experience (formats dates to duration strings)
• Mastered Skills (from user.profile.completedSkills)
• Known Skills (from user.profile.currentSkills)
• Certificates (with useInResume filter)
• Projects (merged from dashboard and resume data)
• Target Job Role

Returns: Structured object for AI prompt
```

**2. detectUserProfile(data)**
```javascript
• Checks if user has experience
• Determines isStudent flag
• Returns: { isStudent, hasExperience, hasSkills }
```

**3. assembleResumeData(user, options)**
```javascript
• Assembles complete resume with all sections
• Optionally generates AI summary
• Fetches GitHub projects if available
• Categorizes skills
• Returns full resume object
```

#### aiEnhancementService.js

**Purpose**: AI-powered text enhancement using Groq

**Key Methods**:

**1. generateProfessionalSummary(userData)**
```javascript
• Creates 3-4 sentence professional summary
• Tailored to target role and experience level
• Highlights mastered skills
• Uses Groq llama-3.1-8b-instant model
• Returns: String (summary text)
```

**2. enhanceAchievement(rawText, targetRole)**
```javascript
• Converts basic responsibility into STAR-format achievement
• Adds action verbs and quantifiable metrics
• Emphasizes impact and results
• Returns: Enhanced achievement text
```

#### exportService.js

**Purpose**: Generate PDF and DOCX exports

**Key Methods**:

**1. generatePdfFromHtml(htmlContent)**
```javascript
• Launches headless Chromium browser using Puppeteer
• Sets content with waitUntil: 'networkidle0'
• Emulates screen media type
• Generates A4 PDF with 0.5in margins
• Returns: PDF Buffer
```

**2. generateProfessionalHtml(data)**
```javascript
• Creates fully-styled HTML (inline CSS, no Tailwind)
• Matches Professional Template exactly
• Includes:
  - Dark sidebar with contact info
  - Main content area with sections
  - Custom fonts (Inter, EB Garamond)
  - Print-optimized styling
• Returns: Complete HTML string
```

**3. generateDocx(data)**
```javascript
• Uses docx library to create Word document
• Formats sections with proper styling
• Adds headers, bullet points, tables
• Returns: DOCX Buffer
```

---

## Data Models

### User Schema (Mongoose)

**Location**: `server/models/User.js`

```javascript
{
  // Basic Info
  username: String (required, unique),
  email: String (required, unique),
  fullName: String (required),
  phoneNumber: String (required),
  password: String (required, hashed),

  // Personal Details
  personalDetails: {
    dob: Date,
    gender: String (enum),
    nationality: String,
    location: {
      city: String,
      state: String,
      country: String
    }
  },

  // Education & Experience
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
    currentSkills: [String],
    targetJob: String,
    experienceLevel: String,
    completedSkills: [{
      skill: String,
      score: Number,
      masteredAt: Date
    }],
    learningSkills: [String],
    focusSkill: String,
    roadmapCache: Object,
    lastProfileUpdate: Date
  },

  // Career Info
  careerInfo: {
    roleType: String (enum: student/employed/unemployed),
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

  // Skill Analysis
  skillAnalysis: {
    matchingSkills: [String],
    missingSkills: [String],
    suggestedSkills: [String],
    industryDemandSkills: [String],
    analysisDate: Date
  },

  // Certificates
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

  // Projects (from GitHub/README analysis)
  projects: [{
    projectName: String,
    summary: String,
    techStack: [String],
    keyFeatures: [String],
    skillsExtracted: [String],
    readmeRaw: String,
    createdAt: Date
  }],

  // Resume Versions
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

---

## API Endpoints Reference

### Base URL: `http://localhost:5000/api/resume`

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. Upload Resume
```
POST /upload
Content-Type: multipart/form-data

Body:
  resume: File (PDF, max 5MB)

Response:
{
  "message": "Resume uploaded and parsed successfully",
  "resumeData": {
    "skills": [...],
    "experience": [...],
    "education": [...],
    ...
  },
  "email": "user@example.com",
  "phone": "+1234567890"
}
```

### 2. Get Resume Data
```
GET /data

Response:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "location": { "city": "...", "state": "...", "country": "..." },
  "github": "https://github.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "education": [...],
  "experience": [...],
  "masteredSkills": [...],
  "knownSkills": [...],
  "certificates": [...],
  "projects": [...],
  "targetJobRole": "Software Engineer"
}
```

### 3. Generate AI Resume
```
POST /generate

Response:
{
  "message": "Resume generated successfully",
  "resume": {
    "summary": "...",
    "education": [...],
    "experience": [...],
    "skills": [{ "category": "...", "items": [...] }],
    "masteredSkills": [{ "name": "..." }],
    "projects": [...],
    "certificates": [...],
    "contact": { ... }
  },
  "profileType": "student" | "professional"
}
```

### 4. Regenerate Section
```
POST /regenerate-section

Body:
{
  "section": "summary" | "skills" | "experience" | "certificates",
  "currentResumeData": { ... }
}

Response:
{
  "section": "summary",
  "content": {
    "summary": "newly generated summary text..."
  }
}
```

### 5. Analyze Resume (Skill Gap)
```
POST /analyze

Body:
{
  "userId": "user_id"
}

Response:
{
  "message": "Skill gap analysis completed",
  "analysis": {
    "matchPercentage": 75,
    "matchingSkills": [...],
    "missingSkills": [...],
    "industryDemandSkills": [...]
  },
  "recommendations": [...],
  "roadmap": { ... }
}
```

### 6. Export Resume
```
POST /export/pdf
POST /export/docx

Body:
{
  "resumeData": { ... }
}

Response:
  Binary file stream (PDF or DOCX)
  Content-Type: application/pdf | application/vnd.openxmlformats-officedocument.wordprocessingml.document
  Content-Disposition: attachment; filename="Resume.pdf"
```

### 7. Get Resume Versions
```
GET /versions

Response:
{
  "versions": [
    {
      "versionName": "Software Engineer Resume",
      "template": "professional",
      "targetRole": "Software Engineer",
      "createdAt": "2026-03-01T...",
      "lastModified": "2026-03-02T..."
    },
    ...
  ]
}
```

### 8. Save Resume Version
```
POST /save-version

Body:
{
  "versionName": "Software Engineer Resume",
  "template": "professional",
  "targetRole": "Software Engineer",
  "content": { ... }
}

Response:
{
  "message": "Resume version saved successfully",
  "version": { ... }
}
```

### 9. Get/Update/Delete Resume (Legacy)
```
GET /:userId
PUT /:userId
DELETE /:userId
GET /:userId/analysis
```

---

## AI Integration

### Groq API Configuration

**Model**: `llama-3.3-70b-versatile`
**API Key**: Stored in `.env` as `GROQ_API_KEY`
**Response Format**: JSON Object

### AI Prompts

#### Student/Fresher Resume Prompt
```
Key Instructions:
1. NEVER fabricate work experience
2. If field has no data, return empty array
3. Focus on academic achievements and projects
4. Highlight learning trajectory and growth mindset
5. DO NOT mention "years of experience"

Summary Style: Academic, growth-oriented, emphasizing potential
Sections: education, academicHighlights, skills, projects, certificates
```

#### Professional Resume Prompt
```
Key Instructions:
1. NEVER fabricate experience, companies, or dates
2. Expand experience into STAR-method bullet points
3. Quantify achievements where possible
4. Categorize skills logically
5. Contact info must NEVER be modified

Summary Style: Results-driven, achievement-focused
Sections: summary, experience, education, skills, projects, certificates
```

#### Section Regeneration Prompts
```
• summary: Rewrite professional summary only
• skills: Re-categorize skills with "Mastered Skills" first
• experience: Rewrite with STAR-format bullet points
• certificates: Format certificates section
```

### Contact Protection Strategy

**Problem**: AI models may hallucinate or modify contact information.

**Solution**: Three-layer protection
1. **Input Layer**: Explicitly include contact in prompt with instruction to preserve
2. **Output Layer**: Server validates and overwrites AI response with fresh profile data
3. **Frontend Layer**: Always uses userRawData for contact info, never AI response

```javascript
// Backend: Always overwrite AI contact
const userData = getAggregatedResumeData(user)
aiResponse.contact = userData.contact // Force correct contact

// Frontend: Always prioritize profile data
updatedData = {
  ...resumeData,
  ...aiResponse,
  contact: userRawData.contact // "Contact-First Protection"
}
```

---

## Complete Workflow

### User Journey: Generate Resume

```
1. User logs in → JWT token stored in localStorage

2. User navigates to Resume Builder
   ├─▶ Frontend: ResumeBuilder.jsx mounts
   ├─▶ Calls fetchInitialData()
   ├─▶ GET /api/resume/data
   └─▶ Server aggregates user data from User schema

3. User clicks "Generate Resume"
   ├─▶ handleGenerate() called
   ├─▶ POST /api/resume/generate
   ├─▶ Server calls getAggregatedResumeData()
   ├─▶ Server detects profile type (student vs professional)
   ├─▶ Server constructs tailored AI prompt
   ├─▶ Groq API generates structured JSON resume
   ├─▶ Server validates and protects contact info
   └─▶ Returns AI-generated resume

4. Frontend receives AI response
   ├─▶ Sanitizes all fields (safe(), safeArray(), safeString())
   ├─▶ Applies "Contact-First Protection"
   ├─▶ Updates resumeData state
   ├─▶ Saves to localStorage
   └─▶ ResumePreview renders live preview

5. User edits section inline
   ├─▶ Clicks pencil icon on section
   ├─▶ EditableSection switches to edit mode
   ├─▶ User modifies text in textarea/input
   ├─▶ Clicks checkmark
   ├─▶ handleSectionEdit() updates state
   └─▶ Saves to localStorage

6. User regenerates section
   ├─▶ Clicks regenerate icon
   ├─▶ POST /api/resume/regenerate-section
   ├─▶ Server calls Groq with section-specific prompt
   ├─▶ Returns only the regenerated section
   ├─▶ Frontend merges with existing resumeData
   └─▶ Updates preview

7. User exports PDF
   ├─▶ Clicks "Export PDF"
   ├─▶ POST /api/resume/export/pdf with resumeData
   ├─▶ Server calls exportService.generateProfessionalHtml()
   ├─▶ Puppeteer converts HTML to PDF
   ├─▶ Server streams PDF buffer to client
   └─▶ Browser downloads file
```

### Data Flow: Upload Resume

```
1. User uploads PDF
   ├─▶ POST /api/resume/upload (multipart/form-data)
   ├─▶ Multer validates file (PDF only, max 5MB)
   └─▶ File stored in memory buffer

2. Server processes file
   ├─▶ uploadAndParseResume() controller
   ├─▶ Saves file to uploads/resumes/<userId>-<timestamp>.pdf
   ├─▶ Calls resumeParserService.extractTextFromPdf()
   │   ├─▶ Primary: pdf-parse
   │   └─▶ Fallback: pdfjs-dist
   └─▶ Returns plain text

3. Server parses text
   ├─▶ resumeParserService.parseResumeText()
   ├─▶ Normalizes whitespace
   ├─▶ Detects sections (regex patterns)
   ├─▶ Parses each section:
   │   ├─▶ parseSkills()
   │   ├─▶ parseExperience()
   │   ├─▶ parseEducation()
   │   ├─▶ parseProjects()
   │   └─▶ parseCertifications()
   └─▶ Returns structured data

4. Server updates User schema
   ├─▶ user.resumeData = parsedData
   ├─▶ user.resumeFile = { filename, filePath, uploadedAt }
   ├─▶ user.save()
   └─▶ Returns parsed data to frontend

5. Frontend can now use parsed data
   ├─▶ Skills auto-populate in profile
   ├─▶ Experience/Education available for resume builder
   └─▶ User can perform skill gap analysis
```

---

## Setup & Configuration

### Environment Variables

**File**: `server/.env`

```bash
# Server Configuration
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/career-tracker

# Authentication
JWT_SECRET=your_super_secret_key_change_this_in_production

# API Keys
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CEREBRAS_API_KEY=csk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Installation Steps

#### Backend
```bash
cd server
npm install

# Dependencies:
# express, mongoose, jsonwebtoken, bcryptjs
# multer, pdf-parse, pdfjs-dist
# puppeteer, docx
# groq-sdk, axios
# dotenv, cors

# Start server
npm run dev  # or node index.js
```

#### Frontend
```bash
cd ../
npm install

# Dependencies:
# react, react-dom, react-router-dom
# axios, lucide-react
# tailwindcss, postcss, autoprefixer
# vite

# Start dev server
npm run dev  # Vite dev server on port 5173
```

### Database Setup

**MongoDB Collections**:
- `users`: Main user schema with all resume data
- `skilldetails`: Cached skill detail responses (auto-expires 30 days)

**Indexes**:
- `users.email`: Unique
- `users.username`: Unique
- `skilldetails`: Compound index on (skill, targetJob)

### File Storage

**Directory Structure**:
```
server/
  uploads/
    resumes/
      <userId>-<timestamp>.pdf
    certificates/
      <userId>-<timestamp>.pdf
```

**Note**: Ensure `uploads/` directory has write permissions.

### Puppeteer Configuration

**For Docker/Linux**:
```javascript
const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage' // Docker low memory fix
  ]
})
```

**For local development**:
- Puppeteer automatically downloads Chromium on first run
- Windows: Works out of the box
- macOS/Linux: May require additional dependencies

---

## Security Considerations

### 1. File Upload Security
- **Type Validation**: Only PDF files allowed
- **Size Limit**: Maximum 5MB
- **Filename Sanitization**: Uses `userId-timestamp.pdf` pattern
- **Storage**: Files stored outside public directory

### 2. Authentication
- **JWT Tokens**: HttpOnly, secure, expiration-based
- **Password Hashing**: Bcrypt with salt rounds
- **Authorization**: All resume endpoints require valid JWT

### 3. Data Sanitization
- **Input Validation**: All user inputs sanitized
- **XSS Prevention**: React's built-in escaping + DOMPurify for HTML
- **NoSQL Injection**: Mongoose query sanitization

### 4. AI Safety
- **Prompt Injection Prevention**: Structured JSON responses only
- **Contact Protection**: Never allows AI to modify contact info
- **Data Validation**: Server validates AI responses before saving

### 5. Rate Limiting
- Recommended: Implement rate limiting on AI endpoints (10 requests/minute)
- Groq API has built-in rate limits

---

## Performance Optimizations

### Frontend
1. **LocalStorage Caching**: Saves generated resume to avoid re-generation
2. **Conditional Rendering**: Only renders preview when data exists
3. **Lazy Loading**: Components loaded on demand
4. **Debouncing**: Inline edits debounced to prevent excessive re-renders

### Backend
1. **Skill Detail Caching**: MongoDB with 30-day TTL
2. **Industry Skills Caching**: In-memory cache per job role
3. **Lean Queries**: Uses `.lean()` for read-only operations
4. **Indexed Queries**: Compound indexes on frequently queried fields

### Export
1. **Puppeteer Pooling**: Reuse browser instances (not implemented yet)
2. **HTML Pre-rendering**: Generates HTML once, converts to PDF
3. **Streaming**: Large files streamed to client instead of buffering

---

## Troubleshooting

### Common Issues

**1. "Invalid API Key" error**
```
Solution: Verify GROQ_API_KEY in .env file
Check: Was .env loaded? (Use dotenv.config())
```

**2. "No token provided" error**
```
Solution: Check Authorization header format: "Bearer <token>"
Frontend: Ensure token in localStorage after login
```

**3. "Failed to extract text from PDF"**
```
Cause: Scanned/image-based PDF or corrupted file
Solution: Use OCR tool or re-export PDF with text layer
```

**4. "Resume Preview white screen"**
```
Cause: Malformed data passed to template
Solution: Check console for errors, use Error Boundary
Fix: Sanitize all data with safe(), safeArray(), safeString()
```

**5. "PDF export hangs"**
```
Cause: Puppeteer can't launch Chromium
Solution (Linux): Install dependencies:
  apt-get install -y chromium-browser
Solution (Docker): Add --no-sandbox flag
```

**6. "Contact info is wrong in resume"**
```
Cause: AI hallucinated contact info
Solution: Already fixed with "Contact-First Protection"
Verify: Check that userRawData.contact overwrites AI response
```

---

## Future Enhancements

### Planned Features
1. **Multi-language Support**: Generate resumes in multiple languages
2. **ATS Score**: Calculate ATS compatibility score
3. **Version History**: Compare and restore previous versions
4. **Collaborative Editing**: Share resume for feedback
5. **Template Marketplace**: Community-contributed templates
6. **LinkedIn Import**: Auto-import profile from LinkedIn
7. **Cover Letter Generator**: AI-powered cover letters
8. **Interview Prep**: Generate interview questions based on resume

### Technical Improvements
1. **WebSocket Updates**: Real-time preview updates during AI generation
2. **Progressive PDF Generation**: Show progress during export
3. **Client-side PDF Generation**: Use jsPDF for faster exports
4. **CDN Storage**: Store resumes on S3/CloudFlare for sharing
5. **Microservices**: Separate AI service from main backend
6. **GraphQL API**: Replace REST with GraphQL for flexible queries
7. **Redis Caching**: Replace in-memory cache with Redis
8. **Queue System**: Bull/RabbitMQ for long-running AI tasks

---

## Conclusion

The Resume Dashboard is a comprehensive, AI-powered resume management system that combines intelligent parsing, contextual AI generation, and professional export capabilities. Its architecture prioritizes data integrity (especially contact information), user control (inline editing), and performance (caching, streaming).

**Key Strengths**:
- ✅ Intelligent student vs. professional detection
- ✅ Contact-First Protection prevents AI hallucination
- ✅ Multi-layer data validation and sanitization
- ✅ Real-time preview with inline editing
- ✅ High-quality PDF export via Puppeteer
- ✅ Comprehensive skill integration with user profile
- ✅ Industry-standard STAR-formatted experience bullets

**Production Readiness Checklist**:
- [ ] Add rate limiting on AI endpoints
- [ ] Implement Redis for caching
- [ ] Add comprehensive error logging (Sentry)
- [ ] Set up monitoring (DataDog, New Relic)
- [ ] Implement automated testing (Jest, Cypress)
- [ ] Add backup/restore for MongoDB
- [ ] Configure CDN for static assets
- [ ] Set up CI/CD pipeline
- [ ] Implement feature flags
- [ ] Add analytics tracking

---

**Document Version**: 1.0  
**Last Updated**: March 3, 2026  
**Author**: Career Tracker Development Team
