"use client";

import {
  CalendarCheck,
  Eye,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { useBookings } from "@/features/workflows/booking/store";
import { useProjects } from "@/features/projects";
import { MOCK_ANALYTICS } from "./mock-data";

export function Overview() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    useBookings.getState().hydrate();
    useProjects.getState().hydrate();
  }, []);

  const bookings = useBookings((s) => s.byProject[id] ?? []);
  const project = useProjects((s) => s.projects[id]);
  const liveStatus =
    project && project.design.sections.length > 0 ? "نشط" : "مسودة";

  const sparkData = MOCK_ANALYTICS.visits.spark.map((v) => ({ v }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">نظرة عامة</h1>
        <p className="mt-1 text-sm text-stone-500">
          ملخص نشاط مشروعك خلال آخر فترة.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="الزيارات"
          value={MOCK_ANALYTICS.visits.total.toLocaleString("ar")}
          delta={`+${MOCK_ANALYTICS.visits.deltaPercent}%`}
          icon={TrendingUp}
        >
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
        </StatCard>

        <StatCard
          label="الحجوزات"
          value={bookings.length.toLocaleString("ar")}
          delta={`${bookings.filter((b) => b.status === "pending").length} قيد الانتظار`}
          icon={CalendarCheck}
        />

        <StatCard
          label="مشاهدات الصفحة"
          value={MOCK_ANALYTICS.pageViews.toLocaleString("ar")}
          delta={`${MOCK_ANALYTICS.conversionRate}% تحويل`}
          icon={Eye}
        />

        <StatCard
          label="حالة الموقع"
          value={liveStatus}
          delta={
            project
              ? `${project.design.sections.length} قسم منشور`
              : "—"
          }
          accent={liveStatus === "نشط" ? "green" : "stone"}
        />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">
          آخر النشاطات
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          {bookings.length === 0
            ? "لا توجد حجوزات بعد. أضف قسم نموذج حجز للموقع لاستقبال الحجوزات."
            : `آخر ${Math.min(bookings.length, 5)} حجوزات في صفحة الإدارة.`}
        </p>
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
      ? "bg-green-50 text-green-600"
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
