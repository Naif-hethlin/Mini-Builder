"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Watches an element's width and returns a `scale` factor that fits the
 * design-width into it. Use the returned ref on the OUTER container and
 * apply `transform: scale(scale)` to a fixed-width INNER element.
 *
 * Pattern:
 *
 *   const { containerRef, scale } = useFitScale(1280);
 *   <div ref={containerRef} className="w-full" style={{ height: designH * scale }}>
 *     <div style={{ width: 1280, height: designH,
 *                   transform: `scale(${scale})`,
 *                   transformOrigin: "top right" }}>
 *       {content}
 *     </div>
 *   </div>
 *
 * `transformOrigin: top right` is the RTL-correct anchor: the canvas
 * scales toward the start edge of the page (which in RTL is the right),
 * so the layout's "logical top-left" stays put.
 */
export function useFitScale(designWidth: number): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      // Cap at 1 — don't UPSCALE small designs on big screens, that would
      // blow text and images up past their intended size.
      setScale(Math.min(1, w / designWidth));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);

  return { containerRef, scale };
}

export const CANVAS_DESIGN_WIDTH = 1280;
