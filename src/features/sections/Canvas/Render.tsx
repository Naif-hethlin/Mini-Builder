"use client";

import type { CSSProperties } from "react";
import { PrimitiveRenderer } from "@/features/primitives/PrimitiveRenderer";
import { PrimitiveActionWrapper } from "@/features/primitives/PrimitiveActionWrapper";
import {
  CANVAS_DESIGN_WIDTH,
  useFitScale,
} from "@/features/builder/canvas/useFitScale";
import type { CanvasProps } from "@/features/builder/state/types";
import type { Primitive } from "@/features/primitives/types";

const BG_CLASS: Record<CanvasProps["background"], string> = {
  transparent: "",
  white: "bg-white",
  stone: "bg-stone-50",
  peach: "bg-tint-peach",
  mint: "bg-tint-mint",
};

/**
 * Renders a Canvas section. The canvas is designed at 1280px; on every
 * viewport narrower than that (tablet, in-browser preview windows, etc.)
 * we proportionally scale the WHOLE composition down to fit instead of
 * letting absolute-positioned primitives clip off the right edge.
 *
 * Mobile (`<md`) bypasses the absolute layer entirely and uses the
 * flow-stack fallback — at phone widths the proportional shrink would
 * make text unreadable, so we just stack the primitives vertically.
 *
 * Each primitive is wrapped in PrimitiveActionWrapper so its
 * `primitive.action` (navigate / scroll / link / payment / booking)
 * fires on click in the runtime.
 */
export default function CanvasRender({ props }: { props: CanvasProps }) {
  return (
    <section className={`relative ${BG_CLASS[props.background]}`}>
      {/* Mobile flow-fallback. Each primitive gets a per-item slot
          styled to its DESIGN width (clamped to 100% of the column)
          plus its aspect ratio — so a 100px icon stays 100px on a
          375px phone instead of stretching to fill the whole column,
          while images/shapes shrink proportionally without distortion. */}
      <div className="flex flex-col items-center gap-4 p-6 md:hidden">
        {props.primitives.map((p) => (
          <PrimitiveActionWrapper key={p.id} action={p.action}>
            <div style={flowSlotStyle(p)}>
              <PrimitiveRenderer primitive={p} positioned={false} />
            </div>
          </PrimitiveActionWrapper>
        ))}
      </div>

      {/* Desktop absolute, scaled to fit container width */}
      <div className="hidden md:block">
        <ScaledCanvas height={props.height}>
          {props.primitives.map((p) => (
            <PrimitiveActionWrapper key={p.id} action={p.action}>
              <PrimitiveRenderer primitive={p} positioned={true} />
            </PrimitiveActionWrapper>
          ))}
        </ScaledCanvas>
      </div>
    </section>
  );
}

/**
 * Slot style for a primitive inside the mobile flow stack:
 *   - width: min(100%, designW)  → 100px icon stays 100px; 600px
 *     image clamps to phone width.
 *   - aspectRatio when h is known → width-clamped shapes/images/icons
 *     keep proportions instead of collapsing to a thin sliver.
 *
 * Text/heading primitives have no fixed h and want to flow to natural
 * content height, so we skip aspect-ratio for them.
 */
function flowSlotStyle(p: Primitive): CSSProperties {
  const flexHeight = p.type === "text" || p.type === "heading";
  return {
    width: `min(100%, ${p.w}px)`,
    ...(p.h !== undefined && !flexHeight
      ? { aspectRatio: `${p.w} / ${p.h}` }
      : {}),
  };
}

function ScaledCanvas({
  height,
  children,
}: {
  height: number;
  children: React.ReactNode;
}) {
  const { containerRef, scale } = useFitScale(CANVAS_DESIGN_WIDTH);
  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full overflow-hidden"
      // Outer height = SCALED design height. If we left it at the design
      // height, a shrunk canvas would leave a giant empty band below.
      style={{ height: height * scale, maxWidth: CANVAS_DESIGN_WIDTH }}
    >
      <div
        className="absolute top-0 right-0"
        style={{
          width: CANVAS_DESIGN_WIDTH,
          height,
          transform: `scale(${scale})`,
          // RTL anchor: scale toward the start edge (right in RTL) so the
          // composition's logical top-left stays at the visual corner.
          transformOrigin: "top right",
        }}
      >
        {children}
      </div>
    </div>
  );
}
