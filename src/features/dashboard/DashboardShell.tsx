"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useProjects } from "@/features/projects";
import { DashboardSidebar } from "./DashboardSidebar";

/**
 * Layout wrapper for /dashboard/[id]/* — sidebar + top bar + content slot.
 * The top bar surfaces the project name and a quick link to the preview.
 */
export function DashboardShell({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  // Hydrate once so the top bar can read the project name.
  useEffect(() => {
    useProjects.getState().hydrate();
  }, []);

  const project = useProjects((s) => s.projects[projectId]);

  return (
    <div className="flex h-screen bg-stone-50">
      <DashboardSidebar projectId={projectId} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-stone-200 bg-white px-5">
          <div className="min-w-0">
            <p className="text-xs text-stone-500">مشروع</p>
            <h1 className="truncate text-sm font-semibold text-stone-900">
              {project?.name ?? "..."}
            </h1>
          </div>
          <Link
            href={`/preview/${projectId}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-brand hover:text-brand"
          >
            معاينة الموقع
            <ExternalLink size={12} />
          </Link>
        </header>

        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
