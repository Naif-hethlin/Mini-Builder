"use client";

import { useEffect } from "react";
import { useProjects } from "@/features/projects";
import { useBuilderStore } from "./store";

const AUTOSAVE_DEBOUNCE_MS = 500;

/**
 * Wires the builder to a project in localStorage.
 *
 *  1. Hydrates the projects store from localStorage.
 *  2. Picks the first project (or creates one if none exist).
 *  3. Loads it into the builder store.
 *  4. Subscribes to design changes and saves them back (debounced).
 *
 * Phase 3 will replace step 2 with a route-param lookup.
 */
export function useBuilderProject() {
  useEffect(() => {
    const projects = useProjects.getState();
    projects.hydrate();

    const existing = projects.list()[0];
    const project =
      projects.get(existing?.id ?? "") ??
      projects.create({ name: "مشروع تجريبي" });

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
  }, []);
}
