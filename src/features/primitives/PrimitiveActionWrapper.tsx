"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import type { PrimitiveAction } from "./types";

/**
 * Wraps a runtime primitive in a click handler that fires its
 * `primitive.action`. Used by Canvas section runtime renders + the
 * SectionRenderer dispatch, so any element (text / image / shape / icon
 * / list / qa / button / input) can be made interactive.
 *
 * In the builder this wrapper is NOT used — the builder's CanvasEditor
 * uses its own drag/select handlers that would conflict.
 */
export function PrimitiveActionWrapper({
  action,
  children,
  style,
}: {
  action?: PrimitiveAction;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!action || action.kind === "none") {
    return style ? <div style={style}>{children}</div> : <>{children}</>;
  }

  const run = () => {
    switch (action.kind) {
      case "link":
        if (action.href) window.open(action.href, "_blank", "noopener");
        return;
      case "payment":
        if (action.url) window.open(action.url, "_blank", "noopener");
        return;
      case "scroll": {
        const el = document.getElementById(action.sectionId);
        el?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      case "booking": {
        // Look for the first booking section's wrapper.
        const el = document.querySelector('[data-section-type="booking"]');
        el?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      case "navigate": {
        if (typeof window === "undefined") return;
        const path = window.location.pathname;
        const previewMatch = path.match(/^\/preview\/([^/]+)/);
        const sitesMatch = path.match(/^\/sites\/([^/]+)/);
        const builderMatch = path.match(/^\/builder\/([^/]+)/);
        if (previewMatch) {
          router.push(`/preview/${previewMatch[1]}/${action.pageSlug}`);
        } else if (sitesMatch) {
          router.push(`/sites/${sitesMatch[1]}/${action.pageSlug}`);
        } else if (builderMatch) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", action.pageSlug);
          router.replace(`/builder/${builderMatch[1]}?${params.toString()}`);
        }
        return;
      }
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        run();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          run();
        }
      }}
      role="link"
      tabIndex={0}
      className="cursor-pointer"
      style={style}
    >
      {children}
    </div>
  );
}
