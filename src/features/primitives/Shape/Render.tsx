import type { ShapePrimitiveProps } from "../types";
import { getShape } from "./library";

/**
 * Shape primitive — picks an SVG path from the curated library and
 * fills it with `fillColor`. Strokes with `borderColor` when
 * `borderWidth > 0`. The SVG stretches to fill the wrapper box edge-
 * to-edge so the shape always matches the primitive's geometry.
 */
export default function ShapeRender({
  props,
}: {
  props: ShapePrimitiveProps;
}) {
  const def = getShape(props.kind);
  const stroked = props.borderWidth > 0;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio={def.stretch ? "none" : "xMidYMid meet"}
      className="block h-full w-full"
    >
      <path
        d={def.path}
        fill={props.fillColor}
        stroke={stroked ? props.borderColor : "none"}
        strokeWidth={stroked ? props.borderWidth : 0}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
