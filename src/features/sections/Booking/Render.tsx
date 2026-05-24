"use client";

import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  Sparkles,
  Star,
  User,
  UserCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  selectProjectId,
  useBuilderStore,
} from "@/features/builder/state/store";
import type { BookingProps } from "@/features/builder/state/types";
import { useBookings } from "@/features/workflows/booking/store";

export default function BookingRender({ props }: { props: BookingProps }) {
  const projectId = useBuilderStore(selectProjectId);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(props.slots[0] ?? "");
  const [staff, setStaff] = useState(props.staff[0]?.name ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.info("الحجز سيُحفظ بعد فتح المشروع");
      return;
    }
    useBookings.getState().hydrate();
    useBookings.getState().add({
      projectId,
      name: name.trim(),
      phone: phone.trim(),
      date,
      time,
      staffName: staff || undefined,
    });
    toast.success("تم حجز موعدك");
    setName("");
    setPhone("");
    setDate("");
    setTime(props.slots[0] ?? "");
  };

  return (
    <section className="bg-stone-50 px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]">
          <div className="grid lg:grid-cols-[5fr_7fr]">
            {/* ── Left: brand panel ─────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-8 text-white sm:p-10">
              {/* Decorative brand glows */}
              <div
                aria-hidden
                className="pointer-events-none absolute -end-20 -top-20 h-64 w-64 rounded-full bg-brand/30 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 start-1/3 h-56 w-56 rounded-full bg-brand/20 blur-3xl"
              />

              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-brand/30">
                  <Sparkles size={12} />
                  احجز موعدك
                </span>

                {props.title && (
                  <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                    {props.title}
                  </h2>
                )}
                {props.subtitle && (
                  <p className="mt-3 max-w-md text-base leading-relaxed text-white/80">
                    {props.subtitle}
                  </p>
                )}

                {/* Trust list */}
                <ul className="mt-7 space-y-3 text-sm">
                  <Trust
                    icon={<CheckCircle2 size={14} />}
                    label="تأكيد فوري"
                    sub="رسالة تأكيد على جوالك خلال ثوانٍ"
                  />
                  <Trust
                    icon={<XCircle size={14} />}
                    label="إلغاء مجاني"
                    sub="حتى ساعتين قبل الموعد"
                  />
                  <Trust
                    icon={<Star size={14} />}
                    label="تقييم 4.9 من 5"
                    sub="من أكثر من 200 عميل"
                  />
                </ul>

                {/* Available slots peek */}
                {props.slots.length > 0 && (
                  <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/60">
                      المواعيد المتاحة
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {props.slots.slice(0, 6).map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: form ────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="p-8 sm:p-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <CalendarCheck size={20} />
                </span>
                <div>
                  <p className="text-base font-bold text-stone-900">
                    تفاصيل الحجز
                  </p>
                  <p className="text-xs text-stone-500">
                    اختر الوقت وادخل بياناتك
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field icon={<User size={14} />} label="الاسم">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك الكامل"
                    required
                    className="w-full bg-transparent text-base text-stone-900 placeholder:text-stone-400 focus:outline-none sm:text-sm"
                  />
                </Field>
                <Field icon={<Phone size={14} />} label="الجوال">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    required
                    className="w-full bg-transparent text-base text-stone-900 placeholder:text-stone-400 focus:outline-none sm:text-sm"
                  />
                </Field>
                <Field icon={<Calendar size={14} />} label="التاريخ">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
                  />
                </Field>
                <Field icon={<Clock size={14} />} label="الوقت">
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full appearance-none bg-transparent text-sm text-stone-900 focus:outline-none"
                  >
                    {props.slots.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                {props.staff.length > 0 && (
                  <div className="sm:col-span-2">
                    <Field icon={<UserCircle size={14} />} label="مع">
                      <select
                        value={staff}
                        onChange={(e) => setStaff(e.target.value)}
                        className="w-full appearance-none bg-transparent text-sm text-stone-900 focus:outline-none"
                      >
                        {props.staff.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-brand-dark to-brand px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/40"
              >
                {props.buttonLabel}
                <CalendarCheck
                  size={14}
                  className="transition-transform group-hover:scale-110"
                />
              </button>
              <p className="mt-3 text-center text-[11px] text-stone-400">
                ستصلك رسالة تأكيد على رقم جوالك مباشرة.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand-soft">
        {icon}
      </span>
      <div>
        <p className="font-bold">{label}</p>
        <p className="text-xs text-white/60">{sub}</p>
      </div>
    </li>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3 transition-colors focus-within:border-brand focus-within:bg-white">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
        {icon}
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}
