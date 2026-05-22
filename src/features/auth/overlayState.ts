"use client";

import { create } from "zustand";

const SKIP_KEY = "rekaz-builder/auth/skipped";

/**
 * Tiny store so any button anywhere can re-open the AuthOverlay after the
 * user dismissed it with "تصفح بدون تسجيل" (which sets a sessionStorage
 * flag we'd otherwise have no way to clear from the UI).
 */
export const useAuthOverlay = create<{
  forceOpen: boolean;
  open: () => void;
  close: () => void;
}>((set) => ({
  forceOpen: false,
  open: () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SKIP_KEY);
    }
    set({ forceOpen: true });
  },
  close: () => set({ forceOpen: false }),
}));

export { SKIP_KEY };
