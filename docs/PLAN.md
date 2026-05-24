# Rekaz Builder — Master Plan

> Source-of-truth document for the project. Combines product vision,
> design system, current status, and roadmap. Update this file as
> decisions change. The engineering-level breakdown lives in
> [IMPLEMENTATION.md](./IMPLEMENTATION.md).

---

## 0. Quick facts

- **Project:** Naif's Rekaz frontend interview submission, now extended.
- **Repo:** `/home/ubuntu/mini-website-builder/` (standalone).
- **GitHub:** <https://github.com/Naif-hethlin/Mini-Builder>
- **Live URL:** <https://builder.naifhub.com>.
- **Brand color:** `#E85D5D` (coral). Secondary `#F28B82`.
- **Routing model:** multi-page projects with IDs
  (`/builder/[id]`, `/dashboard/[id]`, `/preview/[id]/[slug?]`,
  `/sites/[slug]/[pageSlug?]`).
- **Persistence:** **PostgreSQL** (was localStorage in the original
  interview submission — see Decisions log).
- **Auth:** Saudi phone-only signup/login + HMAC-signed session cookie.
- **Stack:** Next.js 16 + React 19 + TS + Tailwind 4 + Zustand + dnd-kit
  + Framer Motion + Zod + Postgres.

---

# Part 1 — Product vision

## Vision

Rekaz Builder is a lightweight business website platform designed for
non-technical business owners.

The goal is **NOT** to build a complex website builder like Webflow.

The goal is to:

- help users launch quickly,
- provide guided starter layouts,
- allow flexible customisation when needed,
- include lightweight business workflows (bookings / menu / portfolio),
- make the experience extremely easy and safe for non-technical users.

Core philosophy:

> Guided when helpful, flexible when needed.

## Primary product goals

- Simple onboarding (phone-only auth, no email/password).
- Non-technical-friendly UX.
- Ready business starter layouts.
- Flexible editing — including a free-positioning canvas mode.
- Lightweight management dashboard.
- Realistic business workflows backed by a real DB.
- Responsive design (desktop / tablet / mobile reflow).
- Smooth, polished UI.

## Avoid

- Complex design systems.
- Advanced freeform layout editing for everyday use (the free canvas is
  an opt-in for the user who wants it, not the default).
- Developer-heavy UX.
- Enterprise dashboards.
- Real payment systems.
- Email / OTP / password recovery flows.

## Product flow

1. **Landing** (`/`) — hero, features, starter showcase, CTAs.
2. **Templates** (`/templates`) — auth gate; signed-in users see scratch
   + the three starter cards.
3. **Builder** (`/builder/[id]`) — sidebar library, canvas, schema-driven
   edit panel, per-design undo/redo, free canvas mode.
4. **Preview** (`/preview/[id]`) — owner-only preview, no builder chrome.
5. **Sites** (`/sites/[slug]`) — public published site, no auth gate.
6. **Dashboard** (`/dashboard/[id]`) — Overview / Website / Workflow /
   Customers / Settings.

## Business templates

### Barber shop
- Sections: Header, Hero, Services (Features), Testimonials, Booking, Contact, Footer.
- **Real:** booking flow (select staff → date → time → submit, stored in `bookings` table).
- **Mocked:** revenue analytics, customer insights.

### Coffee shop
- Sections: Header, Hero, Menu, Gallery, CTA, Contact, Footer.
- **Real:** menu editor (CRUD against the active Menu section).
- **Mocked:** orders analytics, delivery tracking.

### Photography portfolio
- Sections: Header, Hero, Portfolio, Features (packages), Testimonials, Contact, Footer.
- **Real:** portfolio CRUD (add/remove/reorder images with categories).
- **Mocked:** client analytics, session invoices.

## UX principles

The user is **non-technical**. Everything must feel obvious, guided,
safe, and clean.

Avoid: blank confusion, too many controls, overwhelming interfaces. The
system provides smart defaults for spacing, typography, colours, and
section ordering. Users mainly edit content, images, ordering, and
business data.

## Engineering decisions

- Default builder is **not** fully freeform: add/remove sections, reorder,
  and edit per-section content. Users who want free positioning opt into
  the **Canvas** section.
- Starter layouts are predefined section arrays produced by
  `starterDesignFor(templateType)` in
  [`src/features/sections/starters.ts`](../src/features/sections/starters.ts).
- Auto-explode: each preset section in a starter is exploded into editable
  primitives on creation so the user can edit any sub-element directly.
- Client state is managed by Zustand with narrow selectors per feature.
- Persistence is PostgreSQL only — JSONB for design payloads,
  relational tables for users / projects / pages / bookings / visits.
