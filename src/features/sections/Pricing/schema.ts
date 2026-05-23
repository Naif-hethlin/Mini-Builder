import { newId } from "@/shared/lib/id";
import type { FieldSchema } from "../schema/types";

export const pricingSchema: FieldSchema[] = [
  { kind: "text", key: "eyebrow", label: "النص العلوي", placeholder: "اختياري" },
  { kind: "text", key: "title", label: "العنوان" },
  { kind: "textarea", key: "subtitle", label: "الوصف", rows: 2 },
  {
    kind: "list",
    key: "plans",
    label: "الخطط",
    min: 1,
    max: 5,
    createItem: () => ({
      id: newId(),
      name: "خطة جديدة",
      price: "0 ر.س",
      cadence: "/ شهرياً",
      features: ["ميزة أولى", "ميزة ثانية"],
      cta: "اختر",
      highlighted: false,
    }),
    itemTitle: (item) => (item.name as string) || "خطة",
    itemSchema: [
      { kind: "text", key: "name", label: "اسم الخطة" },
      { kind: "text", key: "price", label: "السعر" },
      {
        kind: "text",
        key: "cadence",
        label: "التكرار",
        placeholder: "/ شهرياً (اختياري)",
      },
      { kind: "text", key: "cta", label: "نص الزر" },
      {
        kind: "select",
        key: "highlighted",
        label: "إبراز هذه الخطة",
        options: [
          { value: "false", label: "لا" },
          { value: "true", label: "نعم" },
        ],
      },
    ],
  },
];
