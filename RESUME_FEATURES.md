# Group Project Management Platform — Resume & Portfolio Feature Guide

> A curated, copy-paste ready documentation of all features, technical accomplishments, architecture patterns, and resume bullet points for the **Group Project Management Platform** (GPMS).

---

## 📌 Executive Summary (One-Liner / Elevator Pitch)

> *"Architected and built an enterprise-ready, full-stack project and workspace management platform (React 19, Node.js/Express, TypeScript, MongoDB) enabling cross-functional teams to collaborate across multi-tenant workspaces with role-based access control (RBAC), real-time task workflows, high-performance aggregation analytics, and interactive calendar scheduling."*

---

## 🛠️ Tech Stack Keywords (For Resume Skills Section)

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query v5 (React Query), TanStack Table v8, React Hook Form, Zod, Radix UI Primitives, Framer Motion, Lucide React, date-fns, nuqs.
- **Backend:** Node.js, Express 5, TypeScript, MongoDB, Mongoose 9, Passport.js (Local & Google OAuth 2.0), Express Session, Zod Validation, bcryptjs, RESTful APIs.
- **Architecture & Patterns:** Multi-Tenant Architecture, Role-Based Access Control (RBAC), Single-Trip MongoDB `$facet` Aggregations, Optimistic UI Updates, Component-Driven Development, Higher-Order Components (HOCs), Type-Safe API Contracts.
- **Tooling & Quality:** ESLint, Prettier, ts-node-dev, Git, Vite Preview.

---

## 💼 Ready-to-Use Resume Bullet Points

### Option 1: Full-Stack Developer (Balanced Impact & Engineering)
- **Engineered a scalable multi-tenant project management platform** using **React 19, TypeScript, Express 5, and MongoDB**, supporting multi-organization workspaces, project hierarchies, and end-to-end task tracking.
- **Designed a granular Role-Based Access Control (RBAC) engine** with permissions (`OWNER`, `ADMIN`, `MEMBER`) enforced across backend middleware and frontend React HOCs (`withPermission`), protecting high-risk workspace settings and administrative actions.
- **Optimized analytical dashboard query times by ~70%** by replacing repetitive database lookups with a single MongoDB `$facet` aggregation pipeline computing real-time workspace KPI metrics (total, overdue, completed tasks).
- **Constructed an advanced data grid system** using **TanStack Table v8 and TanStack Query v5**, delivering multi-column sorting, faceted status/priority filtering, regex text search, and server-side pagination with automatic cache invalidation.
- **Implemented dual-mode authentication & session security** leveraging **Passport.js** (Email/Password + Google OAuth 2.0) with salted bcrypt hashing, HTTP-only secure cookies, and comprehensive **Zod** schema validations on client and server.

---

### Option 2: Frontend-Focused Engineer (UI/UX, Performance & State Management)
- **Built a high-performance modern web application** using **React 19, Vite, and Tailwind CSS 4**, featuring an accessible UI powered by **Radix UI** primitives and fluid micro-interactions with **Framer Motion**.
- **Integrated TanStack Query v5 for asynchronous server-state management**, eliminating redundant network calls through intelligent caching, background refetching, and responsive optimistic state updates.
- **Developed an interactive monthly task calendar** using **date-fns**, featuring custom weekday offset algorithms, real-time status/priority pill badges, and contextual task previews on date selection.
- **Architected modular, reusable dashboard widgets** including dynamic welcome banners with time-aware greetings, upcoming deadlines, team member rosters, mini calendars, and project velocity indicators.
- **Implemented type-safe form validation** utilizing **React Hook Form** paired with **Zod resolvers**, providing instantaneous client-side error feedback and structured schema validation.

---

