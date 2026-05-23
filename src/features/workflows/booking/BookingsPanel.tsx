"use client";

import { CalendarDays, CalendarX, Check, List, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/shared/ui/ConfirmProvider";
import { EmptyState } from "@/shared/ui/EmptyState";
import { cn } from "@/shared/lib/cn";
import { BookingsCalendar } from "./BookingsCalendar";
import { EMPTY_BOOKINGS, useBookings, type Booking } from "./store";

type Filter = "all" | "pending" | "done" | "canceled";
type View = "list" | "calendar";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "الكل" },
  { id: "pending", label: "قيد الانتظار" },
  { id: "done", label: "مكتملة" },
  { id: "canceled", label: "ملغاة" },
];

export function BookingsPanel({ projectId }: { projectId: string }) {
  const confirm = useConfirm();
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("list");
  const [dayFilter, setDayFilter] = useState<string | null>(null);

  useEffect(() => {
    useBookings.getState().hydrate();
  }, []);

  const bookings = useBookings((s) => s.byProject[projectId] ?? EMPTY_BOOKINGS);
  const setStatus = useBookings((s) => s.setStatus);
  const remove = useBookings((s) => s.remove);

  const visible = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => b.createdAt - a.createdAt)
        .filter((b) => filter === "all" || b.status === filter)
        .filter((b) => !dayFilter || b.date === dayFilter),
    [bookings, filter, dayFilter],
  );

  const handleDelete = async (b: Booking) => {
    const ok = await confirm({
      title: `حذف حجز ${b.name}؟`,
      description: "سيتم حذف الحجز نهائياً.",
      confirmLabel: "احذف",
      danger: true,
    });
    if (!ok) return;
    remove(projectId, b.id);
    toast.success("تم الحذف");
  };

  return (
    <div className="space-y-5">
      {/* View toggle + active day filter chip */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-stone-100 p-0.5">
          <button
            type="button"
            onClick={() => {
              setView("list");
              setDayFilter(null);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              view === "list"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900",
            )}
          >
            <List size={12} />
            قائمة
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              view === "calendar"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900",
            )}
          >
            <CalendarDays size={12} />
            تقويم
          </button>
        </div>
        {dayFilter && (
          <button
            type="button"
            onClick={() => setDayFilter(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand"
          >
            عرض {dayFilter} فقط
            <X size={10} />
          </button>
        )}
      </div>

      {view === "calendar" ? (
        <BookingsCalendar
          bookings={bookings}
          onPickDate={(d) => {
            setDayFilter(d);
            setView("list");
          }}
        />
      ) : null}

      {/* Filter chips — list view only */}
      {view === "list" && (
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const count =
              f.id === "all"
                ? bookings.length
                : bookings.filter((b) => b.status === f.id).length;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-brand text-white"
                    : "bg-white text-stone-600 hover:bg-stone-100",
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px]",
                    active ? "bg-white/20" : "bg-stone-100",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {view === "list" &&
        (visible.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title={
              bookings.length === 0
                ? "لا توجد حجوزات بعد"
                : "لا حجوزات بهذه الحالة"
            }
            description={
              bookings.length === 0
                ? "أضف قسم نموذج حجز للموقع لاستقبال الحجوزات من زوارك."
                : "جرّب فلتر مختلف من الأعلى."
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-start text-sm">
              <thead className="bg-stone-50 text-xs text-stone-500">
                <tr>
                  <th className="px-5 py-3 font-medium">الاسم</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">
                    الهاتف
                  </th>
                  <th className="px-5 py-3 font-medium">الموعد</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">
                    الموظف
                  </th>
                  <th className="px-5 py-3 font-medium">الحالة</th>
                  <th className="px-5 py-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/60">
                    <td className="px-5 py-3 font-medium text-stone-900">
                      {b.name}
                    </td>
                    <td className="hidden px-5 py-3 text-stone-600 sm:table-cell">
                      {b.phone}
                    </td>
                    <td className="px-5 py-3 text-stone-600">
                      {b.date}
                      <span className="text-stone-400"> · </span>
                      {b.time}
                    </td>
                    <td className="hidden px-5 py-3 text-stone-600 md:table-cell">
                      {b.staffName ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusChip status={b.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <ActionButton
                          title="تأكيد"
                          icon={<Check size={14} />}
                          disabled={b.status === "done"}
                          onClick={() => setStatus(projectId, b.id, "done")}
                          tone="green"
                        />
                        <ActionButton
                          title="إلغاء"
                          icon={<X size={14} />}
                          disabled={b.status === "canceled"}
                          onClick={() => setStatus(projectId, b.id, "canceled")}
                          tone="stone"
                        />
                        <ActionButton
                          title="حذف"
                          icon={<Trash2 size={14} />}
                          onClick={() => handleDelete(b)}
                          tone="red"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}

function StatusChip({ status }: { status: Booking["status"] }) {
  const cls =
    status === "done"
      ? "bg-green-50 text-green-600"
      : status === "canceled"
        ? "bg-stone-100 text-stone-500"
        : "bg-amber-50 text-amber-600";
  const label =
    status === "done"
      ? "مكتمل"
      : status === "canceled"
        ? "ملغى"
        : "قيد الانتظار";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function ActionButton({
  title,
  icon,
  onClick,
  disabled = false,
  tone = "stone",
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "green" | "stone" | "red";
}) {
  const hover =
    tone === "green"
      ? "hover:bg-green-50 hover:text-green-600"
      : tone === "red"
        ? "hover:bg-red-50 hover:text-red-600"
        : "hover:bg-stone-100 hover:text-stone-900";
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors disabled:cursor-not-allowed disabled:opacity-30",
        hover,
      )}
    >
      {icon}
    </button>
  );
}
