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
          <div className="p-4">
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
  }
}