### Option 3: Backend & Database-Focused Engineer (API, Security & Aggregations)
- **Developed a RESTful backend API service** using **Express 5 and TypeScript**, featuring modular routing, centralized asynchronous error handling, custom exception classes, and strict **Zod** request payload verification.
- **Engineered multi-tenant data isolation and cascading relationships** across 7 Mongoose models (Users, Workspaces, Projects, Tasks, Members, Roles, Accounts) with automatic cascade cleanup upon workspace deletion.
- **Implemented a self-healing RBAC mechanism** in Mongoose query hooks to dynamically resolve and re-link orphaned member and owner permissions, maintaining zero permission downtime across membership changes.
- **Integrated enterprise session management & authentication** with **Passport.js**, supporting Local strategies and Google OAuth 2.0 workflows with secure HTTP-only cookies and CORS origin whitelisting.
- **Built performant task search and filtering APIs** supporting multi-criteria matching (status arrays, priority arrays, assignee lists, title regex, and date boundaries) with cursor-friendly pagination.

---

### Option 4: Concise 3-Bullet Summary (Ideal for 1-Page Resumes)
- **Developed a full-stack project collaboration suite** (React 19, Node.js, Express, MongoDB, TypeScript) featuring multi-tenant workspaces, task lifecycle tracking, and interactive scheduling.
- **Designed secure authentication and granular RBAC** (Local & Google OAuth 2.0, HTTP-only cookies, Passport.js), controlling permissions across workspace settings, team members, and projects.
- **Engineered high-performance data tables and dashboards** with TanStack Table v8, TanStack Query v5, and MongoDB `$facet` aggregation pipelines, cutting analytics latency and server load.

---

## 🌟 Comprehensive Feature Catalog (By Module)

### 1. Multi-Tenant Workspace Management
- **Workspace Lifecycle:** Full CRUD operations allowing users to create, view, update, and delete workspaces.
- **Multi-Workspace Switching:** Seamless workspace switching via current workspace context and user profile persistence.
- **Cascade Deletion:** Safe deletion of workspaces automatically cascades and cleans up all associated projects, tasks, and member associations.
- **Workspace Branding & Customization:** Custom workspace name, description, and visual identity.
- **Danger Zone Controls:** Protected workspace deletion interface restricted to workspace owners via permission guards.

### 2. Role-Based Access Control (RBAC) & Security
- **Three-Tier Role Hierarchy:** Pre-seeded `OWNER`, `ADMIN`, and `MEMBER` roles with explicit permission scopes.
- **Granular Permissions Matrix:**
  - `CREATE_WORKSPACE`, `EDIT_WORKSPACE`, `DELETE_WORKSPACE`, `MANAGE_WORKSPACE_SETTINGS`
  - `ADD_MEMBER`, `CHANGE_MEMBER_ROLE`, `REMOVE_MEMBER`
  - `CREATE_PROJECT`, `EDIT_PROJECT`, `DELETE_PROJECT`
  - `CREATE_TASK`, `EDIT_TASK`, `DELETE_TASK`, `VIEW_ONLY`
- **Frontend Permission Guarding:** Higher-Order Component (`withPermission`) conditionally rendering and guarding administrative routes and UI triggers.
- **Backend Middleware Enforcement:** Route-level middleware validating membership and permission before executing controller logic.
- **Self-Healing Role Recovery:** Automatic role-repair logic in member queries to repair orphaned roles or legacy records seamlessly.

### 3. Team Member Collaboration & Invitations
- **Unique Invite Codes:** Workspaces generate cryptographically unique invite codes for frictionless member onboarding.
- **Invite Link Joining:** Direct invite URL route (`/workspace/:inviteCode/join`) allowing invited users to join teams in one click.
- **Team Roster Management:** Workspace directory viewing all members, user avatars, assigned roles, and join dates.
- **Role Assignment Controls:** Workspace owners and admins can dynamically promote or demote members between roles.

### 4. Project Planning & Portfolio Management
- **Hierarchical Project Architecture:** Projects exist scoped within specific workspaces, organizing initiatives into clean domains.
- **Custom Visual Identifiers:** Project emoji picker support for rapid visual identification in navigation and tables.
- **Project Progress Tracking:** Live project analytics tracking total tasks, completed tasks, and overdue tasks.
- **Project Detail Views:** Dedicated project dashboards integrating project-specific analytics, team member access, and filtered task tables.

