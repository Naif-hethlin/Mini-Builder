import { newId } from "@/shared/lib/id";
import type { FieldSchema } from "../schema/types";

export const faqSchema: FieldSchema[] = [
  { kind: "text", key: "title", label: "العنوان" },
  { kind: "textarea", key: "subtitle", label: "العنوان الفرعي", rows: 2 },
  {
    kind: "list",
    key: "items",
    label: "الأسئلة",
    min: 1,
    max: 20,
    createItem: () => ({
      id: newId(),
      question: "سؤال جديد",
      answer: "إجابة قصيرة وواضحة.",
    }),
    itemTitle: (item) => (item.question as string) || "سؤال",
    itemSchema: [
      { kind: "text", key: "question", label: "السؤال" },
      { kind: "textarea", key: "answer", label: "الإجابة", rows: 3 },
    ],
  },
];
