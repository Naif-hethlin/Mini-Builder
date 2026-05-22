// =============================================================================
// "تفكيك إلى لوحة حرة" — converts a preset Section into a Canvas section
// whose primitives roughly mirror the preset's content + layout, so the
// user can drag/recolor/edit each element freely.
//
// The exact pixel positions are best-effort: they approximate the preset's
// look at desktop size so the result doesn't look completely unfamiliar.
// Users are expected to refine the layout after the break.
// =============================================================================

import { newId } from "@/shared/lib/id";
import type {
  ButtonPrimitiveProps,
  HeadingPrimitiveProps,
  ImagePrimitiveProps,
  ListPrimitiveProps,
  Primitive,
  ShapePrimitiveProps,
  TextPrimitiveProps,
} from "@/features/primitives/types";
import type {
  CTAProps,
  FeaturesProps,
  FooterProps,
  HeaderProps,
  HeroProps,
  Section,
} from "./state/types";

const CANVAS_W = 1200;

function heading(
  x: number,
  y: number,
  w: number,
  text: string,
  level: 1 | 2 | 3 | 4,
  align: "start" | "center" | "end" = "start",
  color = "#1c1917",
): Primitive {
  const props: HeadingPrimitiveProps = { content: text, level, color, align };
  return { id: newId(), type: "heading", x, y, w, props };
}

function text(
  x: number,
  y: number,
  w: number,
  content: string,
  opts: Partial<TextPrimitiveProps> = {},
): Primitive {
  const props: TextPrimitiveProps = {
    content,
    fontSize: opts.fontSize ?? 16,
    weight: opts.weight ?? "regular",
    color: opts.color ?? "#475569",
    align: opts.align ?? "start",
  };
  return { id: newId(), type: "text", x, y, w, props };
}

function button(
  x: number,
  y: number,
  w: number,
  label: string,
  variant: ButtonPrimitiveProps["variant"] = "solid",
): Primitive {
  const props: ButtonPrimitiveProps = {
    label,
    variant,
    size: "md",
    action: { kind: "none" },
  };
  return { id: newId(), type: "button", x, y, w, props };
}

function image(
  x: number,
  y: number,
  w: number,
  h: number,
  url: string,
): Primitive {
  const props: ImagePrimitiveProps = {
    url,
    alt: "صورة",
    fit: "cover",
    rounded: true,
    action: { kind: "none" },
  };
  return { id: newId(), type: "image", x, y, w, h, props };
}

function shape(
  x: number,
  y: number,
  w: number,
  h: number,
  kind: ShapePrimitiveProps["kind"],
  fillColor: string,
): Primitive {
  const props: ShapePrimitiveProps = {
    kind,
    fillColor,
    borderColor: "#e2e8f0",
    borderWidth: 0,
  };
  return { id: newId(), type: "shape", x, y, w, h, props };
}

function list(
  x: number,
  y: number,
  w: number,
  items: string[],
  style: ListPrimitiveProps["style"] = "bullet",
): Primitive {
  const props: ListPrimitiveProps = {
    items: items.map((t) => ({ id: newId(), text: t })),
    style,
    fontSize: 16,
    color: "#1c1917",
  };
  return { id: newId(), type: "list", x, y, w, props };
}

// -----------------------------------------------------------------------------
// Per-section converters
// -----------------------------------------------------------------------------

function explodeHeader(p: HeaderProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  primitives.push(heading(40, 24, 280, p.brand.label, 3));
  // Nav links in a row, right-aligned-ish.
  const linkW = 110;
  const navStartX = CANVAS_W - linkW * p.links.length - 200;
  p.links.forEach((l, i) => {
    primitives.push(
      text(navStartX + i * linkW, 32, linkW, l.label, {
        weight: "medium",
      }),
    );
  });
  if (p.ctaButton.show) {
    primitives.push(
      button(CANVAS_W - 160, 22, 140, p.ctaButton.label, "solid"),
    );
  }
  return { primitives, height: 100 };
}

