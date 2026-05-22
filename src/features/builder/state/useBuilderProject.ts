"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useProjects } from "@/features/projects";
import { useBuilderStore } from "./store";

const AUTOSAVE_DEBOUNCE_MS = 500;

/**
 * Wires the builder to a project + page.
 *
 *  1. Hydrates the projects store from localStorage.
 *  2. Resolves the project by id (creates one with that id if missing).
 *  3. Picks the page matching ?page=<slug>, falling back to the home page.
 *  4. Loads it into the builder store.
 *  5. Subscribes to design changes and saves them back (debounced) to
 *     the right page on the right project.
 */
export function useBuilderProject(projectId: string) {
  const searchParams = useSearchParams();
  const wantedSlug = searchParams.get("page");

  useEffect(() => {
    const projects = useProjects.getState();
    projects.hydrate();

    const existing = projects.get(projectId);
    const project =
      existing ?? projects.create({ id: projectId, name: "مشروع جديد" });

    const page =
      (wantedSlug ? projects.getPage(projectId, wantedSlug) : undefined) ??
      projects.getHomePage(projectId) ??
      project.pages[0];

    if (!page) return; // shouldn't happen — create() always seeds a home page

    useBuilderStore
      .getState()
      .loadPage(project.id, page.id, page.design);

    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = useBuilderStore.subscribe((state, prev) => {
      if (state.design === prev.design) return;
      const pid = state.projectId;
      const pgid = state.pageId;
      if (!pid || !pgid) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        useProjects.getState().updatePageDesign(pid, pgid, state.design);
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [projectId, wantedSlug]);
}
