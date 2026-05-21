import type { CTAProps } from "@/app/web-builder/_back/types";

/**
 * Call-to-action banner. Three visual styles:
 *   - "solid":    dark slate background, white text — high contrast
 *   - "gradient": slate-to-near-black gradient, white text — slightly fancier
 *   - "subtle":   off-white background, slate text — quieter, fits between content
 */
const STYLE_CLASSES: Record<CTAProps["style"], { wrap: string; title: string; desc: string; button: string }> = {
  solid: {
    wrap: "bg-slate-900 text-white",
    title: "text-white",
    desc: "text-slate-300",
    button: "bg-white text-slate-900 hover:bg-slate-100",
  },
  gradient: {
    wrap: "bg-gradient-to-br from-slate-800 to-slate-950 text-white",
    title: "text-white",
    desc: "text-slate-300",
    button: "bg-white text-slate-900 hover:bg-slate-100",
  },
  subtle: {
    wrap: "bg-slate-50 text-slate-900 border-y border-slate-200",
    title: "text-slate-900",
    desc: "text-slate-600",
    button: "bg-slate-900 text-white hover:bg-slate-700",
  },
};

export default function CTARender({ props }: { props: CTAProps }) {
  const styles = STYLE_CLASSES[props.style];
  return (
    <section className={`px-6 py-16 md:px-10 ${styles.wrap}`}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-left">
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
