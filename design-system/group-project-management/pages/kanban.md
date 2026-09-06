# Kanban Board Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Component/View:** Kanban Board (`/workspace/:workspaceId/tasks` or `/workspace/:workspaceId/project/:projectId?tab=board`)

## 1. Information Architecture
- **Columns Structure:**
  1. `TODO` (Backlog & ready for dev)
  2. `IN PROGRESS` (Currently being worked on)
  3. `IN REVIEW` (Under review / QA)
  4. `BLOCKED` (Halted due to dependencies / issues)
  5. `DONE` (Verified & completed)
- **Column Header:** Column title, colored status dot, total task counter pill, "+ Quick Add Task" button.
- **Card Anatomies:**
  - Top row: Priority badge (`HIGH`, `MEDIUM`, `LOW`), Task ID (`#T-128`), and Quick Move Dropdown ("Move to...").
  - Middle: Task title (bold, 2-line max), project tag with color swatch.
  - Bottom row: Assignee avatar, due date chip (red if overdue, amber if due within 48 hours), subtask counter (`✓ 2/4`).

## 2. Interaction & Accessibility (WCAG 2.2 AA Compliance)
- **Drag & Drop:**
  - Dragging provides distinct visual elevation (`scale-[1.03] shadow-2xl rotate-1 opacity-90 cursor-grabbing`).
  - Drop targets highlight with dashed border and indigo tint background (`bg-indigo-50/50 dark:bg-indigo-950/30 border-2 border-indigo-400 border-dashed`).
- **Single-Pointer & Keyboard Alternative:**
  - As required by UI/UX Pro Max WCAG 2.2 guidelines, every card includes a "Move to..." menu button and keyboard shortcuts (`Alt+M` or `Enter` on button) enabling single-click status updates without dragging.
- **Mobile Responsive Behavior:**
  - On viewports < 768px, columns become swipeable horizontal tabs or a horizontal scrolling track with scroll snap, preventing messy column collapse.
