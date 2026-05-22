import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";

// Fresh localStorage per test so store hydration doesn't bleed across files.
beforeEach(() => {
  window.localStorage.clear();
});

// Reset zustand stores between tests. We dynamically import to avoid
// pulling in browser-only modules at config evaluation time.
afterEach(async () => {
  const { useProjects } = await import("@/features/projects/store");
  const { useBookings } = await import("@/features/workflows/booking/store");
  const { useBuilderStore } = await import("@/features/builder/state/store");

  useProjects.setState({ projects: {}, hydrated: false });
  useBookings.setState({ byProject: {}, hydrated: false });
  useBuilderStore.setState({
    projectId: null,
    design: { version: 1, sections: [] },
    past: [],
    future: [],
    selection: { kind: "none" },
    deviceMode: "desktop",
    language: "ar",
    mobileTab: "canvas",
  });
});
