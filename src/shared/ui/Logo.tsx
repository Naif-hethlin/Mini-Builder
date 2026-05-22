import { cn } from "@/shared/lib/cn";

type Variant = "wordmark" | "wordmark-white" | "mark";

// Native aspect ratios of the source SVGs in public/brand/.
const META: Record<Variant, { src: string; ratio: number; alt: string }> = {
  wordmark: {
    src: "/brand/rekaz-logo.svg",
    ratio: 489.46 / 132.17,
    alt: "ركاز",
  },
  "wordmark-white": {
    src: "/brand/rekaz-logo-white.svg",
    ratio: 489.46 / 132.17,
    alt: "ركاز",
  },
  mark: {
    src: "/brand/rekaz-mark.svg",
    ratio: 1,
    alt: "ركاز",
  },
};

type LogoProps = {
  variant?: Variant;
  /** Rendered height in px. Width is derived from the source aspect ratio. */
  height?: number;
  className?: string;
};

export function Logo({
  variant = "wordmark",
  height = 32,
  className,
}: LogoProps) {
  const meta = META[variant];
  const width = Math.round(meta.ratio * height);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={meta.src}
      alt={meta.alt}
      width={width}
      height={height}
      className={cn("block select-none", className)}
      draggable={false}
    />
  );
}
