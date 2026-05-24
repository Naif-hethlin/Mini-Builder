"use client";

import {
  HandMetal,
  LayoutTemplate,
  Puzzle,
  Search,
  Shapes,
  X,
} from "lucide-react";
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
import { explodeSection, isExplodable } from "./explode";
import { useBuilderStore } from "./state/store";
import type { Section } from "./state/types";
import type { Primitive } from "@/features/primitives/types";

type Tab = "elements" | "sections";

const TAB_META: Array<{ id: Tab; label: string; Icon: typeof Puzzle }> = [
  { id: "elements", label: "العناصر", Icon: Puzzle },
  { id: "sections", label: "الأقسام الجاهزة", Icon: LayoutTemplate },
];

const PANEL_CLASS =
  "bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100";

const CANVAS_VERTICAL_PADDING = 80;

export function Sidebar() {
  const [tab, setTab] = useState<Tab>("elements");
  const [query, setQuery] = useState("");

  return (
    <aside
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden",
        PANEL_CLASS,
      )}
    >
      {/* Header — icon chip + title + search */}
      <div className="border-b border-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-brand">
              <Shapes size={18} />
            </span>
            مكتبة العناصر
          </h2>
        </div>

        <div className="group relative">
          <Search
            size={14}
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن عنصر…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pe-9 ps-3 text-base font-medium placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 sm:text-sm"
          />
          {query && (
            <button
              type="button"
              aria-label="مسح"
              onClick={() => setQuery("")}
              className="absolute start-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3">
        <div className="flex gap-1 rounded-xl border border-slate-200/50 bg-slate-100/80 p-1">
          {TAB_META.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm transition-all",
                  active
                    ? "border border-slate-100 bg-white font-bold text-brand shadow-sm"
                    : "font-semibold text-slate-500 hover:bg-white/50 hover:text-slate-800",
                )}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "elements" ? (
        <ElementsPanel query={query} />
      ) : (
        <SectionsPanel query={query} />
      )}
    </aside>
  );
}

// =============================================================================
// Elements tab — free primitives.
// =============================================================================

function ElementsPanel({ query }: { query: string }) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRIMITIVE_PRESETS;
    return PRIMITIVE_PRESETS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) || p.type.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div
      data-tour="library-content"
      className="flex-1 space-y-5 overflow-y-auto px-4 pb-4"
    >
      {/* Indigo info banner */}
      <div className="relative flex items-start gap-3 overflow-hidden rounded-xl border border-indigo-100/60 bg-indigo-50 p-3">
        <div className="absolute -end-2 -top-2 h-12 w-12 rounded-full bg-indigo-500/10 blur-xl" />
        <HandMetal size={20} className="z-10 shrink-0 text-indigo-500" />
        <p className="z-10 pt-0.5 text-xs font-medium leading-relaxed text-indigo-800">
          اضغط على أي عنصر لإضافته للوحة، ثم اسحبه لأي مكان داخل
          مساحة العمل.
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyResults query={query} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((preset) => (
            <ElementTile
              key={preset.id}
              preset={preset}
              onClick={() => addPrimitiveToBuilder(preset)}
            />
          ))}
        </div>
      )}
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
      className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-brand/40 hover:shadow-[0_8px_20px_rgb(232,93,93,0.06)]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand-light/0 to-brand-light/50 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-all group-hover:bg-white group-hover:text-brand group-hover:shadow-sm">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <span className="relative z-10 text-xs font-bold text-slate-700 transition-colors group-hover:text-brand-dark">
        {label}
      </span>
    </button>
  );
}

// =============================================================================
// Sections tab — preset sections.
// =============================================================================

function SectionsPanel({ query }: { query: string }) {
  const addSection = useBuilderStore((s) => s.addSection);

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
    <div
      data-tour="library-content"
      data-tour-alt="library-sections"
      className="flex-1 overflow-y-auto px-4 pb-4"
    >
      {filtered.length === 0 ? (
        <EmptyResults query={query} />
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {filtered.map((preset) => (
            <SectionTile
              key={preset.type}
              preset={preset}
              onClick={() => {
                // Auto-explode preset sections so the user can drag /
                // recolor any piece from the moment it's added, matching
                // the behaviour of templates seeded via starterDesignFor.
                const fresh = preset.createDefault();
                const next = isExplodable(fresh)
                  ? (explodeSection(fresh) ?? fresh)
                  : fresh;
                addSection(next);
                toast.success(`أضيف ${preset.label}`);
              }}
            />
          ))}
        </div>
      )}
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
      className="group rounded-xl border border-slate-100 bg-white p-2 text-start transition-all hover:border-brand/40 hover:shadow-[0_8px_20px_rgb(232,93,93,0.06)] focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1"
    >
      <Thumbnail />
      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium text-slate-900 group-hover:text-brand-dark">
          {preset.label}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
          {preset.description}
        </p>
      </div>
    </button>
  );
}

function EmptyResults({ query }: { query: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
      لا نتائج لـ &quot;{query}&quot;
    </div>
  );
}

// =============================================================================
// Add-primitive helper — unchanged behaviour (auto-creates / appends to a
// canvas section, stacks under existing content, auto-grows height).
// =============================================================================

function addPrimitiveToBuilder(preset: PrimitivePresetMeta) {
  const store = useBuilderStore.getState();
  const sections = store.design.sections;

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

  const primitive = createPrimitive(preset.type);
  // Apply per-tile defaults (e.g. shape kind = circle vs triangle).
  if (preset.propsOverride) {
    primitive.props = {
      ...primitive.props,
      ...preset.propsOverride,
    } as typeof primitive.props;
  }

  const maxBottom = existingPrimitives.reduce((m, p) => {
    const guessedHeight = p.h ?? estimatePrimitiveHeight(p);
    return Math.max(m, p.y + guessedHeight);
  }, 0);
  primitive.y = maxBottom === 0 ? 40 : maxBottom + 16;

  store.addPrimitive(canvasId, primitive);

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

  toast.success(`أضيف ${preset.label}`);
}

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
    case "shape":
      return p.h ?? 140;
    case "icon":
      return p.h ?? 64;
    case "input":
      return 64;
    case "qa":
      return p.props.defaultOpen ? 120 : 52;
  }
}

