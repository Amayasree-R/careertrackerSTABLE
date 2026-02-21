# Resume Intelligence Feature - Setup & Testing Checklist

## 🚀 PHASE 1: Setup & Installation

### Step 1: Install Backend Dependencies
```bash
cd server
npm install
```
- [ ] All packages installed successfully
- [ ] No security vulnerabilities
- [ ] Multer installed
- [ ] pdf-parse installed
- [ ] tesseract.js installed
- [ ] sharp installed

### Step 2: Verify Environment Variables
Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
GITHUB_TOKEN=ghp_... (OPTIONAL)
```
- [ ] MongoDB connection string set
- [ ] Port configured
- [ ] (Optional) GitHub token added for better skill detection

### Step 3: Create Upload Directory
```bash
mkdir -p server/uploads/resumes
```
- [ ] Directory created
- [ ] Permissions set correctly

### Step 4: Update .gitignore (Optional)
Add to `.gitignore`:
```
/server/uploads/
/server/uploads/resumes/
```
- [ ] Upload directory ignored from git

### Step 5: Database Schema Updated
- [ ] User model includes careerInfo
- [ ] User model includes resumeFile
- [ ] User model includes resumeData
- [ ] User model includes skillAnalysis

---

## 🧪 PHASE 2: Backend Testing

### Test 1: Start Server
```bash
cd server
npm run dev
```
- [ ] Server starts without errors
- [ ] "Server running on port 5000" message appears
- [ ] MongoDB connected (or error message if not)

### Test 2: Test MongoDB Connection
If MongoDB connection fails:
1. Check `.env` MONGODB_URI
2. Ensure MongoDB Atlas cluster is running
3. Check IP whitelist settings
4. Verify username/password

- [ ] MongoDB connection successful
- [ ] No connection errors in console

### Test 3: Resume Upload Endpoint
```bash
curl -X POST http://localhost:5000/api/resume/upload \
  -F "resume=@test-resume.pdf" \
  -F "userId=<USER_ID>"
```
Expected Response:
```json
{
  "message": "Resume uploaded and parsed successfully",
  "resumeData": { ... },
  "email": "...",
  "phone": "..."
}
```
- [ ] Endpoint responds with 200 status
- [ ] Resume data extracted (skills, experience, education)
- [ ] Email/phone detected (if present)
- [ ] File stored in uploads/resumes/

### Test 4: Get Resume Data
```bash
curl http://localhost:5000/api/resume/<USER_ID>
```
- [ ] Returns saved resume data
- [ ] All sections present (skills, tools, projects, etc.)
- [ ] Data properly formatted

### Test 5: Update Resume Data
```bash
curl -X PUT http://localhost:5000/api/resume/<USER_ID> \
  -H "Content-Type: application/json" \
  -d '{"resumeData": {"skills": ["JavaScript", "React"]}}'
```
- [ ] Manual edits saved
- [ ] Data returns in GET request
- [ ] Changes persisted to MongoDB

### Test 6: Skill Gap Analysis
```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -H "Content-Type: application/json" \
  -d '{"userId": "<USER_ID>"}'
