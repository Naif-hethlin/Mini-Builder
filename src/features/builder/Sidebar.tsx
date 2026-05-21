"use client";

import { toast } from "sonner";
import { cn } from "@/shared/lib/cn";
import {
  SECTION_PRESETS,
  type SectionPresetMeta,
} from "@/features/sections/registry";
import type { SidebarTab } from "./state/types";
import { selectSidebarTab, useBuilderStore } from "./state/store";

// The three tabs at the top of the left sidebar.
// `description` is a hint shown next to the tile grid for non-tech users.
const TABS: Array<{
  id: SidebarTab;
  label: string;
  description: string;
}> = [
  {
    id: "sections",
    label: "Sections",
    description:
      "Full-width building blocks like Header, Hero, Features, and Footer.",
  },
  {
    id: "layouts",
    label: "Layouts",
    description:
      "Custom grids with rows and columns. Drop components into the cells.",
  },
  {
    id: "components",
    label: "Components",
    description:
      "Small pieces: images, text, headings, buttons, comments, featured items.",
  },
];

export function Sidebar() {
  const sidebarTab = useBuilderStore(selectSidebarTab);
  const setSidebarTab = useBuilderStore((s) => s.setSidebarTab);

  const active = TABS.find((t) => t.id === sidebarTab) ?? TABS[0];

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-r border-stone-200 bg-white">
      {/* Tab bar */}
      <div className="flex border-b border-stone-200">
        {TABS.map((tab) => {
          const isActive = sidebarTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSidebarTab(tab.id)}
              className={cn(
                "relative flex-1 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-brand"
                  : "text-stone-500 hover:text-stone-900",
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute right-2 bottom-0 left-2 h-0.5 bg-brand" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-3">
        <p className="mb-3 px-1 text-xs text-stone-500">{active.description}</p>

        {sidebarTab === "sections" && <SectionsLibrary />}
        {sidebarTab === "layouts" && <ComingSoon phase={10} label="Layout blocks" />}
        {sidebarTab === "components" && (
          <ComingSoon phase={11} label="Atomic components" />
        )}
      </div>
    </aside>
  );
}

// -----------------------------------------------------------------------------
// Sections tab — grid of clickable preset tiles.
// -----------------------------------------------------------------------------

function SectionsLibrary() {
  const addSection = useBuilderStore((s) => s.addSection);

  return (
    <div className="grid grid-cols-1 gap-2">
      {SECTION_PRESETS.map((preset) => (
        <SectionTile
          key={preset.type}
          preset={preset}
          onClick={() => {
            const section = preset.createDefault();
            addSection(section);
            toast.success(`Added ${preset.label}`);
          }}
        />
      ))}
    </div>
  );
}

function SectionTile({
  preset,
  onClick,
}: {
  preset: SectionPresetMeta;
  onClick: () => void;
}) {
  const { Thumbnail } = preset;
  return (
    <button
      type="button"
      onClick={onClick}
      title={preset.description}
      className="group rounded-lg border border-stone-200 bg-white p-2 text-left transition-all hover:border-brand hover:shadow-sm focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1"
    >
      <Thumbnail />
      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium text-stone-900 group-hover:text-brand">
          {preset.label}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">
          {preset.description}
        </p>
      </div>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Placeholder for the Layouts + Components tabs (filled in Phase 10/11).
// -----------------------------------------------------------------------------

function ComingSoon({ phase, label }: { phase: number; label: string }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-stone-200 p-6 text-center">
      <p className="text-sm font-medium text-stone-700">{label}</p>
      <p className="mt-1 text-xs text-stone-500">Coming in Phase {phase}.</p>
    </div>
  );
}
