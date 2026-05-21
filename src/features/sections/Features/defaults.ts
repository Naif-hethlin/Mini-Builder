import { newId } from "@/shared/lib/id";
import type { Section } from "@/app/web-builder/_back/types";

export function createFeatures(): Section {
  return {
    id: newId(),
    type: "features",
    props: {
      eyebrow: "Why us",
      title: "More than just coffee",
      subtitle: "Three things you'll notice on your very first visit.",
      items: [
        {
          id: newId(),
          icon: "Coffee",
          title: "Fresh daily",
          description: "Roasted in-house every morning at 6 AM sharp.",
        },
        {
          id: newId(),
          icon: "Truck",
          title: "Fast delivery",
          description: "Under 30 minutes anywhere in Riyadh, guaranteed.",
        },
        {
          id: newId(),
          icon: "Heart",
          title: "Real hospitality",
          description: "Free karak on us if your order is ever late.",
        },
      ],
      columns: 3,
    },
  };
}
