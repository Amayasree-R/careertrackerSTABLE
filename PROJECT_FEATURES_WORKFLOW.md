# Skill Career Tracker - Features & Workflows

A complete guide to the AI-driven career acceleration tools implemented in this project.

## 1. Authentication & Security
### Description
Secure entry point using modern web standards.
- **JWT Authentication**: Stateless session management.
- **Bcrypt Hashing**: Secure password storage.
- **Protected Routes**: Backend middleware ensures only authorized users access their data.

### Workflow
1. User **registers** with email/password.
2. User **logs in** to receive a JWT stored in browser `localStorage`.
3. Every API request includes the token in the `Authorization` header.

## 2. Profile & career Setup
### Description
Central hub for user's professional identity.
- **Target Role**: Definable career goal (e.g., "Senior Frontend Engineer").
- **Experience & Education**: Structured entry for career history.
- **Skill Repository**: Distinction between "Current Skills" and "Mastered Skills".

### Workflow
1. User updates **Target Job** in Profile.
2. User enters/edits **Work Experience** and **Education**.
3. Social links (GitHub/LinkedIn) are connected for project discovery.

## 3. Skill Discovery & Learning Roadmap
### Description
AI-powered gap analysis between current skills and the target role.
- **Industry Insights**: Fetches trending skills via GitHub API.
- **Prioritization**: Categorizes missing skills into High, Medium, and Low importance.
- **Dynamic Roadmap**: Generates a 4-phase learning journey.

### Workflow
1. User selects a **Target Job**.
2. System compares profile skills against industry requirements.
3. **Roadmap** is generated, showing a path from "Beginner" to "Job Ready".

## 4. Skill Verification Quiz
### Description
Strict verification system to prove professional competence.
- **AI-Generated**: 25 dynamic MCQs created by Groq (Llama-3.3-70b).
- **Mastery Threshold**: High bar (92%) required to "Master" a skill.
- **Fallback Logic**: Local quiz data available if AI rate limits occur.

### Workflow
1. User clicks **"Take Quiz"** for a skill on their roadmap.
2. System generates 25 domain-specific questions.
3. User submits; if score is **>90%**, the skill is moved to the **Mastered** list.

## 5. Credential Wallet (Certificates)
### Description
Verified proof of learning integrated with the roadmap.
- **Dual-Stage Extraction**: Uses `pdf-parse` with a `pdfjs-dist` fallback for reliability.
- **AI Analysis**: Groq extracts metadata (title, issuer, date) and validates skills.
- **Auto-Update**: High-confidence matching promotes skills to the roadmap automatically.

### Workflow
1. User **uploads a PDF** certificate.
2. System extracts text and analyzes it via AI.
3. Validated skills are shown, and if matched to the roadmap, they are **automatically Mastered**.

## 6. AI Resume Intelligence & Builder
### Description
Data-driven resume creation that ensures professional alignment.
- **PDF Parsing**: Upload old resumes to auto-populate profile data.
- **AI Enhancement**: Rewrites bullet points using the **STAR method**.
- **Themed Export**: Tailwind-styled templates exported as high-quality PDFs.

### Workflow
1. User **uploads** their old resume for instant profile setup.
2. User enters the **Resume Builder** workspace.
3. AI generates a **Professional Summary** and optimizes project descriptions.
4. User selects a **Template** and **Exports to PDF**.
