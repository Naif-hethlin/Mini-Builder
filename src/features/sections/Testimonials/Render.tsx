import { Quote, Star } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { TestimonialsProps } from "@/features/builder/state/types";

const GRID_COLS: Record<TestimonialsProps["columns"], string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

// Pastel accent palette for avatar tiles, cycled so cards look varied
// without forcing the user to pick a color per testimonial.
const AVATAR_TONES = [
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function TestimonialsRender({
  props,
}: {
  props: TestimonialsProps;
}) {
  return (
    <section className="bg-stone-50 px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        {(props.title || props.subtitle) && (
          <div className="mb-12 text-center">
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

        <div className={cn("grid gap-6", GRID_COLS[props.columns])}>
          {props.items.map((item, i) => {
            const tone = AVATAR_TONES[i % AVATAR_TONES.length];
            return (
              <article
                key={item.id}
                className="group relative flex flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-[0_2px_20px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_30px_-10px_rgb(0,0,0,0.12)]"
              >
                {/* Faint floating quote mark behind the content */}
                <span
                  aria-hidden
                  className="absolute end-6 top-6 text-brand/15"
                >
                  <Quote size={44} fill="currentColor" strokeWidth={0} />
                </span>

                {/* Star rating */}
                <div className="relative mb-4 flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={16}
                      fill={idx < item.rating ? "currentColor" : "transparent"}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="relative mb-6 flex-1 text-[15px] leading-relaxed text-stone-700">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="relative flex items-center gap-3 border-t border-stone-100 pt-4">
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      tone.bg,
                      tone.text,
                    )}
                  >
                    {initials(item.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-900">
                      {item.name}
                    </p>
                    {item.role && (
                      <p className="truncate text-xs text-stone-500">
                        {item.role}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
