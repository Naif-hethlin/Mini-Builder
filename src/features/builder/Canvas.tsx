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
import {
  Image as ImageIcon,
  Heading1,
  LayoutGrid,
  Minus,
  Monitor,
  MousePointer2,
  MousePointerClick,
  Plus,
  Smartphone,
  Tablet,
} from "lucide-react";
import { createCanvas } from "@/features/sections/Canvas/defaults";
import { cn } from "@/shared/lib/cn";
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

const PANEL_CLASS =
  "bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100";

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
      className={cn(
        "relative flex h-full min-w-0 flex-col overflow-hidden",
        PANEL_CLASS,
      )}
      onClick={() => setSelection({ kind: "none" })}
    >
      {/* Dotted blueprint backdrop — sits behind everything else. */}
      <div
        aria-hidden
        className="blueprint-grid pointer-events-none absolute inset-0 z-0 opacity-40"
      />

      {/* Floating device + zoom selector */}
      <FloatingDeviceBar />

      {/* Canvas scroll area — tight padding on mobile, generous on desktop
          since desktop has the floating device + shortcut bars. */}
      <div className="relative z-10 flex flex-1 items-start justify-center overflow-auto px-2 py-4 sm:px-4 sm:py-16">
        <div
          className={cn(
            "w-full transition-[max-width] duration-200",
            DEVICE_WIDTH[deviceMode],
          )}
        >
          {isEmpty ? (
            <CanvasEmpty />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="divide-y divide-slate-100">
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
            </div>
          )}
        </div>
      </div>

      <FloatingShortcutBar />
    </main>
  );
}

// =============================================================================
// Floating device + zoom selector — sits above the canvas, replaces the
// previous in-Toolbar device toggle.
// =============================================================================

// Hidden on phones — the toggle isn't useful on a device that already
// shows you the mobile breakpoint, and it eats vertical canvas space.
function FloatingDeviceBar() {
  const deviceMode = useBuilderStore(selectDeviceMode);
  const setDeviceMode = useBuilderStore((s) => s.setDeviceMode);

  const DEVICES: Array<{
    mode: DeviceMode;
    Icon: typeof Monitor;
    label: string;
    showLabel?: boolean;
  }> = [
    { mode: "desktop", Icon: Monitor, label: "حاسوب", showLabel: true },
    { mode: "tablet", Icon: Tablet, label: "تابلت" },
    { mode: "mobile", Icon: Smartphone, label: "جوال" },
  ];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-4 left-1/2 z-20 hidden -translate-x-1/2 sm:block"
    >
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200/60 bg-white/80 p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md">
        {DEVICES.map(({ mode, Icon, label, showLabel }) => {
          const active = deviceMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setDeviceMode(mode)}
              aria-label={label}
              title={label}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl text-sm font-bold transition-all",
                active
                  ? "bg-slate-800 px-4 py-2 text-white shadow-sm"
                  : "px-3 py-2 font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800",
              )}
            >
              <Icon size={16} />
              {active && showLabel && <span>{label}</span>}
            </button>
          );
        })}

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-1 px-2">
          <button
            type="button"
            aria-label="تصغير"
            title="تصغير"
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Minus size={12} />
          </button>
          <span className="w-10 text-center text-xs font-bold text-slate-600">
            100%
          </span>
          <button
            type="button"
            aria-label="تكبير"
            title="تكبير"
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Floating shortcut bar — pinned to bottom-center of the canvas.
// =============================================================================

// Hidden on phones — kbd shortcuts don't apply, and the bar would
// crowd the MobileTabs strip at the bottom.
function FloatingShortcutBar() {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 sm:block"
    >
      <div className="flex items-center gap-6 rounded-2xl border border-slate-200/60 bg-white/90 px-5 py-2.5 text-xs font-bold text-slate-500 shadow-[0_4px_20px_rgb(0,0,0,0.08)] backdrop-blur-sm">
        <ShortcutChip combo="Ctrl Z" label="تراجع" />
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <ShortcutChip combo="Ctrl D" label="تكرار" />
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <ShortcutChip combo="Del" label="حذف العنصر" danger />
      </div>
    </div>
  );
}

function ShortcutChip({
  combo,
  label,
  danger = false,
}: {
  combo: string;
  label: string;
  danger?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2.5 transition-colors",
        danger ? "hover:text-rose-600" : "hover:text-slate-800",
      )}
    >
      <kbd className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 font-sans text-[10px] text-slate-600 shadow-sm">
        {combo}
      </kbd>
      {label}
    </span>
  );
}

// =============================================================================
// Empty state — rotated icon grid + start-section CTA.
// =============================================================================

function CanvasEmpty() {
  const addSection = useBuilderStore((s) => s.addSection);
  const setSelection = useBuilderStore((s) => s.setSelection);

  const startFreeCanvas = () => {
    const canvas = createCanvas();
    addSection(canvas);
    setSelection({ kind: "section", sectionId: canvas.id });
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center p-12">
      <div className="relative -z-0 flex flex-col items-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50/30 px-10 py-14">
        <div className="relative mb-10">
          <div className="absolute inset-0 scale-150 rounded-full bg-brand/20 blur-3xl" />

          <div className="relative grid -rotate-6 grid-cols-2 gap-4 transition-transform duration-500 hover:rotate-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-100 bg-white text-brand shadow-lg">
              <ImageIcon size={32} strokeWidth={1.5} />
            </div>
            <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
              <Heading1 size={32} strokeWidth={2} />
            </div>
            <div className="-mt-8 ms-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-lg">
              <MousePointerClick size={32} strokeWidth={1.5} />
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 shadow-lg">
              <LayoutGrid size={32} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <h1 className="mb-4 text-center text-3xl font-black tracking-tight text-slate-800">
          مساحة عمل فارغة
        </h1>

        <p className="mb-10 max-w-sm text-center text-base font-medium leading-relaxed text-slate-500">
          ابدأ بتصميم موقعك من الصفر. اسحب العناصر من المكتبة الجانبية أو
          ابدأ بلوحة حرّة لتصمم بحرية كاملة.
        </p>

        <button
          type="button"
          onClick={startFreeCanvas}
          className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-800 px-8 py-3.5 font-bold text-white shadow-xl shadow-slate-900/20 transition-all duration-300 hover:scale-105 hover:bg-slate-900"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>إضافة قسم جديد</span>
        </button>

        {/* tiny secondary nudge — discoverability for the "click element on
            the sidebar" interaction. */}
        <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <MousePointer2 size={12} />
          أو اضغط على أي عنصر في المكتبة على اليمين
        </p>
      </div>
    </div>
  );
}
