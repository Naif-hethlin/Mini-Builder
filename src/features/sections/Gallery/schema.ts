import { newId } from "@/shared/lib/id";
import type { FieldSchema } from "../schema/types";

export const gallerySchema: FieldSchema[] = [
  { kind: "text", key: "title", label: "العنوان" },
  { kind: "textarea", key: "subtitle", label: "العنوان الفرعي", rows: 2 },
  {
    kind: "select",
    key: "columns",
    label: "عدد الأعمدة",
    options: [
      { value: "2", label: "عمودان" },
      { value: "3", label: "ثلاثة" },
      { value: "4", label: "أربعة" },
    ],
  },
  {
    kind: "list",
    key: "items",
    label: "الصور",
    min: 1,
    max: 24,
    createItem: () => ({ id: newId(), url: "", alt: "" }),
    itemTitle: (item, idx) =>
      (item.alt as string) || `الصورة ${idx + 1}`,
    itemSchema: [
      { kind: "image-url", key: "url", label: "رابط الصورة" },
      { kind: "text", key: "alt", label: "النص البديل" },
    ],
  },
];
