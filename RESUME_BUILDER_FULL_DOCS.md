# Resume Builder — Complete Technical Documentation

> **Last Updated:** March 10, 2026  
> **Status:** Fully Operational (Multi-page A4 PDF Export Supported)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Frontend — Pages & Components](#frontend)
4. [Backend — Routes, Controllers, Services](#backend)
5. [Database — User Model](#database)
6. [AI Integration (Groq)](#ai-integration)
7. [Resume Templates (3 Templates)](#templates)
8. [Data Flow — End to End](#data-flow)
9. [API Reference](#api-reference)
10. [State Management & LocalStorage Persistence](#state-management)
11. [PDF Export Pipeline](#pdf-export)
12. [Current Implementation Status](#current-status)

---

## Overview

The Resume Builder is a full-stack feature of the CareerTracker application that allows users to:

- Automatically generate a professional, ATS-optimized resume using AI (Groq LLM)
- Customize resume sections (Experience, Education, Achievements, Languages, Interests)
- Choose from **3 resume templates** with **16 theme colors**
- Preview the resume live in the browser
- Export the resume as a **multi-page A4 PDF**
- Persist resume data across sessions via **user-specific localStorage**

---

## Architecture

```
Browser (React + Vite)
        ↓  HTTP (Axios)
Express API Server (Node.js + ES Modules)
        ↓
MongoDB (Mongoose)  +  Groq AI API  +  Puppeteer (PDF)
```

| Layer            | Technology                          |
|------------------|--------------------------------------|
| Frontend         | React 18, Vite, TailwindCSS, Axios   |
| Backend          | Node.js, Express, ES Modules         |
| Database         | MongoDB, Mongoose                    |
| AI               | Groq SDK (llama-3.3-70b-versatile)   |
| PDF Generation   | Puppeteer (headless Chromium)        |
| Authentication   | JWT (Bearer token, localStorage)     |
| File Upload      | Multer (PDF, 5MB limit, memory)      |

---

## Frontend

### Entry Point: `src/pages/ResumeBuilder.jsx`

The main page component. All resume builder logic flows through here.

#### State Variables

| State                | Type      | Description                                     |
|----------------------|-----------|-------------------------------------------------|
| `resumeData`         | Object    | Full resume data object (generated + edited)    |
| `userRawData`        | Object    | Raw profile data from `/api/resume/data`        |
| `selectedTemplate`   | String    | `'professional'` / `'modern-sidebar'` / `'balanced'` |
| `themeColor`         | String    | Hex color string (e.g., `'#4F46E5'`)           |
| `isGenerating`       | Boolean   | AI generation loading state                     |
| `isExporting`        | Boolean   | PDF export loading state                        |
| `showExperienceForm` | Boolean   | Toggle experience edit drawer                   |
| `showAchievementForm`| Boolean   | Toggle achievements edit drawer                 |
| `showEducationForm`  | Boolean   | Toggle education edit drawer                    |
| `showInterestsForm`  | Boolean   | Toggle interests edit drawer                    |
| `showLanguagesForm`  | Boolean   | Toggle languages edit drawer                    |

#### `resumeData` Object Shape

```js
{
  versionName: 'My Professional Resume',
  template: 'professional',
  summary: '',            // AI-generated or custom
  fullName: '',           // from user profile
  email: '',
  phoneNumber: '',
  location: '',           // "City, State, Country"
  github: '',
  linkedin: '',
  portfolio: '',
  contact: {
    email: '',
    phone: '',
    linkedin: '',
    github: ''
  },
  experience: [
    { company, role, duration, description, jobTitle }
  ],
  education: [
    { institution, degree, field, startYear, endYear }
  ],
  skills: [
    { category: 'Mastered Skills', items: [] },
    { category: 'Programming Languages', items: [] }
  ],
  masteredSkills: [{ name: '' }],
  projects: [
    { projectName, title, description, techStack: [] }
  ],
  certificates: [
    { title, name, issuer, year }
  ],
  achievements: [
    { heading, description }
  ],
  interests: ['Dancing', 'Designing'],
  languages: ['English', 'Hindi'],
  academicHighlights: [
    { title, description }
  ]
}
```

#### Key Functions

| Function                    | Description                                                 |
|-----------------------------|-------------------------------------------------------------|
| `fetchInitialData()`        | Fetches profile from `/api/resume/data`, loads localStorage |
| `handleGenerate()`          | POSTs to `/api/resume/generate`, receives AI resume JSON    |
| `handleRegenerateSection()` | POSTs to `/api/resume/regenerate-section` with section name |
| `handleSectionEdit()`       | Inline update from template edits, saves to localStorage    |
| `handleExport()`            | POSTs to `/api/resume/export/pdf`, downloads PDF blob       |
| `handleClearResume()`       | Clears localStorage and resets resumeData state             |
| `saveToLocalStorage()`      | Saves resumeData per-user key: `resumeData_<userId>`        |
| `handleSaveExperience()`    | Updates `experience[]` in resumeData + saves                |
| `handleSaveAchievements()`  | Updates `achievements[]` in resumeData + saves              |
| `handleSaveEducation()`     | Updates `education[]` in resumeData + saves                 |
| `handleSaveInterests()`     | Updates `interests[]` in resumeData + saves                 |
| `handleSaveLanguages()`     | Updates `languages[]` in resumeData + saves                 |
| `handleTemplateChange()`    | Changes `selectedTemplate` + persists to localStorage       |
| `handleColorChange()`       | Changes `themeColor` + persists to localStorage             |

#### Layout

```
┌──────────────────────────────────────────────┐
│  Top Bar: "Resume Builder" + Export PDF Btn  │
├──────────────┬───────────────────────────────┤
│  LEFT PANEL  │  RIGHT PANEL: Resume Preview  │
│              │                               │
│  [Sections]  │  Live template render         │
│  Experience  │  (ProfessionalClassic,        │
│  Education   │   ModernSidebar,              │
│  Achievements│   BalancedTwoColumn)          │
│  Interests   │                               │
│  Languages   │                               │
│              │                               │
│  [AI Generate│                               │
│   button]    │                               │
│              │                               │
│  [Templates] │                               │
│  [Colors]    │                               │
└──────────────┴───────────────────────────────┘
```

---

### Component Tree

```
ResumeBuilder (page)
├── ResumePreview
│   ├── ProfessionalClassicTemplate
│   ├── ModernSidebarTemplate
│   └── BalancedTwoColumnTemplate
├── ExperienceForm        (modal drawer)
├── AchievementForm       (modal drawer)
├── EducationForm         (modal drawer)
├── InterestsForm         (modal drawer)
├── LanguagesForm         (modal drawer)
├── TemplateSelector
├── ThemeColorPicker
└── ValidationChecklist
```

---

### `src/components/ResumePreview.jsx`

Router component that delegates to the correct template:

```js
switch (selectedTemplate) {
  case 'professional':      → ProfessionalClassicTemplate
  case 'modern-sidebar':    → ModernSidebarTemplate
  case 'balanced':          → BalancedTwoColumnTemplate
  default:                  → ProfessionalClassicTemplate
}
```

Props: `{ data, selectedTemplate, themeColor, onSectionEdit, onRegenerate, regeneratingSection }`

---

### `src/components/resume/TemplateSelector.jsx`

Renders 3 template buttons with icons. Calls `onTemplateChange(id)` on click.

| Template ID       | Name              | Description              | Icon        |
|-------------------|-------------------|--------------------------|-------------|
| `professional`    | Professional      | Traditional single-column | Layout      |
| `modern-sidebar`  | Modern Sidebar    | Two-part sidebar design   | Sidebar     |
| `balanced`        | Balanced          | Efficient section layout  | Grid3x3     |

---

### `src/components/resume/ThemeColorPicker.jsx`

16 accent colors in a 4×4 grid.

**Original Colors:** Slate, Indigo, Purple, Blue, Green, Red, Amber, Teal  
**Lighter Shades:** Slate Light, Indigo Light, Purple Light, Blue Light, Green Light, Red Light, Amber Light, Teal Light

---

### Form Components (`src/components/resume/`)

| Component           | Manages             | Fields                                       |
|---------------------|---------------------|----------------------------------------------|
| `ExperienceForm`    | `experience[]`      | Company, Job Title, Duration, Description    |
| `AchievementForm`   | `achievements[]`    | Heading, Description                         |
| `EducationForm`     | `education[]`       | Institution, Degree, Field, Start/End Year   |
| `InterestsForm`     | `interests[]`       | Free-text interests (comma-separated or list)|
| `LanguagesForm`     | `languages[]`       | Language name entries                        |

---

## Backend

### Server Entry: `server/index.js`

Express server on port `5000`. Mounts all routes under `/api/`.

### Resume Routes: `server/routes/resume.js`

All routes require **JWT Bearer token** via inline `authMiddleware`.

#### Auth Middleware (inline in resume.js)

```js
const token = req.header('Authorization')?.replace('Bearer ', '')
const decoded = jwt.verify(token, process.env.JWT_SECRET)
const user = await User.findById(decoded.userId)
req.user = user
```

#### File Upload Config (Multer)

```js
storage: memoryStorage()       // In-memory, no disk write
fileFilter: PDF only           // Rejects non-PDF
limits: { fileSize: 5MB }
```

---

### Resume Controller: `server/controllers/resumeController.js`

| Exported Function       | Route             | Description                                     |
|-------------------------|-------------------|-------------------------------------------------|
| `uploadAndParseResume`  | POST /upload      | Save PDF to disk, parse text, update user model |
| `analyzeResume`         | POST /analyze     | Skill gap analysis vs target job role           |
| `getResumeData`         | GET /:userId      | Fetch stored resume data for a user             |
| `updateResumeData`      | PUT /:userId      | Update stored resume data                       |
| `deleteResume`          | DELETE /:userId   | Remove resume file and data                     |
| `getSkillAnalysis`      | GET /skills/:id   | Skill category breakdown                        |
| `generateResumeData`    | POST /generate    | AI-assisted resume content generation (legacy)  |
| `enhanceResumeText`     | POST /enhance-text| Improve text using AI                           |
| `exportResume`          | POST /export      | Export to PDF/DOCX                              |
| `enhanceDescription`    | POST /enhance-description | AI polishing for descriptions          |

---

### Resume Generator Service: `server/services/resumeGeneratorService.js`

#### `getAggregatedResumeData(user)`

Transforms a raw MongoDB User document into a flat resume-ready object:

```
user.fullName                  → fullName
user.email                     → email, contact.email
user.phoneNumber               → phoneNumber, contact.phone
user.socialLinks.github        → github, contact.github
user.socialLinks.linkedin      → linkedin, contact.linkedin
user.socialLinks.portfolio     → portfolio
user.personalDetails.location  → location { city, state, country }
user.education[]               → education[] (mapped: college→institution, specialization→field, endYear→year)
user.experience[]              → experience[] (mapped: responsibilities→description, dates→duration string)
user.profile.completedSkills[] → masteredSkills[] (all, no score filter)
user.profile.currentSkills[]   → knownSkills[]
user.certifications[]          → certificates[] (filter: useInResume=true, polishedTitle used)
user.projects[]                → projects[] (deduplicated with resumeData.projects)
user.careerInfo.targetJobRole  → targetJobRole
```

#### `detectUserProfile(data)`

```js
{ isStudent: !hasExperience, hasExperience, hasSkills }
```
Determines which AI prompt template to use (student vs professional).

---

### AI Resume Generation: `POST /api/resume/generate`

**Model:** `llama-3.3-70b-versatile` (Groq)  
**Response format:** `json_object`

**Student/Fresher Prompt** generates:
- Summary (academic, growth-oriented, no fabricated experience)
- Education (as-is from user data)
- Academic Highlights (projects, coursework, competition if available)
- Skills (categorized, Mastered Skills section FIRST)
- Projects (from user data only)
- Certificates (from `useInResume=true` entries)
- Contact (returned exactly as provided — no hallucination)

**Professional Prompt** generates:
- Summary (results-driven, tailored to target role)
- Experience (STAR-method bullets, 3 per role)
- Education
- Skills (categorized, Mastered Skills section FIRST)
- Projects (enhanced descriptions)
- Certificates
- Contact (returned exactly as provided)

**Contact-First Protection** (in frontend after generation):
```js
// Always overwrite AI contact with fresh profile data
contact: {
  email: userRawData.email,
  phone: userRawData.phoneNumber,
  linkedin: userRawData.linkedin,
  github: userRawData.github
}
```

---

### AI Enhancement Service: `server/services/aiEnhancementService.js`

**Model:** `llama-3.1-8b-instant` (faster, cheaper for real-time edits)

| Function                    | Description                                           |
|-----------------------------|-------------------------------------------------------|
| `generateProfessionalSummary` | One-call summary from profile + skills              |
| `enhanceAchievement`        | STAR-method enhancement, returns 3 variations as JSON |
| `generateProjectDescription`| One-line professional project description from GitHub |

---

### Section Regeneration: `POST /api/resume/regenerate-section`

Accepts `{ section, currentResumeData }`. Supports per-section regeneration:

- `summary` — rewrite only summary
- `experience` — enhance experience bullets
- `skills` — recategorize skills
- `projects` — refresh project descriptions
- `education` — reformat education entries

---

### Export Service: `server/services/exportService.js`

#### `generatePdfFromHtml(htmlContent)`

Uses **Puppeteer** (headless Chromium):
```js
await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
await page.emulateMediaType('screen')
await page.pdf({ format: 'A4', printBackground: true, margin: '0.5in' })
```

#### `generateProfessionalHtml(data)`

Produces inline-styled static HTML (no Tailwind) matching the React template visually, specifically for Puppeteer rendering. Includes:
- Header with full contact details
- Summary
- Experience (STAR bullet points)
- Skills (grouped by category)
- Education
- Projects
- Achievements
- Certificates

---

## Database

### User Model: `server/models/User.js`

```
username            String (unique)
email               String (unique, lowercase)
fullName            String (required)
phoneNumber         String (required)
password            String (hashed, required)
currentStatus       Enum: 'Student' | 'Working Professional'

personalDetails
  dob               Date
  gender            Enum
  nationality       String
  location
    city, state, country

education[]
  degree            String
  specialization    String (maps to field in resume)
  college           String (maps to institution in resume)
  startYear         String
  endYear           String

experience[]
  company           String
  role              String
  startDate         Date
  endDate           Date
  responsibilities  String (maps to description in resume)

socialLinks
  github            String
  linkedin          String
  portfolio         String

profile
  currentSkills     [String]          (known/learning skills)
  targetJob         String
  experienceLevel   String
  completedSkills[] { skill, score, masteredAt, source }
  learningSkills    [String]
  focusSkill        String
  roadmapCache      Object
  jobMatchCache     { data[], generatedAt }

careerInfo
  targetJobRole     String

certifications[]
  title             String
  polishedTitle     String
  issuer            String
  issueYear         Number
  useInResume       Boolean  ← must be true to appear in resume

resumeFile
  filename          String
  uploadedAt        Date
  filePath          String

resumeData          Object (from PDF parser)
  parsedAt          Date
```

---

## Templates

All three templates live in `src/components/resume/templates/`.  
All use **A4 page format** (`210mm × 297mm`) with print media queries.

### CSS A4 Configuration (all templates)

```css
@media print {
  body, html { margin: 0; padding: 0; }
  .resume-page { page-break-after: always; }
  .resume-page:last-child { page-break-after: avoid; }
}
.resume-page {
  width: 210mm;
  height: 297mm;
  background: white;
  padding: 15mm;
  box-sizing: border-box;
  margin: 10px auto;
  box-shadow: 0 0 0 1px #ddd;
  font-family: 'Calibri', sans-serif;
  font-size: 10px;
  line-height: 1.3;
  color: #1f2937;
  overflow: hidden;
}
```

---

### Template 1: `ProfessionalClassicTemplate.jsx`

**ID:** `professional`  
**Layout:** Single-column, traditional/classic  
**Multi-page:** Yes — sections distributed across named A4 pages

| Page | Contents                         |
|------|----------------------------------|
| 1    | Header + Professional Summary    |
| 2    | Work Experience + Skills         |
| 3    | Education + Projects             |
| 4    | Key Achievements + Certifications|
| 5    | Interests + Languages            |

Pages only render when the section has data. Empty sections produce no page.

**Header display:**
```
Full Name (large, themed color)
Email • Phone • Location
LinkedIn: ...
GitHub: ...
Portfolio: ...
```

**Features:** Section headings with colored underline divider, compact spacing, all sections as named functional components (`HeaderSection`, `SummarySection`, `ExperienceSection`, etc.)

---

### Template 2: `ModernSidebarTemplate.jsx`

**ID:** `modern-sidebar`  
**Layout:** Two-panel — colored sidebar left, main content right  
**CSS class:** `.resume-page-modern`  
**Inline editing:** Yes (EditableSection wrapper with pencil icon on hover)

**Sidebar (colored background, themeColor):**
- Contact info (Email, Phone, Location, LinkedIn, GitHub, Portfolio)
- Skills (grouped by category, filter: no "Mastered Skills")
- Languages
- Interests

**Main content (white):**
- Name + title
- Professional Summary
- Work Experience
- Projects
- Key Achievements

**Contact display format:**
```
[Label (semibold)]
[Value (break-words)]
```
Each contact field is a `flex-col` div with label above value.

---

### Template 3: `BalancedTwoColumnTemplate.jsx`

**ID:** `balanced`  
**Layout:** Equal two-column grid  
**CSS class:** `.resume-page-balanced`  
**Inline editing:** Yes (EditableSection wrapper)

| Left Column          | Right Column               |
|----------------------|----------------------------|
| Skills               | Experience                 |
| Languages            | Projects                   |
| Interests            | Education                  |
|                      | Key Achievements            |

**Header:** Full-width, name + contact line (`email • phone • location`)  
**Summary:** Full-width above the two-column grid  
**Grid gap:** `gap-6` (optimized for A4)

---

## Data Flow — End to End

### 1. Page Load

```
ResumeBuilder mounts
  → fetchInitialData()
  → GET /api/resume/data  (JWT auth)
  → Server: getAggregatedResumeData(user)
  → Frontend receives flat resume data object
  → Check localStorage for saved resume (key: resumeData_<userId>)
  → If saved: merge localStorage resume with fresh profile data
  → If not saved: populate basic fields from profile data
  → setUserRawData(response.data)
  → setResumeData(merged)
```

### 2. AI Generation

```
User clicks "Generate Resume"
  → handleGenerate()
  → POST /api/resume/generate  (JWT auth)
  → Server: getAggregatedResumeData(user)
  → detectUserProfile(userData) → 'student' or 'professional'
  → Build prompt (student or professional template)
  → Groq API: llama-3.3-70b-versatile → JSON resume
  → Return { message, resume, profileType }
  → Frontend: sanitize all fields (safeString, safeArray)
  → Contact-First protection: overwrite contact from userRawData
  → setResumeData(updatedData)
  → saveToLocalStorage(updatedData)
```

### 3. Section Editing (Manual)

```
User opens ExperienceForm / AchievementForm / etc.
  → Edit data in form
  → Save → handleSave<Section>()
  → setResumeData({ ...prev, [section]: updatedData })
  → saveToLocalStorage()
  → ResumePreview re-renders with new data
```

### 4. Inline Template Editing (hover edit icon)

```
User hovers section in template → pencil icon appears
  → Click pencil → EditableSection enters isEditing mode
  → Renders renderEdit() form inline
  → Save → onSave(sectionName, tempData)
  → handleSectionEdit() in ResumeBuilder
  → setResumeData + saveToLocalStorage
```

### 5. PDF Export

```
User clicks "Export PDF"
  → handleExport()
  → POST /api/resume/export/pdf  { resumeData }
  → Server: exportService.generateProfessionalHtml(data)
  → puppeteer.launch() → page.setContent(html)
  → page.pdf({ format: 'A4' })
  → Return PDF buffer (responseType: 'blob')
  → Frontend: createObjectURL → anchor click → download
  → Filename: "<FullName>_Resume.pdf"
```

---

## API Reference

| Method | Endpoint                           | Auth | Description                          |
|--------|------------------------------------|------|--------------------------------------|
| GET    | `/api/resume/data`                 | JWT  | Get aggregated profile data          |
| POST   | `/api/resume/generate`             | JWT  | AI-generate full resume JSON         |
| POST   | `/api/resume/regenerate-section`   | JWT  | AI-regenerate a single section       |
| POST   | `/api/resume/upload`               | JWT  | Upload & parse PDF resume            |
| POST   | `/api/resume/analyze`              | JWT  | Skill gap analysis                   |
| POST   | `/api/resume/enhance-text`         | JWT  | AI text enhancement                  |
| POST   | `/api/resume/enhance-description`  | JWT  | AI description polishing             |
| POST   | `/api/resume/export/pdf`           | JWT  | Generate and download PDF            |
| GET    | `/api/resume/versions`             | JWT  | List resume versions                 |
| POST   | `/api/resume/versions`             | JWT  | Save resume version                  |
| GET    | `/api/resume/:userId`              | JWT  | Get resume data for user             |
| PUT    | `/api/resume/:userId`              | JWT  | Update resume data                   |
| DELETE | `/api/resume/:userId`              | JWT  | Delete resume                        |

---

## State Management & LocalStorage Persistence

There is **no global state manager** (no Redux/Zustand). All state is React `useState` within `ResumeBuilder.jsx`.

### LocalStorage Key

```
resumeData_<userId>
```

Where `<userId>` is extracted from the JWT payload:
```js
const userId = JSON.parse(atob(token.split('.')[1])).userId
```

### What is persisted

- Full `resumeData` object: summary, experience, skills, education, projects, certificates, achievements, interests, languages, contact, personal fields
- `template` (selected template ID)
- `themeColor` (hex string)

### What is NOT persisted

- `selectedTemplate` state variable (re-read from `resumeData.template` on load)
- `themeColor` state variable (re-read from `resumeData.themeColor` on load)
- `userRawData` (always re-fetched from API)

### On Clear

```js
localStorage.removeItem(`resumeData_${userId}`)
```
Resets state to blank resume with just profile name/email.

---

## PDF Export Pipeline

```
Frontend → POST /api/resume/export/pdf  { resumeData }
         ↓
exportService.generateProfessionalHtml(data)
  → Pure static HTML with inline CSS
  → No Tailwind (not available in Puppeteer)
  → Same visual structure as ProfessionalClassicTemplate React component
         ↓
puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
  → page.setContent(html, { waitUntil: 'networkidle0' })
  → page.emulateMediaType('screen')
  → page.pdf({ format: 'A4', printBackground: true, margin: '0.5in' })
         ↓
Return PDF Buffer → Frontend blob → File download
```

**File naming:** `<FullName>_Resume.pdf` (spaces replaced with underscores)

---

## Current Implementation Status

### Frontend ✅
- [x] ResumeBuilder page with 3-column layout
- [x] AI Generate button (full resume generation)
- [x] Per-section regenerate buttons
- [x] ExperienceForm — add/edit/delete entries
- [x] AchievementForm — add/edit/delete entries
- [x] EducationForm — add/edit/delete entries
- [x] InterestsForm — comma-separated or list editing
- [x] LanguagesForm — list editing
- [x] TemplateSelector — 3 templates
- [x] ThemeColorPicker — 16 colors (8 standard + 8 lighter shades)
- [x] LocalStorage resume persistence (user-specific)
- [x] Clear resume button
- [x] Export PDF button
- [x] Contact-First protection (AI can't overwrite user contact)

### Templates ✅
- [x] ProfessionalClassicTemplate — A4, multi-page (5 sections → 5 pages)
- [x] ModernSidebarTemplate — A4, sidebar layout, inline editing
- [x] BalancedTwoColumnTemplate — A4, two-column grid, inline editing
- [x] All templates: `overflow: hidden` on each A4 page
- [x] All templates: CSS print media queries for PDF page breaks
- [x] All templates: Contact info (Email, Phone, Location, LinkedIn, GitHub, Portfolio)
- [x] All templates: "Mastered Skills" category filtered from display

### Backend ✅
- [x] GET /api/resume/data — aggregated profile
- [x] POST /api/resume/generate — AI generation (student + professional prompts)
- [x] POST /api/resume/regenerate-section — section-level regeneration
- [x] POST /api/resume/upload — PDF upload + parse
- [x] POST /api/resume/export/pdf — Puppeteer PDF generation
- [x] POST /api/resume/enhance-text — AI text enhancement
- [x] POST /api/resume/enhance-description — real-time description polishing
- [x] Auth middleware on all routes (JWT validation + DB lookup)

### Known Limitations
- PDF export uses `generateProfessionalHtml()` which mirrors only the Professional template visually. Modern Sidebar and Balanced templates export as "professional" HTML layout.
- No server-side resume version saving implemented in frontend (versions API exists but frontend only uses localStorage).
- Inline editing in ProfessionalClassicTemplate was removed in favor of multi-page layout (editing available via sidebar forms).
