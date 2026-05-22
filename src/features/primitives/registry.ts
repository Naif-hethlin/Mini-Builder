import {
  Image as ImageIcon,
  MousePointerClick,
  Type,
  TypeOutline,
  type LucideIcon,
} from "lucide-react";
import type { PrimitiveType } from "./types";

/**
 * Sidebar metadata for each primitive type. Mirrors the section registry
 * pattern but for primitives that go inside Canvas sections.
 */
export type PrimitivePresetMeta = {
  type: PrimitiveType;
  label: string;
  Icon: LucideIcon;
};

export const PRIMITIVE_PRESETS: PrimitivePresetMeta[] = [
  { type: "heading", label: "عنوان", Icon: TypeOutline },
  { type: "text", label: "نص", Icon: Type },
  { type: "button", label: "زر", Icon: MousePointerClick },
  { type: "image", label: "صورة", Icon: ImageIcon },
];
