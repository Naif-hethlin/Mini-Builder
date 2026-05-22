"use client";

import { Icon } from "@iconify/react";
import type { IconPrimitiveProps } from "../types";
import { normalizeIconName } from "./library";

/**
 * Icon primitive renderer — uses Iconify's <Icon /> which streams the SVG
 * from the Iconify CDN on first use and caches it locally. Supports any
 * icon in any collection — `<prefix>:<name>` e.g. `mdi:home`,
 * `lucide:sparkles`, `ph:rocket-fill`.
 *
 * Stroke width: Iconify icons are mostly fill-based but Lucide / Phosphor /
 * Heroicons-outline expose stroke. We pass it via the inline style so it
 * applies wherever supported (no-op for fill-only icons).
 */
export default function IconRender({
  props,
}: {
  props: IconPrimitiveProps;
}) {
  const name = normalizeIconName(props.name);
  return (
    <Icon
      icon={name}
      className="h-full w-full"
      style={{ color: props.color, strokeWidth: props.strokeWidth }}
    />
  );
}
