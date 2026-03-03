# Resume System Implementation

This document outlines the architecture and logic for the AI-powered resume generation and rendering system in CareerPath.

## 1. System Architecture

The resume system follows a Three-Tier flow:
1.  **Backend Data Aggregation**: Compiles user profile, skills, education, and certificates into a "Resume-Ready" JSON.
2.  **AI Generation (Groq)**: Processes the aggregated data using tailored prompts to generate professional resume content (Summary, Experience descriptions, etc.).
3.  **Frontend Live Preview**: Merges the AI content with static profile basics (Contact info) and renders an editable, PDF-ready preview.

---

## 2. Backend Implementation

### Data Aggregation (`resumeGeneratorService.js`)
The `getAggregatedResumeData` function maps the MongoDB User model to a structure the AI can understand.

Key features:
- **Certificate Polishing**: Maps certificates to `{ polishedTitle, issuer, year }`. `polishedTitle` is preferred for professional display.
- **Skill Categorization**: Groups skills from `masteredSkills` and `currentSkills`.
- **Experience Mapping**: Formats date ranges into duration strings (e.g., "Jan 2023 - Present").

### AI Prompting (`server/routes/resume.js`)
We use specific prompts for **Students** and **Professionals**.
- **Strict Naming**: The prompt explicitly commands the AI to use `polishedTitle` as the certificate name.
- **JSON Enforcement**: AI is instructed to return *only* a raw JSON object with specific keys: `summary`, `experience`, `education`, `skills`, `projects`, `certificates`.

---

## 3. Frontend implementation

### Data Merging Logic (`ResumeBuilder.jsx`)
When AI content is received, it is merged with the existing state using a "Profile-First" strategy:
- **Contact Info Protection**: Name, Email, Phone, and Social links are ALWAYS preserved from the fresh user profile data, never overwritten by AI guesses.
- **Sanitized Mapping**: Every AI field is passed through sanitization helpers (`safeString`, `safeArray`) to prevent crashes.

### Rendering & Preview (`ResumePreview.jsx`)
A specialized component for high-fidelity resume display.
- **Key Resiliency**: Checks for `certifications`, `certificates`, or `certs` to handle AI key-naming inconsistencies.
- **Fallback Content**: Provides "Your Name", "Your Phone", etc., as placeholders if profile data is missing.
- **Inline Editing**: Users can modify any section (Summary, Experience, etc.) directly in the preview, which triggers a background save.

---

## 4. Key Fixes & Optimizations

| Feature                | Implementation Detail                                                                 |
| :--------------------- | :------------------------------------------------------------------------------------ |
| **Certificate Display** | Uses `polishedTitle || title || name || 'Certificate'` fallback chain.               |
| **Issuer Accuracy**    | AI prompt strictly forbids hallucinations; defaults to "Independent" if no issuer found. |
| **Data Flow Debugging** | Integrated `console.log` at every aggregation and merge point for easy traceability.  |
| **Syntax Resilience**  | Added `ResumeErrorBoundary` to catch and display rendering errors without white-screening. |

---

## 5. Directory Structure
- `server/services/resumeGeneratorService.js`: Core data mapping logic.
- `server/routes/resume.js`: AI API routes and prompts.
- `src/pages/ResumeBuilder.jsx`: Main page handling generation and state.
- `src/components/ResumePreview.jsx`: UI rendering and inline edits.
