import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createCTA(): Section {
  return {
    id: newId(),
    type: "cta",
    props: {
      title: "Ready to order?",
      description:
        "Sign up today and get your first drink half-price. No catch, no hidden fees.",
      button: { label: "Get the deal", href: "#signup" },
      style: "solid",
    },
  };
}