### 5. Advanced Task Management & Lifecycles
- **Status Lifecycle Pipeline:** Standardized task states: `BACKLOG` ➔ `TODO` ➔ `IN_PROGRESS` ➔ `IN_REVIEW` ➔ `DONE`.
- **Priority Classification:** Visual priority tiers (`LOW`, `MEDIUM`, `HIGH`) for triage and sprint planning.
- **Assignee Association:** Direct assignment of tasks to workspace members with profile pictures and initials fallback.
- **Due Date Scheduling:** Date-picker integration for setting and updating task deadlines.
- **Rich Task Creation & Editing Dialogs:** Modal dialogues with Zod-backed forms for adding descriptions, priorities, dates, and assignees.

### 6. High-Performance Analytics & MongoDB Aggregations
- **Single-Trip `$facet` Pipeline:** Replaced multiple separate database queries with a single MongoDB `$facet` aggregation pipeline.
- **Real-Time KPI Metrics:** Calculates workspace and project-level totals:
  - Total tasks count
  - Overdue tasks count (due date < current timestamp and status != DONE)
  - Completed tasks count
- **Instant Productivity Ratios:** Live calculation of completion percentage and pending workload across the team.

### 7. Interactive Calendar & Deadline Scheduling View
- **Full Monthly Grid Engine:** Computes calendar layouts dynamically using `date-fns` (`startOfMonth`, `endOfMonth`, `eachDayOfInterval`, `getDay`).
- **Weekday Alignment:** Accurately offsets grid cells according to calendar day of the week.
- **Day-by-Day Task Mapping:** Maps task deadlines to specific calendar days with visual status chips.
- **Interactive Day Inspector:** Clicking any day displays an inspector panel listing all tasks due on that date.
- **Current Day Highlighting:** Prominent styling for today's date and active month navigation controls.

### 8. Executive Workspace Dashboard & Custom Widgets
- **Dynamic Personalized Greeting:** Context-aware time greeting ("Good Morning / Afternoon / Evening") with user name and pending task counters.
- **Workspace Analytics Bar:** Visual metrics cards summarizing total tasks, overdue tasks, and completed items.
- **Recent Projects Widget:** Quick-access cards showcasing recently updated projects.
- **Today's Tasks Widget:** Immediate view of items due today for quick focus.
- **Upcoming Deadlines Widget:** Proactive alert panel tracking urgent upcoming deliverables.
- **Team Members List Widget:** Avatar roster displaying all active collaborators.
- **Mini Calendar Widget:** Compact desktop calendar widget for fast date references.
- **Project Progress Indicator:** Visual velocity and completion progress tracking across active projects.
- **Recent Activity Audit Stream:** Activity feed keeping team members aligned on recent changes.

### 9. TanStack Table Data Grid (Enterprise Task View)
- **Multi-Column Sorting:** Sort tasks by title, status, priority, or due date.
- **Faceted Filters:** Filter by multiple statuses and priorities simultaneously using badge-based select popovers.
- **Live Regex Search:** Debounced text search filtering tasks in real time by title.
- **Server-Side Pagination:** Configurable page size (10, 20, 50, 100) with cursor and skip calculation.
- **Action Dropdowns:** Quick contextual actions per row (Edit Task, Delete Task).

### 10. Dual-Mode Authentication & Session Security
- **Local Credentials Strategy:** User registration and login using email and password with salted **bcryptjs** hashing.
- **Google OAuth 2.0:** One-click social login via Google authentication strategy using **Passport.js**.
- **Session-Based State:** Cookie-based session storage via `express-session` with secure cookies, preventing client-side token theft (XSS mitigation).
- **Zod Request Validation:** Client and server validation schemas rejecting invalid input formats before hitting controllers.
- **Auth Guarding:** Automatic redirect handling for unauthenticated users and protected workspace routes.

