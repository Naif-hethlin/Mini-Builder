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
 *
 * Labels are Arabic to match the rest of the app — "Library / Preview /
 * Editor" was a leftover from the English prototype.
 */
const TABS: Array<{ id: MobileTab; label: string; Icon: typeof Layers }> = [
  { id: "library", label: "المكتبة", Icon: Layers },
  { id: "canvas", label: "المعاينة", Icon: Eye },
  { id: "editor", label: "الخصائص", Icon: Settings2 },
];

export function MobileTabs() {
  const mobileTab = useBuilderStore(selectMobileTab);
  const setMobileTab = useBuilderStore((s) => s.setMobileTab);

  return (
    <nav
      role="tablist"
      aria-label="أقسام البناء"
      // min-h enforces a ~56px touch target per tab (Apple HIG: ≥44px).
      // The pill backdrop on the active tab gives a clear "you are here"
      // signal — purely-color states like the old version disappear under
      // bright sunlight on a phone.
      className="flex min-h-14 shrink-0 items-center gap-1 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_2px_20px_rgb(0,0,0,0.04)] md:hidden"
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
              "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 transition-all",
              isActive
                ? "bg-brand-light text-brand shadow-sm"
                : "text-slate-500 active:bg-slate-50",
            )}
          >
            <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
            <span
              className={cn(
                "text-[11px]",
                isActive ? "font-bold" : "font-semibold",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
