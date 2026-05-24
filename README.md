# Rekaz Builder

> منصة إنشاء مواقع الأعمال — قوالب جاهزة، تخصيص مرن، وأدوات مبسطة لإدارة
> مشروعك في منصة واحدة.

A lightweight, Arabic-first business website builder. Pick a starter
(Barber Shop / Coffee Shop / Photography) or start from a blank canvas,
drag pre-made sections, edit content in a schema-driven side panel, then
publish the site to a public URL and manage live business workflows
(bookings, menu, portfolio) from a separate dashboard.

**Live:** <https://builder.naifhub.com>
**Repo:** <https://github.com/Naif-hethlin/Mini-Builder>

---

## Table of contents

1. [What this is](#what-this-is)
2. [Main features](#main-features)
3. [What works vs. what's mocked](#what-works-vs-whats-mocked)
4. [Tech stack](#tech-stack)
5. [Local setup](#local-setup)
6. [Folder structure](#folder-structure)
7. [Routes](#routes)
8. [Data model](#data-model)
9. [Testing](#testing)
10. [Roadmap & planned enhancements](#roadmap--planned-enhancements)
11. [Deploy](#deploy)
12. [Documentation](#documentation)

---

## What this is

Rekaz Builder targets non-technical Saudi business owners who need a
landing page **and** a small management dashboard, not a full Webflow
clone. The product is opinionated:

- **Guided when helpful, flexible when needed.** Starters are pre-built
  but never locked. You can drop into a free canvas and place text,
  buttons and images anywhere.
- **One site per account.** The picker is hidden — users land directly
  on their project's dashboard. Multi-site is intentionally out of scope.
- **Arabic-first, RTL by default.** Layout, copy, and typography are
  designed for `dir="rtl"` from the ground up.
- **Real backend, simple primitives.** Postgres + cookie-signed sessions,
  but no email/OTP/password flow — login is phone-only (Saudi mobile).

## Main features

### Builder (`/builder/[id]`)
- Section library sidebar with 14 presets (see [Section presets](#section-presets)).
- Drag-and-drop reorder on the canvas via `@dnd-kit`.
- Schema-driven edit panel — every section declares its fields in a
  `schema.ts`, and the right-hand form is rendered from that schema.
- Hover toolbar per section: duplicate, delete, move up/down.
- **Free canvas mode** — pick "لوحة حرّة" and drop primitives (text,
  heading, button, image, list, shape, icon, input, Q&A) at absolute
  positions on a free-form layer.
- **Auto-explode starters** — presets land already exploded into editable
  primitives, so users can edit any sub-element of a Hero/Features card
  individually.
- Multi-page projects (`pages: Page[]`) with a page switcher; exactly one
  home page per project.
- Per-design undo/redo (history cap 50).
- Auto-save with a 500 ms debounce → PATCH to `/api/projects/[id]/pages/[pageId]`.
- Device-mode toggle (desktop / tablet / mobile) — mobile reflows the
  layout to a vertical stack instead of just shrinking.
- Hotkeys + a first-run onboarding tour.

### Preview & publishing
- `/preview/[id]` — owner-only preview, no builder chrome.
- `/preview/[id]/[slug]` — preview a specific page within a project.
- `/sites/[slug]` — **public** published site. Anyone can open it; no
  auth gate.
- `/sites/[slug]/[pageSlug]` — public render of a sub-page.
- Publishing is a real DB flip (`projects.published`, `projects.slug`)
  guarded by a uniqueness check on the slug.

### Dashboard (`/dashboard/[id]`)
- Sidebar nav: Overview · Website · Workflow · Customers · Settings.
- **Overview:** real visits sparkline (mocked numbers — see below),
  recent bookings, project status (published vs draft + public URL).
- **Website:** rename, edit-this-site CTA, preview link, publish modal,
  delete project (confirm dialog).
- **Workflow:** business-type-aware. Coffee shops get a menu editor,
  photographers get a portfolio editor, barbers get a bookings table +
  calendar view.
- **Customers:** mock customer list.
- **Settings:** rename, delete, export/import JSON.

### Auth
- Saudi phone-only auth. Sign-up = phone + name. Login = phone alone.
- Phone numbers are canonicalised on input — `+966 55 123 4567`,
  `00966551234567`, and `0551234567` all fold to the same DB key.
- Signed HMAC-SHA256 session cookie (`rekaz_session`), 30-day TTL,
  `httpOnly`, `sameSite=lax`, `secure` in production.
- No password, no OTP, no email/recovery — explicit product decision.

### Workflows
- **Bookings (barber):** the Booking section's form posts into a per-project
  bookings table. The dashboard panel lists them with filters
  (all / pending / done / canceled), a calendar grid, and status actions.
- **Menu (coffee):** CRUD against the active menu section — add/remove
  items, edit price/description, reorder.
- **Portfolio (photography):** CRUD over portfolio items with a live
  preview tile.

### Landing & template picker
- `/` — animated landing page with a typewriter hero, feature cards,
  starter showcase, and dual CTAs.
- `/templates` — auth-gated workspace. Anonymous visitors see the sign-up
  overlay. Authenticated users see scratch + the three starters in a
  blueprint-card preview frame.
- `/demo` — a Rekaz-styled showcase page that anonymous visitors can
  open without an account.

### Section presets

| Group        | Sections                                                          |
| ------------ | ----------------------------------------------------------------- |
| Layout       | Header · Hero · Features · Pricing · CTA · Footer                 |
| Content      | Gallery · Testimonials · FAQ · Contact                            |
| Workflow     | Booking · Menu · Portfolio                                        |
| Freeform     | Canvas (free-positioned primitives)                               |

Each preset is one folder under [`src/features/sections/<Name>/`](src/features/sections/)
with `Render.tsx`, `Thumbnail.tsx`, `defaults.ts`, and `schema.ts`.
Adding a new section type = create the folder + register it in
[`registry.ts`](src/features/sections/registry.ts) + add a `case` to
[`SectionRenderer.tsx`](src/features/sections/SectionRenderer.tsx).

### Primitive presets (Canvas)

The free Canvas section accepts 9 primitive tiles:
**Heading · Text · Button · Image · List · Shape · Icon · Input · Q&A.**
They live under [`src/features/primitives/`](src/features/primitives/)
and are registered in [`registry.ts`](src/features/primitives/registry.ts).

---

## What works vs. what's mocked

**Real:**
- Drag/reorder, all section editing, starter layouts.
- Auth (Saudi phone, signed session cookie).
- Postgres persistence for users / projects / pages / bookings.
- Publishing to `/sites/<slug>` with slug uniqueness check.
- Multi-page projects with a home-page invariant.
- Bookings submission + per-project bookings management.
- Menu editing, gallery editing, portfolio CRUD.
- JSON export/import of a whole project.
- Auto-save (500 ms debounce) and undo/redo (history cap 50).
- Free canvas primitives with absolute positioning + rotation.
- RTL/Arabic-first layout end-to-end.
- Device-mode reflow (desktop/tablet/mobile) in builder + runtime.
- First-run onboarding tour.

**Semi-real:**
- Dashboard overview — real project + bookings counts. Visits are now
  recorded server-side via `POST /api/visits` (see
  [VisitBeacon](src/features/analytics/VisitBeacon.tsx)) but the
  sparkline aggregation may still fall back to mocked sample shapes
  for empty projects.

**Mocked / stubbed:**
- Email notifications (the bell in the dashboard is a static stub).
- Real-time analytics (visits, customer insights).
- Customers table on the dashboard.
- Language toggle (UI is Arabic-only by design).
- Payment systems.

---

## Tech stack

| Layer            | Choice                                                                  |
| ---------------- | ----------------------------------------------------------------------- |
| Framework        | **Next.js 16** (App Router, Turbopack, `output: standalone`)            |
| UI               | **React 19**                                                            |
| Language         | **TypeScript** (strict)                                                 |
| Styling          | **Tailwind 4** with `@theme` design tokens in `globals.css`             |
| Client state     | **Zustand** (one store per feature, narrow selectors)                   |
| Drag-and-drop    | **@dnd-kit** (core + sortable)                                          |
| Animations       | **Framer Motion** + CSS keyframes                                       |
| Charts           | **recharts** (one sparkline on the dashboard)                           |
| Toasts           | **sonner**                                                              |
| Icons            | **lucide-react** + **@iconify/react**                                   |
| Validation       | **Zod** at request boundaries                                           |
| IDs              | **nanoid** (URL-safe short IDs)                                         |
| Font             | **IBM Plex Sans Arabic** via `next/font/google`                         |
| Database         | **PostgreSQL 16** via the `pg` driver, idempotent in-process migrations |
| Auth             | Phone-only, **HMAC-SHA256** signed cookie via Web Crypto                |
| Linting          | ESLint (`eslint-config-next`) + Prettier (+ `prettier-plugin-tailwindcss`) |
| Unit tests       | **Vitest** + Testing Library + jsdom                                    |
| E2E tests        | **Playwright** (Chromium)                                               |
| Container        | Multi-stage Docker (Node 22 Alpine) + Docker Compose                    |
| Reverse proxy    | Caddy (external `docker_default` network on the VPS)                    |

---

## Local setup

Requirements: Node 20+ and a Postgres database (locally or via Docker).

```bash
# 1. install deps
npm install

# 2. configure env — create .env.local with:
#   DATABASE_URL=postgres://user:pass@localhost:5432/rekaz_builder
#   SESSION_SECRET=<a 32+ char random string>

# 3. run
npm run dev
```

Then open <http://localhost:3000>. Migrations run automatically on the
first DB query — no separate `migrate` step.

```bash
npm run build       # production build (Turbopack, standalone output)
npm start           # production server
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm test            # vitest (unit tests)
npm run test:watch  # vitest watch mode
npm run test:e2e    # playwright (auto-starts npm run dev)
```

---

## Folder structure

```
src/
├── app/                          Next.js routes (server pages stay thin)
│   ├── page.tsx                  /         — animated landing
│   ├── _front/AnimatedLanding    interactive landing client tree
│   ├── templates/                /templates — auth-gated picker
│   ├── login/                    /login
│   ├── builder/[id]/             /builder/[id]
│   ├── preview/[id]/             /preview/[id]/[slug?]
│   ├── sites/[slug]/             /sites/[slug]/[pageSlug?] — public
│   ├── dashboard/[id]/           /dashboard/[id]/{overview,website,workflow,customers,settings}
│   ├── demo/                     /demo                 — anonymous showcase
│   └── api/                      auth + projects + pages + publish
│
├── features/
│   ├── auth/                     overlay + useCurrentUser + user menu
│   ├── builder/                  Builder shell, Canvas, Sidebar, EditPanel,
│   │   ├── canvas/               free-canvas editor + fit-to-width scaling
│   │   └── state/                Zustand store + history + selectors
│   ├── sections/                 one folder per section type
│   │   └── schema/               FieldSchema + Form + field primitives
│   ├── primitives/               heading/text/button/image/list/shape/...
│   ├── analytics/                VisitBeacon (POST /api/visits on mount)
│   ├── projects/                 project model + API client + picker
│   ├── workflows/                booking / menu / portfolio panels
│   ├── preview/                  PreviewRoot (no builder chrome)
│   └── dashboard/                shell, sub-pages, derive helpers, mocks
│
├── lib/                          server-only modules
│   ├── db.ts                     pg Pool singleton + query helper
│   ├── migrations.ts             idempotent schema setup
│   ├── auth.ts                   signup/login + phone canonicalisation
│   ├── session.ts                signed-cookie session
│   └── projects-repo.ts          projects/pages/publish data layer
│
└── shared/                       cross-feature primitives
    ├── ui/                       Logo · IconButton · ConfirmDialog · ...
    └── lib/                      cn, id
```

## Routes

| Path                                    | Purpose                                    |
| --------------------------------------- | ------------------------------------------ |
| `/`                                     | Animated landing page                      |
| `/templates`                            | Auth-gated workspace + starter picker      |
| `/login`                                | Phone sign-in / sign-up                    |
| `/builder/[id]`                         | Builder (sidebar · canvas · edit panel)    |
| `/preview/[id]`                         | Owner-only preview (home page)             |
| `/preview/[id]/[slug]`                  | Owner-only preview (specific page)         |
| `/sites/[slug]`                         | **Public** published site (home)           |
| `/sites/[slug]/[pageSlug]`              | **Public** published site (sub-page)       |
| `/dashboard/[id]/{,website,workflow,customers,settings}` | Dashboard sub-pages       |
| `/demo`, `/demo/dashboard/*`            | Anonymous-visitor demo                     |
| `/api/auth/{signup,login,logout,me}`    | Auth                                       |
| `/api/projects` · `/api/projects/[id]`  | List, create, read, rename, delete         |
| `/api/projects/[id]/pages/[pageId]`     | Update page design (auto-save target)      |
| `/api/projects/[id]/publish`            | Publish / unpublish                        |
| `/api/projects/[id]/visits`             | Aggregated visit counts for the dashboard  |
| `/api/visits`                           | Anonymous beacon — VisitBeacon POSTs here  |

## Data model

Persistence is **PostgreSQL only**. Four tables, all idempotently
migrated by [`src/lib/migrations.ts`](src/lib/migrations.ts) on first DB
access:

| Table        | Purpose                                                       |
| ------------ | ------------------------------------------------------------- |
| `users`      | `(id, phone UNIQUE, name, created_at)`                        |
| `projects`   | `(id, owner_id, name, template_type, slug UNIQUE, published, published_at, ...)` |
| `pages`      | `(id, project_id, slug, name, order, is_home, design JSONB)`  |
| `bookings`   | `(id, project_id, name, phone, booking_date, booking_time, staff_name, status)` |

The whole design tree (sections + free-canvas primitives) lives inside
the `pages.design` JSONB column. Section shapes are documented in
[`src/features/builder/state/types.ts`](src/features/builder/state/types.ts).

---

## CI

CI is configured in [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
and runs on every PR + push to `main`:

1. `npm run lint` — ESLint with Next.js + TS rules.
2. `npm run typecheck` — `tsc --noEmit`.
3. `npm run build` — Next.js production build.

The project doesn't ship with automated tests at the moment. If you add
them later, drop them under `src/**/*.test.ts(x)` (Vitest) or
`tests/e2e/*.spec.ts` (Playwright), wire the runners into `package.json`,
and add the corresponding CI steps.

---

## Roadmap & planned enhancements

Detailed phase-by-phase plan lives in [docs/PLAN.md](docs/PLAN.md) and
the engineering breakdown in [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md).
Headline next-ups:

**Near-term polish**
- Tablet/mobile pass on every dashboard sub-page.
- Empty-state copy on the workflow panels when there's no data yet.
- Animation pass on free-canvas primitive insertion.
- Replace the mock visits sparkline with real per-page hit counts.

**New surface area**
- Image library (server-side uploads → `public/uploads/`) so users can
  stop pasting Unsplash URLs.
- Custom domains for published sites (CNAME + Caddy on-demand TLS).
- Per-project bookings analytics (peak hours, no-show rate).
- A "duplicate page" action in the page switcher.
- Per-section visibility toggle (hide without delete).

**Quality**
- Throw-away Postgres in CI for integration tests of the API routes.
- Visual regression snapshots of the rendered starters.
- Lighthouse budget gate on the published-site routes.

---

## Deploy

Self-hosted on a VPS via Docker Compose + Caddy:

```bash
docker compose build
docker compose up -d
```

The compose file pulls in `postgres:16-alpine` and the app image. Both
containers join the shared `docker_default` network so the host's main
Caddy can reverse-proxy `builder.naifhub.com` → `mini-website-builder:3000`.

Required env (in `.env` next to `docker-compose.yml`):

```env
POSTGRES_USER=rekaz
POSTGRES_PASSWORD=<change-me>
POSTGRES_DB=rekaz_builder
SESSION_SECRET=<32+ char random>
```

Caddy block on the host:

```caddy
builder.naifhub.com {
  reverse_proxy mini-website-builder:3000
  encode gzip
  header {
    X-Frame-Options SAMEORIGIN
    X-Content-Type-Options nosniff
    Referrer-Policy strict-origin-when-cross-origin
    -Server
  }
}
```

---

## Documentation

- [docs/PLAN.md](docs/PLAN.md) — product vision, design system, phased plan.
- [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md) — engineering-level phase breakdown.
- Code-level comments live next to the modules they describe.
