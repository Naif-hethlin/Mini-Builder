# Rekaz Builder — Implementation Plan

Engineering-level companion to [PLAN.md](./PLAN.md). PLAN.md is the
product / design / status doc; this file is the per-phase breakdown
with file paths and acceptance criteria.

Tick boxes in PLAN.md as phases land. Phase numbers in the two files
match.

---

## Conventions

- All paths relative to repo root.
- New code goes under `src/features/` (feature-first) or `src/shared/`
  (reusable primitives). Routes under `src/app/` stay thin — server
  pages mount client trees.
- Server-only modules under `src/lib/` use `import "server-only"`.
- IDs: `nanoid` via [`src/shared/lib/id.ts`](../src/shared/lib/id.ts).
- Validation at request boundaries: `zod`.
- Every client component opts in with `"use client"`.

---

# Completed milestones

## M1. Foundation (DONE)

- **1. Design system tokens** —
  [`src/app/globals.css`](../src/app/globals.css) `@theme` block, IBM
  Plex Sans Arabic via `next/font/google` in
  [`src/app/layout.tsx`](../src/app/layout.tsx), `dir="rtl"` default.
- **2. Project model + persistence** — initially localStorage
  (`features/projects/storage.ts`), now PostgreSQL via
  [`src/lib/projects-repo.ts`](../src/lib/projects-repo.ts). Auto-save
  flows through `/api/projects/[id]/pages/[pageId]` with a 500 ms
  client-side debounce.
- **3. Routing refactor** — `/builder/[id]`, `/dashboard/[id]`,
  `/preview/[id]`, `/templates`, `/`. Server pages mount client trees
  from `src/features/`.
- **4. Trim data model** — `Section` union (14 types) + `Primitive`
  union (9 types). Both shapes documented in
  [`src/features/builder/state/types.ts`](../src/features/builder/state/types.ts).

## M2. Core builder (DONE)

- **5. EditPanel schema-driven forms** —
  [`src/features/sections/schema/Form.tsx`](../src/features/sections/schema/Form.tsx)
  renders a form from the section's `FieldSchema[]`. Each preset declares
  its own `schema.ts`.
- **6. dnd-kit reorder** —
  [`src/features/builder/SortableSection.tsx`](../src/features/builder/SortableSection.tsx)
  + the sortable context in
  [`src/features/builder/Canvas.tsx`](../src/features/builder/Canvas.tsx).
- **7. Selection + hover toolbar** —
  [`src/features/builder/Toolbar.tsx`](../src/features/builder/Toolbar.tsx).
- **8. Section library** — 14 presets (Header, Hero, Features, Pricing,
  CTA, Gallery, Testimonials, FAQ, Contact, Booking, Menu, Portfolio,
  Canvas, Footer). All registered in
  [`src/features/sections/registry.ts`](../src/features/sections/registry.ts).
- **9. Confirm dialog + toast polish** —
  [`src/shared/ui/ConfirmDialog.tsx`](../src/shared/ui/ConfirmDialog.tsx)
  + the `ConfirmProvider` context, `sonner` toasts.
- **10. JSON export/import** — round-trip with a soft Zod parse in
  [`src/features/projects/io.ts`](../src/features/projects/io.ts).

## M3. Templates + workflows (DONE)

- **11. Landing** —
  [`src/app/_front/AnimatedLanding.tsx`](../src/app/_front/AnimatedLanding.tsx).
- **12. Templates page** —
  [`src/app/templates/page.tsx`](../src/app/templates/page.tsx) +
  [`src/app/templates/_front/`](../src/app/templates/_front/).
  Anonymous visitors see the auth overlay.
- **13. Workflow sections** — Booking, Menu, Portfolio under
  [`src/features/sections/`](../src/features/sections/).
- **14. Preview** —
  [`src/features/preview/PreviewRoot.tsx`](../src/features/preview/PreviewRoot.tsx).
- **15–16. Dashboard shell + sub-pages** —
  [`src/features/dashboard/`](../src/features/dashboard/) (Overview,
  Website, Customers, Settings).
- **17. Workflow pages** —
  [`src/features/workflows/`](../src/features/workflows/) (booking /
  menu / portfolio panels).

## M4. Polish + ship (DONE)

- **18. Animations** — Framer Motion fades / slide-ups across the
  builder and landing.
- **19. Empty states + skeletons** — `EmptyState`, `Skeleton` in
  [`src/shared/ui/`](../src/shared/ui/).
- **20. AR/RTL pass** — `dir="rtl"` default in `layout.tsx`, mirrored
  layouts, Arabic-only copy.
- **21. Mobile pass** —
  [`src/features/builder/MobileTabs.tsx`](../src/features/builder/MobileTabs.tsx),
  device-mode reflow on the canvas.
- **22. Deploy** — Multi-stage [Dockerfile](../Dockerfile),
  [docker-compose.yml](../docker-compose.yml) with Postgres + app on
  the shared `docker_default` network, Caddy reverse proxy on the host.

## M5. Backend + multi-page (DONE)

- **23. Postgres + idempotent migrations** —
  [`src/lib/db.ts`](../src/lib/db.ts) (pg Pool singleton) +
  [`src/lib/migrations.ts`](../src/lib/migrations.ts) (runs on first
  query, safe to re-run).
- **24. Phone-only auth** —
  [`src/lib/auth.ts`](../src/lib/auth.ts) (canonicalisation +
  signup/login) +
  [`src/lib/session.ts`](../src/lib/session.ts) (HMAC-SHA256 signed
  cookie via Web Crypto).
- **25. API routes** —
  [`src/app/api/auth/`](../src/app/api/auth/),
  [`src/app/api/projects/`](../src/app/api/projects/),
  `[id]/pages/[pageId]/route.ts` (page CRUD + auto-save),
  `[id]/publish/route.ts` (publish / unpublish).
