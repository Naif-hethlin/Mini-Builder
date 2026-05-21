"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/cn";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmOptions & {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Esc to dismiss + focus the confirm button on open
  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <AnimatePresence>
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.button
        type="button"
        aria-label={cancelLabel}
        onClick={onCancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-stone-200 bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="إغلاق"
          className="absolute top-3 end-3 flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
        >
          <X size={14} />
        </button>

        <div className="p-6">
          <div className="mb-4 flex items-start gap-3">
            {danger && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={18} />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-base font-semibold text-stone-900">
                {title}
              </h2>
              {description && (
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              ref={confirmRef}
              onClick={onConfirm}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors",
                danger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-brand hover:bg-brand-dark",
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
    </AnimatePresence>
  );
}
