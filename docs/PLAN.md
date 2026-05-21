# Rekaz Builder — Master Plan

> Source-of-truth document for the project. Combines product vision, design
> system, and phased engineering plan. Update this file as decisions change.

---

## 0. Quick facts

- **Project:** Naif's Rekaz frontend interview submission.
- **Repo:** `/home/ubuntu/mini-website-builder/` (standalone).
- **Live URL target:** `https://builder.naifhub.com` (self-hosted VPS via Docker + Caddy).
- **Brand color:** `#E85D5D` (coral). Secondary `#F28B82`.
- **Routing model:** multi-project with IDs (`/builder/[id]`, `/dashboard/[id]`, `/preview/[id]`).
- **Persistence:** localStorage only. No backend, no auth, no real payments.
- **Stack:** Next.js 16 + TS + Tailwind 4 + Zustand + dnd-kit + Framer Motion + Zod.

---

# Part 1 — Product Vision

## Vision

Rekaz Builder is a lightweight business website platform designed for
non-technical business owners.

The goal is **NOT** to create a complex website builder like Webflow.

The goal is to:

- help users launch quickly
- provide guided starter layouts
- allow flexible customization
- include lightweight business workflows
- make the experience extremely easy and safe for non-technical users

Core philosophy:

> Guided when helpful, flexible when needed.

## Primary product goals

- Simple onboarding experience
- Non-technical friendly UX
- Ready business starter layouts
- Flexible editing
- Lightweight management dashboard
- Realistic business workflows
- Responsive design
- Smooth and polished UI

## Avoid

- Complex design systems
- Advanced freeform layout editing
- Developer-heavy UX
- Enterprise dashboards
- Backend-heavy architecture
- Real payment systems
- Complex auth systems

## Product flow

### 1. Landing Page (`/`)

- Hero, Features, Starter layouts showcase, Workflow examples, CTA.
- Inspired by Rekaz.io — soft spacing, rounded cards, calm colors, Arabic-first.
- CTAs: **Start Building** and **Explore Layouts**.

### 2. Template Selection (`/templates`)

- Option A — Start from scratch.
- Option B — Use a starter layout.

Starter layouts:

- **Barber Shop** — Hero, Services, Team, Booking, Testimonials, Contact.
- **Coffee Shop** — Hero, Featured drinks, Menu, Gallery, Location.
- **Photography** — Hero, Portfolio, Packages, Testimonials, Contact.

Each card shows preview image, included sections, included workflow.
Starter layouts are **NOT** locked — users can fully customize them after.

### 3. Builder (`/builder/[id]`)

Feel: simple, guided, safe, flexible. **Not** technical, overwhelming, or
infinitely customizable.

- **Left sidebar:** starter layouts + section library (Hero, Features, Gallery,
  Testimonials, FAQ, Contact, Footer, Booking, Menu, Portfolio). Click to add,
  drag to reorder, delete, duplicate.
- **Center canvas:** live preview, desktop/mobile toggle, smooth animations,
  scrollable, selected section highlight.
- **Right panel:** focused editing — titles, descriptions, images, colors,
  buttons, services, menu items, gallery images. No advanced design controls.

### 4. Dashboard (`/dashboard/[id]`)

Inspired by Zid/Salla — smaller and simpler. Makes the product feel complete.

Sidebar: Overview / Website / Workflow (Bookings / Menu / Portfolio) /
Customers / Settings.

Pages:

- **Overview** — visits, recent activity, recent bookings, website status (mock).
- **Website** — edit, preview, publish actions.
- **Workflow page** — varies by business type (Bookings / Menu / Portfolio).

### 5. Preview (`/preview/[id]`)

Render the design without any builder UI. Public-feeling.

## Business templates

### Barber Shop

- Sections: Hero, Services, Team, Booking CTA, Testimonials, Contact.
- **Real:** booking flow (select barber → date → time → submit, stored locally).
- **Fake:** revenue analytics, customer insights, notifications.

### Coffee Shop

- Sections: Hero, Featured drinks, Menu, Gallery, Location.
- **Real:** menu editor (add/remove/edit items, live preview).
- **Fake:** orders analytics, delivery tracking, loyalty.

### Photography

- Sections: Hero, Portfolio, Packages, Testimonials, Contact.
- **Real:** gallery manager (add/remove/reorder).
- **Fake:** client analytics, session history, invoices.

## UX principles

User is **non-technical**. Everything must feel obvious, guided, safe, clean.

Avoid: blank confusion, too many controls, advanced design freedom,
overwhelming interfaces.

The system provides smart defaults for spacing, typography, colors, and
section ordering. Users mainly edit content, images, ordering, business data.

## Important engineering decisions

- Builder is **NOT** fully freeform: no arbitrary drag positioning, no free
  canvas movement, no complex resizing. Only reorder, add/remove, edit content.
- Starter layouts are simply predefined section arrays.
- State managed by Zustand with narrow selectors.
- Persistence is localStorage only.

