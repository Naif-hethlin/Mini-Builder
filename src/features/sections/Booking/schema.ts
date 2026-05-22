import { newId } from "@/shared/lib/id";
import type { FieldSchema } from "../schema/types";

export const bookingSchema: FieldSchema[] = [
  { kind: "text", key: "title", label: "العنوان" },
  { kind: "textarea", key: "subtitle", label: "العنوان الفرعي", rows: 2 },
  { kind: "text", key: "buttonLabel", label: "نص زر التأكيد" },
  {
    kind: "list",
    key: "staff",
    label: "الموظفون",
    max: 12,
    createItem: () => ({ id: newId(), name: "اسم الموظف" }),
    itemTitle: (item) => (item.name as string) || "موظف",
    itemSchema: [{ kind: "text", key: "name", label: "الاسم" }],
  },
  // slots: a flat string[] — handled by storing it as a list of {value} pairs
  // would be heavier than worth; users can edit it via JSON export/import for now.
  // A dedicated "string-list" field type can land later.
];
