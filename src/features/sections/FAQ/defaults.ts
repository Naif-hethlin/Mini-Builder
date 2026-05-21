import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createFAQ(): Section {
  return {
    id: newId(),
    type: "faq",
    props: {
      title: "الأسئلة الشائعة",
      subtitle: "كل ما تريد معرفته قبل أن تبدأ",
      items: [
        {
          id: newId(),
          question: "كم تستغرق عملية إنشاء الموقع؟",
          answer: "أقل من 5 دقائق. اختر قالبًا، عدّل المحتوى، وانطلق.",
        },
        {
          id: newId(),
          question: "هل أحتاج لخبرة برمجية؟",
          answer: "لا، المنصة مصممة بالكامل بنظام السحب والإفلات.",
        },
        {
          id: newId(),
          question: "هل أقدر أربط نطاقي الخاص؟",
          answer: "نعم، تقدر تربط النطاق من إعدادات المشروع.",
        },
        {
          id: newId(),
          question: "هل يمكنني تصدير الموقع؟",
          answer: "حمّل تصميمك كملف JSON واستورده في أي وقت.",
        },
      ],
    },
  };
}
