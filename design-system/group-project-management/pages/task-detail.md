# Task Detail Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Component:** Task Details Modal / Drawer (`TaskDetailsDialog`)

## 1. Information Architecture
- **Header:**
  - Task Code / ID chip (`JetBrains Mono` font, e.g. `TASK-1024`).
  - Project tag with emoji and link to parent project.
  - Task Title (inline-editable with Enter to commit).
  - Quick action toolbar: Delete Task (with confirmation), Copy Link, Close dialog (`Esc`).
- **Sidebar Attributes Grid:**
  - Status picker: Semantic badges for `BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`.
  - Priority selector: `LOW`, `MEDIUM`, `HIGH` with directional visual icons.
  - Assignee: User avatar, name, and search selector.
  - Due Date: Date picker with quick presets (Today, Tomorrow, Next Week) and overdue alerts.
- **Main Content Body:**
  - Description: Markdown preview / edit toggle with clean typography.
  - Subtasks checklist: Progress meter (`X of Y completed`), interactive checkboxes, quick-add input.
  - Activity & Comments stream: Chronological comments with author avatars, timestamps, and quick post form.

## 2. Accessibility & UX
- **Keyboard Navigation:** `Tab` moves through inputs; `Esc` dismisses; `Enter` submits new subtasks or comments.
- **Focus Management:** Focus trapped inside modal; initial focus on task title or description.
- **Status Change:** Single click updates state optimistically with instantaneous visual feedback.
