import { Image as ImageIcon } from "lucide-react";
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

        <div className={cn("grid gap-4", COLS[props.columns])}>
          {props.items.map((item) => (
            <figure
              key={item.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone-300">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>
              {(item.title || item.category) && (
                <figcaption className="p-4">
                  {item.title && (
                    <p className="text-sm font-semibold text-stone-900">
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
