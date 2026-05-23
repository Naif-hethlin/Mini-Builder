// /demo/dashboard/customers — customer table demo with search hint,
// total visits, last-visit dates, status chips.

import { Mail, MessageCircle, Phone, Search } from "lucide-react";

export const metadata = {
  title: "العملاء — عرض تجريبي — ركاز",
};
export const dynamic = "force-dynamic";

const CUSTOMERS = [
  { name: "نورة الشهري", phone: "+966 50 123 4567", visits: 12, lastVisit: "اليوم", spend: "3,840", color: "bg-rose-100 text-rose-700" },
  { name: "عبدالله القحطاني", phone: "+966 55 234 5678", visits: 8, lastVisit: "اليوم", spend: "1,920", color: "bg-sky-100 text-sky-700" },
  { name: "هند المطيري", phone: "+966 53 345 6789", visits: 15, lastVisit: "اليوم", spend: "4,500", color: "bg-emerald-100 text-emerald-700" },
  { name: "ريم العتيبي", phone: "+966 50 567 8901", visits: 6, lastVisit: "اليوم", spend: "1,080", color: "bg-amber-100 text-amber-700" },
  { name: "خالد المالكي", phone: "+966 55 678 9012", visits: 4, lastVisit: "اليوم", spend: "720", color: "bg-violet-100 text-violet-700" },
  { name: "سارة الزهراني", phone: "+966 53 789 0123", visits: 11, lastVisit: "أمس", spend: "3,300", color: "bg-rose-100 text-rose-700" },
  { name: "منى الحارثي", phone: "+966 50 890 1234", visits: 9, lastVisit: "أمس", spend: "2,700", color: "bg-sky-100 text-sky-700" },
  { name: "ماجد الدوسري", phone: "+966 55 901 2345", visits: 3, lastVisit: "أمس", spend: "240", color: "bg-stone-100 text-stone-600" },
  { name: "أحمد العنزي", phone: "+966 50 012 3456", visits: 7, lastVisit: "قبل 3 أيام", spend: "1,560", color: "bg-emerald-100 text-emerald-700" },
  { name: "فاطمة السلمي", phone: "+966 55 123 4567", visits: 22, lastVisit: "قبل 4 أيام", spend: "6,600", color: "bg-amber-100 text-amber-700" },
];

export default function CustomersPage() {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">العملاء</h1>
          <p className="mt-1 text-sm text-stone-500">
            342 عميل — يُحدَّث تلقائياً عند كل حجز جديد.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="ابحث باسم أو رقم..."
              className="w-64 rounded-xl border border-stone-200 bg-white py-2 pe-9 ps-3 text-sm placeholder:text-stone-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="إجمالي العملاء" value="342" delta="+28 هذا الشهر" />
        <MiniStat label="عملاء VIP (10+ زيارات)" value="47" delta="14% من القاعدة" />
        <MiniStat label="عملاء نشطون (آخر 30 يوم)" value="186" delta="54% معدل العودة" accent="green" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 bg-stone-50/60 px-6 py-3">
          <div className="grid grid-cols-12 gap-4 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            <div className="col-span-4">العميل</div>
            <div className="col-span-2">الزيارات</div>
            <div className="col-span-2">آخر زيارة</div>
            <div className="col-span-2">الإنفاق (ر.س)</div>
            <div className="col-span-2 text-end">تواصل</div>
          </div>
        </div>

        <ul className="divide-y divide-stone-100">
          {CUSTOMERS.map((c) => (
            <li key={c.phone} className="grid grid-cols-12 items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-stone-50/50">
              <div className="col-span-4 flex min-w-0 items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${c.color}`}>
                  {c.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900">{c.name}</p>
                  <p className="mt-0.5 truncate font-mono text-xs text-stone-500" dir="ltr">{c.phone}</p>
                </div>
              </div>
              <div className="col-span-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${c.visits >= 10 ? "bg-brand-light text-brand" : "bg-stone-100 text-stone-600"}`}>
                  {c.visits} زيارة
                </span>
              </div>
              <div className="col-span-2 text-xs text-stone-600">{c.lastVisit}</div>
              <div className="col-span-2 font-mono text-stone-700">{c.spend}</div>
              <div className="col-span-2 flex justify-end gap-1.5 text-stone-400">
                <button type="button" title="اتصل" className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-stone-100 hover:text-stone-700">
                  <Phone size={12} />
                </button>
                <button type="button" title="واتساب" className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-emerald-50 hover:text-emerald-600">
                  <MessageCircle size={12} />
                </button>
                <button type="button" title="بريد" className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-stone-100 hover:text-stone-700">
                  <Mail size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/40 px-6 py-3 text-xs text-stone-500">
          <span>عرض 10 من 342</span>
          <span>صفحة 1 من 35</span>
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value, delta, accent = "stone" }: { label: string; value: string; delta?: string; accent?: "stone" | "green" }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-stone-900">{value}</p>
      {delta && (
        <p className={`mt-1 text-xs ${accent === "green" ? "text-emerald-600" : "text-stone-500"}`}>
          {delta}
        </p>
      )}
    </div>
  );
}
