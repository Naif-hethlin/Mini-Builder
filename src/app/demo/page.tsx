// Route: /demo
//
// Read-only Rekaz-styled showcase. Anonymous visitors land here when they
// click "شاهد العرض التجريبي" on the landing page or under the auth
// overlay. The page renders a faithful clone of rekaz.io built entirely
// from the same exploded primitives the builder produces, with a sticky
// banner that nudges visitors to sign up and build their own.
//
// Rendering goes through the regular SectionRenderer — no builder UI, no
// edit handles, no drag affordances — so what you see is exactly what a
// user could produce with the builder if they assembled the same sections.

import Link from "next/link";
import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import { SectionRenderer } from "@/features/sections/SectionRenderer";
import { rekazDemoDesign } from "@/features/sections/rekazDemo";

export const metadata = {
  title: "عرض تجريبي — ركاز",
  description:
    "موقع كامل مبني بمنصة ركاز. شاهد ما يمكن بناؤه من سحب وإفلات قبل أن تبدأ.",
};

// SectionRenderer pulls in primitives that ultimately call useSearchParams
// (PrimitiveActionWrapper handles navigate actions via the router). Without
// force-dynamic, Next's prerender chokes on the client hook at build time.
export const dynamic = "force-dynamic";

export default function DemoPage() {
  const design = rekazDemoDesign();

  return (
    <main className="min-h-screen bg-white">
      {/* Top banner — sticky so the "this is the builder talking" framing
          stays visible while the visitor scrolls through what looks like a
          real product site. */}
      <div className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-stone-700 sm:gap-3 sm:text-sm">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
              <Eye size={14} />
            </span>
            <span className="font-bold">عرض تجريبي</span>
            <span className="hidden text-stone-500 sm:inline">
              — هذا الموقع كاملاً مبني بسحب وإفلات داخل ركاز.
            </span>
          </div>
          <Link
            href="/templates"
            className="group inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-md sm:px-5 sm:text-sm"
          >
            <Sparkles size={14} />
            <span>ابنِ موقعك أنت</span>
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-stone-100">
        {design.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>

      {/* Bottom "ready to start" repeat CTA — by the time the visitor scrolls
          this far we've earned the second ask. */}
      <div className="border-t border-stone-100 bg-stone-50">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <Sparkles size={22} />
          </span>
          <h2 className="text-2xl font-extrabold text-stone-900 sm:text-3xl">
            كل ما شاهدته بُني من نفس العناصر التي ستحصل عليها
          </h2>
          <p className="max-w-xl text-sm text-stone-600 sm:text-base">
            عناوين، أزرار، صور، شبكات، نماذج — قابلة للسحب والتلوين والتدوير
            وتغيير الحجم. لا حدود.
          </p>
          <Link
            href="/templates"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-base font-bold text-white shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            ابدأ بناء موقعك مجاناً
            <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
