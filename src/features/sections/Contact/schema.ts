import type { FieldSchema } from "../schema/types";

export const contactSchema: FieldSchema[] = [
  { kind: "text", key: "title", label: "العنوان" },
  { kind: "textarea", key: "subtitle", label: "العنوان الفرعي", rows: 2 },
  { kind: "text", key: "email", label: "البريد الإلكتروني" },
  { kind: "text", key: "phone", label: "رقم الهاتف" },
  { kind: "text", key: "address", label: "العنوان" },
];
