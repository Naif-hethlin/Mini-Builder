import type { CSSProperties } from "react";
import type { Primitive } from "./types";
import TextRender from "./Text/Render";
import HeadingRender from "./Heading/Render";
import ButtonRender from "./Button/Render";
import ImageRender from "./Image/Render";
import ListRender from "./List/Render";

/**
 * Renders a Primitive inside a Canvas section.
 *
 * `positioned: true`  → absolute positioning (desktop)
 * `positioned: false` → flow positioning (mobile fallback)
 *
 * Mobile flow-fallback is the documented strategy in ENHANCEMENT.md: at md+
 * primitives keep their (x, y, w) coordinates; below md they stack
 * vertically in source order.
 */
export function PrimitiveRenderer({
  primitive,
  positioned,
}: {
  primitive: Primitive;
  positioned: boolean;
}) {
  // NOTE: `left` (not `insetInlineStart`). The primitive's `x` is captured
  // in viewport-relative pixels (matches `e.clientX`), so it must anchor
  // to the LEFT edge even when the page is RTL. `insetInlineStart` would
  // flip the X axis in RTL and make drags read as inverted.
  const style: CSSProperties = positioned
    ? {
        position: "absolute",
        left: `${primitive.x}px`,
        top: `${primitive.y}px`,
        width: `${primitive.w}px`,
        ...(primitive.h !== undefined ? { height: `${primitive.h}px` } : {}),
      }
    : {};

  switch (primitive.type) {
    case "text":
      return (
        <div style={style}>
          <TextRender props={primitive.props} />
        </div>
      );
    case "heading":
      return (
        <div style={style}>
          <HeadingRender props={primitive.props} />
        </div>
      );
    case "button":
      return (
        <div style={style}>
          <ButtonRender props={primitive.props} />
        </div>
      );
    case "image":
      return (
        <div style={style}>
          <ImageRender props={primitive.props} />
        </div>
      );
    case "list":
      return (
        <div style={style}>
          <ListRender props={primitive.props} />
        </div>
      );
  }
}
