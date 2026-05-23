// Route: /builder/[id]
//
// Server Component that resolves the project ID from the URL and mounts the
// (client) Builder. All interactive work lives inside <Builder>.

import { Builder } from "@/features/builder/Builder";

export const metadata = {
  title: "البناء — ركاز",
};

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Builder projectId={id} />;
}
