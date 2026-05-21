import { newId } from "@/shared/lib/id";
import type { FieldSchema } from "../schema/types";

export const featuresSchema: FieldSchema[] = [
  { kind: "text", key: "eyebrow", label: "النص العلوي", placeholder: "اختياري" },
  { kind: "text", key: "title", label: "العنوان" },
  { kind: "textarea", key: "subtitle", label: "الوصف", rows: 2 },
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
    label: "المزايا",
    min: 1,
    max: 12,
    createItem: () => ({
      id: newId(),
      icon: "Star",
      title: "ميزة جديدة",
      description: "وصف قصير للميزة.",
    }),
    itemTitle: (item) => (item.title as string) || "ميزة",
    itemSchema: [
      { kind: "text", key: "icon", label: "اسم الأيقونة (lucide)" },
      { kind: "text", key: "title", label: "العنوان" },
      { kind: "textarea", key: "description", label: "الوصف", rows: 2 },
    ],
  },
];
