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
import { Sparkles } from "lucide-react";
import { createCanvas } from "@/features/sections/Canvas/defaults";
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
            <CanvasEmpty />
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

function CanvasEmpty() {
  const addSection = useBuilderStore((s) => s.addSection);
  const setSelection = useBuilderStore((s) => s.setSelection);

  const startFreeCanvas = () => {
    const canvas = createCanvas();
    addSection(canvas);
    setSelection({ kind: "section", sectionId: canvas.id });
  };

  return (
    <div className="m-6 flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
        <Sparkles size={26} />
      </div>
      <div className="max-w-md">
        <h3 className="text-lg font-bold text-stone-900">
          ابدأ من لوحة بيضاء
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          ابدأ بلوحة حرّة وأضف بداخلها نصوصاً، أزراراً، صوراً وقوائم
          واسحبهم بأي مكان — أو اختر قسماً جاهزاً من المكتبة على اليمين.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={startFreeCanvas}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand/30 hover:bg-brand-dark"
        >
          <Sparkles size={14} />
          ابدأ بلوحة حرّة
        </button>
      </div>
    </div>
  );
}
