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
import { useEffect, useMemo, useRef, useState } from "react";
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

/** What the user is expected to do in this step. The tour subscribes
 *  to the builder store and auto-advances when it sees the action
 *  happen — so the tour is actually interactive, not just a slideshow.
 *
 *   - "added":    user added something to the design (section or
 *                 primitive). Design weight grew vs. step baseline.
 *   - "selected": user tapped something on the canvas
 *                 (`selection.kind !== "none"`).
 *   - "edited":   user made any mutation that hit undo history
 *                 (renamed text, recoloured, moved, anything).
 *   - undefined:  no expected action — advance only via the Next button.
 */
type Action = "added" | "selected" | "edited";

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
  /** Action the user should perform to auto-advance this step. */
  awaitAction?: Action;
  /** Hint shown in the tooltip footer while waiting for the action. */
  awaitHint?: string;
};

// Each step's body is a direct instruction in plain Arabic — no tech
// jargon (no "كانفس" / "تبويب" / "واجهة"), just "اضغط على X عشان Y".
// The whole point of the tour is to teach the workflow; passive copy
// or unfamiliar words leave the user staring at a dimmed screen
// wondering what to do next.
const STEPS: Step[] = [
  {
    Icon: Sparkles,
    title: "أهلاً بك في ركاز",
    body: "نمشي سوا ٧ خطوات قصيرة، وتبني أول موقع لك. اضغط «التالي» نبدأ.",
    target: null,
  },
  {
    Icon: Square,
    title: "١. هنا تبني موقعك",
    body: "هذي المساحة اللي يظهر فيها موقعك. الآن فاضية — تعال نملاها سوا.",
    target: "canvas",
    mobileTab: "canvas",
    placement: "top",
  },
  {
    Icon: LayoutGrid,
    title: "٢. افتح المكتبة",
    body: "اضغط على «المكتبة» في الأسفل، فيها كل الأقسام والعناصر الجاهزة اللي تقدر تضيفها.",
    target: "library-tab",
    mobileTab: "library",
    placement: "top",
  },
  {
    Icon: Hand,
    title: "٣. اختر شي وأضفه",
    body: "اضغط على أي شي هنا — نص، صورة، زر — وينضاف فوراً لموقعك. أو قلِّب لـ«الأقسام الجاهزة» تختار قسم كامل بضغطة وحدة.",
    target: "library-content",
    mobileTab: "library",
    placement: "bottom",
    awaitAction: "added",
    awaitHint: "في انتظار إضافتك لعنصر…",
  },
  {
    Icon: Eye,
    title: "٤. ارجع تشوف موقعك",
    body: "اضغط «المعاينة» في الأسفل، تشوف اللي ضفته الآن على موقعك.",
    target: "canvas-tab",
    mobileTab: "canvas",
    placement: "top",
  },
  {
    Icon: Hand,
    title: "٥. اضغط على أي قسم لتعديله",
    body: "اضغط على أي قسم في موقعك. تنفتح لك خصائصه تلقائياً عشان تغيّرها.",
    target: "canvas",
    mobileTab: "canvas",
    placement: "top",
    awaitAction: "selected",
    awaitHint: "في انتظار اختيارك لقسم…",
  },
  {
    Icon: Sliders,
    title: "٦. غيّر النص واللون والصور",
    body: "كل شي في القسم — النص، اللون، الصور، الحجم — تعدّله من «الخصائص». جرّب تغيّر النص الآن.",
    target: "edit-panel",
    mobileTab: "editor",
    placement: "top",
    awaitAction: "edited",
    awaitHint: "في انتظار أوّل تعديل منك…",
  },
  {
    Icon: Rocket,
    title: "٧. انشر موقعك",
    body: "لما تخلص، اضغط زر النشر (الصاروخ) في الأعلى، واختر رابط موقعك. وخلاص — الزوار يقدرون يدخلونه.",
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
  // Subscriptions used by the interactive auto-advance: when the user
  // does what the current step asks (added/selected/edited), the tour
  // moves itself to the next step instead of waiting on a Next tap.
  const sections = useBuilderStore((s) => s.design.sections);
  const selection = useBuilderStore((s) => s.selection);
  const pastLen = useBuilderStore((s) => s.past.length);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tick, setTick] = useState(0);
  // A flash-of-success state ("تم!") shown for ~600ms after an
  // interactive step's condition is met, before auto-advancing.
  const [satisfied, setSatisfied] = useState(false);

  // Weighted size of the current design — sections plus all primitives
  // inside any canvas section. Used as a single number to detect "user
  // added something" regardless of which type.
  const designWeight = useMemo(
    () =>
      sections.reduce((acc, s) => {
        if (s.type === "canvas") return acc + 1 + s.props.primitives.length;
        return acc + 1;
      }, 0),
    [sections],
  );

  // Baseline captured each time the tour advances to a new step. The
  // auto-advance check compares the current store state against this
  // baseline.
  const baselineRef = useRef({
    designWeight: 0,
    hadSelection: false,
    pastLen: 0,
  });

  // First-mount: decide whether to show.
  //
  // TESTING MODE: the localStorage gate is currently commented out so
  // the tour fires on every visit. Restore the gated form before
  // shipping to production users:
  //
  //   if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
  //
  useEffect(() => {
    if (typeof window === "undefined") return;
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

  // Capture the baseline state at each step boundary so the interactive
  // auto-advance has a "before" snapshot to compare against.
  useEffect(() => {
    if (!open) return;
    baselineRef.current = {
      designWeight,
      hadSelection: selection.kind !== "none",
      pastLen,
    };
    setSatisfied(false);
    // baselineRef only resets on step change — designWeight/selection/
    // pastLen are intentionally NOT in the deps array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  // Watch for the awaited action and auto-advance when it happens.
  //
  // The auto-advance timer is parked on a ref (not returned as effect
  // cleanup) — otherwise setting `satisfied=true` re-runs the effect
  // and its cleanup clears the timer before it can fire. Single
  // unmount-only cleanup below covers the real teardown case.
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!open) return;
    const s = STEPS[step];
    if (!s.awaitAction || satisfied) return;
    const base = baselineRef.current;
    let met = false;
    if (s.awaitAction === "added") {
      met = designWeight > base.designWeight;
    } else if (s.awaitAction === "selected") {
      met =
        selection.kind !== "none" &&
        // Only counts if the user actively made a new selection during
        // this step — not a stale selection that was already there.
        !base.hadSelection;
    } else if (s.awaitAction === "edited") {
      met = pastLen > base.pastLen;
    }
    if (!met) return;
    setSatisfied(true);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      setSatisfied(false);
      setStep((x) => (x === STEPS.length - 1 ? x : x + 1));
    }, 700);
  }, [open, step, designWeight, selection, pastLen, satisfied]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

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
    // TESTING MODE: not writing the localStorage flag, so the tour
    // re-fires on the next visit. Restore the write before shipping:
    //
    //   try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    //
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
  // For interactive steps the user has to actually tap the highlighted
  // UI (a library tile, a canvas section), so we MUST NOT cover those
  // taps with our click-to-advance backdrop. Spotlight + tooltip still
  // render; the user can advance manually via Next anytime.
  const isInteractive = !!current.awaitAction;

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
    // bottom-of-viewport position so it's always reachable. The bottom
    // offset clears the mobile-tabs strip + iPhone safe-area on
    // phones. NOTE: compute `left` in JS instead of `left: 50% +
    // transform: translateX(-50%)` — framer-motion's animation
    // transform overwrites the inline `transform`, killing the
    // centering and parking the tooltip half-off the right edge.
    if (!fitsBelow && !fitsAbove) {
      tooltipStyle = {
        position: "fixed",
        bottom: isMobile
          ? "calc(80px + env(safe-area-inset-bottom))"
          : 24,
        left: Math.max(12, (viewportW - tooltipMaxW) / 2),
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
    // Same gotcha as the bottom-center fallback above: framer-motion's
    // animation `transform` overwrites our inline `transform`, so we
    // can't use translate(-50%, -50%) to center. Compute positions
    // numerically instead.
    const estCardH = 220;
    tooltipStyle = {
      position: "fixed",
      top: Math.max(12, (viewportH - estCardH) / 2),
      left: Math.max(12, (viewportW - tooltipMaxW) / 2),
      width: tooltipMaxW,
    };
  }

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="جولة تعريفية"
        className={cn(
          "fixed inset-0 z-[180]",
          // Interactive steps need taps to pass through to the
          // highlighted UI (library tile, canvas section, edit panel
          // controls). The outer container itself catches no events;
          // tooltip + click-catcher children opt back in explicitly.
          isInteractive && "pointer-events-none",
        )}
      >
        {/* Full-viewport click catcher — for non-interactive steps,
            eats any tap outside the tooltip and advances the tour. For
            interactive steps (awaitAction) it's disabled so the user
            can actually tap the highlighted library tile / canvas
            section; the tour auto-advances when the action lands.
            For target-less steps it also doubles as the dim backdrop. */}
        {!isInteractive && (
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
        )}

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
            {/* "Tap here" finger — a small circular badge pinned to
                the spotlight's edge that bobs gently. Reads as a
                tap-target indicator. Only on small (≤200px wide)
                targets like buttons/tabs — for big areas the pulse
                ring carries the eye.

                Placement: above the spotlight when the spotlight is
                in the bottom half of the viewport (so the finger
                doesn't fall off the bottom edge / behind the iOS home
                indicator), otherwise below. Same idea on the
                horizontal axis for left/right edges. */}
            {targetRect.width <= 200 &&
              targetRect.height <= 120 &&
              (() => {
                const inBottomHalf = targetRect.top > viewportH * 0.5;
                const fingerSize = 36;
                const gap = 8;
                const top = inBottomHalf
                  ? targetRect.top - gap - fingerSize
                  : targetRect.bottom + gap;
                const left = Math.max(
                  6,
                  Math.min(
                    targetRect.left + targetRect.width / 2 - fingerSize / 2,
                    viewportW - fingerSize - 6,
                  ),
                );
                return (
                  <motion.div
                    key={`tap-${step}`}
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      y: inBottomHalf ? [4, -4, 4] : [-4, 4, -4],
                    }}
                    transition={{
                      opacity: { duration: 0.3 },
                      y: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
                    }}
                    style={{
                      position: "fixed",
                      top,
                      left,
                      width: fingerSize,
                      height: fingerSize,
                      borderRadius: 999,
                      background: "rgb(232, 93, 93)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow:
                        "0 8px 24px -8px rgba(232,93,93,0.7), 0 0 0 4px rgba(255,255,255,0.4)",
                      pointerEvents: "none",
                      // Flip the hand pointer 180° when the finger sits
                      // above the target so it visually points down at
                      // the target instead of up away from it.
                      transform: inBottomHalf ? "rotate(180deg)" : undefined,
                    }}
                  >
                    <Hand size={18} />
                  </motion.div>
                );
              })()}
          </>
        )}

        {/* Tooltip card — pointer-events:auto so the user can still
            tap Next/Skip even when the outer overlay is
            pointer-events:none (interactive steps). */}
        <motion.div
          key={`tip-${step}`}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="pointer-events-auto overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
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
              {step === 0
                ? "نبدأ سوا"
                : `الخطوة ${step} من ${STEPS.length - 1}`}
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

          {/* Interactive-step hint line: lets the user know the tour
              is watching for the action and will move on by itself
              when they do it. Flips to a green confirmation when
              satisfied, just before the auto-advance fires. */}
          {(current.awaitHint || satisfied) && (
            <div
              className={cn(
                "flex items-center gap-2 border-t border-stone-100 bg-slate-50/60 px-5 py-2 text-xs",
                satisfied ? "text-emerald-700" : "text-stone-500",
              )}
            >
              {satisfied ? (
                <>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    ✓
                  </span>
                  <span className="font-bold">تم! ننتقل للخطوة التالية…</span>
                </>
              ) : (
                <>
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                  </span>
                  <span>{current.awaitHint}</span>
                </>
              )}
            </div>
          )}

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
                {isLast ? "ابدأ البناء" : current.awaitAction ? "تخطّي" : "التالي"}
                <ArrowLeft size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
