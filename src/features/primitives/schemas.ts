import type { FieldSchema } from "@/features/sections/schema/types";
import { newId } from "@/shared/lib/id";
import type { PrimitiveType } from "./types";

/**
 * Schema-driven form per primitive. The action field is handled separately
 * by the EditPanel (it needs the project's page list to populate the link
 * picker — see PageLinkField in the builder).
 */

const textSchema: FieldSchema[] = [
  { kind: "textarea", key: "content", label: "النص", rows: 3 },
  {
    kind: "select",
    key: "fontSize",
    label: "حجم الخط",
    options: [
      { value: "12", label: "12px" },
      { value: "14", label: "14px" },
      { value: "16", label: "16px" },
      { value: "18", label: "18px" },
      { value: "20", label: "20px" },
      { value: "24", label: "24px" },
      { value: "32", label: "32px" },
      { value: "48", label: "48px" },
    ],
  },
  {
    kind: "select",
    key: "weight",
    label: "الوزن",
    options: [
      { value: "regular", label: "عادي" },
      { value: "medium", label: "متوسط" },
      { value: "semibold", label: "شبه عريض" },
      { value: "bold", label: "عريض" },
    ],
  },
  {
    kind: "select",
    key: "align",
    label: "المحاذاة",
    options: [
      { value: "start", label: "بداية" },
      { value: "center", label: "وسط" },
      { value: "end", label: "نهاية" },
    ],
  },
  { kind: "color", key: "color", label: "اللون" },
];

const headingSchema: FieldSchema[] = [
  { kind: "text", key: "content", label: "النص" },
  {
    kind: "select",
    key: "level",
    label: "المستوى",
    options: [
      { value: "1", label: "H1 — كبير" },
      { value: "2", label: "H2" },
      { value: "3", label: "H3" },
      { value: "4", label: "H4 — صغير" },
    ],
  },
  {
    kind: "select",
    key: "align",
    label: "المحاذاة",
    options: [
      { value: "start", label: "بداية" },
      { value: "center", label: "وسط" },
      { value: "end", label: "نهاية" },
    ],
  },
  { kind: "color", key: "color", label: "اللون" },
];

const buttonSchema: FieldSchema[] = [
  { kind: "text", key: "label", label: "النص" },
  {
    kind: "select",
    key: "variant",
    label: "النوع",
    options: [
      { value: "solid", label: "ممتلئ" },
      { value: "outline", label: "بإطار" },
      { value: "ghost", label: "شفاف" },
    ],
  },
  {
    kind: "select",
    key: "size",
    label: "الحجم",
    options: [
      { value: "sm", label: "صغير" },
      { value: "md", label: "متوسط" },
      { value: "lg", label: "كبير" },
    ],
  },
];

const imageSchema: FieldSchema[] = [
  { kind: "image-url", key: "url", label: "رابط الصورة" },
  { kind: "text", key: "alt", label: "النص البديل" },
  {
    kind: "select",
    key: "fit",
    label: "الملاءمة",
    options: [
      { value: "cover", label: "ملء (cover)" },
      { value: "contain", label: "احتواء (contain)" },
    ],
  },
];

const listSchema: FieldSchema[] = [
  {
    kind: "list",
    key: "items",
    label: "العناصر",
    itemSchema: [{ kind: "text", key: "text", label: "نص العنصر" }],
    createItem: () => ({ id: newId(), text: "عنصر جديد" }),
    itemTitle: (item) =>
      (item.text as string)?.trim().slice(0, 40) || "(فارغ)",
    min: 1,
    max: 30,
  },
  {
    kind: "select",
    key: "style",
    label: "نمط القائمة",
    options: [
      { value: "bullet", label: "نقاط •" },
      { value: "number", label: "أرقام 1.2.3" },
      { value: "check", label: "صح ✓" },
    ],
  },
  {
    kind: "select",
    key: "fontSize",
    label: "حجم الخط",
    options: [
      { value: "12", label: "12px" },
      { value: "14", label: "14px" },
      { value: "16", label: "16px" },
      { value: "18", label: "18px" },
      { value: "20", label: "20px" },
      { value: "24", label: "24px" },
    ],
  },
  { kind: "color", key: "color", label: "اللون" },
];

const shapeSchema: FieldSchema[] = [
  { kind: "shape", key: "kind", label: "الشكل" },
  { kind: "color", key: "fillColor", label: "لون التعبئة" },
  {
    kind: "select",
    key: "borderWidth",
    label: "سُمك الحد",
    options: [
      { value: "0", label: "بدون" },
      { value: "1", label: "1px" },
      { value: "2", label: "2px" },
      { value: "4", label: "4px" },
      { value: "8", label: "8px" },
    ],
  },
  { kind: "color", key: "borderColor", label: "لون الحد" },
];

const inputSchema: FieldSchema[] = [
  { kind: "text", key: "label", label: "النص العلوي (Label)" },
  {
    kind: "text",
    key: "placeholder",
    label: "النص التلميحي (Placeholder)",
  },
  {
    kind: "select",
    key: "fieldType",
    label: "نوع الحقل",
    options: [
      { value: "text", label: "نص" },
      { value: "email", label: "بريد إلكتروني" },
      { value: "tel", label: "رقم جوال" },
      { value: "number", label: "رقم" },
      { value: "textarea", label: "نص طويل" },
    ],
  },
  {
    kind: "select",
    key: "required",
    label: "إلزامي",
    options: [
      { value: "false", label: "لا" },
      { value: "true", label: "نعم" },
    ],
  },
];

const qaSchema: FieldSchema[] = [
  { kind: "text", key: "question", label: "السؤال" },
  { kind: "textarea", key: "answer", label: "الإجابة", rows: 4 },
  {
    kind: "select",
    key: "defaultOpen",
    label: "مفتوح افتراضياً",
    options: [
      { value: "false", label: "مغلق" },
      { value: "true", label: "مفتوح" },
    ],
  },
];

const iconSchema: FieldSchema[] = [
  { kind: "icon", key: "name", label: "الأيقونة" },
  { kind: "color", key: "color", label: "اللون" },
  {
    kind: "select",
    key: "strokeWidth",
    label: "سُمك الخط",
    options: [
      { value: "1", label: "رفيع" },
      { value: "1.5", label: "متوسط" },
      { value: "2", label: "افتراضي" },
      { value: "2.5", label: "سميك" },
      { value: "3", label: "أكثر سُمكاً" },
    ],
  },
];

export const PRIMITIVE_SCHEMAS: Record<PrimitiveType, FieldSchema[]> = {
  text: textSchema,
  heading: headingSchema,
  button: buttonSchema,
  image: imageSchema,
  list: listSchema,
  shape: shapeSchema,
  icon: iconSchema,
  input: inputSchema,
  qa: qaSchema,
};
