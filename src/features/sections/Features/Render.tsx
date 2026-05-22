import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FeaturesProps } from "@/features/builder/state/types";

const GRID_COLS: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

/**
 * Look up a lucide-react icon by name string. Returns the Coffee icon as a
 * fallback if the name is unknown — keeps rendering safe when the user enters
 * an icon name that doesn't exist.
 */
function getIcon(name: string): LucideIcon {
  return (
    (LucideIcons as unknown as Record<string, LucideIcon>)[name] ??
    LucideIcons.Sparkles
  );
}

export default function FeaturesRender({ props }: { props: FeaturesProps }) {
  return (
    <section className="bg-white px-6 py-16 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          {props.eyebrow && (
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-stone-500">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            {props.title}
          </h2>
          {props.subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-base text-stone-600">
              {props.subtitle}
            </p>
          )}
        </div>

        <div className={`grid gap-6 ${GRID_COLS[props.columns]}`}>
          {props.items.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <div
                key={item.id}
                className="rounded-lg border border-stone-200 bg-white p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 text-stone-700">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-stone-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-stone-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
