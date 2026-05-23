import { create } from "zustand";
import { nanoid } from "nanoid";
import { newId } from "@/shared/lib/id";
import type { PageDesign } from "@/features/builder/state/types";
import { starterDesignFor } from "@/features/sections/starters";
import { loadAll, saveAll } from "./storage";
import type { Page, Project, ProjectMeta, ProjectTemplateType } from "./types";

const EMPTY_DESIGN: PageDesign = { version: 1, sections: [] };

type CreateInput = {
  /** Explicit id — if omitted, a nanoid is generated. Useful when the route
   *  param dictates the id (e.g. landing on /builder/<id> for an unseen id). */
  id?: string;
  name?: string;
  templateType?: ProjectTemplateType;
  /** Optional design for the home page. Pre-v2 callers passed a flat
   *  `design`; we keep accepting it and wrap into the home page. */
  design?: PageDesign;
};

function makeHomePage(design: PageDesign = EMPTY_DESIGN): Page {
  return {
    id: newId(),
    slug: "home",
    name: "الصفحة الرئيسية",
    order: 0,
    isHome: true,
    design,
  };
}

/**
 * Migrates a v1 project (single `design`) to v2 (`pages[]`).
 * v1: { id, name, design, ... }
 * v2: { id, name, pages: [{ slug:"home", design, ... }], ... }
 * Tolerates both on read, always emits v2 on write.
 */
function safeTime(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : Date.now();
}

function safeDesign(value: unknown): PageDesign {
  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as PageDesign).sections)
  ) {
    return value as PageDesign;
  }
  return EMPTY_DESIGN;
}

function normalizePages(rawPages: unknown, legacyDesign: PageDesign): Page[] {
  if (!Array.isArray(rawPages)) return [makeHomePage(legacyDesign)];

  const pages = rawPages
    .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
    .map((p, i) => ({
      id: typeof p.id === "string" ? p.id : newId(),
      slug:
        typeof p.slug === "string" && p.slug.trim() ? p.slug : `page-${i + 1}`,
      name: typeof p.name === "string" && p.name.trim() ? p.name : "صفحة",
      order: typeof p.order === "number" ? p.order : i,
      isHome: p.isHome === true,
      design: safeDesign(p.design),
    }))
    .sort((a, b) => a.order - b.order)
    .map((p, i) => ({ ...p, order: i }));

  if (pages.length === 0) return [makeHomePage(legacyDesign)];

  if (!pages.some((p) => p.isHome)) {
    pages[0] = { ...pages[0], isHome: true, slug: pages[0].slug || "home" };
  } else {
    let sawHome = false;
    for (let i = 0; i < pages.length; i += 1) {
      if (!pages[i].isHome) continue;
      if (!sawHome) {
        sawHome = true;
      } else {
        pages[i] = { ...pages[i], isHome: false };
      }
    }
  }

  return pages;
}

export function normalizeProject(raw: Record<string, unknown>): Project {
  const legacyDesign = safeDesign(raw.design);
  return {
    id: typeof raw.id === "string" ? raw.id : nanoid(),
    name: (raw.name as string) ?? "مشروع",
    templateType: raw.templateType as ProjectTemplateType | undefined,
    pages: normalizePages(raw.pages, legacyDesign),
    slug: typeof raw.slug === "string" ? raw.slug : null,
    published: raw.published === true,
    publishedAt: raw.publishedAt == null ? null : safeTime(raw.publishedAt),
    createdAt: safeTime(raw.createdAt),
    updatedAt: safeTime(raw.updatedAt),
  };
}

function slugify(name: string, taken: Set<string>): string {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9؀-ۿ]+/g, "-")
      .replace(/^-+|-+$/g, "") || "page";
  let candidate = base;
  let i = 2;
  while (taken.has(candidate)) candidate = `${base}-${i++}`;
  return candidate;
}

export type ProjectsState = {
  projects: Record<string, Project>;
  hydrated: boolean;

  hydrate: () => void;
  list: () => ProjectMeta[];
  get: (id: string) => Project | undefined;
  upsert: (project: Project | Record<string, unknown>) => Project;

  // project lifecycle
  create: (input?: CreateInput) => Project;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;

  // page-level
  getPage: (projectId: string, slug: string) => Page | undefined;
  getHomePage: (projectId: string) => Page | undefined;
  addPage: (projectId: string, input?: { name?: string }) => Page | undefined;
  renamePage: (projectId: string, pageId: string, name: string) => void;
  setPageSlug: (
    projectId: string,
    pageId: string,
    slug: string,
  ) => { ok: true } | { ok: false; error: string };
  setHomePage: (projectId: string, pageId: string) => void;
  removePage: (projectId: string, pageId: string) => void;

  /** Replaces a page's design (used by the builder auto-save). */
  updatePageDesign: (
    projectId: string,
    pageId: string,
    design: PageDesign,
  ) => void;
};

