import type { CTAProps } from "@/features/builder/state/types";

/**
 * Call-to-action banner. Three visual styles:
 *   - "solid":    dark slate background, white text — high contrast
 *   - "gradient": stone-to-near-black gradient, white text — slightly fancier
 *   - "subtle":   off-white background, slate text — quieter, fits between content
 */
const STYLE_CLASSES: Record<CTAProps["style"], { wrap: string; title: string; desc: string; button: string }> = {
  solid: {
    wrap: "bg-stone-900 text-white",
    title: "text-white",
    desc: "text-stone-300",
    button: "bg-white text-stone-900 hover:bg-stone-100",
  },
  gradient: {
    wrap: "bg-gradient-to-br from-stone-800 to-stone-950 text-white",
    title: "text-white",
    desc: "text-stone-300",
    button: "bg-white text-stone-900 hover:bg-stone-100",
  },
  subtle: {
    wrap: "bg-stone-50 text-stone-900 border-y border-stone-200",
    title: "text-stone-900",
    desc: "text-stone-600",
    button: "bg-stone-900 text-white hover:bg-stone-700",
  },
};

export default function CTARender({ props }: { props: CTAProps }) {
  const styles = STYLE_CLASSES[props.style];
  return (
    <section className={`px-6 py-16 md:px-10 ${styles.wrap}`}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-end">
        <div className="md:flex-1">
          <h2 className={`text-2xl font-bold tracking-tight md:text-3xl ${styles.title}`}>
            {props.title}
          </h2>
          {props.description && (
            <p className={`mt-2 text-base ${styles.desc}`}>{props.description}</p>
          )}
        </div>
        <a
          href={props.button.href}
          className={`inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-medium transition-colors ${styles.button}`}
        >
          {props.button.label}
        </a>
      </div>
    </section>
  );
}
