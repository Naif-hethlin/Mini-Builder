"use client";

import { Layers, Search, Shapes, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  SECTION_PRESETS,
  type SectionPresetMeta,
} from "@/features/sections/registry";
import {
  PRIMITIVE_PRESETS,
  type PrimitivePresetMeta,
} from "@/features/primitives/registry";
import { createPrimitive } from "@/features/primitives/factory";
import { createCanvas } from "@/features/sections/Canvas/defaults";
import { cn } from "@/shared/lib/cn";
import { useBuilderStore } from "./state/store";
import type { Section } from "./state/types";
import type { Primitive } from "@/features/primitives/types";

type Tab = "elements" | "sections";

const TAB_META: Array<{ id: Tab; label: string; Icon: typeof Layers }> = [
  { id: "elements", label: "العناصر", Icon: Shapes },
  { id: "sections", label: "الأقسام", Icon: Layers },
];

const CANVAS_VERTICAL_PADDING = 80;

export function Sidebar() {
  const [tab, setTab] = useState<Tab>("elements");

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">المكتبة</h2>
        <p className="mt-0.5 text-xs text-stone-500">
          اسحب عنصرًا حرًا للوحة، أو اختر قسمًا جاهزًا.
        </p>
      </div>

      <div className="flex shrink-0 gap-1 border-b border-stone-100 bg-stone-50 px-2 py-2">
        {TAB_META.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
                  : "text-stone-500 hover:bg-white/60 hover:text-stone-700",
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "elements" ? <ElementsPanel /> : <SectionsPanel />}

      <div className="border-t border-stone-100 bg-stone-50 px-3 py-2 text-[10px] leading-relaxed text-stone-500">
        ⌘+Z تراجع · ⌘+S حفظ · ⌘+D تكرار · Del حذف · أسهم لترتيب الأقسام
      </div>
    </aside>
  );
}

// =============================================================================
// Elements tab — free primitives (Heading / Text / Button / Image / List).
//
// One click adds the chosen primitive to a Canvas section: either the latest
// existing canvas, or a fresh canvas appended to the page. The primitive is
// placed below any existing content, the canvas height auto-grows to fit,
// and the new primitive is selected so the EditPanel opens for it.
// =============================================================================

function ElementsPanel() {
  const handleAdd = (type: PrimitivePresetMeta["type"]) => {
    addPrimitiveToBuilder(type);
  };

  return (
    <div className="flex-1 overflow-auto p-3">
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 p-3 text-[11px] leading-relaxed text-stone-500">
        اضغط على أي عنصر لإضافته للوحة. تقدر تسحبه بعدها لأي مكان داخل
        اللوحة.
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {PRIMITIVE_PRESETS.map((preset) => (
          <ElementTile
            key={preset.type}
            preset={preset}
            onClick={() => handleAdd(preset.type)}
          />
        ))}
      </div>
    </div>
  );
}

function ElementTile({
  preset,
  onClick,
}: {
  preset: PrimitivePresetMeta;
  onClick: () => void;
}) {
  const { Icon, label } = preset;
  return (
    <button
      type="button"
      onClick={onClick}
      title={`أضف ${label}`}
      className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white p-4 text-center transition-colors hover:border-brand hover:bg-brand-light/40 focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-50 text-stone-500 transition-colors group-hover:bg-white group-hover:text-brand">
        <Icon size={18} />
      </span>
      <span className="text-xs font-semibold text-stone-700 group-hover:text-brand">
        {label}
      </span>
    </button>
  );
}

// =============================================================================
// Sections tab — preset sections (Hero, Features, Gallery, …).
// =============================================================================

function SectionsPanel() {
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
    <>
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
            لا نتائج لـ &quot;{query}&quot;
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
    </>
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

// =============================================================================
// Add-primitive helper — the heart of the Elementor-style flow. Reads the
// current design, picks a canvas to host the primitive (creating one when
// needed), positions it below existing content, auto-grows the canvas to fit,
// and selects the new primitive.
// =============================================================================

function addPrimitiveToBuilder(type: PrimitivePresetMeta["type"]) {
  const store = useBuilderStore.getState();
  const sections = store.design.sections;

  // Prefer the LAST canvas section so primitives accumulate where the user
  // is already working. If there isn't one, create a canvas at the end.
  const lastCanvas = [...sections]
    .reverse()
    .find((s): s is Section & { type: "canvas" } => s.type === "canvas");

  let canvasId: string;
  let existingPrimitives: Primitive[];

  if (lastCanvas) {
    canvasId = lastCanvas.id;
    existingPrimitives = lastCanvas.props.primitives;
  } else {
    const canvas = createCanvas();
    store.addSection(canvas);
    canvasId = canvas.id;
    existingPrimitives = [];
  }

  const primitive = createPrimitive(type);

  // Stack the new primitive below existing content (instead of overlapping
  // at the default 40,40). Width stays at the factory default.
  const maxBottom = existingPrimitives.reduce((m, p) => {
    const guessedHeight = p.h ?? estimatePrimitiveHeight(p);
    return Math.max(m, p.y + guessedHeight);
  }, 0);
  primitive.y = maxBottom === 0 ? 40 : maxBottom + 16;

  store.addPrimitive(canvasId, primitive);

  // Auto-grow the canvas height so the new primitive isn't clipped.
  const neededHeight =
    primitive.y +
    (primitive.h ?? estimatePrimitiveHeight(primitive)) +
    CANVAS_VERTICAL_PADDING;
  store.updateSection(canvasId, (s) => {
    if (s.type !== "canvas") return s;
    if (s.props.height >= neededHeight) return s;
    return { ...s, props: { ...s.props, height: neededHeight } };
  });

  store.setSelection({
    kind: "primitive",
    sectionId: canvasId,
    primitiveId: primitive.id,
  });

  toast.success(`أضيف ${primitiveLabelFor(type)}`);
}

// Best-effort height when the primitive doesn't carry an explicit `h`. The
// canvas auto-grow uses this just to leave enough room before the next item;
// the real rendered height is whatever the browser layouts to.
function estimatePrimitiveHeight(p: Primitive): number {
  switch (p.type) {
    case "heading":
      return p.props.level === 1
        ? 56
        : p.props.level === 2
          ? 44
          : p.props.level === 3
            ? 36
            : 28;
    case "text":
      return Math.max(32, Math.round(p.props.fontSize * 1.6));
    case "button":
      return p.props.size === "lg" ? 52 : p.props.size === "sm" ? 32 : 40;
    case "image":
      return 200;
    case "list":
      return Math.max(80, p.props.items.length * (p.props.fontSize + 8) + 16);
  }
}

function primitiveLabelFor(type: PrimitivePresetMeta["type"]): string {
  const preset = PRIMITIVE_PRESETS.find((p) => p.type === type);
  return preset?.label ?? type;
}
