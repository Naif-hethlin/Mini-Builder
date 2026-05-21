"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * IconButton — square button with an icon, an accessibility label, and a tooltip.
 *
 * Used everywhere in the toolbar + hover toolbars. Three style variants:
 *   - "default": neutral, hover gray
 *   - "primary": filled brand color (for Publish-style CTAs)
 *
 * `active` is the toggled state (e.g. selected device mode in the toolbar).
 */
type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  /** Used as both `aria-label` (for screen readers) AND `title` (for tooltip). */
  label: string;
  variant?: "default" | "primary";
  active?: boolean;
};

export function IconButton({
  icon,
  label,
  variant = "default",
  active = false,
  className,
  ...rest
}: IconButtonProps) {
  const base =
    "inline-flex items-center justify-center h-9 w-9 rounded-md text-sm transition-colors " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 " +
    "disabled:opacity-40 disabled:cursor-not-allowed";

  const variants: Record<typeof variant, string> = {
    default: active
      ? "bg-stone-200 text-stone-900"
      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
    primary: "bg-brand text-white hover:bg-brand-dark",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(base, variants[variant], className)}
      {...rest}
    >
      {icon}
    </button>
  );
}
