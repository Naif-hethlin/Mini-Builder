import { newId } from "@/shared/lib/id";
import type { Primitive, PrimitiveType } from "./types";

/**
 * Builds a fresh primitive of the given type with sensible defaults.
 * Called from the canvas "add primitive" floating toolbar.
 */
export function createPrimitive(type: PrimitiveType): Primitive {
  switch (type) {
    case "text":
      return {
        id: newId(),
        type: "text",
        x: 40,
        y: 40,
        w: 280,
        props: {
          content: "نص جديد. اضغط للتعديل.",
          fontSize: 16,
          weight: "regular",
          color: "#1c1917",
          align: "start",
        },
      };
    case "heading":
      return {
        id: newId(),
        type: "heading",
        x: 40,
        y: 40,
        w: 360,
        props: {
          content: "عنوان جديد",
          level: 1,
          color: "#1c1917",
          align: "start",
        },
      };
    case "button":
      return {
        id: newId(),
        type: "button",
        x: 40,
        y: 40,
        w: 160,
        props: {
          label: "اضغط هنا",
          variant: "solid",
          size: "md",
          action: { kind: "none" },
        },
      };
    case "image":
      return {
        id: newId(),
        type: "image",
        x: 40,
        y: 40,
        w: 320,
        h: 200,
        props: {
          url: "",
          alt: "صورة",
          fit: "cover",
          rounded: true,
          action: { kind: "none" },
        },
      };
    case "list":
      return {
        id: newId(),
        type: "list",
        x: 40,
        y: 40,
        w: 320,
        props: {
          items: [
            { id: newId(), text: "عنصر أول" },
            { id: newId(), text: "عنصر ثانٍ" },
            { id: newId(), text: "عنصر ثالث" },
          ],
          style: "bullet",
          fontSize: 16,
          color: "#1c1917",
        },
      };
    case "shape":
      return {
        id: newId(),
        type: "shape",
        x: 40,
        y: 40,
        w: 140,
        h: 140,
        props: {
          kind: "circle",
          fillColor: "#e85d5d",
          borderColor: "#1c1917",
          borderWidth: 0,
        },
      };
    case "icon":
      return {
        id: newId(),
        type: "icon",
        x: 40,
        y: 40,
        w: 64,
        h: 64,
        props: {
          name: "lucide:sparkles",
          color: "#e85d5d",
          strokeWidth: 2,
        },
      };
    case "input":
      return {
        id: newId(),
        type: "input",
        x: 40,
        y: 40,
        w: 320,
        props: {
          label: "الاسم",
          placeholder: "اكتب اسمك هنا…",
          required: false,
          fieldType: "text",
        },
      };
    case "qa":
      return {
        id: newId(),
        type: "qa",
        x: 40,
        y: 40,
        w: 360,
        props: {
          question: "سؤال جديد؟",
          answer: "الإجابة هنا.",
          defaultOpen: false,
        },
      };
  }
}
