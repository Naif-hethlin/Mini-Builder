"use client";

import { MousePointerClick } from "lucide-react";
import { SectionRenderer } from "@/features/sections/SectionRenderer";
import type { DeviceMode } from "./state/types";
import {
  selectDeviceMode,
  selectSections,
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

  const isEmpty = sections.length === 0;

  return (
    <main className="flex h-full w-full flex-1 overflow-auto bg-stone-50">
      <div
        className={`mx-auto w-full px-4 py-6 transition-[max-width] duration-200 ${DEVICE_WIDTH[deviceMode]}`}
      >
        <div className="min-h-[calc(100vh-200px)] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          {isEmpty ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-stone-100">
              {sections.map((section) => (
                <SectionRenderer key={section.id} section={section} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
        <MousePointerClick size={24} strokeWidth={1.75} />
      </div>
      <h2 className="text-lg font-semibold text-stone-900">
        Your page is empty
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-stone-500">
        Click a section in the library on the left to add it to your page. You
        can then edit, rearrange, or duplicate any section.
      </p>
    </div>
  );
}
