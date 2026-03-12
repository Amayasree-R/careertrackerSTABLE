# Visual Roadmap Dashboard — Detailed Documentation

---

## Overview

The **Visual Roadmap** is a dedicated, AI-powered tiered learning path view inside the CareerTracker dashboard. Unlike the classic linear Roadmap page, it organizes skills into ordered dependency tiers using **Google Gemini 1.5-flash**, presents them as an alternating left/right vertical timeline, and provides curated course resources for each skill in a slide-in detail panel.

---

## File Locations

| File | Purpose |
|---|---|
| `src/pages/VisualRoadmap.jsx` | React frontend page |
| `server/routes/visualRoadmap.js` | Express API route (`GET /api/visual-roadmap`) |
| `server/services/visualRoadmapService.js` | Gemini AI service + fallback tiering |

---

## Navigation

- **URL:** `/dashboard/visual-roadmap`
- **Layout:** Rendered inside `DashboardLayout` (has Sidebar + Top Nav)
- **Sidebar entry:** "Visual Roadmap" link with `Map` Lucide icon
- **Auth guard:** Checks `localStorage.getItem('token')` on mount; redirects to `/login` if missing

---

## Architecture & Data Flow

```
User navigates to /dashboard/visual-roadmap
          ↓
VisualRoadmap.jsx mounts → fetchRoadmap()
          ↓
GET /api/visual-roadmap
          ↓
authMiddleware (shared `protect`) → sets req.user
          ↓
Look up User document in MongoDB
          ↓
  ┌─────────────────────────────────┐
  │  user.careerInfo.visualRoadmap  │
  │  (cache) exists + refresh=false?│
  └─────────────────────────────────┘
         YES ↓                NO ↓
    Return cached data    generateVisualRoadmap(profile)
                                   ↓
                    roadmapGenerator.generateRoadmap(profile)
                    [Groq + GitHub + Stack Overflow]
                                   ↓
                         GEMINI_API_KEY present?
                           YES ↓        NO ↓
                    Call Gemini     generateFallbackRoadmap()
                    1.5-flash           (priority tiering)
                          ↓
                   Parse JSON response
                   (strip markdown fences if present)
                          ↓
                   Parse fails? → fallback
                          ↓
                Save to user.careerInfo.visualRoadmap
                          ↓
                   Return { tiers, targetJob }
```

---

## Backend: API Route (`GET /api/visual-roadmap`)

**File:** `server/routes/visualRoadmap.js`

### Request
```
GET /api/visual-roadmap
Authorization: Bearer <token>
Query params:
  refresh=true   (optional) — forces Gemini regeneration, bypasses cache
```

### Route Logic (step by step)

1. **Auth:** `authMiddleware` verifies JWT, sets `req.user`.
2. **User lookup:** `User.findById(userId)` — returns 404 if not found.
3. **Cache check:** If `refresh !== true` and `user.careerInfo.visualRoadmap` exists → return cached data immediately.
4. **Profile assembly:** Constructs a lean profile object:
   ```javascript
   {
     completedSkills: user.profile.completedSkills || [],
     currentSkills:   user.profile.currentSkills   || [],
     targetJob:       user.careerInfo?.targetJobRole || user.profile?.targetJob || 'Software Engineer',
     experienceLevel: user.profile.experienceLevel  || 'Entry Level'
   }
   ```
5. **Generation:** Calls `generateVisualRoadmap(profile)` from the service.
6. **Cache write:** Saves result to `user.careerInfo.visualRoadmap` in MongoDB.
7. **Response:** Returns `{ ...visualRoadmap, targetJob }`.

