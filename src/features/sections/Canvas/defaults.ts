import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";

export function createCanvas(): Section {
  return {
    id: newId(),
    type: "canvas",
    props: {
      height: 480,
      background: "white",
      primitives: [],
    },
  };
}
