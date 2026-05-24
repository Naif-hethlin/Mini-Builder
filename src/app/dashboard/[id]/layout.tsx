// Route group layout — wraps every /dashboard/[id]/* route in the shared
// sidebar + top bar. Sub-page content goes into the layout's <main>.
//
// Server-side gate: unauthenticated visitors are bounced to the login
// overlay; signed-in visitors who don't own this project get a generic
// 404 (never the real dashboard chrome). The check runs in the layout
// so it covers every nested /dashboard/[id]/* route in one place.

import { DashboardShell } from "@/features/dashboard/DashboardShell";
import { requireProjectOwner } from "@/lib/route-guard";

// readSession touches cookies(); keep this route out of the prerender path.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireProjectOwner(id);
  return <DashboardShell projectId={id}>{children}</DashboardShell>;
}
