"use client";

import { useEffect } from "react";
import { useProjects } from "@/features/projects";
import { useBuilderStore } from "./store";

const AUTOSAVE_DEBOUNCE_MS = 500;

/**
 * Wires the builder to a project in localStorage.
 *
 *  1. Hydrates the projects store from localStorage.
 *  2. Resolves the project by id (creates one with that id if missing).
 *  3. Loads it into the builder store.
 *  4. Subscribes to design changes and saves them back (debounced).
 */
export function useBuilderProject(projectId: string) {
  useEffect(() => {
    const projects = useProjects.getState();
    projects.hydrate();

    const existing = projects.get(projectId);
    const project =
      existing ?? projects.create({ id: projectId, name: "مشروع جديد" });

    useBuilderStore.getState().loadProject(project.id, project.design);

    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = useBuilderStore.subscribe((state, prev) => {
      if (state.design === prev.design) return;
      const id = state.projectId;
      if (!id) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        useProjects.getState().updateDesign(id, state.design);
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [projectId]);
}
