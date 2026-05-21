import { newId } from "@/shared/lib/id";
import type { FieldSchema } from "../schema/types";

export const menuSchema: FieldSchema[] = [
  { kind: "text", key: "title", label: "العنوان" },
  { kind: "textarea", key: "subtitle", label: "العنوان الفرعي", rows: 2 },
  { kind: "text", key: "currency", label: "العملة" },
  {
    kind: "select",
    key: "columns",
    label: "عدد الأعمدة",
    options: [
      { value: "2", label: "عمودان" },
      { value: "3", label: "ثلاثة" },
    ],
  },
  {
    kind: "list",
    key: "items",
    label: "الأصناف",
    min: 1,
    max: 40,
    createItem: () => ({
      id: newId(),
      name: "صنف جديد",
      description: "",
      price: "0",
      imageUrl: "",
    }),
    itemTitle: (item) => (item.name as string) || "صنف",
    itemSchema: [
      { kind: "text", key: "name", label: "الاسم" },
      { kind: "textarea", key: "description", label: "الوصف", rows: 2 },
      { kind: "text", key: "price", label: "السعر" },
      { kind: "image-url", key: "imageUrl", label: "رابط الصورة" },
    ],
  },
];
