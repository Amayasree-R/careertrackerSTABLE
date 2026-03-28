# Certificates Documentation

## 1. Overview
The Certificates system allows users to validate their claimed skills and augment their profile by uploading credentials from recognized educational platforms (Coursera, Udemy, edX, etc.). 

## 2. Key Features
- **Upload Mechanism:** Users can upload PDF or image versions of their certificates.
- **Skill Auto-Mastery:** The system extracts details (Course Name, Skills, Vendor) from the certificate and automatically marks corresponding skills in the user profile as "Mastered".
- **Verification Dashboard:** A centralized view of all uploaded certificates, showing verification status.
- **Expiry Tracking:** (If applicable) Tracks validity periods for certifications that expire (e.g., AWS, CompTIA).
- **Profile Integration:** Displays verified badges on user profiles linked to the parsed certificates.

## 3. Data Architecture & Schema
The Certificate Schema generally contains:
- `userId`: Reference to the user who uploaded the document.
- `title` (String): Title of the certificate.
- `issuer` (String): Issuing organization.
- `issueDate` / `expirationDate`: Date tracking.
- `extractedSkills`: Array of parsed skill strings.
- `fileUrl`: Link to cloud storage where the file is archived.
- `status`: Verification status (e.g., Pending, Verified, Rejected).

## 4. User Flow
1. **Upload:** User selects a file and uploads it via the dashboard.
2. **Parsing (Background):** A service parses the document metadata or text (via OCR/PDF scraping) to find skills and issuer data.
3. **Skill Update:** Backend matching logic automatically upgrades matching skill levels to "Mastered".
4. **Dashboard View:** User views their newly added certificate and their updated skill chart.

## 5. Potential Enhancements
- Integration with third-party digital badge APIs (like Credly) to automate the verification process without manual uploads.
- Blockchain-backed verification for complete authenticity assurance.
