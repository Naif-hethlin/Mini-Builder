"use client";

import {
  Briefcase,
  Globe,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/shared/ui/Logo";
import { cn } from "@/shared/lib/cn";

type NavItem = {
  href: (id: string) => string;
  match: (path: string, id: string) => boolean;
  label: string;
  Icon: LucideIcon;
};

const NAV: NavItem[] = [
  {
    href: (id) => `/dashboard/${id}`,
    match: (path, id) => path === `/dashboard/${id}`,
    label: "نظرة عامة",
    Icon: LayoutDashboard,
  },
  {
    href: (id) => `/dashboard/${id}/website`,
    match: (path, id) => path.startsWith(`/dashboard/${id}/website`),
    label: "الموقع",
    Icon: Globe,
  },
  {
    href: (id) => `/dashboard/${id}/workflow`,
    match: (path, id) => path.startsWith(`/dashboard/${id}/workflow`),
    label: "الإدارة",
    Icon: Briefcase,
  },
  {
    href: (id) => `/dashboard/${id}/customers`,
    match: (path, id) => path.startsWith(`/dashboard/${id}/customers`),
    label: "العملاء",
    Icon: Users,
  },
  {
    href: (id) => `/dashboard/${id}/settings`,
    match: (path, id) => path.startsWith(`/dashboard/${id}/settings`),
    label: "الإعدادات",
    Icon: Settings,
  },
];

/** Desktop-only side rail with the same nav. */
export function DashboardSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname() ?? "";
  return (
    <aside className="hidden h-full w-60 flex-col border-l border-stone-200 bg-white md:flex">
      <div className="border-b border-stone-100 px-5 py-4">
        <Link href="/" className="flex items-center">
          <Logo variant="wordmark" height={26} />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, match, label, Icon }) => {
          const active = match(pathname, projectId);
          return (
            <Link
              key={label}
              href={href(projectId)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-light text-brand"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-stone-100 p-3">
        <Link
          href={`/builder/${projectId}`}
          className="block rounded-xl bg-stone-900 px-3 py-2.5 text-center text-xs font-medium text-white transition-colors hover:bg-stone-800"
        >
          فتح المحرر
        </Link>
      </div>
    </aside>
  );
}

/** Mobile-only horizontal-scrolling pills strip with the same nav. */
export function DashboardMobileNav({ projectId }: { projectId: string }) {
  const pathname = usePathname() ?? "";
  return (
    <nav
      aria-label="تنقل لوحة التحكم"
      className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-stone-200 bg-white px-3 py-2 md:hidden"
    >
      {NAV.map(({ href, match, label, Icon }) => {
        const active = match(pathname, projectId);
        return (
          <Link
            key={label}
            href={href(projectId)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors",
              active
                ? "bg-brand text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900",
            )}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
