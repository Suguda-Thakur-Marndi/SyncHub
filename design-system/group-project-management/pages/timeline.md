# Project Timeline & Gantt Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page/Tab:** Project Timeline (`/workspace/:workspaceId/project/:projectId?tab=timeline`)

## 1. Information Architecture
- **Controls Toolbar:** Time scale selector (Days, Weeks, Months), "Today" focus jump button, Milestone filter, Zoom In / Zoom Out buttons.
- **Split Layout:**
  - **Left Sidebar (Task Roster):** Task Title, Assignee avatar, Status badge, Start Date, Due Date.
  - **Right Canvas (Timeline Grid):** Horizontal chronological columns (Weeks/Days), interactive horizontal task duration bars with progress fill, and Milestone diamond markers.
- **Bar Styling:**
  - `TODO`: Slate bar with subtle striped pattern.
  - `IN_PROGRESS`: Indigo solid bar with completion % overlay.
  - `IN_REVIEW`: Purple solid bar.
  - `DONE`: Emerald green solid bar with check icon.
  - `BLOCKED`: Red alert bar with exclamation icon.
  - Milestones: Diamond flag badge `#6366F1` with milestone title tooltip.
- **Interactivity:**
  - Hover on bar displays tooltip with task title, assignee, date interval, and subtasks completed.
  - Clicking bar opens the Task Detail Drawer.

## 2. Accessibility & Fallbacks
- In addition to visual bars, a toggleable "Schedule Table" view provides a standard accessible data table of start/end dates for screen readers and keyboard users.
