// Global 404 — branded fallback rendered whenever a server component
// calls notFound() or the URL doesn't match a route. Replaces the
// default Next.js "404 / This page could not be found." page so the
// auth-gate redirects (e.g. opening someone else's /dashboard/<id>)
// land on something that still looks like ركاز.

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Logo } from "@/shared/ui/Logo";

export const metadata = {
  title: "الصفحة غير موجودة — ركاز",
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-10 text-stone-800">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <Logo variant="wordmark" height={36} className="mb-10" />

        <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-brand-light px-4 py-1.5 text-xs font-bold tracking-wide text-brand">
          خطأ 404
        </div>

        <h1 className="mb-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
          ما لقينا الصفحة
        </h1>
        <p className="mb-10 text-sm leading-relaxed text-stone-500 sm:text-base">
          الرابط اللي وصلت له ما يقابل أي صفحة عندك — يمكن انحذف، أو
          الرابط ناقص، أو ما عندك صلاحية تشوفها.
        </p>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-colors hover:bg-brand-dark"
          >
            <Home size={16} />
            للصفحة الرئيسية
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-50"
          >
            ابدأ موقع جديد
            <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
