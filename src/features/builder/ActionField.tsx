"use client";

import {
  CalendarCheck,
  ChevronDown,
  CreditCard,
  ExternalLink,
  Link2,
  MoveDown,
} from "lucide-react";
import type { Page } from "@/features/projects";
import type { PrimitiveAction } from "@/features/primitives/types";

const KIND_OPTIONS: Array<{
  value: PrimitiveAction["kind"];
  label: string;
}> = [
  { value: "none", label: "بدون" },
  { value: "navigate", label: "صفحة داخل المشروع" },
  { value: "link", label: "رابط خارجي" },
  { value: "scroll", label: "تمرير إلى قسم" },
  { value: "booking", label: "نموذج الحجز" },
  { value: "payment", label: "صفحة الدفع" },
];

/**
 * Prototype-link picker — assigns an action to a Button or Image primitive.
 * E5 wires Button.action to navigate between pages in the same project.
 */
export function ActionField({
  value,
  pages,
  onChange,
}: {
  value: PrimitiveAction | undefined;
  pages: Page[];
  onChange: (next: PrimitiveAction) => void;
}) {
  const action = value ?? { kind: "none" };

  return (
    <div className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-stone-700">
        <Link2 size={12} className="text-brand" />
        عند النقر
      </p>

      <div className="relative">
        <select
          value={action.kind}
          onChange={(e) => {
            const kind = e.target.value as PrimitiveAction["kind"];
            switch (kind) {
              case "none":
                return onChange({ kind: "none" });
              case "link":
                return onChange({ kind: "link", href: "" });
              case "navigate":
                return onChange({
                  kind: "navigate",
                  pageSlug: pages[0]?.slug ?? "home",
                });
              case "scroll":
                return onChange({ kind: "scroll", sectionId: "" });
              case "payment":
                return onChange({ kind: "payment", url: "" });
              case "booking":
                return onChange({ kind: "booking" });
            }
          }}
          className="h-10 w-full appearance-none rounded-xl border border-stone-200 bg-white pe-9 ps-3 text-base focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-sm"
        >
          {KIND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-stone-400"
        />
      </div>

      {action.kind === "link" && (
        <div className="relative">
          <ExternalLink
            size={14}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="url"
            value={action.href}
            placeholder="https://"
            onChange={(e) => onChange({ kind: "link", href: e.target.value })}
            className="h-10 w-full rounded-xl border border-stone-200 bg-white ps-9 pe-3 text-base focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-sm"
          />
        </div>
      )}

      {action.kind === "navigate" && (
        <div className="relative">
          <select
            value={action.pageSlug}
            onChange={(e) =>
              onChange({ kind: "navigate", pageSlug: e.target.value })
            }
            className="h-10 w-full appearance-none rounded-xl border border-stone-200 bg-white pe-9 ps-3 text-base focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-sm"
          >
            {pages.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name} {p.isHome ? "· الرئيسية" : ""}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
        </div>
      )}

      {action.kind === "scroll" && (
        <div className="relative">
          <MoveDown
            size={14}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={action.sectionId}
            placeholder="معرّف القسم في الصفحة"
            onChange={(e) =>
              onChange({ kind: "scroll", sectionId: e.target.value })
            }
            className="h-10 w-full rounded-xl border border-stone-200 bg-white ps-9 pe-3 text-base focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-sm"
          />
        </div>
      )}

      {action.kind === "payment" && (
        <div className="relative">
          <CreditCard
            size={14}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="url"
            value={action.url}
            placeholder="رابط الدفع (Stripe / Tap / Moyasar)"
            onChange={(e) =>
              onChange({ kind: "payment", url: e.target.value })
            }
            className="h-10 w-full rounded-xl border border-stone-200 bg-white ps-9 pe-3 text-base focus:border-brand focus:outline focus:outline-2 focus:outline-brand/30 sm:text-sm"
          />
        </div>
      )}

      {action.kind === "booking" && (
        <p className="flex items-center gap-1.5 px-1 text-[11px] text-stone-500">
          <CalendarCheck size={12} />
          ينتقل العميل لأول قسم حجز في الصفحة.
        </p>
      )}
    </div>
  );
}
