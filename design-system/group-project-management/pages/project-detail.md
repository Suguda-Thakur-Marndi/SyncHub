# Project Detail Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Project Workspace & Details (`/workspace/:workspaceId/project/:projectId`)

## 1. Information Architecture
- **Header:**
  - Project identity: Custom emoji avatar badge, project title, status chip (`ACTIVE` / `COMPLETED`), description.
  - Project actions: Edit Project details modal, Create Task inside project CTA, Delete/archive option (permission-gated).
- **Navigation Tabs:**
  - `Overview`: High-level metrics, progress ring, task status breakdown, team workload, upcoming deadlines.
  - `Tasks`: High-density TanStack table filtered specifically to this project's tasks with search and inline status triage.
  - `Board`: Kanban swimlanes (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`) with drag-and-drop and single-pointer menu.
  - `Timeline`: Chronological Gantt/timeline view of task milestones and deadlines.
  - `Files`: Shared project documents, assets, and specifications.
  - `Discussions`: Team commentary stream with threaded messages.

## 2. Metrics & Analytics
- **Task Summary:** Live counts of Total Tasks, In Progress, Overdue, and Completed.
- **Progress Gauge:** Dynamic percentage calculated as `(Completed / Total) * 100%` with emerald progress bar.
- **Team Roster:** List of members assigned to active tasks within this project.

## 3. Deviations from MASTER.md
- **Density:** 8.5/10 — compact tab navigation bar with pill counters.
- **Micro-interactions:** Tab switching uses smooth opacity transition without layout shift.