export const useProjects = create<ProjectsState>((set, get) => ({
  projects: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const raw = loadAll();
    const projects: Record<string, Project> = {};
    for (const [id, p] of Object.entries(raw)) {
      projects[id] = normalizeProject(p as unknown as Record<string, unknown>);
    }
    set({ projects, hydrated: true });
  },

  list: () =>
    Object.values(get().projects)
      .map(({ pages: _pages, ...meta }) => meta)
      .sort((a, b) => b.updatedAt - a.updatedAt),

  get: (id) => get().projects[id],

  upsert: (project) => {
    const normalized = normalizeProject(project as Record<string, unknown>);
    const projects = { ...get().projects, [normalized.id]: normalized };
    set({ projects });
    saveAll(projects);
    return normalized;
  },

  create: (input = {}) => {
    const id = input.id ?? nanoid();
    const now = Date.now();
    // If a templateType was given (and no explicit design override), seed
    // the home page with the matching starter content so the user sees a
    // real-looking site instead of an empty canvas.
    const homeDesign =
      input.design ??
      (input.templateType ? starterDesignFor(input.templateType) : undefined);
    const project: Project = {
      id,
      name: input.name ?? "مشروع جديد",
      templateType: input.templateType,
      pages: [makeHomePage(homeDesign)],
      createdAt: now,
      updatedAt: now,
    };
    const projects = { ...get().projects, [id]: project };
    set({ projects });
    saveAll(projects);
    return project;
  },

  rename: (id, name) => {
    const project = get().projects[id];
    if (!project) return;
    const updated: Project = { ...project, name, updatedAt: Date.now() };
    const projects = { ...get().projects, [id]: updated };
    set({ projects });
    saveAll(projects);
  },

  remove: (id) => {
    const projects = { ...get().projects };
    delete projects[id];
    set({ projects });
    saveAll(projects);
  },

  // ----- page-level -----

  getPage: (projectId, slug) =>
    get().projects[projectId]?.pages.find((p) => p.slug === slug),

  getHomePage: (projectId) => {
    const project = get().projects[projectId];
    if (!project) return undefined;
    return (
      project.pages.find((p) => p.isHome) ??
      [...project.pages].sort((a, b) => a.order - b.order)[0]
    );
  },

  addPage: (projectId, input = {}) => {
    const project = get().projects[projectId];
    if (!project) return undefined;
    const taken = new Set(project.pages.map((p) => p.slug));
    const name = input.name ?? "صفحة جديدة";
    const page: Page = {
      id: newId(),
      slug: slugify(name, taken),
      name,
      order: project.pages.length,
      isHome: false,
      design: EMPTY_DESIGN,
    };
    const updated: Project = {
      ...project,
      pages: [...project.pages, page],
      updatedAt: Date.now(),
    };
    const projects = { ...get().projects, [projectId]: updated };
    set({ projects });
    saveAll(projects);
    return page;
  },

  renamePage: (projectId, pageId, name) => {
    const project = get().projects[projectId];
    if (!project) return;
    const updated: Project = {
      ...project,
      pages: project.pages.map((p) => (p.id === pageId ? { ...p, name } : p)),
      updatedAt: Date.now(),
    };
    const projects = { ...get().projects, [projectId]: updated };
    set({ projects });
    saveAll(projects);
  },

  setPageSlug: (projectId, pageId, slug) => {
    const project = get().projects[projectId];
    if (!project) return { ok: false, error: "المشروع غير موجود" };
    const normalized = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9؀-ۿ-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!normalized) return { ok: false, error: "الـ slug فارغ" };
    const collision = project.pages.some(
      (p) => p.id !== pageId && p.slug === normalized,
    );
    if (collision) return { ok: false, error: "هذا الـ slug مستخدم" };
    const updated: Project = {
      ...project,
      pages: project.pages.map((p) =>
        p.id === pageId ? { ...p, slug: normalized } : p,
      ),
      updatedAt: Date.now(),
    };
    const projects = { ...get().projects, [projectId]: updated };
    set({ projects });
    saveAll(projects);
    return { ok: true };
  },

  setHomePage: (projectId, pageId) => {
    const project = get().projects[projectId];
    if (!project) return;
    const updated: Project = {
      ...project,
      pages: project.pages.map((p) => ({ ...p, isHome: p.id === pageId })),
      updatedAt: Date.now(),
    };
    const projects = { ...get().projects, [projectId]: updated };
    set({ projects });
    saveAll(projects);
  },

  removePage: (projectId, pageId) => {
    const project = get().projects[projectId];
    if (!project) return;
    if (project.pages.length === 1) return; // never leave a project with 0 pages
    const target = project.pages.find((p) => p.id === pageId);
    if (!target) return;
    const remaining = project.pages
      .filter((p) => p.id !== pageId)
      .map((p, i) => ({ ...p, order: i }));
    // Promote a new home if we just removed the home page.
    if (target.isHome && remaining[0]) remaining[0].isHome = true;
    const updated: Project = {
      ...project,
      pages: remaining,
      updatedAt: Date.now(),
    };
    const projects = { ...get().projects, [projectId]: updated };
    set({ projects });
    saveAll(projects);
  },

  updatePageDesign: (projectId, pageId, design) => {
    const project = get().projects[projectId];
    if (!project) return;
    const target = project.pages.find((p) => p.id === pageId);
    if (!target || target.design === design) return;
    const updated: Project = {
      ...project,
      pages: project.pages.map((p) => (p.id === pageId ? { ...p, design } : p)),
      updatedAt: Date.now(),
    };
    const projects = { ...get().projects, [projectId]: updated };
    set({ projects });
    saveAll(projects);
  },
}));

export const selectProjectsList = (s: ProjectsState) => s.list();
export const selectProjectById = (id: string) => (s: ProjectsState) =>
  s.projects[id];
