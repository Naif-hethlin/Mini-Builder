"use client";

import {
  CalendarCheck,
  Calendar,
  Clock,
  Phone,
  User,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { selectProjectId, useBuilderStore } from "@/features/builder/state/store";
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
    <section className="bg-tint-peach px-6 py-20 md:px-10">
      <div className="mx-auto max-w-3xl">
        {(props.title || props.subtitle) && (
          <div className="mb-10 text-center">
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
              <CalendarCheck size={22} />
            </span>
            {props.title && (
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
                {props.title}
              </h2>
            )}
            {props.subtitle && (
              <p className="mx-auto mt-3 max-w-xl text-base text-stone-600">
                {props.subtitle}
              </p>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_8px_40px_-10px_rgba(0,0,0,0.1)] sm:grid-cols-2 sm:p-7"
        >
          <FormRow icon={<User size={16} />} label="الاسم">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك الكامل"
              required
              className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />
          </FormRow>
          <FormRow icon={<Phone size={16} />} label="الجوال">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              required
              className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />
          </FormRow>

          <FormRow icon={<Calendar size={16} />} label="التاريخ">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
            />
          </FormRow>

          <FormRow icon={<Clock size={16} />} label="الوقت">
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
          </FormRow>

          {props.staff.length > 0 && (
            <div className="sm:col-span-2">
              <FormRow icon={<UserCircle size={16} />} label="مع">
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
              </FormRow>
            </div>
          )}

          <button
            type="submit"
            className="group col-span-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-brand-dark to-brand text-sm font-bold text-white shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/40"
          >
            {props.buttonLabel}
            <CalendarCheck
              size={14}
              className="transition-transform group-hover:scale-110"
            />
          </button>
        </form>
      </div>
    </section>
  );
}

function FormRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50/60 px-4 py-3 transition-colors focus-within:border-brand focus-within:bg-white">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
        {icon}
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          {label}
        </span>
        {children}
      </span>
    </label>
  );
}