### Response Shape
```json
{
  "targetJob": "Full Stack Developer",
  "tiers": [
    {
      "tier": 0,
      "label": "Mastered",
      "skills": [
        {
          "skill": "JavaScript",
          "status": "Mastered",
          "category": "Language",
          "estimatedTime": "Completed",
          "dependencies": [],
          "resources": []
        }
      ]
    },
    {
      "tier": 1,
      "label": "Start Here",
      "skills": [
        {
          "skill": "React",
          "status": "To Learn",
          "priority": "High",
          "category": "Framework",
          "estimatedTime": "4 weeks",
          "dependencies": ["JavaScript", "HTML", "CSS"],
          "resources": [
            {
              "name": "React - The Complete Guide",
              "platform": "Udemy",
              "url": "https://...",
              "free": false
            }
          ]
        }
      ]
    },
    { "tier": 2, "label": "Next Steps",      "skills": [] },
    { "tier": 3, "label": "Advanced/Optional","skills": [] }
  ]
}
```

### Error Response
```json
{ "message": "Failed to generate visual roadmap", "error": "<error.message>" }
```

---

## Backend: Visual Roadmap Service (`visualRoadmapService.js`)

**AI Model:** Google Gemini `gemini-1.5-flash`  
**Package:** `@google/generative-ai` v0.24.1

### `generateVisualRoadmap(profile)`

**Step 1 — Get raw learning path:**
```javascript
const roadmapData = await generateRoadmap(profile);
const learningPath = roadmapData.learningPath || [];
```
Calls the existing `roadmapGenerator.js` (Groq + GitHub + Stack Overflow) to get the base skill list.

**Step 2 — Initialize Gemini:**
```javascript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```
If `GEMINI_API_KEY` is missing → immediately falls back to `generateFallbackRoadmap()`.

**Step 3 — Build prompts:**

*System prompt:*
> "You are an expert career learning path architect. Your job is to take a list of technical skills and organize them into a structured, visual learning roadmap. You must analyze dependencies between skills, group skills into ordered TIERS (Tier 0 = Mastered, Tier 1 = learn first, etc.), assign each skill a category (Language, Framework, Tool, Database, DevOps), and for each non-mastered skill return 3 real course resources with working URLs from Udemy, Coursera, YouTube, or official docs. Return ONLY valid JSON, no markdown."

*User prompt:* includes `targetJob`, `experienceLevel`, and the full `learningPath` JSON array.

**Step 4 — Call Gemini and parse:**
```javascript
const result = await model.generateContent([systemPrompt, userPrompt]);
const jsonString = result.response.text().replace(/```json|```/g, '').trim();
const tieredRoadmap = JSON.parse(jsonString);
```
- Strips markdown code fences in case Gemini disobeys the "no markdown" instruction.
- Falls back to `generateFallbackRoadmap()` on JSON parse failure.

**Step 5 — Return tiered structure.**

---

### `generateFallbackRoadmap(learningPath)` (no Gemini needed)

Used when `GEMINI_API_KEY` is absent or Gemini fails. Organizes skills by their existing `priority` and `status` fields:

| Condition | Assigned Tier |
|---|---|
| `status === "Mastered"` | Tier 0 — "Mastered" |
| `priority === "High"` | Tier 1 — "Start Here" |
| `priority === "Medium"` | Tier 2 — "Next Steps" |
| `priority === "Low"` | Tier 3 — "Advanced/Optional" |

- All skills assigned `category: "General"` (no Gemini categorization).
- Empty tiers (`skills.length === 0`) are filtered out before returning.

---

## Frontend: `VisualRoadmap.jsx`

### State
| State Variable | Type | Purpose |
|---|---|---|
| `data` | Object \| null | API response `{ tiers, targetJob }` |
| `loading` | Boolean | Full-page loading state (first fetch) |
| `error` | String \| null | Error message for error screen |
| `selectedSkill` | Object \| null | The skill whose detail panel is open |
| `refreshing` | Boolean | Spinner state during background refresh |

### Derived State
```javascript
const progress = useMemo(() => {
  let total = 0, mastered = 0;
  data.tiers.forEach(tier => {
    tier.skills.forEach(skill => {
      total++;
      if (skill.status === 'Mastered') mastered++;
    });
  });
  return total > 0 ? Math.round((mastered / total) * 100) : 0;
}, [data]);
```

---

## UI Sections

### 1. Header Card

Located at the top, `max-w-4xl`, white card with rounded corners.

