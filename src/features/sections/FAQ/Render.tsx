"use client";

import { HelpCircle, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { FAQProps } from "@/features/builder/state/types";

export default function FAQRender({ props }: { props: FAQProps }) {
  const [open, setOpen] = useState<string | null>(
    props.items[0]?.id ?? null,
  );

  return (
    <section className="bg-tint-cream px-6 py-20 md:px-10">
      <div className="mx-auto max-w-3xl">
        {(props.title || props.subtitle) && (
          <div className="mb-12 text-center">
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
              <HelpCircle size={22} />
            </span>
            {props.title && (
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
                {props.title}
              </h2>
            )}
            {props.subtitle && (
              <p className="mx-auto mt-3 max-w-xl text-base text-stone-500">
                {props.subtitle}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {props.items.map((item) => {
            const isOpen = open === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white transition-all duration-200",
                  isOpen
                    ? "border-brand/40 shadow-[0_8px_30px_-10px_rgba(232,93,93,0.2)]"
                    : "border-stone-200 hover:border-stone-300",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                >
                  <span
                    className={cn(
                      "text-[15px] font-bold transition-colors",
                      isOpen ? "text-brand-dark" : "text-stone-900",
                    )}
                  >
                    {item.question}
                  </span>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                      isOpen
                        ? "rotate-45 bg-brand text-white"
                        : "bg-stone-100 text-stone-500",
                    )}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </span>
                </button>
                <div
                  className={cn(
                    "grid overflow-hidden transition-all duration-300 ease-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="min-h-0">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-stone-600">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
