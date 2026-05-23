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
  InputPrimitiveProps,
  ListPrimitiveProps,
  Primitive,
  QAPrimitiveProps,
  ShapePrimitiveProps,
  TextPrimitiveProps,
} from "@/features/primitives/types";
import type {
  BookingProps,
  CTAProps,
  ContactProps,
  FAQProps,
  FeaturesProps,
  FooterProps,
  GalleryProps,
  HeaderProps,
  HeroProps,
  MenuProps,
  PortfolioProps,
  PricingProps,
  Section,
  TestimonialsProps,
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

function input(
  x: number,
  y: number,
  w: number,
  label: string,
  placeholder = "",
  fieldType: InputPrimitiveProps["fieldType"] = "text",
): Primitive {
  const props: InputPrimitiveProps = {
    label,
    placeholder,
    required: false,
    fieldType,
  };
  return { id: newId(), type: "input", x, y, w, props };
}

function qa(
  x: number,
  y: number,
  w: number,
  question: string,
  answer: string,
): Primitive {
  const props: QAPrimitiveProps = {
    question,
    answer,
    defaultOpen: false,
  };
  return { id: newId(), type: "qa", x, y, w, props };
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
// Section-header helper — every 'content' section starts with the same
// title + subtitle stack at the top.
// -----------------------------------------------------------------------------

function sectionHeader(
  startY: number,
  innerX: number,
  innerW: number,
  primitives: Primitive[],
  title: string,
  subtitle?: string,
): number {
  let y = startY;
  primitives.push(heading(innerX, y, innerW, title, 2, "center"));
  y += 70;
  if (subtitle) {
    primitives.push(
      text(innerX, y, innerW, subtitle, {
        align: "center",
        color: "#64748b",
      }),
    );
    y += 50;
  }
  return y;
}

// -----------------------------------------------------------------------------
// Pricing
// -----------------------------------------------------------------------------

function explodePricing(p: PricingProps): {
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
        color: "#e85d5d",
      }),
    );
    y += 32;
  }
  y = sectionHeader(y, padX, innerW, primitives, p.title, p.subtitle);

  const cols = Math.min(p.plans.length || 1, 3);
  const gap = 24;
  const cardW = Math.floor((innerW - gap * (cols - 1)) / cols);
  const cardH = 360;

  p.plans.forEach((plan, i) => {
    const cx = padX + i * (cardW + gap);
    const cy = y;
    const highlighted = plan.highlighted === true || (plan.highlighted as unknown) === "true";
    // Card background
    primitives.push(
      shape(cx, cy, cardW, cardH, "rounded-rect", highlighted ? "#fdeeea" : "#f8fafc"),
    );
    // Plan name
    primitives.push(heading(cx + 24, cy + 24, cardW - 48, plan.name, 3));
    // Price
    primitives.push(
      heading(cx + 24, cy + 64, cardW - 48, `${plan.price}${plan.cadence ? " " + plan.cadence : ""}`, 2),
    );
    // Features as a list
    if (plan.features.length > 0) {
      primitives.push(
        list(cx + 24, cy + 140, cardW - 48, plan.features, "check"),
      );
    }
    // CTA button
    primitives.push(
      button(
        cx + 24,
        cy + cardH - 60,
        cardW - 48,
        plan.cta,
        highlighted ? "solid" : "outline",
      ),
    );
  });

  return { primitives, height: y + cardH + 40 };
}

// -----------------------------------------------------------------------------
// Gallery — N images in a column grid.
// -----------------------------------------------------------------------------

function explodeGallery(p: GalleryProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 60;
  const innerW = CANVAS_W - padX * 2;

  let y = 60;
  y = sectionHeader(y, padX, innerW, primitives, p.title, p.subtitle);

  const cols = p.columns;
  const gap = 16;
  const tileW = Math.floor((innerW - gap * (cols - 1)) / cols);
  const tileH = Math.round(tileW * 0.75);

  p.items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = padX + col * (tileW + gap);
    const cy = y + row * (tileH + gap);
    if (item.url) {
      primitives.push(image(cx, cy, tileW, tileH, item.url));
    } else {
      primitives.push(shape(cx, cy, tileW, tileH, "rounded-rect", "#f1f5f9"));
    }
  });

  const rows = Math.ceil(p.items.length / cols);
  return { primitives, height: y + rows * (tileH + gap) + 40 };
}

