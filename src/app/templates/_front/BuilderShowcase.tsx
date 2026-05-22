"use client";

import {
  ArrowLeft,
  Camera,
  Check,
  ChevronLeft,
  Coffee,
  Globe,
  Home,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  Lock,
  Scissors,
  Send,
  Sparkles,
  Type,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/shared/ui/Logo";
import { cn } from "@/shared/lib/cn";
import {
  useProjects,
  type ProjectTemplateType,
} from "@/features/projects";
import { SectionRenderer } from "@/features/sections/SectionRenderer";
import { starterDesignFor } from "@/features/sections/starters";

// =============================================================================
// Builder Showcase — the /templates page.
//
// Sidebar (start picker + element tiles) + main canvas with a browser-frame
// mockup. A demo cursor auto-plays the building experience on loop so the
// user sees what the builder can do before signing up / picking a template.
//
// Style adapted from the user's mock: we kept the structure but swapped
// violet → brand coral, Cairo → IBM Plex Sans Arabic, the placeholder logo
// → our Rekaz wordmark.
// =============================================================================

type DroppedType = "header" | "hero" | "gallery";

type Dropped = { id: string; type: DroppedType };

const SEQUENCE: DroppedType[] = ["header", "hero", "gallery"];

// Pause durations (ms) inside the orchestrator. Pulled out so the cadence is
// easy to tune.
const STEP_BEFORE_CLICK = 700;
const STEP_AFTER_CLICK = 400;
const STEP_BEFORE_PUBLISH = 900;
const STEP_AFTER_LOOP = 4000;

export function BuilderShowcase() {
  const router = useRouter();
  const [previewing, setPreviewing] = useState<ProjectTemplateType | null>(
    null,
  );
  const [chooserOpen, setChooserOpen] = useState(false);

  // ----- create project handlers ---------------------------------------------

  const startScratch = useCallback(async () => {
    const body = { name: "مشروعي الأول" };
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          router.push(`/builder/${data.project.id}`);
          return;
        }
      }
    } catch {
      // fall through to local
    }
    useProjects.getState().hydrate();
    const project = useProjects.getState().create(body);
    router.push(`/builder/${project.id}`);
  }, [router]);

  const startFromTemplate = useCallback(
    async (template: ProjectTemplateType) => {
      const body = {
        name: templateName(template),
        templateType: template,
      };
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ok) {
            router.push(`/builder/${data.project.id}`);
            return;
          }
        }
      } catch {
        // local fallback
      }
      useProjects.getState().hydrate();
      const project = useProjects.getState().create(body);
      router.push(`/builder/${project.id}`);
    },
    [router],
  );

  return (
    <div className="flex h-screen w-screen flex-row overflow-hidden bg-stone-50 text-stone-800">
      <Sidebar
        onScratch={startScratch}
        onTemplates={() => setChooserOpen(true)}
      />
      <Main
        previewing={previewing}
        onPublish={startScratch}
        onUseTemplate={startFromTemplate}
        onExitPreview={() => setPreviewing(null)}
      />

      <TemplatePickerModal
        open={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onPick={(template) => {
          setChooserOpen(false);
          setPreviewing(template);
        }}
      />
    </div>
  );
}

function templateName(t: ProjectTemplateType): string {
  switch (t) {
    case "barber":
      return "صالون الحلاقة";
    case "coffee":
      return "مقهى الأحلام";
    case "photography":
      return "عدسة الإبداع";
  }
}

// =============================================================================
// Sidebar — start picker + tools
// =============================================================================

