# GROUP PROJECT MANAGEMENT SYSTEM — MASTER DESIGN SYSTEM (MASTER.md)

> **GLOBAL SOURCE OF TRUTH**  
> Generated via **UI/UX Pro Max Intelligence Layer**  
> Category: **Collaborative B2B / Team Productivity SaaS**  
> Design Dial: **Density 8/10 (Dense / High-Information Dashboard)** | **Motion 5/10 (Subtle & Intentional)** | **Variance 6/10 (Modern Balanced)**  
> 
> *Hierarchical Rule:* When developing a specific page, check `design-system/group-project-management/pages/[page-name].md`. If that file exists, its rules override this Master file. Otherwise, strictly adhere to this Master document.

---

## 1. Brand Identity & Design Philosophy

### Brand Personality
- **Organized:** Every element has a clear structure, logical alignment, and predictable behavior. Zero clutter or random elements.
- **Collaborative:** Clear team ownership, transparent member activity, real-time context, and seamless communication.
- **Professional & Reliable:** Enterprise-grade finish, robust error handling, crisp typography, and dependable security.
- **Focused & Efficient:** High data density without visual noise. Designed for speed, keyboard navigation, and rapid task triage.
- **Modern:** Clean borders, subtle elevation layers, curated indigo/emerald accents, and dark mode excellence.

