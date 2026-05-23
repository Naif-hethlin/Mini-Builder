// /demo/dashboard/settings — settings form mock. All fields are
// read-only (defaultValue, no onChange) since this is a marketing demo.

import { Bell, Clock, Globe, MapPin, Phone, Save, Store } from "lucide-react";

export const metadata = {
  title: "الإعدادات — عرض تجريبي — ركاز",
};
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-stone-900">الإعدادات</h1>
        <p className="mt-1 text-sm text-stone-500">
          بيانات المتجر، ساعات العمل، التنبيهات والدفع.
        </p>
      </div>

      {/* Business profile */}
      <SettingsCard icon={Store} title="بيانات المتجر" subtitle="هذه البيانات تظهر في موقعك وفواتيرك.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم المتجر" defaultValue="صالون أصايل" />
          <Field label="السجل التجاري" defaultValue="1010234567" />
          <Field label="الرقم الضريبي" defaultValue="310234567890003" />
          <Field label="نوع النشاط" defaultValue="صالون نسائي" />
        </div>
      </SettingsCard>

      {/* Contact */}
      <SettingsCard icon={Phone} title="معلومات التواصل" subtitle="نستخدمها لرسائل الواتساب وتأكيد الحجز.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="رقم الهاتف" defaultValue="+966 11 234 5678" dir="ltr" />
          <Field label="رقم الواتساب" defaultValue="+966 50 111 2233" dir="ltr" />
          <Field label="البريد الإلكتروني" defaultValue="hello@asayel.sa" dir="ltr" />
          <Field label="الموقع الإلكتروني" defaultValue="asayel-salon.rekaz.io" dir="ltr" />
        </div>
      </SettingsCard>

      {/* Address */}
      <SettingsCard icon={MapPin} title="العنوان" subtitle="يساعد العملاء على إيجادك في الخرائط.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المدينة" defaultValue="الرياض" />
          <Field label="الحي" defaultValue="النخيل" />
          <Field label="الشارع" defaultValue="شارع الأمير سلطان" />
          <Field label="الرمز البريدي" defaultValue="12382" />
        </div>
      </SettingsCard>

      {/* Working hours */}
      <SettingsCard icon={Clock} title="ساعات العمل" subtitle="يستخدمها الموقع لإظهار/إخفاء أوقات الحجز.">
        <div className="space-y-2">
          {[
            ["السبت", "10:00 ص — 11:00 م"],
            ["الأحد", "10:00 ص — 11:00 م"],
            ["الاثنين", "10:00 ص — 11:00 م"],
            ["الثلاثاء", "10:00 ص — 11:00 م"],
            ["الأربعاء", "10:00 ص — 11:00 م"],
            ["الخميس", "10:00 ص — 12:00 ص"],
            ["الجمعة", "مغلق"],
          ].map(([day, hours]) => (
            <div key={day} className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-2.5 text-sm">
              <span className="font-medium text-stone-800">{day}</span>
              <span className={`font-mono text-xs ${hours === "مغلق" ? "text-stone-400" : "text-stone-600"}`}>{hours}</span>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard icon={Bell} title="التنبيهات" subtitle="اختر متى يصلك التنبيه.">
        <div className="space-y-3">
          <Toggle label="حجز جديد" sub="إشعار فوري بكل حجز" on />
          <Toggle label="إلغاء حجز" sub="إشعار عند إلغاء العميل لحجزه" on />
          <Toggle label="مراجعة جديدة" sub="إشعار بكل تقييم في موقعك" on />
          <Toggle label="ملخص يومي" sub="ملخص حجوزات اليوم 9:00 صباحاً" />
          <Toggle label="تقرير أسبوعي" sub="إيرادات + أعلى خدمات كل أحد" on />
        </div>
      </SettingsCard>

      {/* Domain */}
      <SettingsCard icon={Globe} title="النطاق" subtitle="استخدم نطاقك الخاص لمزيد من الاحترافية.">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-emerald-900">asayel-salon.rekaz.io</p>
              <p className="text-xs text-emerald-700">النطاق المجاني الافتراضي — نشط</p>
            </div>
            <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">مفعّل</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-stone-900">asayel.sa</p>
              <p className="text-xs text-stone-500">نطاق مخصص — تحقق DNS قيد التنفيذ</p>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">قيد التحقق</span>
          </div>
        </div>
      </SettingsCard>

      {/* Sticky save bar (visual only) */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-3 shadow-lg">
        <p className="text-xs text-stone-500">التغييرات تُحفظ تلقائياً.</p>
        <span className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-xs font-bold text-white">
          <Save size={12} />
          محفوظ
        </span>
      </div>
    </>
  );
}

function SettingsCard({
  icon: Icon, title, subtitle, children,
}: {
  icon: typeof Store; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand">
          <Icon size={16} />
        </span>
        <div>
          <h2 className="text-sm font-bold text-stone-900">{title}</h2>
          <p className="text-xs text-stone-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, defaultValue, dir }: { label: string; defaultValue: string; dir?: "ltr" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-600">{label}</span>
      <input
        type="text"
        defaultValue={defaultValue}
        dir={dir}
        readOnly
        className="w-full rounded-lg border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm text-stone-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}

function Toggle({ label, sub, on = false }: { label: string; sub: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-stone-800">{label}</p>
        <p className="text-xs text-stone-500">{sub}</p>
      </div>
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? "bg-brand" : "bg-stone-200"}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${on ? "-translate-x-0.5" : "-translate-x-[1.375rem]"}`}
        />
      </span>
    </div>
  );
}
