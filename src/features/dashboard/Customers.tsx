"use client";

import { cn } from "@/shared/lib/cn";
import { MOCK_CUSTOMERS } from "./mock-data";

export function Customers() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">العملاء</h1>
        <p className="mt-1 text-sm text-stone-500">
          قائمة تجريبية للعملاء — تصبح حقيقية مع نظام الحجوزات.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-start text-sm">
          <thead className="bg-stone-50 text-xs text-stone-500">
            <tr>
              <th className="px-5 py-3 font-medium">الاسم</th>
              <th className="px-5 py-3 font-medium">البريد</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">
                أول زيارة
              </th>
              <th className="px-5 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {MOCK_CUSTOMERS.map((c) => (
              <tr
                key={c.id}
                className="transition-colors hover:bg-stone-50/60"
              >
                <td className="px-5 py-3 font-medium text-stone-900">
                  {c.name}
                </td>
                <td className="px-5 py-3 text-stone-600">{c.email}</td>
                <td className="hidden px-5 py-3 text-stone-500 sm:table-cell">
                  {c.firstVisit}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      c.status === "نشط"
                        ? "bg-green-50 text-green-600"
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
    </div>
  );
}
