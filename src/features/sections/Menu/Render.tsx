import { Coffee } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { MenuProps } from "@/features/builder/state/types";

const COLS: Record<MenuProps["columns"], string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
};

export default function MenuRender({ props }: { props: MenuProps }) {
  return (
    <section className="bg-white px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
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
            <article
              key={item.id}
              className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-stone-300">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Coffee size={24} />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-stone-900">
                    {item.name}
                  </h3>
                  <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand">
                    {item.price} {props.currency}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">
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
