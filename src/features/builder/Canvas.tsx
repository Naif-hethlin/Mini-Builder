"use client";

import { MousePointerClick } from "lucide-react";
import { SectionRenderer } from "@/features/sections/SectionRenderer";
import { cn } from "@/shared/lib/cn";
import type { DeviceMode, Section } from "./state/types";
import {
  selectDeviceMode,
  selectSections,
  selectSelection,
  useBuilderStore,
} from "./state/store";

// Canvas content is constrained to one of these widths based on the device
// toggle in the toolbar. Shrinking the inner container is what makes
// "preview on tablet/mobile" actually do something.
const DEVICE_WIDTH: Record<DeviceMode, string> = {
  desktop: "max-w-[1280px]",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
};

export function Canvas() {
  const sections = useBuilderStore(selectSections);
  const deviceMode = useBuilderStore(selectDeviceMode);
  const selection = useBuilderStore(selectSelection);
  const setSelection = useBuilderStore((s) => s.setSelection);

  const isEmpty = sections.length === 0;
  const selectedId =
    selection.kind === "section" ? selection.sectionId : null;

  return (
    <main
      className="flex h-full w-full flex-1 overflow-auto bg-stone-50"
      onClick={() => setSelection({ kind: "none" })}
    >
      <div
        className={`mx-auto w-full px-4 py-6 transition-[max-width] duration-200 ${DEVICE_WIDTH[deviceMode]}`}
      >
        <div className="min-h-[calc(100vh-200px)] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {isEmpty ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-stone-100">
              {sections.map((section) => (
                <SelectableSection
                  key={section.id}
                  section={section}
                  selected={section.id === selectedId}
                  onSelect={() =>
                    setSelection({ kind: "section", sectionId: section.id })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function SelectableSection({
  section,
  selected,
  onSelect,
}: {
  section: Section;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative cursor-pointer outline-none transition-shadow",
        selected
          ? "shadow-[inset_0_0_0_2px_var(--color-brand)]"
          : "hover:shadow-[inset_0_0_0_2px_rgba(232,93,93,0.25)]",
      )}
    >
      <SectionRenderer section={section} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
        <MousePointerClick size={24} strokeWidth={1.75} />
      </div>
      <h2 className="text-lg font-semibold text-stone-900">صفحتك فارغة</h2>
      <p className="mt-1.5 max-w-sm text-sm text-stone-500">
        اضغط على أي قسم في المكتبة على اليمين لإضافته. تقدر بعدها تعدل،
        ترتب، أو تنسخ أي قسم.
      </p>
    </div>
  );
}
