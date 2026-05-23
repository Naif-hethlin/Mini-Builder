"use client";

import { useEffect } from "react";

/**
 * Drop-in client component that fires a single POST to /api/visits when
 * mounted. Used on /preview/[id] and /sites/[slug] so the owner's
 * dashboard can show real visit counts.
 *
 * Deliberately silent — no error toasts, no retries. If the beacon
 * fails the live site is unaffected. Uses fetch with keepalive so the
 * request survives a fast navigation away from the page.
 */
export function VisitBeacon({
  projectId,
  path,
}: {
  projectId: string;
  path: string;
}) {
  useEffect(() => {
    if (!projectId) return;
    try {
      fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, path }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  }, [projectId, path]);

  return null;
}
