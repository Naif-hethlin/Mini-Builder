import { Check } from "lucide-react";
import type { ListPrimitiveProps } from "../types";

export default function ListRender({
  props,
}: {
  props: ListPrimitiveProps;
}) {
  const style = { color: props.color, fontSize: `${props.fontSize}px` };

  if (props.style === "number") {
    return (
      <ol
        className="list-decimal space-y-1 ps-5 leading-relaxed"
        style={style}
      >
        {props.items.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ol>
    );
  }

  if (props.style === "check") {
    return (
      <ul className="space-y-1.5 leading-relaxed" style={style}>
        {props.items.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <Check
              size={Math.max(12, Math.round(props.fontSize * 0.9))}
              className="mt-1 shrink-0 text-emerald-500"
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className="list-disc space-y-1 ps-5 leading-relaxed"
      style={style}
    >
      {props.items.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}
