import { Image as ImageIcon } from "lucide-react";
import type { ImagePrimitiveProps } from "../types";

export default function ImageRender({
  props,
}: {
  props: ImagePrimitiveProps;
}) {
  const fitClass = props.fit === "contain" ? "object-contain" : "object-cover";
  const roundClass = props.rounded ? "rounded-2xl" : "rounded-none";
  if (!props.url) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-stone-100 text-stone-300 ${roundClass}`}
      >
        <ImageIcon size={28} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={props.url}
      alt={props.alt}
      className={`h-full w-full ${fitClass} ${roundClass}`}
    />
  );
}
