# Project Workspace & Overview Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Project Workspace (`/workspace/:workspaceId/project/:projectId`)

## 1. Information Architecture
- **Persistent Project Header:**
  - Project emoji/symbol, Title, Description editable toggle.
  - Team member avatar roster with quick "+ Add Member" trigger.
  - Quick action toolbar: "Add Task", "Share Project", "Project Settings".
- **Primary Workspace Tabs:**
  1. **Overview:** Project metrics (Total, Overdue, Completed, In Progress), Milestones roadmaps, Recent activity.
  2. **Tasks (Table):** Rich TanStack data grid with multi-column sorting, filtering, and bulk operations.
  3. **Board (Kanban):** Drag-and-drop columns (`TODO`, `IN PROGRESS`, `IN REVIEW`, `BLOCKED`, `DONE`) with move controls.
  4. **Timeline (Gantt):** Chronological milestone and task schedule bars with dependencies.
  5. **Calendar:** Project-specific monthly deadline grid.
  6. **Files:** Project file assets, downloads, previews, and attachments.
  7. **Discussions:** Team comments, threads, and @mentions.
  8. **Activity:** Audit log tracking all state mutations within the project.

## 2. Deviations from MASTER.md
- **Sticky Tab Bar:** Sub-navigation tabs remain sticky beneath the global header during long vertical scrolling.
- **Context Preservation:** Tab selection is synchronized with URL query params (`?tab=board`, `?tab=timeline`, etc.) using `nuqs`.
