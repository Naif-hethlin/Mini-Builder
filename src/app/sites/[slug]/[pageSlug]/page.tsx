// Route: /sites/[slug]/[pageSlug] — non-home pages of a published project.

import { notFound } from "next/navigation";
import { getPublishedBySlug } from "@/lib/projects-repo";
import { SectionRenderer } from "@/features/sections/SectionRenderer";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
}): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  const project = await getPublishedBySlug(slug);
  if (!project) return { title: "غير موجود" };
  const page = project.pages.find((p) => p.slug === pageSlug);
  if (!page) return { title: "غير موجود" };
  return {
    title: `${page.name} — ${project.name}`,
    description: `${page.name} — موقع ${project.name}.`,
    openGraph: {
      title: `${page.name} — ${project.name}`,
      description: `${page.name} — موقع ${project.name}.`,
      type: "website",
    },
  };
}

export default async function PublishedPage({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
}) {
  const { slug, pageSlug } = await params;
  const project = await getPublishedBySlug(slug);
  if (!project) notFound();

  const page = project.pages.find((p) => p.slug === pageSlug);
  if (!page) notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="divide-y divide-stone-100">
        {page.design.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>

      <footer className="flex items-center justify-center border-t border-stone-100 bg-stone-50 py-4 text-xs text-stone-400">
        <a
          href="/"
          className="hover:text-brand"
          target="_blank"
          rel="noopener noreferrer"
        >
          صُمم على ركاز
        </a>
      </footer>
    </main>
  );
}
