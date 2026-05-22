# Rekaz Builder

> منصة إنشاء مواقع الأعمال — قوالب جاهزة، تخصيص مرن، وأدوات مبسطة لإدارة
> مشروعك في منصة واحدة.

Lightweight, Arabic-first business-website builder. Pick a starter (Barber /
Coffee Shop / Photography) or start from a blank canvas, drag in pre-made
sections, edit content in a schema-driven side panel, then manage live
business workflows (bookings, menu, portfolio) from a separate dashboard.

**Live:** <https://builder.naifhub.com>

---

## Snapshot

- **Landing** (`/`) — animated hero with typewriter + four illustrated
  feature cards.
- **Templates** (`/templates`) — blueprint-style picker; two workspaces
  (fresh / templates) inside a window-chrome card.
- **Builder** (`/builder/[id]`) — sidebar library · canvas with drag-reorder
  and hover toolbar · schema-driven edit panel · per-section undo/redo.
- **Preview** (`/preview/[id]`) — public-feeling render, no builder UI.
- **Dashboard** (`/dashboard/[id]/{overview,website,workflow,customers,settings}`) —
  stats with sparkline, action cards, real bookings management, mock
  customers table, debounced rename + delete.

## Section presets

| Group        | Sections                                                |
| ------------ | ------------------------------------------------------- |
| Layout       | Header · Hero · Features · CTA · Footer                 |
| Content      | Gallery · Testimonials · FAQ · Contact                  |
| Workflow     | Booking (form → store) · Menu · Portfolio               |

Each preset is one folder under `src/features/sections/<Name>/` with
`Render.tsx`, `Thumbnail.tsx`, `defaults.ts`, and `schema.ts`. Adding a new
section type = create the folder + register it in
[`registry.ts`](src/features/sections/registry.ts) + add a `case` to
[`SectionRenderer.tsx`](src/features/sections/SectionRenderer.tsx).

## Stack

| Layer            | Choice                                          |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js 16 (App Router, Turbopack)              |
| Language         | TypeScript                                      |
| Styling          | Tailwind 4 (`@theme` tokens in `globals.css`)   |
| State            | Zustand (per-feature stores, narrow selectors)  |
| Drag-and-drop    | @dnd-kit (core + sortable)                      |
| Animations       | Framer Motion + CSS keyframes                   |
| Charts           | recharts (single sparkline on the dashboard)    |
| Toasts           | sonner                                          |
| Validation       | Zod (soft schema for JSON import)               |
| Font             | IBM Plex Sans Arabic via `next/font/google`     |
| Persistence      | `localStorage` — keys `rekaz-builder/projects/v1` and `rekaz-builder/bookings/v1` |

## Local setup

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. No backend, no env vars, no auth.

```bash
npm run build  # production build (Turbopack)
npm start      # production server
npm run lint   # eslint
```

## Folder structure

```
src/
├── app/                          Next.js routes (server pages, thin)
│   ├── page.tsx                  /        — landing
│   ├── _front/AnimatedLanding    interactive landing client tree
│   ├── templates/                /templates
│   ├── builder/[id]/             /builder/[id]
│   ├── dashboard/[id]/           /dashboard/[id]/{,website,workflow,customers,settings}
│   └── preview/[id]/             /preview/[id]
│
├── features/
│   ├── builder/                  builder UI (Canvas, Sidebar, EditPanel,
│   │   ├── state/                Toolbar, SortableSection, state hooks)
│   │   ...
│   ├── sections/                 one folder per section type
│   │   └── schema/               FieldSchema + Form + field primitives
│   ├── projects/                 project model + localStorage I/O + picker
│   ├── workflows/                booking/menu/portfolio workflow panels
│   ├── preview/                  public-feeling render
│   └── dashboard/                shell + sub-page components + mock data
│
└── shared/                       cross-feature primitives
    ├── ui/                       Logo / IconButton / ConfirmDialog /
    │                             ConfirmProvider / EmptyState / Skeleton
    └── lib/                      cn, id
```

## Persistence model

All data lives in `localStorage` — by design. Two stores:

| Key                                | Shape                                    |
| ---------------------------------- | ---------------------------------------- |
| `rekaz-builder/projects/v1`        | `Record<projectId, Project>`             |
| `rekaz-builder/bookings/v1`        | `Record<projectId, Booking[]>`           |

This means projects don't sync across browsers or devices — but they survive
refresh and offline use. Export → JSON to migrate; import via the project
picker's footer.

## Real vs mock

**Real:** drag/drop reorder, section editing, starter layouts, booking
submissions, menu editing, gallery editing, undo/redo (cap 50),
auto-save (500 ms debounce), JSON export/import, AR-first RTL layout.

**Semi-real:** dashboard (uses live project + bookings, mock analytics +
customers).

**Mock / stubs:** publish button, email notifications, language toggle (the
UI is Arabic-only — see decisions log).

## Design system

Tokens live in [`src/app/globals.css`](src/app/globals.css) under `@theme`:

- **Brand:** coral `#E85D5D` (`--color-brand`), with soft `#F28B82` and
  light `#FDEEEA`.
- **Section tints:** peach / mint / lavender / cream + a dark surface
  `#0F0F10` for high-contrast CTAs.
- **Neutrals:** Tailwind `stone-*` (warm, not slate).
- **Animations:** float / blob / morph / pulse-glow / fade-in-up / gradient
  background are all `@theme` animation tokens with matching `@keyframes`.

The wordmark + mark + favicon SVGs live in `public/brand/` and are pulled
straight from the Rekaz site.

## Plans

The full product + design plan is at [`docs/PLAN.md`](docs/PLAN.md); the
per-phase engineering breakdown is at
[`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md).

## Deploy

Self-hosted on a VPS via Docker + Caddy:

```bash
docker compose build
docker compose up -d
```

The container joins an external `docker_default` network created by the
host's main `docker-compose.yml` so the shared Caddy can reverse-proxy
`builder.naifhub.com` → `mini-website-builder:3000`. The Caddyfile block
on the VPS:

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