- Analytics are server-side: VisitBeacon fires a fire-and-forget POST
  to `/api/visits` on mount, recordVisit derives OS/device from UA on
  the server, no PII reaches the browser.

## Real vs. mocked features

- **Real:** drag/reorder, all section editing, starter layouts, real auth
  + sessions, multi-page projects, publishing to `/sites/<slug>`,
  bookings, menu editing, portfolio CRUD, undo/redo, auto-save, JSON
  export/import, AR/RTL layout, device-mode reflow, server-side visit
  tracking.
- **Semi-real:** dashboard overview (real bookings + visits counts,
  shape of sparkline may fall back to a sample for brand-new projects).
- **Mocked:** payments, customers table, email notifications, language
  toggle.

---

# Part 2 — Design system

## Feeling

The product should feel **calm, modern, friendly, simple, trustworthy,
Arabic-first, non-technical-friendly**.

It should NEVER feel corporate-enterprise, developer-heavy, futuristic,
crowded, or complicated.

> "I can use this without technical knowledge."

## Colors

Defined in [`src/app/globals.css`](../src/app/globals.css) under `@theme`.

```
Primary brand:     #E85D5D   buttons, active, highlights, CTA, big stats
Secondary accent:  #F28B82   hover, soft backgrounds, badges

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

### Tinted section backgrounds

Sections alternate tinted backgrounds with white to give the page
rhythm. Pick by context, never random.

```
peach    #FDEEEA   hero, primary tinted blocks
mint     #E8F4EC   positive / "what you get"
lavender #EFEDF7   calm secondary blocks
cream    #FBF6EE   FAQ, soft trust blocks
dark     #0F0F10   high-contrast CTAs near the bottom
```

## Typography

- **Primary font:** IBM Plex Sans Arabic. Fallback: Inter.
- Avoid too many weights, ultra-thin text, tiny text.

```
Hero title     — text-5xl  font-bold  tracking-tight
Section title  — text-3xl  font-semibold
Card title     — text-xl   font-medium
Body           — text-base leading-7
Small label    — text-sm   font-medium
```

## Spacing & radii

```
Section padding  py-24 (desktop) / py-16 (mobile)
Card padding     p-6 or p-8
Gap system       gap-4 / gap-6 / gap-8
Main radius      rounded-2xl
Small radius     rounded-xl
```

## Shadows

Stick to `shadow-sm` (custom: `0 1px 2px rgba(0,0,0,0.04)`). No giant
shadows, no neon, no hard depth.

## Layout sizes

- Builder left sidebar: **320 px**.
- Builder right panel: **280 px**.
- Builder canvas: fluid, fits available width with desktop/tablet/mobile
  device-mode scaling.

## Animations (Framer Motion)

Subtle fade-in, slide-up, slight scale, smooth hover. Avoid bouncing,
spinning, excessive motion.

## Mobile

- Builder uses bottom tabs to switch between Library / Canvas / Edit.
- Canvas device-mode "mobile" **reflows** into a vertical stack instead
  of just shrinking — so users see what a real phone will render.
- One panel visible at a time on small screens.

---

# Part 3 — Status

Phase status legend: `[ ]` not started · `[~]` in progress · `[x]` done.
Phase numbers match [IMPLEMENTATION.md](./IMPLEMENTATION.md).

## M1. Foundation — design system + routing

- [x] **1.** Design system tokens (Tailwind `@theme`, IBM Plex Sans Arabic, coral).
- [x] **2.** Project model + persistence (originally localStorage, now Postgres).
- [x] **3.** Routing refactor → `/builder/[id]`, `/dashboard/[id]`, `/preview/[id]`.
- [x] **4.** Trim data model (Section + free-canvas Primitive — no
  Layout/Component variants).

## M2. Core builder — edit, reorder, more sections

- [x] **5.** EditPanel schema-driven forms (one `schema.ts` per section).
- [x] **6.** dnd-kit reorder with drop indicator.
- [x] **7.** Selection + hover toolbar (delete / duplicate / move).
- [x] **8.** Section library expansion (Gallery, Testimonials, FAQ,
  Contact + Pricing, CTA).
- [x] **9.** Confirm dialog + toast polish.
- [x] **10.** JSON export/import in Settings.

## M3. Templates + business workflows

- [x] **11.** Landing page `/`.
- [x] **12.** Templates page `/templates` (auth-gated).
- [x] **13.** Workflow sections (Booking, Menu, Portfolio).
- [x] **14.** Preview route `/preview/[id]`.
- [x] **15.** Dashboard shell.
- [x] **16.** Dashboard sub-pages (Overview, Website, Customers, Settings).
- [x] **17.** Workflow pages (Bookings table + calendar, Menu editor,
  Portfolio CRUD).

## M4. Polish + ship

- [x] **18.** Framer Motion animation pass.
- [x] **19.** Empty states + skeletons across lists / canvas / panels.
- [x] **20.** AR/RTL pass (Arabic-only UI, `dir="rtl"` default).
- [x] **21.** Mobile pass — bottom tabs, touch targets, device-mode reflow.
- [x] **22.** Deploy — Dockerised (multi-stage build) with a bundled
  Postgres service via docker-compose.

## M5. Backend + multi-page (post-interview)

- [x] **23.** Postgres + idempotent migrations replacing localStorage.
- [x] **24.** Phone-only auth + signed-cookie sessions.
- [x] **25.** API routes (auth, projects CRUD, pages CRUD, publish/unpublish).
- [x] **26.** Multi-page projects with home-page invariant + page switcher.
- [x] **27.** Publishing to `/sites/<slug>` with slug uniqueness.
- [x] **28.** Free-canvas primitives (heading/text/button/image/list/shape/icon/input/qa).
- [x] **29.** Auto-explode starter presets into editable primitives.
- [x] **30.** Device-mode reflow + fit-to-width scaling on the canvas.
- [x] **31.** First-run onboarding tour.
- [x] **32.** Server-side visit analytics (VisitBeacon + `/api/visits`
  + `/api/projects/[id]/visits`).

---

# Part 4 — Roadmap

Concrete next-ups, grouped by theme. Pick from here when starting a new
phase.

## A. Polish

- [ ] Tablet/mobile pass on every dashboard sub-page.
- [ ] Empty-state copy on workflow panels when data is missing.
- [ ] Animation pass on free-canvas primitive insertion.
- [ ] Lighthouse budget gate on `/sites/[slug]` routes.

## B. New surface area

- [ ] Image library — server-side uploads to `public/uploads/` so users
      stop pasting Unsplash URLs.
- [ ] Custom domains for published sites (CNAME-based, on-demand TLS).
- [ ] Per-section visibility toggle (hide without delete).
- [ ] "Duplicate page" action in the page switcher.
- [ ] Per-project bookings analytics (peak hours, no-show rate).
- [ ] Geo / referrer breakdown of visits on the dashboard.

## C. Testing & quality

The project currently has no automated tests (Vitest + Playwright were
removed when scope was simplified). If we re-introduce them, start with:

- [ ] Pure-logic Vitest tests on the Zustand stores (`builder/state`,
      `projects`, `workflows/booking`).
- [ ] Vitest snapshot for the section registry — fails when a preset is
      added without a thumbnail / defaults / schema.
- [ ] Playwright e2e: landing CTAs, auth gate on `/templates`,
      `/demo` smoke.
- [ ] Playwright e2e: drop a Hero, type a title, assert canvas updates
      and the auto-save PATCH lands.
- [ ] Publish-flow e2e: publish → fetch `/sites/<slug>` as anonymous.
- [ ] Visual regression on the rendered starters.

---

# Part 5 — Decisions log

Append as we go.

- **2026-05-21** — Brand color locked to `#E85D5D` (was `#df625b` earlier).
- **2026-05-21** — Routing locked to multi-project with IDs.
- **2026-05-21** — Persistence initially locked to localStorage only
  (no Supabase).
