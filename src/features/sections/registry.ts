import type { ComponentType } from "react";
import type { Section, SectionType } from "@/features/builder/state/types";

import HeaderThumbnail from "./Header/Thumbnail";
import { createHeader } from "./Header/defaults";

import HeroThumbnail from "./Hero/Thumbnail";
import { createHero } from "./Hero/defaults";

import FeaturesThumbnail from "./Features/Thumbnail";
import { createFeatures } from "./Features/defaults";

import CTAThumbnail from "./CTA/Thumbnail";
import { createCTA } from "./CTA/defaults";

import FooterThumbnail from "./Footer/Thumbnail";
import { createFooter } from "./Footer/defaults";

// =============================================================================
// SECTION REGISTRY
//
// One row per preset section type. Adding a new section type = add one row.
// The Sidebar reads this list to build the library tiles; addSection() reads
// `createDefault()` to produce a fresh section when the user clicks a tile.
//
// `layout` is intentionally NOT in here — it's the container type added in
// Phase 10 with its own UX.
// =============================================================================

export type SectionPresetMeta = {
  type: Exclude<SectionType, "layout">;
  /** Plain-language name shown under the thumbnail tile. */
  label: string;
  /** Short hint shown on hover (helps non-tech users pick the right one). */
  description: string;
  /** Tiny visual rendered inside the sidebar tile. */
  Thumbnail: ComponentType;
  /** Builds a fresh section instance with a new ID + starter content. */
  createDefault: () => Section;
};

export const SECTION_PRESETS: SectionPresetMeta[] = [
  {
    type: "header",
    label: "Header",
    description:
      "Top navigation with your logo, links, and a call-to-action button.",
    Thumbnail: HeaderThumbnail,
    createDefault: createHeader,
  },
  {
    type: "hero",
    label: "Hero",
    description:
      "Big banner at the top of your page — headline, subtitle, image, and buttons.",
    Thumbnail: HeroThumbnail,
    createDefault: createHero,
  },
  {
    type: "features",
    label: "Features",
    description:
      "Grid of value props with icons, titles, and descriptions. Great for 'why us' sections.",
    Thumbnail: FeaturesThumbnail,
    createDefault: createFeatures,
  },
  {
    type: "cta",
    label: "Call to action",
    description: "Banner with a heading and a single big button. Drives clicks.",
    Thumbnail: CTAThumbnail,
    createDefault: createCTA,
  },
  {
    type: "footer",
    label: "Footer",
    description: "Bottom of the page — brand, link columns, socials, copyright.",
    Thumbnail: FooterThumbnail,
    createDefault: createFooter,
  },
];
