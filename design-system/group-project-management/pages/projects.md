# Projects Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Projects Directory (`/workspace/:workspaceId/projects`)

## 1. Information Architecture
- **Header:** Title "Projects", description, filter tabs (`All`, `Active`, `Completed`, `Archived`), search bar, and primary "New Project" button.
- **Grid Layout:** Responsive cards grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`).
- **Project Card Anatomies:**
  - Header: Emoji/Icon badge, Project title, Status chip (`ACTIVE` / `COMPLETED`), action menu (Edit, Settings, Delete).
  - Body: Description (clamped to 2 lines), Progress bar (% of tasks completed), Metric badges (Total tasks, Open issues, Overdue count).
  - Footer: Assignee / member avatars stack (`+N` overflow indicator), Created by / Updated timestamp.

## 2. Deviations from MASTER.md
- **Elevation:** Projects use interactive hover cards with subtle scale `scale-[1.01]` and indigo border tint on hover.
- **Empty State:** Distinct dashed border container with emoji icon and clear CTA "Create Project".
