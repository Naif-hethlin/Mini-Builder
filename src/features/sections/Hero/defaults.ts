import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createHero(): Section {
  return {
    id: newId(),
    type: "hero",
    props: {
      eyebrow: "Now open in Riyadh",
      title: "Coffee, made the way you like it",
      subtitle:
        "Freshly roasted beans, fast delivery, real smiles. Order online in seconds.",
      imageUrl:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
      primaryButton: { label: "Order now", href: "#order", show: true },
      secondaryButton: { label: "See menu", href: "#menu", show: true },
      layout: "image-right",
      alignment: "left",
    },
  };
}
