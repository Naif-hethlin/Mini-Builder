"use client";

import { useEffect, useState } from "react";
import { useProjects, type Project } from ".";

/**
 * Ensures the project with `projectId` is present in the local
 * useProjects store. Tries localStorage first (cheap), then falls back
 * to GET /api/projects/[id] for authed users opening the dashboard on a
 * new device. Without this hook, /dashboard/[id] and /preview/[id] would
 * show "المشروع غير موجود" whenever the user hadn't visited the project
 * on this browser before.
 *
 * Returns a coarse status — components can swap a skeleton in while
 * `status === "loading"` and a not-found screen when "missing".
 */
export type EnsureStatus = "loading" | "ready" | "missing";

export function useEnsureProject(projectId: string): EnsureStatus {
  const [status, setStatus] = useState<EnsureStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const store = useProjects.getState();
      store.hydrate();
      if (store.get(projectId)) {
        if (!cancelled) setStatus("ready");
        return;
      }
      // Local cache miss → try the server (works only for signed-in users).
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          credentials: "same-origin",
        });
        if (res.ok) {
          const data = (await res.json()) as
            | { ok: true; project: Project }
            | { ok: false };
          if (data.ok) {
            useProjects.getState().upsert(data.project);
            if (!cancelled) setStatus("ready");
            return;
          }
        }
      } catch {
        // network / 401 — fall through to "missing".
      }
      if (!cancelled) setStatus("missing");
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return status;
}
