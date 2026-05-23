import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createPricing(): Section {
  return {
    id: newId(),
    type: "pricing",
    props: {
      eyebrow: "الأسعار",
      title: "خطة لكل نشاط",
      subtitle:
        "اختر الخطة المناسبة لحجم عملك — يمكنك التغيير في أي وقت.",
      plans: [
        {
          id: newId(),
          name: "أساسي",
          price: "مجاناً",
          cadence: "",
          features: [
            "موقع من صفحة واحدة",
            "قوالب جاهزة",
            "نطاق فرعي على ركاز",
          ],
          cta: "ابدأ مجاناً",
          highlighted: false,
        },
        {
          id: newId(),
          name: "احترافي",
          price: "99 ر.س",
          cadence: "/ شهرياً",
          features: [
            "مواقع غير محدودة",
            "نطاق مخصص",
            "نظام حجوزات وعملاء",
            "دعم فني سريع",
          ],
          cta: "ابدأ التجربة",
          highlighted: true,
        },
        {
          id: newId(),
          name: "مؤسسات",
          price: "تواصل معنا",
          cadence: "",
          features: [
            "تخصيص كامل للقالب",
            "مدير حساب مخصص",
            "تكاملات API",
            "اتفاقية مستوى خدمة",
          ],
          cta: "تواصل",
          highlighted: false,
        },
      ],
    },
  };
}