### Core User Questions the UI Must Answer Immediately
1. **What do I need to do?** (Today's tasks, assigned to me, urgent deadlines)
2. **What is my team doing?** (Live team workload, recent activity audit stream)
3. **What is overdue or due soon?** (Explicit visual warning badges, sorted chronologically)
4. **Who owns this task?** (Prominent assignee avatars with names, role chips)
5. **What is blocking the project?** (Distinct `BLOCKED` status badge with blocker reasons)
6. **How much of the project is complete?** (Live velocity ratios, progress bars, milestone meters)
7. **What changed recently?** (Contextual audit trail and notification feed)

### UI Philosophy
- **Make it Obvious:** Don't make users guess where an action lives or what an icon means.
- **Make it Fast:** Single-click transitions, instant optimistic updates, compact views, keyboard shortcuts.
- **Make it Consistent:** Unified design tokens, standard button variants, uniform card styling.
- **Make it Accessible:** WCAG 2.2 AA compliant, visible focus rings, single-pointer alternatives for drag-and-drop, full keyboard operability.

---

## 2. Color System & Semantic Tokens

### Color Palette (Tailwind CSS 4 & CSS Variables)

| Role | Light Hex | Dark Hex | CSS Token | Purpose / Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary** | `#6366F1` | `#818CF8` | `--color-primary` | Brand buttons, active nav indicators, primary highlights |
| **Primary Hover** | `#4F46E5` | `#6366F1` | `--color-primary-hover` | Button hover state, interactive links |
| **Secondary** | `#818CF8` | `#A5B4FC` | `--color-secondary` | Secondary brand accents, subtle highlights, active badges |
| **Accent / CTA** | `#059669` | `#10B981` | `--color-accent` | Conversion actions, "Create Task", "Complete Project" |
| **Accent Hover** | `#047857` | `#059669` | `--color-accent-hover` | CTA hover state |
| **Background** | `#F8FAFC` | `#0B1120` | `--color-background` | Canvas background |
| **Surface** | `#FFFFFF` | `#111827` | `--color-surface` | Sidebar, header, dialog panels |
| **Card** | `#FFFFFF` | `#1E293B` | `--color-card` | Content cards, widgets, table container |
| **Card Hover** | `#F1F5F9` | `#243248` | `--color-card-hover` | Hoverable list items and Kanban cards |
| **Border** | `#E2E8F0` | `#334155` | `--color-border` | Subtle dividers, card borders, table lines |
| **Border Strong** | `#CBD5E1` | `#475569` | `--color-border-strong`| Inputs, active tabs, modal borders |
| **Text Primary** | `#0F172A` | `#F8FAFC` | `--color-text-primary` | Main headings, card titles, primary body |
| **Text Secondary**| `#475569` | `#94A3B8` | `--color-text-secondary`| Subtitles, timestamps, metadata labels |
| **Muted** | `#64748B` | `#64748B` | `--color-muted` | Placeholder text, inactive icons, helper notes |
| **Success** | `#10B981` | `#34D399` | `--color-success` | Completed status, verified badge, positive metrics |
| **Warning** | `#F59E0B` | `#FBBF24` | `--color-warning` | Due soon (<48h), medium priority, caution warnings |
| **Error / Overdue**| `#EF4444` | `#F87171` | `--color-error` | Overdue deadlines, high priority, blocker alerts |
| **Info** | `#3B82F6` | `#60A5FA` | `--color-info` | In progress, informational banners, notifications |

### Interaction States

- **Hover:** Subtle elevation `-translate-y-0.5`, background tint change (5-10% opacity shift), transition `150ms-200ms ease-out`.
- **Active / Pressed:** Scale `0.98`, darker background shade.
- **Focus Visible:** `ring-2 ring-indigo-500 ring-offset-2 ring-offset-background outline-none`. Mandatory on all interactive elements.
- **Disabled:** `opacity-50 cursor-not-allowed pointer-events-none`.
- **Selected:** Border `border-indigo-500`, background `bg-indigo-50/70 dark:bg-indigo-950/40`, text `text-indigo-600 dark:text-indigo-400 font-semibold`.

---

## 3. Typography System

### Font Pairings & CSS Import
- **Primary / UI / Body Font:** `Plus Jakarta Sans`, sans-serif (Google Fonts)
- **Heading / Display Font:** `Plus Jakarta Sans`, sans-serif (Bold / Semi-bold weights)
- **Monospace / Code:** `JetBrains Mono`, monospace (Task IDs, invite codes, API keys)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Type Scale (Fluid & Responsive)

| Level | Size (Desktop) | Size (Mobile) | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | `32px` (2rem) | `24px` (1.5rem) | 800 (ExtraBold) | 1.25 | `-0.02em` | Page main titles (Dashboard, Workspace) |
| **H2** | `24px` (1.5rem)| `20px` (1.25rem)| 700 (Bold) | 1.3 | `-0.015em`| Section titles, Project workspace header |
| **H3** | `18px` (1.125rem)|`16px` (1rem) | 700 (Bold) | 1.35 | `-0.01em` | Widget titles, Modal headers, Kanban columns |
| **H4** | `15px` (0.9375rem)|`14px` (0.875rem)| 600 (SemiBold)| 1.4 | `0` | Card titles, Table header groups |
| **Body Large** | `15px` (0.9375rem)|`14px` (0.875rem)| 500 (Medium) | 1.5 | `0` | Task descriptions, dialogue body |
| **Body Standard**| `14px` (0.875rem)|`13px` (0.8125rem)| 400 (Regular) | 1.5 | `0` | Default body text, form labels, table cells |
| **Body Small** | `12px` (0.75rem) | `12px` (0.75rem)| 500 (Medium) | 1.4 | `+0.01em` | Metadata, helper texts, secondary timestamps |
| **Caption / Pill**| `11px` (0.6875rem)|`10px` (0.625rem)| 700 (Bold) | 1.2 | `+0.03em` | Status & priority badges, uppercase tags |

---

## 4. Spacing & Density Scale (Dashboard Density 8/10)

Using a standardized 4px base increment:

| Token | Value | Tailwind Class | Application |
| :--- | :--- | :--- | :--- |
| `space-1` | `4px` | `p-1`, `gap-1` | Micro gaps, icon padding |
| `space-2` | `8px` | `p-2`, `gap-2` | Compact button padding, chip gaps |
| `space-3` | `12px`| `p-3`, `gap-3` | Table cell padding, dropdown items |
| `space-4` | `16px`| `p-4`, `gap-4` | Card padding (compact), input height spacing |
| `space-5` | `20px`| `p-5`, `gap-5` | Standard card internal padding |
| `space-6` | `24px`| `p-6`, `gap-6` | Major grid gutter, page header margins |
| `space-8` | `32px`| `p-8`, `gap-8` | Section separators |
| `space-10`| `40px`| `p-10`, `gap-10`| Modal padding, empty state padding |
| `space-12`| `48px`| `p-12` | Large layout offsets |
| `space-16`| `64px`| `p-16` | Hero spacing |

---

## 5. Component Foundations

### Elevation & Cards
- **Clean Card (`.clean-card`):**
  - Background: `bg-white dark:bg-slate-800`
  - Border: `border border-slate-200 dark:border-slate-800/80`
  - Rounded: `rounded-[16px]`
  - Shadow: `shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_10px_20px_-8px_rgba(0,0,0,0.02)]`
  - Hover: `-translate-y-0.5 border-slate-300 dark:border-slate-700`

### Status Badges (Semantic & Accessible)
- **`BACKLOG` / `TODO`:** Slate neutral. `bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700`
- **`IN_PROGRESS`:** Blue info. `bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800`
- **`IN_REVIEW`:** Purple review. `bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800`
- **`BLOCKED`:** Rose alert. `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800`
- **`DONE`:** Emerald success. `bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800`

*Rule:* Never rely on color alone! Every badge must include an explicit text label and an accompanying icon (e.g., CheckCircle2, Clock, AlertTriangle, AlertCircle).

### Priority Badges
- **`LOW`:** Slate/Cool gray with arrow down icon.
- **`MEDIUM`:** Amber with minus/horizontal dash icon.
- **`HIGH`:** Orange/Rose with arrow up icon.

---

## 6. Accessibility Rules (WCAG 2.2 AA)

1. **Color Contrast:** All body text must maintain a minimum contrast ratio of `4.5:1` against background in both light and dark themes. Large text (>= 18px bold) must meet `3:1`.
2. **Dragging Movement (Kanban Board):**
   - *Requirement:* Single-pointer alternative required for all drag operations.
   - *Implementation:* In addition to HTML5 drag-and-drop, every task card includes a quick contextual "Move to..." dropdown menu (`Move to In Progress`, `Move to Done`, etc.) and keyboard navigation (`Enter` / `Space` to activate).
3. **Focus States:** Every button, input, tab, and card must render a clear, high-contrast focus ring (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
4. **Icons:** All icons must be SVG (Lucide React). Never use raw emojis as UI icons. Non-decorative icons must have `aria-label` or visually hidden text. Decorative icons must have `aria-hidden="true"`.
5. **Reduced Motion:** Respect `prefers-reduced-motion: reduce`. When active, disable transform animations and translate transitions.

---

## 7. Anti-Patterns to Strictly Avoid

- ❌ **No AI purple/pink neon gradient overload:** Stick to professional indigo `#6366F1` with emerald accents.
- ❌ **No decorative, unlabelled charts:** Every chart and metric widget must display clear numeric metrics, axis labels, and empty states.
- ❌ **No emoji icons in place of SVG buttons:** Use Lucide React icons.
- ❌ **No drag-only interactions:** Always provide dropdown/button alternatives for moving tasks.
- ❌ **No horizontal viewport scrolling on mobile:** Test and format at 375px, 768px, 1024px, 1440px.
- ❌ **No unconfirmed destructive actions:** Deleting a project, task, or workspace must trigger a confirmation modal.
