import { PrimitiveRenderer } from "@/features/primitives/PrimitiveRenderer";
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
 */
export default function CanvasRender({ props }: { props: CanvasProps }) {
  return (
    <section className={`relative ${BG_CLASS[props.background]}`}>
      {/* Mobile flow-fallback */}
      <div className="flex flex-col gap-4 p-6 md:hidden">
        {props.primitives.map((p) => (
          <PrimitiveRenderer key={p.id} primitive={p} positioned={false} />
        ))}
      </div>

      {/* Desktop absolute */}
      <div
        className="relative hidden overflow-hidden md:block"
        style={{ height: props.height }}
      >
        {props.primitives.map((p) => (
          <PrimitiveRenderer key={p.id} primitive={p} positioned={true} />
        ))}
      </div>
    </section>
  );
}
