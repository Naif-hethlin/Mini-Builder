# Rekaz Builder — Implementation Plan

Per-phase breakdown. Read [PLAN.md](./PLAN.md) first for product vision +
design system. This file is the actionable engineering doc.

Each phase has: goal, files, steps, and acceptance criteria. Tick the boxes
in [PLAN.md](./PLAN.md) as phases land.

---

## Conventions

- All paths relative to repo root (`/home/ubuntu/mini-website-builder/`).
- New code goes under `src/features/` (feature-first) or `src/shared/`
  (reusable primitives). Route folders under `src/app/` should be thin —
  server pages that mount client components.
- Use `nanoid` (already a dep) for IDs.
- Use `zod` for validation at boundaries (file import, route params).
- All client components opt in with `"use client"`.

---

# Milestone M1 — Foundation

Goal of M1: get tokens, persistence, and routing right before scaling out.
This unblocks every later phase.

## Phase 1. Design system tokens

**Goal:** Tailwind theme + global font + base colors match the design system.
Existing builder repainted to use the new tokens.

**Effort:** ~2 h.

**Files**

Modify:
- `src/app/globals.css` — Tailwind 4 `@theme` block. Add all color tokens,
  font tokens, radius tokens.
- `src/app/layout.tsx` — load IBM Plex Sans Arabic via `next/font/google`,
  set `lang="ar" dir="rtl"` as default.
- Any component using `bg-brand-*` etc. — verify mapping to new tokens.

**Steps**

1. In `globals.css`, write the `@theme` block with:
   - `--color-brand: #E85D5D;`
   - `--color-brand-soft: #F28B82;`
   - `--color-tint-peach: #FDEEEA;`
   - `--color-tint-mint: #E8F4EC;`
   - `--color-tint-lavender: #EFEDF7;`
   - `--color-tint-cream: #FBF6EE;`
   - `--color-surface-dark: #0F0F10;`
   - Stone neutrals (bg / surface / text / border).
   - `--font-sans: var(--font-ibm-plex-arabic), Inter, sans-serif;`
   - `--radius-md: 0.75rem;` `--radius-lg: 1rem;` `--radius-xl: 1.5rem;`
2. In `layout.tsx`, import `IBM_Plex_Sans_Arabic` from `next/font/google`,
   apply as a CSS variable on `<html>`.
3. Add `lang="ar" dir="rtl"` to `<html>`.
4. Walk every existing usage of `bg-brand-*` and confirm it still resolves.
5. Skim the builder UI — replace any hardcoded hex / non-token colors with
   the new tokens.

**Acceptance**

- [ ] Builder loads with coral CTA buttons and stone neutrals.
- [ ] IBM Plex Sans Arabic visible in DevTools fonts panel.
- [ ] `npm run build` passes.
- [ ] No TS or Tailwind errors.

---

## Phase 2. Project model + localStorage persistence

**Goal:** Single source of truth for projects in localStorage. Builder
auto-saves on edit.

**Effort:** ~3 h.

**Files**

Create:
- `src/features/projects/types.ts` — `Project`, `ProjectMeta` types.
- `src/features/projects/storage.ts` — read/write localStorage. Single key
  `rekaz-builder/projects/v1` storing `{ [id]: Project }`.
- `src/features/projects/store.ts` — Zustand store with `list`, `get`,
  `create`, `rename`, `delete`, `updateDesign` actions. Hydrated from
  storage on mount.
- `src/features/projects/index.ts` — public API barrel.

Modify:
- `src/app/web-builder/_back/store.ts` — accept project ID. On every design
  mutation, debounce-call `updateDesign(projectId, design)`.

**Steps**

1. Define `Project = { id, name, design, templateType?, createdAt,
   updatedAt }`.
2. Write `storage.ts`: `loadAll(): Record<string, Project>`,
   `saveAll(map)`. Guard with `typeof window !== "undefined"`.
3. Write Zustand `projectsStore` with debounced persist (use lodash debounce
   OR a tiny inline debounce util).