function Sidebar({
  onScratch,
  onTemplates,
}: {
  onScratch: () => void;
  onTemplates: () => void;
}) {
  return (
    <aside className="relative z-20 flex h-full w-[380px] shrink-0 flex-col border-s border-stone-200 bg-white shadow-[0_0_40px_rgba(0,0,0,0.03)]">
      <div className="relative z-10 flex items-center gap-3 border-b border-stone-100 bg-white px-8 py-6">
        <Logo variant="wordmark" height={28} />
      </div>

      <div className="flex flex-1 flex-col gap-10 overflow-y-auto px-8 py-8">
        <section className="flex flex-col gap-4">
          <h2 className="mb-1 text-xl font-bold text-stone-900">
            اختر بداية مشروعك
          </h2>

          <StarterCard
            primary
            icon={
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            }
            title="بناء حر من الصفر"
            subtitle="صفحة فارغة، أنت تختار الأقسام وتصممها."
            onClick={onScratch}
          />

          <StarterCard
            icon={<LayoutGrid size={26} />}
            title="قوالب جاهزة"
            subtitle="اختر من قوالب جاهزة للأنشطة المختلفة."
            onClick={onTemplates}
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900">
              العناصر الأساسية
            </h2>
            <span className="rounded-md bg-brand-light px-2 py-1 text-xs font-semibold text-brand">
              اسحب للبدء
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ToolTile
              id="tool-header"
              Icon={Globe}
              label="ترويسة"
              tone="brand"
            />
            <ToolTile
              id="tool-hero"
              Icon={ImageIcon}
              label="قسم رئيسي"
              tone="rose"
            />
            <ToolTile
              id="tool-gallery"
              Icon={Images}
              label="معرض صور"
              tone="emerald"
            />
            <ToolTile
              id="tool-text"
              Icon={Type}
              label="نص ومحتوى"
              tone="amber"
            />
          </div>
        </section>
      </div>
    </aside>
  );
}

function StarterCard({
  primary = false,
  icon,
  title,
  subtitle,
  onClick,
}: {
  primary?: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border-2 p-4 text-start transition-all",
        primary
          ? "border-brand bg-brand-light"
          : "border-transparent bg-stone-50 hover:border-stone-200 hover:bg-stone-100",
      )}
    >
      {primary && (
        <div className="absolute top-0 right-0 h-full w-1.5 rounded-s-xl bg-brand" />
      )}
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-white shadow-sm transition-transform group-hover:scale-105",
          primary
            ? "border-brand/30 text-brand"
            : "border-stone-200 text-stone-400 group-hover:text-stone-600",
        )}
      >
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold text-stone-900">{title}</div>
        <div
          className={cn(
            "mt-1 text-sm leading-relaxed",
            primary ? "text-stone-600" : "text-stone-500",
          )}
        >
          {subtitle}
        </div>
      </div>
    </button>
  );
}

const TONE_GROUP = {
  brand: {
    text: "group-hover:text-brand",
    bg: "group-hover:bg-brand-light",
    border: "hover:border-brand/60",
    label: "group-hover:text-brand",
  },
  rose: {
    text: "group-hover:text-rose-500",
    bg: "group-hover:bg-rose-50",
    border: "hover:border-rose-300",
    label: "group-hover:text-rose-600",
  },
  emerald: {
    text: "group-hover:text-emerald-500",
    bg: "group-hover:bg-emerald-50",
    border: "hover:border-emerald-300",
    label: "group-hover:text-emerald-600",
  },
  amber: {
    text: "group-hover:text-amber-500",
    bg: "group-hover:bg-amber-50",
    border: "hover:border-amber-300",
    label: "group-hover:text-amber-600",
  },
} as const;

type Tone = keyof typeof TONE_GROUP;

function ToolTile({
  id,
  Icon,
  label,
  tone,
}: {
  id: string;
  Icon: LucideIcon;
  label: string;
  tone: Tone;
}) {
  const t = TONE_GROUP[tone];
  return (
    <div
      id={id}
      data-tool={id}
      className={cn(
        "group relative flex cursor-grab flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:shadow-md",
        t.border,
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl bg-stone-50 text-stone-400 transition-colors",
          t.text,
          t.bg,
        )}
      >
        <Icon size={24} />
      </div>
      <span
        className={cn("text-sm font-bold text-stone-600", t.label)}
      >
        {label}
      </span>
    </div>
  );
}

