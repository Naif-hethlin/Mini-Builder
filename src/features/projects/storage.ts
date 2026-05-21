import type { Project } from "./types";

const STORAGE_KEY = "rekaz-builder/projects/v1";

export function loadAll(): Record<string, Project> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, Project>;
    }
    return {};
  } catch {
    return {};
  }
}

export function saveAll(projects: Record<string, Project>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // quota exceeded / disabled — swallow silently; UI surfaces this in a later phase
  }
}
