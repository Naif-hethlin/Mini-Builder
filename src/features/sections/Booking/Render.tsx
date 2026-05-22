"use client";

import { Calendar, Clock, User } from "lucide-react";
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
    <section className="bg-tint-peach px-6 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        {(props.title || props.subtitle) && (
          <div className="mb-8 text-center">
            {props.title && (
              <h2 className="text-3xl font-bold tracking-tight text-stone-900">
                {props.title}
              </h2>
            )}
            {props.subtitle && (
              <p className="mt-2 text-sm text-stone-600">{props.subtitle}</p>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك"
            required
            className="col-span-2 h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:col-span-1"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="رقم الهاتف"
            required
            className="col-span-2 h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:col-span-1"
          />

          <label className="col-span-2 flex h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm sm:col-span-1">
            <Calendar size={14} className="text-stone-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="flex-1 bg-transparent text-stone-900 focus:outline-none"
            />
          </label>

          <label className="col-span-2 flex h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm sm:col-span-1">
            <Clock size={14} className="text-stone-400" />
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 appearance-none bg-transparent text-stone-900 focus:outline-none"
            >
              {props.slots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          {props.staff.length > 0 && (
            <label className="col-span-2 flex h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm">
              <User size={14} className="text-stone-400" />
              <select
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                className="flex-1 appearance-none bg-transparent text-stone-900 focus:outline-none"
              >
                {props.staff.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            type="submit"
            className="col-span-2 h-11 rounded-xl bg-brand text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-dark"
          >
            {props.buttonLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
