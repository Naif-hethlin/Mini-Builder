"use client";

import { Bell, CalendarCheck, Inbox } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import {
  EMPTY_BOOKINGS,
  useBookings,
  type Booking,
} from "@/features/workflows/booking/store";

const STATUS_LABEL: Record<Booking["status"], string> = {
  pending: "قيد الانتظار",
  done: "مكتمل",
  canceled: "ملغى",
};

const STATUS_CHIP: Record<Booking["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
  canceled: "bg-stone-100 text-stone-500",
};

/**
 * Top-bar notification bell — shows the count of bookings created after
 * the dashboard's last `markSeen` for this project, and a popover with
 * the most recent activity. Opening the popover auto-marks as read.
 */
export function NotificationsBell({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useBookings.getState().hydrate();
  }, []);

  const bookings = useBookings((s) => s.byProject[projectId] ?? EMPTY_BOOKINGS);
  const lastSeen = useBookings((s) => s.lastSeenByProject[projectId] ?? 0);
  const markSeen = useBookings((s) => s.markSeen);

  const unread = bookings.filter((b) => b.createdAt > lastSeen);
  const recent = [...bookings]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const handleOpen = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (unread.length > 0) markSeen(projectId);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="الإشعارات"
        title="الإشعارات"
        onClick={handleOpen}
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition-colors hover:border-brand hover:text-brand",
          open && "border-brand text-brand",
        )}
      >
        <Bell size={15} />
        {unread.length > 0 && (
          <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-stone-900">آخر النشاطات</p>
              <p className="mt-0.5 text-xs text-stone-500">
                {bookings.length === 0
                  ? "لا توجد حجوزات بعد"
                  : `${bookings.length.toLocaleString("ar")} حجز إجمالاً`}
              </p>
            </div>
            <Link
              href={`/dashboard/${projectId}/workflow`}
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-brand hover:text-brand-dark"
            >
              عرض الكل ←
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-400">
                <Inbox size={18} />
              </span>
              <p className="text-xs font-medium text-stone-500">
                لا حجوزات بعد
              </p>
              <p className="text-[11px] leading-relaxed text-stone-400">
                ستظهر الحجوزات هنا تلقائياً عندما يحجز العملاء من موقعك.
              </p>
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-stone-100 overflow-y-auto">
              {recent.map((b) => {
                const isUnread = b.createdAt > lastSeen;
                return (
                  <li
                    key={b.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3",
                      isUnread && "bg-brand-light/30",
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                      <CalendarCheck size={13} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-900">
                        {b.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-stone-500">
                        {b.date} · {b.time}
                        {b.staffName ? ` · ${b.staffName}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        STATUS_CHIP[b.status],
                      )}
                    >
                      {STATUS_LABEL[b.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