## Real vs Fake feature breakdown

- **Real:** drag/drop reorder, section editing, starter layouts, booking demo,
  menu editing, gallery editing, local persistence, responsive preview.
- **Semi-real:** dashboard, analytics, customer lists.
- **Fake:** payments, real auth, notifications, publishing infrastructure,
  databases.

---

# Part 2 — Design System

## Feeling

The product should feel **calm, modern, friendly, simple, trustworthy,
Arabic-first, non-technical friendly**.

It should NEVER feel corporate-enterprise, developer-heavy, futuristic,
crowded, or complicated.

> "I can use this without technical knowledge."

## Colors

```
Primary brand:     #E85D5D   (buttons, active, highlights, CTA, big stats)
Secondary accent:  #F28B82   (hover, soft backgrounds, badges)

Main background:   #FAFAF9
Surface:           #FFFFFF
Soft section bg:   #F5F5F4

Text primary:      #1C1917
Text secondary:    #57534E
Text muted:        #A8A29E

Border:            #E7E5E4

Success:           #22C55E
Warning:           #F59E0B
Error:             #EF4444
```

### Tinted section backgrounds (from Rekaz.io homepage reference)

Rekaz alternates tinted section backgrounds with white to give the page
rhythm. Use these for section blocks — pick by context, never random.

```
Section tint — peach    #FDEEEA   (hero, primary tinted blocks)
Section tint — mint     #E8F4EC   (positive / "what you get")
Section tint — lavender #EFEDF7   (calm secondary blocks)
Section tint — cream    #FBF6EE   (FAQ, soft trust blocks)
Section dark            #0F0F10   (high-contrast CTAs near the bottom)
```

These are approximations from the screenshot — refine if exact values land later.

## Typography

- **Primary font:** IBM Plex Sans Arabic. Fallback: Inter.
- Avoid: too many weights, ultra-thin text, tiny text, condensed typography.

Scale:

```
Hero title     — text-5xl  font-bold  tracking-tight
Section title  — text-3xl  font-semibold
Card title     — text-xl   font-medium
Body           — text-base leading-7
Small label    — text-sm   font-medium
```

## Spacing

UI should breathe.

```
Section padding   — py-24 (desktop) / py-16 (mobile)
Card padding      — p-6 or p-8
Gap system        — gap-4 / gap-6 / gap-8
```

## Radii

```
Main         — rounded-2xl
Small        — rounded-xl
```

Avoid sharp edges.

## Shadows

```
Main card    — shadow-sm   (or custom: 0 1px 2px rgba(0,0,0,0.04))
```

Avoid giant shadows, neon, hard depth.

## Layout sizes

- Builder left sidebar: **320 px**.
- Builder right panel: **380 px**.
- Builder canvas: `max-w-5xl mx-auto`.

## Buttons

- **Primary:** coral bg, white text, `rounded-xl`, medium weight, darker on hover.
- **Secondary:** white bg, soft border, muted text.

## Inputs

```
h-12  rounded-xl  border-stone-200
```

Large, readable, approachable.

## Animations (Framer Motion)

- Subtle fade-in, slide-up, slight scale, smooth hover.
- Avoid bouncing, spinning, excessive motion.

## Dashboard cards

- `rounded-2xl`, white surface, soft border, minimal charts.
- One metric, one action, one purpose per card.

## Mobile design

- Bottom tabs, one panel at a time, large touch targets, simplified
  interactions.

## Visual reference notes — Rekaz.io homepage

Concrete patterns to mirror in our landing page + builder UI:

- **Hero:** pale peach background, headline in coral (`#E85D5D`), muted-gray
  subtitle, one coral CTA button, device mockup off-axis. Trustpilot-style
  rating chip near the CTA.
- **Section rhythm:** alternate tinted backgrounds (peach → mint → lavender →
  cream → white). Never two tinted blocks of the same color in a row.
- **Cards:** generous radius (`rounded-2xl` or `rounded-3xl`), `shadow-sm`,
  soft `#E7E5E4` borders. Cards often have their own light tint.
- **Feature grids:** 4×3 colorful icon tiles inside a white card. Icons are
  filled-color (not outline), each in its own pastel circle.
- **Stats row:** 3 huge coral numbers (e.g., `10K+`, `91%`, `800K+`) with
  small muted descriptors below. Coral, not black.
- **Testimonials (written):** white bordered cards, 5-star rating top, body,
  author footer. Grid of 6 or 8.
- **Testimonials (video):** story-style portrait cards in a horizontal row.
- **Dark CTAs:** strategically placed near page bottom on `#0F0F10`
  background, white text, coral button. Sharp contrast against the otherwise
  light page.
- **FAQ:** cream-tinted section, accordion of white rounded rows.
- **Footer:** dark, multi-column links, social icons, sponsor/partner row above.

## Final feel

Calm, premium, beginner-friendly, guided, trustworthy, modern Arabic SaaS.

