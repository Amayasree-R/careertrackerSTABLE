# Resume Dashboard - Current Working Documentation

**Document Version:** 2.0  
**Last Updated:** March 3, 2026  
**Status:** Production Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Main Features](#main-features)
4. [AI Resume Generation](#ai-resume-generation)
5. [PDF Resume Upload & Parsing](#pdf-resume-upload--parsing)
6. [Live Preview & Inline Editing](#live-preview--inline-editing)
7. [Per-Section Regeneration](#per-section-regeneration)
8. [PDF Export System](#pdf-export-system)
9. [DOCX Export](#docx-export)
10. [Resume Versions](#resume-versions)
11. [Skill Gap Analysis](#skill-gap-analysis)
12. [State Management](#state-management)
13. [API Endpoints](#api-endpoints)
14. [Security Features](#security-features)
15. [Data Flow Diagrams](#data-flow-diagrams)

---

## System Overview

The **Resume Dashboard** is an AI-powered resume builder and management system integrated into the CareerPath application. It provides intelligent resume generation, editing, analysis, and export capabilities with profile-aware content creation.

### Core Capabilities

- ✅ **AI-Powered Generation**: Uses Groq LLaMA 3.3 70B for intelligent resume creation
- ✅ **PDF Resume Upload**: Parse existing resumes with advanced text extraction
- ✅ **Live Preview**: Real-time editable A4-sized resume preview
- ✅ **Template System**: Multiple professional templates (Modern, Professional, Minimalist)
- ✅ **Section Regeneration**: Regenerate individual sections without rebuilding entire resume
- ✅ **PDF/DOCX Export**: High-quality export using Puppeteer and docx library
- ✅ **Version Management**: Save and load multiple resume versions (2 max on free tier)
- ✅ **Skill Gap Analysis**: Compare resume skills against industry requirements
- ✅ **Contact Protection**: Prevents AI hallucination of personal information

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│                  http://localhost:5173                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Main Components:                                                │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │  ResumeBuilder.jsx   │─────▶│  ResumePreview.jsx   │        │
│  │  (Control Logic)     │      │  (Live Display)      │        │
│  └──────────┬───────────┘      └──────────────────────┘        │
│             │                                                    │
│             ├──────▶ ResumeTemplates.jsx                        │
│             ├──────▶ TemplateSelector.jsx                       │
│             ├──────▶ ValidationChecklist.jsx                    │
│             └──────▶ AIEnhancementModal.jsx                     │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP/REST API
                           │ Authorization: Bearer <JWT>
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                      │
│                   http://localhost:5000                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Routes Layer:                                                   │
│  /api/resume/* ──────▶ resume.js                                │
│                                                                  │
│  Controllers Layer:                                              │
│  • uploadAndParseResume()                                        │
│  • analyzeResume()                                               │
│  • generateResumeData()                                          │
│  • exportResume()                                                │
│  • enhanceResumeText()                                           │
│  • saveResumeVersion()                                           │
│                                                                  │
│  Services Layer:                                                 │
│  ┌────────────────────────────────────────────────┐            │
│  │ resumeParserService.js                          │            │
│  │  • extractTextFromPdf() - pdf-parse + pdfjs    │            │
│  │  • parseResumeText() - Section detection       │            │
│  │  • parseSkills/Experience/Projects/etc()       │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │ resumeAnalyzerService.js                        │            │
│  │  • getIndustrySkills() - GitHub API            │            │
│  │  • analyzeSkillGap()                            │            │
│  │  • generateRoadmap()                            │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │ resumeGeneratorService.js                       │            │
│  │  • getAggregatedResumeData()                    │            │
│  │  • detectUserProfile() - Student vs Pro        │            │
│  │  • assembleResumeData()                         │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │ aiEnhancementService.js                         │            │
│  │  • generateProfessionalSummary()                │            │
│  │  • enhanceAchievement()                         │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │ exportService.js                                │            │
│  │  • generatePdfFromHtml() - Puppeteer           │            │
│  │  • generateProfessionalHtml()                   │            │
│  │  • generateDocx() - docx library               │            │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌─────────┐  ┌──────────┐  ┌──────────┐
    │ MongoDB │  │ Groq API │  │ GitHub   │
    │  Users  │  │ (LLM)    │  │   API    │
    │ Schema  │  │ LLaMA    │  │ Industry │
    └─────────┘  │ 3.3 70B  │  │  Skills  │
                 └──────────┘  └──────────┘
```

### Technology Stack

**Frontend:**
- React 19.2.0
- Vite 7.2.4
- Tailwind CSS 3.4.1
- Axios 1.13.5
- Lucide React (Icons)

**Backend:**
- Node.js (LTS)
- Express.js 5.2.1
- MongoDB + Mongoose 9.1.5
- JWT Authentication
- Multer (File Upload)
- pdf-parse + pdfjs-dist (PDF Parsing)
- Puppeteer 24.37.3 (PDF Generation)
- docx 9.5.1 (DOCX Export)
- Groq SDK 0.37.0 (AI)

---

## Main Features

### Feature Matrix

| Feature | Status | Description |
|---------|--------|-------------|
| AI Resume Generation | ✅ Active | Generate complete resume from user profile |
| PDF Upload & Parsing | ✅ Active | Extract structured data from existing resumes |
| Live Preview | ✅ Active | Real-time A4-sized resume display |
| Inline Editing | ✅ Active | Edit any section directly in preview |
| Section Regeneration | ✅ Active | Regenerate individual sections with AI |
| PDF Export | ✅ Active | High-quality PDF export with Puppeteer |
| DOCX Export | ✅ Active | Microsoft Word format export |
| Multiple Templates | ✅ Active | Professional, Modern, Minimalist |
| Version Management | ✅ Active | Save/load resume versions (2 max free) |
| Skill Gap Analysis | ✅ Active | Compare skills vs industry requirements |
| Contact Protection | ✅ Active | Prevent AI from hallucinating personal info |
| LocalStorage Cache | ✅ Active | Resume persists across sessions |

---

## AI Resume Generation

### Overview

The primary feature that generates a complete, ATS-optimized resume using AI based on the user's profile data.

### Step-by-Step Process

#### 1. User Clicks "Generate Resume"

**Frontend** ([src/pages/ResumeBuilder.jsx](src/pages/ResumeBuilder.jsx)):

```javascript
const handleGenerate = async () => {
  setIsGenerating(true)
  
  // Fetch latest profile data
  const profileResponse = await axios.get('/api/resume/data')
  setUserRawData(profileResponse.data)
  
  // Generate resume
  const response = await axios.post('/api/resume/generate', {
    options: { template: 'professional' }
  })
  
  // Merge AI data with profile data (Contact Protection)
  const updatedData = {
    ...resumeData,
    summary: response.data.summary || resumeData.summary,
    experience: response.data.experience.length > 0 
      ? response.data.experience 
      : resumeData.experience,
    // ... more fields
    
    // ALWAYS from profile, NEVER from AI
    fullName: profileData.fullName,
    email: profileData.email,
    phoneNumber: profileData.phoneNumber,
    github: profileData.github,
    linkedin: profileData.linkedin
  }
  
  setResumeData(updatedData)
  localStorage.setItem(`resumeData_${userId}`, JSON.stringify(updatedData))
  setIsGenerating(false)
}
```

#### 2. Backend Data Aggregation

**Service:** [server/services/resumeGeneratorService.js](server/services/resumeGeneratorService.js)

```javascript
export function getAggregatedResumeData(user) {
  return {
    // Personal Details
    fullName: user.fullName || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    github: user.socialLinks?.github || '',
    linkedin: user.socialLinks?.linkedin || '',
    
    // Contact block (for AI protection)
    contact: {
      email: user.email,
      phone: user.phoneNumber,
      linkedin: user.socialLinks?.linkedin,
      github: user.socialLinks?.github
    },
    
    // Education (mapped from user.education)
    education: user.education.map(edu => ({
      institution: edu.college,
      degree: edu.degree,
      field: edu.specialization,
      year: edu.endYear || 'Ongoing'
    })),
    
    // Experience (mapped from user.experience)
    experience: user.experience.map(exp => ({
      company: exp.company,
      role: exp.role,
      duration: formatDuration(exp.startDate, exp.endDate),
      description: exp.responsibilities
    })),
    
    // Mastered Skills (from user.profile.completedSkills)
    masteredSkills: user.profile?.completedSkills || [],
    
    // Known Skills (from user.profile.currentSkills)
    knownSkills: user.profile?.currentSkills || [],
    
    // Target Job Role
    targetJobRole: user.careerInfo?.targetJobRole || 'Software Engineer',
    
    // Certificates (filtered by useInResume flag)
    certificates: user.certifications
      .filter(cert => cert.useInResume === true)
      .map(cert => ({
        polishedTitle: cert.polishedTitle || cert.title,
        issuer: cert.issuer,
        year: cert.issueYear
      })),
    
    // Projects (merged from dashboard and existing resume)
    projects: mergeProjects(user.projects, user.resumeData?.projects)
  }
}
```

#### 3. Profile Detection

**Logic:**

```javascript
export function detectUserProfile(userData) {
  const hasExperience = userData.experience && userData.experience.length > 0
  
  return {
    type: hasExperience ? 'professional' : 'student',
    experienceYears: calculateExperienceYears(userData.experience),
    educationLevel: userData.education?.[0]?.degree || 'Undergraduate',
    hasProjects: (userData.projects?.length || 0) > 0,
    hasCertificates: (userData.certificates?.length || 0) > 0
  }
}
```

#### 4. AI Prompt Construction

**For Students:**

```
You are generating a resume for a STUDENT/FRESHER with no work experience.

CRITICAL RULES:
- Focus on EDUCATION, PROJECTS, COURSEWORK, and ACADEMIC ACHIEVEMENTS
- DO NOT mention "years of experience" or professional work
- Emphasize learning, passion, and hands-on project work
- Highlight technical skills gained through projects and coursework
- Use enthusiastic but professional language suitable for entry-level

FORBIDDEN:
- DO NOT generate or return ANY contact information (email, phone, address)
- Contact info will be inserted separately from the database

Generate a resume with these sections in JSON format:
{
  "summary": "3-4 sentence summary focusing on academic background and passion",
  "academicHighlights": [
    "Project-Based Learning: Built X using Y",
    "Relevant Coursework: Data Structures, Algorithms, ML",
    "Academic Achievement: GPA, Dean's List, etc."
  ],
  "education": [...],
  "skills": [...],
  "projects": [...],
  "certificates": [...]
}
```

**For Professionals:**

```
You are generating a resume for a PROFESSIONAL with work experience.

CRITICAL RULES:
- Use STAR method (Situation, Task, Action, Result) for achievements
- Include quantifiable metrics (increased by X%, reduced by Y)
- Focus on IMPACT and business value
- Use action verbs: Led, Architected, Optimized, Delivered
- Show career progression and leadership

FORBIDDEN:
- DO NOT generate or return ANY contact information (email, phone, address)
- Contact info will be inserted separately from the database

Generate a resume with these sections in JSON format:
{
  "summary": "Professional summary highlighting expertise and impact",
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Jan 2023 - Present",
      "achievements": [
        "Led team of 5 engineers to deliver X, resulting in Y% improvement",
        "Architected microservices system handling Z requests/day"
      ]
    }
  ],
  "education": [...],
  "skills": [...],
  "projects": [...],
  "certificates": [...]
}
```

#### 5. Groq API Call

```javascript
const completion = await groq.chat.completions.create({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userDataJson }
  ],
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  max_tokens: 4096,
  response_format: { type: 'json_object' }
})

const aiResponse = JSON.parse(completion.choices[0].message.content)
```

#### 6. Contact Protection (Frontend)

**Critical Merge Logic:**

```javascript
const sanitized = sanitizeResumeData(aiResponse)

const updatedData = {
  ...resumeData,                          // Existing state
  
  // Only update if AI returned non-empty
  summary: sanitized.summary || resumeData.summary,
  experience: sanitized.experience.length > 0 
    ? sanitized.experience 
    : resumeData.experience,
  education: sanitized.education.length > 0 
    ? sanitized.education 
    : resumeData.education,
  skills: sanitized.skills,              // Always replaced
  certificates: sanitized.certificates,  // Always replaced
  projects: sanitized.projects,          // Always replaced
  
  // ALWAYS from fresh profile data, NEVER from AI
  fullName: safeString(userRawData?.fullName),
  email: safeString(userRawData?.email),
  phoneNumber: safeString(userRawData?.phoneNumber),
  location: formatLocation(userRawData?.location),
  github: safeString(userRawData?.github),
  linkedin: safeString(userRawData?.linkedin),
  portfolio: safeString(userRawData?.portfolio)
}
```

**Why This Matters:**
- Prevents AI from hallucinating fake contact information
- Ensures contact details are always current from the database
- Security measure against data fabrication

#### 7. LocalStorage Persistence

```javascript
localStorage.setItem(`resumeData_${userId}`, JSON.stringify(updatedData))
```

**Benefits:**
- Resume survives page refreshes
- No need to regenerate on every visit
- Can be manually cleared via "Clear & Start Fresh" button

---

## PDF Resume Upload & Parsing

### Overview

Users can upload an existing resume PDF which is parsed into structured data that populates the resume builder.

### Upload Flow

```
User selects PDF file
    ↓
POST /api/resume/upload
Content-Type: multipart/form-data
Authorization: Bearer <JWT>
    ↓
Multer Middleware:
  - memory storage (buffer in RAM)
  - max size: 5MB
  - accept: application/pdf only
    ↓
File saved to disk:
  /uploads/resumes/{userId}-{timestamp}.pdf
    ↓
resumeParserService.extractTextFromPdf(filePath)
    Uses: pdf-parse library
    Fallback: pdfjs-dist if pdf-parse fails
    ↓
Extract raw text (minimum 50 characters)
    ↓
resumeParserService.parseResumeText(rawText)
    ↓
Section Detection:
  - normalizeWhitespace(text)
  - detectSections(text) → find headers
    (SKILLS, EXPERIENCE, EDUCATION, PROJECTS, etc.)
    ↓
Parse each section:
  - parseSkills() → split by bullets/commas
  - parseExperience() → detect job titles + dates
  - parseEducation() → find universities + degrees
  - parseProjects() → short capitalized titles
  - parseCertifications() → cert lines + years
    ↓
Save to MongoDB:
  user.resumeData = { skills, experience, ... }
  user.resumeFile = { filename, uploadedAt, filePath }
    ↓
Return to frontend:
  { message, resumeData, email, phone }
    ↓
Display in ResumePreview
```

### Parser Capabilities

| Section | Detection Method | Parsing Logic |
|---------|-----------------|---------------|
| **Skills** | Headers: "skills", "technical skills", "competencies" | Split by: `\n`, `,`, `;`, `•`, `-`, `\|`, `→`, `*` |
| **Tools** | Regex: "tools:", "technologies:", "frameworks:" | Comma/semicolon/pipe delimited |
| **Experience** | Job title keywords: developer, engineer, manager, analyst | Header = new job entry, bullets = description |
| **Education** | Keywords: university, college, institute, school | Followed by degree keywords: B.Tech, MBA, M.S., B.Sc. |
| **Projects** | Capitalized short lines (2-30 chars) with optional `(tech)` | Each new capitalized line = new project |
| **Certifications** | Lines in cert section (non-headers) | Extract year with regex: `(20\|19)\d{2}` |

### Example Parsing

**Input Text:**
```
SKILLS
Python, JavaScript, React, Node.js, MongoDB, Docker

EXPERIENCE
Senior Software Engineer                    Jan 2023 - Present
Google Inc.
- Led team of 5 engineers
- Architected microservices platform

EDUCATION
Bachelor of Technology in Computer Science
MIT - Class of 2020
```

**Parsed Output:**
```json
{
  "skills": ["Python", "JavaScript", "React", "Node.js", "MongoDB", "Docker"],
  "experience": [
    {
      "role": "Senior Software Engineer",
      "company": "Google Inc.",
      "duration": "Jan 2023 - Present",
      "description": "Led team of 5 engineers\nArchitected microservices platform"
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Technology",
      "field": "Computer Science",
      "institution": "MIT",
      "year": "2020"
    }
  ]
}
```

---

## Live Preview & Inline Editing

### Component Structure

**File:** [src/components/resume/ResumePreview.jsx](src/components/resume/ResumePreview.jsx)

```jsx
<ResumePreview
  data={resumeData}               // Full resume data object
  onEdit={handleSectionEdit}      // Edit callback
  onRegenerate={handleRegenerateSection}  // Regenerate callback
  regeneratingSection={regeneratingSection}  // Loading state
/>
```

### Features

#### 1. A4 Dimensions

```css
.resume-preview {
  width: 595px;   /* A4 width in pixels at 72 DPI */
  height: 842px;  /* A4 height in pixels at 72 DPI */
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

**Why:** Ensures what users see in preview matches the PDF export exactly.

#### 2. Editable Sections

Every section is wrapped in an `EditableSection` component:

```jsx
<EditableSection
  section="summary"
  content={data.summary}
  onEdit={onEdit}
  onRegenerate={onRegenerate}
  isRegenerating={regeneratingSection === 'summary'}
>
  {/* Section content */}
</EditableSection>
```

**Editable Sections:**
- Summary
- Experience entries
- Education entries
- Skills
- Projects
- Certificates

**Edit Flow:**
1. User clicks on section → Enter edit mode
2. Modify content in textarea/form
3. Click "Save" → `onEdit(sectionName, updatedData)`
4. Frontend updates state and localStorage
5. Preview re-renders with new content

#### 3. Template Support

**Available Templates:**

**Professional Template:**
```
┌──────────────────────────────────┐
│ [Dark Sidebar]  [White Content]  │
│                                   │
│ Name            SUMMARY           │
│ Contact         Lorem ipsum...    │
│                                   │
│ CONTACT         EXPERIENCE        │
│ Email           Company           │
│ Phone           Role              │
│ LinkedIn        • Achievement 1   │
│ GitHub          • Achievement 2   │
│                                   │
│ SKILLS          EDUCATION         │
│ • Python        MIT               │
│ • React         B.Tech CS         │
│ • Docker        2020              │
└──────────────────────────────────┘
```

**Modern Template:**
- Bold indigo accents
- Border-bottom headers
- Compact layout

**Minimalist Template:**
- Single column
- Clean typography
- Maximum whitespace

#### 4. Blur Effect During Generation

```jsx
<div className={`transition-all duration-500 ${
  isGenerating ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'
}`}>
  <ResumePreview data={resumeData} />
</div>
```

**Effect:**
- Preview blurs when AI is generating
- Smooth CSS transition (500ms)
- User knows system is working

---

## Per-Section Regeneration

### Overview

Users can regenerate individual sections without rebuilding the entire resume, saving time and preserving edits to other sections.

### Supported Sections

| Section | Profile Type | What It Does |
|---------|-------------|--------------|
| `summary` | Both | Rewrites professional summary (3-4 sentences) |
| `skills` | Both | Re-categorizes skills into logical groups |
| `experience` | Professional | Rewrites bullets using STAR method |
| `experience` | Student | Generates academic highlights instead |
| `certificates` | Both | Reformats certificate display |

### Flow Diagram

```
User clicks "Regenerate" button on section
    ↓
setRegeneratingSection('skills')
    ↓
POST /api/resume/regenerate-section
Body: { 
  section: "skills",
  currentResumeData: { ...resumeData }
}
    ↓
Backend: Fetch fresh user from MongoDB
    ↓
Backend: getAggregatedResumeData(user)
    ↓
Backend: detectUserProfile(data)
    ↓
Backend: Build targeted AI prompt for section
    ↓
Switch on section:
  CASE 'summary':
    Prompt → Generate professional summary only
    Return: { "summary": "..." }
  
  CASE 'skills':
    Prompt → Categorize skills into groups
    Return: { "skills": [...], "masteredSkills": [...] }
  
  CASE 'experience' (professional):
    Prompt → Rewrite achievements with STAR method
    Return: { "experience": [...] }
  
  CASE 'experience' (student):
    Prompt → Generate academic highlights
    Return: { "academicHighlights": [...] }
  
  CASE 'certificates':
    Prompt → Format certificates cleanly
    Return: { "certificates": [...] }
    ↓
Groq API: llama-3.3-70b-versatile
response_format: { type: 'json_object' }
    ↓
Server returns: { section, content: {...} }
    ↓
Frontend: Merge into state
const updated = { ...resumeData, ...content }
    ↓
setResumeData(updated)
localStorage.setItem(..., updated)
setRegeneratingSection(null)
    ↓
Preview re-renders with updated section
```

### Visual Feedback

**During Regeneration:**

```jsx
// Header shows status
{regeneratingSection && (
  <div className="flex items-center gap-2 text-indigo-600">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>Updating {regeneratingSection}...</span>
  </div>
)}

// Section blurs
<EditableSection 
  isRegenerating={regeneratingSection === section}
>
  {isRegenerating && (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  )}
</EditableSection>
```

---

## PDF Export System

### Overview

High-quality PDF export using Puppeteer (headless Chrome) to render HTML to PDF, ensuring pixel-perfect match with the preview.

### Export Flow

```
User clicks "Export PDF"
    ↓
setIsExporting(true)
    ↓
POST /api/resume/export/pdf
Body: { resumeData }
responseType: 'blob'
    ↓
Backend: exportService.generateProfessionalHtml(resumeData)
    ↓
Build self-contained HTML:
  - Inline CSS only (no Tailwind)
  - Google Fonts imported
  - A4 dimensions (595px × 842px)
  - All sections rendered
    ↓
Backend: exportService.generatePdfFromHtml(htmlContent)
    ↓
Puppeteer Process:
  1. browser = await puppeteer.launch({
       headless: 'new',
       args: ['--no-sandbox', '--disable-setuid-sandbox']
     })
  2. page = await browser.newPage()
  3. await page.setContent(htmlContent, { 
       waitUntil: 'networkidle0' 
     })
  4. await page.emulateMediaType('screen')
  5. pdfBuffer = await page.pdf({
       format: 'A4',
       printBackground: true,
       margin: { 
         top: '0.5in', 
         right: '0.5in', 
         bottom: '0.5in', 
         left: '0.5in' 
       }
     })
  6. await browser.close()
    ↓
Server: res.contentType('application/pdf')
        res.send(pdfBuffer)
    ↓
Frontend: Create blob URL
const url = window.URL.createObjectURL(new Blob([response.data]))
    ↓
Frontend: Trigger download
const link = document.createElement('a')
link.href = url
link.download = `${fullName}_Resume.pdf`
link.click()
    ↓
Browser downloads: John_Doe_Resume.pdf
```

### HTML Generation

**Key Features:**

```javascript
export function generateProfessionalHtml(data) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resume - ${data.fullName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', sans-serif; 
      background: white; 
      color: #334155; 
    }
    .page { 
      width: 595.28px; 
      min-height: 841.89px; 
      display: flex; 
    }
    .sidebar { 
      width: 30%; 
      background: #1e293b; 
      color: white; 
    }
    .content { 
      width: 70%; 
      background: white; 
      padding: 40px 36px; 
    }
    /* ... more inline styles ... */
  </style>
</head>
<body>
  <div class="page">
    <div class="sidebar">
      <div class="name-block">
        <h1>${data.fullName}</h1>
        <div class="role">${data.targetJobRole || 'Software Engineer'}</div>
      </div>
      <!-- Contact, Skills sections -->
    </div>
    <div class="content">
      <!-- Summary, Experience, Education, Projects -->
    </div>
  </div>
</body>
</html>
  `
}
```

**Why Inline CSS:**
- Tailwind classes don't work in Puppeteer without build process
- Inline CSS ensures consistent rendering
- No external dependencies = faster rendering

### PDF Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `format` | `'A4'` | Standard paper size (210mm × 297mm) |
| `printBackground` | `true` | Include colored backgrounds |
| `margin.top` | `'0.5in'` | Standard business document margin |
| `margin.right` | `'0.5in'` | Standard business document margin |
| `margin.bottom` | `'0.5in'` | Standard business document margin |
| `margin.left` | `'0.5in'` | Standard business document margin |
| `emulateMediaType` | `'screen'` | Match browser preview exactly |

---

## DOCX Export

### Overview

Export resume as Microsoft Word document using the `docx` library for editing compatibility.

### Export Flow

```
User clicks "Export DOCX"
    ↓
POST /api/resume/export/docx
Body: { resumeData }
    ↓
Backend: exportService.generateDocx(resumeData)
    ↓
Create Document:
  const doc = new Document({
    sections: [{
      children: [
        // Header with name
        new Paragraph({
          text: data.fullName,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER
        }),
        
        // Contact line
        new Paragraph({
          text: `${email} • ${phone} • ${linkedin}`,
          alignment: AlignmentType.CENTER
        }),
        
        // Summary section
        new Paragraph({
          text: "PROFESSIONAL SUMMARY",
          heading: HeadingLevel.HEADING_2
        }),
        new Paragraph({ text: data.summary }),
        
        // Experience section
        ...data.experience.map(exp => [
          new Paragraph({
            text: exp.company,
            bold: true
          }),
          new Paragraph({ text: exp.role }),
          ...exp.achievements.map(ach => 
            new Paragraph({
              text: ach,
              bullet: { level: 0 }
            })
          )
        ])
      ]
    }]
  })
    ↓
Convert to buffer:
  const buffer = await Packer.toBuffer(doc)
    ↓
Server: res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        res.send(buffer)
    ↓
Frontend: Download as .docx file
```

### Document Structure

**Sections:**
1. Header with name (centered, large font)
2. Contact information (centered)
3. Professional Summary
4. Experience (company bold, bullets for achievements)
5. Education
6. Skills (comma-separated)
7. Projects
8. Certificates

**Formatting:**
- Headings: 14pt bold, uppercase
- Body text: 11pt regular
- Bullets: Standard bullet points
- Spacing: 1.5 line spacing

---

## Resume Versions

### Overview

Users can save multiple named versions of their resume (e.g., "Version for Google", "Version for Startup"). Free tier allows 2 versions.

### Save Version Flow

```
User clicks "Save Version"
    ↓
Modal appears: Enter version name and target role
    ↓
POST /api/resume/save-version
Body: {
  versionName: "V2 - Senior Role",
  template: "professional",
  targetRole: "Senior Software Engineer",
  content: { ...resumeData }  // Full resume snapshot
}
    ↓
Backend: Check version limit
if (req.user.resumeVersions.length >= 2) {
  return res.status(403).json({ 
    error: 'Free tier limit: max 2 versions. Upgrade to Pro for unlimited.'
  })
}
    ↓
Backend: Save version
req.user.resumeVersions.push({
  versionName,
  template,
  targetRole,
  content,
  createdAt: new Date(),
  lastModified: new Date()
})
await req.user.save()
    ↓
Server: res.json({ message, versions })
    ↓
Frontend: Update version list
```

### Load Version Flow

```
User selects version from dropdown
    ↓
GET /api/resume/versions
    ↓
Server: res.json({ versions: req.user.resumeVersions })
    ↓
Frontend: Display version list
    ↓
User clicks version
    ↓
setResumeData(version.content)
localStorage.setItem(..., version.content)
    ↓
Preview updates with loaded version
```

### Version Data Structure

```javascript
{
  versionName: "Senior Role - Google",
  template: "professional",
  targetRole: "Senior Software Engineer",
  content: {
    summary: "...",
    experience: [...],
    education: [...],
    skills: [...],
    projects: [...],
    certificates: [...]
  },
  createdAt: "2026-03-01T10:30:00Z",
  lastModified: "2026-03-03T14:20:00Z"
}
```

### Free Tier Limit

- **Maximum versions:** 2
- **Upgrade prompt:** Shown when attempting to save 3rd version
- **Storage:** MongoDB (User schema `resumeVersions` array)

---

## Skill Gap Analysis

### Overview

Compare skills from uploaded resume against industry requirements for target job role using GitHub API data.

### Analysis Flow

```
User uploads resume → Parsed data saved
    ↓
User clicks "Analyze Skills"
    ↓
POST /api/resume/analyze
Body: { userId }
    ↓
Backend: Validate
  - user.resumeData.skills exists?
  - user.careerInfo.targetJobRole exists?
    ↓
Backend: resumeAnalyzerService.initGithubClient(token)
    ↓
Backend: resumeAnalyzerService.analyzeSkillGap(
  userSkills: user.resumeData.skills,
  targetRole: user.careerInfo.targetJobRole
)
    ↓
Process:
  1. getIndustrySkills(targetRole)
     → GitHub API: Search repos for role keywords
     → Extract technologies from topics and languages
  
  2. normalizeSkills(userSkills)
     → Convert to lowercase, remove special chars
  
  3. Compare:
     matchingSkills = intersection(userSkills, industrySkills)
     missingSkills = industrySkills - userSkills
  
  4. Calculate match percentage:
     matchPercentage = (matchingSkills.length / industrySkills.length) * 100
    ↓
Backend: getLearningRecommendations(analysis)
  → Prioritize top 10 missing skills by industry demand
  → Generate learning resources for each
    ↓
Backend: generateRoadmap(analysis)
  → Create 3-phase learning plan:
    Phase 1: Foundation (0-3 months)
    Phase 2: Intermediate (3-6 months)
    Phase 3: Advanced (6-12 months)
    ↓
Backend: Save analysis to user
user.skillAnalysis = {
  matchingSkills,
  missingSkills,
  suggestedSkills,
  industryDemandSkills,
  analysisDate: new Date()
}
await user.save()
    ↓
Server: res.json({
  analysis: {
    matchPercentage,
    matchingSkills,
    missingSkills,
    industryDemandSkills
  },
  recommendations,
  roadmap
})
    ↓
Frontend: Display results in dashboard
```

### Analysis Output

**Example Response:**

```json
{
  "analysis": {
    "matchPercentage": 65,
    "matchingSkills": [
      "JavaScript", "React", "Node.js", "MongoDB", "Git"
    ],
    "missingSkills": [
      "TypeScript", "Docker", "Kubernetes", "AWS", 
      "GraphQL", "Redis", "Microservices"
    ],
    "industryDemandSkills": [
      { "skill": "TypeScript", "demand": "high" },
      { "skill": "Docker", "demand": "high" },
      { "skill": "AWS", "demand": "medium" }
    ]
  },
  "recommendations": [
    {
      "skill": "TypeScript",
      "priority": "high",
      "resources": [
        "Official TypeScript Handbook",
        "TypeScript Deep Dive (free book)",
        "Execute Program - TypeScript course"
      ]
    }
  ],
  "roadmap": {
    "phase1": {
      "name": "Foundation (0-3 months)",
      "skills": ["TypeScript", "Docker Basics"],
      "goals": "Build type-safe applications, containerize projects"
    },
    "phase2": {
      "name": "Intermediate (3-6 months)",
      "skills": ["Kubernetes", "AWS Fundamentals"],
      "goals": "Deploy containerized apps, use cloud services"
    },
    "phase3": {
      "name": "Advanced (6-12 months)",
      "skills": ["Microservices Architecture", "GraphQL"],
      "goals": "Design distributed systems, build modern APIs"
    }
  }
}
```

---

## State Management

### Frontend State (ResumeBuilder.jsx)

**Loading States:**

```javascript
const [isGenerating, setIsGenerating] = useState(false)
// true when full AI resume generation is running

const [isExporting, setIsExporting] = useState(false)
// true when PDF/DOCX export is in progress

const [isLoadingData, setIsLoadingData] = useState(true)
// true during initial data fetch from /api/resume/data

const [regeneratingSection, setRegeneratingSection] = useState(null)
// null | 'summary' | 'skills' | 'experience' | 'certificates'
// Indicates which section is being regenerated
```

**Data States:**

```javascript
const [userRawData, setUserRawData] = useState(null)
// Raw profile data from GET /api/resume/data
// Used as source for AI and contact protection
// Structure:
// {
//   fullName, email, phoneNumber, github, linkedin,
//   education: [...], experience: [...],
//   profile: { currentSkills, completedSkills },
//   projects: [...], certifications: [...]
// }

const [resumeData, setResumeData] = useState({
  versionName: 'My Professional Resume',
  template: 'professional',
  summary: '',
  experience: [],
  education: [],
  skills: [],              // Categorized: [{ category, items }]
  masteredSkills: [],      // [{ skill, score }] or [string]
  projects: [],
  certificates: [],
  contact: {
    email: '',
    phone: '',
    linkedin: '',
    github: ''
  },
  fullName: '',
  email: '',
  phoneNumber: '',
  location: '',
  github: '',
  linkedin: '',
  portfolio: ''
})
// Main resume content displayed in preview
```

### State Update Flow

```javascript
// Initial Load
useEffect(() => {
  fetchInitialData()
    ↓
  Check localStorage for saved resume
    ↓
  If exists: setResumeData(savedResume)
  If not: setResumeData(defaultStructure)
}, [])

// Generate Resume
handleGenerate()
    ↓
  Fetch fresh profile: setUserRawData(data)
    ↓
  Call AI: POST /api/resume/generate
    ↓
  Merge AI + profile: updatedData
    ↓
  setResumeData(updatedData)
    ↓
  localStorage.setItem(...)

// Edit Section
handleSectionEdit(section, updatedContent)
    ↓
  setResumeData(prev => ({
    ...prev,
    [section]: updatedContent
  }))
    ↓
  localStorage.setItem(...)

// Regenerate Section
handleRegenerateSection(section)
    ↓
  setRegeneratingSection(section)
    ↓
  Call AI: POST /api/resume/regenerate-section
    ↓
  Merge response: { ...resumeData, ...response }
    ↓
  setResumeData(merged)
    ↓
  localStorage.setItem(...)
    ↓
  setRegeneratingSection(null)
```

---

## API Endpoints

### Complete Endpoint Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/resume/data` | GET | ✅ | Fetch aggregated user profile data |
| `/api/resume/generate` | POST | ✅ | Generate full resume with AI |
| `/api/resume/regenerate-section` | POST | ✅ | Regenerate individual section |
| `/api/resume/upload` | POST | ✅ | Upload & parse PDF resume |
| `/api/resume/analyze` | POST | ✅ | Skill gap analysis |
| `/api/resume/export/pdf` | POST | ✅ | Export resume as PDF |
| `/api/resume/export/docx` | POST | ✅ | Export resume as DOCX |
| `/api/resume/save-version` | POST | ✅ | Save resume version |
| `/api/resume/versions` | GET | ✅ | Get all saved versions |
| `/api/resume/:userId` | GET | ✅ | Get resume data by user ID |
| `/api/resume/:userId` | PUT | ✅ | Update resume data manually |
| `/api/resume/:userId` | DELETE | ✅ | Delete resume data |
| `/api/resume/:userId/analysis` | GET | ✅ | Get skill analysis results |

### Detailed Endpoint Specs

#### 1. GET /api/resume/data

**Purpose:** Fetch all user profile data needed for resume generation

**Request:**
```http
GET /api/resume/data
Authorization: Bearer <JWT>
```

**Response:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "github": "github.com/johndoe",
  "linkedin": "linkedin.com/in/johndoe",
  "education": [...],
  "experience": [...],
  "profile": {
    "currentSkills": ["JavaScript", "React"],
    "completedSkills": [{ "skill": "Python", "score": 95 }]
  },
  "projects": [...],
  "certifications": [...]
}
```

#### 2. POST /api/resume/generate

**Purpose:** Generate complete AI-powered resume

**Request:**
```http
POST /api/resume/generate
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "options": {
    "template": "professional"
  }
}
```

**Response:**
```json
{
  "summary": "Experienced software engineer with 5+ years...",
  "experience": [
    {
      "company": "Google",
      "role": "Senior Software Engineer",
      "duration": "Jan 2023 - Present",
      "achievements": ["Led team of 5...", "Architected system..."]
    }
  ],
  "education": [...],
  "skills": [
    { "category": "Languages", "items": ["Python", "JavaScript"] }
  ],
  "projects": [...],
  "certificates": [...]
}
```

#### 3. POST /api/resume/regenerate-section

**Purpose:** Regenerate specific resume section

**Request:**
```http
POST /api/resume/regenerate-section
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "section": "skills",
  "currentResumeData": { ...entireResumeData }
}
```

**Response:**
```json
{
  "section": "skills",
  "content": {
    "skills": [
      { "category": "Languages", "items": ["Python", "Java"] },
      { "category": "Frameworks", "items": ["React", "Django"] }
    ],
    "masteredSkills": ["Python", "JavaScript", "React"]
  }
}
```

#### 4. POST /api/resume/upload

**Purpose:** Upload and parse PDF resume

**Request:**
```http
POST /api/resume/upload
Authorization: Bearer <JWT>
Content-Type: multipart/form-data

resume: <PDF file>
```

**Response:**
```json
{
  "message": "Resume uploaded and parsed successfully",
  "resumeData": {
    "skills": ["Python", "JavaScript"],
    "experience": [...],
    "education": [...],
    "parsedAt": "2026-03-03T10:30:00Z"
  },
  "email": "extracted@email.com",
  "phone": "1234567890"
}
```

#### 5. POST /api/resume/export/pdf

**Purpose:** Export resume as PDF

**Request:**
```http
POST /api/resume/export/pdf
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "resumeData": { ...fullResumeObject }
}
```

**Response:**
```
Binary PDF data
Content-Type: application/pdf
```

---

## Security Features

### 1. Authentication & Authorization

**JWT-Based Authentication:**

```javascript
// authMiddleware.js
export async function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    req.user = user  // Attach user to request
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

**All resume routes protected:**
```javascript
router.get('/data', authMiddleware, getResumeData)
router.post('/generate', authMiddleware, generateResume)
router.post('/upload', authMiddleware, uploadAndParseResume)
```

### 2. File Upload Security

**Multer Configuration:**

```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files allowed'))
    }
    cb(null, true)
  }
})
```

**Validation:**
- MIME type check: `application/pdf` only
- File size limit: 5MB
- Filename sanitization: `${userId}-${timestamp}.pdf`
- Storage isolation: `/uploads/resumes/` directory

### 3. Contact Protection

**AI Prompt Restrictions:**

```
FORBIDDEN:
- DO NOT generate or return ANY contact information
- DO NOT create email addresses, phone numbers, or addresses
- Contact info will be inserted separately from the database
```

**Frontend Enforcement:**

```javascript
// Always overwrite AI-generated contact with profile data
const updatedData = {
  ...aiResponse,
  fullName: userRawData.fullName,      // NEVER from AI
  email: userRawData.email,            // NEVER from AI
  phoneNumber: userRawData.phoneNumber // NEVER from AI
}
```

### 4. Input Sanitization

**Resume Data Sanitization:**

```javascript
function sanitizeResumeData(data) {
  return {
    summary: safeString(data.summary),
    experience: safeArray(data.experience).map(exp => ({
      company: safeString(exp.company),
      role: safeString(exp.role),
      duration: safeString(exp.duration),
      achievements: safeArray(exp.achievements).map(safeString)
    })),
    skills: safeArray(data.skills),
    // ... more fields
  }
}

function safeString(val) {
  if (!val || typeof val !== 'string') return ''
  return val.trim()
}

function safeArray(val) {
  return Array.isArray(val) ? val : []
}
```

### 5. User Data Isolation

**MongoDB Queries:**

```javascript
// Always filter by authenticated user ID
const user = await User.findById(req.user._id)

// Never accept userId from request body for sensitive operations
// Use req.user._id from JWT token instead
```

### 6. Rate Limiting (Recommended)

```javascript
// Should be implemented for production
import rateLimit from 'express-rate-limit'

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 requests per window
  message: 'Too many resume generation requests. Please try again later.'
})

router.post('/generate', authMiddleware, generateLimiter, generateResume)
```

---

## Data Flow Diagrams

### Complete Resume Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│  [Generate Resume Button] → Click                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (React)                            │
│                                                              │
│  1. setIsGenerating(true)                                   │
│  2. Fetch profile: GET /api/resume/data                     │
│     → setUserRawData(profileData)                           │
│  3. Generate: POST /api/resume/generate                     │
│  4. Receive AI response                                     │
│  5. Merge AI + profile data (Contact Protection)            │
│  6. setResumeData(mergedData)                               │
│  7. localStorage.setItem(...)                               │
│  8. setIsGenerating(false)                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Express + Services)                    │
│                                                              │
│  POST /api/resume/generate                                  │
│  ├─ authMiddleware → Verify JWT, attach user               │
│  ├─ resumeController.generateResumeData()                   │
│  │   ├─ resumeGeneratorService.getAggregatedResumeData()   │
│  │   │   └─ Fetch from User MongoDB model                  │
│  │   ├─ resumeGeneratorService.detectUserProfile()         │
│  │   │   └─ Determine: student vs professional             │
│  │   ├─ Build AI prompt (student or professional version)  │
│  │   ├─ Groq API call:                                      │
│  │   │   • Model: llama-3.3-70b-versatile                  │
│  │   │   • Temperature: 0.7                                 │
│  │   │   • response_format: json_object                    │
│  │   ├─ Parse JSON response                                │
│  │   └─ Return resume sections                             │
│  └─ res.json(resumeData)                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│                                                              │
│  ┌───────────────┐   ┌───────────────┐   ┌──────────────┐ │
│  │   MongoDB     │   │   Groq API    │   │  GitHub API  │ │
│  │               │   │               │   │              │ │
│  │ User Schema   │   │ LLaMA 3.3 70B │   │ Skill Data   │ │
│  │ - education   │   │               │   │ (for gap     │ │
│  │ - experience  │   │ JSON output   │   │  analysis)   │ │
│  │ - skills      │   │               │   │              │ │
│  │ - projects    │   └───────────────┘   └──────────────┘ │
│  └───────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

### PDF Export Flow

```
User clicks "Export PDF"
    │
    ▼
┌───────────────────────────────────────┐
│  POST /api/resume/export/pdf          │
│  Body: { resumeData }                 │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  exportService.generateProfessionalHtml()         │
│  ├─ Build self-contained HTML string              │
│  ├─ Inline CSS (no Tailwind)                      │
│  ├─ Import Google Fonts                           │
│  ├─ A4 dimensions (595×842px)                     │
│  └─ Return: HTML string                           │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  exportService.generatePdfFromHtml()              │
│  ├─ puppeteer.launch({ headless: 'new' })        │
│  ├─ page.setContent(htmlContent)                  │
│  ├─ page.emulateMediaType('screen')               │
│  ├─ page.pdf({                                    │
│  │     format: 'A4',                              │
│  │     printBackground: true,                     │
│  │     margin: { all: '0.5in' }                   │
│  │   })                                           │
│  ├─ browser.close()                               │
│  └─ Return: PDF Buffer                            │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  res.contentType('application/pdf')               │
│  res.send(pdfBuffer)                              │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│  Frontend: Blob download                          │
│  const blob = new Blob([response.data])           │
│  const url = URL.createObjectURL(blob)            │
│  link.download = 'John_Doe_Resume.pdf'            │
│  link.click()                                     │
└───────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Profile-Aware Generation

**Decision:** Different AI prompts for students vs professionals

**Rationale:**
- Students lack work experience but have projects and coursework
- Professionals need STAR-method achievements and metrics
- One-size-fits-all produces poor results

**Implementation:**
```javascript
const profile = detectUserProfile(userData)
if (profile.type === 'student') {
  prompt = studentPromptTemplate
} else {
  prompt = professionalPromptTemplate
}
```

### 2. Contact-First Architecture

**Decision:** Personal info NEVER from AI, always from database

**Rationale:**
- AI can hallucinate fake contact information
- Security risk: wrong phone/email on resume
- Data integrity: always use authoritative source

**Implementation:**
- AI prompt explicitly forbids contact generation
- Frontend always overwrites AI response with profile data

### 3. LocalStorage Caching

**Decision:** Save resume to browser localStorage

**Rationale:**
- Resume persists across page refreshes
- Reduces API calls and AI costs
- Faster load times for returning users

**Implementation:**
```javascript
localStorage.setItem(`resumeData_${userId}`, JSON.stringify(resumeData))
```

### 4. Inline CSS for Export

**Decision:** Use inline CSS instead of Tailwind for PDF

**Rationale:**
- Puppeteer doesn't process Tailwind without build step
- Inline CSS ensures consistent rendering
- No external dependencies = faster PDF generation

**Implementation:**
- Separate HTML generation function with inline styles
- Matches preview exactly but with pure CSS

### 5. Incremental Regeneration

**Decision:** Allow regenerating sections without full rebuild

**Rationale:**
- Faster than regenerating entire resume
- Preserves user edits to other sections
- Better user experience with targeted improvements

**Implementation:**
- Each section has "Regenerate" button
- API endpoint accepts section name and current data
- Returns only updated section

### 6. Free Tier Limits

**Decision:** 2 resume versions max on free tier

**Rationale:**
- Encourages Pro upgrades
- Limits database storage costs
- Most users need 1-2 versions (general + tailored)

**Implementation:**
```javascript
if (req.user.resumeVersions.length >= 2) {
  return res.status(403).json({ 
    error: 'Upgrade to Pro for unlimited versions' 
  })
}
```

### 7. Puppeteer Over PDF Libraries

**Decision:** Use Puppeteer instead of PDFKit/jsPDF

**Rationale:**
- Puppeteer renders actual HTML/CSS (pixel-perfect)
- PDF libraries require manual layout (error-prone)
- Preview always matches export exactly

**Trade-off:**
- Heavier resource usage (launches Chrome)
- Slower generation (1-3 seconds)
- But worth it for quality and maintainability

---

## Performance Considerations

### 1. AI Generation Time

**Average:** 3-5 seconds  
**Factors:**
- Groq API latency
- Complexity of profile data
- Token length

**Optimization:**
- Use streaming responses (future enhancement)
- Cache common sections
- Parallel section generation (future)

### 2. PDF Export Time

**Average:** 2-4 seconds  
**Factors:**
- Puppeteer launch time
- HTML rendering complexity
- Server resources

**Optimization:**
- Keep Puppeteer browser instance alive (pool)
- Simplify HTML structure
- Use CDN for fonts

### 3. LocalStorage Management

**Size Limit:** 5-10 MB per domain  
**Current Usage:** ~50-100 KB per resume

**Cleanup Strategy:**
```javascript
// Clear old resumes if storage fills up
if (localStorage.length > 10) {
  const oldest = findOldestResumeKey()
  localStorage.removeItem(oldest)
}
```

### 4. Database Queries

**Optimization:**
- Index on `userId` for fast lookups
- Populate only needed fields
- Lean queries for read-only operations

```javascript
const user = await User.findById(userId)
  .select('education experience profile projects certifications')
  .lean()
```

---

## Future Enhancements

### Planned Features

1. **Real-time Collaboration**
   - Share resume link with mentors for feedback
   - Live comments on sections

2. **ATS Score Checker**
   - Analyze resume against ATS requirements
   - Provide optimization suggestions

3. **Template Marketplace**
   - Community-contributed templates
   - Industry-specific designs

4. **Version Comparison**
   - Side-by-side diff of two versions
   - Track changes over time

5. **Smart Suggestions**
   - AI-powered content recommendations
   - Industry keyword optimization

6. **Bulk Export**
   - Export all versions at once
   - Batch PDF generation

7. **Resume Analytics**
   - Track which sections are viewed most
   - A/B testing different summaries

8. **Integration with Job Boards**
   - One-click apply with resume
   - Auto-tailor for job posting

---

## Troubleshooting

### Common Issues

#### 1. AI Generation Fails

**Symptoms:** Error message "Failed to generate resume"

**Causes:**
- Groq API key invalid/expired
- Network timeout
- Profile data incomplete

**Solutions:**
```javascript
// Check API key
console.log('Groq API Key:', process.env.GROQ_API_KEY ? 'Set' : 'Missing')

// Validate profile data
if (!user.fullName || !user.email) {
  return res.status(400).json({ 
    error: 'Complete your profile before generating resume' 
  })
}

// Increase timeout
axios.post('/api/resume/generate', data, { timeout: 30000 })
```

#### 2. PDF Export Blank/Broken

**Symptoms:** Downloaded PDF is empty or malformed

**Causes:**
- Puppeteer failed to launch
- HTML syntax errors
- Missing fonts

**Solutions:**
```javascript
// Check Puppeteer installation
await puppeteer.launch({ 
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
})

// Validate HTML
if (!htmlContent || htmlContent.length < 100) {
  throw new Error('Invalid HTML content')
}

// Ensure fonts loaded
await page.evaluateHandle('document.fonts.ready')
```

#### 3. LocalStorage Full

**Symptoms:** Resume not saving, console error

**Causes:**
- LocalStorage quota exceeded (5-10 MB)

**Solutions:**
```javascript
// Clear old resumes
function clearOldResumes() {
  const keys = Object.keys(localStorage)
    .filter(k => k.startsWith('resumeData_'))
  
  if (keys.length > 5) {
    keys.slice(0, keys.length - 5).forEach(k => localStorage.removeItem(k))
  }
}
```

#### 4. PDF Parsing Fails

**Symptoms:** "Failed to parse resume" error

**Causes:**
- Image-based PDF (scanned document)
- Encrypted PDF
- Corrupted file

**Solutions:**
```javascript
// Check if PDF is text-based
const text = await extractTextFromPdf(filePath)
if (text.length < 50) {
  return res.status(400).json({ 
    error: 'PDF appears to be image-based. Please upload a text-based PDF.' 
  })
}

// Try fallback parser
try {
  text = await pdfParse(buffer)
} catch (err) {
  text = await pdfjsExtract(buffer)
}
```

---

## Conclusion

The Resume Dashboard is a production-ready, AI-powered resume builder with comprehensive features for generation, editing, analysis, and export. It leverages modern technologies (React, Node.js, Groq AI, Puppeteer) to provide users with an intelligent, user-friendly resume creation experience.

### Key Strengths

✅ **Profile-Aware AI**: Generates different content for students vs professionals  
✅ **Contact Protection**: Prevents AI hallucination of personal information  
✅ **Live Preview**: Real-time A4-sized preview matching PDF export exactly  
✅ **Flexible Editing**: Inline editing + per-section regeneration  
✅ **High-Quality Export**: Puppeteer-based PDF export for pixel-perfect results  
✅ **Skill Analysis**: GitHub API integration for industry skill comparison  
✅ **Version Management**: Save multiple tailored resume versions  
✅ **Persistent State**: LocalStorage caching for seamless experience  

### Next Steps

For implementation details, refer to:
- [RESUME_DASHBOARD_COMPLETE_ARCHITECTURE.md](RESUME_DASHBOARD_COMPLETE_ARCHITECTURE.md) - Full architecture
- [RESUME_DASHBOARD_GUIDE.md](RESUME_DASHBOARD_GUIDE.md) - Technical guide
- [src/pages/ResumeBuilder.jsx](src/pages/ResumeBuilder.jsx) - Main component
- [server/controllers/resumeController.js](server/controllers/resumeController.js) - API endpoints

---

**Document End**
