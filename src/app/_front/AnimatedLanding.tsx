"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ArrowLeft, Hand, TrendingUp } from "lucide-react";
import { Logo } from "@/shared/ui/Logo";

const TYPEWRITER_PHRASES = [
  "موقع عملك بدون كود",
  "متجرك الإلكتروني بسهولة",
  "هويتك الرقمية في دقائق",
  "منصتك التعليمية بخطوات",
];

const HOLD_AFTER_TYPE_MS = 2000;
const HOLD_AFTER_DELETE_MS = 500;
const TYPE_SPEED_MS = 120;
const DELETE_SPEED_MS = 50;

export function AnimatedLanding() {
  const featuresRef = useRef<HTMLElement>(null);
  const scrollToFeatures = useCallback(() => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="text-stone-900">
      <HeroSection onScrollHint={scrollToFeatures} />
      <WhyRekazSection sectionRef={featuresRef} />
    </div>
  );
}

// =============================================================================
// Hero — animated gradient bg, typewriter, blob parallax.
// =============================================================================

function HeroSection({ onScrollHint }: { onScrollHint: () => void }) {
  const text = useTypewriter(TYPEWRITER_PHRASES);
  const blobsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const xRatio = e.clientX / window.innerWidth;
      const yRatio = e.clientY / window.innerHeight;
      blobsRef.current.forEach((blob, i) => {
        if (!blob) return;
        const speed = (i + 1) * 10;
        blob.style.marginInlineStart = `${(0.5 - xRatio) * speed}px`;
        blob.style.marginBlockStart = `${(0.5 - yRatio) * speed}px`;
        blob.style.transition = "margin 0.3s ease-out";
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const registerBlob = (i: number) => (el: HTMLDivElement | null) => {
    if (el) blobsRef.current[i] = el;
  };

  return (
    <section className="bg-animated-gradient relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          ref={registerBlob(0)}
          className="absolute -top-20 -right-20 h-96 w-96 animate-blob rounded-full bg-brand-soft opacity-20 mix-blend-multiply blur-3xl"
        />
        <div
          ref={registerBlob(1)}
          className="absolute -bottom-32 -left-20 h-80 w-80 animate-blob rounded-full bg-tint-peach opacity-50 mix-blend-multiply blur-3xl [animation-delay:2s]"
        />
        <div
          ref={registerBlob(2)}
          className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-blob rounded-full bg-white opacity-50 mix-blend-overlay blur-3xl [animation-delay:4s]"
        />
        <div className="absolute top-1/4 right-1/3 h-4 w-4 animate-float-slow rounded-full bg-brand opacity-20" />
        <div className="absolute bottom-1/4 left-1/4 h-6 w-6 animate-float-medium rounded-full bg-brand-soft opacity-10" />
        <div className="absolute top-1/2 right-1/4 h-3 w-3 animate-float-fast rounded-full bg-brand opacity-30" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <Link
          href="/templates"
          className="group relative mb-10 inline-flex animate-fade-in-up items-center fade-in-start"
        >
          {/* Soft morph halo behind the wordmark — visual interest without
              repeating the swoosh icon, which already lives inside the
              wordmark SVG. */}
          <div
            aria-hidden
            className="absolute -inset-3 -z-10 animate-morph bg-brand/15 blur-sm"
          />
          <Logo
            variant="wordmark"
            height={42}
            className="animate-pulse-glow transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="mb-6 flex h-[80px] w-full animate-fade-in-up items-center justify-center fade-in-start [animation-delay:100ms] md:h-[100px]">
          <h1 className="flex flex-wrap items-center justify-center gap-x-3 text-4xl leading-tight font-extrabold md:text-5xl lg:text-6xl">
            <span>أنشئ</span>
            <span className="relative flex h-full min-w-[200px] items-center">
              <span className="inline-block text-brand">{text}</span>
              <span className="ms-1 inline-block h-10 w-[3px] animate-blink bg-brand md:h-12 lg:h-14" />
            </span>
          </h1>
        </div>

        <p className="mx-auto mb-12 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-stone-600 fade-in-start [animation-delay:200ms] md:text-xl">
          قوالب جاهزة، تخصيص مرن، وأدوات مبسطة لإدارة مشروعك — كل ذلك في
          منصة واحدة.
        </p>

        <div className="animate-fade-in-up fade-in-start [animation-delay:300ms]">
          <Link
            href="/templates"
            className="group inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 text-lg font-bold text-white shadow-[0_8px_20px_rgba(232,93,93,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(232,93,93,0.5)]"
          >
            <span>ابدأ الآن</span>
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
          </Link>
        </div>
      </div>

      {/* Soft fade-to-stone at the bottom so the hero blends into the
          features section instead of meeting it at a hard edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-stone-50"
      />

      {/* Scroll-hint dots — clickable, smooth-scrolls to features. */}
      <button
        type="button"
        onClick={onScrollHint}
        aria-label="انتقل إلى المزايا"
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 animate-fade-in-up gap-2 fade-in-start transition-transform [animation-delay:400ms] hover:scale-110"
      >
        <span className="h-2 w-2 rounded-full bg-brand/30" />
        <span className="h-2 w-2 rounded-full bg-brand/50" />
        <span className="h-2 w-2 rounded-full bg-brand/30" />
      </button>
    </section>
  );
}

// =============================================================================
// "ليه مع ركاز؟" — 4 illustrated feature cards on a soft gray background.
// =============================================================================

function WhyRekazSection({
  sectionRef,
}: {
  sectionRef: RefObject<HTMLElement | null>;
}) {
  return (
    <section
      ref={sectionRef}
      id="why-rekaz"
      className="relative z-10 w-full bg-stone-50 px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-extrabold text-stone-900 md:text-5xl">
            ليه مع <span className="text-brand">ركاز</span>؟
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-stone-600">
            كل ما تحتاجه لبناء وإدارة موقعك في منصة واحدة متكاملة
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FeatureCard
            title="حجوزات منظمة بدون فوضى"
            description="تجربة حجز مكتملة من الطلب الأول إلى التذكير والوصول، مع سير عمل جاهز لكل فريق."
            cta="موقعك في 3 دقائق"
            illustration={<BookingIllustration />}
          />
          <FeatureCard
            title="كل المؤشرات في لوحة واحدة"
            description="تابع المبيعات والعضويات وسير الطلبات لحظياً عبر لوحة تحكم مصممة لتجيب عن أسئلتك فوراً."
            cta="منصتك خلال 3 دقائق"
            illustration={<DashboardIllustration />}
          />
          <FeatureCard
            title="سحب وإفلات سهل"
            description="صمم موقعك بسحب وإفلات العناصر بكل سهولة. لا تحتاج لخبرة برمجية، فقط اسحب العناصر وحركها."
            cta="ابدأ التصميم الآن"
            illustration={<DragIllustration />}
          />
          <FeatureCard
            title="تحليلات وإحصائيات"
            description="شاهد كيف يتفاعل عملاؤك مع موقعك وتحسن تجربة المستخدم. احصل على رؤى عميقة حول سلوك الزوار."
            cta="اكتشف المزيد"
            illustration={<AnalyticsIllustration />}
          />
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/templates"
            className="group mx-auto inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 text-lg font-bold text-white shadow-[0_8px_20px_rgba(232,93,93,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(232,93,93,0.5)]"
          >
            <span>ابدأ الآن مجاناً</span>
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  cta,
  illustration,
}: {
  title: string;
  description: string;
  cta: string;
  illustration: ReactNode;
}) {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-3xl border border-stone-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative z-10">
        <h3 className="mb-3 text-2xl font-bold text-stone-900 transition-colors group-hover:text-brand">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-stone-600">{description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
          <span>{cta}</span>
          <ArrowLeft size={12} className="-rotate-180" />
        </div>
      </div>
      <div className="mt-8 flex justify-center">{illustration}</div>
    </div>
  );
}

// =============================================================================
// Illustration tiles — purely decorative; each card has its own.
// =============================================================================

function IllustrationFrame({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      className={
        "relative flex h-40 w-64 items-center justify-center overflow-hidden rounded-2xl transition-transform duration-500 group-hover:scale-105 " +
        className
      }
    >
      {children}
    </div>
  );
}

function BookingIllustration() {
  return (
    <IllustrationFrame className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-2 h-14 w-20 rounded-lg bg-white shadow-sm" />
        <div className="absolute top-2 right-2 h-10 w-16 rounded-lg bg-blue-200" />
        <div className="absolute bottom-4 left-4 h-3 w-24 rounded bg-blue-200" />
        <div className="absolute bottom-8 left-4 h-3 w-16 rounded bg-blue-100" />
      </div>
      <div className="absolute right-0 bottom-0 h-24 w-32">
        <svg viewBox="0 0 100 80" className="h-full w-full">
          <rect
            x="10"
            y="30"
            width="60"
            height="40"
            rx="4"
            fill="#60a5fa"
            opacity="0.3"
          />
          <rect
            x="20"
            y="20"
            width="50"
            height="35"
            rx="3"
            fill="#3b82f6"
            opacity="0.4"
          />
          <circle cx="75" cy="25" r="8" fill="#fbbf24" />
        </svg>
      </div>
      <div className="absolute -bottom-2 -left-2 h-16 w-16 rounded-full bg-amber-100 opacity-60" />
    </IllustrationFrame>
  );
}

function DashboardIllustration() {
  return (
    <IllustrationFrame className="bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-28 w-40 rounded-lg border border-stone-100 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-orange-100" />
            <div className="h-2 w-20 rounded bg-stone-200" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-full rounded bg-orange-50" />
            <div className="flex gap-2">
              <div className="h-12 w-1/2 rounded bg-stone-50" />
              <div className="h-12 w-1/2 rounded bg-orange-100" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-4 -right-4 h-12 w-12">
        <svg viewBox="0 0 40 40" className="h-full w-full">
          <polygon points="20,5 35,35 5,35" fill="#f97316" opacity="0.6" />
        </svg>
      </div>
      <div className="absolute -bottom-2 left-4 h-8 w-8 rounded-full bg-orange-200" />
    </IllustrationFrame>
  );
}

function DragIllustration() {
  return (
    <IllustrationFrame className="bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="absolute inset-0 flex items-center justify-center gap-3">
        <div className="flex h-20 w-16 items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-white shadow-md">
          <Hand size={22} className="text-green-400" />
        </div>
        <div className="flex h-24 w-20 flex-col gap-2 rounded-lg bg-green-100 p-2 shadow-sm">
          <div className="h-2 w-full rounded bg-green-200" />
          <div className="h-2 w-2/3 rounded bg-green-200" />
          <div className="mt-auto h-8 w-8 self-center rounded-full bg-green-300" />
        </div>
      </div>
      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-green-200" />
    </IllustrationFrame>
  );
}

function AnalyticsIllustration() {
  return (
    <IllustrationFrame className="bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="absolute inset-0 flex items-end justify-center gap-2 pb-4">
        <div className="h-12 w-8 rounded-t bg-purple-300" />
        <div className="h-20 w-8 rounded-t bg-purple-400" />
        <div className="h-16 w-8 rounded-t bg-purple-300" />
        <div className="h-24 w-8 rounded-t bg-brand" />
        <div className="h-14 w-8 rounded-t bg-purple-300" />
      </div>
      <div className="absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
        <TrendingUp size={18} className="text-brand" />
      </div>
      <div className="absolute -bottom-4 right-8 h-16 w-16 rounded-full bg-pink-100 opacity-50" />
    </IllustrationFrame>
  );
}

// =============================================================================
// useTypewriter — cycles through `phrases`, typing + deleting each one.
// =============================================================================
function useTypewriter(phrases: string[]) {
  const [text, setText] = useState("");

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = phrases[phraseIndex];
      if (deleting) {
        charIndex -= 1;
      } else {
        charIndex += 1;
      }
      setText(current.slice(0, charIndex));

      let delay = deleting ? DELETE_SPEED_MS : TYPE_SPEED_MS;
      if (!deleting && charIndex === current.length) {
        deleting = true;
        delay = HOLD_AFTER_TYPE_MS;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = HOLD_AFTER_DELETE_MS;
      } else if (!deleting) {
        delay += Math.random() * 50 - 25;
      }
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, [phrases]);

  return text;
}
