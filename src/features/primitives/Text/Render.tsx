import type { TextPrimitiveProps } from "../types";

const WEIGHT_CLASS: Record<TextPrimitiveProps["weight"], string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const ALIGN_CLASS: Record<TextPrimitiveProps["align"], string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

export default function TextRender({
  props,
}: {
  props: TextPrimitiveProps;
}) {
  return (
    <p
      className={`leading-relaxed ${WEIGHT_CLASS[props.weight]} ${ALIGN_CLASS[props.align]}`}
      style={{ color: props.color, fontSize: `${props.fontSize}px` }}
    >
      {props.content}
    </p>
  );
}
