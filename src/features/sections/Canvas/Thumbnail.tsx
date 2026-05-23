import { newId } from "@/shared/lib/id";
import type { Section } from "@/features/builder/state/types";
import { SectionThumbnail } from "../SectionThumbnail";

// Seed a sample canvas with a few primitives so the thumbnail conveys
// "this is a free-form space with anything inside" — an empty canvas
// would just render as a blank tile.
const SAMPLE: Section = {
  id: newId(),
  type: "canvas",
  props: {
    height: 420,
    background: "white",
    primitives: [
      {
        id: newId(),
        type: "heading",
        x: 60,
        y: 60,
        w: 520,
        props: {
          content: "بناء حر",
          level: 1,
          color: "#1c1917",
          align: "start",
          weight: "bold",
          tracking: "tight",
        },
      },
      {
        id: newId(),
        type: "text",
        x: 60,
        y: 140,
        w: 520,
        props: {
          content: "اسحب وأفلت أي عنصر بحرية كاملة.",
          fontSize: 18,
          weight: "regular",
          color: "#57534e",
          align: "start",
        },
      },
      {
        id: newId(),
        type: "shape",
        x: 700,
        y: 60,
        w: 280,
        h: 280,
        props: {
          kind: "blob",
          fillColor: "#e85d5d",
          borderColor: "#000000",
          borderWidth: 0,
        },
      },
      {
        id: newId(),
        type: "button",
        x: 60,
        y: 240,
        w: 200,
        props: {
          label: "ابدأ الآن",
          variant: "solid",
          size: "md",
          action: { kind: "none" },
          bgColor: "#1c1917",
          textColor: "#ffffff",
        },
      },
    ],
  },
};

export default function CanvasThumbnail() {
  return <SectionThumbnail section={SAMPLE} />;
}
