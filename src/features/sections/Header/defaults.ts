import { newId } from "@/shared/lib/id";
import type { Section } from "@/app/web-builder/_back/types";

/** Fresh Header section with sensible starter content. */
export function createHeader(): Section {
  return {
    id: newId(),
    type: "header",
    props: {
      brand: { label: "Your Brand", href: "/" },
      links: [
        { label: "Home", href: "#home" },
        { label: "Menu", href: "#menu" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
      ],
      ctaButton: { label: "Get Started", href: "#start", show: true },
    },
  };
}