**Not** a developer tool, design software, enterprise dashboard, or complex
CMS.

---

# Part 3 — Engineering Phases

## Folder structure target

```
app/
├── page.tsx                    landing
├── templates/page.tsx          scratch + starter cards
├── builder/[id]/page.tsx       canvas + sidebar + edit panel
├── dashboard/[id]/page.tsx     overview/website/workflow/customers/settings
├── preview/[id]/page.tsx       public-feeling render

features/
├── sections/                   one folder per section type
├── projects/                   project model + localStorage I/O
├── dashboard/
├── workflows/                  booking / menu / portfolio business logic

shared/
├── ui/                         buttons, inputs, dialogs, primitives
├── lib/                        cn, id, etc.
```

## Phase status legend

- `[ ]` not started · `[~]` in progress · `[x]` done

## M1. Foundation — design system + routing

- [ ] **1. Design system tokens.** Tailwind theme: coral `#E85D5D` / `#F28B82`,
  stone neutrals, IBM Plex Sans Arabic, `rounded-2xl`, `shadow-sm`. Repaint
  existing builder using new tokens. Update `globals.css`.
- [ ] **2. Project model + localStorage.** `Project = { id, name, design,
  createdAt, updatedAt, templateType? }`. Single persistence module in
  `features/projects/`. Auto-save on edit (debounced).
- [ ] **3. Routing refactor.** Move `/web-builder` → `/builder/[id]`. Add
  stub pages for `/`, `/templates`, `/dashboard/[id]`, `/preview/[id]`.
  Project resolved by route param.
- [ ] **4. Trim data model.** Remove Layout/Component variants from `types.ts`
  and delete `features/layouts`, `features/components` stub folders. Update
  `SectionRenderer` to remove the layout branch.

## M2. Core builder — edit, reorder, more sections

- [ ] **5. EditPanel schema-driven forms.** One `schema.ts` per section type.
  Schema-driven renderer for text / textarea / image-url / select / list inputs.
- [ ] **6. dnd-kit reorder.** Drag handle on each canvas section. Sortable
  list with drop indicator. Update store via `reorderSections`.
- [ ] **7. Selection + hover toolbar.** Click section to select; hover shows
  delete / duplicate / move-up / move-down.
- [ ] **8. Section library expansion.** Add Gallery, Testimonials, FAQ,
  Contact (Render + Thumbnail + defaults + schema each).
- [ ] **9. Confirm dialog + toast polish.** Replace `window.confirm` with
  proper dialog component. Tighten toast copy.
- [ ] **10. Save / Open / Export.** Toolbar Save persists; Open shows project
  picker; JSON export + import.

## M3. Templates + business workflows

- [ ] **11. Landing page `/`.** Hero, Features, Starter layouts showcase,
  Workflow examples, CTA. Links to `/templates`.
- [ ] **12. Templates page `/templates`.** Scratch + 3 starter cards. Selecting
  one creates a project with that section array → routes to `/builder/[id]`.
- [ ] **13. Workflow sections.** Booking, Menu, Portfolio sections (real
  interactive — see business-template specs above).
- [ ] **14. Preview route `/preview/[id]`.** Pure render, no builder UI.
- [ ] **15. Dashboard shell `/dashboard/[id]`.** Sidebar (Overview / Website /
  Workflow / Customers / Settings) + content area.
- [ ] **16. Dashboard pages.** Overview (mock analytics cards), Website (edit /
  preview / publish actions), Customers (mock list), Settings (rename project,
  delete project).
- [ ] **17. Workflow pages.** Barber Bookings (submissions list from Booking
  section), Coffee Menu editor (CRUD with live preview), Photography Portfolio
  (gallery CRUD). All local.

## M4. Polish + ship

- [ ] **18. Animations.** Framer Motion fades / slide-ups for section add,
  panel open, toast.
- [ ] **19. Empty states + skeletons.** Every list/canvas has a guiding empty
  state. Loading skeletons where applicable.
- [ ] **20. AR/RTL pass.** Mirror layout when `language === "ar"`, tune Arabic
  typography, flip directional icons.
- [ ] **21. Mobile pass.** Walk every screen on mobile, fix touch targets, tab
  transitions.
- [ ] **22. Deploy.** Dockerize, Caddy reverse proxy, DNS for
  `builder.naifhub.com`, README live-demo link.

---

# Part 4 — Decisions log

Append as we go.

- **2026-05-21** — Brand color locked to `#E85D5D` (was `#df625b` earlier).
- **2026-05-21** — Routing locked to multi-project with IDs.
- **2026-05-21** — Persistence locked to localStorage only (no Supabase).
- **2026-05-21** — Layout / Component data model dropped (plan says sections only).
- **2026-05-21** — Rekaz.io homepage adopted as visual reference. Added tinted section backgrounds (peach / mint / lavender / cream) + dark CTA pattern to the design system.