function explodeHero(p: HeroProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 60;
  const halfW = (CANVAS_W - padX * 2 - 60) / 2;
  const imageLeft = p.layout === "image-left";

  if (p.layout === "image-bg") {
    // Background shape + image + centered text overlay.
    primitives.push(shape(padX, 40, CANVAS_W - padX * 2, 520, "square", "#0f172a"));
    if (p.imageUrl)
      primitives.push(image(padX, 40, CANVAS_W - padX * 2, 520, p.imageUrl));
    const textX = padX + 80;
    const textW = CANVAS_W - padX * 2 - 160;
    let y = 160;
    if (p.eyebrow) {
      primitives.push(
        text(textX, y, textW, p.eyebrow.toUpperCase(), {
          weight: "semibold",
          align: "center",
          color: "#ffffff",
        }),
      );
      y += 32;
    }
    primitives.push(
      heading(textX, y, textW, p.title, 1, "center", "#ffffff"),
    );
    y += 80;
    if (p.subtitle) {
      primitives.push(
        text(textX, y, textW, p.subtitle, {
          fontSize: 18,
          align: "center",
          color: "#e2e8f0",
        }),
      );
      y += 60;
    }
    let bx = textX + textW / 2 - 140;
    if (p.primaryButton.show) {
      primitives.push(button(bx, y, 140, p.primaryButton.label, "solid"));
      bx += 156;
    }
    if (p.secondaryButton.show) {
      primitives.push(button(bx, y, 140, p.secondaryButton.label, "outline"));
    }
    return { primitives, height: 600 };
  }

  if (p.layout === "no-image") {
    const textX = padX + 80;
    const textW = CANVAS_W - padX * 2 - 160;
    let y = 80;
    if (p.eyebrow) {
      primitives.push(
        text(textX, y, textW, p.eyebrow.toUpperCase(), {
          weight: "semibold",
          align: "center",
          color: "#64748b",
        }),
      );
      y += 32;
    }
    primitives.push(
      heading(textX, y, textW, p.title, 1, "center"),
    );
    y += 80;
    if (p.subtitle) {
      primitives.push(
        text(textX, y, textW, p.subtitle, {
          fontSize: 18,
          align: "center",
          color: "#64748b",
        }),
      );
      y += 60;
    }
    let bx = textX + textW / 2 - 140;
    if (p.primaryButton.show) {
      primitives.push(button(bx, y, 140, p.primaryButton.label, "solid"));
      bx += 156;
    }
    if (p.secondaryButton.show) {
      primitives.push(button(bx, y, 140, p.secondaryButton.label, "outline"));
    }
    return { primitives, height: y + 80 };
  }

  // Side-by-side (image-right default; image-left mirrors).
  const imageX = imageLeft ? padX : padX + halfW + 60;
  const textX = imageLeft ? padX + halfW + 60 : padX;
  if (p.imageUrl) primitives.push(image(imageX, 60, halfW, 400, p.imageUrl));
  else primitives.push(shape(imageX, 60, halfW, 400, "square", "#f1f5f9"));

  let y = 80;
  if (p.eyebrow) {
    primitives.push(
      text(textX, y, halfW, p.eyebrow.toUpperCase(), {
        weight: "semibold",
        color: "#64748b",
      }),
    );
    y += 32;
  }
  primitives.push(heading(textX, y, halfW, p.title, 1));
  y += 110;
  if (p.subtitle) {
    primitives.push(
      text(textX, y, halfW, p.subtitle, { fontSize: 18, color: "#475569" }),
    );
    y += 80;
  }
  let bx = textX;
  if (p.primaryButton.show) {
    primitives.push(button(bx, y, 140, p.primaryButton.label, "solid"));
    bx += 156;
  }
  if (p.secondaryButton.show) {
    primitives.push(button(bx, y, 140, p.secondaryButton.label, "outline"));
  }
  return { primitives, height: 520 };
}

