import { create } from "zustand";
import { nanoid } from "nanoid";

const STORAGE_KEY = "rekaz-builder/bookings/v1";
const SEEN_KEY = "rekaz-builder/bookings-seen/v1";

export type Booking = {
  id: string;
  projectId: string;
  name: string;
  phone: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  staffName?: string;
  note?: string;
  createdAt: number;
  status: "pending" | "done" | "canceled";
};

type BookingsMap = Record<string, Booking[]>;

export const EMPTY_BOOKINGS: Booking[] = [];

const STATUSES = new Set<Booking["status"]>(["pending", "done", "canceled"]);

function isBooking(value: unknown): value is Booking {
  if (!value || typeof value !== "object") return false;
  const b = value as Booking;
  return (
    typeof b.id === "string" &&
    typeof b.projectId === "string" &&
    typeof b.name === "string" &&
    typeof b.phone === "string" &&
    typeof b.date === "string" &&
    typeof b.time === "string" &&
    typeof b.createdAt === "number" &&
    Number.isFinite(b.createdAt) &&
    STATUSES.has(b.status)
  );
}

function normalizeBookingsMap(value: unknown): BookingsMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const map: BookingsMap = {};
  for (const [projectId, bookings] of Object.entries(value)) {
    if (!Array.isArray(bookings)) continue;
    const valid = bookings.filter(isBooking);
    if (valid.length > 0) map[projectId] = valid;
  }
  return map;
}

function loadAll(): BookingsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return normalizeBookingsMap(JSON.parse(raw));
  } catch {
    return {};
  }
}

function saveAll(map: BookingsMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
}

// Track which timestamp each project's dashboard has acknowledged, so the
// notification bell can show an "unread bookings since X" badge.
type SeenMap = Record<string, number>;

function normalizeSeenMap(value: unknown): SeenMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const seen: SeenMap = {};
  for (const [projectId, timestamp] of Object.entries(value)) {
    if (typeof timestamp === "number" && Number.isFinite(timestamp)) {
      seen[projectId] = timestamp;
    }
  }
  return seen;
}

function loadSeen(): SeenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (!raw) return {};
    return normalizeSeenMap(JSON.parse(raw));
  } catch {
    return {};
  }
}

function saveSeen(seen: SeenMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    // ignore
  }
}

export type BookingsState = {
  byProject: BookingsMap;
  /** Per-project timestamp the dashboard has acknowledged. Bookings whose
   *  `createdAt` is newer than this count as unread. */
  lastSeenByProject: SeenMap;
  hydrated: boolean;
  hydrate: () => void;
  list: (projectId: string) => Booking[];
  add: (booking: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  setStatus: (projectId: string, id: string, status: Booking["status"]) => void;
  remove: (projectId: string, id: string) => void;
  /** Mark every booking up to "now" as read for this project. */
  markSeen: (projectId: string) => void;
};

export const useBookings = create<BookingsState>((set, get) => ({
  byProject: {},
  lastSeenByProject: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({
      byProject: loadAll(),
      lastSeenByProject: loadSeen(),
      hydrated: true,
    });
  },

  list: (projectId) => get().byProject[projectId] ?? EMPTY_BOOKINGS,

  add: (input) => {
    const booking: Booking = {
      ...input,
      id: nanoid(),
      createdAt: Date.now(),
      status: "pending",
    };
    const list = get().byProject[input.projectId] ?? [];
    const byProject = {
      ...get().byProject,
      [input.projectId]: [...list, booking],
    };
    set({ byProject });
    saveAll(byProject);
    return booking;
  },

  setStatus: (projectId, id, status) => {
    const list = get().byProject[projectId] ?? [];
    const next = list.map((b) => (b.id === id ? { ...b, status } : b));
    const byProject = { ...get().byProject, [projectId]: next };
    set({ byProject });
    saveAll(byProject);
  },

  remove: (projectId, id) => {
    const list = get().byProject[projectId] ?? [];
    const next = list.filter((b) => b.id !== id);
    const byProject = { ...get().byProject, [projectId]: next };
    set({ byProject });
    saveAll(byProject);
  },

  markSeen: (projectId) => {
    const lastSeenByProject = {
      ...get().lastSeenByProject,
      [projectId]: Date.now(),
    };
    set({ lastSeenByProject });
    saveSeen(lastSeenByProject);
  },
}));
