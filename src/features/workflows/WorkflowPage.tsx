"use client";

import { Calendar, Coffee, Image as ImageIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useProjects } from "@/features/projects";
import { cn } from "@/shared/lib/cn";
import { BookingsPanel } from "./booking/BookingsPanel";
import { MenuPanel } from "./menu/MenuPanel";
import { PortfolioPanel } from "./portfolio/PortfolioPanel";

type Tab = "bookings" | "menu" | "portfolio";

const TAB_META: Record<
  Tab,
  { label: string; icon: typeof Calendar; matchesType?: string }
> = {
  bookings: { label: "الحجوزات", icon: Calendar, matchesType: "barber" },
  menu: { label: "القائمة", icon: Coffee, matchesType: "coffee" },
  portfolio: {
    label: "معرض الأعمال",
    icon: ImageIcon,
    matchesType: "photography",
  },
};

export function WorkflowPage() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    useProjects.getState().hydrate();
  }, []);

  const project = useProjects((s) => s.projects[id]);

  // Default active tab follows the project's templateType, falling back to
  // bookings (always available — submissions live in their own store).
  const defaultTab: Tab = useMemo(() => {
    if (!project?.templateType) return "bookings";
    if (project.templateType === "coffee") return "menu";
    if (project.templateType === "photography") return "portfolio";
    return "bookings";
  }, [project?.templateType]);

  const [tab, setTab] = useState<Tab>(defaultTab);

  // Keep tab in sync if templateType changes (e.g. after project loaded).
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">إدارة العمل</h1>
        <p className="mt-1 text-sm text-stone-500">
          الحجوزات الواردة، أصناف القائمة، وأعمال المعرض — كلها في مكان واحد.
        </p>
      </div>

      <div className="inline-flex rounded-xl bg-stone-100 p-1">
        {(Object.keys(TAB_META) as Tab[]).map((key) => {
          const { label, icon: Icon } = TAB_META[key];
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-900",
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      <div>
        {tab === "bookings" && <BookingsPanel projectId={id} />}
        {tab === "menu" && <MenuPanel projectId={id} />}
        {tab === "portfolio" && <PortfolioPanel projectId={id} />}
      </div>
    </div>
  );
}