**Contents:**
- Pill label: "LEARNING ROADMAP" (uppercase, indigo-500, 11px)
- `h1`: target job title (e.g., "Full Stack Developer")
- **"Regenerate Path" button:** triggers `fetchRoadmap(true)` — adds `?refresh=true` — spins `RefreshCw` icon while loading; disabled during refresh
- **Progress bar:**
  - Label: "Overall Mastery Progress"
  - Right-aligned percentage value in indigo-600
  - Full-width pill bar (`h-2.5`, `bg-gray-100` track, `bg-indigo-500` fill)
  - `transition-all duration-1000 ease-out` animation on width

---

### 2. Vertical Timeline

`max-w-[800px]`, centered via `mx-auto`.

**Center spine:**
```css
position: absolute;
left: 50%;
transform: translateX(-50%);
width: 3px;
opacity: 0.4;
background: linear-gradient(to bottom, #6366f1, #8b5cf6, #6366f1);
```

**Tier separators** — appear between tier groups:
- Full-width horizontal rule with a centered pill label
- Pill color-coding by tier index:

| Tier Index | Label | Color |
|---|---|---|
| 0 | Mastered | green-50 bg, green-600 text, green-200 border |
| 1 | Start Here | indigo-50 bg, indigo-600 text, indigo-200 border |
| 2 | Next Steps | purple-50 bg, purple-600 text, purple-200 border |
| 3 | Advanced/Optional | orange-50 bg, orange-600 text, orange-200 border |

---

### 3. Skill Cards (Timeline Nodes)

Each skill in a tier renders as a card alternating left/right based on `skillIdx % 2 === 0`.

**Connector dot** (absolute, centered on the spine):
| Skill condition | Dot style |
|---|---|
| `status === "Mastered"` | `bg-green-500 border-green-200 ring-4 ring-green-50` |
| `priority === "High"` | `bg-indigo-500 border-indigo-200 ring-4 ring-indigo-50` |
| `priority === "Medium"` | `border-purple-400 bg-white` |
| Low / default | `border-gray-300 bg-white` |

**Left accent border** (`border-l-4`) on each card mirrors the dot color.

**Horizontal connector line** — 8px (`w-8`) line from card edge to spine center, hidden on mobile, `opacity-60`.

**Card content:**
- Skill name (`font-bold`, hovers to `text-indigo-600`)
- Status badge: "✓ MASTERED" (green) or "HIGH PRIORITY" (indigo) badge — only one shown
- `category` badge — gray-50 background, rounded-md
- `estimatedTime` — Clock icon + text (gray-400)
- Click → opens **Side Panel** for that skill (`setSelectedSkill(skill)`)

---

### 4. Legend

Below the timeline, centered, white card:

| Dot | Meaning |
|---|---|
| Solid green + green ring | Mastered |
| Solid indigo + indigo ring | High Priority |
| White + purple border | Medium |
| White + gray border | Low Priority |

---

### 5. Skill Detail Side Panel

Slides in from the right when `selectedSkill !== null`.

**Container:** `fixed top-0 right-0 h-full w-full max-w-sm sm:w-[420px]`, `z-50`, `overflow-y-auto`.  
**Animation:** `translateX(0)` ↔ `translateX(100%)` with `transition-transform duration-500 ease-in-out`.  
**Backdrop:** `fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40` — clicking it closes the panel.

**Panel contents (top to bottom):**

1. **Close button** — top-right, gray-50 bg, `X` icon, closes panel on click
2. **Skill title** — 4xl, font-black, tracking-tight
3. **Category badge** — gray-50 pill
4. **Priority badge** — color by priority (indigo/purple/gray); hidden if Mastered
5. **Info box** (gray-50, rounded-3xl):
   - Clock icon + estimated time
   - Prerequisites list (if `dependencies.length > 0`) — each shown as white pill badge
