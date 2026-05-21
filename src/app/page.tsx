// Landing route: /
//
// Placeholder shell — the full landing page lands in Phase 11. For now we
// just give visitors a path into the builder.

import Link from "next/link";

export const metadata = {
  title: "ركاز — منصة إنشاء مواقع الأعمال",
};

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-tint-peach px-6 text-center">
      <div className="max-w-xl">
        <p className="mb-3 text-sm font-medium text-brand">ركاز</p>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          أنشئ موقع عملك بدون كود
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600">
          قوالب جاهزة، تخصيص مرن، وأدوات مبسطة لإدارة مشروعك — كل ذلك في
          منصة واحدة.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/templates"
            className="inline-flex h-12 items-center rounded-xl bg-brand px-6 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            ابدأ الآن
          </Link>
        </div>
      </div>
    </main>
  );
}
