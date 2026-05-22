"use client";

import { useMemo } from "react";
import { PRIMITIVE_SCHEMAS } from "@/features/primitives/schemas";
import { getPreset } from "@/features/sections/registry";
import { Form } from "@/features/sections/schema/Form";
import { ActionField } from "./ActionField";
import { useProjects } from "@/features/projects";
import { useParams } from "next/navigation";
import type { Primitive } from "@/features/primitives/types";
import type { Section } from "./state/types";
import { selectSelection, useBuilderStore } from "./state/store";

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

  // Primitive lookup (only when a primitive is selected).
  const primInfo = useBuilderStore((s) => {
    if (s.selection.kind !== "primitive") return undefined;
    const { sectionId, primitiveId } = s.selection;
    const sec = s.design.sections.find((x) => x.id === sectionId);
    if (!sec || sec.type !== "canvas") return undefined;
    const prim = sec.props.primitives.find((p) => p.id === primitiveId);
    if (!prim) return undefined;
    return { canvasSectionId: sec.id, primitive: prim };
  });

  let heading = "اختر قسمًا للتعديل";
  if (selection.kind === "primitive" && primInfo) {
    heading = `تعديل ${primitiveLabel(primInfo.primitive.type)}`;
  } else if (section) {
    heading = `إعدادات ${labelOf(section.type)}`;
  }

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-r border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">الإعدادات</h2>
        <p className="mt-0.5 text-xs text-stone-500">{heading}</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {selection.kind === "primitive" && primInfo ? (
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
        ) : !section ? (
          <EmptyHint />
        ) : (
          <SectionForm
            section={section}
            onChange={(nextProps) =>
              updateSection(
                section.id,
                (s) =>
                  ({ ...s, props: nextProps as Section["props"] }) as Section,
              )
            }
          />
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
    <div className="rounded-2xl border-2 border-dashed border-stone-200 p-6 text-center">
      <p className="text-sm font-medium text-stone-700">لم يتم اختيار شيء</p>
      <p className="mt-1 text-xs text-stone-500">
        اضغط على قسم في المعاينة لتعديله، أو أضف لوحة حرّة وضع داخلها
        نصوصاً وأزراراً وصوراً تتحرك بحرية.
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
  }
}
