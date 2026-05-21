"use client";

import { toast } from "sonner";
import {
  SECTION_PRESETS,
  type SectionPresetMeta,
} from "@/features/sections/registry";
import { useBuilderStore } from "./state/store";

/**
 * Left sidebar — library of section presets.
 *
 * The plan's data model is sections-only (no Layout container, no atomic
 * components), so this is a single-pane library with no tabs.
 */
export function Sidebar() {
  const addSection = useBuilderStore((s) => s.addSection);

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">الأقسام</h2>
        <p className="mt-0.5 text-xs text-stone-500">
          اختر قسمًا لإضافته إلى صفحتك.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-1 gap-2">
          {SECTION_PRESETS.map((preset) => (
            <SectionTile
              key={preset.type}
              preset={preset}
              onClick={() => {
                addSection(preset.createDefault());
                toast.success(`أضيف ${preset.label}`);
              }}
            />
          ))}
        </div>
      </div>
    </aside>
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
      className="group rounded-xl border border-stone-200 bg-white p-2 text-right transition-all hover:border-brand hover:shadow-sm focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1"
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
