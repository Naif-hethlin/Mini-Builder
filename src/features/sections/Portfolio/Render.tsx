import { ArrowUpLeft, Image as ImageIcon, LayoutGrid } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { PortfolioProps } from "@/features/builder/state/types";

const COLS: Record<PortfolioProps["columns"], string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export default function PortfolioRender({
  props,
}: {
  props: PortfolioProps;
}) {
  return (
    <section className="bg-stone-50 px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        {(props.title || props.subtitle) && (
          <div className="mb-12 text-center">
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
              <LayoutGrid size={22} />
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
            <figure
              key={item.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone-300">
                    <ImageIcon size={32} />
                  </div>
                )}
                {/* Dark overlay reveals on hover */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {/* Inline category chip top-end */}
                {item.category && (
                  <span className="absolute end-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-stone-700 backdrop-blur-sm">
                    {item.category}
                  </span>
                )}
                {/* Hover CTA bottom-end */}
                <span className="pointer-events-none absolute bottom-3 end-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-stone-900 opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpLeft size={16} />
                </span>
              </div>
              {(item.title || item.category) && (
                <figcaption className="p-4">
                  {item.title && (
                    <p className="text-sm font-bold text-stone-900 transition-colors group-hover:text-brand-dark">
                      {item.title}
                    </p>
                  )}
                  {item.category && (
                    <p className="mt-0.5 text-xs text-stone-500">
                      {item.category}
                    </p>
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