// -----------------------------------------------------------------------------
// Testimonials — quote cards in a row.
// -----------------------------------------------------------------------------

function explodeTestimonials(p: TestimonialsProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 60;
  const innerW = CANVAS_W - padX * 2;

  let y = 60;
  y = sectionHeader(y, padX, innerW, primitives, p.title, p.subtitle);

  const cols = p.columns;
  const gap = 24;
  const cardW = Math.floor((innerW - gap * (cols - 1)) / cols);
  const cardH = 240;

  p.items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = padX + col * (cardW + gap);
    const cy = y + row * (cardH + gap);
    primitives.push(shape(cx, cy, cardW, cardH, "rounded-rect", "#f8fafc"));
    primitives.push(
      text(cx + 24, cy + 24, cardW - 48, `"${item.quote}"`, {
        fontSize: 14,
        weight: "medium",
      }),
    );
    primitives.push(heading(cx + 24, cy + cardH - 80, cardW - 48, item.name, 4));
    primitives.push(
      text(cx + 24, cy + cardH - 48, cardW - 48, item.role, {
        fontSize: 12,
        color: "#64748b",
      }),
    );
  });

  const rows = Math.ceil(p.items.length / cols);
  return { primitives, height: y + rows * (cardH + gap) + 40 };
}

// -----------------------------------------------------------------------------
// FAQ — section header + Q&A primitives stacked vertically.
// -----------------------------------------------------------------------------

function explodeFaq(p: FAQProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 120;
  const innerW = CANVAS_W - padX * 2;

  let y = 60;
  y = sectionHeader(y, padX, innerW, primitives, p.title, p.subtitle);

  const itemGap = 12;
  const itemH = 60;
  p.items.forEach((item, i) => {
    primitives.push(
      qa(padX, y + i * (itemH + itemGap), innerW, item.question, item.answer),
    );
  });

  return {
    primitives,
    height: y + p.items.length * (itemH + itemGap) + 40,
  };
}

// -----------------------------------------------------------------------------
// Contact — text block + clickable contact lines.
// -----------------------------------------------------------------------------

function explodeContact(p: ContactProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 120;
  const innerW = CANVAS_W - padX * 2;

  let y = 60;
  y = sectionHeader(y, padX, innerW, primitives, p.title, p.subtitle);

  // Contact lines as headings (so they're prominent + editable)
  if (p.email) {
    primitives.push(text(padX, y, innerW, "البريد", { fontSize: 12, color: "#64748b", align: "center" }));
    y += 22;
    primitives.push(heading(padX, y, innerW, p.email, 3, "center"));
    y += 56;
  }
  if (p.phone) {
    primitives.push(text(padX, y, innerW, "الجوال", { fontSize: 12, color: "#64748b", align: "center" }));
    y += 22;
    primitives.push(heading(padX, y, innerW, p.phone, 3, "center"));
    y += 56;
  }
  if (p.address) {
    primitives.push(text(padX, y, innerW, "العنوان", { fontSize: 12, color: "#64748b", align: "center" }));
    y += 22;
    primitives.push(text(padX, y, innerW, p.address, { align: "center" }));
    y += 40;
  }

  return { primitives, height: y + 40 };
}

// -----------------------------------------------------------------------------
// Booking — name + phone + date + time + (staff) + submit, as input
// primitives the user can rearrange.
// -----------------------------------------------------------------------------

function explodeBooking(p: BookingProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 200;
  const innerW = CANVAS_W - padX * 2;

  let y = 60;
  y = sectionHeader(y, padX, innerW, primitives, p.title, p.subtitle);

  const inputGap = 12;
  const inputH = 70;

  primitives.push(input(padX, y, innerW, "الاسم", "اسمك الكامل", "text"));
  y += inputH + inputGap;

  primitives.push(input(padX, y, innerW, "الجوال", "05xxxxxxxx", "tel"));
  y += inputH + inputGap;

  primitives.push(input(padX, y, innerW, "التاريخ", "YYYY-MM-DD", "text"));
  y += inputH + inputGap;

  primitives.push(
    input(padX, y, innerW, "الوقت", p.slots[0] ?? "HH:MM", "text"),
  );
  y += inputH + inputGap;

  if (p.staff.length > 0) {
    primitives.push(
      list(
        padX,
        y,
        innerW,
        ["اختر من فريق العمل:", ...p.staff.map((s) => s.name)],
        "bullet",
      ),
    );
    y += 24 + p.staff.length * 24 + 12;
  }

  primitives.push(button(padX, y, innerW, p.buttonLabel, "solid"));
  y += 60;

  return { primitives, height: y + 40 };
}

