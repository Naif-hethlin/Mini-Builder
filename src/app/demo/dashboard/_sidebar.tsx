"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Globe,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

const NAV: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}> = [
  { href: "/demo/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/demo/dashboard/website", label: "الموقع", icon: Globe },
  { href: "/demo/dashboard/workflow", label: "الإدارة", icon: Briefcase, badge: "6" },
  { href: "/demo/dashboard/customers", label: "العملاء", icon: Users, badge: "342" },
  { href: "/demo/dashboard/settings", label: "الإعدادات", icon: Settings },
];

export function DemoSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-stone-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-stone-100 px-6">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
          <Sparkles size={16} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-stone-900">صالون أصايل</p>
          <p className="text-[10px] text-stone-500">عرض تجريبي</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          // Active when the current route is exactly this href, or (for
          // non-root tabs) starts with it — keeps the overview tab from
          // staying highlighted on every sub-route.
          const isOverview = href === "/demo/dashboard";
          const active = isOverview
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-brand-light font-bold text-brand"
                  : "font-medium text-stone-600 hover:bg-stone-50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} />
                {label}
              </span>
              {badge && (
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-600">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-stone-100 p-4">
        <Link
          href="/templates"
          className="group flex w-full items-center justify-between gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span>ابنِ لوحتك أنت</span>
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </aside>
  );
}
