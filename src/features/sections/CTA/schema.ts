import type { FieldSchema } from "../schema/types";

export const ctaSchema: FieldSchema[] = [
  { kind: "text", key: "title", label: "العنوان" },
  { kind: "textarea", key: "description", label: "الوصف", rows: 2 },
  { kind: "link", key: "button", label: "زر الإجراء" },
  {
    kind: "select",
    key: "style",
    label: "النمط",
    options: [
      { value: "solid", label: "خلفية ملونة" },
      { value: "gradient", label: "تدرج لوني" },
      { value: "subtle", label: "هادئ" },
    ],
  },
];
