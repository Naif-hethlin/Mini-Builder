import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Standardized "nothing to show yet" block. Use everywhere a list / table /
 * canvas can be empty so the empty state guides the next action instead of
 * leaving a blank.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  dashed = true,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  dashed?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl bg-white p-10 text-center",
        dashed
          ? "border-2 border-dashed border-stone-200"
          : "border border-stone-200 shadow-sm",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-stone-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
