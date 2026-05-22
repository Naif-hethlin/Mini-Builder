"use client";

import { AlertOctagon, RefreshCw } from "lucide-react";

/**
 * Shared error-state card used by every Next 16 `error.tsx` segment.
 * Receives the route segment's `unstable_retry` callback so the user can
 * try the same render path again without a full page reload.
 */
export function ErrorCard({
  title = "حدث خطأ غير متوقع",
  description = "أعد المحاولة، وإن استمر الخطأ، عاود تحميل الصفحة.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertOctagon size={22} />
        </div>
        <h2 className="text-base font-semibold text-stone-900">{title}</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-500">
          {description}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-dark"
          >
            <RefreshCw size={14} />
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
}
