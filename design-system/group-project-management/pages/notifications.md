# Notifications Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Component/Page:** Notifications Center (Header Dropdown + Activity Stream)

## 1. Information Architecture
- **Trigger:** Header Bell icon with unread count badge (animated pulse on new alerts).
- **Dropdown & Full View:**
  - Header: "Notifications", Unread badge count, "Mark all as read" button.
  - Filter Tabs: `All`, `Unread`, `Mentions`, `Assignments`, `Deadlines`.
  - Notification Item Anatomies:
    - Left: Category icon with semantic color (e.g. UserPlus for member joined, AlertCircle for overdue, CheckCircle for task completed, MessageSquare for mention).
    - Middle: Actor avatar, bold event description, target link (clickable straight to task or project), and relative time ("5m ago", "2h ago").
    - Right: Read/Unread dot indicator, Quick Action button ("View Task", "Reply").

## 2. Notification Principle: What happened → Why it matters → What action can I take?
- Avoid useless notifications.
- Every notification card provides a direct action link.