4. In builder store, expose `loadProject(id)` and `saveCurrent()`. Wire
   `addSection`, `updateSection`, etc. to trigger debounced save.
5. Validate loaded JSON with a Zod schema before trusting it (corruption
   safety).

**Acceptance**

- [ ] `localStorage.getItem("rekaz-builder/projects/v1")` shows real data
      after editing.
- [ ] Edits survive page refresh.
- [ ] Two different project IDs don't share state.
- [ ] Corrupt JSON in localStorage doesn't crash the app.

---

## Phase 3. Routing refactor

**Goal:** Move builder to `/builder/[id]`. Stub `/`, `/templates`,
`/dashboard/[id]`, `/preview/[id]`. Move builder UI out of `app/` into a
feature module.

**Effort:** ~2 h.

**Files**

Create:
- `src/app/builder/[id]/page.tsx` — server component, mounts
  `<Builder projectId={params.id} />`.
- `src/app/templates/page.tsx` — placeholder.
- `src/app/dashboard/[id]/page.tsx` — placeholder.
- `src/app/preview/[id]/page.tsx` — placeholder.
- `src/features/builder/` — destination for moved UI.

Move:
- `src/app/web-builder/_front/*` → `src/features/builder/`
- `src/app/web-builder/_back/*` → `src/features/builder/state/`

Modify:
- `src/app/page.tsx` — landing placeholder (real landing in Phase 11).
- All imports affected by the move.

Delete:
- `src/app/web-builder/` (after move).

**Steps**

1. `git mv` the `_front/` and `_back/` folders to `src/features/builder/`.
2. Fix internal imports.
3. Create `src/app/builder/[id]/page.tsx`:
   ```tsx
   import { Builder } from "@/features/builder/Builder";
   export default async function Page({ params }) {
     const { id } = await params;
     return <Builder projectId={id} />;
   }
   ```
4. Add `projectId` prop to `<Builder>`, call `loadProject(projectId)` on
   mount.
