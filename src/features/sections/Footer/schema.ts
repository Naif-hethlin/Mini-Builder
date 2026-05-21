import { newId } from "@/shared/lib/id";
import type { FieldSchema } from "../schema/types";

export const footerSchema: FieldSchema[] = [
  {
    kind: "group",
    key: "brand",
    label: "العلامة التجارية",
    fields: [
      { kind: "text", key: "text", label: "اسم العلامة" },
      { kind: "text", key: "tagline", label: "الشعار / الوصف" },
    ],
  },
  {
    kind: "list",
    key: "columns",
    label: "أعمدة الروابط",
    max: 5,
    createItem: () => ({ id: newId(), title: "عمود", links: [] }),
    itemTitle: (item) => (item.title as string) || "عمود",
    itemSchema: [
      { kind: "text", key: "title", label: "عنوان العمود" },
      {
        kind: "list",
        key: "links",
        label: "الروابط",
        max: 10,
        createItem: () => ({ label: "رابط", href: "#" }),
        itemTitle: (item) => (item.label as string) || "رابط",
        itemSchema: [
          { kind: "text", key: "label", label: "النص" },
          { kind: "url", key: "href", label: "الرابط" },
        ],
      },
    ],
  },
  {
    kind: "list",
    key: "socials",
    label: "الشبكات الاجتماعية",
    max: 6,
    createItem: () => ({ id: newId(), platform: "twitter", href: "" }),
    itemTitle: (item) => (item.platform as string) || "اجتماعي",
    itemSchema: [
      {
        kind: "select",
        key: "platform",
        label: "المنصة",
        options: [
          { value: "twitter", label: "تويتر / X" },
          { value: "instagram", label: "انستقرام" },
          { value: "linkedin", label: "لينكدإن" },
          { value: "whatsapp", label: "واتساب" },
        ],
      },
      { kind: "url", key: "href", label: "الرابط" },
    ],
  },
  { kind: "text", key: "copyright", label: "نص حقوق النشر" },
];
