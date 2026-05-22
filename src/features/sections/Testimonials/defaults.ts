import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createTestimonials(): Section {
  return {
    id: newId(),
    type: "testimonials",
    props: {
      title: "آراء عملائنا",
      subtitle: "ماذا قالوا عنا",
      columns: 3,
      items: [
        {
          id: newId(),
          name: "نورة العمري",
          role: "صاحبة مقهى",
          quote: "خدمة سريعة ومنصة سهلة. صممت موقعي في أقل من ساعة!",
          rating: 5,
        },
        {
          id: newId(),
          name: "خالد الزهراني",
          role: "حلاق",
          quote: "نظام الحجوزات وفر علي وقت كبير. عملائي صاروا يحجزون بدون مشاكل.",
          rating: 5,
        },
        {
          id: newId(),
          name: "ريم القحطاني",
          role: "مصورة",
          quote: "أقدر أعرض أعمالي بسهولة وأي تعديل يطلع مباشرة.",
          rating: 4,
        },
      ],
    },
  };
}