// =============================================================================
// Main — top bar + blueprint canvas with auto-play demo
// =============================================================================

function Main({
  previewing,
  onPublish,
  onUseTemplate,
  onExitPreview,
}: {
  previewing: ProjectTemplateType | null;
  onPublish: () => void;
  onUseTemplate: (t: ProjectTemplateType) => void;
  onExitPreview: () => void;
}) {
  const publishRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [dropped, setDropped] = useState<Dropped[]>([]);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [ripple, setRipple] = useState(false);
  const [publishActive, setPublishActive] = useState(false);

  // Build the preview design only when a template is actively chosen.
  const previewDesign = useMemo(
    () => (previewing ? starterDesignFor(previewing) : null),
    [previewing],
  );

  // Demo orchestrator — cycles forever, but only when no template is being
  // previewed. Re-keys on `previewing` so entering/leaving preview cleanly
  // starts/stops the loop. The loop body resets `dropped`/`cursor`/
  // `publishActive` on its first tick, so we don't need a separate reset
  // when entering preview mode (preview-mode rendering ignores them anyway).
  useEffect(() => {
    if (previewing) return;
    let cancelled = false;
    const sleep = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, ms));

    const centerOf = (el: Element) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };

    const loop = async () => {
      // Initial off-screen wait so the page settles + auth overlay can
      // dismiss before we start.
      await sleep(1500);

      while (!cancelled) {
        // Reset (clear any previously-dropped elements + sit cursor off-screen).
        setDropped([]);
        setPublishActive(false);
        setCursor({ x: window.innerWidth + 100, y: window.innerHeight + 100 });
        await sleep(500);
        if (cancelled) return;

        // Local counter — using state would trigger a re-render that
        // restarts this effect. The counter just drives the visual drop
        // offset; the real dropped state is appended via setDropped.
        let added = 0;

        for (const type of SEQUENCE) {
          const tile = document.querySelector(
            `[data-tool="tool-${type}"]`,
          );
          if (!tile) continue;
          const tilePos = centerOf(tile);
          setCursor({ x: tilePos.x - 14, y: tilePos.y - 14 });
          await sleep(STEP_BEFORE_CLICK);
          if (cancelled) return;

          // Click effect
          setRipple(true);
          await sleep(180);
          setRipple(false);
          await sleep(STEP_AFTER_CLICK);
          if (cancelled) return;

          // Move cursor to canvas drop area
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const dropY =
              rect.top + Math.min(rect.height - 80, 120 + added * 40);
            const dropX = rect.left + rect.width / 2;
            setCursor({ x: dropX, y: dropY });
            await sleep(450);
            if (cancelled) return;
          }

          // Add the element
          setDropped((prev) => [
            ...prev,
            { id: `${type}-${Date.now()}-${Math.random()}`, type },
          ]);
          added += 1;

          // Scroll canvas to bottom so the new element is visible
          await sleep(50);
          if (canvasRef.current) {
            canvasRef.current.scrollTo({
              top: canvasRef.current.scrollHeight,
              behavior: "smooth",
            });
          }
          await sleep(700);
        }

        // Publish click
        if (publishRef.current) {
          const p = centerOf(publishRef.current);
          setCursor({ x: p.x - 14, y: p.y - 14 });
          await sleep(STEP_BEFORE_PUBLISH);
          setRipple(true);
          await sleep(200);
          setRipple(false);
          setPublishActive(true);
        }

        await sleep(STEP_AFTER_LOOP);
      }
    };

    void loop();
    return () => {
      cancelled = true;
    };
  }, [previewing]);

  return (
    <main className="relative flex h-full min-w-0 flex-1 flex-col">
      {/* Top bar */}
      <div className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white/90 px-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="text-stone-500">مساحة العمل</span>
          <ChevronLeft size={16} className="text-stone-300" />
          {previewing ? (
            <span className="inline-flex items-center gap-2 rounded-lg bg-brand-light px-3 py-1.5 text-brand">
              <Sparkles size={14} />
              معاينة قالب — {templateName(previewing)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-lg bg-brand-light px-3 py-1.5 text-brand">
              <Home size={14} />
              الصفحة الرئيسية
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {previewing ? (
            <>
              <button
                type="button"
                onClick={onExitPreview}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-100"
              >
                <X size={16} />
                إغلاق المعاينة
              </button>
              <button
                type="button"
                onClick={() => onUseTemplate(previewing)}
                className="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2 text-sm font-bold text-white shadow-lg shadow-brand/30 transition-all hover:bg-brand-dark"
              >
                استخدم هذا القالب
                <ArrowLeft
                  size={16}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="rounded-xl border border-stone-200 bg-white px-5 py-2 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-100"
              >
                معاينة
              </button>
              <button
                type="button"
                ref={publishRef}
                onClick={onPublish}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold text-white shadow-lg shadow-stone-900/20 transition-all",
                  publishActive
                    ? "scale-105 bg-brand"
                    : "bg-stone-900 hover:bg-stone-800",
                )}
              >
                نشر الموقع
                <Send
                  size={16}
                  className="transition-transform group-hover:-translate-y-0.5"
                />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Blueprint area */}
      <div className="blueprint-grid relative flex flex-1 justify-center overflow-hidden px-8 py-10">
        <div className="relative z-10 flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-8 ring-white/50">
          {/* Browser chrome */}
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-stone-200 bg-stone-50/80 px-5 backdrop-blur-md">
            <div className="flex gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full border border-rose-500/20 bg-rose-400" />
              <span className="h-3.5 w-3.5 rounded-full border border-amber-500/20 bg-amber-400" />
              <span className="h-3.5 w-3.5 rounded-full border border-emerald-500/20 bg-emerald-400" />
            </div>
            <div className="me-12 flex flex-1 justify-center">
              <div className="flex h-7 w-64 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 shadow-sm text-stone-300">
                <Lock size={12} />
                <div className="h-1.5 w-32 rounded-full bg-stone-200" />
              </div>
            </div>
          </div>

          {/* Canvas content — either the auto-build demo or, when the user
              has picked a template from the chooser, the real starter
              design rendered inline so they see the actual site. */}
          <div
            ref={canvasRef}
            className="canvas-scroll relative flex flex-1 scroll-smooth flex-col overflow-y-auto bg-white"
          >
            {previewing && previewDesign ? (
              <div className="divide-y divide-stone-100">
                {previewDesign.sections.map((section) => (
                  <SectionRenderer key={section.id} section={section} />
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-6 p-6 md:p-10">
                {dropped.length === 0 ? <EmptyState /> : null}
                {dropped.map((d) => (
                  <DroppedElement key={d.id} type={d.type} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo cursor */}
      {cursor && !previewing && (
        <div
          aria-hidden
          style={{
            transform: `translate(${cursor.x}px, ${cursor.y}px)`,
          }}
          // NOTE: left-0 (not start-0). The cursor uses absolute pixel
          // translate() based on getBoundingClientRect coords, which are
          // measured from the viewport's LEFT edge. start-0 would anchor
          // it to the right edge in RTL and park it off-screen.
          className="pointer-events-none fixed top-0 left-0 z-[9999] flex h-8 w-8 items-center justify-center drop-shadow-xl transition-transform duration-700 ease-out"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 origin-top-left -rotate-12 text-stone-900 drop-shadow-md"
          >
            <path
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36Z"
              fill="currentColor"
              stroke="white"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </svg>
          <div
            className={cn(
              "absolute inset-0 rounded-full border-2 border-brand bg-brand/20 transition-all duration-300",
              ripple
                ? "scale-[2.5] opacity-0"
                : "scale-0 opacity-0",
            )}
          />
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-stone-400 transition-opacity duration-300">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50 text-stone-300">
        <Upload size={32} />
      </div>
      <p className="text-lg font-bold text-stone-500">
        اسحب العناصر هنا لبدء البناء
      </p>
      <p className="mt-2 text-sm text-stone-400">
        سيتم إنشاء الهيكل تلقائياً
      </p>
    </div>
  );
}

// =============================================================================
// Real-looking dropped elements (mockups, not full SectionRenderer)
// =============================================================================

function DroppedElement({ type }: { type: DroppedType }) {
  switch (type) {
    case "header":
      return (
        <div className="animate-pop-in group relative shrink-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <ElementChip color="brand" label="ترويسة (Header)" />
          <ElementHighlightBorder color="brand" />
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>
              </div>
              <span className="text-xl font-bold text-stone-800">موقعي</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-stone-600">
              <span className="transition-colors hover:text-brand">الرئيسية</span>
              <span className="transition-colors hover:text-brand">خدماتنا</span>
              <span className="transition-colors hover:text-brand">معرض الأعمال</span>
              <span className="transition-colors hover:text-brand">تواصل معنا</span>
            </div>
            <button
              type="button"
              className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
            >
              ابدأ الآن
            </button>
          </nav>
        </div>
      );
    case "hero":
      return (
        <div className="animate-pop-in group relative shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <ElementChip color="rose" label="قسم رئيسي (Hero)" />
          <ElementHighlightBorder color="rose" />
          <div className="relative bg-stone-900 p-10 text-white">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-800 px-4 py-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                منصة ركاز متوفرة الآن
              </div>
              <h1 className="max-w-lg text-3xl font-bold leading-tight">
                ابنِ موقعك الإلكتروني بدون برمجة
              </h1>
              <p className="max-w-md text-base leading-relaxed text-stone-400">
                صمّم موقعًا احترافيًا بسهولة مع أدوات البناء الذكية والقوالب الجاهزة.
              </p>
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  ابدأ مجاناً
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-stone-700 bg-stone-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-stone-700"
                >
                  شاهد العرض التوضيحي
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-stone-500">
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-500" /> سهل الاستخدام
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-500" /> قوالب احترافية
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-500" /> دعم 24/7
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    case "gallery":
      return (
        <div className="animate-pop-in group relative shrink-0 rounded-2xl border border-stone-200 bg-white p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <ElementChip color="emerald" label="معرض صور (Gallery)" />
          <ElementHighlightBorder color="emerald" />
          <div className="mb-8 text-center">
            <h3 className="mb-2 text-xl font-bold text-stone-800">
              أعمالنا المميزة
            </h3>
            <p className="text-sm text-stone-500">
              استكشف مجموعة من أفضل المواقع التي صممناها
            </p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: "موقع تجارة إلكترونية", bg: "from-brand-light to-white" },
              { label: "منصة تعليمية", bg: "from-rose-50 to-white" },
              { label: "موقع شركات", bg: "from-emerald-50 to-white" },
            ].map((tile) => (
              <div
                key={tile.label}
                className={cn(
                  "group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br",
                  tile.bg,
                )}
              >
                <div className="flex h-full w-full items-center justify-center text-stone-400 opacity-60 transition-opacity group-hover:opacity-80">
                  <ImageIcon size={40} strokeWidth={1.5} />
                </div>
                <div className="absolute inset-x-0 bottom-0 border-t border-stone-200 bg-white p-3">
                  <span className="text-xs font-medium text-stone-600">
                    {tile.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
  }
}

function ElementChip({
  color,
  label,
}: {
  color: "brand" | "rose" | "emerald";
  label: string;
}) {
  const bg = {
    brand: "bg-brand",
    rose: "bg-rose-500",
    emerald: "bg-emerald-500",
  }[color];
  return (
    <span
      className={cn(
        "absolute -top-3 right-5 z-20 rounded-md px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100",
        bg,
      )}
    >
      {label}
    </span>
  );
}

function ElementHighlightBorder({
  color,
}: {
  color: "brand" | "rose" | "emerald";
}) {
  const border = {
    brand: "border-brand",
    rose: "border-rose-500",
    emerald: "border-emerald-500",
  }[color];
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-10 rounded-2xl border-2 opacity-0 transition-opacity group-hover:opacity-100",
        border,
      )}
    />
  );
}

// =============================================================================
// Template chooser modal — surfaced when user picks "قوالب جاهزة"
// =============================================================================

function TemplatePickerModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (template: ProjectTemplateType) => void;
}) {
  const choices: Array<{
    id: ProjectTemplateType;
    title: string;
    subtitle: string;
    Icon: LucideIcon;
    tone: "amber" | "orange" | "purple";
  }> = [
    {
      id: "barber",
      title: "صالون الحلاقة",
      subtitle: "حجوزات، خدمات، فريق العمل",
      Icon: Scissors,
      tone: "amber",
    },
    {
      id: "coffee",
      title: "مقهى الأحلام",
      subtitle: "قائمة الطعام، صور، توصيل",
      Icon: Coffee,
      tone: "orange",
    },
    {
      id: "photography",
      title: "عدسة الإبداع",
      subtitle: "بورتفوليو، باقات، تواصل",
      Icon: Camera,
      tone: "purple",
    },
  ];

  const TONE: Record<
    "amber" | "orange" | "purple",
    {
      bg: string;
      bgHover: string;
      iconText: string;
      borderHover: string;
      focusRing: string;
    }
  > = {
    amber: {
      bg: "bg-amber-50",
      bgHover: "group-hover:bg-amber-100",
      iconText: "text-amber-500",
      borderHover: "hover:border-amber-200",
      focusRing: "focus:ring-amber-500",
    },
    orange: {
      bg: "bg-orange-50",
      bgHover: "group-hover:bg-orange-100",
      iconText: "text-orange-500",
      borderHover: "hover:border-orange-200",
      focusRing: "focus:ring-orange-500",
    },
    purple: {
      bg: "bg-purple-50",
      bgHover: "group-hover:bg-purple-100",
      iconText: "text-purple-500",
      borderHover: "hover:border-purple-200",
      focusRing: "focus:ring-purple-500",
    },
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="اختر قالباً"
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/50"
      />

      <div className="relative z-10 flex w-full max-w-[460px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
        {/* Close (top-left in RTL — matches the source mockup) */}
        <button
          type="button"
          aria-label="إغلاق"
          onClick={onClose}
          className="absolute top-4 left-4 z-10 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-200"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-6 pt-8 pb-5 text-center">
          <span className="mb-2 block text-[11px] font-bold tracking-wide text-brand">
            اختر قالباً
          </span>
          <h2 className="mb-2 text-xl font-bold text-stone-800">
            أي عمل تبني له موقعاً؟
          </h2>
          <p className="text-xs text-stone-500">
            معاينة كاملة قبل تثبيت اختيارك.
          </p>
        </div>

        {/* Choices */}
        <div className="grid grid-cols-3 gap-3 px-6 pb-8">
          {choices.map((c) => {
            const t = TONE[c.tone];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick(c.id)}
                className={cn(
                  "group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white hover:shadow-md focus:outline-none focus:ring-2",
                  t.borderHover,
                  t.focusRing,
                )}
              >
                <div
                  className={cn(
                    "flex h-20 w-full shrink-0 items-center justify-center",
                    t.bg,
                    t.bgHover,
                  )}
                >
                  <c.Icon
                    size={28}
                    strokeWidth={1.75}
                    className={cn("drop-shadow-sm", t.iconText)}
                  />
                </div>
                <div className="flex w-full flex-1 flex-col items-center justify-start bg-white p-3 text-center">
                  <h3 className="mb-1.5 text-sm font-bold text-stone-800">
                    {c.title}
                  </h3>
                  <p className="text-[10px] leading-relaxed text-stone-500">
                    {c.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Export the publish toast hint so it isn't a dead UI element when the user
// actually clicks it (we still create a scratch project for them).
export { templateName };
