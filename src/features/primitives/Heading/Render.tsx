import type { HeadingPrimitiveProps } from "../types";

const LEVEL_CLASS: Record<HeadingPrimitiveProps["level"], string> = {
  1: "text-4xl font-extrabold leading-tight",
  2: "text-3xl font-bold leading-tight",
  3: "text-2xl font-semibold leading-snug",
  4: "text-xl font-semibold leading-snug",
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
  return (
    <Tag
      className={`${LEVEL_CLASS[props.level]} ${ALIGN_CLASS[props.align]}`}
      style={{ color: props.color }}
    >
      {props.content}
    </Tag>
  );
}
