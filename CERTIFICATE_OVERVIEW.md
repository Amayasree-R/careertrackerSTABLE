# Certificate System Documentation

This document explains the technical architecture and workflow of the Certificate system, its integration into the Resume Builder, and its impact on the Skill Master dashboard.

## 1. Credential Wallet (Main Certificate Section)
The Credential Wallet serves as the central repository for verified professional certifications.

### Core Components
- **Frontend**: `src/pages/Certificates.jsx`
- **Backend Controller**: `server/controllers/certificateController.js`
- **AI Service**: `server/services/certificateService.js` (Groq Llama-3.3-70b)

### Workflow
1.  **Upload**: Users upload a **PDF certificate**.
2.  **Text Extraction**: The system uses `resumeParserService` to convert PDF content into raw text.
3.  **AI Analysis (Groq)**: The text is analyzed by Groq AI to extract:
    *   **Original Title**: The raw title found on the certificate.
    *   **Polished Title**: A grammatically clean, professional title. Formatted as `[Issuer] [Topic] Certificate` or `[Topic] Certificate of Completion` for independent certs.
    *   **Issuer & Date**: The organization that issued the credential. If no issuer is explicitly found, it defaults to **"Independent"** to prevent AI hallucinations.
    *   **Skills**: A list of technical skills explicitly proven by the certificate.
4.  **Verification & Storage**: Verified certificates are saved to the user's `certifications` array in MongoDB and physical PDFs are stored in `server/uploads/certificates/`.

---

## 2. Resume Section Integration
The system bridges verified credentials directly into the AI-generated resume building process.

### Configuration
- **Visibility Control**: Users use the "In Resume" toggle in the Credential Wallet to set the `useInResume` status.
- **Filtering**: Only certificates with `useInResume: true` are pulled during resume generation.

### Generation Workflow
1.  **Data Aggregation**: `server/services/resumeGeneratorService.js` gathers all "In Resume" certificates, prioritizing the `polishedTitle`.
2.  **AI Orchestration**: The `resume.js` prompt instructs the AI to include a `CERTIFICATIONS` section using the `polishedTitle` exactly as provided.
3.  **Rendering**: In `src/components/ResumePreview.jsx`, certifications are displayed in a professional list:
    *   **Polished Title** (Bold) — Issuer · Year
    *   *Example*: **Google Data Analytics Professional Certificate** — Coursera · 2024

---

## 3. Skill Master & Dashboard Integration
Certificates drive the user's "Skill Fingerprint" by providing automated proof of mastery.

### Automated Skill Promotion
Upon successful verification of a certificate, the backend triggers:
1.  **Skill Match**: Extracted skills are matched against the user's career roadmap using `matchSkillStrictly`.
2.  **Promotion to Mastery**: Matching skills are instantly added to `profile.completedSkills` with a **100% score**.
3.  **Cleanup**: The promoted skills are removed from the `learningSkills` (To Learn) queue.
4.  **Radar Mapping**: The **Skill Radar Chart** on the Dashboard updates in real-time to reflect the new verified competency.

---

## Technical Summary

| Feature | Logic Location | Implementation Detail |
| :--- | :--- | :--- |
| **PDF Extraction** | `resumeParserService.js` | PDF-to-Text conversion. |
| **Title Polishing** | `certificateService.js` | AI-driven prompt for resume-ready titles. |
| **Data Aggregator**| `resumeGeneratorService.js` | Filters and maps certs for the generator. |
| **Mastery Logic** | `certificateController.js` | Updates `completedSkills` upon upload. |
| **Resume Preview** | `ResumePreview.jsx` | Renders the final formatted cert list. |
