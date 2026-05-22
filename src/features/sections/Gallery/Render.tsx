import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { GalleryProps } from "@/features/builder/state/types";

const GRID_COLS: Record<GalleryProps["columns"], string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
};

export default function GalleryRender({ props }: { props: GalleryProps }) {
  return (
    <section className="bg-white px-6 py-16 md:px-10">
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

        <div className={cn("grid gap-3", GRID_COLS[props.columns])}>
          {props.items.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100"
            >
              {item.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.alt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-300">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
