"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { FAQProps } from "@/features/builder/state/types";

export default function FAQRender({ props }: { props: FAQProps }) {
  const [open, setOpen] = useState<string | null>(
    props.items[0]?.id ?? null,
  );

  return (
    <section className="bg-tint-cream px-6 py-16 md:px-10">
      <div className="mx-auto max-w-3xl">
        {(props.title || props.subtitle) && (
          <div className="mb-10 text-center">
            {props.title && (
              <h2 className="text-3xl font-bold tracking-tight text-stone-900">
                {props.title}
              </h2>
            )}
            {props.subtitle && (
              <p className="mt-2 text-sm text-stone-500">{props.subtitle}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {props.items.map((item) => {
            const isOpen = open === item.id;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start"
                >
                  <span className="text-sm font-semibold text-stone-900">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "shrink-0 text-stone-400 transition-transform",
                      isOpen && "rotate-180 text-brand",
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-stone-100 px-5 py-4 text-sm leading-relaxed text-stone-600">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
