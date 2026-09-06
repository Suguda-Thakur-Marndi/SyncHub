# Calendar Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Workspace Calendar (`/workspace/:workspaceId/calendar`)

## 1. Information Architecture
- **Header:** Title "Calendar", month/year display, Previous/Next month buttons, "Today" jump button, Project filter dropdown, Status filter.
- **Calendar Grid Layout (7-Day Week):**
  - Weekday headers (Mon, Tue, Wed, Thu, Fri, Sat, Sun).
  - Monthly cell matrix generated with `date-fns`.
  - Today's cell highlighted with distinct indigo ring (`ring-2 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20`).
  - Active cell selection with blue border.
  - Task chips inside dates: clamped to 2 visible chips + "+N more" badge popover.
- **Side Inspector Panel (Desktop 1/3 col):**
  - Shows selected date header (e.g. "Wednesday, September 16, 2026").
  - List of all deadlines and milestones on that day.
  - Quick action "+ Add task for this day".

## 2. Deviations from MASTER.md
- **Touch Targets:** Calendar day cells have minimum height of 90px on desktop and 48px on mobile to ensure accessible touch targets.
- **Mobile Adaptation:** On 375px screens, the full grid adapts to a compact date carousel + scrollable agenda list for selected date.