// -----------------------------------------------------------------------------
// Menu — image + name + price + description per item.
// -----------------------------------------------------------------------------

function explodeMenu(p: MenuProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 60;
  const innerW = CANVAS_W - padX * 2;

  let y = 60;
  y = sectionHeader(y, padX, innerW, primitives, p.title, p.subtitle);

  const cols = p.columns;
  const gap = 20;
  const cardW = Math.floor((innerW - gap * (cols - 1)) / cols);
  const imgH = 180;
  const cardH = imgH + 130;

  p.items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = padX + col * (cardW + gap);
    const cy = y + row * (cardH + gap);

    // Card backdrop
    primitives.push(shape(cx, cy, cardW, cardH, "rounded-rect", "#ffffff"));
    // Image
    if (item.imageUrl) {
      primitives.push(image(cx, cy, cardW, imgH, item.imageUrl));
    } else {
      primitives.push(shape(cx, cy, cardW, imgH, "square", "#f1f5f9"));
    }
    // Title
    primitives.push(heading(cx + 16, cy + imgH + 12, cardW - 32, item.name, 4));
    // Price
    primitives.push(
      text(cx + 16, cy + imgH + 44, cardW - 32, `${item.price} ${p.currency}`, {
        weight: "semibold",
        color: "#e85d5d",
      }),
    );
    // Description
    if (item.description) {
      primitives.push(
        text(cx + 16, cy + imgH + 70, cardW - 32, item.description, {
          fontSize: 13,
          color: "#64748b",
        }),
      );
    }
  });

  const rows = Math.ceil(p.items.length / cols);
  return { primitives, height: y + rows * (cardH + gap) + 40 };
}

// -----------------------------------------------------------------------------
// Portfolio — image + title + category overlay.
// -----------------------------------------------------------------------------

function explodePortfolio(p: PortfolioProps): {
  primitives: Primitive[];
  height: number;
} {
  const primitives: Primitive[] = [];
  const padX = 60;
  const innerW = CANVAS_W - padX * 2;

  let y = 60;
  y = sectionHeader(y, padX, innerW, primitives, p.title, p.subtitle);

  const cols = p.columns;
  const gap = 16;
  const tileW = Math.floor((innerW - gap * (cols - 1)) / cols);
  const tileH = Math.round(tileW * 0.8);
  const captionH = 60;

  p.items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = padX + col * (tileW + gap);
    const cy = y + row * (tileH + captionH + gap);
    if (item.imageUrl) {
      primitives.push(image(cx, cy, tileW, tileH, item.imageUrl));
    } else {
      primitives.push(shape(cx, cy, tileW, tileH, "rounded-rect", "#f1f5f9"));
    }
    primitives.push(heading(cx + 8, cy + tileH + 8, tileW - 16, item.title, 4));
    primitives.push(
      text(cx + 8, cy + tileH + 36, tileW - 16, item.category, {
        fontSize: 12,
        color: "#64748b",
      }),
    );
  });

  const rows = Math.ceil(p.items.length / cols);
  return {
    primitives,
    height: y + rows * (tileH + captionH + gap) + 40,
  };
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
    case "pricing":
    case "cta":
    case "footer":
    case "gallery":
    case "testimonials":
    case "faq":
    case "contact":
    case "booking":
    case "menu":
    case "portfolio":
      return true;
    case "canvas":
      return false; // already free
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
    case "pricing":
      result = explodePricing(section.props);
      break;
    case "cta":
      result = explodeCta(section.props);
      break;
    case "footer":
      result = explodeFooter(section.props);
      break;
    case "gallery":
      result = explodeGallery(section.props);
      break;
    case "testimonials":
      result = explodeTestimonials(section.props);
      break;
    case "faq":
      result = explodeFaq(section.props);
      break;
    case "contact":
      result = explodeContact(section.props);
      break;
    case "booking":
      result = explodeBooking(section.props);
      break;
    case "menu":
      result = explodeMenu(section.props);
      break;
    case "portfolio":
      result = explodePortfolio(section.props);
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
