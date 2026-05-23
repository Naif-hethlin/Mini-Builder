import type { HeadingPrimitiveProps } from "../types";

// Default size + leading per heading level. Weight is overridable via the
// `weight` prop, which lets explode mappings match the preset Hero's
// `font-bold tracking-tight` look instead of the default `font-extrabold`.
const SIZE_CLASS: Record<HeadingPrimitiveProps["level"], string> = {
  1: "text-4xl leading-tight md:text-5xl",
  2: "text-3xl leading-tight md:text-4xl",
  3: "text-2xl leading-snug",
  4: "text-xl leading-snug",
};

const DEFAULT_WEIGHT_CLASS: Record<HeadingPrimitiveProps["level"], string> = {
  1: "font-extrabold",
  2: "font-bold",
  3: "font-semibold",
  4: "font-semibold",
};

const WEIGHT_CLASS: Record<
  NonNullable<HeadingPrimitiveProps["weight"]>,
  string
> = {
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

const TRACKING_CLASS: Record<
  NonNullable<HeadingPrimitiveProps["tracking"]>,
  string
> = {
  normal: "tracking-normal",
  tight: "tracking-tight",
  tighter: "tracking-tighter",
};

const ALIGN_CLASS: Record<HeadingPrimitiveProps["align"], string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

export default function HeadingRender({
  props,
}: {
  props: HeadingPrimitiveProps;
}) {
  const Tag = `h${props.level}` as "h1" | "h2" | "h3" | "h4";
  const weightClass = props.weight
    ? WEIGHT_CLASS[props.weight]
    : DEFAULT_WEIGHT_CLASS[props.level];
  const trackingClass = props.tracking
    ? TRACKING_CLASS[props.tracking]
    : "";
  return (
    <Tag
      className={`${SIZE_CLASS[props.level]} ${weightClass} ${trackingClass} ${ALIGN_CLASS[props.align]}`}
      style={{ color: props.color }}
    >
      {props.content}
    </Tag>
  );
}
