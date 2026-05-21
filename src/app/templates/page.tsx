// Route: /templates
//
// Placeholder until Phase 12. Currently offers a single "Start from scratch"
// action that creates an empty project and routes into the builder.

import { Logo } from "@/shared/ui/Logo";
import { ScratchStarter } from "./_front/ScratchStarter";

export const metadata = {
  title: "اختر بداية — ركاز",
};

export default function TemplatesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-stone-50 px-6 py-16">
      <div className="w-full max-w-3xl text-center">
        <Logo height={44} className="mx-auto mb-6" />
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          اختر بداية لمشروعك
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          الإطار الكامل للقوالب الجاهزة يصل في المرحلة القادمة. حالياً تقدر
          تبدأ بصفحة فارغة وتضيف الأقسام يدويًا.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <ScratchStarter />
          <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-100 p-8 text-stone-500">
            <p className="text-sm font-medium text-stone-700">قوالب جاهزة</p>
            <p className="mt-1.5 text-xs">قريباً — حلاق، مقهى، مصور.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
