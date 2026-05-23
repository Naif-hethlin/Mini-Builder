/**
 * Primitives are free-form atomic elements that live inside a Canvas section.
 * Unlike preset sections (Hero, Features, …), primitives carry their own
 * absolute position (x/y) and width within the canvas — this is where the
 * Figma-style "drop anywhere" freedom comes from.
 *
 * Mobile fallback: primitives stack vertically in source order — see
 * CanvasSection/Render.tsx.
 */

// ----- Action model (used by Button + clickable Image for E5 linking) ----

export type PrimitiveAction =
  | { kind: "none" }
  | { kind: "link"; href: string }
  | { kind: "navigate"; pageSlug: string }
  | { kind: "scroll"; sectionId: string };

// ----- Per-primitive prop types ------------------------------------------

export type TextPrimitiveProps = {
  content: string;
  fontSize: number; // px (12 – 64 sensible range)
  weight: "regular" | "medium" | "semibold" | "bold";
  color: string; // any css color
  align: "start" | "center" | "end";
};

export type HeadingPrimitiveProps = {
  content: string;
  level: 1 | 2 | 3 | 4;
  color: string;
  align: "start" | "center" | "end";
};

export type ButtonPrimitiveProps = {
  label: string;
  variant: "solid" | "outline" | "ghost";
  size: "sm" | "md" | "lg";
  action: PrimitiveAction;
};

export type ImagePrimitiveProps = {
  url: string;
  alt: string;
  fit: "cover" | "contain";
  rounded: boolean;
  action: PrimitiveAction; // images can be linked too
};

export type ListPrimitiveProps = {
  items: Array<{ id: string; text: string }>;
  style: "bullet" | "number" | "check";
  fontSize: number;
  color: string;
};

export type ShapePrimitiveProps = {
  /** Shape kind — see Shape/library.ts for the full set. Stored as string
   *  so the library can grow without forcing consumers to update. */
  kind: string;
  fillColor: string;
  borderColor: string;
  borderWidth: number;
};

export type InputPrimitiveProps = {
  label: string;
  placeholder: string;
  required: boolean;
  fieldType: "text" | "email" | "tel" | "number" | "textarea";
};

export type QAPrimitiveProps = {
  question: string;
  answer: string;
  defaultOpen: boolean;
};

export type IconPrimitiveProps = {
  /** Icon name in the curated library — see Icon/library.ts. */
  name: string;
  color: string;
  strokeWidth: number;
};

// ----- Discriminated union -----------------------------------------------

type Geometry = {
  x: number;
  y: number;
  w: number;
  h?: number; // images + shapes use it; text/heading/button/list height auto
};

export type Primitive = Geometry &
  (
    | { id: string; type: "text"; props: TextPrimitiveProps }
    | { id: string; type: "heading"; props: HeadingPrimitiveProps }
    | { id: string; type: "button"; props: ButtonPrimitiveProps }
    | { id: string; type: "image"; props: ImagePrimitiveProps }
    | { id: string; type: "list"; props: ListPrimitiveProps }
    | { id: string; type: "shape"; props: ShapePrimitiveProps }
    | { id: string; type: "icon"; props: IconPrimitiveProps }
    | { id: string; type: "input"; props: InputPrimitiveProps }
    | { id: string; type: "qa"; props: QAPrimitiveProps }
  );

export type PrimitiveType = Primitive["type"];
