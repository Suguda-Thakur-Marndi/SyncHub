# Team & Members Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Team & Members (`/workspace/:workspaceId/members`)

## 1. Information Architecture
- **Header:** Title "Team Members", total member count chip, Search input, Role filter dropdown (`Owner`, `Admin`, `Member`), and "Invite Member" button.
- **Invitation Hub Card:**
  - Fast invite link generation with one-click copy button and toast confirmation.
  - Email invite modal with role preset selection.
- **Members Data Table:**
  - User avatar + Full Name + Email address.
  - Role badge:
    - `OWNER`: Amber crown badge (`bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300`).
    - `ADMIN`: Indigo shield badge (`bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300`).
    - `MEMBER`: Slate user badge (`bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300`).
  - Active assigned tasks counter.
  - Joined date (formatted `MMM d, yyyy`).
  - Actions column (Change Role modal trigger, Remove Member confirmation dialog — guarded by RBAC permissions).
- **Permissions Reference Sheet:**
  - Accessible matrix explaining what Owner, Admin, and Member can view, create, edit, or delete.

## 2. Guardrails
- Cannot remove the last Workspace Owner.
- Destructive actions require typing confirmation or explicit confirmation dialog.
