"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  Layers,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { cn } from "@/shared/lib/cn";
import { EmptyState } from "@/shared/ui/EmptyState";
import {
  EMPTY_BOOKINGS,
  useBookings,
} from "@/features/workflows/booking/store";
import { useProjects } from "@/features/projects";
import { metricsFromBookings, recentBookings } from "./derive";
import { TrafficPanel } from "./TrafficPanel";

const STATUS_LABEL: Record<"pending" | "done" | "canceled", string> = {
  pending: "قيد الانتظار",
  done: "مكتمل",
  canceled: "ملغى",
};

const STATUS_CHIP: Record<"pending" | "done" | "canceled", string> = {
  pending: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
  canceled: "bg-stone-100 text-stone-500",
};

export function Overview() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    useBookings.getState().hydrate();
    useProjects.getState().hydrate();
  }, []);

  const bookings = useBookings((s) => s.byProject[id] ?? EMPTY_BOOKINGS);
  const project = useProjects((s) => s.projects[id]);
  const metrics = useMemo(() => metricsFromBookings(bookings), [bookings]);
  const activity = useMemo(() => recentBookings(bookings, 5), [bookings]);

  const totalSections =
    project?.pages.reduce((acc, p) => acc + p.design.sections.length, 0) ?? 0;
  const liveStatus = totalSections > 0 ? "نشط" : "مسودة";

  const sparkData = metrics.spark.map((v) => ({ v }));
  const trendUp = metrics.trendPercent >= 0;
  const TrendIcon = trendUp ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">نظرة عامة</h1>
        <p className="mt-1 text-sm text-stone-500">
          أرقام مشروعك مستخرجة من الحجوزات الحقيقية في المتجر.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="الحجوزات (الكل)"
          value={metrics.totalBookings.toLocaleString("ar")}
          delta={
            metrics.totalBookings === 0
              ? "—"
              : `${metrics.pendingBookings} قيد الانتظار · ${metrics.doneBookings} مكتمل`
          }
          icon={CalendarCheck}
        >
          {metrics.totalBookings > 0 && (
            <div className="-mx-2 mt-2 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="var(--color-brand)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </StatCard>

        <StatCard
          label="هذا الشهر"
          value={metrics.bookingsThisMonth.toLocaleString("ar")}
          delta={
            metrics.bookingsLastMonth === 0 && metrics.bookingsThisMonth === 0
              ? "لا مقارنة بعد"
              : `${trendUp ? "+" : ""}${metrics.trendPercent}% عن الشهر السابق`
          }
          accent={trendUp ? "green" : "stone"}
          icon={TrendIcon}
        />

        <StatCard
          label="العملاء"
          value={metrics.totalCustomers.toLocaleString("ar")}
          delta={
            metrics.newCustomersThisMonth > 0
              ? `+${metrics.newCustomersThisMonth} جديد هذا الشهر`
              : "لا جدد هذا الشهر"
          }
          icon={Users}
        />

        <StatCard
          label="حالة الموقع"
          value={liveStatus}
          delta={
            project
              ? `${totalSections} قسم في ${project.pages.length} صفحة`
              : "—"
          }
          icon={Layers}
          accent={liveStatus === "نشط" ? "green" : "stone"}
        />
      </div>

      <TrafficPanel projectId={id} />

      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">
              آخر النشاطات
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              {bookings.length === 0
                ? "لا توجد حجوزات بعد."
                : `آخر ${activity.length} حجوزات.`}
            </p>
          </div>
          {bookings.length > 0 && (
            <Link
              href={`/dashboard/${id}/workflow`}
              className="text-xs font-medium text-brand hover:text-brand-dark"
            >
              عرض الكل ←
            </Link>
          )}
        </div>

        {activity.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={CalendarCheck}
              title="لا حجوزات بعد"
              description="أضف قسم نموذج حجز للموقع لاستقبال أول حجوزاتك."
              className="border-0 shadow-none"
            />
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {activity.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">
                    {b.name}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-stone-500">
                    {b.date} · {b.time}
                    {b.staffName ? ` · ${b.staffName}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    STATUS_CHIP[b.status],
                  )}
                >
                  {STATUS_LABEL[b.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "brand",
  children,
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: LucideIcon;
  accent?: "brand" | "green" | "stone";
  children?: React.ReactNode;
}) {
  const chip =
    accent === "green"
      ? "bg-emerald-50 text-emerald-600"
      : accent === "stone"
        ? "bg-stone-100 text-stone-600"
        : "bg-brand-light text-brand";

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        {Icon && (
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-md ${chip}`}
          >
            <Icon size={14} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      {delta && <p className="mt-1 text-xs text-stone-500">{delta}</p>}
      {children}
    </div>
  );
}
