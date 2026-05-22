import type { ShapePrimitiveProps } from "../types";

/**
 * Shape primitive — circle / square / triangle. Sizes to the wrapping
 * geometry (`w` / `h` on the primitive), so the same renderer covers
 * any aspect ratio.
 *
 * Triangle uses inline SVG with `vectorEffect="non-scaling-stroke"` so the
 * stroke width stays consistent regardless of the SVG scale.
 */
export default function ShapeRender({
  props,
}: {
  props: ShapePrimitiveProps;
}) {
  const { kind, fillColor, borderColor, borderWidth } = props;

  if (kind === "circle") {
    return (
      <div
        className="h-full w-full rounded-full"
        style={{
          backgroundColor: fillColor,
          border:
            borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
        }}
      />
    );
  }

  if (kind === "square") {
    return (
      <div
        className="h-full w-full rounded-md"
        style={{
          backgroundColor: fillColor,
          border:
            borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
        }}
      />
    );
  }

  // triangle
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="block h-full w-full"
    >
      <polygon
        points="50,5 95,95 5,95"
        fill={fillColor}
        stroke={borderWidth > 0 ? borderColor : "none"}
        strokeWidth={borderWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
