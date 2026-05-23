"use client";

import {
  Eye,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

type VisitMetrics = {
  totalVisits: number;
  visitsThisMonth: number;
  visitsLast24h: number;
  uniqueVisitors: number;
  uniqueVisitorsThisMonth: number;
  spark14: number[];
  topOs: Array<{ os: string; count: number }>;
  topDevice: Array<{ device: string; count: number }>;
};

/**
 * Traffic stats for the dashboard Overview tab. Fetches the owner-only
 * metrics endpoint on mount; gracefully shows a "no traffic yet" state
 * when the project has zero visits (new project, or DB unreachable).
 */
export function TrafficPanel({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<VisitMetrics | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/visits`, {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (cancelled) return;
        const data = await res.json();
        if (res.ok && data.ok) {
          setMetrics(data.metrics as VisitMetrics);
        }
      } catch {
        // Silent — analytics is non-critical for the overview.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-400">
        <Loader2 size={16} className="animate-spin" />
      </div>
    );
  }

  if (!metrics || metrics.totalVisits === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
        <span className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <Eye size={18} />
        </span>
        <p className="text-sm font-semibold text-stone-700">
          لا توجد زيارات بعد
        </p>
        <p className="mt-1 text-xs text-stone-500">
          انشر موقعك وشاركه ليبدأ عدّاد الزيارات.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-bold text-stone-900">حركة الزيارات</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            آخر 14 يوماً مستخرجة من زيارات الموقع.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-2.5 py-1 text-[10px] font-medium text-stone-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          مباشر
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          label="زوّار فريدون"
          value={metrics.uniqueVisitors}
          accent
        />
        <MiniStat
          label="زيارات (الكل)"
          value={metrics.totalVisits}
          hint={`${metrics.uniqueVisitorsThisMonth.toLocaleString("ar")} زائر فريد هذا الشهر`}
        />
        <MiniStat label="هذا الشهر" value={metrics.visitsThisMonth} />
        <MiniStat label="آخر 24 ساعة" value={metrics.visitsLast24h} />
      </div>

      {/* 14-day spark */}
      <div>
        <p className="mb-2 text-[11px] font-medium text-stone-500">
          آخر 14 يوماً
        </p>
        <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-3">
          <Sparkline data={metrics.spark14} />
        </div>
      </div>

      {/* OS + device breakdowns */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Breakdown
          title="أنظمة التشغيل"
          items={metrics.topOs.map((r) => ({ label: r.os, count: r.count }))}
        />
        <Breakdown
          title="أنواع الأجهزة"
          items={metrics.topDevice.map((r) => ({
            label: DEVICE_LABEL[r.device as keyof typeof DEVICE_LABEL] ?? r.device,
            icon: DEVICE_ICON[r.device as keyof typeof DEVICE_ICON],
            count: r.count,
          }))}
        />
      </div>
    </div>
  );
}

const DEVICE_LABEL = {
  mobile: "جوّال",
  tablet: "تابلت",
  desktop: "حاسوب",
} as const;

const DEVICE_ICON: Record<string, LucideIcon> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

function MiniStat({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-xl border border-brand/20 bg-brand-light/40 p-4"
          : "rounded-xl border border-stone-100 bg-stone-50/50 p-4"
      }
    >
      <p
        className={
          accent
            ? "text-[11px] font-bold text-brand-dark"
            : "text-[11px] font-medium text-stone-500"
        }
      >
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-stone-900">
        {value.toLocaleString("ar")}
      </p>
      {hint && (
        <p className="mt-1 line-clamp-1 text-[10px] text-stone-500">{hint}</p>
      )}
    </div>
  );
}

function Breakdown({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number; icon?: LucideIcon }>;
}) {
  const total = items.reduce((a, i) => a + i.count, 0) || 1;
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium text-stone-500">{title}</p>
      <ul className="space-y-3">
        {items.map((item) => {
          const pct = Math.round((item.count / total) * 100);
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                  {Icon && <Icon size={12} />}
                  {item.label}
                </span>
                <span className="font-mono text-stone-500">
                  {pct}% · {item.count.toLocaleString("ar")}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null;
  const w = 100;
  const h = 30;
  const max = Math.max(...data, 1);
  const step = w / Math.max(1, data.length - 1);
  const points = data
    .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-12 w-full"
    >
      <polyline
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
