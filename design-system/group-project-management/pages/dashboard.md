# Dashboard Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Workspace Dashboard (`/workspace/:workspaceId`)

## 1. Information Architecture
- **Greeting & Overview:** Dynamic time-aware greeting ("Good Morning / Afternoon / Evening, [User] 👋"), pending task count chip, active project count chip, quick action "New Project".
- **Primary Analytics Bar:** 4 KPI cards: Total Tasks, Completed Tasks, Overdue Tasks (urgency red), Workspace Velocity % (progress ring).
- **Two-Column Responsive Layout:**
  - **Left (Main 7/12 col):**
    1. Recent Projects quick-access cards with emoji/icon, active task counters, and team progress bars.
    2. Upcoming Deadlines widget (chronologically sorted tasks due within 7 days, with urgency flags).
    3. Recent Activity Stream (audit log of task completions, assignments, comments, milestone changes).
  - **Right (Sidebar 5/12 col):**
    1. Today's Tasks checklist (immediate focus for user).
    2. Team Members Roster (avatar list with roles and online/active indicators).
    3. Mini Calendar widget (interactive month view with deadline dots).
    4. Project Velocity & Milestone tracker.

## 2. Deviations from MASTER.md
- **Density:** 8.5/10 — compact card padding (`p-4` to `p-5`) to maximize viewport information without scrolling.
- **Micro-interactions:** Task cards highlight on hover with smooth 150ms transition. Overdue items pulse softly once on load.

## 3. Empty States
- When no projects exist: Centered illustration with call-to-action button "Create your first project" and template recommendations.
- When no tasks are due today: Celebratory clean state: "All clear for today! Enjoy your productive day or check upcoming sprint goals."
