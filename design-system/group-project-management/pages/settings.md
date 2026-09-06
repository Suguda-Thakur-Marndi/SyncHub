# Settings Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Workspace Settings (`/workspace/:workspaceId/settings`)

## 1. Information Architecture
- **Navigation Tabs / Sections:**
  1. **General:** Workspace Name, Description, Avatar / Brand logo, Default time zone.
  2. **Members & Roles:** Default role for new invites, Permissions matrix summary.
  3. **Danger Zone:** Delete Workspace (strictly guarded by `OWNER` permission, requires typing workspace name to confirm, red warning styling).

## 2. Forms & UX States
- **Inline Validation:** React Hook Form + Zod validation with instantaneous, clear error messages beneath input fields.
- **Feedback:** Toast notification confirming successful updates ("Workspace settings saved").
- **Disabled State:** For non-owners, admin fields are cleanly disabled with a descriptive tooltip ("Only workspace owners can modify these settings").