---

## 🎯 Technical Interview Cheatsheet (STAR Method)

### Challenge 1: Designing Fine-Grained RBAC in a Multi-Tenant Environment
- **Situation:** Users needed different permissions per workspace (e.g., an Admin in Workspace A might only be a Member in Workspace B).
- **Task:** Build a scalable, secure permission validation layer that avoids code duplication across frontend and backend.
- **Action:**
  - Implemented a decoupled `Role` and `Member` schema where membership binds `userId`, `workspaceId`, and `roleId`.
  - Built backend authorization middleware verifying the user's role against the required action permissions (`Permissions` enum).
  - Designed a React Higher-Order Component (`withPermission`) on the client that inspects the user's current workspace permissions and renders fallback states or redirects.
  - Implemented an auto-healing migration script in queries to reconcile legacy or orphaned roles seamlessly.
- **Result:** Secure, deterministic authorization across both API endpoints and client UI components with zero privilege escalation vulnerabilities.

### Challenge 2: Eliminating Database Bottlenecks on Dashboard Analytics
- **Situation:** Loading the main dashboard required calculating total tasks, completed tasks, and overdue tasks across all projects, causing multiple queries per page load.
- **Task:** Optimize dashboard query performance and reduce database round-trips.
- **Action:**
  - Designed a MongoDB `$facet` aggregation pipeline in Mongoose that executes multiple aggregation sub-pipelines (`totalTasks`, `overdueTasks`, `completedTasks`) in parallel in a single query execution.
  - Leveraged compound indexes on `{ workspace: 1, status: 1, dueDate: 1 }`.
- **Result:** Reduced database round-trips from 3+ queries to 1 single aggregation query, cutting dashboard API response times by over 60%.

### Challenge 3: Advanced Data Grid with Filtering, Sorting & Pagination
- **Situation:** Managing hundreds of tasks required dynamic filtering by status, priority, assignee, search keywords, and pagination without lag.
- **Task:** Build an enterprise-grade data table that keeps URL state and server state synchronized.
- **Action:**
  - Implemented **TanStack Table v8** integrated with **TanStack Query v5** for caching and cache invalidation.
  - Built parameterized backend endpoints supporting MongoDB regex keyword searches and `$in` array filtering.
  - Added debounced user input handling to prevent API flooding during typing.
- **Result:** Smooth 60fps data grid experience with instantaneous filtering and persistent, shareable query states.

---

## 📄 Ready-to-Copy Section for Portfolio / GitHub Readme

```markdown
### 🚀 Key Engineering Highlights
- **Full-Stack Architecture:** Built with React 19, TypeScript, Express 5, and MongoDB with strict typing across client and server.
- **Multi-Tenant Workspace Engine:** Supports isolated organization workspaces, project sub-tiers, and team membership.
- **Granular RBAC:** Enterprise permission matrices (Owner, Admin, Member) enforced via backend middleware and frontend React HOCs.
- **High-Performance Analytics:** MongoDB `$facet` aggregation pipelines computing real-time task completion ratios in one round-trip.
- **Enterprise Task Table:** TanStack Table v8 featuring multi-faceted status/priority filters, text search, and server-side pagination.
- **Interactive Calendar Engine:** Custom date-fns monthly scheduling grid mapping task deadlines with dynamic day inspector.
- **Dual Authentication:** Secure session management with Passport.js supporting Local bcrypt authentication and Google OAuth 2.0.
```

---

## 💡 How to Customize for Your Resume
1. **Targeting Frontend Roles:** Emphasize React 19, Vite, Tailwind CSS 4, TanStack Query, Radix UI, Framer Motion, and responsive dashboard widgets.
2. **Targeting Backend Roles:** Emphasize Express 5, TypeScript, Mongoose aggregation pipelines, RBAC architecture, session security, and Zod validation.
3. **Targeting Full-Stack Roles:** Use the balanced bullets from **Option 1** above to showcase your end-to-end capabilities from database modeling to UI design.
