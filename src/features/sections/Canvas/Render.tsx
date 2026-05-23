import { PrimitiveRenderer } from "@/features/primitives/PrimitiveRenderer";
import { PrimitiveActionWrapper } from "@/features/primitives/PrimitiveActionWrapper";
import type { CanvasProps } from "@/features/builder/state/types";

const BG_CLASS: Record<CanvasProps["background"], string> = {
  transparent: "",
  white: "bg-white",
  stone: "bg-stone-50",
  peach: "bg-tint-peach",
  mint: "bg-tint-mint",
};

/**
 * Renders a Canvas section. Desktop: absolute-positioned primitives at the
 * height set on the section. Mobile: same primitives but flow-stacked
 * vertically (the canvas height is ignored — natural content height).
 *
 * Each primitive is wrapped in PrimitiveActionWrapper so its
 * `primitive.action` (navigate / scroll / link / payment / booking)
 * fires on click in the runtime (/preview, /sites). No-action primitives
 * pass through unchanged.
 *
 * IMPORTANT: the desktop frame is constrained to CANVAS_DESIGN_WIDTH
 * (1280px) and centered. The builder positions primitives inside a
 * 1280px-wide canvas, so their `left: 80px` etc. is measured from the
 * left edge of THAT box. If we let the runtime canvas stretch to full
 * viewport, the same coordinates land flush-left on a 1920px screen —
 * the form drifts off-center, the heading still looks centered (it's
 * positioned at x = (1280 - w)/2), and the whole composition reads
 * "broken." Same width here = same layout there.
 */
const CANVAS_DESIGN_WIDTH = 1280;

export default function CanvasRender({ props }: { props: CanvasProps }) {
  return (
    <section className={`relative ${BG_CLASS[props.background]}`}>
      {/* Mobile flow-fallback */}
      <div className="flex flex-col gap-4 p-6 md:hidden">
        {props.primitives.map((p) => (
          <PrimitiveActionWrapper key={p.id} action={p.action}>
            <PrimitiveRenderer primitive={p} positioned={false} />
          </PrimitiveActionWrapper>
        ))}
      </div>

      {/* Desktop absolute — centered 1280px box matches the builder canvas
          width so absolute coordinates land where the user placed them. */}
      <div
        className="relative mx-auto hidden overflow-hidden md:block"
        style={{ height: props.height, maxWidth: CANVAS_DESIGN_WIDTH }}
      >
        {props.primitives.map((p) => (
          <PrimitiveActionWrapper key={p.id} action={p.action}>
            <PrimitiveRenderer primitive={p} positioned={true} />
          </PrimitiveActionWrapper>
        ))}
      </div>
    </section>
  );
}
