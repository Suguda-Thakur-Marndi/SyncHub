# Group Project Management Platform

A full-stack workspace and project management application for teams to collaborate on workspaces, projects, members, and tasks. The project uses a Node.js/Express/TypeScript backend and a React 19/Vite/Tailwind CSS frontend.

---

## ✨ What the app does

- Create and manage workspaces for different teams or organizations
- Invite members, format join dates, and assign roles/permissions with permission guarding
- Create projects inside each workspace with both Grid and List view layouts
- Create, assign, and update tasks with Table and Kanban views
- Accessible WCAG 2.2 AA single-pointer alternative for keyboard and assistive task movements
- Gantt schedule timeline, file asset management, and team discussion threads
- Honest workspace metrics (Active Projects, My Tasks, Completed Tasks, Overdue Tasks)
- Light, Dark, and System theme customization in Workspace Settings
- Support local authentication and Google OAuth sign-in
- Use session-based authentication with secure cookie management

---

## 🛠️ Tech stack

### Backend
- Node.js
- Express 5
- TypeScript
- MongoDB with Mongoose 9
- Passport.js with local and Google OAuth 2.0 strategies
- Express Session for cookie-based authentication sessions
- CORS and dotenv for HTTP and environment configuration
- bcryptjs for password hashing
- jsonwebtoken and UUID for token and identifier utilities
- Zod for request validation
- ts-node-dev for development and TypeScript for builds

### Frontend
- React 19 and React DOM
- Vite with the React and Tailwind CSS plugins
- TypeScript
- Tailwind CSS 4
- React Router DOM for client-side routing
- TanStack React Query for server-state management
- TanStack React Table for data tables
- Axios for API requests
- React Hook Form with Zod resolvers for forms and validation
- Radix UI primitives for accessible UI components
- Lucide React for icons
- Framer Motion for animations
- Emoji Mart for emoji selection
- date-fns and React Day Picker for date handling
- clsx, tailwind-merge, and class-variance-authority for styling utilities
- nuqs for URL query-state management

### Development and quality tooling
- ESLint with React Hooks and React Refresh plugins
- TypeScript ESLint
- Vite preview server
- npm for package management

---

## 📁 Project structure

```text
group-project-management-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # App, database, HTTP, and passport configuration
│   │   ├── controllers/     # Auth, workspace, member, project, task, and user controllers
│   │   ├── enums/           # Role, error, and task-related enums
│   │   ├── middlewares/      # Auth, async, and error handling middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper utilities and custom errors
│   │   └── validation/      # Request validation schemas
│   └── package.json
├── design-system/
│   └── group-project-management/
│       ├── MASTER.md        # Global tokens, typography, colors, and accessibility standards
│       └── pages/           # Page-specific design specifications (dashboard, projects, etc.)
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth, query, and theme context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── layout/          # Main layouts (Sidebar, Header, Resizer)
│   │   ├── lib/             # API and helper utilities
│   │   ├── page/            # App pages (Dashboard, Projects, Tasks, Calendar, Reports, Settings)
│   │   ├── routes/          # Routing setup
│   │   └── types/           # TypeScript types
│   └── package.json
└── README.md
```

---

## 🚀 Getting started

### Prerequisites
- Node.js 20+ recommended
- MongoDB running locally or via MongoDB Atlas
- npm

### 1. Install dependencies

```powershell
cd backend
npm install

cd ../client
npm install
```

### 2. Configure environment variables

#### Backend: backend/.env
```env
PORT=5000
NODE_ENV=development
BASE_PATH=/api
MONGO_URI=mongodb://127.0.0.1:27017/group-management-platform
SESSION_SECRET=change-me
FRONTEND_ORIGIN=http://localhost:5173

# Optional Google OAuth settings
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

#### Frontend: client/.env
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> If you change the backend port, update the frontend API URL to match it.

### 3. Run the app locally

Open two terminals.

#### Backend
```powershell
cd backend
npm run dev
```

#### Frontend
```powershell
cd client
npm run dev
```

The backend will run on http://localhost:5000 and the frontend on http://localhost:5173 by default.

---

## 🧪 Available scripts

### Backend
- `npm run dev` — start the backend in development mode
- `npm run build` — compile TypeScript to JavaScript

### Frontend
- `npm run dev` — start the Vite development server
- `npm run build` — build the production bundle
- `npm run lint` — run ESLint

---

## 📡 API overview

The backend exposes REST endpoints under the configured API base path, typically `/api`.

| Endpoint Prefix | Auth Required | Description |
| :--- | :---: | :--- |
| `/api/auth` | No | Register, login, logout, and Google OAuth flows |
| `/api/user` | Yes | Get the current authenticated user profile |
| `/api/workspace` | Yes | Create and manage workspaces |
| `/api/member` | Yes | Manage workspace members and roles |
| `/api/project` | Yes | Create and manage projects inside workspaces |
| `/api/task` | Yes | Create, assign, and update tasks | 

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).
