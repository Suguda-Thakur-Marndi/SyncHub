# Tasks Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Tasks Workspace (`/workspace/:workspaceId/tasks`)

## 1. Information Architecture
- **Header:** Title "All Tasks", description, view switchers (Table View vs. Kanban Board View vs. Calendar View), quick search, filter drawer trigger, and "+ New Task" button.
- **Faceted Filters Bar:**
  - Search input with clear button.
  - Project filter dropdown.
  - Status faceted filter multi-select (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`).
  - Priority filter (`LOW`, `MEDIUM`, `HIGH`).
  - Assignee filter with member avatars.
  - Clear all filters button (`Reset Filters`).
- **View Container:**
  - Dynamic render based on active view mode:
    - **Table View:** TanStack Table with sortable headers, sticky header, row hover actions, inline status changing, pagination.
    - **Kanban View:** 5 swimlane columns with task count indicators, card drag/drop + keyboard movement menu.
- **Task Detail Drawer / Modal:**
  - Triggered by clicking any task row or Kanban card.
  - Header: Task Title (editable), Status & Priority select dropdowns, Assignee select, Due Date picker.
  - Body: Rich Markdown description, Subtasks checklist with completion percentage bar, File attachments list, Comments & Mentions stream, Activity history audit.

## 2. Deviations from MASTER.md
- High density table view with condensed row heights (44px) for high throughput triage.
- Inline status change: clicking the status badge inside the table opens a lightweight popover to switch statuses instantly.
