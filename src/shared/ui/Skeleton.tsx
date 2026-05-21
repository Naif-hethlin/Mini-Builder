import { cn } from "@/shared/lib/cn";

/**
 * Pulsing block used while async data loads. Sized via className.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-stone-200/70",
        className,
      )}
    />
  );
}

/**
 * Skeleton sized to look like a single line of text (h-3, full width).
 */
export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn("h-3 w-full", className)} />;
}
