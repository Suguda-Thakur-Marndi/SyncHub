# Sign In Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Authentication / Sign In (`/sign-in`)

## 1. Information Architecture
- **Split View Layout:**
  - **Left Showcase Panel (Desktop >= 1024px):**
    - High-contrast deep slate/indigo backdrop with subtle ambient glow.
    - GPMS logo mark with clean typography.
    - Value proposition headline: "Manage projects with confidence & clarity."
    - Key proof points (Real-time collaboration, Kanban boards, Role-based access).
  - **Right Authentication Card:**
    - Header: "Welcome back" with supportive subtitle.
    - Google OAuth button (standard Google SVG icon, clean white surface, subtle border).
    - Or divider ("or continue with email").
    - Email input: `type="email"`, `autocomplete="email"`, clear focus ring.
    - Password input: `type="password"`, `autocomplete="current-password"`, toggle visibility icon.
    - Primary CTA: "Sign In" button with loading spinner state.
    - Footer: "Don't have an account? Sign up".

## 2. Accessibility & Security (WCAG 2.2 AA)
- Input labels associated via `htmlFor`.
- Allows password managers and copy/paste without restriction.
- Clear inline field error messaging with `role="alert"`.