5. Create stub pages for `/`, `/templates`, `/dashboard/[id]`,
   `/preview/[id]` with minimal "Coming soon" content (correct shell + font
   so they don't look broken).
6. Delete `src/app/web-builder/`.

**Acceptance**

- [ ] `/builder/<any-id>` loads the builder.
- [ ] `/templates`, `/dashboard/x`, `/preview/x` return 200 with placeholder.
- [ ] `/web-builder` returns 404.
- [ ] All imports clean, `npm run build` passes.

---

## Phase 4. Trim data model

**Goal:** Drop unused Layout / Component union variants. Simplify the
sidebar to one tab.

**Effort:** ~1 h.

**Files**

Modify:
- `src/features/builder/state/types.ts` — remove `LayoutProps`, `LayoutRow`,
  `LayoutColumn`, all `*ComponentProps`, the `Component` union, the
  `layout` variant of `Section`.
- `src/features/sections/SectionRenderer.tsx` — drop the `layout` case.
- `src/features/builder/state/store.ts` — remove `refreshNestedIds` helper.
- `src/features/builder/Sidebar.tsx` — drop the "Layouts" + "Components"
  tabs. Sidebar is now single-pane "Sections".

Delete:
- `src/features/layouts/`
- `src/features/components/`
- `SidebarTab` type, `setSidebarTab` action, `selectSidebarTab` selector.

**Steps**

1. Remove unused types from `types.ts`.
2. Update `SectionRenderer.tsx` to remove the `layout` switch case.
3. Delete the layouts + components stub folders.
4. Refactor `Sidebar.tsx` to skip tabs entirely and just show the section
   library directly.
5. Remove `SidebarTab` state from the store.

**Acceptance**

- [ ] `npm run build` passes.
- [ ] No dead exports.
- [ ] Sidebar shows section library directly, no empty tabs.

---

# Milestone M2 — Core builder

Goal of M2: builder becomes usable end-to-end (edit, reorder, more sections,
proper dialog, save/load).

## Phase 5. EditPanel schema-driven forms

**Goal:** Selecting a section shows a form bound to its props. Editing the
form updates the canvas live.

**Effort:** ~5 h.

**Files**

Create:
- `src/features/sections/schema/types.ts` — `FieldSchema` union:
  `text | textarea | url | image-url | select | toggleable-link | list`.
- `src/features/sections/schema/Form.tsx` — renders a schema → form.
- `src/features/sections/schema/fields/*.tsx` — one component per field
  type.
- `src/features/sections/<Type>/schema.ts` — for each existing section
  (Header / Hero / Features / CTA / Footer).

Modify:
- `src/features/sections/registry.ts` — add `schema: FieldSchema[]` per
  preset.
- `src/features/builder/EditPanel.tsx` — look up schema by section type,
  render `<Form>` bound to the section's props.

**Steps**

1. Define `FieldSchema`. Example:
   ```ts
   type FieldSchema =
     | { key: string; type: "text"; label: string; placeholder?: string }
     | { key: string; type: "textarea"; label: string; rows?: number }
     | { key: string; type: "select"; label: string; options: { value: string; label: string }[] }
     | { key: string; type: "list"; label: string; itemSchema: FieldSchema[]; min?: number; max?: number }
     | ...
   ```
2. Build `Form.tsx` — iterates over schema, dispatches to field components,
   calls `updateSection(id, mutator)` on change.
3. Build the 7 field components. Each takes `value`, `onChange`, `field`.
4. Write schemas for each preset. Hero example:
   ```ts
   [
     { key: "eyebrow", type: "text", label: "Eyebrow" },
     { key: "title", type: "text", label: "Title" },
     { key: "subtitle", type: "textarea", label: "Subtitle" },
     { key: "imageUrl", type: "image-url", label: "Image" },
     { key: "primaryButton", type: "toggleable-link", label: "Primary button" },
     { key: "layout", type: "select", label: "Layout",
       options: [{ value: "image-right", label: "Image right" }, ...] },
   ]
   ```
5. Update `EditPanel.tsx` to render the form.

**Acceptance**

- [ ] Click a section → form appears with current values.
- [ ] Edit any field → canvas updates immediately.
- [ ] List items (e.g. `Features.items`) support add/remove/reorder.
- [ ] Undo/redo includes form edits.
- [ ] Forms styled per design system (large inputs, rounded, calm).

---

## Phase 6. dnd-kit reorder

**Goal:** Drag sections in the canvas to reorder.

**Effort:** ~2 h.

**Files**

Create:
- `src/features/builder/canvas/SortableSection.tsx` — wraps a section with
  drag handle + sortable behavior.

Modify:
- `src/features/builder/Canvas.tsx` — wrap section list in `<DndContext>` +
  `<SortableContext>` with `verticalListSortingStrategy`.

**Steps**

1. Wrap each section in `<SortableSection>`.
2. On drag end, call `reorderSections(fromIndex, toIndex)`.
3. Show coral drop-indicator line between items during drag.
4. Drag handle visible on hover (top-left corner of section).

**Acceptance**

- [ ] Sections reorder by drag.
- [ ] Drop indicator visible.
- [ ] Undo restores previous order.

---

## Phase 7. Selection + hover toolbar

**Goal:** Click section → selected. Hover shows delete/duplicate/up/down
icons.

**Effort:** ~2 h.

**Files**

Create:
- `src/features/builder/canvas/SectionFrame.tsx` — wraps a section, owns
  selection ring + hover toolbar.

Modify:
- `src/features/builder/Canvas.tsx` — use `<SectionFrame>` around each
  section render.

**Steps**

1. Add 2px coral outline when selected.
2. Hover toolbar in top-right: small white pill with icon buttons.
3. Click outside section → `setSelection({ kind: "none" })`.
4. Click handler uses `stopPropagation` to avoid global deselect.

**Acceptance**

- [ ] Click section → outlined, EditPanel shows its form.
- [ ] Hover toolbar appears.
- [ ] Up/down arrows reorder; trash deletes; copy duplicates.

---

## Phase 8. Section library expansion

**Goal:** Add Gallery, Testimonials, FAQ, Contact sections.

**Effort:** ~4 h (1 h × 4).

**Files (× 4 sections)**

Create per section:
- `src/features/sections/<Name>/Render.tsx`
- `src/features/sections/<Name>/Thumbnail.tsx`
- `src/features/sections/<Name>/defaults.ts`
- `src/features/sections/<Name>/schema.ts`

Modify:
- `src/features/builder/state/types.ts` — add 4 variants to `Section` union.
- `src/features/sections/registry.ts` — register 4 presets.
- `src/features/sections/SectionRenderer.tsx` — add 4 cases.

**Section specs**

- **Gallery** — image grid (2/3/4 cols). Props: `items: { url, alt }[]`,
  `columns`, `title?`, `subtitle?`.
- **Testimonials** — bordered cards with 5-star + quote + author. Props:
  `items: { name, role, quote, rating }[]`, `title`, `columns`.
- **FAQ** — accordion. Props: `items: { question, answer }[]`, `title`.
- **Contact** — form (name / email / message) + business info. Props:
  `title`, `email`, `phone`, `address`, `mapUrl?`.

**Acceptance**

- [ ] All 4 sections appear in sidebar with thumbnails.
- [ ] Each renders defaults that look on-brand.
- [ ] Each editable via the new EditPanel form.

---

## Phase 9. Confirm dialog + toast polish

**Goal:** Replace `window.confirm` with a real dialog. Tighten toast copy.

**Effort:** ~1.5 h.

**Files**

Create:
- `src/shared/ui/ConfirmDialog.tsx` — controlled modal.
- `src/shared/ui/useConfirm.ts` — imperative hook returning
  `Promise<boolean>`.

Modify:
- `src/features/builder/Toolbar.tsx` — `handleClear` uses `useConfirm`.

**Steps**

1. Build modal with backdrop, focus trap, Esc handler.
2. Style per design system: `rounded-2xl`, coral primary, ghost secondary.
3. `useConfirm()` returns `confirm({ title, description, confirmLabel })`.
4. Replace `window.confirm` call sites.

**Acceptance**

- [ ] Clearing page shows dialog.
- [ ] Esc and backdrop click dismiss.
- [ ] Focus restored to trigger on close.

---

## Phase 10. Save / Open / Export

**Goal:** Explicit Save (toast confirm), Open (project picker), JSON
Export/Import.

**Effort:** ~3 h.

**Files**

Create:
- `src/features/projects/ProjectPicker.tsx` — modal listing all projects.
- `src/features/projects/io.ts` — export/import helpers (download blob,
  parse + Zod-validate uploaded file).

Modify:
- `src/features/builder/Toolbar.tsx` — wire Save / Open / Export / Import
  dropdown.

**Steps**

1. Save: write-through + toast "Saved" (auto-save already does the writing).
2. Open: button → ProjectPicker modal → row click → navigate to
   `/builder/[id]`.
3. Export: button → trigger download of `project-<name>.json`.
4. Import: file input → parse → Zod-validate → create new project →
   navigate to it.

**Acceptance**

- [ ] Save toast appears.
- [ ] Open shows all projects with name + last-edited.
- [ ] Export downloads valid JSON.
- [ ] Import creates a new project and opens it.

---

# Milestone M3 — Templates + business workflows

Goal of M3: product feels complete — landing, templates, dashboard, real
workflow pages.

## Phase 11. Landing page `/`

**Goal:** Real landing modeled on the Rekaz.io reference.

**Effort:** ~5 h.

**Files**

Create:
- `src/features/landing/Hero.tsx`
- `src/features/landing/Features.tsx`
- `src/features/landing/StarterShowcase.tsx`
- `src/features/landing/WorkflowExamples.tsx`
- `src/features/landing/Testimonials.tsx`
- `src/features/landing/FinalCTA.tsx`
- `src/features/landing/Footer.tsx`

Modify:
- `src/app/page.tsx` — assemble.

**Steps**

1. Hero: peach bg, coral headline, muted subtitle, coral CTA → `/templates`.
2. Features: white bg, 6 icon tiles with brief copy.
3. StarterShowcase: mint bg, 3 cards (Barber / Coffee / Photography).
4. WorkflowExamples: lavender bg, 2-3 wide cards with screenshot mockups.
5. Testimonials: white bg, 6 bordered cards.
6. FinalCTA: dark `#0F0F10`, white text, coral CTA.
7. Footer: dark, multi-column links.

**Acceptance**

- [ ] Landing loads at `/`.
- [ ] CTAs link to `/templates`.
- [ ] Aesthetics align with Rekaz.io reference.

---

## Phase 12. Templates page `/templates`

**Goal:** Scratch + 3 starter cards. Selecting one creates a project and
opens the builder.

**Effort:** ~2 h.

**Files**

Create:
- `src/features/templates/StarterCard.tsx`
- `src/features/templates/starters/barber.ts` — section[] array.
- `src/features/templates/starters/coffee.ts`
- `src/features/templates/starters/photography.ts`
- `src/features/templates/starters/index.ts` — registry.
- `src/app/templates/page.tsx`

Modify:
- `src/features/projects/store.ts` — `createProject({ template? })`.

**Steps**

1. Define each starter as an array of `Section` objects (use the
   section-creator helpers from `defaults.ts`).
2. Each card shows preview thumbnail + included sections list + included
   workflow.
3. Click → `createProject({ template: 'barber', name: 'مشروع جديد' })` →
   router push to `/builder/[new-id]`.

**Acceptance**

- [ ] 4 cards visible.
- [ ] Each creates the right starter content.
- [ ] Builder opens immediately after selection.

---

## Phase 13. Workflow sections

**Goal:** Booking, Menu, Portfolio — real interactive sections that store
data locally per project.

**Effort:** ~5 h.

**Files**

Create per section (Booking / Menu / Portfolio):
- `src/features/sections/<Name>/{Render,Thumbnail,defaults,schema}.tsx/.ts`

Create:
- `src/features/workflows/booking/store.ts` — bookings keyed by project ID.
- `src/features/workflows/menu/store.ts` — menu state per project (if
  separate from section props).
- `src/features/workflows/portfolio/store.ts` — gallery per project.

Modify:
- `src/features/sections/types.ts` — add 3 variants.
- `src/features/sections/registry.ts` — register 3 presets.
- `src/features/sections/SectionRenderer.tsx` — add 3 cases.

**Section specs**

- **Booking** — form with date/time picker, barber select. Submit →
  workflows/booking store. Builder mode: shows the form. Preview mode:
  works for real.
- **Menu** — list of items rendered as menu cards. Items live in section
  props (editable via EditPanel forms). Coffee workflow page mirrors and
  edits these.
- **Portfolio** — image grid. Images live in section props.

**Decision:** menu + portfolio data live on the section itself (in section
props), edited from both EditPanel and the dashboard workflow page.
Booking submissions live separately in workflows store (they're inputs from
visitors, not part of the design).

**Acceptance**

- [ ] All 3 sections render.
- [ ] Booking submissions persist to local store.
- [ ] Menu edits in EditPanel reflect in the dashboard workflow page.

---

## Phase 14. Preview route `/preview/[id]`

**Goal:** Render the design clean, no builder UI.

**Effort:** ~1.5 h.

**Files**

Create:
- `src/app/preview/[id]/page.tsx`
- `src/features/preview/PreviewRoot.tsx` — client, loads project + renders
  `SectionRenderer` for each section.

**Steps**

1. Server page passes `id` to client root.
2. Client root reads project from localStorage, renders sections.
3. No toolbar, no edit panel, no selection rings. Pure render.
4. Tiny floating "Back to builder" button in the corner (dev hint).

**Acceptance**

- [ ] Preview shows fullscreen design.
- [ ] No builder controls visible.
- [ ] Booking form submits real data.

---

## Phase 15. Dashboard shell `/dashboard/[id]`

**Goal:** Dashboard layout (sidebar + content area) + 5 sub-routes.

**Effort:** ~3 h.

**Files**

Create:
- `src/features/dashboard/DashboardShell.tsx`
- `src/features/dashboard/Sidebar.tsx`
- `src/app/dashboard/[id]/layout.tsx` — wraps with shell.
- `src/app/dashboard/[id]/page.tsx` — Overview (default).
- `src/app/dashboard/[id]/website/page.tsx`
- `src/app/dashboard/[id]/workflow/page.tsx`
- `src/app/dashboard/[id]/customers/page.tsx`
- `src/app/dashboard/[id]/settings/page.tsx`

**Steps**

1. Sidebar with 5 nav items, highlights active by `usePathname`.
2. Content area renders the child route.
3. Top bar shows project name + back-to-builder link.

**Acceptance**

- [ ] All 5 sub-routes load.
- [ ] Sidebar nav highlights active route.
- [ ] Project name visible.

---

## Phase 16. Dashboard pages

**Goal:** Implement Overview (mock analytics), Website (actions), Customers
(mock list), Settings (rename / delete project).

**Effort:** ~4 h.

**Files**

Create:
- `src/features/dashboard/Overview.tsx`
- `src/features/dashboard/Website.tsx`
- `src/features/dashboard/Customers.tsx`
- `src/features/dashboard/Settings.tsx`
- `src/features/dashboard/mock-data.ts` — mock analytics + customers.

**Page specs**

- **Overview:** 4 stat cards (visits, recent activity, recent bookings,
  status) — all from mock-data. Use recharts for a tiny sparkline on one
  card.
- **Website:** 3 large action buttons (Edit / Preview / Publish).
- **Customers:** mock list with name / email / first-visit / status.
- **Settings:** rename input (debounced), delete button (uses
  ConfirmDialog) → routes to `/templates` after delete.

**Acceptance**

- [ ] Pages render with content.
- [ ] Rename updates project name everywhere.
- [ ] Delete removes project + redirects.

---

## Phase 17. Workflow pages

**Goal:** Per-template workflow page — Bookings (barber), Menu editor
(coffee), Portfolio (photography).

**Effort:** ~5 h.

**Files**

Create:
- `src/features/workflows/booking/BookingsPage.tsx`
- `src/features/workflows/menu/MenuEditorPage.tsx`
- `src/features/workflows/portfolio/PortfolioPage.tsx`

Modify:
- `src/app/dashboard/[id]/workflow/page.tsx` — dispatch on
  `project.templateType`.

**Specs**

- **Bookings (barber):** table of bookings (date, name, barber, status),
  filter by date, mark-as-done action.
- **Menu editor (coffee):** CRUD on menu items (name, description, price,
  image). Side-by-side live preview.
- **Portfolio (photography):** grid of images, add by URL, reorder via
  drag, delete.

**Acceptance**

- [ ] Workflow page shows correct UI for each template type.
- [ ] CRUD ops work and persist.
- [ ] Builder section reflects changes from workflow page.

---

# Milestone M4 — Polish + ship

## Phase 18. Animations

**Goal:** Subtle Framer Motion polish. Pages and panels feel smooth.

**Effort:** ~2 h.

**Files**

Modify:
- `src/features/builder/Canvas.tsx` — `AnimatePresence` around section list.
- `src/features/builder/EditPanel.tsx` — slide-in on open.
- Landing sections — fade-in on scroll (use `whileInView`).

**Specs**

- Section add: opacity 0→1 + y +10→0, 250 ms spring.
- EditPanel: slide from edge, 200 ms ease-out.
- Landing: stagger fade-in for cards.
- No bouncing, no spinning.

**Acceptance**

- [ ] Sections animate in.
- [ ] EditPanel feels smooth.
- [ ] No jank on rapid edits.

---

## Phase 19. Empty states + skeletons

**Goal:** Every empty view guides the next action. Skeletons for loads.

**Effort:** ~2 h.

**Files**

Create:
- `src/shared/ui/EmptyState.tsx` — icon + heading + body + CTA.
- `src/shared/ui/Skeleton.tsx` — shimmer block.

Modify:
- Canvas, ProjectPicker, Bookings, Customers, Menu, Portfolio — wrap empty
  lists in `<EmptyState>`.

**Acceptance**

- [ ] No raw empty pages.
- [ ] Skeletons during loads.

---

## Phase 20. AR/RTL pass

**Goal:** Arabic mode mirrors layout properly. Typography reads cleanly.

**Effort:** ~3 h.

**Files**

Modify:
- `src/app/layout.tsx` — conditional `dir` from language state? Or pin to
  `rtl` (Arabic-first) — decide.
- Every component using `ml-*` / `mr-*` / `pl-*` / `pr-*` — switch to
  logical `ms-*` / `me-*` / `ps-*` / `pe-*`.
- Icons that imply direction (chevrons, arrows) — flip via
  `[dir='rtl']:rotate-180`.

**Decision needed:** Is AR the only mode, or do we ship a real toggle?
Plan currently has a language toggle. If both, layout needs to respond.

**Acceptance**

- [ ] AR mode mirrors layout.
- [ ] Directional icons flip.
- [ ] Arabic font weights load.

---

## Phase 21. Mobile pass

**Goal:** All screens usable on mobile. Touch targets ≥44 px. No horizontal
scroll.

**Effort:** ~3 h.

**Files**

Modify:
- All screens — audit on mobile viewport.
- `src/features/dashboard/Sidebar.tsx` — collapse to drawer on mobile.
- Builder: already has mobile tabs; verify each tab works.

**Steps**

1. Walk every route on 375 px viewport.
2. Note issues, fix.
3. Verify tap targets in DevTools.

**Acceptance**

- [ ] No horizontal scroll on 375 px.
- [ ] All buttons ≥ 44 × 44 px.
- [ ] Forms reasonable on small screens.

---

## Phase 22. Deploy

**Goal:** Live at `https://builder.naifhub.com`.

**Effort:** ~2 h.

**Files**

Modify:
- `Dockerfile` — verify production build, multi-stage if not already.
- `docker-compose.yml` — port + restart policy.
- `README.md` — live demo link, screenshots, setup.

External (in `naifhub` deploy repo, see [[workflow-vps-deploy]] memory):
- Caddyfile — add `builder.naifhub.com` block.
- DNS — A record for `builder` subdomain → VPS IP.

**Acceptance**

- [ ] `https://builder.naifhub.com` responds.
- [ ] No console errors in prod.
- [ ] README has live demo link + screenshots.

---

# Effort summary

| Milestone | Phases | Estimated effort |
| --- | --- | --- |
| M1 Foundation | 1–4 | ~8 h |
| M2 Core builder | 5–10 | ~17 h |
| M3 Templates + workflows | 11–17 | ~26 h |
| M4 Polish + ship | 18–22 | ~12 h |
| **Total** | **22** | **~63 h** |

Roughly aligns with the "~60 h over 1 week" target.

---

# Open questions to answer as we go

- **AR-only vs language toggle:** Plan has a language toggle but landing
  copy will be Arabic-only initially. Decide before Phase 11.
- **Auth:** Plan says no real auth. Should the dashboard have any "I'm
  Naif" mock-auth screen, or is it always accessible? Default: always
  accessible.
- **Multi-device sync:** localStorage only → no cross-device. Note in
  README that this is a demo limitation.
- **Image hosting:** image URLs only (no upload). Pin in README.
