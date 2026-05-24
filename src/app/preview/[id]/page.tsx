// Route: /preview/[id]
//
// Owner-only preview of the project — no builder UI. The interactive
// pieces (Booking submit, Contact form, FAQ accordion) work for real
// here just like they do on a published site. Public visitors should
// hit /sites/<slug> instead; that path skips the auth gate.

import { PreviewRoot } from "@/features/preview/PreviewRoot";
import { requireProjectOwner } from "@/lib/route-guard";

export const metadata = {
  title: "معاينة — ركاز",
};

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireProjectOwner(id);
  return <PreviewRoot projectId={id} />;
}
