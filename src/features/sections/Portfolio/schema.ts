import { newId } from "@/shared/lib/id";
import type { FieldSchema } from "../schema/types";

export const portfolioSchema: FieldSchema[] = [
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
    label: "الأعمال",
    min: 1,
    max: 24,
    createItem: () => ({
      id: newId(),
      imageUrl: "",
      title: "عمل جديد",
      category: "",
    }),
    itemTitle: (item) => (item.title as string) || "عمل",
    itemSchema: [
      { kind: "image-url", key: "imageUrl", label: "رابط الصورة" },
      { kind: "text", key: "title", label: "العنوان" },
      { kind: "text", key: "category", label: "التصنيف" },
    ],
  },
];
