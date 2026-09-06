# Reports & Analytics Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Reports & Project Analytics (`/workspace/:workspaceId/reports`)

## 1. Information Architecture
- **Header:** Title "Reports & Analytics", project scope selector (All Projects vs. Specific Project), Date range picker (Last 7 days, Last 30 days, This Quarter), "Export Report (CSV/Summary)" button.
- **Top Metrics Row:**
  - Overall Workspace Completion Rate (Gauge / Velocity Meter with target benchmark).
  - On-Time Delivery Rate % (with overdue task count breakdown).
  - Active Contributors (team members with tasks completed this period).
  - Average Task Turnaround Time.
- **Analytical Visualizations (UI/UX Pro Max Guidelines):**
  - **Task Status Breakdown:** Segmented bar chart showing `TODO`, `IN PROGRESS`, `IN REVIEW`, `BLOCKED`, `DONE` with percentages.
  - **Workload Distribution by Team Member:** Horizontal stacked bar showing assigned vs. completed tasks per member.
  - **Weekly Velocity Trend:** Accessible line chart tracking tasks created vs. tasks completed over time.
  - **Project Health Table:** List of all projects, progress %, overdue count, lead assignee, status badge.

## 2. Accessibility & Zero-Decorative Rule
- Every chart includes:
  - Accessible data table toggle for screen readers and keyboard users.
  - High-contrast colors with distinct labels and patterns (never color alone).
  - Explicit numeric tooltips on hover/focus.
