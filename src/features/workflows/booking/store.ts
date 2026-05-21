import { create } from "zustand";
import { nanoid } from "nanoid";

const STORAGE_KEY = "rekaz-builder/bookings/v1";

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

function loadAll(): BookingsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as BookingsMap;
    }
    return {};
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

export type BookingsState = {
  byProject: BookingsMap;
  hydrated: boolean;
  hydrate: () => void;
  list: (projectId: string) => Booking[];
  add: (
    booking: Omit<Booking, "id" | "createdAt" | "status">,
  ) => Booking;
  setStatus: (
    projectId: string,
    id: string,
    status: Booking["status"],
  ) => void;
  remove: (projectId: string, id: string) => void;
};

export const useBookings = create<BookingsState>((set, get) => ({
  byProject: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ byProject: loadAll(), hydrated: true });
  },

  list: (projectId) => get().byProject[projectId] ?? [],

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
}));
