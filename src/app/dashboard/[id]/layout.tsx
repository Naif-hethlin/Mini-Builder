// Route group layout — wraps every /dashboard/[id]/* route in the shared
// sidebar + top bar. Sub-page content goes into the layout's <main>.

import { DashboardShell } from "@/features/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DashboardShell projectId={id}>{children}</DashboardShell>;
}
