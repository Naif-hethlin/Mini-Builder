import { Sparkles } from "lucide-react";

/**
 * Placeholder block used by each dashboard sub-page until Phase 16 ships
 * the real content (analytics cards, customers list, settings, etc.).
 */
export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <Sparkles size={20} />
        </div>
        <p className="mb-1.5 text-xs font-medium text-brand">قريبًا</p>
        <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
          {description}
        </p>
      </div>
    </div>
  );
}
