"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useProjects, type Project } from "@/features/projects";
import { useBuilderStore } from "./store";

const AUTOSAVE_DEBOUNCE_MS = 500;

/**
 * Wires the builder to a project + page.
 *
 *  1. Tries to fetch the project from /api/projects/[id] (logged-in users
 *     get cross-device data). Falls back to localStorage if the request
 *     fails (offline) or returns 401 (anonymous user).
 *  2. Picks the page matching ?page=<slug>, falling back to home.
 *  3. Loads it into the builder store.
 *  4. Subscribes to design changes and saves them back (debounced) — both
 *     to the local store (instant UX) AND to the server via PATCH, when
 *     logged in.
 */
export function useBuilderProject(projectId: string) {
  const searchParams = useSearchParams();
  const wantedSlug = searchParams.get("page");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let unsubscribe: (() => void) | null = null;
    // Is this user authenticated? Determined by whether the server returned
    // 200 OR 401 — we never call /api/auth/me here to keep the path simple.
    let authed = false;

    const finish = (project: Project) => {
      if (cancelled) return;

      const projects = useProjects.getState();
      const home =
        projects.getHomePage(project.id) ?? project.pages[0];
      const wanted =
        (wantedSlug
          ? project.pages.find((p) => p.slug === wantedSlug)
          : undefined) ?? home;
      if (!wanted) return;

      useBuilderStore
        .getState()
        .loadPage(project.id, wanted.id, wanted.design);

      unsubscribe = useBuilderStore.subscribe((state, prev) => {
        if (state.design === prev.design) return;
        const pid = state.projectId;
        const pgid = state.pageId;
        if (!pid || !pgid) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          // Local first — keeps undo + UI snappy and survives offline.
          useProjects.getState().updatePageDesign(pid, pgid, state.design);
          // Then mirror to server when authed.
          if (authed) {
            fetch(`/api/projects/${pid}/pages/${pgid}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              body: JSON.stringify({ design: state.design }),
            }).catch(() => {
              // Server unreachable — local write already covers it.
            });
          }
        }, AUTOSAVE_DEBOUNCE_MS);
      });
    };

    const run = async () => {
      useProjects.getState().hydrate();

      // Try server first.
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          credentials: "same-origin",
        });
        if (res.status === 401) {
          authed = false;
        } else if (res.ok) {
          authed = true;
          const data = (await res.json()) as { ok: boolean; project: Project };
          if (data.ok) {
            // Merge into the local cache too, so picker + dashboard see it.
            useProjects.setState({
              projects: {
                ...useProjects.getState().projects,
                [data.project.id]: data.project,
              },
            });
            finish(data.project);
            return;
          }
        }
      } catch {
        // Network error → fall through to local.
      }

      // Local fallback (anonymous user OR offline).
      const local =
        useProjects.getState().get(projectId) ??
        useProjects.getState().create({ id: projectId, name: "مشروع جديد" });
      finish(local);
    };

    void run();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribe?.();
    };
  }, [projectId, wantedSlug]);
}
