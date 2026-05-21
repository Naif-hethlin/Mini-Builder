"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MousePointerClick } from "lucide-react";
import { SortableSection } from "./SortableSection";
import type { DeviceMode } from "./state/types";
import {
  selectDeviceMode,
  selectSections,
  selectSelection,
  useBuilderStore,
} from "./state/store";

// Canvas content is constrained to one of these widths based on the device
// toggle in the toolbar.
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
  const reorderSections = useBuilderStore((s) => s.reorderSections);
  const removeSection = useBuilderStore((s) => s.removeSection);
  const duplicateSection = useBuilderStore((s) => s.duplicateSection);

  // 6px activation distance — clicks still register as clicks, only meaningful
  // drags trigger reorder.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = sections.findIndex((s) => s.id === active.id);
    const to = sections.findIndex((s) => s.id === over.id);
    if (from === -1 || to === -1) return;
    reorderSections(from, to);
  };

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
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-stone-100">
                  {sections.map((section, index) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      selected={section.id === selectedId}
                      canMoveUp={index > 0}
                      canMoveDown={index < sections.length - 1}
                      onSelect={() =>
                        setSelection({
                          kind: "section",
                          sectionId: section.id,
                        })
                      }
                      onMoveUp={() => reorderSections(index, index - 1)}
                      onMoveDown={() => reorderSections(index, index + 1)}
                      onDuplicate={() => duplicateSection(section.id)}
                      onDelete={() => removeSection(section.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
      <h2 className="text-lg font-semibold text-stone-900">صفحتك فارغة</h2>
      <p className="mt-1.5 max-w-sm text-sm text-stone-500">
        اضغط على أي قسم في المكتبة على اليمين لإضافته. تقدر بعدها تعدل،
        ترتب، أو تنسخ أي قسم.
      </p>
    </div>
  );
}
