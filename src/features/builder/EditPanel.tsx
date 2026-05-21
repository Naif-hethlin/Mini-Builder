"use client";

import { useMemo } from "react";
import { getPreset } from "@/features/sections/registry";
import { Form } from "@/features/sections/schema/Form";
import type { Section } from "./state/types";
import { selectSelection, useBuilderStore } from "./state/store";

/**
 * Right-side panel — schema-driven section editor.
 *
 * When a section is selected (via canvas click), looks up its preset and
 * renders the schema as a form bound to its props. Every change flows
 * through updateSection so undo/redo + auto-save pick it up.
 */
export function EditPanel() {
  const selection = useBuilderStore(selectSelection);
  const selectedId =
    selection.kind === "section" ? selection.sectionId : null;

  const sectionSelector = useMemo(
    () =>
      selectedId
        ? (s: ReturnType<typeof useBuilderStore.getState>) =>
            s.design.sections.find((sec) => sec.id === selectedId)
        : () => undefined,
    [selectedId],
  );
  const section = useBuilderStore(sectionSelector);
  const updateSection = useBuilderStore((s) => s.updateSection);

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-r border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">الإعدادات</h2>
        <p className="mt-0.5 text-xs text-stone-500">
          {section ? `إعدادات ${labelOf(section.type)}` : "اختر قسمًا للتعديل"}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!section ? (
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

function EmptyHint() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-stone-200 p-6 text-center">
      <p className="text-sm font-medium text-stone-700">لم يتم اختيار قسم</p>
      <p className="mt-1 text-xs text-stone-500">
        اضغط على أي قسم في معاينة الصفحة لفتح إعداداته هنا — العناوين،
        الأوصاف، الصور، وروابط الأزرار.
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
  }
}
