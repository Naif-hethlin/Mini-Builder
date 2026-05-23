import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { PricingProps } from "@/features/builder/state/types";

// Schema-driven <select> stores booleans as the strings "true" / "false",
// while the typed defaults seed with actual booleans. Accept both.
function isHighlighted(v: unknown): boolean {
  return v === true || v === "true";
}

export default function PricingRender({ props }: { props: PricingProps }) {
  return (
    <section className="bg-white px-6 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          {props.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">
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
        <div className="grid gap-6 md:grid-cols-3">
          {props.plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border bg-white p-7 shadow-sm transition-shadow",
                isHighlighted(plan.highlighted)
                  ? "border-brand ring-2 ring-brand/30 shadow-[0_12px_40px_-8px_rgba(232,93,93,0.25)]"
                  : "border-stone-200 hover:shadow-md",
              )}
            >
              {isHighlighted(plan.highlighted) && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                  الأكثر شعبية
                </span>
              )}

              <h3 className="text-lg font-bold text-stone-900">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-stone-900">
                  {plan.price}
                </span>
                {plan.cadence && (
                  <span className="text-sm text-stone-500">
                    {plan.cadence}
                  </span>
                )}
              </div>

              <ul className="my-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f, i) => (
                  <li key={`${plan.id}-f-${i}`} className="flex items-start gap-2">
                    <Check
                      size={15}
                      className={cn(
                        "mt-0.5 shrink-0",
                        isHighlighted(plan.highlighted) ? "text-brand" : "text-emerald-500",
                      )}
                    />
                    <span className="text-stone-600">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold transition-colors",
                  isHighlighted(plan.highlighted)
                    ? "bg-brand text-white shadow-sm hover:bg-brand-dark"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-brand hover:text-brand",
                )}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