6. **Resources section header** — BookOpen icon + "Learning Resources"
7. **Resources list** (if `status !== "Mastered"` and `resources.length > 0`):

   Per resource card:
   - **Platform icon** (top-left):
     | Platform | Icon | Color |
     |---|---|---|
     | YouTube | `Youtube` | red-500 |
     | Udemy | `ChevronRight` | purple-500 |
     | Coursera | `GraduationCap` | blue-500 |
     | Other | `Globe` | gray-400 |
   - **Free/Paid badge** (top-right):
     - `FREE` — green-100 bg, green-700 text
     - `PAID` — orange-100 bg, orange-700 text
   - Resource name (2-line clamp, `h-10`)
   - **"Launch Course" button** — indigo-600, opens URL in new tab (`target="_blank"`, `rel="noopener noreferrer"`), `ArrowRight` icon

8. **Mastered state** (if `status === "Mastered"`):
   - Green card with shield/check icon
   - "Achievement Unlocked!" heading
   - Motivational message

9. **Empty resources state:**
   - Dashed gray border card
   - "No specific resources indexed for this skill yet."

---

## Loading & Error States

### Loading Skeleton

Shown when `loading === true && refreshing === false`:

```
┌─────────────────────────────┐
│ [gray bar] [gray bar - wide]│  ← header skeleton
│ [progress bar placeholder]  │
└─────────────────────────────┘

     [left card] ● [right card]   ← 3 timeline rows
     [left card] ● [right card]
     [left card] ● [right card]
```

All elements use `animate-pulse bg-gray-200 rounded-xl`.

### Error Screen

Full-screen centered card with:
- Red circle icon (`Info`, 40px, red-500)
- Error message text
- "Retry Loading" button → calls `fetchRoadmap()` again
- Card style: `rounded-[2.5rem]`, `shadow-xl`, `max-w-md`

### Refresh State

When `refreshing === true` (background refresh after initial load):
- "Regenerate Path" button shows "Refreshing..." and spins the `RefreshCw` icon
- The existing roadmap remains visible — no full-page skeleton shown

---

## Caching

| Aspect | Detail |
|---|---|
| Cache location | `user.careerInfo.visualRoadmap` in MongoDB User document |
| Cache invalidation | Only when `?refresh=true` query param is sent |
| No time-based expiry | Cache persists until user clicks "Regenerate Path" |
| Profile update | Changing profile does **not** auto-invalidate visual roadmap cache (unlike classic roadmap) |

---

## Related Systems

| Related System | Interaction |
|---|---|
| `roadmapGenerator.js` | Called first to generate base `learningPath` (Groq + GitHub + Stack Overflow) |
| `config/roleSkills.js` | Consulted by roadmapGenerator as a fallback skill source |
| Classic Roadmap (`/roadmap`) | Separate page; linear layout; same underlying data source |
| Dashboard | Shows the same Mastered/Learning/To Learn skill columns |
| User Model | `careerInfo.visualRoadmap` field stores the cached tiered structure |

---

## Environment Variables

| Variable | Required | Effect |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Enables Gemini 1.5-flash AI tiering; falls back gracefully if absent |
| `GROQ_API_KEY` | Required | Powers the underlying `roadmapGenerator.js` that Visual Roadmap depends on |
| `GITHUB_TOKEN` | Optional | Improves `roadmapGenerator.js` skill sourcing quality |

---

## Skill Data Schema (per skill node)

```typescript
{
  skill:         string;          // e.g. "React"
  status:        string;          // "Mastered" | "Learning" | "To Learn"
  priority:      string;          // "High" | "Medium" | "Low"
  category:      string;          // "Language" | "Framework" | "Tool" | "Database" | "DevOps" | "General"
  estimatedTime: string;          // e.g. "4 weeks" | "Completed"
  dependencies:  string[];        // prerequisite skill names
  resources: [
    {
      name:     string;           // course/resource title
      platform: string;           // "YouTube" | "Udemy" | "Coursera" | <other>
      url:      string;           // direct link
      free:     boolean;          // true = FREE badge, false = PAID badge
    }
  ]
}
```

---

## Security Notes

- All API calls include `Authorization: Bearer <token>` header via `getAuthHeaders()`.
- Resource URLs (`res.url`) are opened with `target="_blank" rel="noopener noreferrer"` to prevent tab-napping.
- No user-supplied content is rendered as raw HTML — all values are inserted as React text nodes.
- JWT token absence redirects to `/login` rather than showing an error.
