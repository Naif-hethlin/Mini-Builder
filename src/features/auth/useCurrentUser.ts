"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id: string;
  phone: string;
  name: string;
};

let cached: { user: CurrentUser | null } | null = null;
const listeners = new Set<() => void>();

async function fetchMe(): Promise<CurrentUser | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: CurrentUser | null };
    return data.user;
  } catch {
    return null;
  }
}

/** Refetches /api/auth/me and notifies subscribers. */
export async function refreshCurrentUser(): Promise<void> {
  const user = await fetchMe();
  cached = { user };
  for (const fn of listeners) fn();
}

export function useCurrentUser(): {
  user: CurrentUser | null;
  loading: boolean;
} {
  const [, setTick] = useState(0);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    listeners.add(update);
    if (cached === null) {
      fetchMe().then((user) => {
        cached = { user };
        setLoading(false);
        update();
      });
    } else {
      setLoading(false);
    }
    return () => {
      listeners.delete(update);
    };
  }, []);

  return { user: cached?.user ?? null, loading };
}
