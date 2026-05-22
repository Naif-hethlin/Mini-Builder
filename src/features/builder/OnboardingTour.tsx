"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Hand,
  Keyboard,
  LayoutGrid,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";

const STORAGE_KEY = "rekaz-builder/onboarding/v1";

const STEPS = [
  {
    icon: LayoutGrid,
    title: "اختر قسمًا من المكتبة",
    body: "ابدأ بأي قسم جاهز من اليمين (رأس، بطل، مزايا…) أو أضف لوحة حرّة لتبني من الصفر.",
  },
  {
    icon: Hand,
    title: "اسحب، اضغط، عدّل",
    body: "اسحب الأقسام لإعادة ترتيبها، واضغط على أي قسم ليفتح إعداداته على اليسار. داخل اللوحة الحرّة، الأزرار والنصوص والصور تتحرك بحرية.",
  },
  {
    icon: Keyboard,
    title: "اختصارات سريعة",
    body: "⌘+Z تراجع · ⌘+D تكرار · Del حذف · أسهم لتحريك الأقسام والعناصر. ضغط Esc يلغي الاختيار.",
  },
];

/**
 * First-visit modal explaining the builder workflow. Persists "seen" in
 * localStorage so it appears at most once per browser.
 *
 * Wraps content in framer-motion AnimatePresence for the same enter
 * animation pattern as ConfirmDialog.
 */
export function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    // Small delay so the builder mounts first.
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  };

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="جولة تعريفية"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <motion.button
        type="button"
        aria-label="إغلاق"
        onClick={close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="تخطي"
          className="absolute top-3 end-3 z-10 flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
        >
          <X size={14} />
        </button>

        <div className="bg-tint-peach p-7 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
            <Icon size={22} />
          </div>
          <p className="text-xs font-medium text-brand">
            <Sparkles size={10} className="inline" /> أهلًا بك في ركاز
          </p>
          <h2 className="mt-1.5 text-xl font-bold text-stone-900">
            {current.title}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-600">
            {current.body}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-6 rounded-full transition-colors",
                  i === step ? "bg-brand" : "bg-stone-200",
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={close}
              className="rounded-xl px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-100"
            >
              تخطي
            </button>
            <button
              type="button"
              onClick={() => {
                if (isLast) close();
                else setStep((s) => s + 1);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-brand-dark"
            >
              {isLast ? "ابدأ البناء" : "التالي"}
              <ArrowLeft size={12} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
