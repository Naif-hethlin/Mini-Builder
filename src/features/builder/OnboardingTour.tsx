"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Edit3,
  Eye,
  Hand,
  LayoutGrid,
  Rocket,
  Sliders,
  Sparkles,
  Square,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { MobileTab } from "./state/types";
import { useBuilderStore } from "./state/store";

/**
 * First-visit interactive tour.
 *
 * 8 steps that walk a new user through the actual builder workflow.
 * Each step optionally targets a real DOM element (via `[data-tour="…"]`)
 * — the tour dims everything else, draws a soft rectangle around the
 * target, and parks a tooltip card nearby. Steps without a target render
 * as a centered card (greeting + close).
 *
 * Storage: a single `rekaz-builder/onboarding/v2` key tracks whether
 * the user has seen this version of the tour. Bumping the version
 * suffix re-shows it for everyone (use sparingly).
 */

const STORAGE_KEY = "rekaz-builder/onboarding/v2";

type Step = {
  Icon: typeof Sparkles;
  title: string;
  body: string;
  /** A `[data-tour="…"]` value to highlight, or `null` for a centered card. */
  target: string | null;
  /** Mobile tab to switch to before this step (so the target is on-screen). */
  mobileTab?: MobileTab;
  /** Tooltip placement relative to the target. Auto-flips if it would overflow. */
  placement?: "bottom" | "top" | "right" | "left";
};

const STEPS: Step[] = [
  {
    Icon: Sparkles,
    title: "أهلًا بك في ركاز!",
    body: "خلِّني أوريك بسرعة كيف تبني موقعك من البداية للنهاية.",
    target: null,
  },
  {
    Icon: Square,
    title: "هذه مساحة عملك",
    body: "كل ما تضيفه يظهر هنا — هذا الكانفس هو موقعك أثناء البناء.",
    target: "canvas",
    mobileTab: "canvas",
    placement: "top",
  },
  {
    Icon: LayoutGrid,
    title: "افتح المكتبة",
    body: "من هنا تختار قسماً جاهزاً، أو عناصر حرّة تضيفها وتنسّقها بنفسك.",
    target: "library-tab",
    mobileTab: "library",
    placement: "top",
  },
  {
    Icon: Hand,
    title: "اختر قالباً جاهزاً",
    body: "اضغط على أي قسم لتضيفه فوراً — هيدر، أبطال، أسعار، تواصل… كل شيء جاهز.",
    target: "library-sections",
    mobileTab: "library",
    placement: "bottom",
  },
  {
    Icon: Edit3,
    title: "اضغط للتعديل",
    body: "اضغط على القسم في الكانفس لتختاره. تظهر إعداداته على لوحة الخصائص فوراً.",
    target: "canvas",
    mobileTab: "canvas",
    placement: "top",
  },
  {
    Icon: Sliders,
    title: "غيّر النصوص والألوان",
    body: "كل خصائص القسم — النصوص، الألوان، الصور — تعدّلها من هنا.",
    target: "edit-panel",
    mobileTab: "editor",
    placement: "top",
  },
  {
    Icon: Eye,
    title: "عاين موقعك",
    body: "ارجع للمعاينة في أي وقت لتشوف موقعك زي ما يشوفه الزائر.",
    target: "canvas-tab",
    mobileTab: "canvas",
    placement: "top",
  },
  {
    Icon: Rocket,
    title: "انشره للعالم",
    body: "لما تخلص، اضغط نشر واختر رابطك العام. موقعك يكون متاح لزوّارك مباشرة.",
    target: "publish",
    mobileTab: "canvas",
    placement: "bottom",
  },
];

const PAD = 8;
const TOOLTIP_GAP = 14;
const TOOLTIP_W_MOBILE = 304;
const TOOLTIP_W_DESKTOP = 360;

