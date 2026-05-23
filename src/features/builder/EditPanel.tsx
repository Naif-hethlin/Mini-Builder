"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { AlertCircle, MousePointer2, Sliders, X } from "lucide-react";
import { PRIMITIVE_SCHEMAS } from "@/features/primitives/schemas";
import { getPreset } from "@/features/sections/registry";
import { Form } from "@/features/sections/schema/Form";
import { cn } from "@/shared/lib/cn";
import { ActionField } from "./ActionField";
import { useProjects } from "@/features/projects";
import { useParams } from "next/navigation";
import type { Primitive } from "@/features/primitives/types";
import type { Section } from "./state/types";
import { selectSelection, useBuilderStore } from "./state/store";

const PANEL_CLASS =
  "bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100";

/**
 * Right-side panel — schema-driven editor.
 *
 * Selection-aware:
 *   - kind="section"  → renders the section's preset schema.
 *   - kind="primitive" → renders the primitive's schema + (for Button /
 *     Image) the prototype-link action picker.
 *   - kind="none" → friendly hint.
 */
export function EditPanel() {
  const selection = useBuilderStore(selectSelection);
  const selectedSectionId =
    selection.kind === "section" ? selection.sectionId : null;

  const sectionSelector = useMemo(
    () =>
      selectedSectionId
        ? (s: ReturnType<typeof useBuilderStore.getState>) =>
            s.design.sections.find((sec) => sec.id === selectedSectionId)
        : () => undefined,
    [selectedSectionId],
  );
  const section = useBuilderStore(sectionSelector);
  const updateSection = useBuilderStore((s) => s.updateSection);
  const updatePrimitive = useBuilderStore((s) => s.updatePrimitive);

  // Primitive lookup (only when a primitive is selected). Wrap in
  // `useShallow` so the returned `{ canvasSectionId, primitive }` is
  // compared field-by-field — otherwise a fresh object on every store
  // update re-renders EditPanel constantly and can echo into the autosave
  // loop.
  const primInfo = useBuilderStore(
    useShallow((s) => {
      if (s.selection.kind !== "primitive") return undefined;
      const { sectionId, primitiveId } = s.selection;
      const sec = s.design.sections.find((x) => x.id === sectionId);
      if (!sec || sec.type !== "canvas") return undefined;
      const prim = sec.props.primitives.find((p) => p.id === primitiveId);
      if (!prim) return undefined;
      return { canvasSectionId: sec.id, primitive: prim };
    }),
  );

  let heading = "اختر قسمًا للتعديل";
  if (selection.kind === "primitive" && primInfo) {
    heading = `تعديل ${primitiveLabel(primInfo.primitive.type)}`;
  } else if (section) {
    heading = `إعدادات ${labelOf(section.type)}`;
  }

  const setSelection = useBuilderStore((s) => s.setSelection);
  const hasSelection = selection.kind !== "none";

  return (
    <aside
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden",
        PANEL_CLASS,
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-50 p-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
            <Sliders size={16} />
          </span>
          الخصائص
        </h2>
        <button
          type="button"
          aria-label="إلغاء التحديد"
          title="إلغاء التحديد"
          onClick={() => setSelection({ kind: "none" })}
          disabled={!hasSelection}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X size={16} />
        </button>
      </div>

      {hasSelection && (
        <div className="border-b border-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
          {heading}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {selection.kind === "primitive" && primInfo ? (
          <div className="space-y-5 p-4">
            <GeometryForm
              primitive={primInfo.primitive}
              onChange={(patch) =>
                updatePrimitive(
                  primInfo.canvasSectionId,
                  primInfo.primitive.id,
                  (p) => ({ ...p, ...patch }) as Primitive,
                )
              }
            />
            <ActionForm
              primitive={primInfo.primitive}
              onChange={(action) =>
                updatePrimitive(
                  primInfo.canvasSectionId,
                  primInfo.primitive.id,
                  (p) => ({ ...p, action }) as Primitive,
                )
              }
            />
            <PrimitiveForm
              canvasSectionId={primInfo.canvasSectionId}
              primitive={primInfo.primitive}
              onChange={(nextProps) =>
                updatePrimitive(
                  primInfo.canvasSectionId,
                  primInfo.primitive.id,
                  (p) =>
                    ({ ...p, props: nextProps }) as Primitive,
                )
              }
            />
          </div>
        ) : !section ? (
          <EmptyHint />
        ) : (
          <div className="p-4">
            <SectionForm
              section={section}
              onChange={(nextProps) =>
                updateSection(
                  section.id,
                  (s) =>
                    ({
                      ...s,
                      props: nextProps as Section["props"],
                    }) as Section,
                )
              }
            />
          </div>
        )}
      </div>
    </aside>
  );
}

function SectionForm({
  section,
  onChange,
}: {
  section: Section;
  onChange: (nextProps: Record<string, unknown>) => void;
}) {
  const preset = getPreset(section.type);
  if (!preset) {
    return (
      <p className="text-sm text-stone-500">
        لا توجد إعدادات قابلة للتعديل لهذا القسم.
      </p>
    );
  }
  return (
    <Form
      value={section.props as Record<string, unknown>}
      schema={preset.schema}
      onChange={onChange}
    />
  );
}

function PrimitiveForm({
  canvasSectionId: _canvasSectionId,
  primitive,
  onChange,
}: {
  canvasSectionId: string;
  primitive: Primitive;
  onChange: (nextProps: Record<string, unknown>) => void;
}) {
  const schema = PRIMITIVE_SCHEMAS[primitive.type];
  const { id: projectId } = useParams<{ id: string }>();
  const project = useProjects((s) => s.projects[projectId]);

  // The schema-driven form may set numeric fields as strings (from <select>).
  // Coerce primitive numeric / boolean keys back to their declared types.
  const handleChange = (value: Record<string, unknown>) => {
    const next: Record<string, unknown> = { ...value };
    if (primitive.type === "text") {
      if (typeof next.fontSize === "string")
        next.fontSize = Number(next.fontSize);
    }
    if (primitive.type === "heading") {
      if (typeof next.level === "string") next.level = Number(next.level);
    }
    if (primitive.type === "list") {
      if (typeof next.fontSize === "string")
        next.fontSize = Number(next.fontSize);
    }
    if (primitive.type === "shape") {
      if (typeof next.borderWidth === "string")
        next.borderWidth = Number(next.borderWidth);
    }
    if (primitive.type === "icon") {
      if (typeof next.strokeWidth === "string")
        next.strokeWidth = Number(next.strokeWidth);
    }
    if (primitive.type === "input") {
      if (typeof next.required === "string")
        next.required = next.required === "true";
    }
    if (primitive.type === "qa") {
      if (typeof next.defaultOpen === "string")
        next.defaultOpen = next.defaultOpen === "true";
    }
    onChange(next);
  };

  return (
    <div className="space-y-5">
      <Form
        value={primitive.props as Record<string, unknown>}
        schema={schema}
        onChange={handleChange}
      />

      {(primitive.type === "button" || primitive.type === "image") && (
        <ActionField
          value={(primitive.props as { action: any }).action}
          pages={project?.pages ?? []}
          onChange={(action) =>
            handleChange({ ...primitive.props, action })
          }
        />
      )}
    </div>
  );
}

// =============================================================================
// Geometry form — width / height / rotation controls common to every
// primitive type, rendered above the per-type props schema.
// =============================================================================

function GeometryForm({
  primitive,
  onChange,
}: {
  primitive: Primitive;
  onChange: (patch: Partial<Primitive>) => void;
}) {
  const rotation = primitive.rotation ?? 0;
  const hasH = primitive.h !== undefined;

  const setNumber = (key: "x" | "y" | "w" | "h" | "rotation") =>
    (raw: string) => {
      const v = Number(raw);
      if (Number.isNaN(v)) return;
      onChange({ [key]: v } as Partial<Primitive>);
    };

  return (
    <details
      className="group rounded-xl border border-slate-200 bg-slate-50/60 p-3"
      open
    >
      <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-slate-700">
        <span>الموضع والحجم والدوران</span>
        <span className="text-[10px] font-medium text-slate-400 transition-transform group-open:rotate-90">
          ▸
        </span>
      </summary>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberField
          label="العرض (Width)"
          value={primitive.w}
          onChange={setNumber("w")}
          min={20}
        />
        <NumberField
          label="الارتفاع (Height)"
          value={hasH ? primitive.h! : 0}
          placeholder={hasH ? undefined : "تلقائي"}
          onChange={setNumber("h")}
          min={hasH ? 20 : 0}
        />
        <NumberField
          label="X"
          value={primitive.x}
          onChange={setNumber("x")}
        />
        <NumberField
          label="Y"
          value={primitive.y}
          onChange={setNumber("y")}
        />
      </div>

      <div className="mt-3">
        <label className="mb-1 flex items-center justify-between text-xs font-medium text-slate-700">
          <span>الدوران (Rotation)</span>
          <span className="font-mono text-[11px] text-slate-500">
            {rotation}°
          </span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={rotation}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            className="flex-1 accent-brand"
          />
          <input
            type="number"
            value={rotation}
            min={-180}
            max={180}
            step={1}
            onChange={(e) => setNumber("rotation")(e.target.value)}
            className="h-8 w-16 rounded-md border border-slate-200 bg-white px-2 text-center text-xs"
          />
        </div>
        <div className="mt-2 flex gap-1">
          {[0, 45, 90, 180, -45, -90].map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => onChange({ rotation: deg })}
              className={cn(
                "h-7 flex-1 rounded-md text-[10px] font-bold transition-colors",
                rotation === deg
                  ? "bg-brand text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100",
              )}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
  min,
}: {
  label: string;
  value: number;
  onChange: (raw: string) => void;
  placeholder?: string;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-slate-700">
        {label}
      </span>
      <input
        type="number"
        value={value}
        placeholder={placeholder}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
      />
    </label>
  );
}

// =============================================================================
// Action form — exposes the shared `action` field on every primitive so
// any element (text / heading / image / shape / icon / list / qa /
// button / input) can be made interactive in /preview and /sites.
// =============================================================================

function ActionForm({
  primitive,
  onChange,
}: {
  primitive: Primitive;
  onChange: (next: import("@/features/primitives/types").PrimitiveAction) => void;
}) {
  const { id: projectId } = useParams<{ id: string }>();
  const project = useProjects((s) => s.projects[projectId]);
  return (
    <ActionField
      value={primitive.action ?? { kind: "none" }}
      pages={project?.pages ?? []}
      onChange={onChange}
    />
  );
}

function EmptyHint() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-50/30 p-6 text-center">
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400 shadow-sm">
          <MousePointer2 size={36} strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-1 -end-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-100 text-amber-500 shadow-sm">
          <AlertCircle size={16} fill="currentColor" stroke="white" />
        </div>
      </div>
      <h3 className="mb-2 text-base font-bold text-slate-700">
        لم يتم تحديد عنصر
      </h3>
      <p className="px-2 text-xs font-medium leading-relaxed text-slate-500">
        انقر على أي عنصر داخل مساحة العمل لتعديل خصائصه، ألوانه،
        ومحتواه من هنا.
      </p>
    </div>
  );
}

function labelOf(type: Section["type"]): string {
  switch (type) {
    case "header":
      return "رأس الصفحة";
    case "hero":
      return "البطل";
    case "features":
      return "المزايا";
    case "pricing":
      return "خطط الأسعار";
    case "cta":
      return "دعوة للإجراء";
    case "footer":
      return "التذييل";
    case "gallery":
      return "معرض الصور";
    case "testimonials":
      return "آراء العملاء";
    case "faq":
      return "الأسئلة الشائعة";
    case "contact":
      return "تواصل معنا";
    case "booking":
      return "نموذج حجز";
    case "menu":
      return "قائمة طعام";
    case "portfolio":
      return "معرض الأعمال";
    case "canvas":
      return "لوحة حرّة";
  }
}

function primitiveLabel(type: Primitive["type"]): string {
  switch (type) {
    case "text":
      return "النص";
    case "heading":
      return "العنوان";
    case "button":
      return "الزر";
    case "image":
      return "الصورة";
    case "list":
      return "القائمة";
    case "shape":
      return "الشكل";
    case "icon":
      return "الأيقونة";
    case "input":
      return "حقل الإدخال";
    case "qa":
      return "السؤال والجواب";
  }
}
