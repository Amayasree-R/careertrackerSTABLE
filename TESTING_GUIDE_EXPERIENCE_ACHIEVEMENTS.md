# Quick Test Guide: Experience & Achievements Forms

## How to Test the New Features

### Prerequisites
1. Make sure the development server is running:
   ```powershell
   cd c:\careertrackerSTABLE
   npm run dev
   ```

2. Make sure the backend server is running:
   ```powershell
   cd c:\careertrackerSTABLE\server
   npm start
   ```

---

## Test Scenario 1: Add Professional Experience

### Steps:
1. Navigate to **Resume Builder** page
2. Look at the **left sidebar** - you should see a new card titled "Resume Sections"
3. Click on **"Experience"** (with briefcase icon 💼)
4. A modal should open titled **"Professional Experience"**

### In the Modal:
5. Click **"Add Experience"** button
6. Fill in the fields:
   - **Role:** `senior software engineer`
   - **Company:** `tech corp`
   - **Duration:** `jan 2020 - present`
   - **Description:** Type some experience details

7. **Click in another field** (tab out) → Notice text gets capitalized:
   - `senior software engineer` → `Senior Software Engineer`
   - `tech corp` → `Tech Corp`

8. Click **"Save Changes"**

### Verify:
- ✅ Modal closes
- ✅ Resume preview updates with your experience
- ✅ Experience appears under "WORK EXPERIENCE" heading
- ✅ Format: `Tech Corp | Senior Software Engineer`
- ✅ Description appears below

---

## Test Scenario 2: Add Multiple Experiences

1. Click **"Experience"** again
2. Notice your previously saved experience is there
3. Click on it to **collapse/expand**
4. Click **"Add Experience"** to add another one
5. Add a second job with different details
6. Click **"Save Changes"**

### Verify:
- ✅ Both experiences show in preview
- ✅ Most recent experience appears first (if you ordered them that way)

---

## Test Scenario 3: Add Key Achievements

1. In the sidebar, click **"Achievements"** (trophy icon 🏆)
2. Modal opens titled **"Key Achievements"**
3. Click **"Add Achievement"**
4. Type: `increased sales by 35% through strategic marketing`
5. Tab out → Text gets capitalized
6. Click **"Add Achievement"** again
7. Add 2-3 more achievements
8. Click **"Save Changes"**

### Verify:
- ✅ Modal closes
- ✅ "KEY ACHIEVEMENTS" section appears in preview
- ✅ Achievements show as bullet points (•)
- ✅ Section appears between Experience and Projects

---

## Test Scenario 4: Edit and Delete

### Edit Experience:
1. Click **"Experience"** in sidebar
2. Click on an existing experience to expand it
3. Change the **description** field
4. Click **"Save Changes"**
5. ✅ Preview updates with new description

### Delete Experience:
1. Click **"Experience"** in sidebar
2. Click the **trash icon** 🗑️ next to an experience
3. Experience entry disappears
4. Click **"Save Changes"**
5. ✅ Deleted experience no longer in preview

### Delete Achievement:
1. Click **"Achievements"** in sidebar
2. Click **trash icon** next to an achievement
3. Click **"Save Changes"**
4. ✅ Achievement removed from preview

---

## Test Scenario 5: Text Polishing

Type these examples and **tab out** to see automatic formatting:

| You Type | Gets Polished To |
|----------|------------------|
| `led a team of engineers` | `Led a team of engineers` |
| `improved ui design` | `Improved UI design` |
| `built rest api` | `Built REST API` |
| `worked with ceo and cto` | `Worked with CEO and CTO` |
| `increased roi by 40%` | `Increased ROI by 40%` |
| `managed   multiple    projects` | `Managed multiple projects` |

---

## Test Scenario 6: Data Persistence

1. Add some experiences and achievements
2. Click **"Save Changes"**
3. **Refresh the page** (F5)
4. ✅ All your data should still be there
5. ✅ Preview shows same content

---

## Test Scenario 7: Export to PDF

1. After adding experiences and achievements
2. Click **"Export PDF"** button (top right)
3. PDF downloads
4. Open the PDF

