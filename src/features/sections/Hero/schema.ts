import type { FieldSchema } from "../schema/types";

export const heroSchema: FieldSchema[] = [
  { kind: "text", key: "eyebrow", label: "النص العلوي", placeholder: "اختياري" },
  { kind: "text", key: "title", label: "العنوان الرئيسي" },
  { kind: "textarea", key: "subtitle", label: "العنوان الفرعي", rows: 3 },
  { kind: "image-url", key: "imageUrl", label: "رابط الصورة" },
  { kind: "toggleable-link", key: "primaryButton", label: "الزر الأساسي" },
  { kind: "toggleable-link", key: "secondaryButton", label: "الزر الثانوي" },
  {
    kind: "select",
    key: "layout",
    label: "التخطيط",
    options: [
      { value: "image-right", label: "الصورة يمين" },
      { value: "image-left", label: "الصورة يسار" },
      { value: "image-bg", label: "الصورة كخلفية" },
      { value: "no-image", label: "بدون صورة" },
    ],
  },
  {
    kind: "select",
    key: "alignment",
    label: "محاذاة النص",
    options: [
      { value: "left", label: "يسار" },
      { value: "center", label: "وسط" },
    ],
  },
];
