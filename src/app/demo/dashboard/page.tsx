// /demo/dashboard — overview tab. Sidebar + banner come from layout.tsx;
// this page only renders the overview body content.

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarCheck,
  Layers,
  Users,
  type LucideIcon,
} from "lucide-react";

export const metadata = {
  title: "نظرة عامة — عرض تجريبي — ركاز",
};
export const dynamic = "force-dynamic";

const SPARK = [4, 6, 5, 9, 7, 11, 13, 10, 15, 17, 16, 22, 19, 24];

const RECENT_BOOKINGS: Array<{
  id: string;
  name: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "done" | "canceled";
}> = [
  { id: "b8", name: "نورة الشهري", service: "صبغة + قص", date: "اليوم", time: "06:30 م", status: "pending" },
  { id: "b7", name: "عبدالله القحطاني", service: "حلاقة وتشذيب", date: "اليوم", time: "05:15 م", status: "pending" },
  { id: "b6", name: "ريم العتيبي", service: "تنظيف بشرة", date: "اليوم", time: "03:00 م", status: "done" },
  { id: "b5", name: "خالد المالكي", service: "تدليك ظهر", date: "اليوم", time: "01:45 م", status: "done" },
  { id: "b4", name: "سارة الزهراني", service: "كيراتين", date: "أمس", time: "07:20 م", status: "done" },
  { id: "b3", name: "ماجد الدوسري", service: "حلاقة وذقن", date: "أمس", time: "05:00 م", status: "canceled" },
];

const TOP_SERVICES = [
  { name: "صبغة شعر", count: 142, revenue: 21300 },
  { name: "تنظيف بشرة عميق", count: 118, revenue: 17700 },
  { name: "قص + تصفيف", count: 96, revenue: 8640 },
  { name: "كيراتين", count: 74, revenue: 22200 },
];

const STAFF = [
  { name: "نورة العنزي", role: "أخصائية شعر", booked: 84, color: "bg-rose-100 text-rose-700" },
  { name: "محمد الغامدي", role: "حلاق رئيسي", booked: 71, color: "bg-sky-100 text-sky-700" },
  { name: "ليلى السبيعي", role: "أخصائية بشرة", booked: 58, color: "bg-emerald-100 text-emerald-700" },
  { name: "فهد الحربي", role: "مدلك معتمد", booked: 43, color: "bg-amber-100 text-amber-700" },
];

const STATUS_LABEL = { pending: "قيد الانتظار", done: "مكتمل", canceled: "ملغى" } as const;
const STATUS_CHIP = {
  pending: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
  canceled: "bg-stone-100 text-stone-500",
} as const;

export default function OverviewPage() {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">نظرة عامة</h1>
          <p className="mt-1 text-sm text-stone-500">
            أرقام مشروعك مستخرجة من الحجوزات في صالون أصايل.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          مباشر منذ 47 دقيقة
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="الحجوزات (الكل)" value="1,284" delta="6 قيد الانتظار · 1,128 مكتمل" icon={CalendarCheck} spark />
        <StatCard label="هذا الشهر" value="312" delta="+34% عن الشهر السابق" icon={ArrowUpRight} accent="green" />
        <StatCard label="العملاء" value="342" delta="+28 جديد هذا الشهر" icon={Users} />
        <StatCard label="إيرادات الشهر" value="69,840 ر.س" delta="+22% — أعلى شهر حتى الآن" icon={Layers} accent="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">آخر النشاطات</h2>
              <p className="mt-0.5 text-xs text-stone-500">آخر {RECENT_BOOKINGS.length} حجوزات.</p>
            </div>
            <Link href="/demo/dashboard/workflow" className="text-xs font-medium text-brand hover:text-brand-dark">
              عرض الكل ←
            </Link>
          </div>
          <ul className="divide-y divide-stone-100">
            {RECENT_BOOKINGS.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-900">{b.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-stone-500">{b.date} · {b.time} · {b.service}</p>
                </div>
                <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CHIP[b.status]}`}>
                  {STATUS_LABEL[b.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-stone-900">أفضل الخدمات</h2>
            <p className="mt-0.5 text-xs text-stone-500">خلال آخر 30 يوم.</p>
          </div>
          <ul className="space-y-4 p-6">
            {TOP_SERVICES.map((s) => {
              const pct = Math.round((s.count / TOP_SERVICES[0].count) * 100);
              return (
                <li key={s.name}>
                  <div className="mb-1.5 flex items-baseline justify-between text-xs">
                    <span className="font-medium text-stone-800">{s.name}</span>
                    <span className="font-mono text-stone-500">{s.count} حجز</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-stone-500">{s.revenue.toLocaleString("ar")} ر.س</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-stone-900">أداء الفريق</h2>
          <p className="mt-0.5 text-xs text-stone-500">حجوزات هذا الشهر لكل موظف.</p>
        </div>
        <div className="grid gap-px bg-stone-100 sm:grid-cols-2 lg:grid-cols-4">
          {STAFF.map((s) => (
            <div key={s.name} className="flex items-center gap-3 bg-white p-5">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.color}`}>
                {s.name[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">{s.name}</p>
                <p className="truncate text-xs text-stone-500">{s.role}</p>
                <p className="mt-1 text-xs font-mono text-brand">{s.booked} حجز</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-l from-brand-light to-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-stone-900 sm:text-xl">
              هذه اللوحة جاهزة لك — ابدأ اليوم.
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              موقع + لوحة تحكم + استقبال حجوزات. دقائق فقط.
            </p>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            أنشئ حسابي مجاناً
            <ArrowLeft size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label, value, delta, icon: Icon, accent = "brand", spark = false,
}: {
  label: string; value: string; delta?: string; icon?: LucideIcon;
  accent?: "brand" | "green" | "stone"; spark?: boolean;
}) {
  const chip =
    accent === "green" ? "bg-emerald-50 text-emerald-600"
      : accent === "stone" ? "bg-stone-100 text-stone-600"
      : "bg-brand-light text-brand";
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        {Icon && (
          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${chip}`}>
            <Icon size={14} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      {delta && <p className="mt-1 text-xs text-stone-500">{delta}</p>}
      {spark && (
        <div className="-mx-1 mt-3 h-12">
          <Sparkline data={SPARK} />
        </div>
      )}
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 100, h = 30;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
      <polyline fill="none" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
