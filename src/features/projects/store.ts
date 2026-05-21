import { create } from "zustand";
import { nanoid } from "nanoid";
import type { PageDesign } from "@/features/builder/state/types";
import { loadAll, saveAll } from "./storage";
import type { Project, ProjectMeta, ProjectTemplateType } from "./types";

const EMPTY_DESIGN: PageDesign = { version: 1, sections: [] };

type CreateInput = {
  /** Explicit id — if omitted, a nanoid is generated. Useful when the route
   *  param dictates the id (e.g. landing on /builder/<id> for an unseen id). */
  id?: string;
  name?: string;
  templateType?: ProjectTemplateType;
  design?: PageDesign;
};

export type ProjectsState = {
  projects: Record<string, Project>;
  hydrated: boolean;

  hydrate: () => void;
  list: () => ProjectMeta[];
  get: (id: string) => Project | undefined;
  create: (input?: CreateInput) => Project;
  rename: (id: string, name: string) => void;
  updateDesign: (id: string, design: PageDesign) => void;
  remove: (id: string) => void;
};

export const useProjects = create<ProjectsState>((set, get) => ({
  projects: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ projects: loadAll(), hydrated: true });
  },

  list: () =>
    Object.values(get().projects)
      .map(({ design: _design, ...meta }) => meta)
      .sort((a, b) => b.updatedAt - a.updatedAt),

  get: (id) => get().projects[id],

  create: (input = {}) => {
    const id = input.id ?? nanoid();
    const now = Date.now();
    const project: Project = {
      id,
      name: input.name ?? "مشروع جديد",
      templateType: input.templateType,
      design: input.design ?? EMPTY_DESIGN,
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

  updateDesign: (id, design) => {
    const project = get().projects[id];
    if (!project) return;
    if (project.design === design) return;
    const updated: Project = { ...project, design, updatedAt: Date.now() };
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
}));

export const selectProjectsList = (s: ProjectsState) => s.list();
export const selectProjectById = (id: string) => (s: ProjectsState) =>
  s.projects[id];
