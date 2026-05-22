"use client";

import { Toaster } from "sonner";
import { cn } from "@/shared/lib/cn";
import { ConfirmProvider } from "@/shared/ui/ConfirmProvider";
import { selectMobileTab, useBuilderStore } from "./state/store";
import { useBuilderProject } from "./state/useBuilderProject";
import { useBuilderHotkeys } from "./useBuilderHotkeys";
import { Canvas } from "./Canvas";
import { EditPanel } from "./EditPanel";
import { MobileTabs } from "./MobileTabs";
import { OnboardingTour } from "./OnboardingTour";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";

/**
 * Top-level orchestrator for the entire builder UI.
 *
 * Layout (matching the redesigned mock):
 *   - Outer chrome: slate-50 page with p-3 / gap-3, panels are floating
 *     white cards with rounded-2xl + soft shadow.
 *   - Desktop (≥md): Toolbar at the top, then a flex row of
 *     Sidebar (320px) | Canvas (fluid) | EditPanel (280px).
 *   - Mobile  (<md):  only ONE inner panel is visible, switched via
 *     MobileTabs at the bottom; Toolbar stays.
 */
export function Builder({ projectId }: { projectId: string }) {
  const mobileTab = useBuilderStore(selectMobileTab);
  useBuilderProject(projectId);
  useBuilderHotkeys();

  return (
    <ConfirmProvider>
      <div className="flex h-screen w-screen flex-col gap-2 overflow-hidden bg-slate-50 p-2 text-slate-800 antialiased selection:bg-brand-light selection:text-brand-dark sm:gap-3 sm:p-3">
        <Toolbar />

        <div className="flex flex-1 gap-2 overflow-hidden sm:gap-3">
          {/* SIDEBAR — fixed 320px on md+, full width on mobile when active */}
          <div
            className={cn(
              "h-full w-full shrink-0 md:block md:w-[320px]",
              mobileTab === "library" ? "block" : "hidden",
            )}
          >
            <Sidebar />
          </div>

          {/* CANVAS — fluid */}
          <div
            className={cn(
              "h-full min-w-0 flex-1 md:block",
              mobileTab === "canvas" ? "block" : "hidden",
            )}
          >
            <Canvas />
          </div>

          {/* EDIT PANEL — fixed 280px on md+ */}
          <div
            className={cn(
              "h-full w-full shrink-0 md:block md:w-[280px]",
              mobileTab === "editor" ? "block" : "hidden",
            )}
          >
            <EditPanel />
          </div>
        </div>

        <MobileTabs />

        <OnboardingTour />

        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={3000}
        />
      </div>
    </ConfirmProvider>
  );
}
