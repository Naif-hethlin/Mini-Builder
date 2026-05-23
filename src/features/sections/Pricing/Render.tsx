import { Check, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { PricingProps } from "@/features/builder/state/types";

// Schema-driven <select> stores booleans as the strings "true" / "false",
// while the typed defaults seed with actual booleans. Accept both.
function isHighlighted(v: unknown): boolean {
  return v === true || v === "true";
}

export default function PricingRender({ props }: { props: PricingProps }) {
  return (
    <section className="bg-gradient-to-b from-white via-stone-50 to-white px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 text-center">
          {props.eyebrow && (
            <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
              <Sparkles size={12} />
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-base text-stone-500">
              {props.subtitle}
            </p>
          )}
        </div>

        {/* Plans */}
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {props.plans.map((plan) => {
            const featured = isHighlighted(plan.highlighted);
            return (
              <div
                key={plan.id}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-3xl border bg-white p-8 transition-all duration-300",
                  featured
                    ? "scale-100 border-brand shadow-[0_20px_60px_-15px_rgba(232,93,93,0.35)] md:-translate-y-2 md:scale-105"
                    : "border-stone-200 shadow-sm hover:-translate-y-1 hover:shadow-lg",
                )}
              >
                {featured && (
                  <>
                    {/* Subtle brand glow at the top of the highlighted card */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-24 start-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
                    />
                    <span className="absolute end-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md shadow-brand/30">
                      <Sparkles size={10} />
                      الأكثر شعبية
                    </span>
                  </>
                )}

                <div className="relative">
                  <h3 className="text-lg font-bold text-stone-900">
                    {plan.name}
                  </h3>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-stone-900">
                      {plan.price}
                    </span>
                    {plan.cadence && (
                      <span className="text-sm text-stone-500">
                        {plan.cadence}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="relative my-7 flex-1 space-y-3 text-sm">
                  {plan.features.map((f, i) => (
                    <li
                      key={`${plan.id}-f-${i}`}
                      className="flex items-start gap-3"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          featured
                            ? "bg-brand-light text-brand"
                            : "bg-emerald-50 text-emerald-600",
                        )}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="text-stone-600">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={cn(
                    "relative inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold transition-all",
                    featured
                      ? "bg-gradient-to-l from-brand-dark to-brand text-white shadow-lg shadow-brand/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/40"
                      : "border-2 border-stone-200 bg-white text-stone-700 hover:border-brand hover:text-brand",
                  )}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
