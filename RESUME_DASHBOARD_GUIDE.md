# Resume Builder Dashboard — Detailed Technical Guide

> **File:** `src/pages/ResumeBuilder.jsx` · **Route:** `/dashboard/resume-builder`  
> **Last Updated:** February 2026

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [UI Layout](#2-ui-layout)
3. [State Management](#3-state-management)
4. [Workflow A — Generate Resume from Profile (AI)](#4-workflow-a--generate-resume-from-profile-ai)
5. [Workflow B — Upload Existing PDF Resume](#5-workflow-b--upload-existing-pdf-resume)
6. [Per-Section AI Regeneration](#6-per-section-ai-regeneration)
7. [Live Preview — ResumePreview Component](#7-live-preview--resumepreview-component)
8. [PDF Export — How It Works](#8-pdf-export--how-it-works)
9. [Resume Versions (Save & Load)](#9-resume-versions-save--load)
10. [Skill Gap Analysis (From Uploaded Resume)](#10-skill-gap-analysis-from-uploaded-resume)
11. [Data Persistence — localStorage Cache](#11-data-persistence--localstorage-cache)
12. [Backend API Reference (All Resume Endpoints)](#12-backend-api-reference-all-resume-endpoints)
13. [AI Prompting — Student vs Professional](#13-ai-prompting--student-vs-professional)
14. [Data Aggregation — getAggregatedResumeData()](#14-data-aggregation--getaggregatedresumedata)
15. [PDF Parsing — How Resume Upload Works](#15-pdf-parsing--how-resume-upload-works)
16. [PDF Export HTML Template](#16-pdf-export-html-template)
17. [DOCX Export](#17-docx-export)
18. [Complete Data Flow Diagram](#18-complete-data-flow-diagram)
19. [Error Handling](#19-error-handling)
20. [Key Design Decisions](#20-key-design-decisions)

---

## 1. Overview & Purpose

The **Resume Builder** is an AI-powered dashboard page that lets users:
1. **Generate** a complete professional resume from their CareerPath profile data using the Groq LLaMA 3.3 70B AI model
2. **Upload** an existing PDF resume, which is parsed and structured automatically
3. **Edit** any section of the resume using per-section AI regeneration
4. **Preview** the final resume in real-time as a styled HTML document
5. **Export** the resume as a downloadable **PDF** (via Puppeteer) or **DOCX** (via the `docx` library)
6. **Save** named snapshots (versions) of the resume

The system is profile-aware — it generates completely different content for **Students/Freshers** vs **Working Professionals** based on whether the user has work experience recorded.

---

## 2. UI Layout

The page uses a **sticky header + 2-column main layout**:

```
┌───────────────────────────────────────────────────────┐
│  STICKY HEADER (z-50)                                 │
│  [← Back]   Resume Builder subtitle   [Export PDF ↓] │
└───────────────────────────────────────────────────────┘

┌─────────────────┐  ┌──────────────────────────────────┐
│  LEFT PANEL     │  │  RIGHT PANEL (2/3 width)          │
│  (1/3 width)    │  │                                  │
│                 │  │  "Live Preview" label            │
│  ╔═══════════╗  │  │  [Updating section... spinner]  │
│  ║  AI Resume ║  │  │                                  │
│  ║ Generator  ║  │  │  ┌────────────────────────────┐ │
│  ║[Generate]  ║  │  │  │  ResumePreview Component  │ │
│  ║[Clear]     ║  │  │  │  (Rendered resume HTML)   │ │
│  ╚═══════════╝  │  │  └────────────────────────────┘ │
│                 │  │                                  │
└─────────────────┘  └──────────────────────────────────┘
```

**Left Panel** — `bg-gradient-to-br from-indigo-600 to-purple-600`:
- Bold heading: "AI Resume Generator"
- **Generate Resume** button (white, with `Wand2` icon) — triggers AI generation
- **Clear & Start Fresh** (small ghost link, with `Trash2` icon) — clears the resume

**Right Panel** — White card:
- "Live Preview" label with `FileText` icon
- Animated "Updating section..." status when AI is running
- Blur + opacity fade applied to preview while generating (`opacity-50 blur-[1px]`)
- Full `ResumePreview` component rendered inside a shadow box

---

## 3. State Management

All state lives in the `ResumeBuilder` component:

```js
// Loading flags
const [isGenerating, setIsGenerating]           // AI full resume generation running
const [isExporting, setIsExporting]             // PDF export running
const [isLoadingData, setIsLoadingData]         // Initial /data fetch running
const [regeneratingSection, setRegeneratingSection]  // Which section is being re-generated ('summary', 'skills', etc.)

// Source data
const [userRawData, setUserRawData]             // Aggregated profile data from GET /api/resume/data
                                                 // Used as source for AI and context throughout

// The Resume Content (the main data object)
const [resumeData, setResumeData]               // Full resume object displayed in ResumePreview
```

### `resumeData` Shape

This is the central resume object. Every field comes from either the profile, the AI, or the user's edits:

```js
{
  // Personal Info (always from profile API, never from AI)
  fullName:     "John Doe",
  email:        "john@example.com",
  phoneNumber:  "9876543210",
  location:     "Bangalore, Karnataka, India",   // assembled from personalDetails.location
  github:       "https://github.com/johndoe",
  linkedin:     "https://linkedin.com/in/johndoe",
  portfolio:    "https://johndoe.dev",

  // AI-Generated Fields
  summary:      "Professional summary text...",
  experience:   [{ company, role, duration, description }],
  education:    [{ institution, degree, field, year }],
  skills:       [{ category: "Languages", items: ["Python", "JS"] }],
  masteredSkills: [{ name: "React" }],
  projects:     [{ title, description, techStack: [] }],
  certificates: [{ name, issuer, year }],
  academicHighlights: [{ title, description }],  // Only for students

  // Version metadata
  versionName:  "My Professional Resume",
  template:     "professional"
}
```

### Data Sanitization

Every AI response is sanitized before setting state, using three guard functions defined at the top of the file:

```js
const safe = (val, fallback) => val !== undefined && val !== null ? val : fallback
const safeArray = (val) => Array.isArray(val) ? val : []
const safeString = (val) => typeof val === 'string' ? val : ''
```

These prevent crashes if the AI returns `null`, `undefined`, or wrong types in any field.

---

## 4. Workflow A — Generate Resume from Profile (AI)

This is the primary workflow. The user clicks **"Generate Resume"** and the entire resume is created from their saved profile data.

### Step-by-Step Flow

```
User clicks "Generate Resume"
    │
    ▼
Frontend: setIsGenerating(true)
ResumePreview blurs (opacity-50, blur-[1px])
    │
    ▼ POST /api/resume/generate (no body needed)
    │   Authorization: Bearer <JWT>
    │
    ▼ Server: authMiddleware verifies JWT
    │
    ▼ Server: User.findById(req.user._id).lean()
Fetch FULL user document from MongoDB
(fresh fetch, not from JWT payload)
    │
    ▼ Server: getAggregatedResumeData(user)
Build a clean data object from user fields:
  - fullName, email, phone, location, social links
  - education[] (mapped from user.education)
  - experience[] (mapped from user.experience)
  - masteredSkills[] (from profile.completedSkills where score >= 90)
  - knownSkills[] (from profile.currentSkills)
  - certificates[] (from user.certifications where useInResume != false)
  - projects[] (from user.resumeData.projects)
  - targetJobRole (from careerInfo.targetJobRole OR profile.targetJob)
    │
    ▼ Server: detectUserProfile(userData)
Check: does user have ANY experience entries?
  isStudent = experience.length === 0
    │
    ├──── isStudent = true ────► STUDENT/FRESHER PROMPT
    │                            (See Section 13)
    └──── isStudent = false ───► PROFESSIONAL PROMPT
                                 (See Section 13)
    │
    ▼ Server: groq.chat.completions.create(...)
    Model: llama-3.3-70b-versatile
    response_format: { type: 'json_object' }
    Returns structured JSON resume
    │
    ▼ Server: JSON.parse(completion.choices[0].message.content)
    │
    ▼ Server: res.json({ resume: aiResponse, profileType })
    │
    ▼ Frontend: sanitize every field with safe(), safeArray(), safeString()
    │
    ▼ Frontend: MERGE ORDER (critical):
    Only use AI data if it's non-empty,
    otherwise keep existing resumeData values
    Personal info ALWAYS from userRawData (not from AI)
    │
    ▼ Frontend: setResumeData(updatedData)
    ▼ Frontend: saveToLocalStorage(updatedData)
    ▼ Frontend: setIsGenerating(false)
    ▼ ResumePreview re-renders with new content
```

### Critical Merge Logic

```js
const updatedData = {
  ...resumeData,                          // Start with existing data
  summary: sanitized.summary || resumeData.summary,  // Only update if AI returned non-empty
  experience: sanitized.experience.length > 0         // Only override if AI returned items
      ? sanitized.experience
      : resumeData.experience,
  // ...same for education, masteredSkills...
  skills: sanitized.skills,              // Skills always replaced (can be empty array)
  certificates: sanitized.certificates,  // Certs always replaced
  projects: sanitized.projects,          // Projects always replaced
  academicHighlights: sanitized.academicHighlights,  // Student-only
  // Personal info: ALWAYS use fresh profile data, never from AI
  fullName: safeString(userRawData?.fullName),
  email: safeString(userRawData?.email),
  phoneNumber: safeString(userRawData?.phoneNumber),
  location: `${city}, ${state}, ${country}`,
  github: safeString(userRawData?.github),
  linkedin: safeString(userRawData?.linkedin),
  portfolio: safeString(userRawData?.portfolio)
}
```

> **Why this matters:** AI is explicitly forbidden from returning personal contact information in the JSON. All contact info always comes directly from the database/profile to prevent hallucination.

---

## 5. Workflow B — Upload Existing PDF Resume

Users can also upload an existing resume PDF. This populates `user.resumeData` in MongoDB via AI-powered PDF parsing.

### Step-by-Step Flow

```
User selects a PDF file via <ResumeUploadForm>
    │
    ▼ Frontend: FormData with file field "resume"
    POST /api/resume/upload
    Content-Type: multipart/form-data
    Authorization: Bearer <JWT>
    │
    ▼ Server: Multer (memory storage, max 5MB, PDF only)
    File stored as buffer in req.file.buffer
    Not written to disk yet
    │
    ▼ Server: authMiddleware (full user object attached as req.user)
    │
    ▼ Server: Validation
    - User authenticated? ✓
    - File provided? ✓
    - Valid ObjectId? ✓
    │
    ▼ Server: Save file to disk
    Path: /uploads/resumes/<userId>-<timestamp>.pdf
    Written via: fs.writeFile(filePath, file.buffer)
    │
    ▼ Server: resumeParserService.extractTextFromPdf(filePath)
    Uses pdf-parse to extract raw text string
    If text < 50 chars → error
    │
    ▼ Server: resumeParserService.parseResumeText(rawText)
    ┌─────────────────────────────────────────────┐
    │  Text Preprocessing:                        │
    │  - normalizeWhitespace(rawText)             │
    │  - getCleanLines(normalizedText)            │
    │  - detectSections(normalizedText)           │
    │    → finds SKILLS, EXPERIENCE, EDUCATION,   │
    │      PROJECTS, CERTIFICATIONS section headers│
    └─────────────────────────────────────────────┘
    Returns indices of each section start
    │
    ▼ Server: Parse each section independently:
    parseSkills()       → split on bullets/commas/pipes/etc.
    parseTools()        → regex patterns for "tools: X, Y, Z"
    parseExperience()   → detect job-title-like lines + date ranges
    parseEducation()    → detect university/college names + degree keywords
    parseProjects()     → detect short capitalized project titles
    parseCertifications() → detect cert lines with optional dates
    │
    ▼ Server: user.resumeData = { skills, tools, projects,
                                  experience, education,
                                  certifications, rawText,
                                  parsedAt: now }
    user.resumeFile    = { filename, uploadedAt, filePath }
    user.save()
    │
    ▼ Server: res.json({ message, resumeData, email, phone })
    │
    ▼ Frontend: Display parsed data in ResumePreview
    (User can now run "Generate Resume" to use AI to
     enhance this with their full profile context)
```

### What the Parser Extracts

| Section | How Detected | How Split |
|---------|-------------|-----------|
| **Skills** | Header keyword "skills", "technical skills", "competencies" | `\n , ; • - | ▪ → *` delimiters |
| **Tools** | Regex for "tools:", "technologies:", "frameworks:" prefixes | Comma/semicolon/pipe separated |
| **Experience** | Lines with job title keywords (developer, engineer, manager, analyst, etc.) | Header = new job, rest = description |
| **Education** | Lines with "university", "college", "institute", "school" | Followed by degree keywords (B.Tech, MBA, etc.) |
| **Projects** | Short capitalized lines (2-30 chars) with optional `(tech)` suffix | Each new capitalized short line = new project |
| **Certifications** | Lines in cert section that aren't headers | Date extracted by regex `(20|19)\d{2}` |

---

## 6. Per-Section AI Regeneration

Once a resume is generated, each section can be individually regenerated without regenerating the whole resume.

### Supported Sections

| Section Name | Applies To | What Changes |
|-------------|-----------|-------------|
| `summary` | Both | Rewrites the professional summary paragraph |
| `skills` | Both | Re-categorizes skills into logical groups |
| `experience` | **Professionals only** | Rewrites bullet points with STAR method |
| `experience` | **Students only** | Generates `academicHighlights` instead |
| `certificates` | Both | Reformats certificates in clean display format |

### Flow

```
User clicks "Regenerate" button on a section card
    │
    ▼ Frontend: setRegeneratingSection(section)
    Label in header: "Updating skills..."
    │
    ▼ POST /api/resume/regenerate-section
    Body: { section: "skills", currentResumeData: resumeData }
    │
    ▼ Server: Fresh user fetch from MongoDB
    │
    ▼ Server: getAggregatedResumeData(user)
    ▼ Server: detectUserProfile(userData)
    │
    ▼ Server: Switch on section name → build targeted prompt
    
    CASE 'summary':         → Prompt to rewrite only the summary
                              Returns: { "summary": "..." }
    
    CASE 'skills':          → Prompt to re-categorize known/mastered skills
                              Returns: { "skills": [...], "masteredSkills": [...] }
    
    CASE 'experience' (pro): → Prompt for STAR-method bullet rewrites
                               Returns: { "experience": [...] }
    
    CASE 'experience' (student): → Prompt for academic highlights
                                   Returns: { "academicHighlights": [...] }
    
    CASE 'certificates':    → Prompt to format/clean certificate list
                              Returns: { "certificates": [...] }
    │
    ▼ Server: groq.chat.completions.create()
    Same model: llama-3.3-70b-versatile
    response_format: { type: 'json_object' }
    │
    ▼ Server: res.json({ section, content: aiResponse })
    │
    ▼ Frontend: Merge content into resumeData using spread:
    const updatedData = { ...resumeData, ...content }
    (Since content only contains the regenerated section key,
     this safely patches just that section)
    │
    ▼ Frontend: setResumeData(updatedData)
    ▼ Frontend: saveToLocalStorage(updatedData)
    ▼ Frontend: setRegeneratingSection(null)
    ▼ ResumePreview re-renders with just that section updated
```

---

## 7. Live Preview — ResumePreview Component

**File:** `src/components/resume/ResumePreview.jsx` (23KB)

The `ResumePreview` component receives the `resumeData` object as a prop and renders it as a styled HTML resume that matches the PDF export exactly.

### Props

```jsx
<ResumePreview
  data={resumeData}                    // Full resume data object
  onRegenerate={handleRegenerateSection}  // Callback for section "Regenerate" buttons
  regeneratingSection={regeneratingSection}  // Which section is loading (shows spinner)
/>
```

### What It Renders (Professional Template)

```
┌──────────────────────────────────────┐
│  JOHN DOE                            │  ← Uppercase name, serif font
│  john@email.com • 9876543210         │
│  github.com/john • linkedin.com/john │
├──────────────────────────────────────┤
│  PROFESSIONAL SUMMARY                │  ← Section titles: uppercase, border-bottom
│  3-4 sentence summary text           │
├──────────────────────────────────────┤
│  EXPERIENCE                          │
│  Google                   Jan 2023   │  ← Company (bold) + Duration (right)
│  Senior Engineer (italic)            │  ← Role in italic below
│  • STAR bullet 1                     │
│  • STAR bullet 2                     │
│  • STAR bullet 3                     │
├──────────────────────────────────────┤
│  TECHNICAL SKILLS                    │
│  Languages: Python, TypeScript, Go   │  ← Categories in 2-column grid
│  Frameworks: React, Django, Express  │
│  Tools: Docker, Git, AWS             │
├──────────────────────────────────────┤
│  EDUCATION              │ CERTS      │  ← Two-column for compactness
│  MIT                    │ AWS Cert   │
│  B.Tech Computer Science│ 2023       │
│  2024                   │            │
└──────────────────────────────────────┘
```

### Student Template Differences

When `profileType === 'student'`, the following changes apply:
- **Summary** focuses on academic background and passion for learning (no mention of "years of experience")
- **Experience** section is replaced with **Academic Highlights**:
  ```
  ACADEMIC HIGHLIGHTS
  • Project-Based Learning: Built X using Y
  • Relevant Coursework: Data Structures, ML
  ```
- **Projects** section is given more prominence since it's the student's strongest section
- **Mastered Skills badges** shown prominently

### Blur Effect During Generation

```jsx
<div className={`transition-all duration-500 ${
  isGenerating ? 'opacity-50 blur-[1px]' : 'opacity-100 blur-0'
}`}>
  <ResumePreview ... />
</div>
```

The preview blurs while the AI is working, then fades in cleanly with a 500ms CSS transition.

---

## 8. PDF Export — How It Works

Clicking **"Export PDF"** in the header triggers a multi-step server-side process.

### Frontend Flow

```js
const handleExport = async () => {
  setIsExporting(true)
  const response = await axios.post(`/api/resume/export/pdf`,
    { resumeData },                         // Send current resume state
    { responseType: 'blob' }                // Expect binary PDF data back
  )
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${fullName}_Resume.pdf`)
  document.body.appendChild(link)
  link.click()                              // Trigger browser download
  link.remove()
}
```

### Backend Flow

```
POST /api/resume/export/pdf
  { resumeData: { fullName, email, ... } }
    │
    ▼ Server: exportController.exportResume()
    │
    ▼ Server: exportService.generateProfessionalHtml(resumeData)
    Builds a complete self-contained HTML string with:
    - Inline CSS only (no Tailwind, no external libraries)
    - Merriweather font loaded from Google Fonts
    - A4 dimensions: 595px × 842px
    - All sections: header, summary, experience, skills, education, certs
    Returns HTML string
    │
    ▼ Server: exportService.generatePdfFromHtml(htmlContent)
    Uses Puppeteer (headless Chrome):
      browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
      page = await browser.newPage()
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
      await page.emulateMediaType('screen')    ← Match what user sees
      pdf = await page.pdf({
         format: 'A4',
         printBackground: true,
         margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
      })
      await browser.close()
    Returns PDF buffer
    │
    ▼ Server: res.contentType('application/pdf')
               res.send(pdfBuffer)
    │
    ▼ Frontend: Browser downloads the PDF
```

### PDF Styling Details

The exported PDF uses **inline CSS** (no Tailwind), written specifically for Puppeteer rendering:

| Element | Style |
|---------|-------|
| Font | Merriweather (serif), from Google Fonts |
| Name | 36px, uppercase, `#0f172a` (near-black) |
| Contact | 10px, uppercase, `#64748b` (slate) |
| Section titles | 12px, `font-weight: 900`, uppercase, `letter-spacing: 0.2em` |
| Body text | 11-14px, `#334155` |
| Separator | `border-bottom: 1px solid #e2e8f0` |
| Page size | 595×842px (exact A4), 48px padding |

> **Why Puppeteer?** It's the most accurate way to produce PDFs that exactly match the browser preview. PDFKit and similar libraries require manual layout, but Puppeteer renders actual HTML/CSS.

---

## 9. Resume Versions (Save & Load)

### Saving a Version

```
POST /api/resume/save-version
Body: { versionName, template, targetRole, content }
    │
    ▼ Server: Check req.user.resumeVersions.length >= 2
    If ≥ 2: Return 403 "Free tier limit: max 2 versions"
    │
    ▼ Server: user.resumeVersions.push({
        versionName, template, targetRole, content,
        createdAt: new Date(),
        lastModified: new Date()
      })
    user.save()
    │
    ▼ Server: Return { message, versions[] }
```

### Loading Versions

```
GET /api/resume/versions
    │
    ▼ Server: res.json({ versions: req.user.resumeVersions })
```

### Version Structure

Each saved version stores the full resume `content` object:
```js
{
  versionName: "V2 - Senior Role",
  template: "professional",
  targetRole: "Senior Software Engineer",
  content: {
    summary: "...",
    experience: [...],
    education: [...],
    skills: [...],
    projects: [...]
  },
  createdAt: Date,
  lastModified: Date
}
```

> **Free tier limit:** Maximum **2 versions** per user. The 3rd save returns HTTP 403 with an upgrade prompt message.

---

## 10. Skill Gap Analysis (From Uploaded Resume)

After uploading a PDF resume, users can run a skill gap analysis comparing their resume skills to their target job role's industry requirements.

### Flow

```
POST /api/resume/analyze
Body: { userId }
    │
    ▼ Server: Find user by userId
    Validate: resumeData.skills not empty
    Validate: careerInfo.targetJobRole is set
    │
    ▼ Server: resumeAnalyzerService.getIndustrySkills(targetJobRole)
    Check cache (industrySkillCache map)
    If miss:
      Search GitHub API for repos matching the role:
        - Queries: "frontend developer project", "frontend developer template", etc.
        - Scan each repo's .topics[], .language, .description
        - Match against known skill taxonomy
        - Sort by frequency of appearance
        - Cache result by jobRole key
    Returns: top 50 skills most associated with that role on GitHub
    Fallback (if no GitHub token): return hardcoded defaultSkillsForRole()
    │
    ▼ Server: resumeAnalyzerService.analyzeSkillGap(userSkills, jobRole)
    normalizedUserSkills = normalize(user.resumeData.skills)
    matchingSkills = userSkills ∩ industrySkills
    missingSkills  = industrySkills − userSkills
    suggestedSkills = top 10 of missingSkills
    matchPercentage = (matching.length / industry.length) * 100
    │
    ▼ Server: getLearningRecommendations(analysis)
    critical     = suggestedSkills[0..4]  (top 5)
    important    = suggestedSkills[5..9]  (next 5)
    nice_to_have = related skills via skillRelations map
    │
    ▼ Server: generateRoadmap(analysis)
    Distributes suggestedSkills across 4 phases:
    Phase 1: Foundation (0-2 months)
    Phase 2: Intermediate (2-4 months)
    Phase 3: Advanced (4-6 months)
    Phase 4: Specialization (6+ months)
    │
    ▼ Server: user.skillAnalysis = { matchingSkills, missingSkills,
                                     suggestedSkills, industryDemandSkills,
                                     analysisDate }
              user.save()
    │
    ▼ Server: res.json({ analysis, recommendations, roadmap })
    │
    ▼ Frontend: SkillGapAnalysis component displays:
    ✅ Matching Skills (green badges)
    ❌ Missing Skills (red list)
    💡 Suggested Skills (blue list)
    📈 Match Percentage progress bar
```

### Skill Matching Logic

The `skillMatch()` function normalizes both skills before comparing:

```js
skillMatch(skill1, skill2) {
  const normalize = (s) => s.toLowerCase().replace(/[.\-\s]/g, '')
  return normalize(skill1) === normalize(skill2)
}
// "Node.js" and "nodejs" both become "nodejs" → match!
// "React" and "react" both become "react" → match!
```

---

## 11. Data Persistence — localStorage Cache

The Resume Builder uses **localStorage** to persist the last generated resume across page reloads, avoiding repeat API calls.

### Key used: `lastGeneratedResume`

### Save

```js
const saveToLocalStorage = (data) => {
  localStorage.setItem('lastGeneratedResume', JSON.stringify(data))
}
// Called after: handleGenerate(), handleRegenerateSection()
```

### Load on Mount

```js
const fetchInitialData = async () => {
  // 1. Fetch fresh profile data from API (always)
  const apiData = await axios.get('/api/resume/data')

  // 2. Check localStorage for a saved resume
  const savedResume = localStorage.getItem('lastGeneratedResume')

  if (savedResume) {
    // Merge: stored content + fresh contact details from API
    setResumeData({
      ...JSON.parse(savedResume),      // Stored AI content (summary, skills, etc.)
      fullName: apiData.fullName,       // Always refresh from DB
      email: apiData.email,
      phoneNumber: apiData.phoneNumber,
      location: ...,
      github: apiData.github,
      linkedin: apiData.linkedin,
      portfolio: apiData.portfolio
    })
  } else {
    // No saved resume: just populate with basic profile structure
    setResumeData({ fullName, email, education, experience, masteredSkills, knownSkills })
  }
}
```

### Clear

```js
const handleClearResume = () => {
  if (confirm('Clear saved resume and start fresh?')) {
    localStorage.removeItem('lastGeneratedResume')
    setResumeData({ /* empty defaults */ })
  }
}
```

> **Benefit:** If the user navigates away and returns, their last generated resume is instantly available without another API or AI call.

---

## 12. Backend API Reference (All Resume Endpoints)

All endpoints under `/api/resume/` require `Authorization: Bearer <JWT>` header.

### Route Order (Critical!)
All specific named routes are registered **before** the wildcard `/:userId` routes to prevent Express routing conflicts.

| # | Method | Path | Controller/Handler | Purpose |
|---|--------|------|--------------------|---------|
| 1 | POST | `/api/resume/upload` | `uploadAndParseResume` | Upload PDF → parse → save to `user.resumeData` |
| 2 | POST | `/api/resume/analyze` | `analyzeResume` | Run skill gap analysis using GitHub API |
| 3 | GET | `/api/resume/data` | inline in route | Aggregate all user data for resume builder |
| 4 | POST | `/api/resume/generate` | inline in route | AI-generate full resume JSON (Groq LLaMA) |
| 5 | POST | `/api/resume/enhance-text` | `enhanceResumeText` | Enhance specific text snippet with AI |
| 6 | POST | `/api/resume/regenerate-section` | inline in route | AI-regenerate one section of resume |
| 7 | POST | `/api/resume/export/:format` | `exportResume` | Generate PDF or DOCX binary file |
| 8 | GET | `/api/resume/versions` | `getResumeVersions` | List saved resume versions |
| 9 | POST | `/api/resume/save-version` | `saveResumeVersion` | Save named version snapshot |
| 10 | GET | `/api/resume/:userId` | `getResumeData` | Get raw parsed resume data |
| 11 | PUT | `/api/resume/:userId` | `updateResumeData` | Manually update resume data fields |
| 12 | DELETE | `/api/resume/:userId` | `deleteResume` | Delete resume file + clear data |
| 13 | GET | `/api/resume/:userId/analysis` | `getSkillAnalysis` | Get last saved skill analysis |

### Request / Response Details

#### `GET /api/resume/data`
```json
Response: {
  "fullName": "John Doe",
  "email": "john@email.com",
  "phoneNumber": "9876543210",
  "location": { "city": "Bangalore", "state": "Karnataka", "country": "India" },
  "github": "https://github.com/johndoe",
  "linkedin": "https://linkedin.com/in/johndoe",
  "portfolio": "https://johndoe.dev",
  "education": [{ "institution": "MIT", "degree": "B.Tech", "field": "CSE", "year": "2024" }],
  "experience": [{ "company": "Google", "role": "Intern", "duration": "Jun 2023 - Dec 2023", "description": "..." }],
  "masteredSkills": [{ "skill": "React", "score": 95 }],
  "knownSkills": ["Python", "JavaScript"],
  "certificates": [{ "name": "AWS Cloud Practitioner", "issuer": "Amazon", "year": "2023" }],
  "projects": [{ "title": "Chat App", "description": "...", "techStack": ["React", "Node.js"] }],
  "targetJobRole": "Full Stack Developer"
}
```

#### `POST /api/resume/generate`
No request body needed.
```json
Response: {
  "message": "Resume generated successfully",
  "resume": {
    "summary": "string",
    "education": [...],
    "experience": [...],   // empty for students
    "academicHighlights": [...],  // only for students
    "skills": [{ "category": "Languages", "items": ["Python"] }],
    "masteredSkills": [{ "name": "Python" }],
    "projects": [...],
    "certificates": [...]
  },
  "profileType": "student" | "professional"
}
```

#### `POST /api/resume/regenerate-section`
```json
Request: {
  "section": "summary" | "skills" | "experience" | "certificates",
  "currentResumeData": { /* current resumeData state */ }
}
Response: {
  "section": "summary",
  "content": { "summary": "Rewritten summary text..." }
}
```

#### `POST /api/resume/export/pdf`
```json
Request: { "resumeData": { /* full resumeData object */ } }
Response: Binary PDF stream
Content-Type: application/pdf
```

#### `POST /api/resume/save-version`
```json
Request: {
  "versionName": "V1 - Data Engineer",
  "template": "professional",
  "targetRole": "Data Engineer",
  "content": { /* resumeData content */ }
}
Response: {
  "message": "Resume version saved successfully",
  "versions": [...]
}
// Error if >= 2 versions already:
// 403: { "error": "Free tier limit reached. Max 2 resume versions allowed." }
```

---

## 13. AI Prompting — Student vs Professional

The `detectUserProfile()` function determines which prompt template to use:

```js
export function detectUserProfile(data) {
  const hasExperience = data.experience?.length > 0
  const isStudent = !hasExperience   // No experience = student/fresher
  return { isStudent, hasExperience, hasSkills }
}
```

### Student/Fresher Prompt (key instructions)

```
You are an expert ATS-optimized resume writer specializing in student and fresher resumes.

CRITICAL INSTRUCTIONS:
1. This is a STUDENT/FRESHER resume. The user has NO professional work experience.
2. NEVER fabricate work experience, companies, job titles, dates, or skills.
3. If a field has no data, return an empty array. Do NOT invent placeholder content.

CONTENT GUIDELINES:
- Summary: 3-4 sentences focusing on academic background, passion for [targetJobRole],
  learning trajectory. DO NOT mention "years of experience".
- Education: Use the provided data as-is. This is their strongest section.
- Academic Highlights: 2-3 items based on projects/coursework. If no data → empty array.
- Skills: Categorize knownSkills + masteredSkills into logical groups.
- Projects: Include ALL projects. Critical for freshers.
- Certificates: Include all to strengthen profile.

TONE: Ambitious, growth-oriented, academic, emphasizing potential.
```

### Professional Prompt (key instructions)

```
You are an expert ATS-optimized resume writer for experienced professionals.

CRITICAL SAFETY INSTRUCTIONS:
1. NEVER fabricate or hallucinate experience, companies, dates, or skills.
2. Only use information explicitly provided in the USER DATA.

CONTENT GUIDELINES:
- Summary: 3-4 sentences tailored to [targetJobRole],
  highlight years of experience, key achievements, value proposition.
- Experience: For EACH entry, expand into 3 high-impact STAR-method bullet points
  separated by \n. Use action verbs. Quantify achievements.
- Skills: Categorize into: Programming Languages, Frameworks, Tools, Cloud/DevOps, etc.
- Projects: Enhanced descriptions highlighting technical complexity and impact.

TONE: Results-driven, professional, achievement-focused, measurable impact.
```

### AI Response Format (both)

Both prompts use:
```js
groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  response_format: { type: 'json_object' }  // Forces valid JSON output
})
```

---

## 14. Data Aggregation — getAggregatedResumeData()

This function (`server/services/resumeGeneratorService.js`) maps the complex User schema to a clean object sent to the AI.

### Field Mappings

| Resume Field | MongoDB Source | Transformation |
|-------------|---------------|----------------|
| `fullName` | `user.fullName` | Direct |
| `email` | `user.email` | Direct |
| `phoneNumber` | `user.phoneNumber` | Direct |
| `location` | `user.personalDetails.location` | `{ city, state, country }` object |
| `github` | `user.socialLinks.github` | Direct |
| `linkedin` | `user.socialLinks.linkedin` | Direct |
| `portfolio` | `user.socialLinks.portfolio` | Direct |
| `education[]` | `user.education[]` | `college → institution`, `specialization → field`, `endYear → year` |
| `experience[]` | `user.experience[]` | `responsibilities → description`, dates formatted to `"Jun 2023 - Dec 2023"` |
| `masteredSkills[]` | `user.profile.completedSkills[]` | Filter `score >= 90` |
| `knownSkills[]` | `user.profile.currentSkills[]` | Direct |
| `certificates[]` | `user.certifications[]` | Filter `useInResume !== false`, `title → name`, `issueYear → year` |
| `projects[]` | `user.resumeData.projects[]` | Direct (from parsed resume) |
| `targetJobRole` | `user.careerInfo.targetJobRole` OR `user.profile.targetJob` | Fallback chain |

### Validation Logging

Every call to `getAggregatedResumeData()` emits detailed console logs:
```
📊 Resume Data Validation:
   Full Name: John Doe
   Email: john@email.com
   Location: ✅
   Education: 2 entries
   Experience: 1 entries
   Mastered Skills: 3 skills (score >= 90)
   Known Skills: 7 skills
   Certificates: 2 certificates
   Projects: 3 projects
   Target Role: Full Stack Developer
⚠️  WARNING: No experience entries found!   ← if applicable
```

---

## 15. PDF Parsing — How Resume Upload Works

The `resumeParserService.js` uses a 6-step extraction pipeline:

### Step 1: Read PDF
```js
const pdfBuffer = await fs.readFile(filePath)
const data = await pdfParse(pdfBuffer)        // pdf-parse library
rawText = data.text                            // Plain text string
```

### Step 2: Text Normalization
```js
normalizeWhitespace(rawText)
→ Collapses multiple spaces/newlines
→ Removes control characters
→ Trims each line

getCleanLines(normalizedText)
→ Returns array of non-empty trimmed strings
```

### Step 3: Section Detection
```js
detectSections(normalizedText)
→ Returns: { SKILLS: 12, EXPERIENCE: 28, EDUCATION: 47, PROJECTS: 52, CERTIFICATIONS: 60 }
(Line indices where each section header was found)
```

### Step 4: Section Extraction
Each section's lines are isolated using the next section's start index as the boundary:
```js
const sectionText = lines.slice(sectionStart + 1, nextSectionStart)
```

### Step 5: Content Parsing

**Skills:**
- Split on: `\n , ; • - | ▪ → *`
- Filter: length > 1, length < 60
- Remove header words: "technical skills", "skills", "tools"

**Experience:**
- Header line detection: contains job keywords (developer/engineer/manager/analyst/intern/lead/architect)
- Date detection: `Jan 2023 - Dec 2023` patterns
- Company/role splitting: `company - role` or `role | company` patterns
- Heuristic: if first part contains "Inc/LLC/Corp/Ltd/pvt" → it's the company

**Education:**
- Institution detection: "university/college/institute/school/academy"
- Degree detection: "B.Tech/M.Tech/MBA/B.S/M.S/Ph.D" keywords
- Year extraction: `\b(20|19)\d{2}\b` regex

**Projects:**
- Header: short (2-30 chars) capitalized lines
- Tech stack: extracted from `(React, Node.js)` parentheses, or auto-detected from description

### Step 6: Save to Database
```js
user.resumeData = { skills, tools, projects, experience, education, certifications, rawText, parsedAt }
user.resumeFile = { filename, uploadedAt, filePath }
await user.save()
```

---

## 16. PDF Export HTML Template

The `generateProfessionalHtml(data)` function builds a pure inline-CSS HTML document:

### Layout Dimensions
```css
.container {
  width: 595px;        /* A4 width in pixels at 72dpi */
  min-height: 842px;   /* A4 height */
  padding: 48px;
}
```

### Color Palette
| Element | Color |
|---------|-------|
| Name & headings | `#0f172a` (slate-900) |
| Section titles | `#0f172a` |
| Body text | `#334155` (slate-700) |
| Italic/secondary | `#475569` (slate-600) |
| Meta information | `#64748b` (slate-500) |
| Light metadata | `#94a3b8` (slate-400) |
| Dividers | `#e2e8f0` (slate-200) |

### Special Elements
- **Contact row:** Centered, uppercase, 10px, dots (`•`) separating items
- **URLs cleaned:** `https://` prefix stripped (shows `github.com/user` not full URL)
- **Experience description:** `white-space: pre-line` — allows AI's `\n` bullet points to render as line breaks
- **Skills grid:** CSS Grid, 2 columns, `category:` bold prefix + items in slate color
- **Education/Certs:** Side-by-side 2-column grid

---

## 17. DOCX Export

The `generateDocx()` function uses the `docx` npm library to build a Word document.

### Structure Built

```js
new Document({
  sections: [{
    children: [
      // Header
      Paragraph(fullName, HeadingLevel.HEADING_1, CENTER)
      Paragraph(`${email} | ${phone} | ${location}`, CENTER)

      // Summary
      Paragraph("PROFESSIONAL SUMMARY", HEADING_2)
      Paragraph(summary)

      // Skills
      Paragraph("SKILLS", HEADING_2)
      ...skills.map(group =>
        Paragraph: bold(category + ": ") + regular(items.join(", "))
      )

      // Experience
      Paragraph("EXPERIENCE", HEADING_2)
      ...experience.flatMap(exp => [
        Paragraph: bold(company) + italic(" | " + role) + tab + bold(duration)
        Paragraph(description)
      ])

      // Education
      Paragraph("EDUCATION", HEADING_2)
      ...education.map(edu =>
        Paragraph: bold(institution) + ` - ${degree}, ${field} (${year})`
      )

      // Projects
      Paragraph("PROJECTS", HEADING_2)
      ...projects.flatMap(proj => [
        Paragraph: bold(title) + italic(" | " + techStack.join(", "))
        Paragraph(description)
      ])
    ]
  }]
})
// Packed as Buffer via Packer.toBuffer(doc)
```

```
Response:
  Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
  Binary DOCX buffer → browser downloads as .docx file
```

---

## 18. Complete Data Flow Diagram

```
MongoDB User Document
        │
        │ GET /api/resume/data
        ▼
getAggregatedResumeData(user)
        │
        │ Structured userData object
        ▼
┌───────────────────────────────────────────────┐
│         Groq LLaMA 3.3 70B Versatile          │
│   (student prompt) OR (professional prompt)   │
└───────────────────────────────────────────────┘
        │
        │ JSON resume response
        ▼
Frontend: sanitizeAndMerge(aiResponse, userRawData)
        │
        │ Final resumeData state
        ├──────────────────────────────┐
        ▼                              ▼
ResumePreview (live HTML)      localStorage cache
(react component)              "lastGeneratedResume"
        │
        │ [Export PDF] button
        ▼
POST /api/resume/export/pdf
        │
        ▼
generateProfessionalHtml(resumeData)  ← pure inline CSS HTML
        │
        ▼
Puppeteer(page.setContent → page.pdf)  ← headless Chrome
        │
        ▼
Binary PDF buffer → browser download
```

---

## 19. Error Handling

### Frontend Errors

| Scenario | Behavior |
|----------|----------|
| AI generation fails | `alert('Failed to generate resume content. Please try again.')` |
| Section regeneration fails | `alert('Failed to regenerate <section>. Please try again.')` |
| Export fails | `alert('Failed to export PDF.')` |
| localStorage parse error | Silently ignores, continues with fresh data |
| API data fetch fails | Console error, `isLoadingData` stops (shows empty state) |

### Backend Errors

| Route | Error | Response |
|-------|-------|----------|
| `/upload` | No file | `400: 'No resume file uploaded'` |
| `/upload` | File > 5MB | `400: 'File size exceeds 5MB limit'` |
| `/upload` | Not PDF | `400: 'Only PDF files are allowed'` |
| `/upload` | Parse fails | `500: 'Parsing failed: <message>'` |
| `/generate` | No GROQ_API_KEY | `500: 'Groq API key not configured'` |
| `/generate` | AI fails | `500: 'Generation failed: <message>'` |
| `/analyze` | No resume | `400: 'No resume data found. Please upload a resume first.'` |
| `/analyze` | No target role | `400: 'Target job role not set. Please update your profile.'` |
| `/save-version` | >= 2 versions | `403: 'Free tier limit reached. Max 2 resume versions allowed.'` |
| `/export/pdf` | No content | `400: 'HTML content or Resume Data required'` |
| Any auth | Invalid token | `401: 'Authentication failed: <reason>'` |
| Any auth | Token expired | `401: 'Authentication failed: Token expired'` |

---

## 20. Key Design Decisions

### 1. AI Never Provides Personal Contact Info
All contact info (name, email, phone, location, Github, LinkedIn) is always sourced from the user's database record, never from the AI response. This prevents hallucinated contact details in the resume.

### 2. Merge-Not-Replace Strategy
When merging AI output with existing `resumeData`, sections are only replaced if the AI returned non-empty content. This means partial generation failures don't wipe out working data.

### 3. Memory-Based File Upload
Multer uses `memoryStorage()` — files land in `req.file.buffer` (RAM) and are only written to disk by the controller after validation passes. This prevents orphaned temp files.

### 4. Route Order Protection
All named specific routes (`/data`, `/generate`, `/upload`, `/versions`, etc.) are registered **before** the wildcard `/:userId` routes. Without this order, Express would match `/data` as a userId param, breaking those endpoints.

### 5. localStorage Persistence
Resume data is cached in localStorage after every generation or section regeneration. On mount, this is loaded (with fresh contact info merged in). This provides instant page re-entry without re-calling the AI.

### 6. Student vs Professional Branching
Profile type detection (`isStudent = experience.length === 0`) drives two completely separate AI prompts, response structures, and UI rendering paths. Students get Academic Highlights instead of Experience.

### 7. Free Tier Version Limit
Version saving is hard-capped at 2 per user at the server level (not frontend), returning HTTP 403 with a friendly upgrade message. This is enforced inside `saveResumeVersion()` in the controller.

### 8. Puppeteer Inline CSS
The PDF template uses only inline CSS (no Tailwind class references) because Puppeteer's headless Chrome doesn't load the frontend's CSS bundles. The exported PDF closely matches the live preview through carefully replicated styles.

---

*Documentation written from source: `ResumeBuilder.jsx`, `routes/resume.js`, `controllers/resumeController.js`, `services/resumeGeneratorService.js`, `services/resumeParserService.js`, `services/resumeAnalyzerService.js`, `services/exportService.js`*
