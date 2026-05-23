// /demo/dashboard/website — site management tab. Shows the connected
// site preview with a "افتح المحرر" CTA back to /demo (which represents
// the live site) and stats: pages, visitors, last edit.

import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileText,
  Globe,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "الموقع — عرض تجريبي — ركاز",
};
export const dynamic = "force-dynamic";

const PAGES = [
  { name: "الصفحة الرئيسية", slug: "/", sections: 9, lastEdit: "اليوم 11:24 ص" },
  { name: "الخدمات", slug: "/services", sections: 6, lastEdit: "أمس 04:30 م" },
  { name: "الفريق", slug: "/team", sections: 4, lastEdit: "قبل 3 أيام" },
  { name: "تواصل معنا", slug: "/contact", sections: 3, lastEdit: "قبل أسبوع" },
];

export default function WebsitePage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-stone-900">الموقع</h1>
        <p className="mt-1 text-sm text-stone-500">
          أدر موقعك المنشور — الصفحات، الإعدادات، والإحصائيات.
        </p>
      </div>

      {/* Status banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-emerald-900">موقعك نشط ومرئي للعملاء</p>
            <p className="mt-0.5 text-xs text-emerald-700 ltr:inline-flex" dir="ltr">
              asayel-salon.rekaz.io
            </p>
          </div>
        </div>
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-stone-700 shadow-sm transition-all hover:-translate-y-0.5 hover:text-emerald-700"
        >
          افتح الموقع
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={Globe} label="الزوار (هذا الشهر)" value="4,218" delta="+18% عن الشهر السابق" />
        <StatTile icon={FileText} label="الصفحات" value="4" delta={`${PAGES.reduce((a, p) => a + p.sections, 0)} قسم منشور`} />
        <StatTile icon={Activity} label="آخر تعديل" value="اليوم" delta="11:24 صباحاً — بواسطتك" />
      </div>

      {/* Pages list */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">الصفحات</h2>
            <p className="mt-0.5 text-xs text-stone-500">{PAGES.length} صفحات منشورة.</p>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white"
          >
            <Sparkles size={12} />
            صفحة جديدة
          </Link>
        </div>
        <ul className="divide-y divide-stone-100">
          {PAGES.map((p) => (
            <li key={p.slug} className="flex items-center justify-between gap-4 px-6 py-4 text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold text-stone-900">{p.name}</p>
                <p className="mt-0.5 font-mono text-xs text-stone-500" dir="ltr">{p.slug}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs text-stone-500">
                <span>{p.sections} قسم</span>
                <span>{p.lastEdit}</span>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-1 rounded-md border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700 hover:border-brand hover:text-brand"
                >
                  <Edit3 size={11} />
                  تحرير
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: typeof Globe;
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-light text-brand">
          <Icon size={14} />
        </div>
      </div>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      {delta && <p className="mt-1 text-xs text-stone-500">{delta}</p>}
    </div>
  );
}
