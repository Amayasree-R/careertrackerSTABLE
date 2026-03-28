# Visual Roadmap Documentation

## 1. Overview
The Visual Roadmap is a core educational and motivational tool that charts a user's learning path. It visualizes the transition from their current skill set to their desired career role (e.g., "Junior Developer" to "Senior Full Stack Engineer").

## 2. Key Features
- **Interactive Graph/Timeline:** Displays milestones chronologically or conceptually using visual nodes (e.g., utilizing libraries like React Flow or D3.js).
- **Milestone Tracking:** Breakdowns of large goals into smaller, trackable units (Learn React -> Build 2 Projects -> Pass Frontend Quiz).
- **Progress Bars:** Clear indicators showing completion percentage for current phases.
- **Dynamic Updates:** Automatically checks off nodes on the roadmap as the user masters skills via quizzes or certificates.
- **Customizable Paths:** Users can select pre-defined career tracks (e.g., "Data Scientist") or generate custom maps based on unique job requirements.

## 3. Data Architecture & Schema
The Roadmap Schema typically includes:
- `userId`: Reference to user.
- `careerGoal` (String): Target title.
- `nodes` (Array of Objects): Each representing a step/milestone.
  - `id` (String): Unique identifier for the node.
  - `label` (String): Display name of the step.
  - `type` (Enum): e.g., 'skill', 'project', 'quiz', 'certificate'.
  - `status` (Enum): 'locked', 'in-progress', 'completed'.
  - `dependencies` (Array of Strings): IDs of prerequisite nodes.

## 4. User Flow
1. **Goal Setting:** User selects their target career or custom learning goal.
2. **Roadmap Generation:** System compiles the necessary skills and outputs a structured visual graph.
3. **Engagement:** User clicks a node (e.g., "Learn Node.js") to see resources or related quizzes.
4. **Completion:** User completes a relevant quiz or uploads a certificate, updating the node's status to green (completed).
5. **Advancement:** Next nodes in the path unlock automatically.

## 5. Potential Enhancements
- Gamification with badges or points when completing major roadmap sections.
- Social sharing of roadmaps so peers can follow identical learning paths.