export function OnboardingTour() {
  const setMobileTab = useBuilderStore((s) => s.setMobileTab);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tick, setTick] = useState(0);

  // First-mount: decide whether to show.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    // Small delay so the builder finishes mounting first.
    const t = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Switch the mobile tab as the user advances, if the step calls for it.
  useEffect(() => {
    if (!open) return;
    const s = STEPS[step];
    if (s.mobileTab) setMobileTab(s.mobileTab);
  }, [open, step, setMobileTab]);

  // Track the target's bounding rect.
  useEffect(() => {
    if (!open) return;
    const target = STEPS[step].target;
    if (!target) {
      setTargetRect(null);
      return;
    }
    const measure = () => {
      // Some targets have multiple matches across breakpoints (e.g. the
      // library tab is `md:hidden` on desktop and the desktop sidebar
      // is hidden on mobile). Pick the first one that's actually
      // rendered — offsetWidth > 0 filters out display:none elements
      // that querySelector still returns.
      const els = document.querySelectorAll<HTMLElement>(
        `[data-tour="${target}"]`,
      );
      const el = Array.from(els).find((e) => e.offsetWidth > 0);
      if (!el) {
        setTargetRect(null);
        return;
      }
      setTargetRect(el.getBoundingClientRect());
    };
    // Initial measure delayed so the panel/tab swap settles.
    const delayed = setTimeout(measure, 200);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(delayed);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [open, step, tick]);

  // One follow-up measure after fonts/layout settle.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setTick((x) => x + 1), 700);
    return () => clearTimeout(t);
  }, [open, step]);

  const close = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* localStorage unavailable */
      }
    }
    setOpen(false);
  };

  const advance = () => {
    if (step === STEPS.length - 1) close();
    else setStep((s) => s + 1);
  };

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.Icon;

  // ---- Tooltip placement ----
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1024;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 768;
  const isMobile = viewportW < 640;
  const tooltipW = isMobile ? TOOLTIP_W_MOBILE : TOOLTIP_W_DESKTOP;
  const tooltipMaxW = Math.min(tooltipW, viewportW - 24);

  let tooltipStyle: React.CSSProperties = {};
  if (targetRect) {
    let placement = current.placement ?? "bottom";

    // Rough vertical estimate so we can flip when it would overflow.
    const estH = 220;
    const fitsBelow =
      targetRect.bottom + TOOLTIP_GAP + estH <= viewportH - 12;
    const fitsAbove = targetRect.top - TOOLTIP_GAP - estH >= 12;
    if (placement === "bottom" && !fitsBelow) placement = "top";
    else if (placement === "top" && !fitsAbove) placement = "bottom";

    // If the target is too big for either above OR below — common when
    // the target is the whole canvas — overlay the tooltip in a fixed
    // bottom-of-viewport position so it's always reachable. Without
    // this, a flip-then-flip-back lands the tooltip off-screen and the
    // user can't see the Next button to advance. The bottom offset
    // clears the mobile-tabs strip + iPhone safe-area on phones.
    if (!fitsBelow && !fitsAbove) {
      tooltipStyle = {
        position: "fixed",
        bottom: isMobile
          ? "calc(80px + env(safe-area-inset-bottom))"
          : 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: tooltipMaxW,
      };
    } else {
      let left = targetRect.left + targetRect.width / 2 - tooltipMaxW / 2;
      left = Math.max(12, Math.min(left, viewportW - tooltipMaxW - 12));

      if (placement === "bottom") {
        tooltipStyle = {
          position: "fixed",
          top: targetRect.bottom + TOOLTIP_GAP + PAD,
          left,
          width: tooltipMaxW,
        };
      } else if (placement === "top") {
        tooltipStyle = {
          position: "fixed",
          bottom: viewportH - targetRect.top + TOOLTIP_GAP + PAD,
          left,
          width: tooltipMaxW,
        };
      } else {
        const top = Math.max(
          12,
          Math.min(
            targetRect.top + targetRect.height / 2 - estH / 2,
            viewportH - estH - 12,
          ),
        );
        if (placement === "right") {
          tooltipStyle = {
            position: "fixed",
            top,
            left: targetRect.right + TOOLTIP_GAP + PAD,
            width: tooltipMaxW,
          };
        } else {
          tooltipStyle = {
            position: "fixed",
            top,
            right: viewportW - targetRect.left + TOOLTIP_GAP + PAD,
            width: tooltipMaxW,
          };
        }
      }
    }
  } else {
    tooltipStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: tooltipMaxW,
    };
  }

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="جولة تعريفية"
        className="fixed inset-0 z-[180]"
      >
        {/* Full-viewport click catcher — eats any tap outside the
            tooltip and the spotlight target, advancing the tour. This
            is what stops the canvas's own onClick from intercepting
            taps during a canvas-target step (which made the tour feel
            "stuck" — the click went to the canvas, did nothing
            visible, and the user couldn't see how to progress).
            For target-less steps it also doubles as the dim backdrop. */}
        <motion.button
          type="button"
          aria-label={targetRect ? "متابعة" : "إغلاق"}
          onClick={targetRect ? advance : close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute inset-0 cursor-default",
            // Only dim when there's no spotlight — the spotlight's own
            // box-shadow paints the dim around the cut-out.
            !targetRect && "bg-stone-900/45 backdrop-blur-[2px]",
          )}
        />

        {/* Spotlight cut-out + a separate pulsing ring so the
            highlighted area reads as "here, look at this" even when
            the target fills most of the screen (the dim becomes
            very subtle in that case). */}
        {targetRect && (
          <>
            <motion.div
              key={`spotlight-${step}`}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              style={{
                position: "fixed",
                top: targetRect.top - PAD,
                left: targetRect.left - PAD,
                width: targetRect.width + PAD * 2,
                height: targetRect.height + PAD * 2,
                borderRadius: 16,
                boxShadow:
                  "0 0 0 9999px rgba(15, 23, 42, 0.65), 0 0 0 2px rgba(255,255,255,0.85) inset, 0 0 0 4px rgb(232,93,93)",
                pointerEvents: "none",
                transition:
                  "top 250ms ease, left 250ms ease, width 250ms ease, height 250ms ease",
              }}
            />
            {/* Pulsing outer ring — animated to draw the eye. */}
            <motion.div
              key={`pulse-${step}`}
              aria-hidden
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: [0.8, 0.1, 0.8], scale: [1, 1.04, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "fixed",
                top: targetRect.top - PAD,
                left: targetRect.left - PAD,
                width: targetRect.width + PAD * 2,
                height: targetRect.height + PAD * 2,
                borderRadius: 16,
                boxShadow: "0 0 0 6px rgba(232,93,93,0.45)",
                pointerEvents: "none",
              }}
            />
          </>
        )}

        {/* Tooltip card */}
        <motion.div
          key={`tip-${step}`}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
          style={tooltipStyle}
        >
          <button
            type="button"
            onClick={close}
            aria-label="تخطّي الجولة"
            className="absolute top-3 end-3 z-10 flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={14} />
          </button>

          <div className="bg-tint-peach px-5 pt-5 pb-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-brand">
              <Sparkles size={12} />
              الخطوة {step + 1} من {STEPS.length}
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-stone-900">
                  {current.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">
                  {current.body}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-stone-100 px-5 py-3">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === step ? "w-6 bg-brand" : "w-1.5 bg-stone-200",
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="rounded-xl px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-100"
                >
                  السابق
                </button>
              )}
              <button
                type="button"
                onClick={advance}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-dark"
              >
                {isLast ? "ابدأ البناء" : "التالي"}
                <ArrowLeft size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
