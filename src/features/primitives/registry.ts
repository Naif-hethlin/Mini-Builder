import {
  Circle,
  Image as ImageIcon,
  List as ListIcon,
  MousePointerClick,
  Smile,
  Square,
  Triangle,
  Type,
  TypeOutline,
  type LucideIcon,
} from "lucide-react";
import type { PrimitiveType } from "./types";

/**
 * Sidebar metadata for each primitive tile. Most primitives are 1:1 with a
 * `PrimitiveType`, but some types (e.g. "shape") expose multiple tiles
 * (circle / square / triangle) that share the same underlying primitive
 * and differ only in their default props. `id` disambiguates those
 * variants; `propsOverride` is applied after the factory's defaults.
 */
export type PrimitivePresetMeta = {
  /** Unique tile id — used as the React key and the discriminator when
   *  multiple tiles share a primitive type. Falls back to `type` when not
   *  set explicitly. */
  id: string;
  type: PrimitiveType;
  label: string;
  Icon: LucideIcon;
  /** Optional override merged into the primitive's props at creation time.
   *  Lets two tiles of the same `type` produce different starter content. */
  propsOverride?: Record<string, unknown>;
};

export const PRIMITIVE_PRESETS: PrimitivePresetMeta[] = [
  { id: "heading", type: "heading", label: "عنوان", Icon: TypeOutline },
  { id: "text", type: "text", label: "نص", Icon: Type },
  { id: "button", type: "button", label: "زر", Icon: MousePointerClick },
  { id: "image", type: "image", label: "صورة", Icon: ImageIcon },
  { id: "list", type: "list", label: "قائمة", Icon: ListIcon },
  {
    id: "shape-circle",
    type: "shape",
    label: "دائرة",
    Icon: Circle,
    propsOverride: { kind: "circle" },
  },
  {
    id: "shape-square",
    type: "shape",
    label: "مربع",
    Icon: Square,
    propsOverride: { kind: "square" },
  },
  {
    id: "shape-triangle",
    type: "shape",
    label: "مثلث",
    Icon: Triangle,
    propsOverride: { kind: "triangle" },
  },
  { id: "icon", type: "icon", label: "أيقونة", Icon: Smile },
];
