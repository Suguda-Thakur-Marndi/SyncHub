# Members Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Team Members & Access Governance (`/workspace/:workspaceId/members`)

## 1. Information Architecture
- **Header:**
  - Page title "Team Members", total member count chip, description.
  - Primary CTA: "Invite Member" (opens modal or scrolls to invitation card).
- **Invitation Section:**
  - Secure workspace invite link input with prominent "Copy Link" button.
  - Role overview pill explaining member permissions and workspace visibility.
  - Permission guard: only users with `ADD_MEMBER` permission can view/copy the invite link.
- **Member Directory:**
  - Search filter: Instant fuzzy search by member name or email.
  - Role filter: All, Owner, Admin, Member.
  - Table / Card Row:
    - Member avatar (with generated initial fallback color).
    - Full name and email address.
    - Role badge (`OWNER` in purple, `ADMIN` in blue, `MEMBER` in slate).
    - Joined date formatted cleanly.
    - Role dropdown: Permission-gated (`CHANGE_MEMBER_ROLE`).
    - Destructive actions: Remove member (requires confirmation modal).

## 2. Deviations from MASTER.md
- **Safety Safeguards:** Changing a role or removing a member displays an explicit confirmation dialog explaining permission consequences.
