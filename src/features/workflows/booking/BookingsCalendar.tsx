"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { Booking } from "./store";

/**
 * Month-grid view of bookings. Renders a 6-row × 7-col grid of days with
 * up to 3 booking pills per day (overflow → "+N أخرى" badge).
 */
export function BookingsCalendar({
  bookings,
  onPickDate,
}: {
  bookings: Booking[];
  onPickDate?: (yyyyMMdd: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Map yyyy-mm-dd → bookings on that day.
  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      if (!b.date) continue;
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    }
    return map;
  }, [bookings]);

  const { year, month } = cursor;
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayKey = ymd(today);

  // Build 42 cells (6 weeks).
  const cells: Array<{ date: Date | null; key: string | null }> = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ date: null, key: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ date, key: ymd(date) });
  }
  while (cells.length < 42) cells.push({ date: null, key: null });

  const monthLabel = firstOfMonth.toLocaleDateString("ar", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-stone-900">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setCursor((c) => {
                const next = new Date(c.year, c.month - 1, 1);
                return { year: next.getFullYear(), month: next.getMonth() };
              })
            }
            aria-label="الشهر السابق"
            className="flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setCursor({ year: now.getFullYear(), month: now.getMonth() });
            }}
            className="rounded-md px-2 text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            اليوم
          </button>
          <button
            type="button"
            onClick={() =>
              setCursor((c) => {
                const next = new Date(c.year, c.month + 1, 1);
                return { year: next.getFullYear(), month: next.getMonth() };
              })
            }
            aria-label="الشهر التالي"
            className="flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-stone-100 bg-stone-50 text-center text-[10px] font-medium text-stone-500">
        {["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map(
          (w) => (
            <div key={w} className="py-2">
              {w}
            </div>
          ),
        )}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell.date || !cell.key) {
            return (
              <div
                key={`empty-${i}`}
                className="aspect-square border-e border-b border-stone-100 last:border-e-0"
              />
            );
          }
          const dayBookings = byDay.get(cell.key) ?? [];
          const isToday = cell.key === todayKey;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onPickDate?.(cell.key!)}
              className={cn(
                "relative flex aspect-square flex-col gap-0.5 border-e border-b border-stone-100 p-1 text-start transition-colors hover:bg-stone-50",
                isToday && "bg-brand-light/40",
              )}
            >
              <span
                className={cn(
                  "self-end text-[10px] font-medium",
                  isToday ? "text-brand" : "text-stone-500",
                )}
              >
                {cell.date.getDate()}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayBookings.slice(0, 3).map((b) => (
                  <span
                    key={b.id}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[9px] leading-tight",
                      b.status === "done"
                        ? "bg-green-50 text-green-700"
                        : b.status === "canceled"
                          ? "bg-stone-100 text-stone-400 line-through"
                          : "bg-brand-light text-brand",
                    )}
                  >
                    {b.time} · {b.name}
                  </span>
                ))}
                {dayBookings.length > 3 && (
                  <span className="rounded bg-stone-100 px-1 py-0.5 text-[9px] text-stone-600">
                    +{dayBookings.length - 3} أخرى
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
