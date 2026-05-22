"use client";

import { ArrowRight, Edit3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProjects } from "@/features/projects";
import { SectionRenderer } from "@/features/sections/SectionRenderer";
import type { Page, Project } from "@/features/projects";

/**
 * Public-feeling render of one of a project's pages. With no `slug` it
 * resolves to the home page. Stays in sync with the builder via
 * useProjects.subscribe (edit in another tab → see it here).
 */
export function PreviewRoot({
  projectId,
  slug,
}: {
  projectId: string;
  slug?: string;
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const store = useProjects.getState();
    store.hydrate();
    setProject(store.get(projectId) ?? null);
    setReady(true);
    const unsubscribe = useProjects.subscribe((s) => {
      setProject(s.projects[projectId] ?? null);
    });
    return unsubscribe;
  }, [projectId]);

  if (!ready) return <PreviewSkeleton />;

  if (!project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 text-center">
        <p className="mb-2 text-sm font-medium text-brand">المشروع غير موجود</p>
        <h1 className="text-2xl font-semibold text-stone-900">
          ما لقينا هذا المشروع محلياً
        </h1>
        <p className="mt-2 max-w-md text-sm text-stone-500">
          المشاريع تُحفظ في متصفحك. تأكد إنك على نفس الجهاز اللي بنيت فيه
          المشروع.
        </p>
        <Link
          href="/templates"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-dark"
        >
          ابدأ مشروعاً جديداً
          <ArrowRight size={14} />
        </Link>
      </main>
    );
  }

  const page = resolvePage(project, slug);

  if (!page) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 text-center">
        <p className="mb-2 text-sm font-medium text-brand">الصفحة غير موجودة</p>
        <h1 className="text-2xl font-semibold text-stone-900">
          صفحة "{slug}" غير موجودة في هذا المشروع
        </h1>
        <Link
          href={`/preview/${projectId}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-dark"
        >
          إلى الصفحة الرئيسية
          <ArrowRight size={14} />
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="divide-y divide-stone-100">
        {page.design.sections.length === 0 ? (
          <div className="flex min-h-screen items-center justify-center px-6 text-center text-stone-500">
            <p>لا توجد أقسام بعد في هذه الصفحة.</p>
          </div>
        ) : (
          page.design.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))
        )}
      </div>

      <Link
        href={`/builder/${projectId}${page.isHome ? "" : `?page=${page.slug}`}`}
        className="fixed top-4 end-4 z-50 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 px-4 py-2 text-xs font-medium text-stone-700 shadow-md backdrop-blur transition-colors hover:border-brand hover:text-brand"
      >
        <Edit3 size={14} />
        رجوع للمحرر
      </Link>
    </main>
  );
}

function resolvePage(project: Project, slug: string | undefined): Page | null {
  if (!slug) {
    return (
      project.pages.find((p) => p.isHome) ??
      [...project.pages].sort((a, b) => a.order - b.order)[0] ??
      null
    );
  }
  return project.pages.find((p) => p.slug === slug) ?? null;
}

function PreviewSkeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-stone-50 p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-16 rounded-2xl bg-stone-200" />
        <div className="h-72 rounded-2xl bg-stone-200" />
        <div className="h-48 rounded-2xl bg-stone-200" />
      </div>
    </main>
  );
}