```
- [ ] Analysis completes successfully
- [ ] Returns matchPercentage
- [ ] Lists matching skills
- [ ] Lists missing skills
- [ ] Returns recommendations
- [ ] Generates learning roadmap

### Test 7: Get Analysis Results
```bash
curl http://localhost:5000/api/resume/<USER_ID>/analysis
```
- [ ] Returns previous analysis
- [ ] Includes recommendations
- [ ] Includes roadmap

### Test 8: Delete Resume
```bash
curl -X DELETE http://localhost:5000/api/resume/<USER_ID>
```
- [ ] Returns success message
- [ ] Resume data cleared from DB
- [ ] File removed from uploads/

---

## 🎨 PHASE 3: Frontend Integration

### Step 1: Import ResumeDashboard
```jsx
import ResumeDashboard from './components/ResumeDashboard'
```
- [ ] No import errors
- [ ] Component file found

### Step 2: Add to Dashboard Page
In your main Dashboard component:
```jsx
export function Dashboard({ user }) {
  return (
    <div>
      {/* existing content */}
      <ResumeDashboard 
        userId={user._id} 
        apiBaseUrl="http://localhost:5000"
      />
    </div>
  )
}
```
- [ ] Component renders without errors
- [ ] No prop warnings

### Step 3: Fix Styling (if needed)
- [ ] Tailwind CSS classes apply correctly
- [ ] Dark theme matches rest of app
- [ ] Responsive on mobile

---

## 🎯 PHASE 4: Feature Testing

### Test 1: Resume Upload
1. Click "📤 Upload Resume" tab
2. Drag & drop a PDF resume or click to select
3. Click "Upload & Parse Resume"

- [ ] File selected successfully
- [ ] Upload progress shown
- [ ] "Resume uploaded and parsed successfully!" message
- [ ] Automatically switches to Preview tab

### Test 2: Resume Preview
1. In Preview tab, view all sections
2. Each section should show:
   - Skills (as tags)
   - Tools (as tags)
   - Work Experience (company, role, duration)
   - Education (institution, degree, field, year)
   - Projects (with tech stack)
   - Certifications (name, issuer, date)

- [ ] All sections display correctly
- [ ] Skills shown as tags/pills
- [ ] Experience details formatted nicely
- [ ] Education info visible
- [ ] Projects with tech stacks listed
- [ ] Certifications displayed

### Test 3: Edit Resume Data
1. Click "✏️ Edit Data" button
2. Click on a section to edit:
   - Edit a skill
   - Edit work experience details
   - Add a new skill
   - Remove a skill
3. Click "+ Add" to add new items
4. Click "✕" to remove items
5. Click "✓ Save Changes"

- [ ] Edit mode activated
- [ ] Can edit individual fields
- [ ] Can add new items
- [ ] Can remove items
- [ ] Changes saved to server
- [ ] Data persists after refresh

### Test 4: Run Skill Gap Analysis
1. From Preview tab, click "📊 Run Analysis"
2. Wait for analysis to complete

Expected results:
- [ ] Analysis completes (may take 10-30 seconds)
- [ ] Automatically switches to Analysis tab
- [ ] Shows match percentage (e.g., "45%")
- [ ] Green progress bar shows match %
- [ ] Matched skills listed
- [ ] Missing skills listed
- [ ] Recommendations shown (Critical/Important/Nice-to-Have)

### Test 5: View Learning Roadmap
1. Scroll down in Analysis tab
2. Should see:
   - Phase 1: Foundation (0-2 months)
   - Phase 2: Intermediate (2-4 months)
   - Phase 3: Advanced (4-6 months)
   - Phase 4: Specialization (6+ months)

- [ ] 4 phases visible
- [ ] Each phase has skills listed
- [ ] Timeline shows correct durations
- [ ] Color-coded phases
- [ ] Phase goals described

### Test 6: Delete Resume
1. From Preview tab, click "🗑️ Delete Resume"
2. Confirm deletion

- [ ] Confirmation dialog appears
- [ ] Upload tab becomes active
- [ ] Resume data cleared
- [ ] Can upload new resume

---

## 🔍 PHASE 5: Edge Cases & Error Handling

### Error Test 1: Upload Non-PDF File
1. Try uploading a .doc, .txt, or .jpg file
2. Should show: "Only PDF files are allowed"

- [ ] Error message shows
- [ ] File not uploaded

### Error Test 2: Upload Large File (>5MB)
1. Try uploading a file > 5MB
2. Should show: "File size exceeds 5MB limit"

- [ ] Error message shows
- [ ] File not uploaded

### Error Test 3: No Resume Uploaded
1. Try running analysis without uploading resume
2. Should show error

- [ ] Error message shows
- [ ] Graceful error handling

### Error Test 4: Missing Target Job Role
1. Try analyzing without setting job role
2. Should show: "Target job role not set"

- [ ] Error message shown
- [ ] Prompt to update profile

### Error Test 5: Network Error
1. Stop MongoDB temporarily
2. Try uploading resume
3. Should show network error

- [ ] Error message shows
- [ ] No crash or blank page
- [ ] User can retry

### Error Test 6: No Skills to Analyze
1. Edit resume to remove all skills
2. Try running analysis
3. Should show appropriate error

- [ ] Error message shows
- [ ] Prevents running with empty skills

---

## 📊 PHASE 6: Data Quality Verification

### Skill Normalization Test
1. Upload resume with various skill names
2. Check if normalized correctly:
   - "js" → "JavaScript"
   - "python" → "Python"
   - "react" → "React"
   - "postgres" → "PostgreSQL"
   - etc.

- [ ] Skills normalized correctly
- [ ] Variations mapped properly
- [ ] Duplicates removed

### Section Detection Test
1. Upload various resume formats
2. Verify sections detected:
   - Skills section
   - Experience section
   - Education section
   - Projects section
   - Certifications section

- [ ] Sections detected accurately
- [ ] Data extracted correctly
- [ ] No missed sections
- [ ] No false positives

### Text Extraction Test
1. Upload resume in different formats
2. Check text extraction:
   - Simple PDF ✓
   - Complex PDF ✓
   - Image-based PDF (should trigger OCR) ✓

- [ ] Text extracted accurately
- [ ] OCR works as fallback
- [ ] No corrupted text

---

## 🚀 PHASE 7: Performance Testing

### Load Test 1: Multiple Uploads
1. Upload 3-5 resumes in sequence
2. Each should process normally

- [ ] All upload successfully
- [ ] No timeout errors
- [ ] Each parsed correctly
- [ ] All stored in DB

### Load Test 2: Large Analysis
1. Run analysis on resume with many skills
2. Should complete in reasonable time

- [ ] Analysis completes < 30 seconds
- [ ] No timeout
- [ ] All results accurate

### Load Test 3: Multiple Users
1. Have multiple users upload resumes
2. Each should have isolated data

- [ ] No data mixing
- [ ] Correct user associations
- [ ] Proper isolation

---

## 🔐 PHASE 8: Security Testing

### Security Test 1: File Type Validation
1. Try uploading .pdf.exe file
2. Try uploading .pdf with wrong MIME type
3. Try uploading JavaScript file renamed to .pdf

- [ ] All rejected correctly
- [ ] Only valid PDFs accepted

### Security Test 2: File Size Limit
1. Create file exactly 5MB
2. Create file > 5MB
3. Create file < 1KB

- [ ] 5MB file rejected
- [ ] Small file accepted (if valid PDF)

### Security Test 3: User ID Verification
1. Get one user's resume using another user's ID
2. Should not cross-contaminate data

- [ ] Each user sees only their data
- [ ] No access to other user's resume

### Security Test 4: Input Sanitization
1. Try SQL injection in edit fields
2. Try JavaScript injection
3. Try special characters

- [ ] All handled safely
- [ ] No errors or vulnerabilities

---

## ✅ PHASE 9: Final Verification

### Code Quality
- [ ] No console.log() in production code
- [ ] No hardcoded API URLs
- [ ] Error messages user-friendly
- [ ] Comments present where needed
- [ ] Consistent code formatting

### Documentation
- [ ] README.md updated
- [ ] API endpoints documented
- [ ] Setup instructions clear
- [ ] Examples provided

### Deployment Readiness
- [ ] All tests passing
- [ ] No errors in console
- [ ] Performance acceptable
- [ ] Security validated
- [ ] Error handling complete

---

## 📝 Sign-Off Checklist

**Backend Ready:**
- [ ] All services implemented
- [ ] All controllers working
- [ ] All routes registered
- [ ] Database schema updated
- [ ] Error handling in place

**Frontend Ready:**
- [ ] All components created
- [ ] All features working
- [ ] Styling complete
- [ ] Responsive design
- [ ] Integration complete

**Testing Complete:**
- [ ] Unit tests pass (if added)
- [ ] Integration tests pass
- [ ] Edge cases handled
- [ ] Performance acceptable
- [ ] Security validated

**Documentation Ready:**
- [ ] Implementation guide (RESUME_FEATURE_GUIDE.md)
- [ ] Quick reference (RESUME_QUICK_REF.md)
- [ ] Setup checklist (THIS FILE)
- [ ] API documented
- [ ] Code commented

---

## 🎉 Ready for Production!

Once all checkboxes are checked, your Resume Intelligence feature is production-ready!

### Deployment Steps:
1. Run tests one final time
2. Deploy to staging
3. Perform staging validation
4. Deploy to production
5. Monitor for errors

---

**Implementation Date:** February 9, 2026  
**Status:** ✅ Ready for Setup & Testing  
**Estimated Setup Time:** 30 minutes  
**Estimated Testing Time:** 1-2 hours  

Good luck! 🚀
