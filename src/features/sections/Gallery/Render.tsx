import { Image as ImageIcon, Maximize2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { GalleryProps } from "@/features/builder/state/types";

const GRID_COLS: Record<GalleryProps["columns"], string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
};

export default function GalleryRender({ props }: { props: GalleryProps }) {
  return (
    <section className="bg-white px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        {(props.title || props.subtitle) && (
          <div className="mb-12 text-center">
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
              <ImageIcon size={22} />
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

        <div className={cn("grid gap-4", GRID_COLS[props.columns])}>
          {props.items.map((item) => (
            <figure
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-100 shadow-sm transition-shadow hover:shadow-lg"
            >
              {item.url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover overlay with the alt as caption */}
                  <figcaption
                    className={cn(
                      "pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-stone-900/70 via-stone-900/0 to-transparent p-4 opacity-0 transition-opacity duration-300",
                      "group-hover:opacity-100",
                    )}
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-white">
                      <Maximize2 size={12} />
                      {item.alt || "صورة"}
                    </span>
                  </figcaption>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-300">
                  <ImageIcon size={32} />
                </div>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
