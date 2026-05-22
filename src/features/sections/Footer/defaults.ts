import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createFooter(): Section {
  return {
    id: newId(),
    type: "footer",
    props: {
      brand: {
        text: "Your Brand",
        tagline: "Small batch coffee, since 2024.",
      },
      columns: [
        {
          id: newId(),
          title: "Shop",
          links: [
            { label: "Menu", href: "#menu" },
            { label: "Beans", href: "#beans" },
            { label: "Gift cards", href: "#gifts" },
          ],
        },
        {
          id: newId(),
          title: "Company",
          links: [
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
            { label: "Careers", href: "#careers" },
          ],
        },
      ],
      socials: [
        { id: newId(), platform: "instagram", href: "https://instagram.com/" },
        { id: newId(), platform: "whatsapp", href: "https://wa.me/" },
      ],
      copyright: "© 2026 Your Brand. All rights reserved.",
    },
  };
}
