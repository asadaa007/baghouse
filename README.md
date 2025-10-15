# 🐛 BugKiller

Modern bug tracking and lightweight project management built with React, TypeScript, Tailwind, and Firebase (Auth, Firestore, Storage).

This README covers installation, environment setup, scripts, high-level architecture, and where to find things in the codebase. For role-based step-by-step usage, see USER_MANUAL.md.

## Features

- Authentication: email/password via Firebase Auth
- Role-based access: super_admin, manager, team_lead, team_member
- Projects with team assignment
- Bugs per project with custom sequential IDs per project (e.g., #1, #2)
- Bug form with team assignee and optional external assignee (from other teams)
- Bug table with status/priority updates, view modal, edit modal, delete
- Comments, labels, attachments for bugs
- Team cards and team details modal with correct team-member counting (excluding super_admin)

## Tech Stack

- React + TypeScript + Vite + Tailwind CSS
- React Router DOM
- Firebase: Auth, Firestore, Storage
- ESLint for linting

## Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project with Auth, Firestore, Storage enabled

### Install
   ```bash
   npm install
   ```

### Environment
Create a .env file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Run
   ```bash
   npm run dev
   ```
Open http://localhost:5173

### Build
   ```bash
   npm run build
   ```

## Project Structure

```
src/
  components/
    bugs/             # BugFilters, BugTable, BugViewModal
    common/           # Button, Input, Modal, etc.
    dashboard/        # BugForm and dashboards per role
    layout/           # Header, Navigation
    projects/         # Project modals and cards
  context/            # AuthContext, BugContext, ProjectContext, TeamContext
  services/           # bugService, projectService, teamService, userService
  types/              # auth.ts, bugs.ts, projects.ts
  router/             # AppRouter
  pages/              # Home, Login, Dashboard, Projects, Bugs, Settings
```

## Key Behaviors

- Bugs are stored inside their owning project document in Firestore as an array field `bugs`.
- Each bug gets a per-project sequential `customId` (string like '1', shown as #1 in UI) and a unique `id` of the form `projectId_timestamp`.
- When creating/updating a bug, assignee names are resolved and stored (`assigneeName`, `externalAssigneeName`) for display in tables and modals.
- Team assignee list shows only team members from the selected project's team (role team_member). External assignee list shows only team members from other teams.
- Super admins have access to everything but are not counted in team-member lists or counts.

## Scripts

   ```bash
npm run dev       # start dev server
npm run build     # type-check + production build
npm run preview   # preview dist
npm run lint      # lint
```

## Firestore Model (simplified)

- users: { id, name, email, role, teamId?, createdAt, updatedAt }
- teams: { id, name, description?, managerId, teamLeadId?, members: string[], createdAt, updatedAt }
- projects: {
    id,
    name,
    description?,
    teamId,
    members?: { userId: string }[],
    bugs?: Bug[],
    createdAt, updatedAt
  }
- Bug (embedded in `projects.bugs`): {
    id, customId, projectId, title, description, priority, status,
    assignee?, assigneeName?, externalAssignee?, externalAssigneeName?,
    labels: string[], attachments: FileRef[], comments: Comment[],
    reporter, createdAt, updatedAt
  }

Notes:
- `serverTimestamp()` is used on project `updatedAt`, but not inside `arrayUnion` data. Bug timestamps use Date objects.

## Routing

See `src/router/AppRouter.tsx` for routes:
- `/` Home (public)
- `/login`, `/register` (public)
- `/dashboard`, `/projects`, `/projects/:projectId`, `/bugs`, `/bugs/:id`, `/settings` (protected)
- `/user-management` restricted to roles: super_admin, manager

## Development Notes

- Team member sync: `teamService.getAllTeams` and `getTeamsByManager` sync `members` from `users.teamId`.
- Bug permissions: `bugService.getBugs(user)` returns all bugs for super_admin/manager/team_lead, and team-scoped for team_member.
- Edit bug opens the same form modal prefilled with data; view modal shows details including assignee names.

## License

MIT