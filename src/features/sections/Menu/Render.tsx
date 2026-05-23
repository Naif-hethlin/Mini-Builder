import { Coffee, Utensils } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { MenuProps } from "@/features/builder/state/types";

const COLS: Record<MenuProps["columns"], string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
};

export default function MenuRender({ props }: { props: MenuProps }) {
  return (
    <section className="bg-stone-50/60 px-6 py-20 md:px-10">
      <div className="mx-auto max-w-5xl">
        {(props.title || props.subtitle) && (
          <div className="mb-12 text-center">
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
              <Utensils size={22} />
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

        <div className={cn("grid gap-5", COLS[props.columns])}>
          {props.items.map((item) => (
            <article
              key={item.id}
              className="group flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_2px_20px_rgb(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_12px_30px_-10px_rgb(232,93,93,0.18)]"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 text-stone-300">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Coffee size={28} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-stone-900 transition-colors group-hover:text-brand-dark">
                    {item.name}
                  </h3>
                  <span className="shrink-0 rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
                    {item.price}{" "}
                    <span className="opacity-70">{props.currency}</span>
                  </span>
                </div>
                {item.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                    {item.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
