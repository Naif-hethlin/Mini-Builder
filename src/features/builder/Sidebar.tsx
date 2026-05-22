"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  SECTION_PRESETS,
  type SectionPresetMeta,
} from "@/features/sections/registry";
import { useBuilderStore } from "./state/store";

export function Sidebar() {
  const addSection = useBuilderStore((s) => s.addSection);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTION_PRESETS;
    return SECTION_PRESETS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">الأقسام</h2>
        <p className="mt-0.5 text-xs text-stone-500">
          اختر قسمًا لإضافته إلى صفحتك.
        </p>
      </div>

      <div className="border-b border-stone-100 px-3 py-2">
        <div className="relative">
          <Search
            size={12}
            className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن قسم…"
            className="h-9 w-full rounded-lg border border-stone-200 bg-stone-50 ps-7 pe-8 text-xs focus:border-brand focus:bg-white focus:outline focus:outline-2 focus:outline-brand/30"
          />
          {query && (
            <button
              type="button"
              aria-label="مسح"
              onClick={() => setQuery("")}
              className="absolute end-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-stone-200 p-6 text-center text-xs text-stone-500">
            لا نتائج لـ "{query}"
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filtered.map((preset) => (
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
        )}
      </div>

      <div className="border-t border-stone-100 bg-stone-50 px-3 py-2 text-[10px] leading-relaxed text-stone-500">
        ⌘+Z تراجع · ⌘+S حفظ · ⌘+D تكرار · Del حذف · أسهم لترتيب الأقسام
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
      className="group rounded-xl border border-stone-200 bg-white p-2 text-start transition-all hover:border-brand hover:shadow-sm focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1"
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
