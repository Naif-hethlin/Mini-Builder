import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createContact(): Section {
  return {
    id: newId(),
    type: "contact",
    props: {
      title: "تواصل معنا",
      subtitle: "نسعد بسماع آرائكم واستفساراتكم",
      email: "hello@example.com",
      phone: "+966 50 000 0000",
      address: "الرياض، المملكة العربية السعودية",
    },
  };
}
