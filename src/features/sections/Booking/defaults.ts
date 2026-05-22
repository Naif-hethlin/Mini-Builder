import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createBooking(): Section {
  return {
    id: newId(),
    type: "booking",
    props: {
      title: "احجز موعدك",
      subtitle: "اختر الوقت المناسب وسنحضّر كل شيء.",
      staff: [
        { id: newId(), name: "أحمد" },
        { id: newId(), name: "سالم" },
      ],
      slots: [
        "10:00",
        "11:00",
        "12:00",
        "14:00",
        "16:00",
        "18:00",
        "20:00",
      ],
      buttonLabel: "تأكيد الحجز",
    },
  };
}
