// Route: /preview/[id]/[slug]
//
// Non-home page within a project. /preview/[id] (no slug) resolves to home.

import { PreviewRoot } from "@/features/preview/PreviewRoot";

export const metadata = {
  title: "معاينة — ركاز",
};

export default async function PreviewSlugPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  return <PreviewRoot projectId={id} slug={slug} />;
}
