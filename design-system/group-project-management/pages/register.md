# Sign Up Design System Specs

> **Inherits from:** `../MASTER.md`  
> **Page:** Authentication / Sign Up (`/sign-up`)

## 1. Information Architecture
- **Split View Layout:**
  - **Left Showcase Panel (Desktop >= 1024px):**
    - Deep indigo/purple gradient backdrop with clean contrast.
    - Product value proposition: "Start shipping faster with your team."
    - Key onboarding perks (Fast setup, Enterprise-grade security, Unlimited collaborators).
  - **Right Registration Card:**
    - Header: "Create your account" with supporting subtitle.
    - Google OAuth button for instant 1-click registration.
    - Or divider ("or register with email").
    - Full Name input: `type="text"`, `autocomplete="name"`.
    - Email input: `type="email"`, `autocomplete="email"`.
    - Password input: `type="password"`, `autocomplete="new-password"`.
    - Primary CTA: "Create Account" with pending loading state.
    - Footer: "Already have an account? Sign in".

## 2. Accessibility & Validation
- Inline real-time validation for email format and required fields.
- High contrast focus rings and accessible labels.