- **26. Multi-page projects** —
  [`src/features/projects/types.ts`](../src/features/projects/types.ts)
  `Page` type, home-page invariant enforced in the repo layer, page
  switcher in
  [`src/features/builder/PageSwitcher.tsx`](../src/features/builder/PageSwitcher.tsx).
- **27. Publishing to `/sites/<slug>`** — slug uniqueness checked in
  [`src/lib/projects-repo.ts::publishForOwner`](../src/lib/projects-repo.ts),
  rendered by
  [`src/app/sites/[slug]/page.tsx`](../src/app/sites/[slug]/page.tsx).
- **28. Free-canvas primitives** —
  [`src/features/primitives/`](../src/features/primitives/) folder with
  9 primitive types, factory in
  [`src/features/primitives/factory.ts`](../src/features/primitives/factory.ts).
- **29. Auto-explode starters** —
  [`src/features/builder/explode.ts`](../src/features/builder/explode.ts)
  + the `wrap()` helper in
  [`src/features/sections/starters.ts`](../src/features/sections/starters.ts).
- **30. Device-mode reflow** —
  [`src/features/builder/canvas/useFitScale.ts`](../src/features/builder/canvas/useFitScale.ts).
- **31. Onboarding tour** —
  [`src/features/builder/OnboardingTour.tsx`](../src/features/builder/OnboardingTour.tsx).
- **32. Visit analytics** —
  [`src/features/analytics/VisitBeacon.tsx`](../src/features/analytics/VisitBeacon.tsx)
  fires a fire-and-forget `POST /api/visits` on mount from
  `/preview/[id]` and `/sites/[slug]`; aggregation served from
  `/api/projects/[id]/visits` for the dashboard sparkline.

---

# Roadmap phases (next up)

Pick one and start when you're ready. Each entry lists the goal, the
files most likely to change, and an acceptance bar.

## Phase 33. Image library (server-side uploads)

**Goal:** Replace the "paste an Unsplash URL" hack with a real upload
flow tied to the user's project.

**Likely files**
- `src/app/api/uploads/route.ts` — `POST` handler, writes to
  `public/uploads/<projectId>/<id>.<ext>`.
- `src/features/sections/schema/fields.tsx` — image field gets an
  "Upload" button next to the URL input.
- `src/features/builder/EditPanel.tsx` — wire the upload flow.
- `next.config.ts` — add a max body-size limit; allowlist
  `/uploads` under `images.remotePatterns` if we serve through
  `next/image`.

**Acceptance**
- [ ] Uploaded files appear on the canvas without a page refresh.
- [ ] Files are scoped to the project and tied to its lifecycle
      (deleting a project removes the folder).
- [ ] Uploads outside an allowlisted extension (jpg/png/webp/svg) are
      rejected with a clear toast.

## Phase 34. Custom domains for published sites

**Goal:** Let users bring their own domain instead of relying on
`/sites/<slug>`.

**Likely files**
- `src/lib/projects-repo.ts` — `domains` table, attach/detach helpers.
- `src/app/api/projects/[id]/domain/route.ts` — attach / detach handler.
- `next.config.ts` middleware — route hostname → project lookup.
- Caddy `on_demand_tls` block in the host's `Caddyfile`.

**Acceptance**
- [ ] Pointing a CNAME at the VPS resolves to the right project.
- [ ] Two projects can't claim the same domain.
- [ ] On-demand TLS issues a certificate without manual intervention.

## Phase 35. Visibility toggle per section

**Goal:** Let users hide a section without deleting it. Useful for
seasonal banners and A/B-style tweaks.

**Likely files**
- `src/features/builder/state/types.ts` — add `hidden?: boolean` to
  `Section`.
- `src/features/builder/SortableSection.tsx` — eye-icon toggle next to
  the existing toolbar.
- `src/features/sections/SectionRenderer.tsx` — short-circuit when
  hidden.
- `src/features/preview/PreviewRoot.tsx` — short-circuit when hidden.

**Acceptance**
- [ ] Hidden sections render dimmed in the builder, fully hidden in
      preview + published sites.
- [ ] Toggle survives auto-save round-trip.

## Phase 36. "Duplicate page"

**Goal:** Currently you can duplicate a *section*, not a whole page.

**Likely files**
- `src/lib/projects-repo.ts` — `duplicatePageForOwner` helper.
- `src/app/api/projects/[id]/pages/[pageId]/route.ts` — accept
  `{ action: "duplicate" }`.
- `src/features/builder/PageSwitcher.tsx` — context-menu entry.

**Acceptance**
- [ ] New page is created with a unique slug derived from the source.
- [ ] All primitives get fresh IDs (no React-key collisions).

## Phase 37. Visit breakdown on the dashboard

**Goal:** Use the data VisitBeacon already collects (UA, referrer, IP)
to draw a simple "top referrers / top devices" panel on the dashboard.

**Likely files**
- `src/lib/visits-repo.ts` — `topReferrersForProject`,
  `topDevicesForProject` queries.
- `src/app/api/projects/[id]/visits/route.ts` — extend the response.
- `src/features/dashboard/Overview.tsx` — render two small cards.

**Acceptance**
- [ ] No PII leaks (raw IP never reaches the browser).
- [ ] Queries stay cheap even after ~100k rows (add an index if needed).

---

# CI

The pipeline in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
runs on every PR + push to `main`:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`

Tests were removed (see PLAN.md decisions log, 2026-05-24). When you
re-introduce them, start with the phases in PLAN.md Part 4.C and wire
the runners back into both `package.json` and `ci.yml`.
