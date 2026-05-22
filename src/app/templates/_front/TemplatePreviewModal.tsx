"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SectionRenderer } from "@/features/sections/SectionRenderer";
import { starterDesignFor } from "@/features/sections/starters";
import { cn } from "@/shared/lib/cn";
import type { ProjectTemplateType } from "@/features/projects";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "max-w-[1200px]",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
};

const DEVICE_META: Array<{ id: Device; Icon: LucideIcon; label: string }> = [
  { id: "desktop", Icon: Monitor, label: "كمبيوتر" },
  { id: "tablet", Icon: Tablet, label: "تابلت" },
  { id: "mobile", Icon: Smartphone, label: "جوال" },
];

const TITLES: Record<ProjectTemplateType, string> = {
  barber: "صالون الحلاقة",
  coffee: "مقهى الأحلام",
  photography: "عدسة الإبداع",
};

const SUBTITLES: Record<ProjectTemplateType, string> = {
  barber: "موقع متكامل لصالون حلاقة — حجوزات، خدمات، آراء عملاء.",
  coffee: "موقع لمقهى مع قائمة طعام كاملة وصور للأجواء.",
  photography: "بورتفوليو مصور مع باقات الجلسات وآراء العملاء.",
};

/**
 * Renders the full starter design for a template inside a desktop-sized
 * frame (with device toggle) so users see what they're getting before
 * committing. A "استخدم هذا القالب" CTA hands off to BlueprintBuilder's
 * existing onSelect path.
 */
export function TemplatePreviewModal({
  template,
  onClose,
  onConfirm,
}: {
  template: ProjectTemplateType | null;
  onClose: () => void;
  onConfirm: (t: ProjectTemplateType) => void;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const open = template !== null;

  // Build the preview design only when a template is actively chosen.
  const design = useMemo(
    () => (template ? starterDesignFor(template) : null),
    [template],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && template && design && (
        <motion.div
          key="template-preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative z-10 flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl"
          >
            {/* Chrome */}
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-200 bg-white px-5 py-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-brand">معاينة قالب</p>
                <h2 className="truncate text-base font-bold text-stone-900">
                  {TITLES[template]}
                </h2>
                <p className="hidden truncate text-xs text-stone-500 sm:block">
                  {SUBTITLES[template]}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-0.5 rounded-md bg-stone-100 p-1 sm:flex">
                  {DEVICE_META.map(({ id, Icon, label }) => {
                    const active = device === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDevice(id)}
                        aria-label={label}
                        title={label}
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 transition-colors",
                          active
                            ? "bg-white text-stone-900 shadow-sm"
                            : "hover:text-stone-900",
                        )}
                      >
                        <Icon size={14} />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => onConfirm(template)}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-brand px-4 text-xs font-medium text-white shadow-md shadow-brand/20 transition-colors hover:bg-brand-dark"
                >
                  استخدم هذا القالب
                  <ArrowLeft size={14} />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            {/* Scrollable preview frame */}
            <div className="flex-1 overflow-auto bg-stone-100">
              <div
                className={cn(
                  "mx-auto w-full px-3 py-6 transition-[max-width] duration-200",
                  DEVICE_WIDTH[device],
                )}
              >
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                  <div className="divide-y divide-stone-100">
                    {design.sections.map((section) => (
                      <SectionRenderer
                        key={section.id}
                        section={section}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
