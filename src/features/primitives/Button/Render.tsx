"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ButtonPrimitiveProps } from "../types";

const VARIANT_CLASS: Record<ButtonPrimitiveProps["variant"], string> = {
  solid: "bg-brand text-white hover:bg-brand-dark",
  outline:
    "border-2 border-brand text-brand bg-transparent hover:bg-brand hover:text-white",
  ghost: "text-brand bg-transparent hover:bg-brand-light/50",
};

const SIZE_CLASS: Record<ButtonPrimitiveProps["size"], string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

/**
 * Button primitive — supports E5 action linking (none / link / navigate /
 * scroll). Navigation hits Next.js router for client-side transitions.
 */
export default function ButtonRender({
  props,
}: {
  props: ButtonPrimitiveProps;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const a = props.action;
    if (!a || a.kind === "none") return;
    if (a.kind === "link") {
      if (a.href) window.open(a.href, "_blank");
      return;
    }
    if (a.kind === "scroll") {
      const el =
        typeof document !== "undefined"
          ? document.getElementById(a.sectionId)
          : null;
      el?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (a.kind === "navigate") {
      // Detect whether we're inside a builder route — if so, swap ?page=
      // search param instead of navigating away. In preview/published the
      // path is /preview/[id]/[slug] so we route there.
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const builderMatch = path.match(/^\/builder\/([^/]+)/);
        const previewMatch = path.match(/^\/preview\/([^/]+)/);
        if (builderMatch) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", a.pageSlug);
          router.replace(`/builder/${builderMatch[1]}?${params.toString()}`);
          return;
        }
        if (previewMatch) {
          router.push(`/preview/${previewMatch[1]}/${a.pageSlug}`);
          return;
        }
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full font-medium shadow-sm transition-colors ${VARIANT_CLASS[props.variant]} ${SIZE_CLASS[props.size]}`}
    >
      {props.label}
    </button>
  );
}
