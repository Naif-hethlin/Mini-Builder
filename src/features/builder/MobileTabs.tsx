"use client";

import { Eye, Layers, Settings2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { MobileTab } from "./state/types";
import { selectMobileTab, useBuilderStore } from "./state/store";

/**
 * Bottom tab bar shown ONLY on mobile (<md screens).
 *
 * On desktop the user sees all three panels (Sidebar | Canvas | EditPanel)
 * side by side. On mobile there isn't room for that, so we collapse to one
 * panel at a time and let the user switch via these three tabs.
 */
const TABS: Array<{ id: MobileTab; label: string; Icon: typeof Layers }> = [
  { id: "library", label: "Library", Icon: Layers },
  { id: "canvas", label: "Preview", Icon: Eye },
  { id: "editor", label: "Editor", Icon: Settings2 },
];

export function MobileTabs() {
  const mobileTab = useBuilderStore(selectMobileTab);
  const setMobileTab = useBuilderStore((s) => s.setMobileTab);

  return (
    <nav
      role="tablist"
      aria-label="Builder sections"
      className="flex border-t border-stone-200 bg-white md:hidden"
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = mobileTab === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => setMobileTab(id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors",
              isActive
                ? "text-brand"
                : "text-stone-500 hover:text-stone-900",
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
