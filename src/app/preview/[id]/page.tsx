// Route: /preview/[id]
//
// Public-feeling render of the project — no builder UI. The interactive
// pieces (Booking submit, Contact form, FAQ accordion) work for real here
// just like they do on a published site.

import { PreviewRoot } from "@/features/preview/PreviewRoot";

export const metadata = {
  title: "معاينة — ركاز",
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreviewRoot projectId={id} />;
}
