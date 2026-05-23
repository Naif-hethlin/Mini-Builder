// Shared shell for every /demo/dashboard/* page — left sidebar with all
// five tabs working as real navigation, sticky demo banner with the
// "ابدأ مجاناً" CTA, scrollable content area.

import Link from "next/link";
import { ArrowLeft, Eye, Sparkles } from "lucide-react";
import { DemoSidebar } from "./_sidebar";

export default function DemoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-800">
      <DemoSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky demo banner */}
        <div className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <div className="flex min-w-0 items-center gap-2 text-xs text-stone-700 sm:text-sm">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                <Eye size={14} />
              </span>
              <span className="truncate font-bold">عرض تجريبي للوحة التحكم</span>
              <span className="hidden text-stone-500 lg:inline">
                — هذه أرقام وهمية. وقّع ودخّل بيانات حقيقية في دقيقة.
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/demo"
                className="hidden rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 sm:inline-flex"
              >
                ← شاهد الموقع
              </Link>
              <Link
                href="/templates"
                className="group inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm shadow-brand/30 transition-all hover:-translate-y-0.5 sm:text-sm"
              >
                <Sparkles size={14} />
                <span>ابدأ مجاناً</span>
                <ArrowLeft
                  size={14}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="mx-auto max-w-5xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
