// Route: /builder/[id]
//
// Server Component that resolves the project ID from the URL and mounts the
// (client) Builder. All interactive work lives inside <Builder>.
//
// Server-side gate: visitors without a session land on the login overlay;
// signed-in visitors who don't own this project get a generic 404 — never
// the builder chrome of someone else's site.

import { Builder } from "@/features/builder/Builder";
import { requireProjectOwner } from "@/lib/route-guard";

export const metadata = {
  title: "البناء — ركاز",
};

export const dynamic = "force-dynamic";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireProjectOwner(id);
  return <Builder projectId={id} />;
}
