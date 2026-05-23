"use client";

import { Download, Search, UserPlus, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { EmptyState } from "@/shared/ui/EmptyState";
import {
  EMPTY_BOOKINGS,
  useBookings,
} from "@/features/workflows/booking/store";
import {
  customersFromBookings,
  customersToCsv,
  downloadCsv,
  type Customer,
} from "./derive";

/**
 * Customers page — derives a deduped customer list from the real bookings
 * store (keyed by normalized phone). Supports search + CSV export.
 */
export function Customers() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    useBookings.getState().hydrate();
  }, []);

  const bookings = useBookings((s) => s.byProject[id] ?? EMPTY_BOOKINGS);
  const customers = useMemo(() => customersFromBookings(bookings), [bookings]);

  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q),
    );
  }, [customers, query]);

  const handleExport = () => {
    if (customers.length === 0) return;
    downloadCsv("customers.csv", customersToCsv(customers));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">العملاء</h1>
          <p className="mt-1 text-sm text-stone-500">
            {customers.length === 0
              ? "لا عملاء بعد. يضافون تلقائياً مع كل حجز جديد."
              : `${customers.length.toLocaleString("ar")} عميل مستخرجين من الحجوزات.`}
          </p>
        </div>
        {customers.length > 0 && (
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 transition-colors hover:border-brand hover:text-brand"
          >
            <Download size={13} />
            تصدير CSV
          </button>
        )}
      </div>

      {customers.length > 0 && (
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الجوال…"
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pe-9 ps-3 text-base font-medium placeholder:text-stone-400 focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-sm"
          />
        </div>
      )}

      {customers.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="لا عملاء بعد"
          description="أضف قسم نموذج حجز إلى موقعك. كل حجز جديد يُضيف العميل هنا تلقائياً."
        />
      ) : (
        <CustomerTable customers={filtered} query={query} />
      )}
    </div>
  );
}

function CustomerTable({
  customers,
  query,
}: {
  customers: Customer[];
  query: string;
}) {
  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center text-sm text-stone-500">
        لا نتائج لـ &quot;{query}&quot;
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full text-start text-sm">
        <thead className="bg-stone-50 text-xs text-stone-500">
          <tr>
            <th className="px-5 py-3 font-medium">الاسم</th>
            <th className="px-5 py-3 font-medium">الجوال</th>
            <th className="hidden px-5 py-3 font-medium sm:table-cell">
              أول حجز
            </th>
            <th className="hidden px-5 py-3 font-medium md:table-cell">
              آخر حجز
            </th>
            <th className="px-5 py-3 font-medium">الحجوزات</th>
            <th className="px-5 py-3 font-medium">الحالة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {customers.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-stone-50/60">
              <td className="px-5 py-3 font-medium text-stone-900">
                <span className="inline-flex items-center gap-2">
                  <Users size={14} className="text-stone-400" />
                  {c.name}
                </span>
              </td>
              <td className="px-5 py-3 font-mono text-xs text-stone-600">
                {c.phone}
              </td>
              <td className="hidden px-5 py-3 text-stone-500 sm:table-cell">
                {new Date(c.firstBookingAt).toLocaleDateString("ar")}
              </td>
              <td className="hidden px-5 py-3 text-stone-500 md:table-cell">
                {new Date(c.lastBookingAt).toLocaleDateString("ar")}
              </td>
              <td className="px-5 py-3 font-medium text-stone-700">
                {c.totalBookings.toLocaleString("ar")}
              </td>
              <td className="px-5 py-3">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                    c.status === "نشط"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-stone-100 text-stone-500",
                  )}
                >
                  {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
