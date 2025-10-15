# BugKiller User Manual

This guide explains how to use BugKiller by role, covering authentication, projects, bugs, and teams.

## Roles and Access

- super_admin: Full access to all projects, teams, and bugs. Not counted as a team member.
- manager: Full access to all bugs and projects. Team management actions where applicable.
- team_lead: Full access to all bugs and projects.
- team_member: Can see bugs for projects assigned to their own team; can be assigned bugs.

## Sign In / Registration

1) Go to Login.
2) Enter email and password.
3) The first registered user becomes super_admin. Others default to team_member.

## Navigation Overview

- Home: Public landing.
- Dashboard: Overview by role.
- Projects: List of projects.
- Project Detail: Project data and actions.
- Bugs: Central bug list with filters, view, edit, delete, and create.
- Settings: Profile/settings.
- User Management: super_admin and manager only.

## Projects

- Create projects via manager/admin flows.
- Each project has a team assignment (teamId).
- Bugs are stored inside the project document under `bugs`.

## Bugs

### Create a Bug

1) Go to Bugs.
2) Click New Bug.
3) In the modal:
   - Project (required)
   - Title and Description (required)
   - Priority and Status (optional)
   - Team Assignee: only team members from the selected project's team (role team_member)
   - External Assignee (optional): team members from other teams only
   - Attachments (optional)
4) Save.

Behavior:
- Per-project sequential customId (shown as #n) and unique id `projectId_timestamp`.
- Assignee names are resolved and stored for display.

### View a Bug

- Click View in the table to open the Bug View Modal.
- See title, description, status, priority, assignee names, labels, attachments, and comments.

### Edit a Bug

- Click Edit in the table to open the Bug Form prefilled.
- Update fields and save.

### Delete a Bug

- Click Delete in the table row or from the view modal and confirm.

### Filters and Search

- Search by title, description, or id.
- Filter by status, priority, labels, date range, and project.

## Teams

- Team cards and team details modal exclude super_admins from counts and lists.
- Member lists are synchronized from users collection via `teamId`.

## Tips

- If Team Assignee is empty, ensure the project has a `teamId` and users have matching `teamId` with role `team_member`.
- External Assignee excludes the selected project's team by design.

## Known Constraints

- Bugs are embedded in project documents; this enables simple per-project numbering.
- `serverTimestamp()` is used on project updates; embedded bug timestamps use client `Date` objects to work with Firestore arrays.
