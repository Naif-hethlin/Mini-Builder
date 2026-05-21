"use client";

import { Toaster } from "sonner";
import { cn } from "@/shared/lib/cn";
import { selectMobileTab, useBuilderStore } from "../_back/store";
import { Canvas } from "./Canvas";
import { EditPanel } from "./EditPanel";
import { MobileTabs } from "./MobileTabs";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";

/**
 * Top-level orchestrator for the entire builder UI.
 *
 * Layout:
 *   - Always: Toolbar at the top.
 *   - Desktop (≥md): all three panels (Sidebar | Canvas | EditPanel) visible.
 *   - Mobile  (<md): only ONE panel visible, switched via MobileTabs bottom bar.
 *
 * The `mobileTab` value from the store drives which panel is visible on mobile.
 * On md+, the `md:block` utility overrides the `hidden` and shows all three.
 */
export function Builder() {
  const mobileTab = useBuilderStore(selectMobileTab);

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR — fixed width on md+, full width on mobile when active */}
        <div
          className={cn(
            "h-full w-full flex-shrink-0 md:block md:w-72 lg:w-80",
            mobileTab === "library" ? "block" : "hidden",
          )}
        >
          <Sidebar />
        </div>

        {/* CANVAS — takes all remaining space on md+, full width on mobile when active */}
        <div
          className={cn(
            "h-full flex-1 md:block",
            mobileTab === "canvas" ? "block" : "hidden",
          )}
        >
          <Canvas />
        </div>

        {/* EDIT PANEL — fixed width on md+, full width on mobile when active */}
        <div
          className={cn(
            "h-full w-full flex-shrink-0 md:block md:w-80 lg:w-96",
            mobileTab === "editor" ? "block" : "hidden",
          )}
        >
          <EditPanel />
        </div>
      </div>

      <MobileTabs />

      {/* Toaster is the global toast renderer — `toast(...)` from anywhere shows here. */}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={3000}
      />
    </div>
  );
}
