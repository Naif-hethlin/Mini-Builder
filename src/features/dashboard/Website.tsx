"use client";

import {
  Edit3,
  Eye,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useProjects } from "@/features/projects";

export function Website() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    useProjects.getState().hydrate();
  }, []);

  const project = useProjects((s) => s.projects[id]);
  const sectionCount = project?.design.sections.length ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">إدارة الموقع</h1>
        <p className="mt-1 text-sm text-stone-500">
          {sectionCount > 0
            ? `موقعك يحتوي حالياً على ${sectionCount} قسم.`
            : "موقعك فارغ — أضف أقساماً من المحرر."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ActionCard
          href={`/builder/${id}`}
          icon={Edit3}
          title="تحرير الموقع"
          description="افتح المحرر لإضافة أو تعديل الأقسام."
        />
        <ActionCard
          href={`/preview/${id}`}
          icon={Eye}
          title="معاينة الموقع"
          description="افتح الموقع كأنك زائر — بدون أدوات التحرير."
          external
        />
        <ActionCard
          icon={Rocket}
          title="نشر الموقع"
          description="ربط نطاق خاص ونشر الموقع للعالم."
          onClick={() =>
            toast.info(
              "النشر التلقائي قريباً — استخدم تصدير JSON من المحرر حالياً.",
            )
          }
          accent
        />
      </div>
    </div>
  );
}

function ActionCard({
  href,
  external,
  icon: Icon,
  title,
  description,
  onClick,
  accent = false,
}: {
  href?: string;
  external?: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  accent?: boolean;
}) {
  const body = (
    <div
      className={`group flex h-full flex-col rounded-2xl border p-5 text-start transition-all hover:shadow-md ${
        accent
          ? "border-brand/30 bg-brand-light/40 hover:border-brand"
          : "border-stone-200 bg-white hover:border-brand/40"
      }`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
          accent ? "bg-brand text-white" : "bg-brand-light text-brand"
        }`}
      >
        <Icon size={18} />
      </div>
      <h3 className="text-base font-semibold text-stone-900 group-hover:text-brand">
        {title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
        {description}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} target={external ? "_blank" : undefined}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block text-start">
      {body}
    </button>
  );
}
