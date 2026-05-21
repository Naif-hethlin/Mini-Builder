import type { FieldSchema } from "../schema/types";

export const headerSchema: FieldSchema[] = [
  {
    kind: "link",
    key: "brand",
    label: "العلامة التجارية",
  },
  {
    kind: "list",
    key: "links",
    label: "روابط التنقل",
    max: 8,
    createItem: () => ({ label: "رابط جديد", href: "#" }),
    itemTitle: (item) => (item.label as string) || "رابط",
    itemSchema: [
      { kind: "text", key: "label", label: "النص" },
      { kind: "url", key: "href", label: "الرابط" },
    ],
  },
  {
    kind: "toggleable-link",
    key: "ctaButton",
    label: "زر الإجراء",
  },
];
