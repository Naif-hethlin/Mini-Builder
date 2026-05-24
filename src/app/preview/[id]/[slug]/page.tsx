// Route: /preview/[id]/[slug]
//
// Non-home page within a project. /preview/[id] (no slug) resolves to home.
// Same owner-only gate as the parent route — the preview is for the
// owner, not the public.

import { PreviewRoot } from "@/features/preview/PreviewRoot";
import { requireProjectOwner } from "@/lib/route-guard";

export const metadata = {
  title: "معاينة — ركاز",
};

export const dynamic = "force-dynamic";

export default async function PreviewSlugPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  await requireProjectOwner(id);
  return <PreviewRoot projectId={id} slug={slug} />;
}
