import { Star } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { TestimonialsProps } from "@/features/builder/state/types";

const GRID_COLS: Record<TestimonialsProps["columns"], string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

export default function TestimonialsRender({
  props,
}: {
  props: TestimonialsProps;
}) {
  return (
    <section className="bg-stone-50 px-6 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
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

        <div className={cn("grid gap-4", GRID_COLS[props.columns])}>
          {props.items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex gap-0.5 text-brand">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < item.rating ? "currentColor" : "transparent"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-stone-700">
                {item.quote}
              </p>
              <div className="mt-4 border-t border-stone-100 pt-3">
                <p className="text-sm font-semibold text-stone-900">
                  {item.name}
                </p>
                {item.role && (
                  <p className="text-xs text-stone-500">{item.role}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