- **2026-05-21** — Layout / Component data model dropped (plan is
  sections only).
- **2026-05-21** — Rekaz.io homepage adopted as visual reference. Added
  tinted section backgrounds (peach / mint / lavender / cream) + dark
  CTA pattern to the design system.
- **2026-05-22** — Phone-only auth chosen over username/password. Saudi
  mobile only, no OTP, no email recovery.
- **2026-05-22** — Persistence moved from localStorage to PostgreSQL.
  The product needs publishing and a public URL, which is impossible
  with per-browser storage.
- **2026-05-22** — Published sites live at `/sites/<slug>` (not
  `/<slug>`) so the URL space is unambiguous and reserved root paths
  (`/builder`, `/dashboard`, `/templates`) stay clean.
- **2026-05-23** — One project per user — `POST /api/projects` is
  idempotent. Multi-site is out of scope; the product is a single-site
  builder by design.
- **2026-05-23** — Builder canvas mobile mode **reflows** into a vertical
  stack rather than only scaling. Scaling hid responsive bugs and made
  the preview lie about the real phone result.
- **2026-05-23** — Starter presets auto-explode into editable primitives
  on creation, so users can edit any sub-element of a hero/features card
  individually.
- **2026-05-24** — Removed Vitest + Playwright tests + their deps to
  keep the scope tight. CI runs lint + typecheck + build only.
  Re-introduce tests under Roadmap C when there's a clear regression to
  protect against.
