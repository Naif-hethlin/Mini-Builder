// /demo/dashboard/workflow — bookings list demo. Mirrors the real
// BookingsPanel layout: status tabs, day grouping, action chips.

import { CalendarCheck, CheckCircle2, Clock, XCircle } from "lucide-react";

export const metadata = {
  title: "الإدارة — عرض تجريبي — ركاز",
};
export const dynamic = "force-dynamic";

type Status = "pending" | "done" | "canceled";

const BOOKINGS: Array<{
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  staff: string;
  status: Status;
}> = [
  { id: "1", name: "نورة الشهري", phone: "+966 50 123 4567", service: "صبغة + قص", date: "اليوم", time: "06:30 م", staff: "نورة العنزي", status: "pending" },
  { id: "2", name: "عبدالله القحطاني", phone: "+966 55 234 5678", service: "حلاقة وتشذيب", date: "اليوم", time: "05:15 م", staff: "محمد الغامدي", status: "pending" },
  { id: "3", name: "هند المطيري", phone: "+966 53 345 6789", service: "كيراتين", date: "اليوم", time: "07:45 م", staff: "نورة العنزي", status: "pending" },
  { id: "4", name: "بدر السبيعي", phone: "+966 56 456 7890", service: "تدليك ظهر", date: "اليوم", time: "08:30 م", staff: "فهد الحربي", status: "pending" },
  { id: "5", name: "ريم العتيبي", phone: "+966 50 567 8901", service: "تنظيف بشرة", date: "اليوم", time: "03:00 م", staff: "ليلى السبيعي", status: "done" },
  { id: "6", name: "خالد المالكي", phone: "+966 55 678 9012", service: "تدليك ظهر", date: "اليوم", time: "01:45 م", staff: "فهد الحربي", status: "done" },
  { id: "7", name: "سارة الزهراني", phone: "+966 53 789 0123", service: "كيراتين", date: "أمس", time: "07:20 م", staff: "نورة العنزي", status: "done" },
  { id: "8", name: "منى الحارثي", phone: "+966 50 890 1234", service: "صبغة شعر", date: "أمس", time: "04:00 م", staff: "نورة العنزي", status: "done" },
  { id: "9", name: "ماجد الدوسري", phone: "+966 55 901 2345", service: "حلاقة وذقن", date: "أمس", time: "05:00 م", staff: "محمد الغامدي", status: "canceled" },
];

const STATUS_META: Record<Status, { label: string; chip: string; Icon: typeof Clock }> = {
  pending: { label: "قيد الانتظار", chip: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock },
  done: { label: "مكتمل", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
  canceled: { label: "ملغى", chip: "bg-stone-100 text-stone-500 border-stone-200", Icon: XCircle },
};

export default function WorkflowPage() {
  const counts = {
    all: BOOKINGS.length,
    pending: BOOKINGS.filter((b) => b.status === "pending").length,
    done: BOOKINGS.filter((b) => b.status === "done").length,
    canceled: BOOKINGS.filter((b) => b.status === "canceled").length,
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-stone-900">الإدارة</h1>
        <p className="mt-1 text-sm text-stone-500">
          كل حجوزاتك في مكان واحد — أكّد، أكمل، أو ألغِ بنقرة.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-white p-2">
        <FilterChip label="الكل" count={counts.all} active />
        <FilterChip label="قيد الانتظار" count={counts.pending} />
        <FilterChip label="مكتمل" count={counts.done} />
        <FilterChip label="ملغى" count={counts.canceled} />
      </div>

      {/* Bookings table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 bg-stone-50/60 px-6 py-3">
          <div className="grid grid-cols-12 gap-4 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            <div className="col-span-3">العميل</div>
            <div className="col-span-3">الخدمة</div>
            <div className="col-span-2">الموعد</div>
            <div className="col-span-2">الموظف</div>
            <div className="col-span-2 text-end">الحالة</div>
          </div>
        </div>

        <ul className="divide-y divide-stone-100">
          {BOOKINGS.map((b) => {
            const meta = STATUS_META[b.status];
            return (
              <li key={b.id} className="grid grid-cols-12 items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-stone-50/50">
                <div className="col-span-3 min-w-0">
                  <p className="truncate font-semibold text-stone-900">{b.name}</p>
                  <p className="mt-0.5 truncate font-mono text-xs text-stone-500" dir="ltr">{b.phone}</p>
                </div>
                <div className="col-span-3 truncate text-stone-700">{b.service}</div>
                <div className="col-span-2 font-mono text-xs text-stone-600">
                  <div>{b.date}</div>
                  <div className="text-stone-400">{b.time}</div>
                </div>
                <div className="col-span-2 truncate text-xs text-stone-600">{b.staff}</div>
                <div className="col-span-2 flex justify-end">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.chip}`}>
                    <meta.Icon size={11} />
                    {meta.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/40 px-6 py-3 text-xs text-stone-500">
          <span>إجمالي: {BOOKINGS.length} حجز</span>
          <span className="flex items-center gap-1.5">
            <CalendarCheck size={12} />
            تحديث تلقائي
          </span>
        </div>
      </div>
    </>
  );
}

function FilterChip({ label, count, active = false }: { label: string; count: number; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-brand text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 text-[10px] font-mono ${active ? "bg-white/20" : "bg-stone-200/70"}`}>
        {count}
      </span>
    </span>
  );
}
