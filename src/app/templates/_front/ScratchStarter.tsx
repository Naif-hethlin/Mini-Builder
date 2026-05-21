"use client";

import { useRouter } from "next/navigation";
import { useProjects } from "@/features/projects";

/**
 * Single "start from scratch" action — creates an empty project in
 * localStorage and routes into /builder/[id]. Phase 12 replaces this with
 * a richer template selector (Barber / Coffee / Photography).
 */
export function ScratchStarter() {
  const router = useRouter();

  const handleStart = () => {
    useProjects.getState().hydrate();
    const project = useProjects
      .getState()
      .create({ name: "مشروعي الأول" });
    router.push(`/builder/${project.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleStart}
      className="group rounded-2xl border border-stone-200 bg-white p-8 text-right transition-all hover:border-brand hover:shadow-sm focus-visible:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-1"
    >
      <p className="text-sm font-medium text-stone-700 group-hover:text-brand">
        ابدأ من الصفر
      </p>
      <p className="mt-1.5 text-xs text-stone-500">
        صفحة فارغة، أنت تختار الأقسام بنفسك.
      </p>
    </button>
  );
}
