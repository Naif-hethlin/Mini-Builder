"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { QAPrimitiveProps } from "../types";
import { cn } from "@/shared/lib/cn";

/**
 * Question + answer primitive — collapsible accordion item. Initial
 * state comes from `defaultOpen`; the user toggles freely from there.
 */
export default function QARender({
  props,
}: {
  props: QAPrimitiveProps;
}) {
  const [open, setOpen] = useState(props.defaultOpen);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start text-sm font-bold text-stone-900 hover:bg-stone-50"
      >
        <span className="flex-1">{props.question}</span>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-stone-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-stone-100 px-4 py-3 text-sm leading-relaxed text-stone-600">
          {props.answer}
        </div>
      )}
    </div>
  );
}