### Verify PDF Contains:
- ✅ "WORK EXPERIENCE" section with your experiences
- ✅ "KEY ACHIEVEMENTS" section with bullet points
- ✅ Proper formatting and spacing
- ✅ Section order: Summary → Experience → Achievements → Projects

---

## Test Scenario 8: Empty State

### Test Empty Achievements:
1. Click **"Achievements"**
2. Delete all achievements (trash icons)
3. Click **"Save Changes"**
4. ✅ "KEY ACHIEVEMENTS" section should **disappear** from preview
5. ✅ No empty section shown

### Test New User:
1. Click **"Clear & Start Fresh"** button
2. Confirm the action
3. ✅ All data cleared
4. ✅ No default experiences or achievements shown
5. ✅ Preview shows placeholder message

---

## Test Scenario 9: Sidebar Navigation

### Click each sidebar item:

| Section | Expected Behavior |
|---------|-------------------|
| **Profile** | Navigates to `/profile` page |
| **Experience** | Opens ExperienceForm modal |
| **Achievements** | Opens AchievementForm modal |
| **Education** | Navigates to `/profile` page |
| **Skills** | Disabled (grayed out) |
| **Projects** | Navigates to `/projects` page |
| **Certificates** | Navigates to `/certificates` page |

---

## Test Scenario 10: Modal Interactions

### Experience Form:
- ✅ Click **X** to close without saving → Changes discarded
- ✅ Click outside modal → No change (modal stays open)
- ✅ Add item → Remove item → Add again → Works correctly
- ✅ Expand/collapse entries → UI toggles smoothly

### Achievement Form:
- ✅ Empty achievements filtered out on save
- ✅ Numbered indicators (1, 2, 3...) update correctly
- ✅ Can handle 10+ achievements

---

## Test Scenario 11: Edge Cases

### Long Text:
1. Add an experience with **very long description** (500+ words)
2. ✅ Preview renders without breaking
3. ✅ PDF export handles long text

### Special Characters:
1. Add achievements with: `"quotes"`, `apostrophe's`, `& symbols`
2. ✅ Text polisher handles correctly
3. ✅ Export renders correctly

### Rapid Changes:
1. Open form → Add 5 items quickly → Save
2. ✅ All items saved
3. Open form again → All items present

---

## Expected Visual Behavior

### Sidebar Card:
```
┌─────────────────────────────┐
│ Resume Sections             │ ← White background
│ Edit and manage your...    │ ← Gradient purple header
├─────────────────────────────┤
│ 👤 Profile              ✏️  │ ← Hover effect
│ 💼 Experience           ✏️  │ ← Clickable
│ 🏆 Achievements         ✏️  │
│ ...                         │
└─────────────────────────────┘
```

### Experience Modal:
- Purple gradient header
- White content area
- Expandable card items
- Footer with action buttons
- Smooth animations

### Achievement Modal:
- Similar purple gradient header
- Numbered circle indicators
- Simple input fields
- Auto-height adjustment

---

## Known Behaviors (Not Bugs)

1. **Skills section is disabled** - This is intentional, skills are generated by AI
2. **AI Generator still works** - These forms are additions, not replacements
3. **Education navigates away** - Education is managed in Profile page
4. **Text polishing is basic** - It only formats, doesn't rewrite content

---

## Troubleshooting

### Modal doesn't open:
- Check browser console for errors
- Verify imports in ResumeBuilder.jsx

### Changes don't save:
- Check localStorage in DevTools (F12 → Application → Local Storage)
- Look for key: `resumeData_<userId>`

### Preview doesn't update:
- Verify `onSectionEdit` handler is being called
- Check React DevTools state for `resumeData`

### Export missing achievements:
- Check server console for errors
- Verify `exportService.js` has achievements handling
- Ensure `resumeData.achievements` exists in POST payload

---

## Success Criteria

✅ All 11 test scenarios pass  
✅ No console errors  
✅ Data persists across page refreshes  
✅ PDF export includes all sections  
✅ UI is responsive and smooth  
✅ Text polishing works as expected  

---

**Next Steps After Testing:**
1. If issues found → Report specific scenario that failed
2. If all pass → Ready for production use
3. Consider adding more achievements/experiences to test scalability

**Estimated Testing Time:** 15-20 minutes for full suite
