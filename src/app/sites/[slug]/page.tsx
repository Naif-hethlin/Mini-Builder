// Route: /sites/[slug]
//
// Public-facing render of a published project's home page. Server
// component — reads directly from Postgres by slug, no auth required.
// 404s if the slug is unknown or the project hasn't been published.

import { notFound } from "next/navigation";
import { getPublishedBySlug } from "@/lib/projects-repo";
import { SectionRenderer } from "@/features/sections/SectionRenderer";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedBySlug(slug);
  if (!project) return { title: "غير موجود" };
  return {
    title: `${project.name} — ركاز`,
    description: `موقع ${project.name} — صُمم على ركاز.`,
    openGraph: {
      title: project.name,
      description: `موقع ${project.name} — صُمم على ركاز.`,
      type: "website",
    },
  };
}

export default async function PublishedSite({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublishedBySlug(slug);
  if (!project) notFound();

  const home =
    project.pages.find((p) => p.isHome) ??
    [...project.pages].sort((a, b) => a.order - b.order)[0];
  if (!home) notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="divide-y divide-stone-100">
        {home.design.sections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </div>

      {/* Subtle "built on Rekaz" footer attribution */}
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