function explodeFeatures(p: FeaturesProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 60;
  const innerW = CANVAS_W - padX * 2;

  let y = 60;
  if (p.eyebrow) {
    primitives.push(
      text(padX, y, innerW, p.eyebrow.toUpperCase(), {
        weight: "semibold",
        align: "center",
        color: "#64748b",
      }),
    );
    y += 32;
  }
  primitives.push(heading(padX, y, innerW, p.title, 2, "center"));
  y += 70;
  if (p.subtitle) {
    primitives.push(
      text(padX, y, innerW, p.subtitle, {
        align: "center",
        color: "#64748b",
      }),
    );
    y += 60;
  }

  // Cards row
  const cols = Math.min(p.columns, p.items.length || 1);
  const gap = 24;
  const cardW = Math.floor((innerW - gap * (cols - 1)) / cols);
  const cardH = 200;

  p.items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = padX + col * (cardW + gap);
    const cy = y + row * (cardH + gap);
    // Card background
    primitives.push(shape(cx, cy, cardW, cardH, "square", "#f8fafc"));
    // Title
    primitives.push(heading(cx + 20, cy + 24, cardW - 40, item.title, 3));
    // Description
    primitives.push(
      text(cx + 20, cy + 80, cardW - 40, item.description, {
        color: "#475569",
      }),
    );
  });

  const rows = Math.ceil(p.items.length / cols);
  return { primitives, height: y + rows * (cardH + gap) + 40 };
}

function explodeCta(p: CTAProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 60;
  const innerW = CANVAS_W - padX * 2;
  const bg = p.style === "gradient" ? "#e85d5d" : "#0f172a";

  primitives.push(shape(padX, 40, innerW, 240, "square", bg));
  primitives.push(
    heading(padX, 90, innerW, p.title, 2, "center", "#ffffff"),
  );
  primitives.push(
    text(padX, 170, innerW, p.description, {
      align: "center",
      color: "#e2e8f0",
    }),
  );
  primitives.push(button(CANVAS_W / 2 - 80, 220, 160, p.button.label, "solid"));
  return { primitives, height: 320 };
}

function explodeHeader2(p: HeaderProps): {
  primitives: Primitive[];
  height: number;
} {
  return explodeHeader(p);
}

function explodeFooter(p: FooterProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 60;
  const innerW = CANVAS_W - padX * 2;

  primitives.push(heading(padX, 40, 320, p.brand.text, 3));
  primitives.push(
    text(padX, 88, 320, p.brand.tagline, { color: "#64748b" }),
  );

  const colW = Math.min(220, Math.floor((innerW - 360) / Math.max(1, p.columns.length)));
  p.columns.forEach((col, i) => {
    const cx = padX + 360 + i * (colW + 16);
    primitives.push(heading(cx, 40, colW, col.title, 4));
    primitives.push(
      list(
        cx,
        80,
        colW,
        col.links.map((l) => l.label),
        "bullet",
      ),
    );
  });

  primitives.push(text(padX, 240, innerW, p.copyright, { color: "#94a3b8" }));
  return { primitives, height: 300 };
}

// -----------------------------------------------------------------------------
// Public entry point
// -----------------------------------------------------------------------------

/** Returns true when explodeSection can handle this section's type. */
export function isExplodable(section: Section): boolean {
  switch (section.type) {
    case "header":
    case "hero":
    case "features":
    case "cta":
    case "footer":
      return true;
    default:
      return false;
  }
}

/**
 * Convert a preset Section into a Canvas Section whose primitives mirror
 * its content + approximate its layout. Returns `null` for section types we
 * don't (yet) support — callers should check `isExplodable` first.
 */
export function explodeSection(section: Section): Section | null {
  let result: { primitives: Primitive[]; height: number } | null = null;

  switch (section.type) {
    case "header":
      result = explodeHeader2(section.props);
      break;
    case "hero":
      result = explodeHero(section.props);
      break;
    case "features":
      result = explodeFeatures(section.props);
      break;
    case "cta":
      result = explodeCta(section.props);
      break;
    case "footer":
      result = explodeFooter(section.props);
      break;
    default:
      return null;
  }

  return {
    id: newId(),
    type: "canvas",
    props: {
      height: result.height,
      background: "white",
      primitives: result.primitives,
    },
  };
}
