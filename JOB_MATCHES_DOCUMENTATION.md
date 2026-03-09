# Job Matches Feature — Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Backend](#backend)
   - [Environment Variables](#environment-variables)
   - [Service: jobMatchingService.js](#service-jobmatchingservicejs)
   - [Route: routes/jobs.js](#route-routesjobsjs)
   - [Schema: User.jobMatchCache](#schema-userjobmatchcache)
   - [API Reference](#api-reference)
5. [Frontend](#frontend)
   - [Page: JobMatches.jsx](#page-jobmatchesjsx)
   - [Component Tree](#component-tree)
   - [State Management](#state-management)
   - [UI Interactions](#ui-interactions)
6. [Data Flow — Step by Step](#data-flow--step-by-step)
7. [Skill Matching Algorithm](#skill-matching-algorithm)
8. [Caching Mechanism](#caching-mechanism)
9. [Score & Label Logic](#score--label-logic)
10. [Add to Roadmap Flow](#add-to-roadmap-flow)
11. [Router & Navigation](#router--navigation)
12. [Error Handling](#error-handling)
13. [Skill Keyword Reference](#skill-keyword-reference)
14. [Prerequisites & Setup](#prerequisites--setup)

---

## Overview

The **Job Matches** dashboard fetches real job listings from the **Adzuna Jobs API**, scores each job against the logged-in user's current skill set and target job role, and presents ranked results with actionable insights — including which skills the user already has, which are missing, and a one-click "Add to Roadmap" button to automatically add missing skills to the user's learning profile.

---

## Architecture

```
Browser (React)
    │
    │  GET /api/jobs/matches  (JWT Bearer token)
    ▼
Express Server  ──►  authMiddleware (verifies JWT)
    │
    │  reads user.profile.targetJob + currentSkills
    ▼
jobMatchingService.js
    │
    │  GET https://api.adzuna.com/v1/api/jobs/in/search/1
    ▼
Adzuna API  (returns raw job listings)
    │
    │  skill extraction + scoring per job
    ▼
Scored + sorted results
    │
    │  saved to user.profile.jobMatchCache in MongoDB
    ▼
JSON response  ──►  React renders job cards
```

---

## File Structure

```
server/
├── services/
│   └── jobMatchingService.js     # Adzuna API call + skill extraction + scoring
├── routes/
│   └── jobs.js                   # Express router — GET /api/jobs/matches
├── models/
│   └── User.js                   # jobMatchCache field on profile sub-schema
└── index.js                      # Mounts /api/jobs router

src/
├── pages/
│   └── JobMatches.jsx            # React page component
├── components/
│   └── Sidebar.jsx               # Navigation link added
└── App.jsx                       # Routes /dashboard/jobs + /dashboard/job-matches
```

---

## Backend

### Environment Variables

Add these to `server/.env`:

```env
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_api_key
```

Obtain credentials by registering at [https://developer.adzuna.com](https://developer.adzuna.com).

---

### Service: `jobMatchingService.js`

**Location:** `server/services/jobMatchingService.js`

This is the core business logic layer. It has three responsibilities:

#### 1. `extractSkills(text)`

Scans a block of text (job title + description + category) for known tech skill keywords.

- Uses a **55+ keyword hardcoded array** (`TECH_SKILLS`)
- Matching is **case-insensitive**
- Uses a **negative lookahead/lookbehind regex** to prevent false positives  
  (e.g. `"r"` won't match inside the word `"error"`)

```js
const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
```

#### 2. `getMatchLabel(score)`

Converts a numeric score (0–100) to a human-readable label:

| Score Range | Label          |
|-------------|----------------|
| 75 – 100    | Strong Match   |
| 50 – 74     | Good Match     |
| 25 – 49     | Partial Match  |
| 0 – 24      | Low Match      |

#### 3. `getMatchedJobs({ targetJob, resultsPerPage, userSkills })`

**Parameters:**

| Parameter        | Type       | Default | Description                              |
|------------------|------------|---------|------------------------------------------|
| `targetJob`      | `string`   | required | Search query sent to Adzuna              |
| `resultsPerPage` | `number`   | `20`    | Max results to fetch                     |
| `userSkills`     | `string[]` | `[]`    | User's current skills from their profile |

**Process:**

1. Validates `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` exist
2. Calls `GET https://api.adzuna.com/v1/api/jobs/in/search/1` with `axios`
3. For each job result:
   - Concatenates `title + description + category.label`
   - Runs `extractSkills()` → `requiredSkills[]`
   - Computes `matchedSkills` = intersection of `userSkills` and `requiredSkills`
   - Computes `missingSkills` = `requiredSkills` not in `userSkills`
   - Calculates `matchScore = round((matchedSkills.length / requiredSkills.length) * 100)`
   - Assigns `matchLabel` via `getMatchLabel()`
4. Sorts all jobs by `matchScore` descending
5. Returns the sorted array

**Returned job object shape:**

```json
{
  "title": "Senior React Developer",
  "company": "TechCorp Ltd",
  "location": "London, Greater London",
  "salary_min": 60000,
  "salary_max": 80000,
  "redirect_url": "https://www.adzuna.co.uk/jobs/...",
  "description": "We are looking for...",
  "matchScore": 83,
  "matchedSkills": ["react", "typescript", "node.js"],
  "missingSkills": ["kubernetes", "terraform"],
  "matchLabel": "Strong Match"
}
```

---

### Route: `routes/jobs.js`

**Location:** `server/routes/jobs.js`  
**Mounted at:** `GET /api/jobs/matches`  
**Auth:** Required — `authMiddleware` verifies JWT and sets `req.userId`

#### Flow

```
Request arrives
    │
    ├─ Find user by req.userId
    ├─ Guard: 404 if user not found
    ├─ Guard: 400 if user.profile.targetJob is not set
    │
    ├─ Check ?refresh=true query param
    │
    ├─ [CACHE HIT]: if cache exists + age < 3 hours + no refresh flag
    │       └─ return { source: "cache", generatedAt, results }
    │
    └─ [CACHE MISS / REFRESH]:
            ├─ call getMatchedJobs({ targetJob, userSkills: currentSkills })
            ├─ save results to user.profile.jobMatchCache
            ├─ user.save()
            └─ return { source: "live", generatedAt, results }
```

#### Query Parameters

| Param     | Type    | Description                             |
|-----------|---------|-----------------------------------------|
| `refresh` | `true`  | Bypasses cache and forces a fresh fetch |

#### Response Shape

```json
{
  "source": "cache",
  "generatedAt": "2026-03-09T10:30:00.000Z",
  "results": [ ...scoredJobObjects ]
}
```

---

### Schema: `User.jobMatchCache`

**Location:** `server/models/User.js` — inside `profile` sub-schema

```js
jobMatchCache: {
  data: { type: Array, default: [] },
  generatedAt: { type: Date }
}
```

| Field         | Type   | Description                            |
|---------------|--------|----------------------------------------|
| `data`        | Array  | Cached scored job results array        |
| `generatedAt` | Date   | Timestamp of when the cache was saved  |

Cache is invalidated automatically when:
- The cached timestamp is older than **3 hours**
- The client sends `?refresh=true`

---

### API Reference

#### `GET /api/jobs/matches`

| Property     | Value                              |
|--------------|------------------------------------|
| URL          | `http://localhost:5000/api/jobs/matches` |
| Method       | `GET`                              |
| Auth         | `Authorization: Bearer <jwt>`      |
| Query Params | `?refresh=true` (optional)         |

**Success Response `200`:**

```json
{
  "source": "live",
  "generatedAt": "2026-03-09T10:00:00.000Z",
  "results": [
    {
      "title": "...",
      "company": "...",
      "location": "...",
      "salary_min": 50000,
      "salary_max": 70000,
      "redirect_url": "https://...",
      "description": "...",
      "matchScore": 75,
      "matchedSkills": ["react", "node.js"],
      "missingSkills": ["docker"],
      "matchLabel": "Strong Match"
    }
  ]
}
```

**Error Responses:**

| Status | Condition                                     |
|--------|-----------------------------------------------|
| `400`  | User has no `targetJob` set on their profile  |
| `401`  | Missing or invalid JWT token                  |
| `404`  | User not found in database                    |
| `500`  | Adzuna API failure or internal server error   |

---

## Frontend

### Page: `JobMatches.jsx`

**Location:** `src/pages/JobMatches.jsx`  
**Routes:** `/dashboard/jobs`, `/dashboard/job-matches`

---

### Component Tree

```
JobMatches (default export)
├── Toast                    # Fixed bottom-right notification
├── Page header              # "Job Matches" title + count + last updated time
├── Filter bar
│   ├── <select>             # matchLabel filter dropdown
│   ├── <input>              # title/company search
│   └── Refresh <button>     # forces ?refresh=true fetch
├── [loading]  → 3× SkeletonCard
├── [error]    → Error panel
├── [empty]    → Empty state message
└── [results]  → JobCard[]
        ├── Title + matchLabel badge
        ├── Company + location
        ├── Salary range
        ├── Matched skills (green chips)
        ├── Missing skills (gray chips, max 5 + "+N more")
        └── Action buttons
            ├── "View Job"        → opens redirect_url in new tab
            └── "Add to Roadmap"  → merges missingSkills into user profile
```

---

### State Management

All state is local (`useState`). No global store is used.

| State variable  | Type      | Purpose                                        |
|-----------------|-----------|------------------------------------------------|
| `jobs`          | `array`   | Full list of jobs returned from API            |
| `loading`       | `boolean` | Controls skeleton display                      |
| `error`         | `string`  | Holds error message if fetch fails             |
| `generatedAt`   | `Date`    | Timestamp shown in subtitle                    |
| `labelFilter`   | `string`  | Selected matchLabel filter (`"All"` by default)|
| `searchQuery`   | `string`  | Live text search value                         |
| `toast`         | `object`  | `{ message, type }` — shown for 3.5 seconds    |
| `addingJob`     | `string`  | `redirect_url` of the job currently being added|

Filtering is computed inline with `Array.filter()` on every render — no `useEffect` needed since the source `jobs` array never changes until a new API call is made.

---

### UI Interactions

#### On Mount
```
useEffect → fetchJobs(false)
         → GET /api/jobs/matches
         → sets jobs[], generatedAt
```

#### Refresh Button
```
onClick → fetchJobs(true)
       → GET /api/jobs/matches?refresh=true
       → bypasses 3-hour cache
       → re-renders all cards
```

#### Match Label Dropdown
- Filters `jobs[]` client-side
- Options: `All`, `Strong Match`, `Good Match`, `Partial Match`, `Low Match`
- Does **not** trigger a new API call

#### Title / Company Search
- Live client-side filter on `job.title` and `job.company`
- Case-insensitive substring match
- Does **not** trigger a new API call

#### "View Job" Button
- Opens `job.redirect_url` in a new browser tab
- `rel="noopener noreferrer"` for security

#### "Add to Roadmap" Button
- Only shown when `job.missingSkills.length > 0`
- Disabled while request is in flight (shows "Adding…")
- Flow:
  1. `GET /api/profile` — loads current `currentSkills[]`
  2. Merges `missingSkills` using `Set` (no duplicates)
  3. `PUT /api/profile` with merged `currentSkills[]`
  4. Shows green success toast for 3.5 seconds
  5. Shows red error toast on failure

---

### Match Badge Color Coding

| Label          | Badge Style                          |
|----------------|--------------------------------------|
| Strong Match   | Green background, green text         |
| Good Match     | Yellow background, yellow text       |
| Partial Match  | Orange background, orange text       |
| Low Match      | Red background, red text             |

---

### Salary Formatting

| Condition           | Display                |
|---------------------|------------------------|
| Both min and max    | `£60k – £80k`          |
| Min only            | `From £60k`            |
| Max only            | `Up to £80k`           |
| Neither             | `Not disclosed`        |

Salary values are divided by 1000 and rounded for display.

---

## Data Flow — Step by Step

```
1. User opens /dashboard/jobs
2. JobMatches component mounts
3. fetchJobs(false) is called
4. GET /api/jobs/matches  +  Authorization: Bearer <token>
5. authMiddleware decodes token → req.userId
6. Route handler loads User from MongoDB
7. Reads user.profile.targetJob  (e.g. "Full Stack Developer")
8. Reads user.profile.currentSkills  (e.g. ["react", "node.js", "mongodb"])
9. Checks jobMatchCache:
   ├─ If fresh (< 3h) and not refresh → return cached data
   └─ Else → call getMatchedJobs()
        ├─ axios GET → Adzuna API  (query: "Full Stack Developer", results: 20)
        ├─ For each job:
        │   ├─ extract required skills from title + description
        │   ├─ intersect with user's currentSkills → matchedSkills
        │   ├─ difference → missingSkills
        │   ├─ matchScore = (matched / required) * 100
        │   └─ matchLabel = score tier
        └─ sort by matchScore DESC
10. Save to user.profile.jobMatchCache in MongoDB
11. Return JSON to client
12. React renders 3 skeleton cards while loading
13. On response: renders JobCard list sorted by match score
14. User can filter/search client-side without extra API calls
```

---

## Skill Matching Algorithm

### Input
- `requiredSkills` — skills found in the job's text
- `userSkills` — `user.profile.currentSkills` (from MongoDB)

### Formula

$$\text{matchScore} = \left\lfloor \frac{|\text{matchedSkills}|}{|\text{requiredSkills}|} \times 100 \right\rceil$$

### Edge Cases

| Situation                           | Behaviour                                   |
|-------------------------------------|---------------------------------------------|
| Job has no detectable skills        | `matchScore = 0`, `matchLabel = "Low Match"` |
| `userSkills` array is empty         | All extracted skills treated as "matched"    |
| Skill appears twice in description  | Counted once (set-based extraction)          |
| Short keywords like `r`, `go`       | Protected by negative lookahead regex        |

---

## Caching Mechanism

| Property       | Value                               |
|----------------|-------------------------------------|
| Cache location | `user.profile.jobMatchCache` in MongoDB |
| TTL            | 3 hours (`3 * 60 * 60 * 1000` ms)  |
| Bypass param   | `?refresh=true`                     |
| Cache key      | Per-user (tied to `req.userId`)     |

Cache is stored on the user document itself — no separate collection. This means the cache is automatically scoped per user and persists across sessions.

**Cache hit response includes:** `"source": "cache"`  
**Fresh response includes:** `"source": "live"`

---

## Score & Label Logic

```js
function getMatchLabel(score) {
  if (score >= 75) return 'Strong Match';   // green
  if (score >= 50) return 'Good Match';     // yellow
  if (score >= 25) return 'Partial Match';  // orange
  return 'Low Match';                       // red
}
```

---

## Add to Roadmap Flow

```
User clicks "Add to Roadmap" on a job card
    │
    ▼
GET /api/profile
    │  returns { profile: { currentSkills: [...] } }
    ▼
Merge: [...new Set([...currentSkills, ...job.missingSkills])]
    │  deduplicates automatically
    ▼
PUT /api/profile  { currentSkills: mergedArray }
    │
    ├─ Success → green toast: "N skill(s) added to your roadmap!"
    └─ Failure → red toast: error message
```

The merge uses `Set` to prevent adding duplicate skills. The operation is non-destructive — it only appends new skills without removing existing ones.

---

## Router & Navigation

### App.jsx Routes

```jsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route path="jobs"        element={<JobMatches />} />
  <Route path="job-matches" element={<JobMatches />} />
</Route>
```

Both `/dashboard/jobs` and `/dashboard/job-matches` render the same `JobMatches` component.

### Sidebar

```jsx
{ name: 'Job Matches', path: '/dashboard/jobs', icon: <Briefcase size={20} /> }
```

The sidebar entry uses the `Briefcase` icon from `lucide-react`.

---

## Error Handling

### Backend

| Layer              | Error                         | HTTP Status | Message                                              |
|--------------------|-------------------------------|-------------|------------------------------------------------------|
| Route              | User not found                | 404         | `"User not found."`                                  |
| Route              | No targetJob on profile       | 400         | `"No target job set on your profile..."`             |
| Service            | Missing env vars              | 500         | `"ADZUNA_APP_ID and ADZUNA_APP_KEY must be set."`   |
| Service            | Adzuna API timeout (15s)      | 500         | Axios timeout error message                          |
| authMiddleware     | Invalid/missing JWT           | 401         | `"Not authorized, token failed"` / `"no token"`     |

### Frontend

| Scenario              | UI Behaviour                                          |
|-----------------------|-------------------------------------------------------|
| Network/API error     | Red error panel with message below the filter bar     |
| No targetJob (400)    | Error panel: "No target job set on your profile..."   |
| Add to Roadmap fails  | Red toast bottom-right, auto-dismisses after 3.5s     |
| Loading               | 3 animated skeleton cards                             |
| Empty filtered list   | "No jobs match your filters" message                  |

---

## Skill Keyword Reference

The full list of 55+ skills used for extraction:

**Languages:** `javascript`, `typescript`, `python`, `java`, `c#`, `c++`, `go`, `rust`, `ruby`, `php`, `swift`, `kotlin`, `scala`, `r`, `matlab`, `perl`

**Frontend Frameworks:** `react`, `angular`, `vue`, `next.js`, `nuxt`, `svelte`, `redux`

**Backend Frameworks:** `node.js`, `express`, `fastapi`, `django`, `flask`, `spring`, `rails`

**APIs/Protocols:** `graphql`, `rest`, `grpc`, `websocket`

**DevOps/Cloud:** `docker`, `kubernetes`, `terraform`, `ansible`, `jenkins`, `github actions`, `aws`, `azure`, `gcp`, `heroku`, `vercel`

**Databases:** `mongodb`, `postgresql`, `mysql`, `sqlite`, `redis`, `elasticsearch`, `cassandra`, `dynamodb`, `firebase`, `supabase`

**System/Tools:** `git`, `linux`, `bash`, `nginx`, `apache`

**ML/Data:** `machine learning`, `deep learning`, `tensorflow`, `pytorch`, `scikit-learn`, `pandas`, `numpy`, `spark`, `kafka`, `hadoop`

**UI/CSS:** `html`, `css`, `sass`, `tailwind`, `bootstrap`

**Testing:** `jest`, `mocha`, `cypress`, `selenium`, `pytest`

**Practices:** `microservices`, `ci/cd`, `devops`, `agile`, `scrum`

---

## Prerequisites & Setup

1. **Adzuna API credentials** — register at [developer.adzuna.com](https://developer.adzuna.com)

2. **Add to `server/.env`:**
   ```env
   ADZUNA_APP_ID=your_app_id
   ADZUNA_APP_KEY=your_app_key
   ```

3. **User profile must have `targetJob` set** — the feature will return a 400 error otherwise. Users set this via the Profile page (`/dashboard/profile`).

4. **`axios` is already a dependency** in `server/package.json` — no additional install needed.

5. **Country targeting** — the Adzuna endpoint is currently hardcoded to **India** (`/jobs/in/`). To change the country, update the URL in `jobMatchingService.js`:
   ```js
   // India:       /v1/api/jobs/in/search/1
   // UK:          /v1/api/jobs/gb/search/1
   // USA:         /v1/api/jobs/us/search/1
   // Australia:   /v1/api/jobs/au/search/1
   ```
