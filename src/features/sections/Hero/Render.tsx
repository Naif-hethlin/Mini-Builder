import type { HeroProps } from "@/app/web-builder/_back/types";

/**
 * Hero section. Supports 4 layout variants:
 *   - "image-right" / "image-left": text + image side-by-side
 *   - "image-bg":                   image fills the background, text overlays
 *   - "no-image":                   centered text only
 */
export default function HeroRender({ props }: { props: HeroProps }) {
  const isImageBg = props.layout === "image-bg";
  const noImage = props.layout === "no-image";
  const imageLeft = props.layout === "image-left";

  // Background-image variant — image fills the whole section, text overlays.
  if (isImageBg) {
    return (
      <section
        className="relative flex min-h-[480px] items-center justify-center bg-cover bg-center px-6 py-20 text-white md:px-10"
        style={{ backgroundImage: `url(${props.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-slate-900/55" />
        <div className="relative max-w-2xl text-center">
          <HeroText
            props={props}
            textColor="text-white"
            subColor="text-slate-200"
          />
        </div>
      </section>
    );
  }

  // Centered no-image variant.
  if (noImage) {
    return (
      <section className="bg-white px-6 py-20 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <HeroText props={props} />
        </div>
      </section>
    );
  }

  // Side-by-side variant (image-left or image-right).
  return (
    <section className="bg-white px-6 py-16 md:px-10">
      <div
        className={`mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center ${imageLeft ? "md:[&>div:first-child]:order-2" : ""}`}
      >
        <div className={props.alignment === "center" ? "text-center" : ""}>
          <HeroText props={props} />
        </div>
        <div className="overflow-hidden rounded-xl bg-slate-100">
          {props.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="aspect-[4/3] bg-slate-200" />
          )}
        </div>
      </div>
    </section>
  );
}

/** Internal — the headline + subtitle + buttons block. Shared across variants. */
function HeroText({
  props,
  textColor = "text-slate-900",
  subColor = "text-slate-600",
}: {
  props: HeroProps;
  textColor?: string;
  subColor?: string;
}) {
  return (
    <>
      {props.eyebrow && (
        <p className={`mb-3 text-sm font-medium uppercase tracking-wider ${subColor}`}>
          {props.eyebrow}
        </p>
      )}
      <h1
        className={`text-4xl font-bold leading-tight tracking-tight md:text-5xl ${textColor}`}
      >
        {props.title}
      </h1>
      {props.subtitle && (
        <p className={`mt-4 text-lg ${subColor}`}>{props.subtitle}</p>
      )}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        {props.primaryButton.show && (
          <a
            href={props.primaryButton.href}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            {props.primaryButton.label}
          </a>
        )}
        {props.secondaryButton.show && (
          <a
            href={props.secondaryButton.href}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
          >
            {props.secondaryButton.label}
          </a>
        )}
      </div>
    </>
  );
}
