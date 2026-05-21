import { newId } from "@/shared/lib/id";
import type { FieldSchema } from "../schema/types";

export const testimonialsSchema: FieldSchema[] = [
  { kind: "text", key: "title", label: "العنوان" },
  { kind: "textarea", key: "subtitle", label: "العنوان الفرعي", rows: 2 },
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
    label: "التقييمات",
    min: 1,
    max: 12,
    createItem: () => ({
      id: newId(),
      name: "اسم العميل",
      role: "",
      quote: "تقييم رائع.",
      rating: 5,
    }),
    itemTitle: (item) => (item.name as string) || "عميل",
    itemSchema: [
      { kind: "text", key: "name", label: "الاسم" },
      { kind: "text", key: "role", label: "الوظيفة / الدور" },
      { kind: "textarea", key: "quote", label: "النص", rows: 3 },
      {
        kind: "select",
        key: "rating",
        label: "التقييم (نجوم)",
        options: [
          { value: "1", label: "★" },
          { value: "2", label: "★★" },
          { value: "3", label: "★★★" },
          { value: "4", label: "★★★★" },
          { value: "5", label: "★★★★★" },
        ],
      },
    ],
  },
];
